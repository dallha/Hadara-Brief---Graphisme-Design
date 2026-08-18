from __future__ import annotations

import os
import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from hadara_ai.providers.base import AbstractAIProvider

logger = logging.getLogger(__name__)


class ProviderRegistry:
    """Registre des providers IA — instance contrôlée, pas singleton.

    Chaque instance maintient son propre cache de providers.
    La première appelle à ``get_provider`` déclenche l'initialisation
    depuis la base de données + les variables d'environnement (.env).
    """

    _ENV_KEYS: dict[str, str] = {
        "groq": "GROQ_API_KEY",
        "openai": "OPENAI_API_KEY",
        "gemini": "GEMINI_API_KEY",
    }

    def __init__(self) -> None:
        self._providers: dict[str, AbstractAIProvider] = {}
        self._initialized = False

    def initialize(self, force: bool = False) -> None:
        """Charge les providers actifs depuis la DB + .env.

        Args:
            force: Si True, réinitialise même si déjà initialisé.
                   Utile après modification de la config en DB.
        """
        if self._initialized and not force:
            return

        from hadara_ai.models import AIProvider
        from hadara_ai.providers.groq_provider import GroqProvider
        from hadara_ai.providers.openai_provider import OpenAIProvider
        from hadara_ai.providers.gemini_provider import GeminiProvider

        CLASS_MAP: dict[str, type] = {
            "groq": GroqProvider,
            "openai": OpenAIProvider,
            "gemini": GeminiProvider,
        }

        self._providers.clear()

        for provider_model in AIProvider.objects.filter(is_active=True):
            provider_class = CLASS_MAP.get(provider_model.name)
            env_key = self._ENV_KEYS.get(provider_model.name)

            if not provider_class or not env_key:
                continue

            api_key = os.environ.get(env_key)
            if not api_key:
                logger.warning(
                    "Provider %s désactivé: clé API manquante (%s)",
                    provider_model.name,
                    env_key,
                )
                continue

            for config in provider_model.configs.filter(is_active=True):
                instance = provider_class(config, api_key)
                self._providers[config.model_id] = instance

        self._initialized = True

    def get_provider(self, model_id: str) -> AbstractAIProvider | None:
        self.initialize()
        return self._providers.get(model_id)

    def list_models(self) -> list[str]:
        self.initialize()
        return list(self._providers.keys())

    def reset(self) -> None:
        """Vide le cache. Prochaine accès réinitialisera depuis la DB."""
        self._providers.clear()
        self._initialized = False
