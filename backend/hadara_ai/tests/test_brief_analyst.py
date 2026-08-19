from unittest.mock import MagicMock, patch
import json

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from api.models import Brief, Client
from hadara_ai.agents.brief_analyst import (
    BRIEF_ANALYST_SYSTEM_PROMPT,
    build_brief_context,
    build_pricing_context,
    parse_brief_analyst_response,
    _get_fallback_response,
)
from hadara_ai.agents.brief_analyst_service import BriefAnalystService


MOCK_AI_RESPONSE_JSON = json.dumps({
    "statut_brief": "exploitable",
    "score_completude": 85,
    "complexite_percue": 6,
    "decision_recommandee": "ACCEPTER",
    "raison_decision": "Brief complet",
    "informations_manquantes": [],
    "questions_client": [],
    "risques": [],
    "niveau_priorite": "Normal",
    "brouillon_whatsapp": "Bonjour",
    "pricing": {
        "prix_min_fcfa": 35000,
        "prix_max_fcfa": 50000,
        "heures_min": 2,
        "heures_max": 4,
    },
})


def _mock_ai_response():
    mock = MagicMock()
    mock.content = MOCK_AI_RESPONSE_JSON
    mock.input_tokens = 1200
    mock.output_tokens = 800
    mock.cost_usd = 0.001
    mock.duration_ms = 1500
    return mock


def _mock_pricing_data():
    return {
        "pricing": {
            "prix_min_fcfa": 35000,
            "prix_max_fcfa": 50000,
            "heures_min": 2,
            "heures_max": 4,
            "delai_min_jours": 2,
            "delai_max_jours": 5,
            "score_completude": 80,
            "score_complexite": 6,
            "acompte_conseille": 50,
        }
    }


class BuildBriefContextTest(TestCase):
    def _brief(self, **overrides):
        base = {
            "project_type": "Logo",
            "primary_objective": "test",
            "context_description": "test",
            "target_audience": "test",
        }
        base.update(overrides)
        return base

    def test_includes_project_type(self):
        ctx = build_brief_context(self._brief(
            project_type="Identite visuelle",
            primary_objective="Creer un logo",
        ), None, None)
        self.assertIn("Identite visuelle", ctx)
        self.assertIn("Creer un logo", ctx)

    def test_includes_style_preferences(self):
        ctx = build_brief_context(self._brief(
            style_preferences=["Moderne", "Colore"],
        ), None, None)
        self.assertIn("Moderne, Colore", ctx)

    def test_includes_budget_and_deadline(self):
        ctx = build_brief_context(self._brief(
            budget_range="50000-100000",
            desired_delivery_date="2026-09-01",
            critical_deadline="2026-09-15",
        ), None, None)
        self.assertIn("50000-100000", ctx)
        self.assertIn("2026-09-01", ctx)
        self.assertIn("2026-09-15", ctx)

    def test_includes_deliverable_count(self):
        ctx = build_brief_context(self._brief(
            deliverable_versions=[{"name": "A"}, {"name": "B"}],
        ), None, None)
        self.assertIn("\u00e9clinaison(s)", ctx)

    def test_includes_client_organization(self):
        ctx = build_brief_context(
            self._brief(),
            {"organization": "Hadara Corp"},
            None,
        )
        self.assertIn("Hadara Corp", ctx)

    def test_includes_client_history_summary(self):
        history_data = {
            "summary": {
                "total_briefs": 5,
                "total_invoiced_fcfa": 250000,
                "total_paid_fcfa": 200000,
                "balance_due_fcfa": 50000,
            }
        }
        ctx = build_brief_context(self._brief(), None, history_data)
        self.assertIn("5", ctx)
        self.assertIn("250000", ctx)
        self.assertIn("50000", ctx)


class BuildPricingContextTest(TestCase):
    def test_json_format(self):
        pricing_data = _mock_pricing_data()
        ctx = build_pricing_context(pricing_data)
        self.assertIn("35000", ctx)
        self.assertIn("50000", ctx)
        parsed = json.loads(ctx)
        self.assertEqual(parsed["prix_min_fcfa"], 35000)

    def test_empty_pricing(self):
        ctx = build_pricing_context({})
        self.assertIn("0", ctx)


class ParseBriefAnalystResponseTest(TestCase):
    def test_valid_json(self):
        result = parse_brief_analyst_response(MOCK_AI_RESPONSE_JSON)
        self.assertEqual(result["statut_brief"], "exploitable")
        self.assertEqual(result["score_completude"], 85)
        self.assertEqual(result["pricing"]["source"], "pricing_engine")

    def test_missing_fields(self):
        incomplete = json.dumps({"statut_brief": "exploitable"})
        result = parse_brief_analyst_response(incomplete)
        self.assertIn("score_completude", result)
        self.assertIn("pricing", result)

    def test_invalid_json(self):
        result = parse_brief_analyst_response("not json at all")
        self.assertIn("R\u00c9SERVE", result["decision_recommandee"])
        self.assertEqual(result["score_completude"], 50)

    def test_pricing_source_always_pricing_engine(self):
        response = json.dumps({
            "statut_brief": "exploitable",
            "score_completude": 80,
            "complexite_percue": 5,
            "decision_recommandee": "ACCEPTER",
            "raison_decision": "OK",
            "pricing": {
                "prix_min_fcfa": 35000,
                "prix_max_fcfa": 50000,
                "heures_min": 2,
                "heures_max": 4,
                "source": "should_be_overwritten",
            },
        })
        result = parse_brief_analyst_response(response)
        self.assertEqual(result["pricing"]["source"], "pricing_engine")


class FallbackResponseTest(TestCase):
    def test_fallback_has_all_fields(self):
        result = _get_fallback_response("test")
        self.assertIn("R\u00c9SERVE", result["decision_recommandee"])
        self.assertEqual(result["pricing"]["source"], "pricing_engine")
        self.assertIn("Analyse IA indisponible", result["raison_decision"])


class BriefAnalystServiceTest(TestCase):
    def setUp(self):
        self.client_obj = Client.objects.create(
            name="Test Client",
            organization="Hadara Corp",
            whatsapp="+221770000000",
            email="test@hadara.sn",
        )
        self.brief = Brief.objects.create(
            client=self.client_obj,
            project_type="Identite visuelle",
            context_description="Startup tech",
            primary_objective="Creer un logo",
            target_audience="Jeunes urbains",
            style_preferences=["Moderne"],
            budget_range="50000-100000",
        )

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_returns_structured_response(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        self.assertEqual(result["statut_brief"], "exploitable")
        self.assertEqual(result["score_completude"], 85)
        self.assertEqual(result["decision_recommandee"], "ACCEPTER")
        self.assertEqual(result["pricing"]["source"], "pricing_engine")
        self.assertEqual(result["pricing"]["prix_min_fcfa"], 35000)
        self.assertEqual(result["pricing"]["prix_max_fcfa"], 50000)

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_ai_error_returns_fallback(self, mock_ai, mock_pricing):
        mock_ai.side_effect = Exception("API Error")
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        self.assertIn("R\u00c9SERVE", result["decision_recommandee"])
        self.assertEqual(result["pricing"]["source"], "pricing_engine")

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_creates_trace(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        self.assertEqual(result["statut_brief"], "exploitable")
        self.assertIn("contexte_client", result)

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_and_save_updates_brief(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        service.analyze_and_save(str(self.brief.id))

        self.brief.refresh_from_db()
        self.assertIsNotNone(self.brief.ai_analysis)
        self.assertEqual(self.brief.ai_analysis["statut_brief"], "exploitable")

    def test_unknown_brief_returns_fallback(self):
        service = BriefAnalystService()
        result = service.analyze("FAKE-9999")
        self.assertIn("R\u00c9SERVE", result["decision_recommandee"])
        self.assertIn("introuvable", result["raison_decision"])

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_ai_returns_client_fidelity(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        self.assertIn("contexte_client", result)
        self.assertIn("fidélité", result["contexte_client"])
        self.assertEqual(result["contexte_client"]["nb_projets_precedents"], 1)

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_pricing_comes_from_engine(self, mock_ai, mock_pricing):
        """Verifie que pricing.source est toujours pricing_engine, meme si l'IA dit le contraire."""
        mock_response = _mock_ai_response()
        parsed = json.loads(mock_response.content)
        parsed["pricing"]["source"] = "from_ai谎言"
        mock_response.content = json.dumps(parsed)
        mock_ai.return_value = mock_response
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        self.assertEqual(result["pricing"]["source"], "pricing_engine")

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_prompt_contains_pricing_engine_data(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        service.analyze(str(self.brief.id))

        call_args = mock_ai.call_args
        messages = call_args[0][0] if call_args[0] else call_args[1].get("messages", [])
        user_msg = [m for m in messages if m["role"] == "user"]
        self.assertTrue(len(user_msg) > 0)
        self.assertIn("Pricing Engine", user_msg[0]["content"])

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_analyze_pricing_overridden_by_engine(self, mock_ai, mock_pricing):
        """Prix de l'ecran est ecrase par le Pricing Engine."""
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = {"pricing": {
            "prix_min_fcfa": 99000,
            "prix_max_fcfa": 200000,
            "heures_min": 10,
            "heures_max": 20,
        }}

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        self.assertEqual(result["pricing"]["prix_min_fcfa"], 99000)
        self.assertEqual(result["pricing"]["prix_max_fcfa"], 200000)

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_trace_records_tokens_and_cost(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        from hadara_ai.models.trace import AIExecution
        executions = AIExecution.objects.all()
        self.assertTrue(executions.exists())
        trace = executions.first()
        self.assertEqual(trace.input_tokens, 1200)
        self.assertEqual(trace.output_tokens, 800)

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_trace_recorded_on_error(self, mock_ai, mock_pricing):
        mock_ai.side_effect = Exception("Boom")
        mock_pricing.return_value = _mock_pricing_data()

        service = BriefAnalystService()
        result = service.analyze(str(self.brief.id))

        from hadara_ai.models.trace import AIExecution
        executions = AIExecution.objects.all()
        self.assertTrue(executions.exists())
        trace = executions.first()
        self.assertEqual(trace.status, "error")


class BriefAnalyzeAPITest(TestCase):
    def setUp(self):
        self.client_obj = Client.objects.create(
            name="Test Client",
            organization="Hadara Corp",
            whatsapp="+221770000000",
            email="test@hadara.sn",
        )
        self.brief = Brief.objects.create(
            client=self.client_obj,
            project_type="Identite visuelle",
            context_description="Startup tech",
            primary_objective="Creer un logo",
            target_audience="Jeunes urbains",
        )
        from django.core.signing import TimestampSigner
        signer = TimestampSigner()
        self.admin_token = signer.sign("admin_user")

    def test_requires_auth(self):
        url = reverse("ai-brief-analyze", kwargs={"brief_id": str(self.brief.id)})
        resp = self.client.post(url)
        self.assertIn(resp.status_code, [401, 403])

    @patch("hadara_ai.agents.brief_analyst_service.pricing_calculate")
    @patch("hadara_ai.agents.brief_analyst_service.get_ai_response")
    def test_returns_analysis(self, mock_ai, mock_pricing):
        mock_ai.return_value = _mock_ai_response()
        mock_pricing.return_value = _mock_pricing_data()

        url = reverse("ai-brief-analyze", kwargs={"brief_id": str(self.brief.id)})
        resp = self.client.post(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.admin_token}",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["statut_brief"], "exploitable")
        self.assertEqual(resp.data["pricing"]["source"], "pricing_engine")

    def test_unknown_brief_returns_error(self):
        url = reverse("ai-brief-analyze", kwargs={"brief_id": "FAKE-9999"})
        resp = self.client.post(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.admin_token}",
        )
        self.assertIn(resp.status_code, [400, 404, 503])


class BriefAnalystPromptTest(TestCase):
    def test_system_prompt_enforces_json_only(self):
        self.assertIn("UNIQUEMENT avec un objet JSON", BRIEF_ANALYST_SYSTEM_PROMPT)
        self.assertIn("pricing.source", BRIEF_ANALYST_SYSTEM_PROMPT)
        self.assertIn("pricing_engine", BRIEF_ANALYST_SYSTEM_PROMPT)

    def test_system_prompt_defines_all_fields(self):
        for field in [
            "statut_brief", "score_completude", "complexite_percue",
            "decision_recommandee", "raison_decision", "informations_manquantes",
            "questions_client", "risques", "niveau_priorite",
            "brouillon_whatsapp", "pricing", "contexte_client",
        ]:
            self.assertIn(field, BRIEF_ANALYST_SYSTEM_PROMPT)

    def test_system_prompt_defines_statut_values(self):
        self.assertIn("exploitable", BRIEF_ANALYST_SYSTEM_PROMPT)
        self.assertIn("incomplet", BRIEF_ANALYST_SYSTEM_PROMPT)
        self.assertIn("refuser", BRIEF_ANALYST_SYSTEM_PROMPT)

    def test_system_prompt_defines_decision_values(self):
        self.assertIn("ACCEPTER", BRIEF_ANALYST_SYSTEM_PROMPT)
        self.assertIn("CLARIFIER", BRIEF_ANALYST_SYSTEM_PROMPT)
        self.assertIn("REFUSER", BRIEF_ANALYST_SYSTEM_PROMPT)

    def test_system_prompt_no_modification_rule(self):
        self.assertIn("JAMAIS les modifier", BRIEF_ANALYST_SYSTEM_PROMPT)
