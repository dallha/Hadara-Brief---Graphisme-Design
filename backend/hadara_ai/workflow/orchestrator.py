"""Workflow Orchestrator — Enchaîne les agents IA avec persistance et retry.

Flux: Brief Analyst → Pricing Agent → Creative Assistant → Communication Agent
"""

from __future__ import annotations

import logging
import time
from typing import Any

from django.utils import timezone

logger = logging.getLogger(__name__)

STEP_ORDER = ["analyst", "pricing", "creative", "communication"]


class WorkflowOrchestrator:
    """Exécute la chaîne complète d'agents IA pour un brief avec persistance."""

    def __init__(self):
        self._runners = {
            "analyst": self._run_analyst,
            "pricing": self._run_pricing,
            "creative": self._run_creative,
            "communication": self._run_communication,
        }

    def run(self, brief_id: str, skip_communication: bool = False) -> dict[str, Any]:
        from hadara_ai.models import AIWorkflowExecution, AIWorkflowStepExecution

        wf = AIWorkflowExecution.objects.create(
            brief_id=str(brief_id),
            workflow_name="full_pipeline",
            status="running",
            started_at=timezone.now(),
        )

        context: dict[str, Any] = {}
        steps_to_run = [s for s in STEP_ORDER if not (skip_communication and s == "communication")]

        for idx, step_name in enumerate(steps_to_run):
            step_exec = AIWorkflowStepExecution.objects.create(
                workflow=wf,
                step_name=step_name,
                step_order=idx,
                status="running",
                started_at=timezone.now(),
            )

            wf.current_step = step_name
            wf.save(update_fields=["current_step"])

            step_start = time.monotonic()
            success = False
            last_error = ""

            for attempt in range(wf.max_retries + 1):
                try:
                    result = self._runners[step_name](brief_id, context)
                    context[step_name] = result
                    step_exec.result_data = result
                    step_exec.status = "completed"
                    step_exec.model = result.get("_model", "llama-3.1-8b-instant")
                    success = True
                    break
                except Exception as e:
                    last_error = str(e)
                    step_exec.error_message = last_error
                    step_exec.status = "retrying" if attempt < wf.max_retries else "failed"
                    logger.warning("Step %s attempt %d failed: %s", step_name, attempt + 1, e)

            step_exec.duration_ms = int((time.monotonic() - step_start) * 1000)
            step_exec.completed_at = timezone.now()
            step_exec.save()

            if success:
                cost = self._extract_cost(context.get(step_name))
                step_exec.cost_usd = cost
                wf.total_cost_usd += cost
                step_exec.input_tokens = context.get(step_name, {}).get("_input_tokens", 0)
                step_exec.output_tokens = context.get(step_name, {}).get("_output_tokens", 0)
                step_exec.save(update_fields=["cost_usd", "input_tokens", "output_tokens"])
            else:
                wf.error_message = f"{step_name}: {last_error}"
                wf.retry_count = max(wf.retry_count, wf.max_retries)

        wf.total_duration_ms = int((time.time() - wf.started_at.timestamp()) * 1000) if wf.started_at else 0
        wf.completed_at = timezone.now()

        failed_steps = [s for s in wf.steps.filter(status="failed")]
        if failed_steps and not context:
            wf.status = "failed"
        elif failed_steps:
            wf.status = "partial"
        else:
            wf.status = "completed"

        wf.save()

        return self._build_result(wf, context)

    def _extract_cost(self, data: dict | None) -> float:
        if not data:
            return 0
        return data.get("_cost_usd", 0)

    def _build_result(self, wf, context: dict) -> dict[str, Any]:
        from hadara_ai.models import AIWorkflowStepExecution

        steps = AIWorkflowStepExecution.objects.filter(workflow=wf).order_by("step_order")

        return {
            "id": str(wf.id),
            "brief_id": wf.brief_id,
            "overall_status": wf.status,
            "total_duration_ms": wf.total_duration_ms,
            "total_cost_usd": float(wf.total_cost_usd),
            "current_step": wf.current_step,
            "retry_count": wf.retry_count,
            "error_message": wf.error_message,
            "created_at": wf.created_at.isoformat() if wf.created_at else None,
            "started_at": wf.started_at.isoformat() if wf.started_at else None,
            "completed_at": wf.completed_at.isoformat() if wf.completed_at else None,
            "steps": [s.to_dict() for s in steps],
            "analyst_result": context.get("analyst"),
            "pricing_result": context.get("pricing"),
            "creative_result": context.get("creative"),
            "communication_result": context.get("communication"),
        }

    def _run_analyst(self, brief_id: str, ctx: dict) -> dict:
        from hadara_ai.agents.brief_analyst_service import BriefAnalystService
        return BriefAnalystService().analyze(brief_id)

    def _run_pricing(self, brief_id: str, ctx: dict) -> dict:
        from hadara_ai.agents.pricing_agent_service import PricingAgentService
        return PricingAgentService().analyze(brief_id)

    def _run_creative(self, brief_id: str, ctx: dict) -> dict:
        from hadara_ai.agents.creative_assistant_service import CreativeAssistantService
        return CreativeAssistantService().analyze(brief_id)

    def _run_communication(self, brief_id: str, ctx: dict) -> dict:
        from hadara_ai.agents.communication_agent_service import CommunicationAgentService
        return CommunicationAgentService().generate(
            brief_id,
            message_type="proposition",
            analyst_result=ctx.get("analyst"),
            pricing_result=ctx.get("pricing"),
            creative_result=ctx.get("creative"),
        )
