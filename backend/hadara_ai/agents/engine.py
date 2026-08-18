from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from typing import Any

from hadara_ai.agents.routing import ModelRouter, ModelRouterError
from hadara_ai.providers.base import AIResponse
from hadara_ai.providers.registry import ProviderRegistry
from hadara_ai.tools.context import ToolContext, ToolPermission, ToolResult, ToolRole
from hadara_ai.tools.registry import ToolRegistry

logger = logging.getLogger(__name__)


class AgentError(Exception):
    pass


@dataclass
class AgentStep:
    """Un step dans l'exécution de l'agent."""
    iteration: int
    action: str  # "ai_call" | "tool_call" | "final_response" | "error"
    content: str = ""
    tool_name: str = ""
    tool_arguments: dict = field(default_factory=dict)
    tool_result: ToolResult | None = None
    model: str = ""
    provider: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    duration_ms: int = 0


@dataclass
class AgentResult:
    """Résultat final de l'exécution d'un agent."""
    success: bool
    content: str = ""
    steps: list[AgentStep] = field(default_factory=list)
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_cost_usd: float = 0.0
    total_duration_ms: int = 0
    iterations: int = 0
    tool_calls: int = 0
    error: str = ""
    model_used: str = ""
    stopped_reason: str = ""  # "completed" | "max_iterations" | "max_tool_calls" | "timeout" | "max_cost" | "error"

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "content": self.content,
            "iterations": self.iterations,
            "tool_calls": self.tool_calls,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_cost_usd": self.total_cost_usd,
            "total_duration_ms": self.total_duration_ms,
            "model_used": self.model_used,
            "stopped_reason": self.stopped_reason,
            "error": self.error,
            "steps": [
                {
                    "iteration": s.iteration,
                    "action": s.action,
                    "tool_name": s.tool_name,
                    "model": s.model,
                    "input_tokens": s.input_tokens,
                    "output_tokens": s.output_tokens,
                    "cost_usd": s.cost_usd,
                }
                for s in self.steps
            ],
        }


class AgentEngine:
    """Moteur d'exécution des agents Hadara AI.

    Boucle : AI call → tool call → tool result → AI call → ... → final response
    avec garde-fous obligatoires.
    """

    def __init__(
        self,
        tool_registry: ToolRegistry | None = None,
        model_router: ModelRouter | None = None,
        prompt_engine: Any = None,
    ):
        self._tool_registry = tool_registry or ToolRegistry()
        self._model_router = model_router or ModelRouter()
        self._prompt_engine = prompt_engine

    def execute(
        self,
        agent,
        user_message: str,
        context: ToolContext,
        available_tools: dict[str, Any] | None = None,
    ) -> AgentResult:
        """Exécute un agent avec l'ensemble de ses garde-fous.

        Args:
            agent: AgentDefinition instance
            user_message: Message de l'utilisateur
            context: ToolContext (user_id, role, trace_id)
            available_tools: Dict optionnel de tools (si None, utilise le tool_registry)
        """
        start = time.monotonic()
        result = AgentResult(success=False)

        # 1. Vérifier que l'agent est actif
        if not agent.is_active:
            result.error = f"Agent désactivé: {agent.slug}"
            result.stopped_reason = "error"
            return result

        # 2. Résoudre le modèle
        try:
            provider, model_id = self._model_router.resolve(
                agent.model_primary,
                agent.model_fallback_1,
                agent.model_fallback_2,
            )
            result.model_used = model_id
        except ModelRouterError as e:
            result.error = str(e)
            result.stopped_reason = "error"
            return result

        # 3. Rendre le prompt
        try:
            prompt_data = self._render_prompt(agent, user_message)
        except Exception as e:
            result.error = f"Erreur prompt: {str(e)}"
            result.stopped_reason = "error"
            return result

        # 4. Boucle principale
        messages = [
            {"role": "system", "content": prompt_data["system"]},
            {"role": "user", "content": prompt_data["user"]},
        ]

        iterations = 0
        tool_calls_count = 0
        total_input = 0
        total_output = 0
        total_cost = 0.0

        while iterations < agent.max_iterations:
            iterations += 1

            # Vérifier les limites
            elapsed = time.monotonic() - start
            if elapsed > agent.max_execution_time_s:
                result.stopped_reason = "timeout"
                result.error = f"Timeout après {int(elapsed)}s"
                break

            if tool_calls_count >= agent.max_tool_calls:
                result.stopped_reason = "max_tool_calls"
                result.error = f"Limite de tool calls atteinte: {agent.max_tool_calls}"
                break

            if total_cost > float(agent.max_cost_usd):
                result.stopped_reason = "max_cost"
                result.error = f"Limite de coût atteinte: ${total_cost:.4f}"
                break

            # AI call
            try:
                ai_response = provider.chat_json(
                    messages,
                    temperature=agent.temperature,
                )
            except Exception as e:
                step = AgentStep(
                    iteration=iterations,
                    action="error",
                    content=str(e),
                    model=model_id,
                )
                result.steps.append(step)
                result.stopped_reason = "error"
                result.error = f"Erreur AI: {str(e)}"
                break

            total_input += ai_response.input_tokens
            total_output += ai_response.output_tokens
            total_cost += ai_response.cost_usd

            # Parser la réponse
            try:
                parsed = json.loads(ai_response.content)
            except json.JSONDecodeError:
                step = AgentStep(
                    iteration=iterations,
                    action="ai_call",
                    content=ai_response.content,
                    model=model_id,
                    provider=ai_response.provider,
                    input_tokens=ai_response.input_tokens,
                    output_tokens=ai_response.output_tokens,
                    cost_usd=ai_response.cost_usd,
                    duration_ms=ai_response.duration_ms,
                )
                result.steps.append(step)
                result.stopped_reason = "error"
                result.error = "Réponse IA non-JSON valide"
                break

            action = parsed.get("action", "")

            if action == "final_response":
                step = AgentStep(
                    iteration=iterations,
                    action="final_response",
                    content=parsed.get("content", ""),
                    model=model_id,
                    provider=ai_response.provider,
                    input_tokens=ai_response.input_tokens,
                    output_tokens=ai_response.output_tokens,
                    cost_usd=ai_response.cost_usd,
                    duration_ms=ai_response.duration_ms,
                )
                result.steps.append(step)
                result.content = parsed.get("content", "")
                result.success = True
                result.stopped_reason = "completed"
                break

            elif action == "tool_call":
                tool_name = parsed.get("tool", "")
                tool_args = parsed.get("arguments", {})

                # Vérifier que l'outil est autorisé
                if tool_name not in agent.tools_allowed:
                    tool_result = ToolResult(
                        success=False,
                        error=f"Outil non autorisé: {tool_name}",
                        tool_name=tool_name,
                    )
                else:
                    tool_result = self._tool_registry.execute(
                        tool_name, tool_args, context
                    )

                tool_calls_count += 1

                step = AgentStep(
                    iteration=iterations,
                    action="tool_call",
                    tool_name=tool_name,
                    tool_arguments=tool_args,
                    tool_result=tool_result,
                    model=model_id,
                    provider=ai_response.provider,
                    input_tokens=ai_response.input_tokens,
                    output_tokens=ai_response.output_tokens,
                    cost_usd=ai_response.cost_usd,
                    duration_ms=ai_response.duration_ms,
                )
                result.steps.append(step)

                # Ajouter le résultat au contexte conversationnel
                tool_result_data = {
                    "tool": tool_name,
                    "success": tool_result.success,
                    "data": tool_result.data if tool_result.success else None,
                    "error": tool_result.error if not tool_result.success else None,
                }
                messages.append({
                    "role": "assistant",
                    "content": json.dumps(parsed, ensure_ascii=False),
                })
                messages.append({
                    "role": "user",
                    "content": f"Résultat de l'outil {tool_name}:\n{json.dumps(tool_result_data, ensure_ascii=False, default=str)}",
                })

            else:
                # Action inconnue — traiter comme final_response
                step = AgentStep(
                    iteration=iterations,
                    action="final_response",
                    content=ai_response.content,
                    model=model_id,
                )
                result.steps.append(step)
                result.content = ai_response.content
                result.success = True
                result.stopped_reason = "completed"
                break

        else:
            result.stopped_reason = "max_iterations"
            result.error = f"Limite d'itérations atteinte: {agent.max_iterations}"

        # Finaliser
        elapsed_ms = int((time.monotonic() - start) * 1000)
        result.total_input_tokens = total_input
        result.total_output_tokens = total_output
        result.total_cost_usd = total_cost
        result.total_duration_ms = elapsed_ms
        result.iterations = iterations
        result.tool_calls = tool_calls_count

        return result

    def _render_prompt(self, agent, user_message: str) -> dict[str, str]:
        """Rend le prompt via PromptEngine."""
        if self._prompt_engine:
            version_number = (
                agent.prompt_version.version if agent.prompt_version else None
            )
            return self._prompt_engine.render(
                agent.prompt_template.slug,
                {"user_message": user_message},
                version_number=version_number,
            )

        # Fallback : prompt minimal
        return {
            "system": f"Tu es {agent.name}. {agent.description}",
            "user": user_message,
        }
