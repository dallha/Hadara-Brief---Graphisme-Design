"""Workflow Execution models — Persistance et historique des workflows IA."""

from __future__ import annotations

import uuid

from django.db import models


class AIWorkflowExecution(models.Model):
    """Exécution d'un workflow Hadara AI pour un brief."""

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        RUNNING = "running", "En cours"
        COMPLETED = "completed", "Complété"
        FAILED = "failed", "Échoué"
        PARTIAL = "partial", "Partiellement complété"
        CANCELLED = "cancelled", "Annulé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    brief_id = models.CharField(max_length=100, db_index=True)
    workflow_name = models.CharField(max_length=100, default="full_pipeline")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    current_step = models.CharField(max_length=50, blank=True, default="")
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=2)
    total_duration_ms = models.IntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Workflow {self.workflow_name} — {self.brief_id} ({self.status})"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "brief_id": self.brief_id,
            "workflow_name": self.workflow_name,
            "status": self.status,
            "current_step": self.current_step,
            "retry_count": self.retry_count,
            "total_duration_ms": self.total_duration_ms,
            "total_cost_usd": float(self.total_cost_usd),
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class AIWorkflowStepExecution(models.Model):
    """Étape individuelle dans un workflow."""

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        RUNNING = "running", "En cours"
        COMPLETED = "completed", "Complété"
        FAILED = "failed", "Échoué"
        SKIPPED = "skipped", "Ignoré"
        RETRYING = "retrying", "Nouvel essai"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(
        AIWorkflowExecution,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    step_name = models.CharField(max_length=50)
    step_order = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    result_data = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default="")
    duration_ms = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    model = models.CharField(max_length=100, blank=True, default="")
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["step_order"]
        unique_together = [("workflow", "step_name")]

    def __str__(self) -> str:
        return f"{self.step_name} — {self.status}"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "step_name": self.step_name,
            "step_order": self.step_order,
            "status": self.status,
            "has_data": bool(self.result_data),
            "error_message": self.error_message,
            "duration_ms": self.duration_ms,
            "cost_usd": float(self.cost_usd),
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "model": self.model,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
