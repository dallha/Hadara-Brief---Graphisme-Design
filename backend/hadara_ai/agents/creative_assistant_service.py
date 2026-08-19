from __future__ import annotations

import logging
import uuid
from typing import Any

from hadara_ai.agents.creative_assistant import (
    CREATIVE_ASSISTANT_SYSTEM_PROMPT,
    build_creative_context,
    parse_creative_response,
    _get_creative_fallback,
)
from hadara_ai.models import BriefAIAnalysis
from hadara_ai.services.ai_service import get_ai_response
from hadara_ai.tools.context import ToolContext, ToolRole
from hadara_ai.tools.implementations import brief_get, pricing_calculate

logger = logging.getLogger(__name__)


class CreativeAssistantService:
    """Directeur artistique IA spécialisé Hadara."""

    def analyze(self, brief_id: str) -> dict[str, Any]:
        context = ToolContext(
            user_id="creative_assistant",
            role=ToolRole.VIEWER,
            trace_id=str(uuid.uuid4()),
        )

        try:
            brief_data = brief_get({"brief_id": brief_id}, context)
        except ValueError:
            return _get_creative_fallback(f"Brief introuvable: {brief_id}")

        try:
            pricing_data = pricing_calculate({"brief_id": brief_id}, context)
        except (ValueError, KeyError):
            pricing_data = None

        creative_context = build_creative_context(brief_data, pricing_data)
        user_prompt = (
            f"Données du brief :\n{creative_context}\n\n"
            "Fournis une direction artistique complète avec concepts visuels, "
            "palette, typographies, conseils de production et livrables recommandés."
        )

        messages = [
            {"role": "system", "content": CREATIVE_ASSISTANT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        try:
            response = get_ai_response(
                messages,
                model="llama-3.1-8b-instant",
                json_mode=True,
            )

            result = parse_creative_response(response.content)

            self._save_history(brief_id, result, response, "completed")
            return result

        except Exception as e:
            logger.error("Erreur Creative Assistant: %s", e)
            fallback = _get_creative_fallback(str(e))
            self._save_history(brief_id, fallback, None, "failed")
            return fallback

    def _save_history(
        self,
        brief_id: str,
        result: dict,
        response,
        status: str,
    ) -> None:
        try:
            direction = result.get("direction_artistique", {})
            concept = direction.get("concept_directeur", "")
            concepts = result.get("concepts_visuels", [])
            livrables = result.get("livrables_recommandes", [])

            BriefAIAnalysis.objects.create(
                brief_id=brief_id,
                agent="creative_assistant",
                model="llama-3.1-8b-instant",
                analysis_status=status,
                score_completude=len(concepts) * 25,
                complexite_percue=0,
                decision_recommandee=f"{len(concepts)} concept(s) · {len(livrables)} livrable(s)",
                statut_brief="",
                niveau_priorite="Normal",
                raison_decision=concept,
                informations_manquantes=[],
                questions_client=[],
                risques=[c.get("description", "") for c in concepts[:3]],
                pricing_prix_min=0,
                pricing_prix_max=0,
                input_tokens=getattr(response, "input_tokens", 0) if response else 0,
                output_tokens=getattr(response, "output_tokens", 0) if response else 0,
                cost_usd=getattr(response, "cost_usd", 0) if response else 0,
                duration_ms=getattr(response, "duration_ms", 0) if response else 0,
                full_response=result,
            )
        except Exception as e:
            logger.error("Erreur historisation Creative Assistant: %s", e)
