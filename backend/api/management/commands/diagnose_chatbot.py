"""
Diagnostic command for chatbot runtime.

Usage:
    python manage.py diagnose_chatbot

Run on Render Shell to test the Groq connection from production environment.
Never logs API keys. Only reports existence and length.
"""

import os
import sys
import time
import logging
import requests
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Diagnose chatbot runtime: Groq connectivity, model availability, error tracing"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("=" * 60))
        self.stdout.write("CHATBOT RUNTIME DIAGNOSTIC")
        self.stdout.write("=" * 60)
        self.stdout.write("")

        # Step 1: Check GROQ_API_KEY existence (never log the value)
        self.step_check_api_key()

        # Step 2: Check AIProvider configuration in database
        self.step_check_providers()

        # Step 3: List available models from Groq API
        self.step_list_models()

        # Step 4: Test actual chat completion with openai/gpt-oss-20b
        self.step_test_chat()

        # Step 5: Test fallback path
        self.step_test_fallback()

        self.stdout.write("")
        self.stdout.write(self.style.WARNING("=" * 60))
        self.stdout.write("END OF DIAGNOSTIC")
        self.stdout.write("=" * 60)

    def step_check_api_key(self):
        self.stdout.write(self.style.HTTP_INFO("[1/5] Checking GROQ_API_KEY..."))
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            self.stdout.write(self.style.ERROR("  GROQ_API_KEY: NOT SET"))
            self.stdout.write(self.style.ERROR("  → Chatbot will always return fallback"))
        else:
            self.stdout.write(self.style.SUCCESS(f"  GROQ_API_KEY: present (length={len(api_key)})"))
            self.stdout.write(f"  First 4 chars: {api_key[:4]}...")
            self.stdout.write(f"  Last 4 chars: ...{api_key[-4:]}")
        self.stdout.write("")

    def step_check_providers(self):
        self.stdout.write(self.style.HTTP_INFO("[2/5] Checking AIProvider database..."))
        try:
            from hadara_ai.models import AIProvider, AIProviderConfig
            providers = AIProvider.objects.filter(is_active=True)
            if not providers.exists():
                self.stdout.write(self.style.ERROR("  No active AIProvider found"))
            else:
                for p in providers:
                    self.stdout.write(f"  Provider: {p.name} (active={p.is_active})")
                    for c in p.configs.filter(is_active=True):
                        self.stdout.write(f"    Model: {c.model_id} (active={c.is_active})")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  DB error: {e}"))
        self.stdout.write("")

    def step_list_models(self):
        self.stdout.write(self.style.HTTP_INFO("[3/5] Listing available Groq models..."))
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            self.stdout.write(self.style.ERROR("  Skipped: GROQ_API_KEY not set"))
            self.stdout.write("")
            return

        try:
            resp = requests.get(
                "https://api.groq.com/openai/v1/models",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                timeout=10,
            )
            self.stdout.write(f"  HTTP {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                models = [m["id"] for m in data.get("data", [])]
                self.stdout.write(f"  Available models ({len(models)}):")
                for m in sorted(models):
                    marker = " ← USED" if "llama-3.1-8b" in m else ""
                    self.stdout.write(f"    - {m}{marker}")
                if not any("gpt-oss" in m for m in models):
                    self.stdout.write(self.style.WARNING(
                        "  ⚠ openai/gpt-oss-20b NOT in available models!"
                    ))
            else:
                self.stdout.write(self.style.ERROR(f"  Error: {resp.text[:200]}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Connection error: {e}"))
        self.stdout.write("")

    def step_test_chat(self):
        self.stdout.write(self.style.HTTP_INFO("[4/5] Testing chat completion..."))
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            self.stdout.write(self.style.ERROR("  Skipped: GROQ_API_KEY not set"))
            self.stdout.write("")
            return

        payload = {
            "model": "openai/gpt-oss-20b",
            "messages": [
                {"role": "system", "content": "Tu es un assistant test. Réponds en 1 mot."},
                {"role": "user", "content": "Bonjour"},
            ],
            "temperature": 0.5,
            "max_tokens": 10,
        }

        try:
            start = time.time()
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=15,
            )
            elapsed = time.time() - start
            self.stdout.write(f"  HTTP {resp.status_code} ({elapsed:.2f}s)")

            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                self.stdout.write(self.style.SUCCESS(f"  Response: {content}"))
                self.stdout.write(self.style.SUCCESS("  ✅ Chat completion WORKS"))
            elif resp.status_code == 401:
                self.stdout.write(self.style.ERROR("  401: Invalid API key"))
            elif resp.status_code == 403:
                self.stdout.write(self.style.ERROR("  403: Authorization denied (model may be Enterprise-only)"))
            elif resp.status_code == 404:
                self.stdout.write(self.style.ERROR("  404: Model not found"))
            elif resp.status_code == 429:
                self.stdout.write(self.style.ERROR("  429: Rate limit exceeded"))
            elif resp.status_code >= 500:
                self.stdout.write(self.style.ERROR(f"  {resp.status_code}: Groq server error"))
            else:
                self.stdout.write(self.style.ERROR(f"  Error: {resp.text[:300]}"))
        except requests.exceptions.Timeout:
            self.stdout.write(self.style.ERROR("  Timeout after 15s"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Exception: {type(e).__name__}: {e}"))
        self.stdout.write("")

    def step_test_fallback(self):
        self.stdout.write(self.style.HTTP_INFO("[5/5] Testing compatibility.chat() path..."))
        try:
            from hadara_ai.services.compatibility import chat
            result = chat([{"role": "user", "content": "Test diagnostic"}])
            is_fallback = "problème" in result.lower() or "désolé" in result.lower()
            if is_fallback:
                self.stdout.write(self.style.WARNING(f"  Fallback returned: {result[:100]}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"  Real response: {result[:100]}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  Exception: {type(e).__name__}: {e}"))
        self.stdout.write("")
