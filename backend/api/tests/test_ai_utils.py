"""
Tests de la couche IA — AI-Safe, robustesse JSON, fallback provider.

Ces tests vérifient `analyze_brief_with_ai` depuis le Core (`hadara_ai.services.ai_service`)
et la couche de compatibilité (`api.ai_utils`).
"""

import json
import unittest
from unittest.mock import patch, MagicMock

from hadara_ai.services.ai_service import analyze_brief_with_ai
from hadara_ai.services.ai_service import get_ai_response
from api.ai_utils import analyze_brief_with_ai as compat_analyze_brief


class BriefStub:
    def __init__(self, **kwargs):
        self.project_type = kwargs.get("project_type", "logo")
        self.project_type_custom = kwargs.get("project_type_custom")
        self.context_description = kwargs.get("context_description", "Test context")
        self.primary_objective = kwargs.get("primary_objective", "Test obj")
        self.target_audience = kwargs.get("target_audience")
        self.technical_format = kwargs.get("technical_format")
        self.budget_range = kwargs.get("budget_range")
        self.desired_delivery_date = kwargs.get("desired_delivery_date")
        self.critical_deadline = kwargs.get("critical_deadline")
        self.style_preferences = kwargs.get("style_preferences", [])
        self.main_title = kwargs.get("main_title")
        self.deliverable_versions = kwargs.get("deliverable_versions", [])

        # PII — must NOT be sent to AI
        self.client_name = kwargs.get("client_name", "Monsieur Secret")
        self.organization = kwargs.get("organization", "Secret Corp")
        self.whatsapp = kwargs.get("whatsapp", "+221 77 123 45 67")
        self.email = kwargs.get("email", "secret@test.com")
        self.city_country = kwargs.get("city_country", "Dakar, Sénégal")


class TestAISafeStripsPII(unittest.TestCase):
    """Les données personnelles ne doivent PAS être envoyées au provider."""

    def setUp(self):
        self.pricing_result = {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": 50000,
            "prix_max_fcfa": 80000,
            "heures_min": 4,
            "heures_max": 8,
            "delai_min_jours": 2,
            "delai_max_jours": 5,
            "score_complexite": 6,
            "score_completude": 80,
            "acompte_conseille": 25000,
        }

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_pii_stripped_from_payload(self, mock_get_ai_response):
        """Vérifie que nom, email, tél ne sont pas dans le prompt envoyé."""
        mock_response = MagicMock()
        mock_response.content = json.dumps({"statut_brief": "exploitable"})
        mock_get_ai_response.return_value = mock_response

        brief = BriefStub()
        analyze_brief_with_ai(brief, self.pricing_result)

        # get_ai_response doit être appelé
        self.assertTrue(mock_get_ai_response.called)
        call_args = mock_get_ai_response.call_args
        messages = call_args[0][0]
        user_content = messages[1]["content"]

        # PII ne doit PAS apparaître
        self.assertNotIn("Monsieur Secret", user_content)
        self.assertNotIn("Secret Corp", user_content)
        self.assertNotIn("+221 77 123 45 67", user_content)
        self.assertNotIn("secret@test.com", user_content)

        # Mais les données du projet doivent être là
        self.assertIn("Test context", user_content)


class TestPricingEngineRespected(unittest.TestCase):
    """Le Pricing Engine est la source de vérité pour les prix."""

    def setUp(self):
        self.pricing_result = {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": 50000,
            "prix_max_fcfa": 80000,
            "heures_min": 4,
            "heures_max": 8,
            "delai_min_jours": 2,
            "delai_max_jours": 5,
            "score_complexite": 6,
            "score_completude": 80,
            "acompte_conseille": 25000,
        }

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_pricing_in_payload(self, mock_get_ai_response):
        mock_response = MagicMock()
        mock_response.content = json.dumps({"statut_brief": "exploitable"})
        mock_get_ai_response.return_value = mock_response

        brief = BriefStub()
        analyze_brief_with_ai(brief, self.pricing_result)

        call_args = mock_get_ai_response.call_args
        messages = call_args[0][0]
        user_content = messages[1]["content"]

        self.assertIn("50000", user_content)
        self.assertIn("80000", user_content)
        self.assertIn("SOURCE DE VÉRITÉ, NE PAS MODIFIER", user_content)


class TestProviderFallback(unittest.TestCase):
    """En cas de panne provider, le fallback doit fonctionner."""

    def setUp(self):
        self.pricing_result = {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": 50000,
            "prix_max_fcfa": 80000,
            "heures_min": 4,
            "heures_max": 8,
            "delai_min_jours": 2,
            "delai_max_jours": 5,
            "score_complexite": 6,
            "score_completude": 80,
            "acompte_conseille": 25000,
        }

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_timeout_fallback(self, mock_get_ai_response):
        mock_get_ai_response.side_effect = Exception("Connection timed out")

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertIsNotNone(res["ai"])
        self.assertEqual(res["ai"]["statut_brief"], "exploitable_sous_reserve")
        # Pricing must be preserved
        self.assertEqual(res["pricing"]["prix_min"], 50000)

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_invalid_json_fallback(self, mock_get_ai_response):
        mock_response = MagicMock()
        mock_response.content = "Voici mon analyse, je ne suis pas un JSON"
        mock_get_ai_response.return_value = mock_response

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertEqual(res["ai"]["statut_brief"], "exploitable_sous_reserve")
        self.assertIn("indisponible", res["ai"]["raison_decision"])

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_http_error_fallback(self, mock_get_ai_response):
        mock_get_ai_response.side_effect = Exception("500 Server Error")

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertEqual(res["ai"]["statut_brief"], "exploitable_sous_reserve")
        self.assertIn("indisponible", res["ai"]["raison_decision"])

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_empty_brief_no_crash(self, mock_get_ai_response):
        mock_response = MagicMock()
        mock_response.content = json.dumps({"statut_brief": "incomplet"})
        mock_get_ai_response.return_value = mock_response

        class EmptyBrief:
            project_type = None
            project_type_custom = None
            context_description = None
            primary_objective = None
            target_audience = None
            technical_format = None
            budget_range = None
            desired_delivery_date = None
            critical_deadline = None
            style_preferences = None
            main_title = None
            deliverable_versions = None

        brief = EmptyBrief()
        res = analyze_brief_with_ai(brief, self.pricing_result)
        self.assertEqual(res["ai"]["statut_brief"], "incomplet")


class TestValidResponse(unittest.TestCase):
    """Une réponse valide est correctement mergée."""

    def setUp(self):
        self.pricing_result = {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": 50000,
            "prix_max_fcfa": 80000,
            "heures_min": 4,
            "heures_max": 8,
            "delai_min_jours": 2,
            "delai_max_jours": 5,
            "score_complexite": 6,
            "score_completude": 80,
            "acompte_conseille": 25000,
        }

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_valid_response_merged(self, mock_get_ai_response):
        valid_ai = {
            "statut_brief": "exploitable",
            "score_completude": 95,
            "complexite_percue": 6,
            "decision_recommandee": "ACCEPTER",
            "raison_decision": "Tout est clair",
            "informations_manquantes": [],
            "questions_client": [],
            "risques": [],
            "niveau_priorite": "Normal",
            "brouillon_whatsapp": "Top, on lance ça !",
        }
        mock_response = MagicMock()
        mock_response.content = json.dumps(valid_ai)
        mock_get_ai_response.return_value = mock_response

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertEqual(res["ai"]["decision_recommandee"], "ACCEPTER")
        self.assertEqual(res["engine_version"], "pricing-v1.0")
        self.assertEqual(res["pricing"]["prix_min"], 50000)


class TestCompatibilityLayer(unittest.TestCase):
    """La couche de compatibilité `api.ai_utils` fonctionne correctement."""

    def setUp(self):
        self.pricing_result = {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": 50000,
            "prix_max_fcfa": 80000,
            "heures_min": 4,
            "heures_max": 8,
            "delai_min_jours": 2,
            "delai_max_jours": 5,
            "score_complexite": 6,
            "score_completude": 80,
            "acompte_conseille": 25000,
        }

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_compat_layer_delegates_to_core(self, mock_get_ai_response):
        """api.ai_utils.analyze_brief_with_ai délègue bien au Core."""
        mock_response = MagicMock()
        mock_response.content = json.dumps({"statut_brief": "exploitable"})
        mock_get_ai_response.return_value = mock_response

        brief = BriefStub()
        res = compat_analyze_brief(brief, self.pricing_result)

        self.assertTrue(mock_get_ai_response.called)
        self.assertEqual(res["ai"]["statut_brief"], "exploitable")


if __name__ == "__main__":
    print("=" * 60)
    print("  HADARA AI — Tests unitaires (Compatibility Layer)")
    print("=" * 60)
    loader = unittest.TestLoader()
    loader.sortTestMethodsUsing = None
    suite = loader.loadTestsFromModule(__import__(__name__))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print(f"  ALL {result.testsRun} TESTS PASSED")
    else:
        print(f"  FAILURES: {len(result.failures)}, ERRORS: {len(result.errors)}")
    print("=" * 60)
