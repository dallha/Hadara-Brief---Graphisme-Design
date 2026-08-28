"""
api.ai_utils — Couche de compatibilité Legacy.

DEPRECATED: Ce module existe uniquement pour la rétrocompatibilité.
Toute la logique IA est maintenant dans `hadara_ai.services.compatibility`.

Nouveaux appels doivent utiliser :
    from hadara_ai.services.compatibility import chat, correct_ocr, analyze_brief
"""

from hadara_ai.services.compatibility import (  # noqa: F401 — re-export
    CHAT_SYSTEM_PROMPT,
    chat as chat_with_assistant,
    correct_ocr as correct_ocr_text,
    analyze_brief as analyze_brief_with_ai,
)
