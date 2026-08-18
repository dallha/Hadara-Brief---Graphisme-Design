from __future__ import annotations

import json
import uuid
from unittest.mock import patch, MagicMock

from django.contrib.auth.models import User
from django.test import TestCase, Client
from django.urls import reverse

from hadara_ai.models import AgentDefinition, AIProvider, AIProviderConfig, PromptTemplate
from hadara_ai.models.trace import AIExecution, ExecutionStatus
from hadara_ai.tracing.service import ExecutionTraceService


# ─── Fixtures ────────────────────────────────────────────────────────────────


def _create_provider(name="groq", model_id="llama-3.1-8b-instant") -> AIProviderConfig:
    provider, _ = AIProvider.objects.get_or_create(
        name=name,
        defaults={"display_name": name.title(), "is_active": True, "priority": 10}
    )
    config, _ = AIProviderConfig.objects.get_or_create(
        provider=provider,
        model_id=model_id,
        defaults={"display_name": model_id, "is_active": True},
    )
    return config


def _create_agent(slug="brief_analyst", is_active=True) -> AgentDefinition:
    template, _ = PromptTemplate.objects.get_or_create(
        slug=slug,
        defaults={"name": slug.replace("_", " ").title(), "category": "analysis"},
    )
    return AgentDefinition.objects.create(
        name=slug.replace("_", " ").title(),
        slug=slug,
        prompt_template=template,
        model_primary=_create_provider(),
        tools_allowed=["brief.get", "client.get", "pricing.calculate"],
        is_active=is_active,
    )


# ─── Auth Helper ─────────────────────────────────────────────────────────────


class AuthHelper:
    """Génère des tokens admin valides pour les tests."""

    @staticmethod
    def admin_token() -> str:
        from django.core.signing import TimestampSigner
        signer = TimestampSigner()
        return signer.sign("admin_user")

    @staticmethod
    def admin_header() -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {AuthHelper.admin_token()}"}


# ─── Agent List Tests ────────────────────────────────────────────────────────


class AgentListAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client()
        self.agent = _create_agent()
        self.url = reverse("ai-agent-list")

    def test_agent_list_requires_auth(self):
        response = self.client_obj.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_agent_list_returns_agents(self):
        response = self.client_obj.get(self.url, **AuthHelper.admin_header())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["slug"], "brief_analyst")

    def test_agent_list_includes_tools(self):
        response = self.client_obj.get(self.url, **AuthHelper.admin_header())
        data = response.json()
        self.assertIn("brief.get", data[0]["tools_allowed"])


# ─── Agent Run Tests ─────────────────────────────────────────────────────────


class AgentRunAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client()
        self.agent = _create_agent()
        self.url = reverse("ai-agent-run", kwargs={"pk": self.agent.pk})

    def test_run_requires_auth(self):
        response = self.client_obj.post(
            self.url, {"message": "Analyse ce brief"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)

    def test_run_inactive_agent_returns_400(self):
        self.agent.is_active = False
        self.agent.save()

        response = self.client_obj.post(
            self.url,
            {"message": "Test"},
            content_type="application/json",
            **AuthHelper.admin_header(),
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("désactivé", response.json()["error"])

    def test_run_unknown_agent_returns_404(self):
        url = reverse("ai-agent-run", kwargs={"pk": 9999})
        response = self.client_obj.post(
            url,
            {"message": "Test"},
            content_type="application/json",
            **AuthHelper.admin_header(),
        )
        self.assertEqual(response.status_code, 404)

    def test_run_missing_message_returns_400(self):
        response = self.client_obj.post(
            self.url,
            {},
            content_type="application/json",
            **AuthHelper.admin_header(),
        )
        self.assertEqual(response.status_code, 400)

    @patch("hadara_ai.api.views.AgentEngine")
    def test_run_calls_engine(self, MockEngine):
        mock_instance = MagicMock()
        from hadara_ai.agents.engine import AgentResult
        mock_instance.execute.return_value = AgentResult(
            success=True,
            content="Analyse terminée",
            iterations=1,
            tool_calls=0,
            total_input_tokens=100,
            total_output_tokens=50,
            total_cost_usd=0.001,
            total_duration_ms=200,
            model_used="llama-3.1-8b-instant",
            stopped_reason="completed",
        )
        MockEngine.return_value = mock_instance

        response = self.client_obj.post(
            self.url,
            {"message": "Analyse ce brief"},
            content_type="application/json",
            **AuthHelper.admin_header(),
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["content"], "Analyse terminée")
        self.assertEqual(data["agent_slug"], "brief_analyst")
        self.assertEqual(data["iterations"], 1)

    @patch("hadara_ai.api.views.AgentEngine")
    def test_run_returns_financial_context(self, MockEngine):
        """Vérifie que la réponse contient les données de coût."""
        mock_instance = MagicMock()
        from hadara_ai.agents.engine import AgentResult
        mock_instance.execute.return_value = AgentResult(
            success=True,
            content="Test",
            total_input_tokens=500,
            total_output_tokens=200,
            total_cost_usd=0.003,
            total_duration_ms=350,
            model_used="m1",
            stopped_reason="completed",
        )
        MockEngine.return_value = mock_instance

        response = self.client_obj.post(
            self.url,
            {"message": "Test"},
            content_type="application/json",
            **AuthHelper.admin_header(),
        )

        data = response.json()
        self.assertEqual(data["total_input_tokens"], 500)
        self.assertEqual(data["total_output_tokens"], 200)
        self.assertEqual(data["total_cost_usd"], 0.003)


# ─── Execution List Tests ────────────────────────────────────────────────────


class ExecutionListAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client()
        self.url = reverse("ai-execution-list")
        self.service = ExecutionTraceService()

    def test_requires_admin(self):
        response = self.client_obj.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_returns_executions(self):
        exec1 = self.service.start_ai_execution(provider="groq", model="m1")
        self.service.complete_ai_execution(exec1, input_tokens=100, output_tokens=50)

        response = self.client_obj.get(self.url, **AuthHelper.admin_header())
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 1)

    def test_pagination(self):
        for i in range(5):
            e = self.service.start_ai_execution(provider="groq", model="m1")
            self.service.complete_ai_execution(e)

        response = self.client_obj.get(
            self.url + "?limit=2&offset=0", **AuthHelper.admin_header()
        )
        data = response.json()
        self.assertEqual(data["limit"], 2)
        self.assertEqual(len(data["results"]), 2)


# ─── Execution Detail Tests ──────────────────────────────────────────────────


class ExecutionDetailAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client()
        self.service = ExecutionTraceService()
        self.execution = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        self.url = reverse("ai-execution-detail", kwargs={"pk": self.execution.pk})

    def test_requires_admin(self):
        response = self.client_obj.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_returns_execution(self):
        response = self.client_obj.get(self.url, **AuthHelper.admin_header())
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["provider"], "groq")

    def test_not_found(self):
        url = reverse("ai-execution-detail", kwargs={"pk": 9999})
        response = self.client_obj.get(url, **AuthHelper.admin_header())
        self.assertEqual(response.status_code, 404)


# ─── Usage Summary Tests ─────────────────────────────────────────────────────


class UsageSummaryAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client()
        self.url = reverse("ai-usage-summary")
        self.service = ExecutionTraceService()

    def test_requires_admin(self):
        response = self.client_obj.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_returns_summary(self):
        e = self.service.start_ai_execution(provider="groq", model="m1")
        self.service.complete_ai_execution(
            e, input_tokens=100, output_tokens=50, cost_usd=0.001
        )

        response = self.client_obj.get(self.url, **AuthHelper.admin_header())
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_input_tokens", data)


# ─── Dashboard Tests ─────────────────────────────────────────────────────────


class DashboardAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client()
        self.url = reverse("ai-dashboard")
        self.service = ExecutionTraceService()

    def test_requires_admin(self):
        response = self.client_obj.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_returns_dashboard(self):
        e = self.service.start_ai_execution(provider="groq", model="m1")
        self.service.complete_ai_execution(
            e, input_tokens=100, output_tokens=50, cost_usd=0.001
        )

        response = self.client_obj.get(self.url, **AuthHelper.admin_header())
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("by_model", data)
        self.assertIn("by_agent", data)
        self.assertIn("recent_executions", data)


# ─── URL Resolution Tests ────────────────────────────────────────────────────


class URLResolutionTest(TestCase):
    def test_agent_list_url(self):
        url = reverse("ai-agent-list")
        self.assertEqual(url, "/api/ai/v1/agents/")

    def test_agent_run_url(self):
        url = reverse("ai-agent-run", kwargs={"pk": 1})
        self.assertEqual(url, "/api/ai/v1/agents/1/run/")

    def test_execution_list_url(self):
        url = reverse("ai-execution-list")
        self.assertEqual(url, "/api/ai/v1/executions/")

    def test_execution_detail_url(self):
        url = reverse("ai-execution-detail", kwargs={"pk": 1})
        self.assertEqual(url, "/api/ai/v1/executions/1/")

    def test_usage_url(self):
        url = reverse("ai-usage-summary")
        self.assertEqual(url, "/api/ai/v1/usage/")

    def test_dashboard_url(self):
        url = reverse("ai-dashboard")
        self.assertEqual(url, "/api/ai/v1/dashboard/")
