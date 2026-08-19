"""Analytics models — ROI, coûts, et performance des agents IA."""

from __future__ import annotations

import uuid

from django.db import models


class AIAgentUsageLog(models.Model):
    """Log agrégé d'utilisation d'un agent par brief."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    brief_id = models.CharField(max_length=100, db_index=True)
    client_name = models.CharField(max_length=200, blank=True, default="")
    agent = models.CharField(max_length=50, db_index=True)
    model = models.CharField(max_length=100, default="")
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    duration_ms = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default="completed")
    brief_status = models.CharField(max_length=20, blank=True, default="")
    brief_accepted = models.BooleanField(default=False)
    quoted_price_fcfa = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.agent} — {self.brief_id} ({self.status})"


class AIDailyAggregate(models.Model):
    """Agrégats journaliers pour dashboard analytics."""

    date = models.DateField(unique=True, db_index=True)
    total_workflows = models.IntegerField(default=0)
    completed_workflows = models.IntegerField(default=0)
    failed_workflows = models.IntegerField(default=0)
    partial_workflows = models.IntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    total_tokens = models.IntegerField(default=0)
    avg_duration_ms = models.IntegerField(default=0)
    briefs_analyzed = models.IntegerField(default=0)
    briefs_accepted = models.IntegerField(default=0)
    revenue_attributed_fcfa = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"Aggregate {self.date}"

    @property
    def acceptance_rate(self) -> float:
        if self.briefs_analyzed == 0:
            return 0.0
        return round(self.briefs_accepted / self.briefs_analyzed * 100, 1)

    def to_dict(self) -> dict:
        return {
            "date": self.date.isoformat(),
            "total_workflows": self.total_workflows,
            "completed_workflows": self.completed_workflows,
            "failed_workflows": self.failed_workflows,
            "partial_workflows": self.partial_workflows,
            "total_cost_usd": float(self.total_cost_usd),
            "total_tokens": self.total_tokens,
            "avg_duration_ms": self.avg_duration_ms,
            "briefs_analyzed": self.briefs_analyzed,
            "briefs_accepted": self.briefs_accepted,
            "acceptance_rate": self.acceptance_rate,
            "revenue_attributed_fcfa": float(self.revenue_attributed_fcfa),
        }
