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
from hadara_ai.services.public_chat import public_chat as public_chat_instance

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
    "RÈGLES IMPORTANTES :\n"
    "1. Réponds toujours en français.\n"
    "2. Sois chaleureuse, professionnelle et concise.\n"
    "3. Pour les questions sur les prix, utilise TOUJOURS les estimations fournie"
    "par le système. NE JAMAIS inventer de prix.\n"
    "4. Si on te demande un devis, oriente vers le formulaire de brief.\n"
    "5. Si les informations sont insuffisantes pour un prix, pose 1-3 questions "
    "ciblées (dimensions, quantité, délai).\n"
    "6. Maximum 3-4 phrases par réponse.\n"
    "7. Tu peux donner des fourchettes de prix si elles sont fournies par le systèm"
    "e.\n"
    "8. Le formulaire brief est une étape d'approfondissement, pas une réponse par "
    "défaut.\n\n"
    "SERVICES DU STUDIO :\n"
    "- Logo professionnel (35 000 - 90 000 FCFA)\n"
    "- Identité de marque complète (90 000 - 250 000 FCFA)\n"
    "- Charte graphique (60 000 - 150 000 FCFA)\n"
    "- Affiche publicitaire (18 000 - 55 000 FCFA)\n"
    "- Bâche grand format (15 000 - 45 000 FCFA)\n"
    "- Flyer (10 000 - 28 000 FCFA)\n"
    "- Brochure (30 000 - 90 000 FCFA)\n"
    "- Site web (150 000 - 500 000 FCFA)\n"
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
    # Si c'est le premier message de l'utilisateur, utiliser le PublicChatService
    # pour la détection d'intention et les réponses déterministes
    if len(messages) <= 1:
        user_message = messages[-1]["content"] if messages else ""
        try:
            response = public_chat_instance.process_message(user_message)
            return _strip_markdown(response)
        except Exception as e:
            logger.error("Erreur public_chat: %s", e)
            # Continuer avec le LLM en cas d'erreur

    # Pour les conversations suivantes, utiliser le LLM avec le contexte métier
    full_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}] + messages

    try:
        response = get_ai_response(
            full_messages,
            model="openai/gpt-oss-20b",
            json_mode=False,
            temperature=0.7,
            max_tokens=256,
        )
        return _strip_markdown(response.content)
    except Exception as e:
        error_msg = str(e).lower()
        logger.error("Erreur compatibility.chat: %s", e)

        # Catégoriser l'erreur pour un message plus informatif
        if "non disponible" in error_msg or "provider" in error_msg:
            return (
                "Le service IA n'est pas encore configuré. "
                "Vous pouvez nous contacter sur WhatsApp au +221 77 623 27 41."
            )
        elif "401" in error_msg or "unauthorized" in error_msg:
            return (
                "Problème d'authentification du service IA. "
                "Contactez-nous sur WhatsApp au +221 77 623 27 41."
            )
        elif "429" in error_msg or "rate" in error_msg:
            return (
                "Trop de demandes en cours. Réessayez dans un instant, "
                "ou contactez-nous sur WhatsApp au +221 77 623 27 41."
            )
        elif "timeout" in error_msg or "timed out" in error_msg:
            return (
                "Le service IA响应超时. Réessayez dans un instant, "
                "ou contactez-nous sur WhatsApp au +221 77 623 27 41."
            )
        else:
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
            model="openai/gpt-oss-20b",
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
