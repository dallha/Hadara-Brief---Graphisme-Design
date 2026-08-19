from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

BRIEF_ANALYST_SYSTEM_PROMPT = """Tu es le Brief Analyst d'Hadara, un expert en analyse de briefs graphiques pour le marché ouest-africain.

RÈGLES ABSOLUES :
1. Le Pricing Engine a DÉJÀ calculé les prix, heures et délais. Tu ne dois JAMAIS les modifier.
2. Tu dois répondre UNIQUEMENT avec un objet JSON strict et valide.
3. Aucun texte avant ou après le JSON, pas de balises Markdown.
4. Le champ "pricing.source" doit toujours être "pricing_engine".
5. Tu distingues un brief "incomplet" d'un brief avec "informations manquantes".

FORMAT JSON ATTENDU :
{
  "statut_brief": "exploitable|exploitable_sous_reserve|incomplet|refuser",
  "score_completude": <entier 0-100>,
  "complexite_percue": <entier 1-10>,
  "decision_recommandee": "ACCEPTER|ACCEPTER SOUS RÉSERVE|CLARIFIER|REFUSER",
  "raison_decision": "Explication courte de la décision (max 2 phrases)",
  "informations_manquantes": ["Format final", "Budget"],
  "questions_client": ["Quel est le format final ?"],
  "risques": ["Délai trop court pour le volume demandé"],
  "niveau_priorite": "Normal|Urgent",
  "brouillon_whatsapp": "Bonjour, ... (1-2 phrases courtes max)",
  "pricing": {
    "prix_min_fcfa": <entier>,
    "prix_max_fcfa": <entier>,
    "heures_min": <entier>,
    "heures_max": <entier>,
    "source": "pricing_engine"
  },
  "contexte_client": {
    "fidélité": "nouveau|régulier|ancien",
    "nb_projets_precedents": <entier>,
    "facturation_totale_fcfa": <entier>,
    "solde_du_fcfa": <entier>
  }
}"""


def build_brief_context(brief_data: dict, client_data: dict | None, history_data: dict | None) -> str:
    """Construit le contexte AI-safe pour le Brief Analyst."""
    context_parts = []

    # Brief (sans PII)
    context_parts.append("=== BRIEF ===")
    context_parts.append(f"Type de projet: {brief_data.get('project_type', 'Non défini')}")
    context_parts.append(f"Objectif: {brief_data.get('primary_objective', 'Non défini')}")
    context_parts.append(f"Contexte: {brief_data.get('context_description', 'Non défini')}")
    context_parts.append(f"Cible: {brief_data.get('target_audience', 'Non défini')}")

    if brief_data.get("style_preferences"):
        context_parts.append(f"Styles: {', '.join(brief_data['style_preferences'])}")
    if brief_data.get("preferred_colors"):
        context_parts.append(f"Couleurs préférées: {brief_data['preferred_colors']}")
    if brief_data.get("avoid_colors"):
        context_parts.append(f"Couleurs à éviter: {brief_data['avoid_colors']}")
    if brief_data.get("technical_format"):
        context_parts.append(f"Format: {brief_data['technical_format']}")
    if brief_data.get("budget_range"):
        context_parts.append(f"Budget: {brief_data['budget_range']}")
    if brief_data.get("desired_delivery_date"):
        context_parts.append(f"Délai souhaité: {brief_data['desired_delivery_date']}")
    if brief_data.get("critical_deadline"):
        context_parts.append(f"Délai critique: {brief_data['critical_deadline']}")
    if brief_data.get("deliverable_versions"):
        context_parts.append(f"Livrables: {len(brief_data['deliverable_versions'])} déclinaison(s)")

    # Client (si disponible)
    if client_data:
        context_parts.append("\n=== CLIENT ===")
        context_parts.append(f"Organisation: {client_data.get('organization', 'Non renseigné')}")

    # Historique client
    if history_data:
        summary = history_data.get("summary", {})
        context_parts.append("\n=== HISTORIQUE CLIENT ===")
        context_parts.append(f"Nombre de projets précédents: {summary.get('total_briefs', 0)}")
        context_parts.append(f"Facturation totale: {summary.get('total_invoiced_fcfa', 0)} FCFA")
        context_parts.append(f"Total payé: {summary.get('total_paid_fcfa', 0)} FCFA")
        context_parts.append(f"Solde dû: {summary.get('balance_due_fcfa', 0)} FCFA")

    return "\n".join(context_parts)


def build_pricing_context(pricing_data: dict) -> str:
    """Construit le contexte Pricing Engine."""
    pricing = pricing_data.get("pricing", pricing_data)
    return json.dumps({
        "prix_min_fcfa": pricing.get("prix_min_fcfa", 0),
        "prix_max_fcfa": pricing.get("prix_max_fcfa", 0),
        "heures_min": pricing.get("heures_min", 0),
        "heures_max": pricing.get("heures_max", 0),
        "delai_min_jours": pricing.get("delai_min_jours", 0),
        "delai_max_jours": pricing.get("delai_max_jours", 0),
        "score_completude": pricing.get("score_completude", 0),
        "score_complexite": pricing.get("score_complexite", 0),
        "acompte_conseille": pricing.get("acompte_conseille", 0),
    }, ensure_ascii=False, indent=2)


def parse_brief_analyst_response(response_content: str) -> dict[str, Any]:
    """Parse et valide la réponse du Brief Analyst."""
    try:
        parsed = json.loads(response_content)
    except json.JSONDecodeError:
        logger.error("Réponse Brief Analyst non-JSON: %s", response_content[:200])
        return _get_fallback_response("Réponse IA non-JSON")

    # Valider les champs requis
    required_fields = [
        "statut_brief", "score_completude", "complexite_percue",
        "decision_recommandee", "raison_decision", "pricing",
    ]
    missing = [f for f in required_fields if f not in parsed]
    if missing:
        logger.warning("Champs manquants dans la réponse: %s", missing)
        for f in missing:
            parsed[f] = _get_default_value(f)

    # S'assurer que pricing.source = pricing_engine
    if "pricing" in parsed:
        parsed["pricing"]["source"] = "pricing_engine"

    return parsed


def _get_fallback_response(reason: str) -> dict[str, Any]:
    """Retourne une réponse dégradée mais valide."""
    return {
        "statut_brief": "exploitable_sous_reserve",
        "score_completude": 50,
        "complexite_percue": 5,
        "decision_recommandee": "ACCEPTER SOUS RÉSERVE",
        "raison_decision": f"Analyse IA indisponible ({reason}). Vérification manuelle requise.",
        "informations_manquantes": ["Vérification manuelle requise"],
        "questions_client": [],
        "risques": ["Analyse de risques indisponible"],
        "niveau_priorite": "Normal",
        "brouillon_whatsapp": "",
        "pricing": {
            "prix_min_fcfa": 0,
            "prix_max_fcfa": 0,
            "heures_min": 0,
            "heures_max": 0,
            "source": "pricing_engine",
        },
        "contexte_client": {
            "fidélité": "nouveau",
            "nb_projets_precedents": 0,
            "facturation_totale_fcfa": 0,
            "solde_du_fcfa": 0,
        },
    }


def _get_default_value(field: str) -> Any:
    """Valeurs par défaut pour les champs manquants."""
    defaults = {
        "statut_brief": "exploitable_sous_reserve",
        "score_completude": 50,
        "complexite_percue": 5,
        "decision_recommandee": "ACCEPTER SOUS RÉSERVE",
        "raison_decision": "Analyse incomplète",
        "informations_manquantes": [],
        "questions_client": [],
        "risques": [],
        "niveau_priorite": "Normal",
        "brouillon_whatsapp": "",
        "pricing": {
            "prix_min_fcfa": 0,
            "prix_max_fcfa": 0,
            "heures_min": 0,
            "heures_max": 0,
            "source": "pricing_engine",
        },
    }
    return defaults.get(field, "")
