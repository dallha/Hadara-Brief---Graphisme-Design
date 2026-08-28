"""
Migrate Groq model from llama-3.1-8b-instant (now Enterprise-only)
to openai/gpt-oss-20b (Free tier available).

llama-3.1-8b-instant was moved to Enterprise tier by Groq.
openai/gpt-oss-20b is available on Free tier with 30 RPM, 1K RPD.
"""

from django.db import migrations


OLD_MODEL = "llama-3.1-8b-instant"
NEW_MODEL = "openai/gpt-oss-20b"


def migrate_model(apps, schema_editor):
    AIProviderConfig = apps.get_model("hadara_ai", "AIProviderConfig")

    # Update existing config
    updated = AIProviderConfig.objects.filter(model_id=OLD_MODEL).update(
        model_id=NEW_MODEL,
        display_name="GPT-OSS 20B (Free Tier)",
        max_tokens=8192,
        supports_json_mode=True,
    )

    # Create if not exists (safety net)
    if not updated:
        from hadara_ai.models import AIProvider
        groq = AIProvider.objects.get(name="groq")
        AIProviderConfig.objects.get_or_create(
            provider=groq,
            model_id=NEW_MODEL,
            defaults={
                "display_name": "GPT-OSS 20B (Free Tier)",
                "capabilities": ["chat", "json_mode"],
                "max_tokens": 8192,
                "supports_json_mode": True,
                "supports_tool_calling": False,
            },
        )


def reverse_migration(apps, schema_editor):
    AIProviderConfig = apps.get_model("hadara_ai", "AIProviderConfig")
    AIProviderConfig.objects.filter(model_id=NEW_MODEL).update(
        model_id=OLD_MODEL,
        display_name="Llama 3.1 8B Instant",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("hadara_ai", "0009_seed_ai_providers"),
    ]

    operations = [
        migrations.RunPython(migrate_model, reverse_migration),
    ]
