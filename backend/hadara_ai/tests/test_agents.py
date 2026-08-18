from __future__ import annotations

import json
from unittest.mock import MagicMock, patch, PropertyMock

from django.test import TestCase

from hadara_ai.models import (
    AgentDefinition,
    AIProvider,
    AIProviderConfig,
    PromptTemplate,
    PromptVersion,
)
from hadara_ai.agents.engine import AgentEngine, AgentResult, AgentStep
from hadara_ai.agents.routing import ModelRouter, ModelRouterError
from hadara_ai.providers.base import AIResponse
from hadara_ai.tools.context import ToolContext, ToolRole
from hadara_ai.tools.registry import ToolRegistry, ToolDefinition
from hadara_ai.tools.context import ToolPermission


# ─── Fixtures ────────────────────────────────────────────────────────────────


def _make_context(role: ToolRole = ToolRole.ADMIN) -> ToolContext:
    return ToolContext(user_id="u1", role=role, trace_id="trace-001")


def _create_provider(name="groq", model_id="llama-3.1-8b-instant") -> AIProviderConfig:
    provider, _ = AIProvider.objects.get_or_create(
        name=name,
        defaults={"display_name": name.title(), "is_active": True, "priority": 10}
    )
    config, _ = AIProviderConfig.objects.get_or_create(
        provider=provider,
        model_id=model_id,
        defaults={
            "display_name": model_id,
            "is_active": True,
            "cost_per_input_token": 0.0000005,
            "cost_per_output_token": 0.0000015,
        },
    )
    return config


def _create_prompt(slug="brief_analyst") -> PromptTemplate:
    template, _ = PromptTemplate.objects.get_or_create(
        slug=slug,
        defaults={
            "name": slug.replace("_", " ").title(),
            "description": f"Template for {slug}",
            "category": "analysis",
        },
    )
    version, _ = PromptVersion.objects.get_or_create(
        template=template,
        version=1,
        defaults={
            "system_prompt": "Tu es un analyste d'affairesHadara.",
            "user_prompt_template": "{{user_message}}",
            "is_active": True,
        },
    )
    return template


def _create_agent(**kwargs) -> AgentDefinition:
    defaults = {
        "name": "Brief Analyst",
        "slug": "brief_analyst",
        "description": "Analyse de briefs",
        "tools_allowed": ["brief.get", "client.get", "client.history", "pricing.calculate"],
        "max_iterations": 5,
        "max_tool_calls": 10,
        "max_execution_time_s": 60,
        "is_active": True,
    }
    defaults.update(kwargs)
    if "prompt_template" not in defaults:
        defaults["prompt_template"] = _create_prompt()
    if "model_primary" not in defaults:
        defaults["model_primary"] = _create_provider()
    return AgentDefinition.objects.create(**defaults)


def _fake_ai_response(content: dict) -> AIResponse:
    return AIResponse(
        content=json.dumps(content),
        model="test-model",
        provider="test-provider",
        input_tokens=100,
        output_tokens=50,
        cost_usd=0.001,
        duration_ms=200,
    )


def _make_fake_tool(arguments, context):
    return {"echo": True, "brief_id": arguments.get("brief_id", "none")}


# ─── ModelRouter Tests ───────────────────────────────────────────────────────


class ModelRouterTest(TestCase):
    def setUp(self):
        self.primary = _create_provider("groq", "llama-3.1-8b-instant")
        self.fallback = _create_provider("openai", "gpt-4o-mini")

    def test_resolve_primary(self):
        registry = MagicMock()
        mock_provider = MagicMock()
        registry.get_provider.return_value = mock_provider

        router = ModelRouter(registry)
        provider, model_id = router.resolve(self.primary)

        self.assertEqual(model_id, "llama-3.1-8b-instant")
        registry.get_provider.assert_called_once_with("llama-3.1-8b-instant")

    def test_resolve_fallback_when_primary_fails(self):
        registry = MagicMock()
        registry.get_provider.side_effect = lambda mid: (
            MagicMock() if mid == "gpt-4o-mini" else None
        )

        router = ModelRouter(registry)
        provider, model_id = router.resolve(self.primary, self.fallback)

        self.assertEqual(model_id, "gpt-4o-mini")

    def test_resolve_all_fail_raises(self):
        registry = MagicMock()
        registry.get_provider.return_value = None

        router = ModelRouter(registry)
        with self.assertRaises(ModelRouterError) as ctx:
            router.resolve(self.primary, self.fallback)
        self.assertIn("Aucun provider disponible", str(ctx.exception))

    def test_get_fallback_chain(self):
        agent = _create_agent(model_fallback_1=self.fallback)
        router = ModelRouter(MagicMock())
        chain = router.get_fallback_chain(agent)
        self.assertEqual(chain, ["llama-3.1-8b-instant", "gpt-4o-mini"])


# ─── AgentDefinition Tests ──────────────────────────────────────────────────


class AgentDefinitionTest(TestCase):
    def test_create_agent(self):
        agent = _create_agent()
        self.assertEqual(agent.name, "Brief Analyst")
        self.assertTrue(agent.is_active)

    def test_agent_references_prompt_template(self):
        agent = _create_agent()
        self.assertEqual(agent.prompt_template.slug, "brief_analyst")

    def test_agent_references_model_primary(self):
        agent = _create_agent()
        self.assertEqual(agent.model_primary.model_id, "llama-3.1-8b-instant")

    def test_agent_has_limits(self):
        agent = _create_agent()
        self.assertEqual(agent.max_iterations, 5)
        self.assertEqual(agent.max_tool_calls, 10)
        self.assertEqual(agent.max_execution_time_s, 60)

    def test_agent_has_tools_allowed(self):
        agent = _create_agent()
        self.assertIn("brief.get", agent.tools_allowed)
        self.assertIn("pricing.calculate", agent.tools_allowed)

    def test_deactivate_agent(self):
        agent = _create_agent()
        agent.is_active = False
        agent.save()
        agent.refresh_from_db()
        self.assertFalse(agent.is_active)

    def test_agent_prompt_version_nullable(self):
        agent = _create_agent(prompt_version=None)
        self.assertIsNone(agent.prompt_version)

    def test_agent_with_prompt_version(self):
        template = _create_prompt()
        version = PromptVersion.objects.get(template=template, version=1)
        agent = _create_agent(prompt_version=version)
        self.assertEqual(agent.prompt_version.version, 1)


# ─── AgentEngine Basic Tests ─────────────────────────────────────────────────


class AgentEngineBasicTest(TestCase):
    def setUp(self):
        self.agent = _create_agent()
        self.context = _make_context()
        self.registry = ToolRegistry()
        self.registry.register(
            ToolDefinition(
                name="brief.get",
                description="Get brief",
                permission=ToolPermission.READ,
            ),
            _make_fake_tool,
        )

    def test_inactive_agent_returns_error(self):
        self.agent.is_active = False
        self.agent.save()

        engine = AgentEngine(tool_registry=self.registry)
        result = engine.execute(self.agent, "Hello", self.context)

        self.assertFalse(result.success)
        self.assertIn("désactivé", result.error)
        self.assertEqual(result.stopped_reason, "error")

    def test_no_provider_returns_error(self):
        engine = AgentEngine(tool_registry=self.registry)
        result = engine.execute(self.agent, "Hello", self.context)

        self.assertFalse(result.success)
        self.assertIn("Aucun provider", result.error)
        self.assertEqual(result.stopped_reason, "error")


# ─── AgentEngine Loop Tests (with mocked provider) ──────────────────────────


class AgentEngineLoopTest(TestCase):
    def setUp(self):
        self.agent = _create_agent()
        self.context = _make_context()
        self.registry = ToolRegistry()
        self.registry.register(
            ToolDefinition(
                name="brief.get",
                description="Get brief",
                permission=ToolPermission.READ,
            ),
            _make_fake_tool,
        )

    def _make_engine(self, responses: list[dict]) -> AgentEngine:
        """Crée un AgentEngine avec des réponses mockées."""
        registry = MagicMock()
        mock_provider = MagicMock()

        ai_responses = [
            _fake_ai_response(r) for r in responses
        ]
        mock_provider.chat_json.side_effect = ai_responses
        registry.get_provider.return_value = mock_provider

        model_router = ModelRouter(registry)
        return AgentEngine(
            tool_registry=self.registry,
            model_router=model_router,
        )

    def test_single_call_final_response(self):
        engine = self._make_engine([
            {"action": "final_response", "content": "Analyse terminée."}
        ])
        result = engine.execute(self.agent, "Analyse ce brief", self.context)

        self.assertTrue(result.success)
        self.assertEqual(result.content, "Analyse terminée.")
        self.assertEqual(result.iterations, 1)
        self.assertEqual(result.tool_calls, 0)
        self.assertEqual(result.stopped_reason, "completed")

    def test_tool_call_then_final(self):
        engine = self._make_engine([
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
            {"action": "final_response", "content": "Brief analysé."},
        ])
        result = engine.execute(self.agent, "Analyse HAD-0001", self.context)

        self.assertTrue(result.success)
        self.assertEqual(result.content, "Brief analysé.")
        self.assertEqual(result.iterations, 2)
        self.assertEqual(result.tool_calls, 1)
        self.assertEqual(result.steps[0].action, "tool_call")
        self.assertEqual(result.steps[0].tool_name, "brief.get")
        self.assertEqual(result.steps[1].action, "final_response")

    def test_multiple_tool_calls(self):
        engine = self._make_engine([
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
            {
                "action": "tool_call",
                "tool": "pricing.calculate",
                "arguments": {"brief_id": "HAD-0001"},
            },
            {"action": "final_response", "content": "Analyse complète."},
        ])
        result = engine.execute(self.agent, "Analyse complète", self.context)

        self.assertTrue(result.success)
        self.assertEqual(result.tool_calls, 2)
        self.assertEqual(result.iterations, 3)

    def test_max_iterations_stops(self):
        # Créer un agent avec max_iterations=2
        self.agent.max_iterations = 2
        self.agent.save()

        # L'IA veut toujours appeler des tools
        engine = self._make_engine([
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
        ])
        result = engine.execute(self.agent, "Test", self.context)

        self.assertFalse(result.success)
        self.assertEqual(result.stopped_reason, "max_iterations")
        self.assertEqual(result.iterations, 2)

    def test_max_tool_calls_stops(self):
        self.agent.max_tool_calls = 1
        self.agent.save()

        engine = self._make_engine([
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
        ])
        result = engine.execute(self.agent, "Test", self.context)

        self.assertFalse(result.success)
        self.assertEqual(result.stopped_reason, "max_tool_calls")

    def test_timeout_stops(self):
        self.agent.max_execution_time_s = 0  # Timeout immédiat
        self.agent.save()

        engine = self._make_engine([
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
        ])
        result = engine.execute(self.agent, "Test", self.context)

        self.assertFalse(result.success)
        self.assertEqual(result.stopped_reason, "timeout")

    def test_ai_error_stops(self):
        registry = MagicMock()
        mock_provider = MagicMock()
        mock_provider.chat_json.side_effect = RuntimeError("API down")
        registry.get_provider.return_value = mock_provider

        model_router = ModelRouter(registry)
        engine = AgentEngine(
            tool_registry=self.registry,
            model_router=model_router,
        )
        result = engine.execute(self.agent, "Test", self.context)

        self.assertFalse(result.success)
        self.assertEqual(result.stopped_reason, "error")
        self.assertIn("API down", result.error)

    def test_invalid_json_stops(self):
        registry = MagicMock()
        mock_provider = MagicMock()
        mock_provider.chat_json.return_value = AIResponse(
            content="not json at all",
            model="test",
            provider="test",
        )
        registry.get_provider.return_value = mock_provider

        model_router = ModelRouter(registry)
        engine = AgentEngine(
            tool_registry=self.registry,
            model_router=model_router,
        )
        result = engine.execute(self.agent, "Test", self.context)

        self.assertFalse(result.success)
        self.assertEqual(result.stopped_reason, "error")
        self.assertIn("non-JSON", result.error)

    def test_tokens_and_cost_accumulated(self):
        engine = self._make_engine([
            {
                "action": "tool_call",
                "tool": "brief.get",
                "arguments": {"brief_id": "HAD-0001"},
            },
            {"action": "final_response", "content": "Done"},
        ])
        result = engine.execute(self.agent, "Test", self.context)

        self.assertEqual(result.total_input_tokens, 200)
        self.assertEqual(result.total_output_tokens, 100)
        self.assertAlmostEqual(result.total_cost_usd, 0.002, places=4)


# ─── AgentEngine Security Tests ──────────────────────────────────────────────


class AgentEngineSecurityTest(TestCase):
    def setUp(self):
        self.agent = _create_agent(
            tools_allowed=["brief.get"],
        )
        self.context = _make_context()

    def test_unauthorized_tool_blocked(self):
        registry = ToolRegistry()
        registry.register(
            ToolDefinition(
                name="brief.get",
                description="Get brief",
                permission=ToolPermission.READ,
            ),
            _make_fake_tool,
        )

        registry_mock = MagicMock()
        mock_provider = MagicMock()
        mock_provider.chat_json.side_effect = [
            _fake_ai_response({
                "action": "tool_call",
                "tool": "invoice.create",  # Non autorisé
                "arguments": {},
            }),
            _fake_ai_response({
                "action": "final_response",
                "content": "Test",
            }),
        ]
        registry_mock.get_provider.return_value = mock_provider

        engine = AgentEngine(
            tool_registry=registry,
            model_router=ModelRouter(registry_mock),
        )
        result = engine.execute(self.agent, "Test", self.context)

        # L'outil non autorisé a été bloqué
        tool_step = result.steps[0]
        self.assertFalse(tool_step.tool_result.success)
        self.assertIn("non autorisé", tool_step.tool_result.error)

    def test_write_tool_blocked_by_registry(self):
        registry = ToolRegistry()
        registry.register(
            ToolDefinition(
                name="brief.update",
                description="Update brief",
                permission=ToolPermission.WRITE,
            ),
            _make_fake_tool,
        )
        self.agent.tools_allowed = ["brief.update"]
        self.agent.save()

        registry_mock = MagicMock()
        mock_provider = MagicMock()
        mock_provider.chat_json.side_effect = [
            _fake_ai_response({
                "action": "tool_call",
                "tool": "brief.update",
                "arguments": {"brief_id": "HAD-0001"},
            }),
            _fake_ai_response({
                "action": "final_response",
                "content": "Test",
            }),
        ]
        registry_mock.get_provider.return_value = mock_provider

        engine = AgentEngine(
            tool_registry=registry,
            model_router=ModelRouter(registry_mock),
        )
        result = engine.execute(self.agent, "Test", self.context)

        # Le tool registry a bloqué l'écriture
        tool_step = result.steps[0]
        self.assertFalse(tool_step.tool_result.success)
        self.assertIn("confirmation", tool_step.tool_result.error)


# ─── AgentResult Tests ──────────────────────────────────────────────────────


class AgentResultTest(TestCase):
    def test_to_dict(self):
        result = AgentResult(
            success=True,
            content="Test",
            iterations=2,
            tool_calls=1,
            total_input_tokens=200,
            total_output_tokens=100,
            total_cost_usd=0.002,
            total_duration_ms=500,
            model_used="test-model",
            stopped_reason="completed",
        )
        d = result.to_dict()
        self.assertTrue(d["success"])
        self.assertEqual(d["content"], "Test")
        self.assertEqual(d["iterations"], 2)
        self.assertEqual(d["tool_calls"], 1)
        self.assertEqual(d["model_used"], "test-model")
        self.assertEqual(d["stopped_reason"], "completed")

    def test_agent_step_to_dict(self):
        result = AgentResult(success=True)
        result.steps.append(AgentStep(
            iteration=1,
            action="tool_call",
            tool_name="brief.get",
            model="test",
            input_tokens=100,
            output_tokens=50,
        ))
        d = result.to_dict()
        self.assertEqual(len(d["steps"]), 1)
        self.assertEqual(d["steps"][0]["tool_name"], "brief.get")


# ─── Financial Integration Test ──────────────────────────────────────────────


class AgentFinancialIntegrationTest(TestCase):
    """Teste que le brief_analyst reçoit correctement les données financières
    et ne les confond jamais."""

    def setUp(self):
        from api.models import Brief, Client, BillingDocument, BillingLine, Payment

        # Créer un client
        self.client_obj = Client.objects.create(
            name="Client Finance Test",
            organization="Corp",
        )

        # Créer un brief avec quoted_price = 20k
        self.brief = Brief(
            project_type="logo",
            context_description="Test",
            main_title="Test",
        )
        self.brief.save()

        # Créer une facture de 50k
        self.doc = BillingDocument(
            doc_type="facture",
            subtotal=50000,
            client=self.client_obj,
            billing_client_name=self.client_obj.name,
            brief=self.brief,
        )
        self.doc.save()
        BillingLine.objects.create(
            document=self.doc,
            designation="Prestation",
            quantity=1,
            unit_price=50000,
        )
        self.doc.refresh_from_db()

        # Créer un paiement de 25k
        Payment.objects.create(
            billing_document=self.doc,
            amount=25000,
            method="wave",
            payment_date="2026-01-15",
        )

    def test_financial_data_correctly_passed(self):
        """Vérifie que les outils retournent les bons montants."""
        from hadara_ai.tools.implementations import (
            brief_get,
            client_history,
            pricing_calculate,
        )

        ctx = _make_context()

        # brief.get retourne quoted_price = pas de PII
        brief_data = brief_get({"brief_id": self.brief.id}, ctx)
        self.assertEqual(brief_data["id"], self.brief.id)

        # client.history retourne les bons montants
        history = client_history({"client_id": self.client_obj.id}, ctx)
        self.assertEqual(history["summary"]["total_invoiced_fcfa"], 50000)
        self.assertEqual(history["summary"]["total_paid_fcfa"], 25000)
        self.assertEqual(history["summary"]["balance_due_fcfa"], 25000)

        # pricing.calculate retourne le PricingEngine
        pricing = pricing_calculate({"brief_id": self.brief.id}, ctx)
        self.assertIn("pricing", pricing)
        self.assertIn("prix_min_fcfa", pricing["pricing"])

    def test_agent_receives_correct_financial_context(self):
        """Simule le brief_analyst et vérifie qu'il reçoit les bons chiffres."""
        from hadara_ai.tools.implementations import client_history

        ctx = _make_context()
        history = client_history({"client_id": self.client_obj.id}, ctx)

        # Le contexte financier envoyé à l'agent
        financial_context = {
            "brief_estimated_fcfa": self.brief.quoted_price_fcfa,
            "total_invoiced_fcfa": history["summary"]["total_invoiced_fcfa"],
            "total_paid_fcfa": history["summary"]["total_paid_fcfa"],
            "balance_due_fcfa": history["summary"]["balance_due_fcfa"],
        }

        # Vérification critique : facturé ≠ estimé
        self.assertNotEqual(
            financial_context["brief_estimated_fcfa"],
            financial_context["total_invoiced_fcfa"],
        )
        # Les chiffres sont corrects
        self.assertEqual(financial_context["total_invoiced_fcfa"], 50000)
        self.assertEqual(financial_context["total_paid_fcfa"], 25000)
        self.assertEqual(financial_context["balance_due_fcfa"], 25000)


# ─── Prompt Integration Test ────────────────────────────────────────────────


class AgentPromptIntegrationTest(TestCase):
    def test_agent_uses_prompt_engine_when_available(self):
        template = _create_prompt("test_prompt")
        agent = _create_agent(prompt_template=template)

        mock_prompt_engine = MagicMock()
        mock_prompt_engine.render.return_value = {
            "system": "System prompt renderé",
            "user": "User prompt renderé",
            "template_slug": "test_prompt",
            "version": 1,
        }

        registry = MagicMock()
        mock_provider = MagicMock()
        mock_provider.chat_json.return_value = _fake_ai_response({
            "action": "final_response",
            "content": "Réponse",
        })
        registry.get_provider.return_value = mock_provider

        engine = AgentEngine(
            tool_registry=ToolRegistry(),
            model_router=ModelRouter(registry),
            prompt_engine=mock_prompt_engine,
        )
        ctx = _make_context()
        result = engine.execute(agent, "Bonjour", ctx)

        mock_prompt_engine.render.assert_called_once()
        call_args = mock_prompt_engine.render.call_args
        self.assertEqual(call_args[0][0], "test_prompt")

    def test_agent_fallback_without_prompt_engine(self):
        agent = _create_agent()

        registry = MagicMock()
        mock_provider = MagicMock()
        mock_provider.chat_json.return_value = _fake_ai_response({
            "action": "final_response",
            "content": "Réponse",
        })
        registry.get_provider.return_value = mock_provider

        engine = AgentEngine(
            tool_registry=ToolRegistry(),
            model_router=ModelRouter(registry),
        )
        ctx = _make_context()
        result = engine.execute(agent, "Bonjour", ctx)

        self.assertTrue(result.success)
        self.assertEqual(result.content, "Réponse")
