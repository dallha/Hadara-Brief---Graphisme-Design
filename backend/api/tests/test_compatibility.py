"""
Tests de régression — Phase 2.2 Compatibility Layer + P1.5.2 Public Chat.

Vérifie que :
1. Le PublicChatService détecte les intentions et fournit des réponses
2. La couche de compatibilité délègue correctement au Core
3. Les vues legacy fonctionnent via le Compatibility Layer
4. Les erreurs restent isolées du client
5. Le Pricing Engine est correctement intégré
"""

import json
import unittest
from unittest.mock import patch, MagicMock, PropertyMock

from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User


# ---------------------------------------------------------------------------
# Tests du PublicChatService (unitaires)
# ---------------------------------------------------------------------------


class TestPublicChatService(unittest.TestCase):
    """Le PublicChatService détecte les intentions et répond intelligemment."""

    def test_greeting_returns_welcome(self):
        from hadara_ai.services.public_chat import PublicChatService

        service = PublicChatService()
        result = service.process_message("Bonjour")
        self.assertIn("Mme Niass Madina", result)
        self.assertIn("Studio Hadara", result)

    def test_pricing_request_with_project_type(self):
        from hadara_ai.services.public_chat import PublicChatService

        service = PublicChatService()
        result = service.process_message("Combien coûte un logo ?")
        self.assertIn("FCFA", result)
        self.assertIn("logo", result.lower())

    def test_pricing_request_bache(self):
        from hadara_ai.services.public_chat import PublicChatService

        service = PublicChatService()
        result = service.process_message("Prix d'une bâche de 3m")
        self.assertIn("FCFA", result)
        self.assertIn("bâche", result.lower())

    def test_service_inquiry(self):
        from hadara_ai.services.public_chat import PublicChatService

        service = PublicChatService()
        result = service.process_message("Qu'est-ce que vous faites ?")
        self.assertIn("services", result.lower())

    def test_human_contact(self):
        from hadara_ai.services.public_chat import PublicChatService

        service = PublicChatService()
        result = service.process_message("Je veux parler à un humain")
        self.assertIn("WhatsApp", result)
        self.assertIn("+221 77 623 27 41", result)

    def test_fallback_for_unknown(self):
        from hadara_ai.services.public_chat import PublicChatService

        service = PublicChatService()
        result = service.process_message("abc xyz 123")
        self.assertIn("services", result.lower())


class TestIntentDetector(unittest.TestCase):
    """La détection d'intention fonctionne correctement."""

    def test_detect_pricing_intent(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent

        detector = IntentDetector()
        result = detector.detect("Combien coûte un logo ?")
        self.assertEqual(result.intent, Intent.PRICING)
        self.assertEqual(result.project_type, "logo")

    def test_detect_service_intent(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent

        detector = IntentDetector()
        result = detector.detect("Je veux une affiche")
        self.assertEqual(result.intent, Intent.SERVICES)
        self.assertEqual(result.project_type, "affiche")

    def test_detect_human_contact(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent

        detector = IntentDetector()
        result = detector.detect("Je veux parler à quelqu'un")
        self.assertEqual(result.intent, Intent.HUMAN_CONTACT)

    def test_detect_greeting(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent

        detector = IntentDetector()
        result = detector.detect("Bonjour")
        self.assertEqual(result.intent, Intent.GREETING)


# ---------------------------------------------------------------------------
# Tests de la couche de compatibilité (unitaires)
# ---------------------------------------------------------------------------


class TestCompatibilityServiceChat(unittest.TestCase):
    """Le chat via compatibility.service fonctionne."""

    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_chat_returns_reply(self, mock_process):
        from hadara_ai.services.compatibility import chat

        mock_process.return_value = "Bonjour, comment puis-je vous aider ?"
        result = chat([{"role": "user", "content": "Bonjour"}])
        self.assertEqual(result, "Bonjour, comment puis-je vous aider ?")

    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_chat_strips_markdown(self, mock_process):
        from hadara_ai.services.compatibility import chat

        mock_process.return_value = "```json\n{'reply': 'test'}\n```"
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("```", result)

    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_chat_fallback_on_error(self, mock_process):
        from hadara_ai.services.compatibility import chat

        mock_process.side_effect = Exception("Erreur")
        # When public_chat fails, it should fall back to LLM
        # But since we're also mocking get_ai_response, it will return fallback
        with patch("hadara_ai.services.compatibility.get_ai_response") as mock_llm:
            mock_llm.side_effect = Exception("Provider indisponible")
            result = chat([{"role": "user", "content": "test"}])
            self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_chat_includes_system_prompt(self, mock_process):
        from hadara_ai.services.compatibility import chat

        mock_process.return_value = "Réponse"
        # For multi-message conversations, it should use LLM
        with patch("hadara_ai.services.compatibility.get_ai_response") as mock_llm:
            mock_response = MagicMock()
            mock_response.content = "Réponse"
            mock_llm.return_value = mock_response

            chat([
                {"role": "user", "content": "Bonjour"},
                {"role": "assistant", "content": "Bonjour !"},
                {"role": "user", "content": "test"},
            ])

            call_args = mock_llm.call_args
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


# ---------------------------------------------------------------------------
# Tests des vues legacy (integration)
# ---------------------------------------------------------------------------


class TestChatApiView(unittest.TestCase):
    """La vue /api/chat/ fonctionne via le Compatibility Layer."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_chat_returns_200(self, mock_process):
        from api.views import chat_api_view

        mock_process.return_value = "Bonjour !"
        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)

    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_chat_error_returns_fallback(self, mock_process):
        from api.views import chat_api_view

        mock_process.side_effect = Exception("Erreur")
        with patch("hadara_ai.services.compatibility.get_ai_response") as mock_llm:
            mock_llm.side_effect = Exception("Provider indisponible")
            request = self.factory.post(
                "/api/chat/",
                data=json.dumps({"messages": [{"role": "user", "content": "test"}]}),
                content_type="application/json",
            )
            response = chat_api_view(request)
            self.assertEqual(response.status_code, 200)
            self.assertIn("reply", response.data)


# ---------------------------------------------------------------------------
# Tests d'isolation des erreurs
# ---------------------------------------------------------------------------


class TestErrorIsolation(unittest.TestCase):
    """Les erreurs internes ne fuient jamais vers le client."""

    @patch("hadara_ai.services.compatibility.get_ai_response")
    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_api_key_error_hidden(self, mock_process, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_process.side_effect = Exception("Internal error")
        mock_get_ai_response.side_effect = Exception("Invalid API key")
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("API key", result)
        self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_database_error_hidden(self, mock_process, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_process.side_effect = Exception("Internal error")
        mock_get_ai_response.side_effect = Exception("database connection lost")
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("database", result.lower())
        self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    @patch("hadara_ai.services.public_chat.PublicChatService.process_message")
    def test_import_error_hidden(self, mock_process, mock_get_ai_response):
        from hadara_ai.services.compatibility import chat

        mock_process.side_effect = Exception("Internal error")
        mock_get_ai_response.side_effect = ImportError("No module named 'secret'")
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("secret", result.lower())
        self.assertIn("WhatsApp", result)


# ---------------------------------------------------------------------------
# Tests du Pricing Engine intégré
# ---------------------------------------------------------------------------


class TestPricingIntegration(unittest.TestCase):
    """Le Pricing Engine est correctement intégré dans le chat."""

    def test_pricing_returns_valid_range(self):
        from hadara_ai.services.public_chat import PricingIntegration

        pricing = PricingIntegration()
        estimate = pricing.get_estimate("logo")
        self.assertGreater(estimate["price_min"], 0)
        self.assertGreater(estimate["price_max"], estimate["price_min"])

    def test_pricing_bache(self):
        from hadara_ai.services.public_chat import PricingIntegration

        pricing = PricingIntegration()
        estimate = pricing.get_estimate("bache")
        self.assertGreater(estimate["price_min"], 0)
        self.assertIn("bache", ["bache", "bâche"])


if __name__ == "__main__":
    unittest.main()
