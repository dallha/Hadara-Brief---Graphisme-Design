from django.db import models


class PromptTemplate(models.Model):
    """Template de prompt versionné.

    Un template identifie un cas d'usage IA (ex: brief_analyzer, copywriter).
    Chaque template possède plusieurs versions, mais une seule est active
    à un instant donné.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = "Template de Prompt"
        verbose_name_plural = "Templates de Prompts"


class PromptVersion(models.Model):
    """Version d'un template de prompt.

    La source de vérité est PostgreSQL, pas des fichiers YAML.
    Les YAML ne servent qu'à l'import initial (seeds/fixtures).
    """

    template = models.ForeignKey(
        PromptTemplate, on_delete=models.CASCADE, related_name='versions'
    )
    version = models.IntegerField(default=1)
    system_prompt = models.TextField()
    user_prompt_template = models.TextField()
    input_schema = models.JSONField(default=dict, blank=True)
    output_schema = models.JSONField(default=dict, blank=True)
    model_recommended = models.CharField(max_length=100, blank=True)
    temperature = models.FloatField(default=0.2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "✓" if self.is_active else "○"
        return f"{self.template.slug} v{self.version} {status}"

    class Meta:
        unique_together = ['template', 'version']
        ordering = ['-version']
        verbose_name = "Version de Prompt"
        verbose_name_plural = "Versions de Prompts"
