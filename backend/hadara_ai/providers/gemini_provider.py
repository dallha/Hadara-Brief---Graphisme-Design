from __future__ import annotations

import time
import logging

from hadara_ai.providers.base import AbstractAIProvider, AIResponse

logger = logging.getLogger(__name__)


class GeminiProvider(AbstractAIProvider):
    """Provider pour Google Gemini via le SDK google-genai."""

    def chat(self, messages: list, **kwargs) -> AIResponse:
        return self._call(messages, json_mode=False, **kwargs)

    def chat_json(self, messages: list, **kwargs) -> AIResponse:
        return self._call(messages, json_mode=True, **kwargs)

    def health_check(self) -> bool:
        try:
            from google import genai

            client = genai.Client(api_key=self.api_key)
            # Appel minimal pour vérifier la connectivité
            client.models.generate_content(
                model=self.config.model_id,
                contents="ping",
            )
            return True
        except Exception:
            return False

    def _call(
        self, messages: list, json_mode: bool = False, **kwargs
    ) -> AIResponse:
        from google import genai
        from google.genai import types

        start = time.time()

        client = genai.Client(api_key=self.api_key)

        # Convertir les messages OpenAI-format vers le format Gemini
        contents = self._convert_messages(messages)

        config_kwargs = {}
        if json_mode:
            config_kwargs["response_mime_type"] = "application/json"

        response = client.models.generate_content(
            model=self.config.model_id,
            contents=contents,
            config=types.GenerateContentConfig(**config_kwargs)
            if config_kwargs
            else None,
        )

        output_text = response.text or ""

        # Estimation des tokens (Gemini ne fournit pas toujours le détail)
        input_tokens = getattr(response, "usage_metadata", None)
        prompt_tokens = 0
        completion_tokens = 0
        if input_tokens:
            prompt_tokens = getattr(input_tokens, "prompt_token_count", 0)
            completion_tokens = getattr(input_tokens, "candidates_token_count", 0)

        return AIResponse(
            content=output_text,
            model=self.config.model_id,
            provider="gemini",
            input_tokens=prompt_tokens,
            output_tokens=completion_tokens,
            cost_usd=self.calculate_cost(prompt_tokens, completion_tokens),
            duration_ms=int((time.time() - start) * 1000),
            raw={"text": output_text},
        )

    @staticmethod
    def _convert_messages(messages: list[dict]) -> str:
        """Convertit une liste de messages OpenAI-format en texte Gemini.

        Gemini utilise un format 'contents' simple (texte brut).
        On fusionne system + user en un seul prompt.
        """
        parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                parts.append(f"[INSTRUCTIONS]\n{content}\n[/INSTRUCTIONS]")
            else:
                parts.append(content)
        return "\n\n".join(parts)
