from __future__ import annotations

import uuid
from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase

from hadara_ai.models import (
    AgentDefinition,
    AIProvider,
    AIProviderConfig,
    PromptTemplate,
)
from hadara_ai.models.trace import (
    AIExecution,
    CostLog,
    ExecutionStatus,
    RetentionPolicy,
    ToolExecution,
    UsageLog,
)
from hadara_ai.tracing.service import ExecutionTraceService
from hadara_ai.tracing.aggregator import CostCalculator, UsageAggregator


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


def _create_agent(slug="brief_analyst") -> AgentDefinition:
    template, _ = PromptTemplate.objects.get_or_create(
        slug=slug,
        defaults={"name": slug.replace("_", " ").title(), "category": "analysis"},
    )
    return AgentDefinition.objects.create(
        name=slug.replace("_", " ").title(),
        slug=slug,
        prompt_template=template,
        model_primary=_create_provider(),
        tools_allowed=["brief.get"],
    )


# ─── ExecutionTraceService Tests ─────────────────────────────────────────────


class TraceServiceCreationTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()

    def test_start_ai_execution(self):
        execution = self.service.start_ai_execution(
            provider="groq",
            model="llama-3.1-8b-instant",
        )
        self.assertIsNotNone(execution.trace_id)
        self.assertIsNotNone(execution.request_id)
        self.assertEqual(execution.provider, "groq")
        self.assertEqual(execution.model, "llama-3.1-8b-instant")
        self.assertEqual(execution.status, ExecutionStatus.SUCCESS)

    def test_trace_id_unique(self):
        e1 = self.service.start_ai_execution(provider="groq", model="m1")
        e2 = self.service.start_ai_execution(provider="groq", model="m1")
        self.assertNotEqual(e1.trace_id, e2.trace_id)

    def test_complete_ai_execution(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        completed = self.service.complete_ai_execution(
            execution,
            input_tokens=100,
            output_tokens=50,
            cost_usd=0.001,
            duration_ms=200,
        )
        self.assertEqual(completed.input_tokens, 100)
        self.assertEqual(completed.output_tokens, 50)
        self.assertEqual(float(completed.cost_usd), 0.001)
        self.assertEqual(completed.duration_ms, 200)

    def test_log_tool_execution(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        tool_exec = self.service.log_tool_execution(
            trace_id=execution.trace_id,
            ai_execution=execution,
            tool_name="brief.get",
            arguments={"brief_id": "HAD-0001"},
            result={"id": "HAD-0001"},
            success=True,
            duration_ms=50,
        )
        self.assertEqual(tool_exec.tool_name, "brief.get")
        self.assertTrue(tool_exec.success)
        self.assertEqual(tool_exec.duration_ms, 50)


class TraceServiceRetentionTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()

    def test_full_retention_stores_content(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1",
            retention_policy=RetentionPolicy.FULL,
        )
        self.service.complete_ai_execution(
            execution,
            prompt_content="Mon prompt secret",
            response_content="Ma réponse",
        )
        execution.refresh_from_db()
        self.assertEqual(execution.prompt_content, "Mon prompt secret")
        self.assertEqual(execution.response_content, "Ma réponse")

    def test_metadata_only_no_content(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1",
            retention_policy=RetentionPolicy.METADATA_ONLY,
        )
        self.service.complete_ai_execution(
            execution,
            prompt_content="Secret",
            response_content="Secret",
        )
        execution.refresh_from_db()
        self.assertIsNone(execution.prompt_content)
        self.assertIsNone(execution.response_content)

    def test_redacted_strips_pii(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1",
            retention_policy=RetentionPolicy.REDACTED,
        )
        self.service.complete_ai_execution(
            execution,
            prompt_content="Contact: jean@example.com au +221 77 123 45 67",
            response_content="Réponse",
        )
        execution.refresh_from_db()
        self.assertIn("[EMAIL]", execution.prompt_content)
        self.assertIn("[PHONE]", execution.prompt_content)
        self.assertNotIn("jean@example.com", execution.prompt_content)


class TraceServiceTraceRetrievalTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()
        self.trace_id = uuid.uuid4()

    def test_get_trace_returns_all_executions(self):
        e1 = self.service.start_ai_execution(
            trace_id=self.trace_id, provider="groq", model="m1"
        )
        e2 = self.service.start_ai_execution(
            trace_id=self.trace_id, provider="openai", model="m2"
        )

        trace = self.service.get_trace(self.trace_id)
        self.assertEqual(len(trace["executions"]), 2)

    def test_get_trace_includes_tool_executions(self):
        e1 = self.service.start_ai_execution(
            trace_id=self.trace_id, provider="groq", model="m1"
        )
        self.service.log_tool_execution(
            trace_id=self.trace_id,
            ai_execution=e1,
            tool_name="brief.get",
            arguments={},
            result={},
        )

        trace = self.service.get_trace(self.trace_id)
        self.assertEqual(len(trace["tool_executions"]), 1)
        self.assertEqual(trace["tool_executions"][0]["tool_name"], "brief.get")

    def test_get_trace_summary(self):
        e1 = self.service.start_ai_execution(
            trace_id=self.trace_id, provider="groq", model="m1"
        )
        self.service.complete_ai_execution(
            e1, input_tokens=100, output_tokens=50, cost_usd=0.001, duration_ms=200
        )
        self.service.log_tool_execution(
            trace_id=self.trace_id,
            ai_execution=e1,
            tool_name="brief.get",
            arguments={},
            result={},
        )

        trace = self.service.get_trace(self.trace_id)
        summary = trace["summary"]
        self.assertEqual(summary["total_input_tokens"], 100)
        self.assertEqual(summary["total_output_tokens"], 50)
        self.assertEqual(summary["total_ai_calls"], 1)
        self.assertEqual(summary["total_tool_calls"], 1)


# ─── Parent/Child Execution Tests ────────────────────────────────────────────


class TraceServiceParentChildTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()

    def test_parent_child_relationship(self):
        parent = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        child = self.service.start_ai_execution(
            provider="groq", model="m1",
            parent_execution=parent,
        )
        self.assertEqual(child.parent_execution_id, parent.id)

    def test_child_executions_accessible(self):
        parent = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        c1 = self.service.start_ai_execution(
            parent_execution=parent, provider="groq", model="m1"
        )
        c2 = self.service.start_ai_execution(
            parent_execution=parent, provider="groq", model="m1"
        )

        children = list(parent.child_executions.all())
        self.assertEqual(len(children), 2)


# ─── CostCalculator Tests ────────────────────────────────────────────────────


class CostCalculatorTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()
        self.calculator = CostCalculator()

        # Créer des exécutions avec coûts
        e1 = self.service.start_ai_execution(
            provider="groq", model="m1",
            brief_id="HAD-0001", client_id="CLT-0001",
        )
        self.service.complete_ai_execution(e1, cost_usd=0.001)

        e2 = self.service.start_ai_execution(
            provider="openai", model="m2",
            brief_id="HAD-0001", client_id="CLT-0001",
        )
        self.service.complete_ai_execution(e2, cost_usd=0.005)

        e3 = self.service.start_ai_execution(
            provider="groq", model="m1",
            brief_id="HAD-0002", client_id="CLT-0002",
        )
        self.service.complete_ai_execution(e3, cost_usd=0.002)

    def test_total_cost(self):
        total = self.calculator.total_cost()
        self.assertAlmostEqual(float(total), 0.008, places=4)

    def test_cost_by_model(self):
        by_model = self.calculator.cost_by_model()
        self.assertEqual(len(by_model), 2)
        # openai/m2 = 0.005, groq/m1 = 0.003
        self.assertEqual(by_model[0]["model"], "m2")
        self.assertAlmostEqual(float(by_model[0]["total_cost"]), 0.005, places=4)

    def test_cost_by_agent(self):
        # Ajouter un agent
        agent = _create_agent()
        e = self.service.start_ai_execution(
            agent=agent, provider="groq", model="m1"
        )
        self.service.complete_ai_execution(e, cost_usd=0.01)

        by_agent = self.calculator.cost_by_agent()
        self.assertEqual(len(by_agent), 1)
        self.assertEqual(by_agent[0]["agent_slug"], "brief_analyst")

    def test_cost_by_brief(self):
        by_brief = self.calculator.cost_by_brief()
        self.assertEqual(len(by_brief), 2)
        # HAD-0001 = 0.006, HAD-0002 = 0.002
        self.assertEqual(by_brief[0]["brief_id"], "HAD-0001")

    def test_cost_by_client(self):
        by_client = self.calculator.cost_by_client()
        self.assertEqual(len(by_client), 2)

    def test_cost_filtered_by_date(self):
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Tous les coûts sont aujourd'hui
        total_today = self.calculator.total_cost(start_date=today, end_date=today)
        self.assertAlmostEqual(float(total_today), 0.008, places=4)

        # Hier = rien
        total_yesterday = self.calculator.total_cost(start_date=yesterday, end_date=yesterday)
        self.assertEqual(float(total_yesterday), 0.0)

    def test_cost_filtered_by_provider(self):
        groq_cost = self.calculator.total_cost(provider="groq")
        self.assertAlmostEqual(float(groq_cost), 0.003, places=4)

        openai_cost = self.calculator.total_cost(provider="openai")
        self.assertAlmostEqual(float(openai_cost), 0.005, places=4)


# ─── UsageAggregator Tests ──────────────────────────────────────────────────


class UsageAggregatorTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()
        self.aggregator = UsageAggregator()

    def test_aggregate_daily(self):
        # Créer des exécutions aujourd'hui
        e1 = self.service.start_ai_execution(provider="groq", model="m1")
        self.service.complete_ai_execution(
            e1, input_tokens=100, output_tokens=50, cost_usd=0.001, duration_ms=200
        )

        logs = self.aggregator.aggregate_daily(date.today())
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].total_input_tokens, 100)
        self.assertEqual(logs[0].total_output_tokens, 50)

    def test_aggregate_daily_idempotent(self):
        e1 = self.service.start_ai_execution(provider="groq", model="m1")
        self.service.complete_ai_execution(e1, input_tokens=100, output_tokens=50)

        # Agréger deux fois
        logs1 = self.aggregator.aggregate_daily(date.today())
        logs2 = self.aggregator.aggregate_daily(date.today())
        self.assertEqual(len(logs2), 1)  # Pas de doublon

    def test_get_usage_summary(self):
        e1 = self.service.start_ai_execution(provider="groq", model="m1")
        self.service.complete_ai_execution(
            e1, input_tokens=100, output_tokens=50, cost_usd=0.001, duration_ms=200
        )

        # Agréger d'abord
        self.aggregator.aggregate_daily(date.today())

        summary = self.aggregator.get_usage_summary()
        self.assertEqual(summary["total_input_tokens"], 100)
        self.assertEqual(summary["total_output_tokens"], 50)
        self.assertEqual(summary["total_ai_calls"], 1)


# ─── CostLog Tests ──────────────────────────────────────────────────────────


class CostLogTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()

    def test_cost_log_created_on_complete(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1",
            brief_id="HAD-0001",
        )
        self.service.complete_ai_execution(execution, cost_usd=0.005)

        cost_logs = CostLog.objects.filter(trace_id=execution.trace_id)
        self.assertEqual(cost_logs.count(), 1)
        self.assertEqual(float(cost_logs.first().cost_usd), 0.005)
        self.assertEqual(cost_logs.first().brief_id, "HAD-0001")

    def test_no_cost_log_when_zero(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        self.service.complete_ai_execution(execution, cost_usd=0)

        cost_logs = CostLog.objects.filter(trace_id=execution.trace_id)
        self.assertEqual(cost_logs.count(), 0)


# ─── Error Status Tests ─────────────────────────────────────────────────────


class ExecutionStatusTest(TestCase):
    def setUp(self):
        self.service = ExecutionTraceService()

    def test_error_status_recorded(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        self.service.complete_ai_execution(
            execution,
            status=ExecutionStatus.ERROR,
            error_message="API timeout",
        )
        execution.refresh_from_db()
        self.assertEqual(execution.status, ExecutionStatus.ERROR)
        self.assertEqual(execution.error_message, "API timeout")

    def test_timeout_status_recorded(self):
        execution = self.service.start_ai_execution(
            provider="groq", model="m1"
        )
        self.service.complete_ai_execution(
            execution,
            status=ExecutionStatus.TIMEOUT,
            error_message="Request timed out after 30s",
        )
        execution.refresh_from_db()
        self.assertEqual(execution.status, ExecutionStatus.TIMEOUT)


# ─── Integration Test: Full Trace Lifecycle ──────────────────────────────────


class FullTraceLifecycleTest(TestCase):
    """Teste le cycle de vie complet d'une trace d'exécution."""

    def setUp(self):
        self.service = ExecutionTraceService()
        self.agent = _create_agent()
        self.trace_id = uuid.uuid4()

    def test_full_agent_execution_trace(self):
        # 1. Agent starts
        ai_exec = self.service.start_ai_execution(
            trace_id=self.trace_id,
            agent=self.agent,
            provider="groq",
            model="llama-3.1-8b-instant",
            brief_id="HAD-0001",
            client_id="CLT-0001",
        )

        # 2. First AI call
        self.service.complete_ai_execution(
            ai_exec,
            input_tokens=500,
            output_tokens=100,
            cost_usd=0.0005,
            duration_ms=300,
            prompt_content="System prompt",
            response_content='{"action": "tool_call", "tool": "brief.get"}',
        )

        # 3. Tool call
        tool_exec = self.service.log_tool_execution(
            trace_id=self.trace_id,
            ai_execution=ai_exec,
            tool_name="brief.get",
            arguments={"brief_id": "HAD-0001"},
            result={"id": "HAD-0001", "project_type": "logo"},
            success=True,
            duration_ms=50,
        )

        # 4. Second AI call (final response)
        ai_exec2 = self.service.start_ai_execution(
            trace_id=self.trace_id,
            agent=self.agent,
            provider="groq",
            model="llama-3.1-8b-instant",
            parent_execution=ai_exec,
        )
        self.service.complete_ai_execution(
            ai_exec2,
            input_tokens=600,
            output_tokens=200,
            cost_usd=0.0008,
            duration_ms=400,
        )

        # 5. Vérifier la trace complète
        trace = self.service.get_trace(self.trace_id)
        self.assertEqual(len(trace["executions"]), 2)
        self.assertEqual(len(trace["tool_executions"]), 1)

        summary = trace["summary"]
        self.assertEqual(summary["total_input_tokens"], 1100)
        self.assertEqual(summary["total_output_tokens"], 300)
        self.assertEqual(summary["total_ai_calls"], 2)
        self.assertEqual(summary["total_tool_calls"], 1)

        # 6. Vérifier CostLog
        cost_logs = CostLog.objects.filter(trace_id=self.trace_id)
        self.assertEqual(cost_logs.count(), 2)
        total_cost = sum(c.cost_usd for c in cost_logs)
        self.assertAlmostEqual(float(total_cost), 0.0013, places=4)

    def test_financial_context_in_trace(self):
        """Vérifie que les données financières sont correctement tracées."""
        # Brief 20k, Facture 50k, Paiement 25k
        from api.models import Brief, Client, BillingDocument, BillingLine, Payment

        client = Client.objects.create(name="Client Trace")
        brief = Brief(project_type="logo", context_description="Test", main_title="Test")
        brief.save()

        doc = BillingDocument(
            doc_type="facture", subtotal=50000,
            client=client, billing_client_name=client.name, brief=brief,
        )
        doc.save()
        BillingLine.objects.create(document=doc, designation="Prestation", quantity=1, unit_price=50000)
        doc.refresh_from_db()
        Payment.objects.create(billing_document=doc, amount=25000, method="wave", payment_date="2026-01-15")

        # Exécuter l'agent
        exec1 = self.service.start_ai_execution(
            trace_id=self.trace_id,
            agent=self.agent,
            provider="groq", model="m1",
            brief_id=brief.id,
            client_id=client.id,
        )
        self.service.complete_ai_execution(exec1, cost_usd=0.001)

        # Vérifier que le brief_id et client_id sont correctement stockés
        exec1.refresh_from_db()
        self.assertEqual(exec1.brief_id, brief.id)
        self.assertEqual(exec1.client_id, client.id)

        # Vérifier via CostLog
        cost_log = CostLog.objects.get(trace_id=self.trace_id)
        self.assertEqual(cost_log.brief_id, brief.id)
        self.assertEqual(cost_log.client_id, client.id)
