from __future__ import annotations

import logging
import uuid
from typing import Any

from hadara_ai.agents.communication_agent import (
    COMMUNICATION_AGENT_SYSTEM_PROMPT,
    build_communication_context,
    parse_communication_response,
    _get_communication_fallback,
)
from hadara_ai.models import BriefAIAnalysis
from hadara_ai.services.ai_service import get_ai_response
from hadara_ai.tools.context import ToolContext, ToolRole
from hadara_ai.tools.implementations import brief_get

logger = logging.getLogger(__name__)


class CommunicationAgentService:
    """Transforme les analyses IA en messages professionnels client."""

    def generate(
        self,
        brief_id: str,
        message_type: str = "proposition",
        analyst_result: dict | None = None,
        pricing_result: dict | None = None,
        creative_result: dict | None = None,
    ) -> dict[str, Any]:
        context = ToolContext(
            user_id="communication_agent",
            role=ToolRole.VIEWER,
            trace_id=str(uuid.uuid4()),
        )

        try:
            brief_data = brief_get({"brief_id": brief_id}, context)
        except ValueError:
            return _get_communication_fallback(f"Brief introuvable: {brief_id}")

        comm_context = build_communication_context(
            brief_data, analyst_result, pricing_result, creative_result
        )

        user_prompt = (
            f"Type de message demandé: {message_type}\n\n"
            f"Contexte:\n{comm_context}\n\n"
            f"Génère le message client pour le type '{message_type}'."
        )

        messages = [
            {"role": "system", "content": COMMUNICATION_AGENT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        try:
            response = get_ai_response(
                messages,
                model="llama-3.1-8b-instant",
                json_mode=True,
            )

            result = parse_communication_response(response.content)
            result["type_message"] = message_type

            self._save_history(brief_id, result, response, "completed", message_type)
            return result

        except Exception as e:
            logger.error("Erreur Communication Agent: %s", e)
            fallback = _get_communication_fallback(str(e))
            self._save_history(brief_id, fallback, None, "failed", message_type)
            return fallback

    def _save_history(
        self,
        brief_id: str,
        result: dict,
        response,
        status: str,
        message_type: str,
    ) -> None:
        try:
            BriefAIAnalysis.objects.create(
                brief_id=brief_id,
                agent="communication_agent",
                model="llama-3.1-8b-instant",
                analysis_status=status,
                score_completude=0,
                complexite_percue=0,
                decision_recommandee=message_type,
                statut_brief="",
                niveau_priorite="Normal",
                raison_decision=result.get("prochaine_action", ""),
                informations_manquantes=[],
                questions_client=[],
                risques=result.get("alertes_internes", []),
                pricing_prix_min=0,
                pricing_prix_max=0,
                input_tokens=getattr(response, "input_tokens", 0) if response else 0,
                output_tokens=getattr(response, "output_tokens", 0) if response else 0,
                cost_usd=getattr(response, "cost_usd", 0) if response else 0,
                duration_ms=getattr(response, "duration_ms", 0) if response else 0,
                full_response=result,
            )
        except Exception as e:
            logger.error("Erreur historisation Communication Agent: %s", e)
