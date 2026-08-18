from unittest.mock import MagicMock, patch
from django.test import TestCase

from hadara_ai.providers.base import AbstractAIProvider, AIResponse


class GroqProviderContractTest(TestCase):
    expected_provider = "groq"
    expected_model = "llama-3.1-8b-instant"

    def setUp(self):
        from hadara_ai.providers.groq_provider import GroqProvider
        from hadara_ai.models import AIProvider, AIProviderConfig

        self.provider_class = GroqProvider

        self._provider_model = AIProvider.objects.create(
            name="groq", display_name="Groq", is_active=True
        )
        self._config = AIProviderConfig.objects.create(
            provider=self._provider_model,
            model_id="llama-3.1-8b-instant",
            display_name="Llama 3.1 8B",
            is_active=True,
        )

    def _make_provider(self):
        from hadara_ai.providers.groq_provider import GroqProvider
        return GroqProvider(self._config, "test-key")

    def _mock_successful_response(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": '{"ok": true}'}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        }
        mock_resp.raise_for_status = MagicMock()
        return mock_resp

    def test_implements_abstract_methods(self):
        self.assertTrue(issubclass(self.provider_class, AbstractAIProvider))

    def test_chat_returns_ai_response(self):
        provider = self._make_provider()
        mock_resp = self._mock_successful_response()

        with patch("hadara_ai.providers.groq_provider.requests.post", return_value=mock_resp):
            result = provider.chat([{"role": "user", "content": "test"}])

        self.assertIsInstance(result, AIResponse)
        self.assertEqual(result.provider, "groq")
        self.assertEqual(result.model, "llama-3.1-8b-instant")
        self.assertGreaterEqual(result.duration_ms, 0)

    def test_chat_json_returns_ai_response(self):
        provider = self._make_provider()
        mock_resp = self._mock_successful_response()

        with patch("hadara_ai.providers.groq_provider.requests.post", return_value=mock_resp):
            result = provider.chat_json([{"role": "user", "content": "test"}])

        self.assertIsInstance(result, AIResponse)
        self.assertEqual(result.provider, "groq")

    def test_calculate_cost(self):
        provider = self._make_provider()
        cost = provider.calculate_cost(1000, 500)
        self.assertIsInstance(cost, float)
        self.assertGreaterEqual(cost, 0)

    def test_health_check_returns_bool(self):
        provider = self._make_provider()
        with patch("hadara_ai.providers.groq_provider.requests.get") as mock_get:
            mock_get.return_value = MagicMock(status_code=200)
            self.assertTrue(provider.health_check())

    def test_network_error_raises(self):
        import requests as req
        provider = self._make_provider()

        with patch("hadara_ai.providers.groq_provider.requests.post") as mock_post:
            mock_post.side_effect = req.ConnectionError("offline")
            with self.assertRaises(req.ConnectionError):
                provider.chat([{"role": "user", "content": "test"}])


class OpenAIProviderContractTest(TestCase):
    expected_provider = "openai"
    expected_model = "gpt-4o"

    def setUp(self):
        from hadara_ai.providers.openai_provider import OpenAIProvider
        from hadara_ai.models import AIProvider, AIProviderConfig

        self.provider_class = OpenAIProvider

        self._provider_model = AIProvider.objects.create(
            name="openai", display_name="OpenAI", is_active=True
        )
        self._config = AIProviderConfig.objects.create(
            provider=self._provider_model,
            model_id="gpt-4o",
            display_name="GPT-4o",
            is_active=True,
        )

    def _make_provider(self):
        from hadara_ai.providers.openai_provider import OpenAIProvider
        return OpenAIProvider(self._config, "test-key")

    def _mock_successful_response(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": '{"ok": true}'}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        }
        mock_resp.raise_for_status = MagicMock()
        return mock_resp

    def test_implements_abstract_methods(self):
        self.assertTrue(issubclass(self.provider_class, AbstractAIProvider))

    def test_chat_returns_ai_response(self):
        provider = self._make_provider()
        mock_resp = self._mock_successful_response()

        with patch("hadara_ai.providers.openai_provider.requests.post", return_value=mock_resp):
            result = provider.chat([{"role": "user", "content": "test"}])

        self.assertIsInstance(result, AIResponse)
        self.assertEqual(result.provider, "openai")
        self.assertEqual(result.model, "gpt-4o")
        self.assertGreaterEqual(result.duration_ms, 0)

    def test_chat_json_returns_ai_response(self):
        provider = self._make_provider()
        mock_resp = self._mock_successful_response()

        with patch("hadara_ai.providers.openai_provider.requests.post", return_value=mock_resp):
            result = provider.chat_json([{"role": "user", "content": "test"}])

        self.assertIsInstance(result, AIResponse)
        self.assertEqual(result.provider, "openai")

    def test_calculate_cost(self):
        provider = self._make_provider()
        cost = provider.calculate_cost(1000, 500)
        self.assertIsInstance(cost, float)
        self.assertGreaterEqual(cost, 0)

    def test_health_check_returns_bool(self):
        provider = self._make_provider()
        with patch("hadara_ai.providers.openai_provider.requests.get") as mock_get:
            mock_get.return_value = MagicMock(status_code=200)
            self.assertTrue(provider.health_check())

    def test_network_error_raises(self):
        import requests as req
        provider = self._make_provider()

        with patch("hadara_ai.providers.openai_provider.requests.post") as mock_post:
            mock_post.side_effect = req.ConnectionError("offline")
            with self.assertRaises(req.ConnectionError):
                provider.chat([{"role": "user", "content": "test"}])


class GeminiProviderContractTest(TestCase):
    expected_provider = "gemini"
    expected_model = "gemini-2.5-flash"

    def setUp(self):
        from hadara_ai.providers.gemini_provider import GeminiProvider
        from hadara_ai.models import AIProvider, AIProviderConfig

        self.provider_class = GeminiProvider

        self._provider_model = AIProvider.objects.create(
            name="gemini", display_name="Gemini", is_active=True
        )
        self._config = AIProviderConfig.objects.create(
            provider=self._provider_model,
            model_id="gemini-2.5-flash",
            display_name="Gemini 2.5 Flash",
            is_active=True,
        )

    def _make_provider(self):
        from hadara_ai.providers.gemini_provider import GeminiProvider
        return GeminiProvider(self._config, "test-key")

    def test_implements_abstract_methods(self):
        self.assertTrue(issubclass(self.provider_class, AbstractAIProvider))

    def test_chat_returns_ai_response(self):
        provider = self._make_provider()

        mock_response = MagicMock()
        mock_response.text = '{"ok": true}'
        mock_response.usage_metadata = MagicMock()
        mock_response.usage_metadata.prompt_token_count = 10
        mock_response.usage_metadata.candidates_token_count = 5

        with patch("google.genai.Client") as MockClient:
            mock_client = MagicMock()
            MockClient.return_value = mock_client
            mock_client.models.generate_content.return_value = mock_response

            result = provider.chat([{"role": "user", "content": "test"}])

            self.assertIsInstance(result, AIResponse)
            self.assertEqual(result.provider, "gemini")
            self.assertEqual(result.model, "gemini-2.5-flash")
            self.assertEqual(result.input_tokens, 10)
            self.assertEqual(result.output_tokens, 5)

    def test_chat_json_returns_ai_response(self):
        provider = self._make_provider()

        mock_response = MagicMock()
        mock_response.text = '{"ok": true}'
        mock_response.usage_metadata = MagicMock()
        mock_response.usage_metadata.prompt_token_count = 8
        mock_response.usage_metadata.candidates_token_count = 3

        with patch("google.genai.Client") as MockClient:
            mock_client = MagicMock()
            MockClient.return_value = mock_client
            mock_client.models.generate_content.return_value = mock_response

            result = provider.chat_json([{"role": "user", "content": "test"}])

            self.assertIsInstance(result, AIResponse)
            self.assertEqual(result.provider, "gemini")

    def test_calculate_cost(self):
        provider = self._make_provider()
        cost = provider.calculate_cost(1000, 500)
        self.assertIsInstance(cost, float)
        self.assertGreaterEqual(cost, 0)

    def test_convert_messages(self):
        from hadara_ai.providers.gemini_provider import GeminiProvider

        messages = [
            {"role": "system", "content": "Tu es un expert."},
            {"role": "user", "content": "Bonjour"},
        ]
        result = GeminiProvider._convert_messages(messages)
        self.assertIn("[INSTRUCTIONS]", result)
        self.assertIn("Tu es un expert.", result)
        self.assertIn("Bonjour", result)

    def test_network_error_raises(self):
        provider = self._make_provider()

        with patch("google.genai.Client") as MockClient:
            mock_client = MagicMock()
            MockClient.return_value = mock_client
            mock_client.models.generate_content.side_effect = Exception("offline")

            with self.assertRaises(Exception):
                provider.chat([{"role": "user", "content": "test"}])
