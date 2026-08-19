"""Communication Agent — Transforme les analyses IA en messages professionnels.

Consomme les sorties du Brief Analyst, Pricing Agent et Creative Assistant
pour produire des communications client adaptées au contexte.
"""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

COMMUNICATION_AGENT_SYSTEM_PROMPT = """Tu es le Communication Agent d'Hadara, un spécialiste en communication client pour un studio de graphisme haut de gamme ouest-africain.

Ton rôle : transformer les analyses internes en messages professionnels, clairs et convaincants pour le client.

RÈGLES :
1. Répondre UNIQUEMENT avec un objet JSON strict et valide.
2. Aucun texte avant ou après le JSON.
3. Ton : professionnel, chaleureux, expert — jamais froid ni technique.
4. S'adapter au type de message demandé.
5. Inclure TOUJOURS un brouillon WhatsApp prêt à envoyer.
6. Ne jamais révéler les détails internes (prix cost, marge, scoring IA).

TYPES DE MESSAGES DISPONIBLES :
- "proposition" : présentation de l'offre et du projet
- "devis" : explication détaillée du prix et des prestations
- "relance" : relance client après absence de réponse
- "livraison" : annonce de la livraison du projet
- "acceptation" : confirmation après acceptation du client
- "complet" : tous les messages en séquence

FORMAT JSON ATTENDU :
{
  "type_message": "proposition|devis|relance|livraison|acceptation|complet",
  "ton": "professionnel|chaleureux|formel|entreprenant",
  "messages": {
    "whatsapp": "Message WhatsApp formaté (emojis OK, paragraphes courts)",
    "email": "Version email formelle (si pertinent)",
    "sms": "Version SMS courte (si pertinent)"
  },
  "objets_email": [
    "Objet email option 1",
    "Objet email option 2"
  ],
  "points_cles": [
    "Point clé 1 à retenir",
    "Point clé 2 à retenir"
  ],
  "prochaine_action": "Ce que le client doit faire ensuite",
  "timing_conseille": "Quand envoyer ce message",
  "alertes_internes": [
    "Alerte interne pour le graphiste"
  ]
}"""


def build_communication_context(
    brief_data: dict,
    analyst_result: dict | None = None,
    pricing_result: dict | None = None,
    creative_result: dict | None = None,
) -> str:
    """Construit le contexte combiné des 3 agents pour le Communication Agent."""
    parts = []

    parts.append("=== DONNÉES DU BRIEF ===")
    parts.append(f"Client: {brief_data.get('client_name', brief_data.get('client', 'Client'))}")
    parts.append(f"Projet: {brief_data.get('project_type', 'Non défini')}")
    parts.append(f"Objectif: {brief_data.get('primary_objective', 'Non défini')}")
    parts.append(f"Budget déclaré: {brief_data.get('budget_range', 'Non défini')}")
    parts.append(f"Délai: {brief_data.get('desired_delivery_date', 'Non défini')}")

    if brief_data.get("deliverable_versions"):
        parts.append(f"Livrables: {len(brief_data['deliverable_versions'])} déclinaison(s)")

    if analyst_result:
        parts.append("\n=== ANALYSE BRIEF ANALYST ===")
        parts.append(f"Score complétude: {analyst_result.get('score_completude', 0)}%")
        parts.append(f"Décision: {analyst_result.get('decision_recommandee', 'N/A')}")
        parts.append(f"Statut: {analyst_result.get('statut_brief', 'N/A')}")
        if analyst_result.get("risques"):
            parts.append(f"Risques: {', '.join(analyst_result['risques'][:3])}")
        if analyst_result.get("questions_client"):
            parts.append(f"Questions: {', '.join(analyst_result['questions_client'][:3])}")

    if pricing_result:
        parts.append("\n=== TARIFICATION PRICING AGENT ===")
        price = pricing_result.get("prix_recommande", {})
        parts.append(f"Prix: {price.get('min', 0)}-{price.get('max', 0)} FCFA")
        explication = pricing_result.get("explication", {})
        parts.append(f"Complexité: {explication.get('niveau_complexite', 'N/A')}")
        strategie = pricing_result.get("strategie_commerciale", {})
        parts.append(f"Positionnement: {strategie.get('positionnement', 'N/A')}")
        parts.append(f"Argument: {strategie.get('argument_client', 'N/A')}")
        parts.append(f"Acompte: {strategie.get('acompte_conseille_pourcentage', 0)}%")
        if pricing_result.get("risques_commerciaux"):
            parts.append("Risques:")
            for r in pricing_result["risques_commerciaux"][:3]:
                parts.append(f"  - {r.get('risque', '')} ({r.get('probabilité', '')})")

    if creative_result:
        parts.append("\n=== DIRECTION CRÉATIVE ===")
        direction = creative_result.get("direction_artistique", {})
        parts.append(f"Concept: {direction.get('concept_directeur', 'N/A')}")
        parts.append(f"Ambiance: {direction.get('ambiance', 'N/A')}")
        parts.append(f"Nombre de concepts: {len(creative_result.get('concepts_visuels', []))}")
        livrables = creative_result.get("livrables_recommandes", [])
        if livrables:
            parts.append(f"Livrables: {', '.join(l.get('nom', '') for l in livrables[:5])}")

    return "\n".join(parts)


def parse_communication_response(response_content: str) -> dict[str, Any]:
    """Parse et valide la réponse du Communication Agent."""
    try:
        parsed = json.loads(response_content)
    except json.JSONDecodeError:
        logger.error("Réponse Communication Agent non-JSON: %s", response_content[:200])
        return _get_communication_fallback("Réponse IA non-JSON")

    for field in ["type_message", "ton", "messages", "points_cles", "prochaine_action"]:
        if field not in parsed:
            parsed[field] = _get_default_communication_field(field)

    return parsed


def _get_communication_fallback(reason: str) -> dict[str, Any]:
    return {
        "type_message": "proposition",
        "ton": "professionnel",
        "messages": {
            "whatsapp": f"[Communication indisponible — {reason}]",
            "email": "",
            "sms": "",
        },
        "objets_email": [],
        "points_cles": [],
        "prochaine_action": "",
        "timing_conseille": "",
        "alertes_internes": [reason],
    }


def _get_default_communication_field(field: str) -> Any:
    defaults = {
        "type_message": "proposition",
        "ton": "professionnel",
        "messages": {"whatsapp": "", "email": "", "sms": ""},
        "objets_email": [],
        "points_cles": [],
        "prochaine_action": "",
        "timing_conseille": "",
        "alertes_internes": [],
    }
    return defaults.get(field, "")
