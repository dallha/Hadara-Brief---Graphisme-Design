import uuid

from django.db import models


class RetentionPolicy(models.TextChoices):
    FULL = "full", "Full"
    REDACTED = "redacted", "Redacted"
    METADATA_ONLY = "metadata_only", "Metadata Only"


class ExecutionStatus(models.TextChoices):
    SUCCESS = "success", "Success"
    ERROR = "error", "Error"
    TIMEOUT = "timeout", "Timeout"
    CANCELLED = "cancelled", "Cancelled"


class AIExecution(models.Model):
    """Traçabilité centralisée de chaque appel IA.

    trace_id = identifiant commun pour reconstruire toute une exécution.
    parent_execution = lien parent/enfant pour les appels imbriqués.
    """

    # Identifiants
    trace_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    request_id = models.UUIDField(default=uuid.uuid4, db_index=True)

    # Relations
    agent = models.ForeignKey(
        'AgentDefinition',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='executions',
    )

    # Provider / Model
    provider = models.CharField(max_length=50)
    model = models.CharField(max_length=100)

    # Tokens & Coût
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)

    # Performance
    duration_ms = models.IntegerField(default=0)

    # Statut
    status = models.CharField(
        max_length=20,
        choices=ExecutionStatus.choices,
        default=ExecutionStatus.SUCCESS,
    )
    error_message = models.TextField(blank=True)

    # Rétention
    retention_policy = models.CharField(
        max_length=20,
        choices=RetentionPolicy.choices,
        default=RetentionPolicy.METADATA_ONLY,
    )
    prompt_content = models.TextField(blank=True, null=True)
    response_content = models.TextField(blank=True, null=True)

    # Imbrication
    parent_execution = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='child_executions',
    )

    # Contexte métier
    brief_id = models.CharField(max_length=50, blank=True)
    client_id = models.CharField(max_length=50, blank=True)

    # Métadonnées
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.trace_id} — {self.provider}/{self.model} — {self.status}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Exécution IA"
        verbose_name_plural = "Exécutions IA"
        indexes = [
            models.Index(fields=['trace_id', 'created_at']),
            models.Index(fields=['agent', 'created_at']),
            models.Index(fields=['provider', 'created_at']),
            models.Index(fields=['model', 'created_at']),
            models.Index(fields=['brief_id']),
        ]


class ToolExecution(models.Model):
    """Traçabilité de chaque appel d'outil."""

    # Identifiants
    trace_id = models.UUIDField(db_index=True)

    # Relation vers l'exécution IA parente
    ai_execution = models.ForeignKey(
        AIExecution,
        on_delete=models.CASCADE,
        related_name='tool_executions',
    )

    # Outil
    tool_name = models.CharField(max_length=100)
    arguments = models.JSONField(default=dict)
    result = models.JSONField(default=dict)

    # Statut
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)

    # Performance
    duration_ms = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{self.tool_name} [{status}] — {self.trace_id}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Exécution d'outil"
        verbose_name_plural = "Exécutions d'outils"
        indexes = [
            models.Index(fields=['trace_id', 'created_at']),
            models.Index(fields=['tool_name', 'created_at']),
        ]


class UsageLog(models.Model):
    """Agrégation quotidienne de l'usage par agent/provider/model."""

    date = models.DateField(db_index=True)
    agent_slug = models.CharField(max_length=100, blank=True)
    provider = models.CharField(max_length=50)
    model = models.CharField(max_length=100)

    # Agrégats
    total_input_tokens = models.IntegerField(default=0)
    total_output_tokens = models.IntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    total_calls = models.IntegerField(default=0)
    total_errors = models.IntegerField(default=0)
    total_tool_calls = models.IntegerField(default=0)
    avg_duration_ms = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.date} — {self.agent_slug} — {self.provider}/{self.model}"

    class Meta:
        ordering = ['-date']
        unique_together = ['date', 'agent_slug', 'provider', 'model']
        verbose_name = "Log d'utilisation"
        verbose_name_plural = "Logs d'utilisation"


class CostLog(models.Model):
    """Coût détaillé par exécution, pour analyses et dashboards."""

    trace_id = models.UUIDField(db_index=True)
    agent_slug = models.CharField(max_length=100, blank=True)
    provider = models.CharField(max_length=50)
    model = models.CharField(max_length=100)

    # Tokens
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0)

    # Contexte métier
    brief_id = models.CharField(max_length=50, blank=True)
    client_id = models.CharField(max_length=50, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.trace_id} — ${self.cost_usd:.6f}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Log de coût"
        verbose_name_plural = "Logs de coûts"
        indexes = [
            models.Index(fields=['agent_slug', 'created_at']),
            models.Index(fields=['brief_id']),
            models.Index(fields=['client_id']),
        ]
