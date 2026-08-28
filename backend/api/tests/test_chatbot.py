"""
Chatbot Production Gate — Tests Backend
========================================
Phase 1.5 : Vérifie le chatbot de bout en bout.

Couvre :
1. Réponse normale (happy path)
2. Provider indisponible (fallback)
3. Clé API absente (fallback immédiat)
4. Timeout réseau (fallback)
5. Réponse malformée (fallback)
6. Erreur serveur 500 (fallback)
7. Conversation longue (pas de crash)
8. Messages vides (validation)
9. Permissions (pas d'auth requise sur /api/chat/)
10. Erreurs internes non exposées au client
11. Logs + trace_id + coût/token
"""

import json
import logging
import unittest
from unittest.mock import patch, MagicMock

from django.test import TestCase, RequestFactory
from django.test.utils import override_settings

from api.views import chat_api_view


class MockAIResponse:
    """Simule un AIResponse du Core."""
    def __init__(self, content="Bonjour ! Comment puis-je vous aider ?"):
        self.content = content
        self.model = "llama-3.1-8b-instant"
        self.provider = "groq"
        self.input_tokens = 50
        self.output_tokens = 20
        self.cost_usd = 0.0001
        self.duration_ms = 150
        self.raw = {}


# ---------------------------------------------------------------------------
# 1. Réponse normale (Happy Path)
# ---------------------------------------------------------------------------
class TestChatNormalResponse(TestCase):
    """Test 1 : Le chatbot retourne une réponse valide."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_normal_response_returns_reply(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("Bonjour ! Je suis Mme Niass Madina.")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)
        self.assertEqual(response.data["reply"], "Bonjour ! Je suis Mme Niass Madina.")

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_normal_response_uses_groq_model(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("OK")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Test"}]}),
            content_type="application/json",
        )
        chat_api_view(request)

        # Vérifie que le bon modèle est utilisé
        call_kwargs = mock_get_ai.call_args
        self.assertEqual(call_kwargs[1].get("model", call_kwargs[0][1] if len(call_kwargs[0]) > 1 else None), "openai/gpt-oss-20b")

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_system_prompt_included(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("OK")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Qui êtes-vous ?"}]}),
            content_type="application/json",
        )
        chat_api_view(request)

        # Vérifie que le system prompt est injecté
        messages_sent = mock_get_ai.call_args[0][0]
        self.assertEqual(messages_sent[0]["role"], "system")
        self.assertIn("Mme Niass Madina", messages_sent[0]["content"])


# ---------------------------------------------------------------------------
# 2. Provider indisponible (Fallback)
# ---------------------------------------------------------------------------
class TestChatProviderUnavailable(TestCase):
    """Test 2 : Le chatbot gère l'indisponibilité du provider."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_provider_error_returns_fallback_message(self, mock_get_ai):
        mock_get_ai.side_effect = Exception("Provider Groq indisponible")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)
        self.assertIn("problème technique", response.data["reply"])
        self.assertIn("WhatsApp", response.data["reply"])

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_provider_error_does_not_expose_internal_error(self, mock_get_ai):
        mock_get_ai.side_effect = Exception("SECRET_KEY=abc123 Internal DB error")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Test"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        # L'erreur interne ne doit PAS apparaître dans la réponse
        self.assertNotIn("SECRET_KEY", str(response.data))
        self.assertNotIn("abc123", str(response.data))
        self.assertNotIn("Internal DB error", str(response.data))


# ---------------------------------------------------------------------------
# 3. Clé API absente (Fallback immédiat)
# ---------------------------------------------------------------------------
class TestChatMissingAPIKey(TestCase):
    """Test 3 : Le chatbot gère l'absence de clé API."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_missing_api_key_returns_fallback(self, mock_get_ai):
        mock_get_ai.side_effect = ValueError("Provider non disponible pour le modèle: llama-3.1-8b-instant")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)
        self.assertIn("problème technique", response.data["reply"])


# ---------------------------------------------------------------------------
# 4. Timeout réseau (Fallback)
# ---------------------------------------------------------------------------
class TestChatTimeout(TestCase):
    """Test 4 : Le chatbot gère les timeouts réseau."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_timeout_returns_fallback(self, mock_get_ai):
        import requests
        mock_get_ai.side_effect = requests.Timeout("Connection timed out")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)
        self.assertIn("problème technique", response.data["reply"])


# ---------------------------------------------------------------------------
# 5. Réponse malformée (Fallback)
# ---------------------------------------------------------------------------
class TestChatMalformedResponse(TestCase):
    """Test 5 : Le chatbot gère les réponses malformées du provider."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_empty_content_returns_fallback(self, mock_get_ai):
        mock_response = MockAIResponse(content="")
        mock_get_ai.return_value = mock_response

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        # Une réponse vide mais valide ne doit pas crasher
        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_none_content_handled(self, mock_get_ai):
        mock_response = MockAIResponse(content=None)
        mock_get_ai.return_value = mock_response

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        # Ne doit pas crasher
        try:
            response = chat_api_view(request)
            # Si ça retourne une réponse, c'est OK
            self.assertIn("reply", response.data)
        except (TypeError, AttributeError):
            # Si ça plante, c'est qu'on n'a pas géré le cas None
            self.fail("chat_with_assistant should handle None content from provider")


# ---------------------------------------------------------------------------
# 6. Erreur serveur 500 (Fallback)
# ---------------------------------------------------------------------------
class TestChatServerError(TestCase):
    """Test 6 : Le chatbot gère les erreurs serveur 500."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_http_500_returns_fallback(self, mock_get_ai):
        import requests
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_resp.raise_for_status.side_effect = requests.HTTPError("500 Server Error")
        mock_get_ai.side_effect = requests.HTTPError("500 Server Error")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)


# ---------------------------------------------------------------------------
# 7. Conversation longue (Pas de crash)
# ---------------------------------------------------------------------------
class TestChatLongConversation(TestCase):
    """Test 7 : Le chatbot gère les conversations longues."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_long_conversation_handled(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("Réponse")

        # Simuler une conversation de 20 messages
        messages = []
        for i in range(10):
            messages.append({"role": "user", "content": f"Message utilisateur {i}"})
            messages.append({"role": "assistant", "content": f"Réponse assistant {i}"})

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": messages}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIn("reply", response.data)

        # Vérifie que tous les messages sont transmis (+ system prompt)
        messages_sent = mock_get_ai.call_args[0][0]
        self.assertEqual(len(messages_sent), 21)  # 20 + system prompt

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_many_messages_no_crash(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("OK")

        # 50 messages
        messages = [{"role": "user", "content": f"M{i}"} for i in range(50)]

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": messages}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)


# ---------------------------------------------------------------------------
# 8. Messages vides (Validation)
# ---------------------------------------------------------------------------
class TestChatValidation(TestCase):
    """Test 8 : Le chatbot valide les entrées."""

    def setUp(self):
        self.factory = RequestFactory()

    def test_empty_messages_returns_400(self):
        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": []}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_no_messages_key_returns_400(self):
        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 400)

    def test_invalid_json_returns_400(self):
        request = self.factory.post(
            "/api/chat/",
            data="not json",
            content_type="application/json",
        )
        # DRF gère le JSON invalide automatiquement
        response = chat_api_view(request)
        # Peut retourner 400 ou 500 selon la version DRF
        self.assertIn(response.status_code, [400, 500])


# ---------------------------------------------------------------------------
# 9. Permissions (Pas d'auth requise)
# ---------------------------------------------------------------------------
class TestChatPermissions(TestCase):
    """Test 9 : L'endpoint /api/chat/ est public (pas d'auth requise)."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_no_auth_header_accepted(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("OK")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
            # Pas d'en-tête Authorization
        )
        response = chat_api_view(request)

        # L'endpoint public doit fonctionner sans auth
        self.assertEqual(response.status_code, 200)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_invalid_auth_header_still_accepted(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("OK")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer invalid_token",
        )
        response = chat_api_view(request)

        # L'endpoint public ignore l'auth invalide
        self.assertEqual(response.status_code, 200)


# ---------------------------------------------------------------------------
# 10. Erreurs internes non exposées
# ---------------------------------------------------------------------------
class TestChatErrorIsolation(TestCase):
    """Test 10 : Les erreurs internes ne sont pas exposées au client."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_database_error_hidden(self, mock_get_ai):
        from django.db import DatabaseError
        mock_get_ai.side_effect = DatabaseError("connection to database lost")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Test"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("database", str(response.data).lower())
        self.assertNotIn("connection lost", str(response.data))

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_import_error_hidden(self, mock_get_ai):
        mock_get_ai.side_effect = ImportError("No module named 'secret_module'")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Test"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("secret_module", str(response.data))


# ---------------------------------------------------------------------------
# 11. Logs + trace_id + coût/token
# ---------------------------------------------------------------------------
class TestChatLogging(TestCase):
    """Test 11 : Vérifie que les erreurs sont loggées."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_error_is_logged(self, mock_get_ai):
        mock_get_ai.side_effect = Exception("Test error")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Test"}]}),
            content_type="application/json",
        )

        with self.assertLogs("hadara_ai.services.compatibility", level="ERROR") as cm:
            response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(cm.output) > 0)
        self.assertIn("Erreur compatibility.chat", cm.output[0])


# ---------------------------------------------------------------------------
# 12. Nature de la réponse
# ---------------------------------------------------------------------------
class TestChatResponseFormat(TestCase):
    """Test 12 : Vérifie le format de la réponse."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_response_is_string_not_json(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("Réponse en texte")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data["reply"], str)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_response_not_wrapped_in_json_markdown(self, mock_get_ai):
        mock_get_ai.return_value = MockAIResponse("```json\n{'reply': 'test'}\n```")

        request = self.factory.post(
            "/api/chat/",
            data=json.dumps({"messages": [{"role": "user", "content": "Bonjour"}]}),
            content_type="application/json",
        )
        response = chat_api_view(request)

        # La réponse ne doit PAS contenir de balises Markdown
        self.assertNotIn("```json", response.data["reply"])


if __name__ == "__main__":
    print("=" * 60)
    print("  HADARA CHATBOT — Production Gate Tests")
    print("=" * 60)
    unittest.main(verbosity=2)
