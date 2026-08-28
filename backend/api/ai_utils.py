import logging
import re

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# chat_with_assistant — Connecte le chatbot public au Hadara AI Core
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


def _strip_markdown(text: str) -> str:
    """Supprime les blocs de code Markdown (```json, ``` etc.)."""
    text = re.sub(r"```(?:json|python|text)?\s*\n?", "", text)
    text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE)
    return text.strip()


def chat_with_assistant(messages: list[dict[str, str]]) -> str:
    """Génère une réponse du chatbot via le Hadara AI Core.

    Args:
        messages: Liste de messages [{role: "user"|"assistant", content: "..."}]

    Returns:
        Texte de réponse de l'assistant.

    Fallback:
        Si le provider IA est indisponible, retourne un message de secours.
    """
    from hadara_ai.services.ai_service import get_ai_response

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
        logger.error("Erreur chat_with_assistant: %s", e)
        return (
            "Désolé, je rencontre un problème technique. "
            "Vous pouvez nous contacter directement sur WhatsApp au +221 77 309 99 58."
        )


def correct_ocr_text(raw_text: str) -> str:
    """Corrige le texte OCR via le Hadara AI Core.

    DEPRECATED: Endpoint legacy, à supprimer après migration.
    """
    from hadara_ai.services.ai_service import get_ai_response

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
        logger.error("Erreur correct_ocr_text: %s", e)
        return raw_text
