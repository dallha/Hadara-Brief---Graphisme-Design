from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

CREATIVE_ASSISTANT_SYSTEM_PROMPT = """Tu es le Creative Assistant d'Hadara, un directeur artistique IA spécialisé dans la création graphique pour le marché ouest-africain.

RÈGLES ABSOLUES :
1. Tu fournis une DIRECTION artistique, pas des fichiers finaux.
2. Tu dois répondre UNIQUEMENT avec un objet JSON strict et valide.
3. Aucun texte avant ou après le JSON.
4. Tes conseils doivent être réalistes et applicables immédiatement.
5. Tu dois tenir compte du budget et du format demandé.

FORMAT JSON ATTENDU :
{
  "direction_artistique": {
    "concept_directeur": "Concept central en 3-5 mots",
    "ambiance": "Description de l'ambiance visuelle",
    "palette": [
      {"nom": "Nom de la couleur", "hex": "#RRGGBB", "usage": "À quoi sert cette couleur"}
    ],
    "typographies": [
      {"nom": "Nom de la police", "usage": "Titre/Corps/Accent", "style": "Description"}
    ],
    "composition": [
      "Principe de composition 1",
      "Principe de composition 2"
    ],
    "elements_visuels": [
      "Élément visuel recommandé 1",
      "Élément visuel recommandé 2"
    ]
  },
  "concepts_visuels": [
    {
      "titre": "Nom du concept",
      "description": "Description détaillée du concept visuel",
      "direction_artistique": "Ce qu'il faut vizuellement",
      "angle_marketing": "Pourquoi ça marche pour la cible",
      "ai_prompt": "Prompt détaillé pour génération d'image IA (style, couleurs, composition, ambiance)",
      "difficulte": "facile|moyen|complexe",
      "faisabilite": "immédiat|nécessite_maquette|référence_requise"
    }
  ],
  "conseils_production": {
    "logiciels_recommandes": ["Adobe Illustrator", "Canva Pro"],
    "formats_livraison": ["PDF haute résolution", "PNG transparent"],
    "resolution": "300 DPI pour impression, 72 DPI pour web",
    "erreurs_a_eviter": [
      "Erreur commune à éviter 1",
      "Erreur commune à éviter 2"
    ]
  },
  "livrables_recommandes": [
    {
      "nom": "Nom du livrable",
      "priorite": "haute|moyenne|basse",
      "justification": "Pourquoi ce livrable est important"
    }
  ],
  "accroche_visuelle": "Accroche ou slogan visuel pour le projet"
}"""


def build_creative_context(brief_data: dict, pricing_data: dict | None = None) -> str:
    """Construit le contexte pour le Creative Assistant."""
    parts = []
    parts.append(f"Type de projet: {brief_data.get('project_type', 'Non défini')}")
    parts.append(f"Objectif: {brief_data.get('primary_objective', 'Non défini')}")
    parts.append(f"Contexte: {brief_data.get('context_description', 'Non défini')}")
    parts.append(f"Cible: {brief_data.get('target_audience', 'Non défini')}")

    if brief_data.get("style_preferences"):
        parts.append(f"Styles demandés: {', '.join(brief_data['style_preferences'])}")
    if brief_data.get("preferred_colors"):
        parts.append(f"Couleurs préférées: {brief_data['preferred_colors']}")
    if brief_data.get("avoid_colors"):
        parts.append(f"Couleurs à éviter: {brief_data['avoid_colors']}")
    if brief_data.get("technical_format"):
        parts.append(f"Format: {brief_data['technical_format']}")
    if brief_data.get("budget_range"):
        parts.append(f"Budget: {brief_data['budget_range']}")
    if brief_data.get("main_title"):
        parts.append(f"Titre principal: {brief_data['main_title']}")
    if brief_data.get("full_text_content"):
        content = brief_data["full_text_content"][:500]
        parts.append(f"Contenu textuel: {content}")
    if brief_data.get("deliverable_versions"):
        parts.append(f"Livrables demandés: {len(brief_data['deliverable_versions'])} déclinaison(s)")

    if pricing_data:
        p = pricing_data.get("pricing", pricing_data)
        parts.append(f"Prix recommandé: {p.get('prix_min_fcfa', 0)}-{p.get('prix_max_fcfa', 0)} FCFA")
        parts.append(f"Complexité perçue: {p.get('score_complexite', 0)}/10")

    return "\n".join(parts)


def parse_creative_response(response_content: str) -> dict[str, Any]:
    """Parse et valide la réponse du Creative Assistant."""
    try:
        parsed = json.loads(response_content)
    except json.JSONDecodeError:
        logger.error("Réponse Creative Assistant non-JSON: %s", response_content[:200])
        return _get_creative_fallback("Réponse IA non-JSON")

    for field in ["direction_artistique", "concepts_visuels", "conseils_production", "livrables_recommandes"]:
        if field not in parsed:
            parsed[field] = _get_default_creative_field(field)

    return parsed


def _get_creative_fallback(reason: str) -> dict[str, Any]:
    return {
        "direction_artistique": {
            "concept_directeur": "Analyse creative indisponible",
            "ambiance": reason,
            "palette": [],
            "typographies": [],
            "composition": [],
            "elements_visuels": [],
        },
        "concepts_visuels": [],
        "conseils_production": {
            "logiciels_recommandes": [],
            "formats_livraison": [],
            "resolution": "",
            "erreurs_a_eviter": [],
        },
        "livrables_recommandes": [],
        "accroche_visuelle": "",
    }


def _get_default_creative_field(field: str) -> Any:
    defaults = {
        "direction_artistique": {
            "concept_directeur": "",
            "ambiance": "",
            "palette": [],
            "typographies": [],
            "composition": [],
            "elements_visuels": [],
        },
        "concepts_visuels": [],
        "conseils_production": {
            "logiciels_recommandes": [],
            "formats_livraison": [],
            "resolution": "",
            "erreurs_a_eviter": [],
        },
        "livrables_recommandes": [],
        "accroche_visuelle": "",
    }
    return defaults.get(field, "")
