from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

PRICING_AGENT_SYSTEM_PROMPT = """Tu es le Pricing Agent d'Hadara, un conseiller commercial expert en tarification de services graphiques pour le march\u00e9 ouest-africain.

R\u00c8GLES ABSOLUES :
1. Le Pricing Engine a D\u00c9J\u00c0 calcul\u00e9 les prix. Tu ne dois JAMAIS modifier prix_min, prix_max, heures ni d\u00e9lais.
2. Tu expliques le POURQUOI du prix, tu ne cr\u00e9es pas de prix.
3. Tu dois r\u00e9pondre UNIQUEMENT avec un objet JSON strict et valide.
4. Aucun texte avant ou apr\u00e8s le JSON.
5. Ton r\u00f4le : conseiller la strat\u00e9gie commerciale, pas calculer.

FORMAT JSON ATTENDU :
{
  "explication": {
    "resume": "Explication en 2-3 phrases du prix recommand\u00e9",
    "niveau_complexite": "faible|moyen|\u00e9lev\u00e9|tr\u00e8s_\u00e9lev\u00e9",
    "facteurs": [
      {"facteur": "Volume de livrables", "impact": "\u00e9lev\u00e9", "detail": "3 d\u00e9clinaisons demand\u00e9es"},
      {"facteur": "D\u00e9lai", "impact": "moyen", "detail": "5 jours ouvr\u00e9s"}
    ],
    "heures_estimees": {"min": 2, "max": 4, "justification": "..."}
  },
  "strategie_commerciale": {
    "positionnement": "standard|premium|\u00e9conomique",
    "argument_client": "Argument principal \u00e0 pr\u00e9senter au client",
    "approche": "comment_pr\u00e9senter le devis",
    "acompte_conseille_pourcentage": 50,
    "justification_acompte": "..."
  },
  "risques_commerciaux": [
    {"risque": "...", "probabilit\u00e9": "faible|moyenne|\u00e9lev\u00e9e", "mitigation": "..."}
  ],
  "contexte_client": {
    "type_relation": "nouveau|r\u00e9gulier|ancien|impay\u00e9",
    "note": "Impact de la relation client sur la strat\u00e9gie"
  },
  "brouillon_devis": "Bonjour, pour votre projet de [type], apr\u00e8s analyse de vos besoins, voici notre proposition : ..."
}"""


def build_pricing_context(pricing_data: dict, brief_data: dict) -> str:
    """Construit le contexte Pricing Engine pour le Pricing Agent."""
    pricing = pricing_data.get("pricing", pricing_data)
    context = {
        "prix_min_fcfa": pricing.get("prix_min_fcfa", 0),
        "prix_max_fcfa": pricing.get("prix_max_fcfa", 0),
        "heures_min": pricing.get("heures_min", 0),
        "heures_max": pricing.get("heures_max", 0),
        "delai_min_jours": pricing.get("delai_min_jours", 0),
        "delai_max_jours": pricing.get("delai_max_jours", 0),
        "score_completude": pricing.get("score_completude", 0),
        "score_complexite": pricing.get("score_complexite", 0),
        "acompte_conseille": pricing.get("acompte_conseille", 0),
        "type_projet": brief_data.get("project_type", ""),
        "budget_client": brief_data.get("budget_range", ""),
        "delai_souhaite": brief_data.get("desired_delivery_date", ""),
        "nb_livrables": len(brief_data.get("deliverable_versions", [])),
    }
    return json.dumps(context, ensure_ascii=False, indent=2)


def parse_pricing_agent_response(response_content: str) -> dict[str, Any]:
    """Parse et valide la r\u00e9ponse du Pricing Agent."""
    try:
        parsed = json.loads(response_content)
    except json.JSONDecodeError:
        logger.error("R\u00e9ponse Pricing Agent non-JSON: %s", response_content[:200])
        return _get_pricing_fallback("R\u00e9ponse IA non-JSON")

    required = ["explication", "strategie_commerciale"]
    for field in required:
        if field not in parsed:
            parsed[field] = _get_default_field(field)

    return parsed


def _get_pricing_fallback(reason: str) -> dict[str, Any]:
    return {
        "explication": {
            "resume": f"Analyse tarifaire indisponible ({reason}). V\u00e9rification manuelle requise.",
            "niveau_complexite": "moyen",
            "facteurs": [],
            "heures_estimees": {"min": 0, "max": 0, "justification": "Indisponible"},
        },
        "strategie_commerciale": {
            "positionnement": "standard",
            "argument_client": "Tarification \u00e0 d\u00e9finir manuellement",
            "approche": "Consulter le designer",
            "acompte_conseille_pourcentage": 50,
            "justification_acompte": "Standard Hadara",
        },
        "risques_commerciaux": [],
        "contexte_client": {
            "type_relation": "nouveau",
            "note": "Contexte indisponible",
        },
        "brouillon_devis": "",
    }


def _get_default_field(field: str) -> Any:
    defaults = {
        "explication": {
            "resume": "Analyse incompl\u00e8te",
            "niveau_complexite": "moyen",
            "facteurs": [],
            "heures_estimees": {"min": 0, "max": 0, "justification": ""},
        },
        "strategie_commerciale": {
            "positionnement": "standard",
            "argument_client": "",
            "approche": "",
            "acompte_conseille_pourcentage": 50,
            "justification_acompte": "",
        },
        "risques_commerciaux": [],
        "contexte_client": {"type_relation": "nouveau", "note": ""},
        "brouillon_devis": "",
    }
    return defaults.get(field, "")
