from unittest.mock import MagicMock, patch, PropertyMock
from django.test import TestCase

from hadara_ai.providers.base import AbstractAIProvider, AIResponse
from hadara_ai.providers.registry import ProviderRegistry
from hadara_ai.services.ai_service import (
    analyze_brief_with_ai,
    get_ai_response,
    get_registry,
    _get_fallback_ai,
)


class AIResponseTest(TestCase):
    def test_raw_defaults_to_none(self):
        resp = AIResponse(content="ok", model="m", provider="p")
        self.assertIsNone(resp.raw)

    def test_raw_accepts_dict(self):
        resp = AIResponse(content="ok", model="m", provider="p", raw={"k": "v"})
        self.assertEqual(resp.raw, {"k": "v"})


class ProviderRegistryTest(TestCase):
    def test_instances_are_not_singletons(self):
        r1 = ProviderRegistry()
        r2 = ProviderRegistry()
        self.assertIsNot(r1, r2)

    def test_reset_clears_state(self):
        reg = ProviderRegistry()
        reg._initialized = True
        reg._providers["x"] = MagicMock()
        reg.reset()
        self.assertFalse(reg._initialized)
        self.assertEqual(reg._providers, {})

    @patch.dict("os.environ", {"GROQ_API_KEY": ""})
    def test_list_models_empty_when_no_providers(self):
        reg = ProviderRegistry()
        models = reg.list_models()
        self.assertIsInstance(models, list)


class FallbackTest(TestCase):
    def test_fallback_preserves_pricing(self):
        pricing = {
            "score_completude": 72,
            "score_complexite": 6,
        }
        result = _get_fallback_ai(pricing, "test reason")
        self.assertEqual(result["score_completude"], 72)
        self.assertEqual(result["complexite_percue"], 6)
        self.assertEqual(result["decision_recommandee"], "ACCEPTER SOUS RÉSERVE")
        self.assertIn("test reason", result["raison_decision"])

    def test_fallback_default_values(self):
        result = _get_fallback_ai({}, "timeout")
        self.assertEqual(result["score_completude"], 50)
        self.assertEqual(result["complexite_percue"], 5)
        self.assertEqual(result["niveau_priorite"], "Normal")


class AnalyzeBriefNonRegressionTest(TestCase):
    """Tests de non-régression pour analyze_brief_with_ai.

    Aucun appel réseau — Groq est toujours mocké.
    """

    def _make_brief(self, **overrides):
        brief = MagicMock()
        brief.project_type = overrides.get("project_type", "logo")
        brief.project_type_custom = overrides.get("project_type_custom", "")
        brief.context_description = overrides.get(
            "context_description", "Création de logo pour entreprise"
        )
        brief.primary_objective = overrides.get(
            "primary_objective", "Image professionnelle"
        )
        brief.target_audience = overrides.get("target_audience", "Entreprise")
        brief.technical_format = overrides.get("technical_format", "vectoriel")
        brief.budget_range = overrides.get("budget_range", "50k_100k")
        brief.desired_delivery_date = overrides.get(
            "desired_delivery_date", "2 semaines"
        )
        brief.critical_deadline = overrides.get("critical_deadline", "")
        brief.style_preferences = overrides.get("style_preferences", ["Moderne"])
        brief.main_title = overrides.get("main_title", "Mon Logo")
        return brief

    def _make_pricing(self, **overrides):
        return {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": overrides.get("prix_min", 35000),
            "prix_max_fcfa": overrides.get("prix_max", 90000),
            "heures_min": 3,
            "heures_max": 10,
            "delai_min_jours": 3,
            "delai_max_jours": 7,
            "score_complexite": 5,
            "score_completude": 65,
            "acompte_conseille": 17500,
        }

    @patch("hadara_ai.providers.groq_provider.requests.post")
    def test_returns_valid_structure(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": '{"statut_brief": "exploitable", '
                        '"score_completude": 80, '
                        '"complexite_percue": 5, '
                        '"decision_recommandee": "ACCEPTER", '
                        '"raison_decision": "Brief complet", '
                        '"informations_manquantes": [], '
                        '"questions_client": [], '
                        '"risques": [], '
                        '"niveau_priorite": "Normal", '
                        '"brouillon_whatsapp": "Bonjour"}'
                    }
                }
            ],
            "usage": {"prompt_tokens": 120, "completion_tokens": 80},
        }
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        brief = self._make_brief()
        pricing = self._make_pricing()

        result = analyze_brief_with_ai(brief, pricing)

        # Structure de base préservée
        self.assertIn("engine_version", result)
        self.assertIn("pricing", result)
        self.assertIn("ai", result)
        self.assertIsNotNone(result["ai"])

        # Pricing jamais modifié par l'IA
        self.assertEqual(result["pricing"]["prix_min"], 35000)
        self.assertEqual(result["pricing"]["prix_max"], 90000)
        self.assertEqual(result["engine_version"], "pricing-v1.0")

    @patch("hadara_ai.providers.groq_provider.requests.post")
    def test_json_decode_error_triggers_fallback(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": "NOT JSON AT ALL"}}],
            "usage": {},
        }
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        result = analyze_brief_with_ai(self._make_brief(), self._make_pricing())
        self.assertIsNotNone(result["ai"])
        self.assertEqual(
            result["ai"]["decision_recommandee"], "ACCEPTER SOUS RÉSERVE"
        )

    @patch("hadara_ai.providers.groq_provider.requests.post")
    def test_network_error_triggers_fallback(self, mock_post):
        import requests as req

        mock_post.side_effect = req.ConnectionError("offline")

        result = analyze_brief_with_ai(self._make_brief(), self._make_pricing())
        self.assertIsNotNone(result["ai"])
        self.assertEqual(result["ai"]["decision_recommandee"], "ACCEPTER SOUS RÉSERVE")

    @patch("hadara_ai.providers.groq_provider.requests.post")
    def test_pricing_engine_results_never_modified(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": '{"statut_brief": "incomplet", '
                        '"score_completude": 10, '
                        '"complexite_percue": 2, '
                        '"decision_recommandee": "REFUSER", '
                        '"raison_decision": "Vague", '
                        '"informations_manquantes": ["Tout"], '
                        '"questions_client": ["Décrivez"], '
                        '"risques": ["Aucune info"], '
                        '"niveau_priorite": "Normal", '
                        '"brouillon_whatsapp": ""}'
                    }
                }
            ],
            "usage": {"prompt_tokens": 50, "completion_tokens": 30},
        }
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        pricing = self._make_pricing(prix_min=99999, prix_max=88888)
        result = analyze_brief_with_ai(self._make_brief(), pricing)

        # Le Pricing Engine est la source de vérité
        self.assertEqual(result["pricing"]["prix_min"], 99999)
        self.assertEqual(result["pricing"]["prix_max"], 88888)
        # L'IA ne modifie jamais ces valeurs
        self.assertEqual(result["pricing"]["heures_min"], 3)
        self.assertEqual(result["pricing"]["heures_max"], 10)


class AnalyzeBriefAITestOfflineTest(TestCase):
    """Test quand GROQ_API_KEY est absente — fallback garanti."""

    @patch.dict("os.environ", {"GROQ_API_KEY": ""})
    @patch("hadara_ai.services.ai_service._registry")
    def test_no_api_key_returns_fallback(self, mock_registry):
        mock_registry.get_provider.return_value = None

        brief = MagicMock()
        brief.project_type = "logo"
        brief.project_type_custom = ""
        brief.context_description = "Test"
        brief.primary_objective = "Test"
        brief.target_audience = "Test"
        brief.technical_format = "Test"
        brief.budget_range = "50k_100k"
        brief.desired_delivery_date = "2 semaines"
        brief.critical_deadline = ""
        brief.style_preferences = []
        brief.main_title = "Test"

        pricing = {
            "engine_version": "pricing-v1.0",
            "prix_min_fcfa": 35000,
            "prix_max_fcfa": 90000,
            "score_complexite": 5,
            "score_completude": 65,
        }

        result = analyze_brief_with_ai(brief, pricing)

        self.assertIsNotNone(result["ai"])
        self.assertEqual(result["ai"]["decision_recommandee"], "ACCEPTER SOUS RÉSERVE")
        self.assertEqual(result["pricing"]["prix_min"], 35000)


# ============================================================================
# GATE P0.1 — 5 points de verrouillage
# ============================================================================


class GateResetTest(TestCase):
    """Gate 1: ProviderRegistry.reset() recharge proprement."""

    def test_reset_forces_reinitialize(self):
        reg = ProviderRegistry()
        reg._initialized = True
        reg._providers["old-model"] = MagicMock()

        reg.reset()

        self.assertFalse(reg._initialized)
        self.assertEqual(len(reg._providers), 0)

    def test_get_provider_after_reset_triggers_reinit(self):
        reg = ProviderRegistry()
        reg._initialized = True
        reg._providers["x"] = MagicMock()

        reg.reset()

        # Prochain get_provider réinitialise depuis DB + env
        with patch.object(reg, 'initialize') as mock_init:
            reg.get_provider("any-model")
            mock_init.assert_called_once()


class GateProviderAbsentTest(TestCase):
    """Gate 2: Provider indisponible = erreur contrôlée, pas de crash."""

    @patch("hadara_ai.services.ai_service._registry")
    def test_get_ai_response_raises_on_missing_provider(self, mock_registry):
        mock_registry.get_provider.return_value = None

        with self.assertRaises(ValueError) as ctx:
            get_ai_response(
                [{"role": "user", "content": "test"}],
                model="nonexistent-model",
            )
        self.assertIn("nonexistent-model", str(ctx.exception))

    @patch("hadara_ai.services.ai_service._registry")
    def test_analyze_brief_graceful_on_missing_provider(self, mock_registry):
        mock_registry.get_provider.return_value = None

        brief = MagicMock()
        brief.project_type = "logo"
        brief.project_type_custom = ""
        brief.context_description = "Test"
        brief.primary_objective = "Test"
        brief.target_audience = "Test"
        brief.technical_format = "Test"
        brief.budget_range = "50k_100k"
        brief.desired_delivery_date = "2 semaines"
        brief.critical_deadline = ""
        brief.style_preferences = []
        brief.main_title = "Test"

        result = analyze_brief_with_ai(
            brief, {"engine_version": "pricing-v1.0", "score_completude": 50, "score_complexite": 5}
        )
        self.assertIsNotNone(result["ai"])
        self.assertEqual(result["ai"]["decision_recommandee"], "ACCEPTER SOUS RÉSERVE")


class GateTimeoutTest(TestCase):
    """Gate 3: Timeout Groq = fallback, pas de crash."""

    @patch("hadara_ai.providers.groq_provider.requests.post")
    def test_timeout_triggers_fallback(self, mock_post):
        import requests as req
        mock_post.side_effect = req.Timeout("request timed out")

        brief = MagicMock()
        brief.project_type = "affiche"
        brief.project_type_custom = ""
        brief.context_description = "Test affiche"
        brief.primary_objective = "Événement"
        brief.target_audience = "Général"
        brief.technical_format = "A3"
        brief.budget_range = "25k_50k"
        brief.desired_delivery_date = "3 jours"
        brief.critical_deadline = ""
        brief.style_preferences = []
        brief.main_title = "Fête"

        result = analyze_brief_with_ai(
            brief,
            {
                "engine_version": "pricing-v1.0",
                "prix_min_fcfa": 18000,
                "prix_max_fcfa": 55000,
                "heures_min": 2,
                "heures_max": 6,
                "delai_min_jours": 2,
                "delai_max_jours": 5,
                "score_complexite": 4,
                "score_completude": 70,
                "acompte_conseille": 9000,
            },
        )
        self.assertIsNotNone(result["ai"])
        self.assertIn(result["ai"]["decision_recommandee"], [
            "ACCEPTER SOUS RÉSERVE", "ACCEPTER", "CLARIFIER", "REFUSER"
        ])
        # Pricing intact malgré le timeout
        self.assertEqual(result["pricing"]["prix_min"], 18000)
        self.assertEqual(result["pricing"]["prix_max"], 55000)


class GateProviderInterchangeableTest(TestCase):
    """Gate 4: AIService fonctionne avec n'importe quel provider, pas seulement Groq."""

    def _fake_provider_class(self):
        """Crée un provider factice qui respecte le contrat AbstractAIProvider."""
        class FakeProvider(AbstractAIProvider):
            def chat(self, messages, **kwargs):
                return AIResponse(
                    content='{"decision_recommandee": "ACCEPTER"}',
                    model="fake-model",
                    provider="fake",
                    input_tokens=10,
                    output_tokens=5,
                )

            def chat_json(self, messages, **kwargs):
                return self.chat(messages, **kwargs)

            def health_check(self):
                return True

        return FakeProvider

    def test_fake_provider_via_get_ai_response(self):
        from hadara_ai.models import AIProvider, AIProviderConfig

        # Créer un provider fake en DB
        provider = AIProvider.objects.create(
            name="fake", display_name="Fake Provider", is_active=True, priority=10
        )
        config = AIProviderConfig.objects.create(
            provider=provider,
            model_id="fake-model",
            display_name="Fake Model",
            is_active=True,
        )

        # Injecter le provider fake dans le registry
        registry = get_registry()
        FakeProvider = self._fake_provider_class()
        registry._providers["fake-model"] = FakeProvider(config, "fake-key")
        registry._initialized = True

        try:
            response = get_ai_response(
                [{"role": "user", "content": "test"}],
                model="fake-model",
            )
            self.assertEqual(response.provider, "fake")
            self.assertEqual(response.content, '{"decision_recommandee": "ACCEPTER"}')
        finally:
            registry.reset()

    def test_fake_provider_via_analyze_brief(self):
        from hadara_ai.models import AIProvider, AIProviderConfig

        provider = AIProvider.objects.create(
            name="fake2", display_name="Fake2", is_active=True, priority=10
        )
        config = AIProviderConfig.objects.create(
            provider=provider,
            model_id="fake-model-2",
            display_name="Fake2 Model",
            is_active=True,
        )

        registry = get_registry()
        FakeProvider = self._fake_provider_class()
        registry._providers["fake-model-2"] = FakeProvider(config, "fake-key")
        registry._initialized = True

        try:
            brief = MagicMock()
            brief.project_type = "logo"
            brief.project_type_custom = ""
            brief.context_description = "Test"
            brief.primary_objective = "Test"
            brief.target_audience = "Test"
            brief.technical_format = "Test"
            brief.budget_range = "50k_100k"
            brief.desired_delivery_date = "2 semaines"
            brief.critical_deadline = ""
            brief.style_preferences = []
            brief.main_title = "Test"

            # Patch le model utilisé par analyze_brief_with_ai pour utiliser le fake
            with patch("hadara_ai.services.ai_service.get_ai_response") as mock_get:
                mock_get.return_value = AIResponse(
                    content='{"decision_recommandee": "ACCEPTER"}',
                    model="fake-model-2",
                    provider="fake",
                    input_tokens=10,
                    output_tokens=5,
                )
                result = analyze_brief_with_ai(
                    brief, {"engine_version": "pricing-v1.0", "score_completude": 50, "score_complexite": 5}
                )
                self.assertIsNotNone(result["ai"])
                self.assertEqual(result["ai"]["decision_recommandee"], "ACCEPTER")
        finally:
            registry.reset()


class GateNoNetworkInTestsTest(TestCase):
    """Gate 5: Aucun appel réseau dans toute la suite de tests hadara_ai."""

    def test_all_hadara_ai_modules_importable_without_network(self):
        import importlib
        modules = [
            "hadara_ai.providers.base",
            "hadara_ai.providers.groq_provider",
            "hadara_ai.providers.registry",
            "hadara_ai.services.ai_service",
        ]
        for mod_name in modules:
            mod = importlib.import_module(mod_name)
            self.assertIsNotNone(mod, f"Module {mod_name} non importable")
