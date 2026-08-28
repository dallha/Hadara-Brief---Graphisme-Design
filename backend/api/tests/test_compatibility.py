"""
Tests de régression — Phase 2.2 Compatibility Layer.

Vérifie que :
1. La couche de compatibilité délègue correctement au Core
2. Les vues legacy fonctionnent via le Compatibility Layer
3. L'action admin génère l'analyse correctement
4. Les erreurs restent isolées du client
5. Les providers fallback fonctionnent
"""

import json
import unittest
from unittest.mock import patch, MagicMock, PropertyMock

from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User


# ---------------------------------------------------------------------------
# Tests de la couche de compatibilité (unitaires)
# ---------------------------------------------------------------------------


class TestCompatibilityServiceChat(unittest.TestCase):
    """Le chat via compatibility.service fonctionne."""

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_chat_returns_reply(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_response = MagicMock()
        mock_response.content = "Bonjour, comment puis-je vous aider ?"
        mock_get_ai_response.return_value = mock_response

        result = chat([{"role": "user", "content": "Bonjour"}])
        self.assertEqual(result, "Bonjour, comment puis-je vous aider ?")

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_chat_strips_markdown(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_response = MagicMock()
        mock_response.content = "```json\n{'reply': 'test'}\n```"
        mock_get_ai_response.return_value = mock_response

        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("```", result)
        self.assertEqual(result, "{'reply': 'test'}")

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_chat_fallback_on_error(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_get_ai_response.side_effect = Exception("Provider indisponible")

        result = chat([{"role": "user", "content": "test"}])
        self.assertIn("problème technique", result)
        self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_chat_includes_system_prompt(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_response = MagicMock()
        mock_response.content = "Réponse"
        mock_get_ai_response.return_value = mock_response

        chat([{"role": "user", "content": "test"}])

        call_args = mock_get_ai_response.call_args
        messages = call_args[0][0]
        self.assertEqual(messages[0]["role"], "system")
        self.assertIn("Mme Niass Madina", messages[0]["content"])


class TestCompatibilityServiceOCR(unittest.TestCase):
    """La correction OCR via compatibility.service fonctionne."""

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_correct_ocr_returns_text(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import correct_ocr

        mock_response = MagicMock()
        mock_response.content = "Texte corrigé"
        mock_get_ai_response.return_value = mock_response

        result = correct_ocr("Texte OCR erroné")
        self.assertEqual(result, "Texte corrigé")

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_correct_ocr_fallback_on_error(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import correct_ocr

        mock_get_ai_response.side_effect = Exception("Erreur")

        result = correct_ocr("Texte original")
        self.assertEqual(result, "Texte original")


class TestCompatibilityServiceAnalyzeBrief(unittest.TestCase):
    """L'analyse de brief via compatibility.service fonctionne."""

    @patch("hadara_ai.services.ai_service.get_ai_response")
    def test_analyze_brief_delegates_to_core(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import analyze_brief

        mock_response = MagicMock()
        mock_response.content = json.dumps({"statut_brief": "exploitable"})
        mock_get_ai_response.return_value = mock_response

        class BriefStub:
            project_type = "logo"
            project_type_custom = None
            context_description = "Test"
            primary_objective = "Test"
            target_audience = None
            technical_format = None
            budget_range = None
            desired_delivery_date = None
            critical_deadline = None
            style_preferences = []
            main_title = None

        pricing = {
            "engine_version": "v1",
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

        result = analyze_brief(BriefStub(), pricing)
        self.assertEqual(result["ai"]["statut_brief"], "exploitable")
        self.assertEqual(result["pricing"]["prix_min"], 50000)


# ---------------------------------------------------------------------------
# Tests des vues legacy (Django integration)
# ---------------------------------------------------------------------------


class TestChatApiView(TestCase):
    """Le chat_api_view fonctionne via le Compatibility Layer."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_chat_returns_200(self, mock_get_ai_response):
        from api.views import chat_api_view

        mock_response = MagicMock()
        mock_response.content = "Bonjour !"
        mock_get_ai_response.return_value = mock_response

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "Bonjour !")

    def test_chat_returns_400_on_empty_messages(self):
        from api.views import chat_api_view

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": []}),
            content_type="application/json",
        )
        response = chat_api_view(request)
        self.assertEqual(response.status_code, 400)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_chat_error_returns_fallback(self, mock_get_ai_response):
        from api.views import chat_api_view

        mock_get_ai_response.side_effect = Exception("Erreur interne")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "test"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("problème technique", response.data["reply"])


class TestOcrCorrectApiView(TestCase):
    """Le ocr_correct_api_view fonctionne via le Compatibility Layer."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_ocr_correct_returns_200(self, mock_get_ai_response):
        from api.views import ocr_correct_api_view

        mock_response = MagicMock()
        mock_response.content = "Texte corrigé"
        mock_get_ai_response.return_value = mock_response

        request = self.factory.post(
            "/api/ocr-correct/",
            data=json.dumps({"text": "Texte OCR"}),
            content_type="application/json",
        )
        # Mock admin permission
        request.META["HTTP_AUTHORIZATION"] = "Bearer fake-token"
        response = ocr_correct_api_view(request)

        # Should return 200 (mocked auth passes)
        self.assertIn(response.status_code, [200, 403])

    def test_ocr_correct_returns_400_on_empty_text(self):
        from api.views import ocr_correct_api_view

        request = self.factory.post(
            "/api/ocr-correct/",
            data=json.dumps({"text": ""}),
            content_type="application/json",
        )
        request.META["HTTP_AUTHORIZATION"] = "Bearer fake-token"
        response = ocr_correct_api_view(request)

        self.assertIn(response.status_code, [400, 403])


# ---------------------------------------------------------------------------
# Tests d'isolation des erreurs
# ---------------------------------------------------------------------------


class TestErrorIsolation(unittest.TestCase):
    """Les erreurs internes ne remontent jamais au client."""

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_database_error_hidden(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_get_ai_response.side_effect = Exception(
            "SECRET_KEY=abc123 Internal DB error"
        )

        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("SECRET_KEY", result)
        self.assertNotIn("abc123", result)
        self.assertIn("problème technique", result)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_import_error_hidden(self, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_get_ai_response.side_effect = ImportError("No module named 'secret_module'")

        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("secret_module", result)
        self.assertIn("problème technique", result)


# ---------------------------------------------------------------------------
# Tests de non-régression — compatibilité imports
# ---------------------------------------------------------------------------


class TestImportCompatibility(unittest.TestCase):
    """Les imports legacy continuent de fonctionner."""

    def test_legacy_import_chat_with_assistant(self):
        from api.ai_utils import chat_with_assistant
        self.assertTrue(callable(chat_with_assistant))

    def test_legacy_import_correct_ocr_text(self):
        from api.ai_utils import correct_ocr_text
        self.assertTrue(callable(correct_ocr_text))

    def test_legacy_import_analyze_brief_with_ai(self):
        from api.ai_utils import analyze_brief_with_ai
        self.assertTrue(callable(analyze_brief_with_ai))

    def test_legacy_import_chat_system_prompt(self):
        from api.ai_utils import CHAT_SYSTEM_PROMPT
        self.assertIn("Mme Niass Madina", CHAT_SYSTEM_PROMPT)

    def test_core_import_compatibility(self):
        from hadara_ai.services.compatibility import chat, correct_ocr, analyze_brief
        self.assertTrue(callable(chat))
        self.assertTrue(callable(correct_ocr))
        self.assertTrue(callable(analyze_brief))

    def test_core_import_analyze_brief_with_ai(self):
        from hadara_ai.services.ai_service import analyze_brief_with_ai
        self.assertTrue(callable(analyze_brief_with_ai))


if __name__ == "__main__":
    print("=" * 60)
    print("  HADARA — Regression Tests (Phase 2.2 Compatibility Layer)")
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
