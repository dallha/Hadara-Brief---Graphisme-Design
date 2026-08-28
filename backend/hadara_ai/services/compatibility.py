"""
AICompatibilityService — Façade unique pour les consommateurs Legacy.

Toute la couche `api/` passe par ici. Aucune logique provider ne doit
exister dans `api/`. Le migration se fait en remplaçant les appels
`api.ai_utils.*` par `hadara_ai.services.compatibility.*`.

Architecture :
    Legacy consumers (api/views.py, api/admin.py)
            │
            ▼
    AICompatibilityService  ← ce module
            │
            ▼
    Hadara AI Core (ai_service.py)
"""

from __future__ import annotations

import logging
import re
from typing import Any

from hadara_ai.services.ai_service import (
    get_ai_response,
    analyze_brief_with_ai as _core_analyze_brief,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Chatbot — Prompt système Mme Niass Madina
# ---------------------------------------------------------------------------

CHAT_SYSTEM_PROMPT = (
    "Tu es Mme Niass Madina, l'assistante IA du Studio Hadara.\n"
    "Tu accompagnes les clients dans leurs projets de graphisme et design.\n\n"
    "IDENTITÉ :\n"
    "- Studio de graphisme haut de gamme spécialisé dans l'identité visuelle\n"
    "- Marché ouest-africain, sensibilité culturelle forte\n"
    "- Tagline : 'Allier tradition et modernité'\n\n"
    "RÈGLES :\n"
    "1. Réponds toujours en français.\n"
    "2. Sois chaleureuse, professionnelle et concise.\n"
    "3. Pour les questions techniques (prix, délais), oriente vers le formulaire de brief.\n"
    "4. Ne donne jamais de prix ferme — oriente vers le formulaire.\n"
    "5. Si on te demande un devis, explique que le formulaire permet d'obtenir une estimation.\n"
    "6. Maximum 3-4 phrases par réponse.\n"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _strip_markdown(text: str) -> str:
    """Supprime les blocs de code Markdown (```json, ``` etc.)."""
    text = re.sub(r"```(?:json|python|text)?\s*\n?", "", text)
    text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE)
    return text.strip()


# ---------------------------------------------------------------------------
# API publique — les 3 fonctions que les Legacy consumers appellent
# ---------------------------------------------------------------------------


def chat(messages: list[dict[str, str]]) -> str:
    """Réponse du chatbot via le Hadara AI Core.

    Args:
        messages: [{role: "user"|"assistant", content: "..."}]

    Returns:
        Texte de réponse (nettoyé du markdown).
    """
    full_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}] + messages

    try:
        response = get_ai_response(
            full_messages,
            model="llama-3.1-8b-instant",
            json_mode=False,
            temperature=0.7,
            max_tokens=256,
        )
        return _strip_markdown(response.content)
    except Exception as e:
        logger.error("Erreur compatibility.chat: %s", e)
        return (
            "Désolé, je rencontre un problème technique. "
            "Vous pouvez nous contacter directement sur WhatsApp au +221 77 623 27 41."
        )


def correct_ocr(raw_text: str) -> str:
    """Correction OCR via le Hadara AI Core.

    Returns:
        Texte corrigé, ou le texte original en cas d'erreur.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "Tu es un correcteur de texte OCR. "
                "Corrige les fautes de frappe, les erreurs de reconnaissance de caractères, "
                "et améliore la lisibilité du texte. "
                "Réponds UNIQUEMENT avec le texte corrigé, sans commentaire."
            ),
        },
        {"role": "user", "content": raw_text},
    ]

    try:
        response = get_ai_response(
            messages,
            model="llama-3.1-8b-instant",
            json_mode=False,
            temperature=0.1,
            max_tokens=1024,
        )
        return response.content.strip()
    except Exception as e:
        logger.error("Erreur compatibility.correct_ocr: %s", e)
        return raw_text


def analyze_brief(brief: Any, pricing_result: dict) -> dict:
    """Analyse un brief via le Core IA.

    Délègue directement à `ai_service.analyze_brief_with_ai`.
    """
    return _core_analyze_brief(brief, pricing_result)
