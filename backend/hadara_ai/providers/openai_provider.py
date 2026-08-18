from __future__ import annotations

import time
import logging

import requests

from hadara_ai.providers.base import AbstractAIProvider, AIResponse

logger = logging.getLogger(__name__)


class OpenAIProvider(AbstractAIProvider):
    BASE_URL = "https://api.openai.com/v1/chat/completions"

    def chat(self, messages: list, **kwargs) -> AIResponse:
        return self._call(messages, response_format=None, **kwargs)

    def chat_json(self, messages: list, **kwargs) -> AIResponse:
        return self._call(
            messages,
            response_format={"type": "json_object"},
            **kwargs,
        )

    def health_check(self) -> bool:
        try:
            resp = requests.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5,
            )
            return resp.status_code == 200
        except Exception:
            return False

    def _call(
        self, messages: list, response_format: dict | None = None, **kwargs
    ) -> AIResponse:
        start = time.time()

        payload: dict = {
            "model": self.config.model_id,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.2),
        }
        if response_format:
            payload["response_format"] = response_format

        response = requests.post(
            self.BASE_URL,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=kwargs.get("timeout", 15),
        )
        response.raise_for_status()

        data = response.json()
        choice = data["choices"][0]
        usage = data.get("usage", {})

        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)

        return AIResponse(
            content=choice["message"]["content"],
            model=self.config.model_id,
            provider="openai",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=self.calculate_cost(input_tokens, output_tokens),
            duration_ms=int((time.time() - start) * 1000),
            raw=data,
        )
