from __future__ import annotations

import logging
import uuid
from typing import Any

from hadara_ai.agents.pricing_agent import (
    PRICING_AGENT_SYSTEM_PROMPT,
    build_pricing_context,
    parse_pricing_agent_response,
    _get_pricing_fallback,
)
from hadara_ai.models import BriefAIAnalysis
from hadara_ai.services.ai_service import get_ai_response
from hadara_ai.tools.context import ToolContext, ToolRole
from hadara_ai.tools.implementations import (
    brief_get,
    pricing_calculate,
)

logger = logging.getLogger(__name__)


class PricingAgentService:
    """Conseiller commercial tarifaire — explique le calcul, ne calcule pas."""

    def analyze(self, brief_id: str) -> dict[str, Any]:
        context = ToolContext(
            user_id="pricing_agent",
            role=ToolRole.VIEWER,
            trace_id=str(uuid.uuid4()),
        )

        # 1. Collecter les donn\u00e9es
        try:
            brief_data = brief_get({"brief_id": brief_id}, context)
        except ValueError:
            return _get_pricing_fallback(f"Brief introuvable: {brief_id}")

        try:
            pricing_data = pricing_calculate({"brief_id": brief_id}, context)
        except (ValueError, KeyError):
            pricing_data = {"pricing": {}}

        # 2. Construire le prompt
        pricing_context = build_pricing_context(pricing_data, brief_data)
        user_prompt = (
            f"Donn\u00e9es du brief :\n"
            f"Type: {brief_data.get('project_type', 'N/A')}\n"
            f"Objectif: {brief_data.get('primary_objective', 'N/A')}\n"
            f"Contexte: {brief_data.get('context_description', 'N/A')}\n"
            f"Cible: {brief_data.get('target_audience', 'N/A')}\n"
            f"Budget d\u00e9clar\u00e9: {brief_data.get('budget_range', 'N/A')}\n"
            f"D\u00e9lai: {brief_data.get('desired_delivery_date', 'N/A')}\n"
            f"Livrables: {len(brief_data.get('deliverable_versions', []))}\n\n"
            f"R\u00e9sultats du Pricing Engine (SOURCE DE V\u00c9RIT\u00c9) :\n"
            f"{pricing_context}\n\n"
            "Explique le prix et propose une strat\u00e9gie commerciale en JSON."
        )

        messages = [
            {"role": "system", "content": PRICING_AGENT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        # 3. Appel IA
        try:
            response = get_ai_response(
                messages,
                model="llama-3.1-8b-instant",
                json_mode=True,
            )

            result = parse_pricing_agent_response(response.content)

            # Forcer les prix du Pricing Engine
            pricing = pricing_data.get("pricing", {})
            result["prix_recommande"] = {
                "source": "pricing_engine",
                "min": pricing.get("prix_min_fcfa", 0),
                "max": pricing.get("prix_max_fcfa", 0),
            }

            # Historiser
            self._save_history(brief_id, result, response, "completed")

            return result

        except Exception as e:
            logger.error("Erreur Pricing Agent: %s", e)
            fallback = _get_pricing_fallback(str(e))
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
            BriefAIAnalysis.objects.create(
                brief_id=brief_id,
                agent="pricing_agent",
                model="llama-3.1-8b-instant",
                analysis_status=status,
                score_completude=0,
                complexite_percue=0,
                decision_recommandee=result.get("strategie_commerciale", {}).get("positionnement", ""),
                statut_brief="",
                niveau_priorite="Normal",
                raison_decision=result.get("explication", {}).get("resume", ""),
                informations_manquantes=[],
                questions_client=[],
                risques=[r.get("risque", "") for r in result.get("risques_commerciaux", [])],
                pricing_prix_min=result.get("prix_recommande", {}).get("min", 0),
                pricing_prix_max=result.get("prix_recommande", {}).get("max", 0),
                input_tokens=getattr(response, "input_tokens", 0) if response else 0,
                output_tokens=getattr(response, "output_tokens", 0) if response else 0,
                cost_usd=getattr(response, "cost_usd", 0) if response else 0,
                duration_ms=getattr(response, "duration_ms", 0) if response else 0,
                full_response=result,
            )
        except Exception as e:
            logger.error("Erreur historisation Pricing Agent: %s", e)
