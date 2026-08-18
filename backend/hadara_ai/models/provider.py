from django.db import models


class AIProvider(models.Model):
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name

    class Meta:
        ordering = ['-priority']
        verbose_name = "Provider IA"
        verbose_name_plural = "Providers IA"


class AIProviderConfig(models.Model):
    provider = models.ForeignKey(
        AIProvider, on_delete=models.CASCADE, related_name='configs'
    )
    model_id = models.CharField(max_length=100)
    display_name = models.CharField(max_length=100)
    capabilities = models.JSONField(default=list, blank=True)
    cost_per_input_token = models.DecimalField(
        max_digits=10, decimal_places=6, default=0
    )
    cost_per_output_token = models.DecimalField(
        max_digits=10, decimal_places=6, default=0
    )
    max_tokens = models.IntegerField(default=4096)
    is_active = models.BooleanField(default=True)
    supports_json_mode = models.BooleanField(default=False)
    supports_tool_calling = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.provider.name}/{self.model_id}"

    class Meta:
        unique_together = ['provider', 'model_id']
        verbose_name = "Configuration de Provider"
        verbose_name_plural = "Configurations de Providers"
