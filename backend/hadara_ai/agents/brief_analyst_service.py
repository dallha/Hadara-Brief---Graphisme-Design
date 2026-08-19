from __future__ import annotations

import json
import logging
import uuid
from typing import Any

from hadara_ai.agents.brief_analyst import (
    BRIEF_ANALYST_SYSTEM_PROMPT,
    build_brief_context,
    build_pricing_context,
    parse_brief_analyst_response,
    _get_fallback_response,
)
from hadara_ai.models import AgentDefinition, BriefAIAnalysis
from hadara_ai.models.trace import ExecutionStatus
from hadara_ai.services.ai_service import get_ai_response
from hadara_ai.tools.context import ToolContext, ToolRole
from hadara_ai.tools.implementations import (
    brief_get,
    client_get,
    client_history,
    pricing_calculate,
)
from hadara_ai.tracing.service import ExecutionTraceService

logger = logging.getLogger(__name__)


class BriefAnalystService:
    """Service d'intégration du Brief Analyst dans le workflow Hadara Brief.

    Ce service orchestre :
    1. La collecte des données (brief, client, historique, pricing)
    2. L'appel IA avec le prompt structuré
    3. Le parsing et la validation de la réponse
    4. La traçabilité complète
    """

    def __init__(self):
        self.trace_service = ExecutionTraceService()

    def analyze(
        self,
        brief_id: str,
        agent: AgentDefinition | None = None,
        trace_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        """Analyse un brief et retourne une réponse structurée.

        Args:
            brief_id: ID du brief (ex: "HAD-0001")
            agent: AgentDefinition optionnel (sinon celui par défaut)
            trace_id: UUID de traçage (sinon généré automatiquement)

        Returns:
            Réponse structurée du Brief Analyst
        """
        if trace_id is None:
            trace_id = uuid.uuid4()

        context = ToolContext(
            user_id="brief_analyst",
            role=ToolRole.VIEWER,
            trace_id=str(trace_id),
        )

        # 1. Collecter les données
        try:
            brief_data = brief_get({"brief_id": brief_id}, context)
        except ValueError as e:
            return _get_fallback_response(f"Brief introuvable: {brief_id}")

        # Client (si lié)
        client_data = None
        history_data = None
        if brief_data.get("client_id"):
            try:
                client_data = client_get(
                    {"client_id": brief_data["client_id"]}, context
                )
                history_data = client_history(
                    {"client_id": brief_data["client_id"]}, context
                )
            except (ValueError, KeyError):
                pass

        # Pricing
        try:
            pricing_data = pricing_calculate({"brief_id": brief_id}, context)
        except (ValueError, KeyError):
            pricing_data = {"pricing": {}}

        # 2. Construire les prompts
        brief_context = build_brief_context(brief_data, client_data, history_data)
        pricing_context = build_pricing_context(pricing_data)

        user_prompt = (
            f"Voici les données du brief :\n{brief_context}\n\n"
            f"Voici les résultats du Pricing Engine (SOURCE DE VÉRITÉ) :\n{pricing_context}\n\n"
            "Génère ton analyse en JSON."
        )

        messages = [
            {"role": "system", "content": BRIEF_ANALYST_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        # 3. Appel IA
        trace = self.trace_service.start_ai_execution(
            trace_id=trace_id,
            agent=agent,
            provider="groq",
            model="llama-3.1-8b-instant",
            brief_id=brief_id,
        )

        try:
            response = get_ai_response(
                messages,
                model="llama-3.1-8b-instant",
                json_mode=True,
            )

            # 4. Parser la réponse
            result = parse_brief_analyst_response(response.content)

            # Enrichir avec les données Pricing Engine
            result["pricing"]["source"] = "pricing_engine"
            if pricing_data.get("pricing"):
                p = pricing_data["pricing"]
                result["pricing"]["prix_min_fcfa"] = p.get("prix_min_fcfa", 0)
                result["pricing"]["prix_max_fcfa"] = p.get("prix_max_fcfa", 0)
                result["pricing"]["heures_min"] = p.get("heures_min", 0)
                result["pricing"]["heures_max"] = p.get("heures_max", 0)

            # Enrichir le contexte client
            if history_data:
                summary = history_data.get("summary", {})
                nb_briefs = summary.get("total_briefs", 0)
                if nb_briefs == 0:
                    fidelite = "nouveau"
                elif nb_briefs <= 3:
                    fidelite = "régulier"
                else:
                    fidelite = "ancien"
                result["contexte_client"] = {
                    "fidélité": fidelite,
                    "nb_projets_precedents": nb_briefs,
                    "facturation_totale_fcfa": summary.get("total_invoiced_fcfa", 0),
                    "solde_du_fcfa": summary.get("balance_due_fcfa", 0),
                }

            # Traçabilité
            self.trace_service.complete_ai_execution(
                trace,
                input_tokens=response.input_tokens,
                output_tokens=response.output_tokens,
                cost_usd=response.cost_usd,
                duration_ms=response.duration_ms,
                status=ExecutionStatus.SUCCESS,
                prompt_content=user_prompt[:2000],
                response_content=response.content[:2000],
            )

            # Historisation
            self._save_analysis_history(
                brief_id=brief_id,
                result=result,
                response=response,
                model="llama-3.1-8b-instant",
                status="completed",
            )

            return result

        except Exception as e:
            logger.error("Erreur Brief Analyst: %s", e)

            self.trace_service.complete_ai_execution(
                trace,
                status=ExecutionStatus.ERROR,
                error_message=str(e),
            )

            fallback = _get_fallback_response(str(e))
            self._save_analysis_history(
                brief_id=brief_id,
                result=fallback,
                response=None,
                model="llama-3.1-8b-instant",
                status="failed",
            )

            return fallback

    def analyze_and_save(self, brief_id: str) -> dict[str, Any]:
        """Analyse un brief et sauvegarde le résultat dans brief.ai_analysis."""
        from api.models import Brief

        result = self.analyze(brief_id)

        try:
            brief = Brief.objects.get(id=brief_id)
            brief.ai_analysis = result
            brief.save(update_fields=["ai_analysis"])
        except Brief.DoesNotExist:
            logger.error("Brief introuvable pour sauvegarde: %s", brief_id)

        return result

    def _save_analysis_history(
        self,
        brief_id: str,
        result: dict,
        response,
        model: str = "llama-3.1-8b-instant",
        status: str = "completed",
    ) -> None:
        """Sauvegarde l'analyse dans BriefAIAnalysis pour historisation."""
        pricing = result.get("pricing", {})
        ctx_client = result.get("contexte_client", {})

        try:
            BriefAIAnalysis.objects.create(
                brief_id=brief_id,
                agent="brief_analyst",
                model=model,
                analysis_status=status,
                score_completude=result.get("score_completude", 0),
                complexite_percue=result.get("complexite_percue", 0),
                decision_recommandee=result.get("decision_recommandee", ""),
                statut_brief=result.get("statut_brief", ""),
                niveau_priorite=result.get("niveau_priorite", "Normal"),
                raison_decision=result.get("raison_decision", ""),
                informations_manquantes=result.get("informations_manquantes", []),
                questions_client=result.get("questions_client", []),
                risques=result.get("risques", []),
                pricing_prix_min=pricing.get("prix_min_fcfa", 0),
                pricing_prix_max=pricing.get("prix_max_fcfa", 0),
                pricing_heures_min=pricing.get("heures_min", 0),
                pricing_heures_max=pricing.get("heures_max", 0),
                client_fidelite=ctx_client.get("fidélité", "nouveau"),
                client_nb_projets=ctx_client.get("nb_projets_precedents", 0),
                client_solde_du=ctx_client.get("solde_du_fcfa", 0),
                input_tokens=getattr(response, "input_tokens", 0),
                output_tokens=getattr(response, "output_tokens", 0),
                cost_usd=getattr(response, "cost_usd", 0),
                duration_ms=getattr(response, "duration_ms", 0),
                full_response=result,
            )
        except Exception as e:
            logger.error("Erreur sauvegarde analyse IA: %s", e)
