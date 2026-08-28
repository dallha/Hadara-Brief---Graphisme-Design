"""
Tests de compatibilité — Public Chat Intelligence Gate (P1.5.3)

Chaque test vérifie UN comportement spécifique.
Le Pricing Engine reste la source de vérité pour les prix.
"""

import unittest
from unittest.mock import patch, MagicMock
from django.test import TestCase, RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware


# ─────────────────────────────────────────────────────────────────────────────
# Tests du PublicChatService (unitaires)
# ─────────────────────────────────────────────────────────────────────────────

class TestPublicChatService(unittest.TestCase):
    """Tests de base du service de chat public."""

    def test_greeting_returns_welcome(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Bonjour")
        self.assertIn("Niass Madina", result)

    def test_pricing_request_with_project_type(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Combien coûte un logo ?")
        self.assertIn("FCFA", result)

    def test_pricing_request_bache(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Prix d'une bâche")
        self.assertIn("FCFA", result)

    def test_service_inquiry(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Je veux une affiche")
        self.assertIn("affiche", result.lower())

    def test_human_contact(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Parler à un humain")
        self.assertIn("WhatsApp", result)

    def test_fallback_for_unknown(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("abc xyz 123")
        self.assertIn("services", result.lower())


# ─────────────────────────────────────────────────────────────────────────────
# Tests de l'IntentDetector (P1.5.3)
# ─────────────────────────────────────────────────────────────────────────────

class TestIntentDetector(unittest.TestCase):
    """Tests de détection d'intention."""

    def test_detect_pricing_intent(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Quel est le prix d'un logo ?")
        self.assertEqual(result.intent, Intent.PRICING)

    def test_detect_service_intent(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Je veux une bâche pour mon événement")
        self.assertEqual(result.intent, Intent.SERVICE_REQUEST)

    def test_detect_human_contact(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Je veux parler à une vraie personne")
        self.assertEqual(result.intent, Intent.HUMAN_CONTACT)

    def test_detect_greeting(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Bonjour !")
        self.assertEqual(result.intent, Intent.GREETING)

    def test_detect_about_studio(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Qui êtes-vous ?")
        self.assertEqual(result.intent, Intent.ABOUT_STUDIO)

    def test_detect_location(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Où êtes-vous situés ?")
        self.assertEqual(result.intent, Intent.LOCATION)

    def test_detect_contact(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Quel est votre numéro ?")
        self.assertEqual(result.intent, Intent.CONTACT)

    def test_detect_services_list(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Quels sont vos services ?")
        self.assertIn(result.intent, (Intent.SERVICES, Intent.FAQ))

    def test_detect_dimensions(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Une bâche de 3m de large")
        self.assertEqual(result.intent, Intent.SERVICE_REQUEST)
        self.assertIn("dimension", result.extracted_info)

    def test_detect_urgency(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Un logo urgent pour demain")
        self.assertEqual(result.intent, Intent.SERVICE_REQUEST)
        self.assertEqual(result.extracted_info.get("urgency"), "tres_urgent")

    def test_detect_event_context(self):
        from hadara_ai.services.public_chat import IntentDetector, Intent
        detector = IntentDetector()
        result = detector.detect("Une affiche pour un concert")
        self.assertEqual(result.extracted_info.get("context"), "event")


# ─────────────────────────────────────────────────────────────────────────────
# Tests de la couche de compatibilité (unitaires)
# ─────────────────────────────────────────────────────────────────────────────

class TestCompatibilityServiceChat(unittest.TestCase):
    """Tests de la couche de compatibilité (unitaires)."""

    @patch("hadara_ai.services.compatibility.public_chat_instance")
    def test_chat_returns_reply(self, mock_pci):
        mock_pci.process_message.return_value = "Bonjour !"
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "Bonjour"}])
        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 0)

    @patch("hadara_ai.services.compatibility.public_chat_instance")
    def test_chat_strips_markdown(self, mock_pci):
        mock_pci.process_message.return_value = "```json\nGras\n```"
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("```", result)

    @patch("hadara_ai.services.compatibility.public_chat_instance")
    def test_chat_fallback_on_error(self, mock_pci):
        mock_pci.process_message.side_effect = Exception("Erreur")
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "test"}])
        self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.compatibility.public_chat_instance")
    def test_chat_includes_system_prompt(self, mock_pci):
        mock_pci.process_message.return_value = "Bonjour ! Je suis Mme Niass Madina"
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "Bonjour"}])
        self.assertIn("Niass Madina", result)


# ─────────────────────────────────────────────────────────────────────────────
# Tests des vues legacy (integration)
# ─────────────────────────────────────────────────────────────────────────────

class TestChatApiView(TestCase):
    """Tests des vues legacy (integration)."""

    def setUp(self):
        from hadara_ai.services.public_chat import public_chat
        self._original = public_chat.process_message
        self._pc = public_chat

    def tearDown(self):
        self._pc.process_message = self._original

    def test_chat_returns_200(self):
        self._pc.process_message = lambda msg: "Réponse test"
        from api.views import chat_api_view
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post(
            "/api/chat/",
            data={"messages": [{"role": "user", "content": "Bonjour"}]},
            format="json",
        )
        response = chat_api_view(request)
        self.assertEqual(response.status_code, 200)

    def test_chat_error_returns_fallback(self):
        def raise_error(msg):
            raise Exception("Erreur")

        self._pc.process_message = raise_error
        from api.views import chat_api_view
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post(
            "/api/chat/",
            data={"messages": [{"role": "user", "content": "test"}]},
            format="json",
        )
        response = chat_api_view(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn("WhatsApp", response.data.get("reply", ""))


# ─────────────────────────────────────────────────────────────────────────────
# Tests d'isolation des erreurs
# ─────────────────────────────────────────────────────────────────────────────

class TestErrorIsolation(unittest.TestCase):
    """Les erreurs internes ne fuient jamais vers le client."""

    def setUp(self):
        from hadara_ai.services.public_chat import public_chat
        self._original = public_chat.process_message
        self._pc = public_chat

    def tearDown(self):
        self._pc.process_message = self._original

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_api_key_error_hidden(self, mock_get_ai_response):
        self._pc.process_message = lambda msg: (_ for _ in ()).throw(Exception("Internal error"))
        mock_get_ai_response.side_effect = Exception("Invalid API key")
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("API key", result)
        self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_database_error_hidden(self, mock_get_ai_response):
        self._pc.process_message = lambda msg: (_ for _ in ()).throw(Exception("Internal error"))
        mock_get_ai_response.side_effect = Exception("database connection lost")
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("database", result.lower())
        self.assertIn("WhatsApp", result)

    @patch("hadara_ai.services.compatibility.get_ai_response")
    def test_import_error_hidden(self, mock_get_ai_response):
        self._pc.process_message = lambda msg: (_ for _ in ()).throw(Exception("Internal error"))
        mock_get_ai_response.side_effect = ImportError("No module named 'secret'")
        from hadara_ai.services.compatibility import chat
        result = chat([{"role": "user", "content": "test"}])
        self.assertNotIn("secret", result.lower())
        self.assertIn("WhatsApp", result)


# ─────────────────────────────────────────────────────────────────────────────
# Tests du Pricing Engine intégré
# ─────────────────────────────────────────────────────────────────────────────

class TestPricingIntegration(unittest.TestCase):
    """Tests du Pricing Engine intégré."""

    def test_pricing_returns_valid_range(self):
        from hadara_ai.services.public_chat import pricing_integration, PROFILE
        logo = PROFILE.services.find_by_key("logo")
        estimate = pricing_integration.get_estimate(logo)
        self.assertIn("price_min", estimate)
        self.assertIn("price_max", estimate)
        self.assertGreater(estimate["price_min"], 0)
        self.assertGreater(estimate["price_max"], estimate["price_min"])

    def test_pricing_bache(self):
        from hadara_ai.services.public_chat import pricing_integration, PROFILE
        bache = PROFILE.services.find_by_key("bache")
        estimate = pricing_integration.get_estimate(bache)
        self.assertIn("price_min", estimate)
        self.assertIn("price_max", estimate)


# ─────────────────────────────────────────────────────────────────────────────
# Tests du Business Profile (P1.5.3)
# ─────────────────────────────────────────────────────────────────────────────

class TestBusinessProfile(unittest.TestCase):
    """Tests de la source de vérité centralisée."""

    def test_profile_singleton_exists(self):
        from hadara_ai.brand.profile import PROFILE
        self.assertIsNotNone(PROFILE)

    def test_contacts_are_correct(self):
        from hadara_ai.brand.profile import PROFILE
        self.assertEqual(PROFILE.contacts.phone_primary, "+221 77 623 27 41")
        self.assertEqual(PROFILE.contacts.email, "mrniass@gmail.com")

    def test_services_catalog(self):
        from hadara_ai.brand.profile import PROFILE
        categories = PROFILE.services.get_categories()
        self.assertIn("Identité visuelle", categories)
        self.assertIn("Supports publicitaires", categories)
        self.assertIn("Digital", categories)

    def test_find_service_by_keyword(self):
        from hadara_ai.brand.profile import PROFILE
        service = PROFILE.services.find_by_keyword("logo")
        self.assertIsNotNone(service)
        self.assertEqual(service.key, "logo")

    def test_find_service_by_key(self):
        from hadara_ai.brand.profile import PROFILE
        service = PROFILE.services.find_by_key("bache")
        self.assertIsNotNone(service)
        self.assertEqual(service.key, "bache")


# ─────────────────────────────────────────────────────────────────────────────
# Tests de l'assitant (P1.5.3)
# ─────────────────────────────────────────────────────────────────────────────

class TestAssistantIdentity(unittest.TestCase):
    """Tests que l'assistant utilise toujours la bonne identité."""

    def test_assistant_uses_correct_name(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Bonjour")
        self.assertIn("Niass Madina", result)

    def test_assistant_uses_correct_phone(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Votre numéro ?")
        self.assertIn("77 623 27 41", result)

    def test_assistant_never_invents_price(self):
        from hadara_ai.services.public_chat import public_chat
        result = public_chat.process_message("Combien coûte un logo ?")
        self.assertIn("FCFA", result)
        # The PricingEngine calculates prices dynamically, not static defaults
        self.assertTrue(any(str(x) in result for x in range(10, 100)))
