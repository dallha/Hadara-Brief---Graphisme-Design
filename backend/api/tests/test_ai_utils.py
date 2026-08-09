"""
Tests de la couche IA (ai_utils.py).
Vérifie la protection des données (AI-Safe), la robustesse des JSON,
et la gestion des pannes Groq (fallback).
"""

import sys
import os
import json
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

import api.ai_utils as ai_utils
from api.ai_utils import analyze_brief_with_ai

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
        
        # PII
        self.client_name = kwargs.get("client_name", "Monsieur Secret")
        self.organization = kwargs.get("organization", "Secret Corp")
        self.whatsapp = kwargs.get("whatsapp", "+221 77 123 45 67")
        self.email = kwargs.get("email", "secret@test.com")
        self.city_country = kwargs.get("city_country", "Dakar, Sénégal")

class TestAIUtils(unittest.TestCase):
    
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
            "acompte_conseille": 25000
        }
        # Force a fake API key so it doesn't immediately fallback due to missing key
        self.original_api_key = ai_utils.GROQ_API_KEY
        ai_utils.GROQ_API_KEY = "test_fake_api_key"

    def tearDown(self):
        ai_utils.GROQ_API_KEY = self.original_api_key

    @patch("api.ai_utils.requests.post")
    def test_1_ai_safe_strips_pii(self, mock_post):
        """Les données personnelles ne doivent PAS être envoyées à Groq."""
        # Setup mock to return a valid JSON response
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": '{"statut_brief": "exploitable"}'}}]
        }
        mock_post.return_value = mock_resp

        brief = BriefStub()
        analyze_brief_with_ai(brief, self.pricing_result)

        # Vérifier le payload envoyé à requests.post
        self.assertTrue(mock_post.called)
        payload = mock_post.call_args[1]["json"]
        user_content = payload["messages"][1]["content"]

        # Le payload NE DOIT PAS contenir le nom, l'email, etc.
        self.assertNotIn("Monsieur Secret", user_content)
        self.assertNotIn("Secret Corp", user_content)
        self.assertNotIn("+221 77 123 45 67", user_content)
        self.assertNotIn("secret@test.com", user_content)
        
        # Mais il DOIT contenir les données du projet
        self.assertIn("Test context", user_content)
        print("\n✅ Test 1 — AI-Safe: PII (noms, emails, tél) correctement filtrés.")

    @patch("api.ai_utils.requests.post")
    def test_2_pricing_engine_respected(self, mock_post):
        """Le Pricing Engine doit être envoyé comme source de vérité à l'IA."""
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": '{"statut_brief": "exploitable"}'}}]
        }
        mock_post.return_value = mock_resp

        brief = BriefStub()
        analyze_brief_with_ai(brief, self.pricing_result)

        payload = mock_post.call_args[1]["json"]
        user_content = payload["messages"][1]["content"]

        # Le payload doit contenir les prix du pricing_result
        self.assertIn("50000", user_content)
        self.assertIn("80000", user_content)
        self.assertIn("SOURCE DE VÉRITÉ, NE PAS MODIFIER", user_content)
        print("\n✅ Test 2 — Pricing: Source de vérité transmise correctement au LLM.")

    @patch("api.ai_utils.requests.post")
    def test_3_groq_timeout_fallback(self, mock_post):
        """En cas de timeout réseau, on ne crashe pas, on fallback proprement."""
        import requests
        mock_post.side_effect = requests.Timeout("Connection timed out")

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertIsNotNone(res["ai"])
        self.assertEqual(res["ai"]["statut_brief"], "exploitable_sous_reserve")
        self.assertIn("Temps de réponse", res["ai"]["raison_decision"])
        
        # Vérifie que le pricing est bien conservé intact
        self.assertEqual(res["pricing"]["prix_min"], 50000)
        print("\n✅ Test 3 — Timeout Groq: Fallback fonctionnel, pas de crash.")

    @patch("api.ai_utils.requests.post")
    def test_4_groq_invalid_json_fallback(self, mock_post):
        """Si l'IA répond du blabla non JSON, on fallback proprement."""
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": "Voici mon analyse, je ne suis pas un JSON"}}]
        }
        mock_post.return_value = mock_resp

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertEqual(res["ai"]["statut_brief"], "exploitable_sous_reserve")
        self.assertIn("non-JSON", res["ai"]["raison_decision"])
        print("\n✅ Test 4 — Mauvais JSON Groq: Capturé et géré par le fallback.")

    @patch("api.ai_utils.requests.post")
    def test_5_groq_http_error_fallback(self, mock_post):
        """Si l'API retourne une erreur 500 ou 401, on fallback."""
        import requests
        mock_resp = MagicMock()
        mock_resp.raise_for_status.side_effect = requests.HTTPError("500 Server Error")
        mock_post.return_value = mock_resp

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertEqual(res["ai"]["statut_brief"], "exploitable_sous_reserve")
        self.assertIn("indisponible", res["ai"]["raison_decision"])
        print("\n✅ Test 5 — HTTP 500 Groq: Géré sans erreur bloquante.")

    def test_6_groq_missing_api_key(self):
        """Si la clé API n'est pas configurée, on fallback instantanément."""
        ai_utils.GROQ_API_KEY = "gsk_placeholder_key_remplacez_moi"
        
        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertIn("manquante", res["ai"]["raison_decision"])
        print("\n✅ Test 6 — Clé API manquante: Bypass réseau immédiat.")

    @patch("api.ai_utils.requests.post")
    def test_7_brief_vide_no_crash(self, mock_post):
        """Un brief vide ne doit pas faire crasher l'utilitaire."""
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": '{"statut_brief": "incomplet"}'}}]
        }
        mock_post.return_value = mock_resp

        # Brief totalement vide (None sur tous les champs)
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
        print("\n✅ Test 7 — Brief vide: Aucun plantage lors de l'anonymisation.")

    @patch("api.ai_utils.requests.post")
    def test_8_valid_groq_response(self, mock_post):
        """Une réponse valide est correctement mergée."""
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
            "brouillon_whatsapp": "Top, on lance ça !"
        }
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": json.dumps(valid_ai)}}]
        }
        mock_post.return_value = mock_resp

        brief = BriefStub()
        res = analyze_brief_with_ai(brief, self.pricing_result)

        self.assertEqual(res["ai"]["decision_recommandee"], "ACCEPTER")
        self.assertEqual(res["engine_version"], "pricing-v1.0")
        self.assertEqual(res["pricing"]["prix_min"], 50000)
        print("\n✅ Test 8 — Réponse valide: Modèle final structuré avec AI + Pricing.")


if __name__ == "__main__":
    print("=" * 60)
    print("  HADARA AI_UTILS — Tests unitaires")
    print("=" * 60)
    loader = unittest.TestLoader()
    loader.sortTestMethodsUsing = None
    suite = loader.loadTestsFromTestCase(TestAIUtils)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print(f"  ✅ {result.testsRun}/{result.testsRun} tests réussis")
    else:
        print(f"  ❌ {len(result.failures)} échec(s), {len(result.errors)} erreur(s)")
    print("=" * 60)
    sys.exit(0 if result.wasSuccessful() else 1)
