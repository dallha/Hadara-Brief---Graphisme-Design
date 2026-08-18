from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class AIResponse:
    content: str
    model: str
    provider: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    duration_ms: int = 0
    raw: dict[str, Any] | None = None


class AbstractAIProvider(ABC):
    def __init__(self, provider_config: Any, api_key: str):
        self.config = provider_config
        self.api_key = api_key

    @abstractmethod
    def chat(self, messages: list, **kwargs) -> AIResponse:
        ...

    @abstractmethod
    def chat_json(self, messages: list, **kwargs) -> AIResponse:
        ...

    @abstractmethod
    def health_check(self) -> bool:
        ...

    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        return (
            input_tokens * float(self.config.cost_per_input_token)
            + output_tokens * float(self.config.cost_per_output_token)
        )
