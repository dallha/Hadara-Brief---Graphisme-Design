"""Workflow Orchestrator — Enchaîne tous les agents IA Hadara.

Flux: Brief Analyst → Pricing Agent → Creative Assistant → Communication Agent
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class StepName(str, Enum):
    ANALYST = "analyst"
    PRICING = "pricing"
    CREATIVE = "creative"
    COMMUNICATION = "communication"


@dataclass
class StepResult:
    name: str
    status: StepStatus = StepStatus.PENDING
    data: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    duration_ms: int = 0


@dataclass
class WorkflowResult:
    brief_id: str
    steps: list[StepResult] = field(default_factory=list)
    overall_status: str = "pending"
    total_duration_ms: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "brief_id": self.brief_id,
            "overall_status": self.overall_status,
            "total_duration_ms": self.total_duration_ms,
            "steps": [
                {
                    "name": s.name,
                    "status": s.status.value,
                    "error": s.error,
                    "duration_ms": s.duration_ms,
                    "has_data": bool(s.data),
                }
                for s in self.steps
            ],
            "analyst_result": self._get_step("analyst"),
            "pricing_result": self._get_step("pricing"),
            "creative_result": self._get_step("creative"),
            "communication_result": self._get_step("communication"),
        }

    def _get_step(self, name: str) -> dict[str, Any] | None:
        for s in self.steps:
            if s.name == name and s.status == StepStatus.COMPLETED:
                return s.data
        return None


class WorkflowOrchestrator:
    """Exécute la chaîne complète d'agents IA pour un brief."""

    def __init__(self):
        self._steps: list[tuple[str, Any]] = [
            (StepName.ANALYST, self._run_analyst),
            (StepName.PRICING, self._run_pricing),
            (StepName.CREATIVE, self._run_creative),
            (StepName.COMMUNICATION, self._run_communication),
        ]

    def run(self, brief_id: str, skip_communication: bool = False) -> WorkflowResult:
        result = WorkflowResult(brief_id=brief_id)
        result.overall_status = "running"
        start = time.monotonic()

        for name, fn in self._steps:
            if skip_communication and name == StepName.COMMUNICATION:
                result.steps.append(StepResult(name=name, status=StepStatus.SKIPPED))
                continue

            step = StepResult(name=name, status=StepStatus.RUNNING)
            result.steps.append(step)
            step_start = time.monotonic()

            try:
                context = self._build_context(result)
                step.data = fn(brief_id, context)
                step.status = StepStatus.COMPLETED
                logger.info("Step %s completed for brief %s", name, brief_id)
            except Exception as e:
                step.status = StepStatus.FAILED
                step.error = str(e)
                logger.error("Step %s failed for brief %s: %s", name, brief_id, e)

            step.duration_ms = int((time.monotonic() - step_start) * 1000)

        result.total_duration_ms = int((time.monotonic() - start) * 1000)
        failed = [s for s in result.steps if s.status == StepStatus.FAILED]
        result.overall_status = "failed" if failed else "completed"
        return result

    def _build_context(self, result: WorkflowResult) -> dict[str, Any]:
        ctx: dict[str, Any] = {}
        for s in result.steps:
            if s.status == StepStatus.COMPLETED and s.data:
                ctx[s.name] = s.data
        return ctx

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
