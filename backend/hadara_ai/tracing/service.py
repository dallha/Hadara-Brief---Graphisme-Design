from __future__ import annotations

import logging
import uuid
from typing import Any

from hadara_ai.models.trace import (
    AIExecution,
    CostLog,
    ExecutionStatus,
    RetentionPolicy,
    ToolExecution,
    UsageLog,
)

logger = logging.getLogger(__name__)


class ExecutionTraceService:
    """Service central de traçabilité des exécutions Hadara AI.

    Chaque exécution (agent, AI call, tool call) est tracée via un trace_id commun.
    """

    def start_ai_execution(
        self,
        trace_id: uuid.UUID | None = None,
        agent=None,
        provider: str = "",
        model: str = "",
        parent_execution: AIExecution | None = None,
        brief_id: str = "",
        client_id: str = "",
        retention_policy: str = RetentionPolicy.METADATA_ONLY,
    ) -> AIExecution:
        """Crée une nouvelle exécution IA."""
        if trace_id is None:
            trace_id = uuid.uuid4()

        execution = AIExecution.objects.create(
            trace_id=trace_id,
            request_id=uuid.uuid4(),
            agent=agent,
            provider=provider,
            model=model,
            parent_execution=parent_execution,
            brief_id=brief_id,
            client_id=client_id,
            retention_policy=retention_policy,
            status=ExecutionStatus.SUCCESS,
        )
        return execution

    def complete_ai_execution(
        self,
        execution: AIExecution,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cost_usd: float = 0.0,
        duration_ms: int = 0,
        status: str = ExecutionStatus.SUCCESS,
        error_message: str = "",
        prompt_content: str | None = None,
        response_content: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AIExecution:
        """Finalise une exécution IA avec les résultats."""
        execution.input_tokens = input_tokens
        execution.output_tokens = output_tokens
        execution.cost_usd = cost_usd
        execution.duration_ms = duration_ms
        execution.status = status
        execution.error_message = error_message

        # Rétention du contenu
        if execution.retention_policy == RetentionPolicy.FULL:
            execution.prompt_content = prompt_content
            execution.response_content = response_content
        elif execution.retention_policy == RetentionPolicy.REDACTED:
            execution.prompt_content = self._redact(prompt_content or "")
            execution.response_content = self._redact(response_content or "")

        if metadata:
            execution.metadata = metadata

        execution.save()

        # Enregistrer le coût
        self._log_cost(execution)

        return execution

    def log_tool_execution(
        self,
        trace_id: uuid.UUID,
        ai_execution: AIExecution,
        tool_name: str,
        arguments: dict[str, Any],
        result: dict[str, Any],
        success: bool = True,
        error_message: str = "",
        duration_ms: int = 0,
    ) -> ToolExecution:
        """Enregistre l'exécution d'un outil."""
        tool_exec = ToolExecution.objects.create(
            trace_id=trace_id,
            ai_execution=ai_execution,
            tool_name=tool_name,
            arguments=arguments,
            result=result,
            success=success,
            error_message=error_message,
            duration_ms=duration_ms,
        )
        return tool_exec

    def get_trace(self, trace_id: uuid.UUID) -> dict[str, Any]:
        """Récupère toutes les exécutions d'un trace_id."""
        executions = AIExecution.objects.filter(trace_id=trace_id).order_by("created_at")
        tools = ToolExecution.objects.filter(trace_id=trace_id).order_by("created_at")

        return {
            "trace_id": str(trace_id),
            "executions": [
                {
                    "id": e.id,
                    "provider": e.provider,
                    "model": e.model,
                    "input_tokens": e.input_tokens,
                    "output_tokens": e.output_tokens,
                    "cost_usd": float(e.cost_usd),
                    "duration_ms": e.duration_ms,
                    "status": e.status,
                    "error_message": e.error_message,
                    "created_at": e.created_at.isoformat(),
                }
                for e in executions
            ],
            "tool_executions": [
                {
                    "id": t.id,
                    "tool_name": t.tool_name,
                    "success": t.success,
                    "duration_ms": t.duration_ms,
                    "created_at": t.created_at.isoformat(),
                }
                for t in tools
            ],
            "summary": self._compute_trace_summary(trace_id),
        }

    def _compute_trace_summary(self, trace_id: uuid.UUID) -> dict[str, Any]:
        """Calcule le résumé d'un trace_id."""
        from django.db.models import Sum, Avg, Count

        stats = AIExecution.objects.filter(trace_id=trace_id).aggregate(
            total_input_tokens=Sum("input_tokens"),
            total_output_tokens=Sum("output_tokens"),
            total_cost_usd=Sum("cost_usd"),
            total_duration_ms=Sum("duration_ms"),
            total_calls=Count("id"),
        )

        tool_count = ToolExecution.objects.filter(trace_id=trace_id).count()
        tool_errors = ToolExecution.objects.filter(
            trace_id=trace_id, success=False
        ).count()

        return {
            "total_input_tokens": stats["total_input_tokens"] or 0,
            "total_output_tokens": stats["total_output_tokens"] or 0,
            "total_cost_usd": float(stats["total_cost_usd"] or 0),
            "total_duration_ms": stats["total_duration_ms"] or 0,
            "total_ai_calls": stats["total_calls"] or 0,
            "total_tool_calls": tool_count,
            "total_tool_errors": tool_errors,
        }

    def _log_cost(self, execution: AIExecution) -> None:
        """Enregistre le coût dans CostLog."""
        if execution.cost_usd <= 0:
            return

        agent_slug = ""
        if execution.agent:
            agent_slug = execution.agent.slug

        CostLog.objects.create(
            trace_id=execution.trace_id,
            agent_slug=agent_slug,
            provider=execution.provider,
            model=execution.model,
            input_tokens=execution.input_tokens,
            output_tokens=execution.output_tokens,
            cost_usd=execution.cost_usd,
            brief_id=execution.brief_id,
            client_id=execution.client_id,
        )

    @staticmethod
    def _redact(text: str) -> str:
        """Ré-dacte le contenu sensible."""
        if not text:
            return text
        # Remplacer les noms, emails, téléphones
        import re
        text = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', '[EMAIL]', text)
        text = re.sub(r'\+?\d[\d\s-]{8,}', '[PHONE]', text)
        return text[:500] + "..." if len(text) > 500 else text
