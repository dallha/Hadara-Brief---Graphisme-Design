"""
Seed AI providers for chatbot and analysis.

Le chatbot et les agents IA nécessitent des providers configurés
dans la base de données. Cette migration crée les providers par défaut.

GROQ_API_KEY doit être défini dans l'environnement pour que le
chatbot fonctionne en production.
"""

from django.db import migrations


PROVIDERS = [
    {
        "name": "groq",
        "display_name": "Groq (Llama)",
        "is_active": True,
        "priority": 10,
        "configs": [
            {
                "model_id": "llama-3.1-8b-instant",
                "display_name": "Llama 3.1 8B Instant",
                "capabilities": ["chat", "json_mode"],
                "max_tokens": 8192,
                "supports_json_mode": True,
                "supports_tool_calling": False,
            },
        ],
    },
    {
        "name": "gemini",
        "display_name": "Google Gemini",
        "is_active": False,
        "priority": 5,
        "configs": [
            {
                "model_id": "gemini-2.5-flash",
                "display_name": "Gemini 2.5 Flash",
                "capabilities": ["chat", "json_mode", "vision"],
                "max_tokens": 8192,
                "supports_json_mode": True,
                "supports_tool_calling": False,
            },
        ],
    },
]


def seed_providers(apps, schema_editor):
    AIProvider = apps.get_model("hadara_ai", "AIProvider")
    AIProviderConfig = apps.get_model("hadara_ai", "AIProviderConfig")

    for provider_data in PROVIDERS:
        configs_data = provider_data.pop("configs")
        provider, _ = AIProvider.objects.get_or_create(
            name=provider_data["name"],
            defaults=provider_data,
        )
        for config_data in configs_data:
            AIProviderConfig.objects.get_or_create(
                provider=provider,
                model_id=config_data["model_id"],
                defaults=config_data,
            )


def reverse_seed(apps, schema_editor):
    AIProvider = apps.get_model("hadara_ai", "AIProvider")
    AIProvider.objects.filter(name__in=["groq", "gemini"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("hadara_ai", "0008_aiagentusagelog_aidailyaggregate"),
    ]

    operations = [
        migrations.RunPython(seed_providers, reverse_seed),
    ]
