from django.db import models


class AgentDefinition(models.Model):
    """Définition d'un agent Hadara AI.

    L'agent référence un PromptVersion (pas de system_prompt direct)
    et un modèle via AIProviderConfig (FK).
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    # Prompt : référence PromptEngine, pas de copie
    prompt_template = models.ForeignKey(
        'hadara_ai.PromptTemplate',
        on_delete=models.PROTECT,
        related_name='agents',
        verbose_name="Template de prompt",
    )
    prompt_version = models.ForeignKey(
        'hadara_ai.PromptVersion',
        on_delete=models.PROTECT,
        related_name='agents',
        null=True,
        blank=True,
        verbose_name="Version de prompt (vide = version active)",
    )

    # Modèle : référence AIProviderConfig
    model_primary = models.ForeignKey(
        'AIProviderConfig',
        on_delete=models.PROTECT,
        related_name='agents_primary',
        verbose_name="Modèle principal",
    )
    model_fallback_1 = models.ForeignKey(
        'AIProviderConfig',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agents_fallback1',
        verbose_name="Modèle fallback 1",
    )
    model_fallback_2 = models.ForeignKey(
        'AIProviderConfig',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agents_fallback2',
        verbose_name="Modèle fallback 2",
    )

    # Outils autorisés (liste de noms de tools)
    tools_allowed = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Outils autorisés",
    )

    # Limites
    max_iterations = models.IntegerField(default=10)
    max_tool_calls = models.IntegerField(default=20)
    max_execution_time_s = models.IntegerField(default=120)
    max_cost_usd = models.DecimalField(
        max_digits=10, decimal_places=4, default=0.50
    )

    # Policies
    temperature = models.FloatField(default=0.2)
    require_confirmation = models.BooleanField(
        default=False,
        verbose_name="Exiger confirmation avant exécution",
    )

    # État
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "✓" if self.is_active else "○"
        return f"{self.name} [{status}]"

    class Meta:
        ordering = ['name']
        verbose_name = "Agent"
        verbose_name_plural = "Agents"
