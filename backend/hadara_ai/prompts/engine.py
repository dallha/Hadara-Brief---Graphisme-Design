from __future__ import annotations

import re
import logging
from typing import Any

from hadara_ai.models import PromptTemplate, PromptVersion

logger = logging.getLogger(__name__)


class PromptEngineError(Exception):
    pass


class PromptEngine:
    """Moteur de prompts versionnés.

    Règles :
    - La DB est la source de vérité runtime.
    - Les YAML ne servent qu'à l'import initial (seeds).
    - Chaque template a une seule version active.
    - Le rendu valide les variables obligatoires.
    """

    def get_active_version(self, slug: str) -> PromptVersion:
        """Récupère la version active d'un template par son slug."""
        try:
            template = PromptTemplate.objects.get(slug=slug)
        except PromptTemplate.DoesNotExist:
            raise PromptEngineError(
                f"Template '{slug}' introuvable."
            )

        version = template.versions.filter(is_active=True).first()
        if not version:
            raise PromptEngineError(
                f"Aucune version active pour le template '{slug}'."
            )

        return version

    def render(
        self, slug: str, variables: dict[str, Any], version_number: int | None = None
    ) -> dict[str, str]:
        """Rend un prompt à partir d'un template et de variables.

        Args:
            slug: Identifiant du template (ex: "brief_analyzer")
            variables: Dict des variables à injecter dans le template
            version_number: Si fourni, utilise cette version précise
                           (sinon utilise la version active)

        Returns:
            Dict avec "system" et "user" contenant les prompts rendus
        """
        if version_number is not None:
            try:
                pv = PromptVersion.objects.get(
                    template__slug=slug, version=version_number
                )
            except PromptVersion.DoesNotExist:
                raise PromptEngineError(
                    f"Version {version_number} du template '{slug}' introuvable."
                )
        else:
            pv = self.get_active_version(slug)

        # Valider les variables obligatoires
        required = pv.input_schema.get("required", [])
        missing = [v for v in required if v not in variables]
        if missing:
            raise PromptEngineError(
                f"Variables manquantes pour '{slug}': {', '.join(missing)}"
            )

        # Rendu
        system = self._render_template(pv.system_prompt, variables)
        user = self._render_template(pv.user_prompt_template, variables)

        return {
            "system": system,
            "user": user,
            "template_slug": slug,
            "version": pv.version,
            "model_recommended": pv.model_recommended,
            "temperature": pv.temperature,
        }

    def list_templates(self) -> list[dict]:
        """Liste tous les templates avec leur version active."""
        templates = []
        for t in PromptTemplate.objects.all():
            active = t.versions.filter(is_active=True).first()
            templates.append({
                "slug": t.slug,
                "name": t.name,
                "category": t.category,
                "active_version": active.version if active else None,
            })
        return templates

    @staticmethod
    def _render_template(template: str, variables: dict[str, Any]) -> str:
        """Remplace les {{variable}} par les valeurs."""
        def replacer(match):
            key = match.group(1).strip()
            value = variables.get(key, match.group(0))
            return str(value)

        return re.sub(r'\{\{(\s*\w+\s*)\}\}', replacer, template)
