"""Analytics Service — Agrège les données IA pour le dashboard ROI."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone

from hadara_ai.models import (
    AIAgentUsageLog,
    AIDailyAggregate,
    AIWorkflowExecution,
    BriefAIAnalysis,
)


class AnalyticsService:
    """Service d'agrégation analytics pour le dashboard Hadara AI."""

    def get_dashboard(self, days: int = 30) -> dict[str, Any]:
        since = timezone.now() - timedelta(days=days)

        logs = AIAgentUsageLog.objects.filter(created_at__gte=since)
        workflows = AIWorkflowExecution.objects.filter(created_at__gte=since)

        total_cost = logs.aggregate(total=Sum("cost_usd"))["total"] or 0
        total_tokens = logs.aggregate(total=Sum("input_tokens") + Sum("output_tokens"))["total"] or 0

        total_workflows = workflows.count()
        completed = workflows.filter(status="completed").count()
        failed = workflows.filter(status="failed").count()
        partial = workflows.filter(status="partial").count()

        briefs_analyzed = logs.filter(agent="brief_analyst").values("brief_id").distinct().count()
        briefs_accepted = logs.filter(agent="brief_analyst", brief_accepted=True).values("brief_id").distinct().count()
        revenue = logs.filter(brief_accepted=True).aggregate(total=Sum("quoted_price_fcfa"))["total"] or 0

        avg_duration = workflows.filter(status="completed").aggregate(avg=Avg("total_duration_ms"))["avg"] or 0

        return {
            "period_days": days,
            "total_cost_usd": round(float(total_cost), 6),
            "total_tokens": total_tokens,
            "total_workflows": total_workflows,
            "completed_workflows": completed,
            "failed_workflows": failed,
            "partial_workflows": partial,
            "success_rate": round(completed / total_workflows * 100, 1) if total_workflows > 0 else 0,
            "avg_duration_ms": int(avg_duration),
            "briefs_analyzed": briefs_analyzed,
            "briefs_accepted": briefs_accepted,
            "acceptance_rate": round(briefs_accepted / briefs_analyzed * 100, 1) if briefs_analyzed > 0 else 0,
            "revenue_attributed_fcfa": float(revenue),
            "cost_per_brief": round(float(total_cost) / briefs_analyzed, 6) if briefs_analyzed > 0 else 0,
            "roi_ratio": round(float(revenue) / float(total_cost) / 580, 1) if total_cost > 0 else 0,
        }

    def get_agent_breakdown(self, days: int = 30) -> list[dict[str, Any]]:
        since = timezone.now() - timedelta(days=days)
        logs = AIAgentUsageLog.objects.filter(created_at__gte=since)

        agents = ["brief_analyst", "pricing_agent", "creative_assistant", "communication_agent"]
        agent_labels = {
            "brief_analyst": "Brief Analyst",
            "pricing_agent": "Pricing Agent",
            "creative_assistant": "Creative Assistant",
            "communication_agent": "Communication Agent",
        }

        result = []
        for agent in agents:
            agent_logs = logs.filter(agent=agent)
            count = agent_logs.count()
            cost = agent_logs.aggregate(total=Sum("cost_usd"))["total"] or 0
            tokens = agent_logs.aggregate(
                total=Sum("input_tokens") + Sum("output_tokens")
            )["total"] or 0
            avg_dur = agent_logs.aggregate(avg=Avg("duration_ms"))["avg"] or 0

            result.append({
                "agent": agent,
                "label": agent_labels.get(agent, agent),
                "total_calls": count,
                "total_cost_usd": round(float(cost), 6),
                "total_tokens": tokens,
                "avg_duration_ms": int(avg_dur),
                "cost_per_call": round(float(cost) / count, 6) if count > 0 else 0,
            })

        return result

    def get_daily_trend(self, days: int = 30) -> list[dict[str, Any]]:
        since = timezone.now() - timedelta(days=days)
        logs = AIAgentUsageLog.objects.filter(created_at__gte=since)

        daily = {}
        for log in logs:
            d = log.created_at.date().isoformat()
            if d not in daily:
                daily[d] = {"date": d, "cost_usd": 0, "tokens": 0, "calls": 0}
            daily[d]["cost_usd"] += float(log.cost_usd)
            daily[d]["tokens"] += log.input_tokens + log.output_tokens
            daily[d]["calls"] += 1

        return sorted(daily.values(), key=lambda x: x["date"])

    def get_model_breakdown(self, days: int = 30) -> list[dict[str, Any]]:
        since = timezone.now() - timedelta(days=days)
        logs = AIAgentUsageLog.objects.filter(created_at__gte=since)

        models = {}
        for log in logs:
            m = log.model or "unknown"
            if m not in models:
                models[m] = {"model": m, "calls": 0, "cost_usd": 0, "tokens": 0}
            models[m]["calls"] += 1
            models[m]["cost_usd"] += float(log.cost_usd)
            models[m]["tokens"] += log.input_tokens + log.output_tokens

        return sorted(models.values(), key=lambda x: -x["calls"])

    def record_agent_usage(
        self,
        brief_id: str,
        agent: str,
        model: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cost_usd: float = 0,
        duration_ms: int = 0,
        status: str = "completed",
        client_name: str = "",
        brief_accepted: bool = False,
        quoted_price_fcfa: float = 0,
    ) -> None:
        AIAgentUsageLog.objects.create(
            brief_id=brief_id,
            agent=agent,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
            status=status,
            client_name=client_name,
            brief_accepted=brief_accepted,
            quoted_price_fcfa=quoted_price_fcfa,
        )
