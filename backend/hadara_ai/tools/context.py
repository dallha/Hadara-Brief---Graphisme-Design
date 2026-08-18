from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ToolPermission(Enum):
    READ = "read"
    WRITE = "write"
    CRITICAL = "critical"


class ToolRole(Enum):
    VIEWER = "viewer"
    OPERATOR = "operator"
    ADMIN = "admin"


ROLE_HIERARCHY = {
    ToolRole.VIEWER: 0,
    ToolRole.OPERATOR: 1,
    ToolRole.ADMIN: 2,
}


@dataclass
class ToolContext:
    """Contexte passé à chaque tool lors de l'exécution."""
    user_id: str
    role: ToolRole = ToolRole.VIEWER
    trace_id: str = ""
    tenant_id: str = ""


@dataclass
class ToolResult:
    """Résultat standardisé d'une exécution de tool."""
    success: bool
    data: dict[str, Any] = field(default_factory=dict)
    error: str = ""
    tool_name: str = ""
    execution_ms: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "tool_name": self.tool_name,
            "execution_ms": self.execution_ms,
        }
