from __future__ import annotations

import json
import logging
from typing import Any

from hadara_ai.providers.base import AIResponse
from hadara_ai.providers.registry import ProviderRegistry

logger = logging.getLogger(__name__)

# Instance de service — initialisée à la demande, pas singleton figé.
# Le registry peut être réinitialisé après modification de la config DB.
_registry = ProviderRegistry()


def get_registry() -> ProviderRegistry:
    return _registry


def get_ai_response(
    messages: list[dict[str, str]],
    model: str = "openai/gpt-oss-20b",
    json_mode: bool = False,
    **kwargs: Any,
) -> AIResponse:
    """Facade unifiée pour les appels IA."""
    provider = _registry.get_provider(model)
    if not provider:
        raise ValueError(f"Provider non disponible pour le modèle: {model}")

    if json_mode:
        return provider.chat_json(messages, **kwargs)
    return provider.chat(messages, **kwargs)


# ---------------------------------------------------------------------------
# analyze_brief_with_ai — conserve la signature d'origine (non-régression)
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "Tu es l'assistant IA 'Hadara AI', expert en gestion de projets graphiques.\n"
    "RÈGLE ABSOLUE N°1 : Le Pricing Engine a DÉJÀ calculé les prix, heures, et délais. "
    "Tu ne dois JAMAIS inventer, modifier, ou suggérer de tarifs, d'heures ou de délais. "
    "Le Pricing Engine est la SEULE source de vérité pour les finances.\n\n"
    "RÈGLE ABSOLUE N°2 : Tu dois répondre UNIQUEMENT avec un objet JSON strict et valide. "
    "Aucun texte avant ou après, pas de balises Markdown (pas de ```json).\n\n"
    "Distingue bien un brief 'incomplet' (impossible à démarrer, manque description/objectif) "
    "d'un brief avec 'informations manquantes' (budget absent, format absent) qui reste "
    "'exploitable_sous_reserve'.\n\n"
    "Format JSON strict attendu :\n"
    "{\n"
    '  "statut_brief": "exploitable|exploitable_sous_reserve|incomplet|refuser",\n'
    '  "score_completude": <entier 0-100>,\n'
    '  "complexite_percue": <entier 1-10>,\n'
    '  "decision_recommandee": "ACCEPTER|ACCEPTER SOUS RÉSERVE|CLARIFIER|REFUSER",\n'
    '  "raison_decision": "Explication courte de la décision (max 2 phrases)",\n'
    '  "informations_manquantes": ["Format final", "Budget"],\n'
    '  "questions_client": ["Quel est le format final ?"],\n'
    '  "risques": ["Délai trop court pour le volume demandé"],\n'
    '  "niveau_priorite": "Normal|Urgent",\n'
    '  "brouillon_whatsapp": "Bonjour, ... (1-2 phrases courtes max)"\n'
    "}"
)


def analyze_brief_with_ai(brief: Any, pricing_result: dict) -> dict:
    """Analyse un brief via le Provider IA.

    Garanties :
    1. Ne calcule jamais de prix (utilise pricing_result).
    2. Ne transmet aucune donnée personnelle (AI-Safe).
    3. Exige un format JSON strict.
    4. Ne plante jamais en cas de panne de l'IA (fallback propre).
    5. Conserve les données du Pricing Engine séparément.
    """
    final_result: dict[str, Any] = {
        "engine_version": pricing_result.get("engine_version", "pricing-v1.0"),
        "pricing": {
            "prix_min": pricing_result.get("prix_min_fcfa", 0),
            "prix_max": pricing_result.get("prix_max_fcfa", 0),
            "heures_min": pricing_result.get("heures_min", 0),
            "heures_max": pricing_result.get("heures_max", 0),
            "delai_min_jours": pricing_result.get("delai_min_jours", 0),
            "delai_max_jours": pricing_result.get("delai_max_jours", 0),
            "complexite": pricing_result.get("score_complexite", 0),
            "acompte_conseille": pricing_result.get("acompte_conseille", 0),
        },
        "ai": None,
    }

    # Objet AI-Safe — aucune donnée personnelle
    ai_safe_brief = {
        "type_projet": brief.project_type or brief.project_type_custom or "Non défini",
        "contexte_description": brief.context_description or "Non défini",
        "objectif_principal": brief.primary_objective or "Non défini",
        "cible": brief.target_audience or "Non défini",
        "format_technique": brief.technical_format or "Non défini",
        "budget_client": brief.budget_range or "Non défini",
        "delai_souhaite": brief.desired_delivery_date or "Non défini",
        "delai_critique": brief.critical_deadline or "Non défini",
        "styles_souhaites": brief.style_preferences or [],
        "titre_principal": brief.main_title or "Non défini",
    }

    user_prompt = (
        "Voici les données anonymisées (AI-safe) du brief :\n"
        f"{json.dumps(ai_safe_brief, ensure_ascii=False, indent=2)}\n\n"
        "Voici les résultats du Pricing Engine (SOURCE DE VÉRITÉ, NE PAS MODIFIER) :\n"
        f"{json.dumps(final_result['pricing'], ensure_ascii=False, indent=2)}\n\n"
        "Génère ton analyse en JSON."
    )

    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    try:
        response = get_ai_response(
            messages, model="openai/gpt-oss-20b", json_mode=True
        )
        ai_data = json.loads(response.content)
        final_result["ai"] = ai_data
    except Exception as e:
        logger.error("Erreur AI: %s", e)
        final_result["ai"] = _get_fallback_ai(pricing_result, str(e))

    return final_result


def _get_fallback_ai(pricing_result: dict, reason: str) -> dict:
    """Retourne une structure IA dégradée mais valide en cas d'erreur."""
    return {
        "statut_brief": "exploitable_sous_reserve",
        "score_completude": pricing_result.get("score_completude", 50),
        "complexite_percue": pricing_result.get("score_complexite", 5),
        "decision_recommandee": "ACCEPTER SOUS RÉSERVE",
        "raison_decision": (
            f"Analyse IA indisponible ({reason}). "
            "Le moteur métier a été appliqué avec succès."
        ),
        "informations_manquantes": [
            "Vérification manuelle requise (IA hors-ligne)"
        ],
        "questions_client": [],
        "risques": ["Analyse de risques indisponible"],
        "niveau_priorite": "Normal",
        "brouillon_whatsapp": "",
    }
