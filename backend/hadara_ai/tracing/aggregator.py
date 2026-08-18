from __future__ import annotations

import logging
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate

from hadara_ai.models.trace import AIExecution, CostLog, ToolExecution, UsageLog

logger = logging.getLogger(__name__)


class CostCalculator:
    """Calcule les coûts agrégés par différentes dimensions."""

    def total_cost(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
        agent_slug: str = "",
        provider: str = "",
        model: str = "",
        brief_id: str = "",
        client_id: str = "",
    ) -> Decimal:
        """Coût total filtré par dimensions."""
        qs = CostLog.objects.all()

        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)
        if agent_slug:
            qs = qs.filter(agent_slug=agent_slug)
        if provider:
            qs = qs.filter(provider=provider)
        if model:
            qs = qs.filter(model=model)
        if brief_id:
            qs = qs.filter(brief_id=brief_id)
        if client_id:
            qs = qs.filter(client_id=client_id)

        result = qs.aggregate(total=Sum("cost_usd"))
        return result["total"] or Decimal("0")

    def cost_by_model(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict[str, Any]]:
        """Coût agrégé par modèle."""
        qs = CostLog.objects.all()
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)

        return list(
            qs.values("provider", "model")
            .annotate(
                total_cost=Sum("cost_usd"),
                total_calls=Count("id"),
                total_input_tokens=Sum("input_tokens"),
                total_output_tokens=Sum("output_tokens"),
            )
            .order_by("-total_cost")
        )

    def cost_by_agent(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict[str, Any]]:
        """Coût agrégé par agent."""
        qs = CostLog.objects.exclude(agent_slug="")
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)

        return list(
            qs.values("agent_slug")
            .annotate(
                total_cost=Sum("cost_usd"),
                total_calls=Count("id"),
                total_input_tokens=Sum("input_tokens"),
                total_output_tokens=Sum("output_tokens"),
            )
            .order_by("-total_cost")
        )

    def cost_by_brief(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict[str, Any]]:
        """Coût agrégé par brief."""
        qs = CostLog.objects.exclude(brief_id="")
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)

        return list(
            qs.values("brief_id")
            .annotate(
                total_cost=Sum("cost_usd"),
                total_calls=Count("id"),
            )
            .order_by("-total_cost")
        )

    def cost_by_client(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict[str, Any]]:
        """Coût agrégé par client."""
        qs = CostLog.objects.exclude(client_id="")
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)

        return list(
            qs.values("client_id")
            .annotate(
                total_cost=Sum("cost_usd"),
                total_calls=Count("id"),
            )
            .order_by("-total_cost")
        )


class UsageAggregator:
    """Agrège les statistiques d'utilisation quotidiennes."""

    def aggregate_daily(self, target_date: date | None = None) -> list[UsageLog]:
        """Agrège les stats pour une journée donnée."""
        if target_date is None:
            target_date = date.today()

        # Supprimer l'agrégat existant pour cette date
        UsageLog.objects.filter(date=target_date).delete()

        # Agréger depuis AIExecution
        from django.db.models import F
        executions = AIExecution.objects.filter(
            created_at__date=target_date
        )

        if not executions.exists():
            return []

        # Grouper par agent/provider/model
        from django.db.models import Avg, Count, Sum
        aggregated = (
            executions.annotate(
                agent_slug=F("agent__slug"),
            )
            .values("agent_slug", "provider", "model")
            .annotate(
                total_input_tokens=Sum("input_tokens"),
                total_output_tokens=Sum("output_tokens"),
                total_cost_usd=Sum("cost_usd"),
                total_calls=Count("id"),
                total_errors=Count("id", filter=executions.filter(status="error").query.where),
                avg_duration_ms=Avg("duration_ms"),
            )
        )

        logs = []
        for agg in aggregated:
            tool_count = ToolExecution.objects.filter(
                trace_id__in=executions.filter(
                    agent__slug=agg["agent_slug"],
                    provider=agg["provider"],
                    model=agg["model"],
                ).values_list("trace_id", flat=True)
            ).count()

            log = UsageLog.objects.create(
                date=target_date,
                agent_slug=agg["agent_slug"] or "",
                provider=agg["provider"],
                model=agg["model"],
                total_input_tokens=agg["total_input_tokens"] or 0,
                total_output_tokens=agg["total_output_tokens"] or 0,
                total_cost_usd=agg["total_cost_usd"] or 0,
                total_calls=agg["total_calls"],
                total_errors=agg["total_errors"],
                total_tool_calls=tool_count,
                avg_duration_ms=int(agg["avg_duration_ms"] or 0),
            )
            logs.append(log)

        return logs

    def get_usage_summary(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict[str, Any]:
        """Résumé d'utilisation sur une période."""
        qs = UsageLog.objects.all()
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)

        stats = qs.aggregate(
            total_input_tokens=Sum("total_input_tokens"),
            total_output_tokens=Sum("total_output_tokens"),
            total_cost_usd=Sum("total_cost_usd"),
            total_calls=Sum("total_calls"),
            total_errors=Sum("total_errors"),
            total_tool_calls=Sum("total_tool_calls"),
            avg_duration=Avg("avg_duration_ms"),
        )

        return {
            "total_input_tokens": stats["total_input_tokens"] or 0,
            "total_output_tokens": stats["total_output_tokens"] or 0,
            "total_cost_usd": float(stats["total_cost_usd"] or 0),
            "total_ai_calls": stats["total_calls"] or 0,
            "total_errors": stats["total_errors"] or 0,
            "total_tool_calls": stats["total_tool_calls"] or 0,
            "avg_duration_ms": int(stats["avg_duration"] or 0),
        }
