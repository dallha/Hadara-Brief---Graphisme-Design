from __future__ import annotations

import logging
from typing import Any

from hadara_ai.providers.base import AbstractAIProvider
from hadara_ai.providers.registry import ProviderRegistry

logger = logging.getLogger(__name__)


class ModelRouterError(Exception):
    pass


class ModelRouter:
    """Route les appels IA vers le bon provider.

    Ordre : primary → fallback_1 → fallback_2
    """

    def __init__(self, registry: ProviderRegistry | None = None):
        self._registry = registry or ProviderRegistry()

    def resolve(
        self,
        primary: Any,
        fallback_1: Any | None = None,
        fallback_2: Any | None = None,
    ) -> tuple[AbstractAIProvider, str]:
        """Résout le provider disponible selon l'ordre de priorité.

        Args:
            primary: AIProviderConfig instance
            fallback_1: AIProviderConfig instance (optional)
            fallback_2: AIProviderConfig instance (optional)

        Returns:
            Tuple de (provider_instance, model_id)

        Raises:
            ModelRouterError si aucun provider n'est disponible
        """
        candidates = []
        if primary:
            candidates.append(primary)
        if fallback_1:
            candidates.append(fallback_1)
        if fallback_2:
            candidates.append(fallback_2)

        for config in candidates:
            model_id = config.model_id
            provider = self._registry.get_provider(model_id)
            if provider:
                return provider, model_id

        available = [c.model_id for c in candidates]
        raise ModelRouterError(
            f"Aucun provider disponible. Candidats essayés: {available}"
        )

    def get_fallback_chain(self, agent) -> list[str]:
        """Retourne la chaîne de fallback pour un agent."""
        chain = [agent.model_primary.model_id]
        if agent.model_fallback_1:
            chain.append(agent.model_fallback_1.model_id)
        if agent.model_fallback_2:
            chain.append(agent.model_fallback_2.model_id)
        return chain
