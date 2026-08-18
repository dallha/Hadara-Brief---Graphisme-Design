from __future__ import annotations

import logging
import time
from typing import Any, Callable

from hadara_ai.tools.context import (
    ToolContext,
    ToolPermission,
    ToolResult,
    ToolRole,
    ROLE_HIERARCHY,
)

logger = logging.getLogger(__name__)


class ToolError(Exception):
    pass


class ToolRegistryError(Exception):
    pass


class ToolDefinition:
    """Déclaration d'un outil. La DB peut stocker ces métadonnées,
    mais l'exécution passe toujours par le WHITELIST Python."""

    def __init__(
        self,
        name: str,
        description: str,
        permission: ToolPermission,
        parameters: dict[str, Any] | None = None,
        enabled: bool = True,
    ):
        self.name = name
        self.description = description
        self.permission = permission
        self.parameters = parameters or {}
        self.enabled = enabled


class ToolRegistry:
    """Registre central des outils Hadara AI.

    Règle : l'implémentation Python vient du WHITELIST, jamais de la DB.
    La DB peut déclarer les métadonnées, mais pas exécuter du code.
    """

    def __init__(self):
        self._definitions: dict[str, ToolDefinition] = {}
        self._implementations: dict[str, Callable] = {}
        self._role_requirements: dict[str, ToolRole] = {}

    def register(
        self,
        definition: ToolDefinition,
        implementation: Callable[[dict, ToolContext], dict],
        min_role: ToolRole = ToolRole.VIEWER,
    ) -> None:
        """Enregistre un outil dans le registry."""
        self._definitions[definition.name] = definition
        self._implementations[definition.name] = implementation
        self._role_requirements[definition.name] = min_role

    def get_definition(self, name: str) -> ToolDefinition:
        if name not in self._definitions:
            raise ToolRegistryError(f"Outil inconnu: {name}")
        return self._definitions[name]

    def is_registered(self, name: str) -> bool:
        return name in self._definitions

    def is_enabled(self, name: str) -> bool:
        if name not in self._definitions:
            return False
        return self._definitions[name].enabled

    def list_tools(self) -> list[ToolDefinition]:
        return list(self._definitions.values())

    def disable(self, name: str) -> None:
        if name in self._definitions:
            self._definitions[name].enabled = False

    def enable(self, name: str) -> None:
        if name in self._definitions:
            self._definitions[name].enabled = True

    def execute(
        self, tool_name: str, arguments: dict[str, Any], context: ToolContext
    ) -> ToolResult:
        """Exécute un outil avec validation complète."""
        start = time.monotonic()

        # 1. Outil enregistré ?
        if tool_name not in self._definitions:
            return ToolResult(
                success=False,
                error=f"Outil inconnu: {tool_name}",
                tool_name=tool_name,
            )

        definition = self._definitions[tool_name]

        # 2. Outil activé ?
        if not definition.enabled:
            return ToolResult(
                success=False,
                error=f"Outil désactivé: {tool_name}",
                tool_name=tool_name,
            )

        # 3. Permission check
        allowed_role = self._role_requirements.get(tool_name, ToolRole.VIEWER)
        if ROLE_HIERARCHY.get(context.role, 0) < ROLE_HIERARCHY.get(allowed_role, 0):
            return ToolResult(
                success=False,
                error=f"Rôle insuffisant: {context.role.value} < {allowed_role.value} requis",
                tool_name=tool_name,
            )

        # 4. Confirmation requise pour les actions critiques
        if definition.permission in (ToolPermission.WRITE, ToolPermission.CRITICAL):
            return ToolResult(
                success=False,
                error=f"Action nécessitant confirmation humaine: {tool_name}",
                tool_name=tool_name,
            )

        # 5. Validation des arguments
        required_params = definition.parameters.get("required", [])
        missing = [p for p in required_params if p not in arguments]
        if missing:
            return ToolResult(
                success=False,
                error=f"Arguments manquants: {', '.join(missing)}",
                tool_name=tool_name,
            )

        # 6. Exécution
        try:
            impl = self._implementations[tool_name]
            data = impl(arguments, context)
            elapsed = int((time.monotonic() - start) * 1000)
            return ToolResult(
                success=True,
                data=data,
                tool_name=tool_name,
                execution_ms=elapsed,
            )
        except Exception as e:
            elapsed = int((time.monotonic() - start) * 1000)
            logger.error(f"Erreur exécution {tool_name}: {e}")
            return ToolResult(
                success=False,
                error=f"Erreur d'exécution: {str(e)}",
                tool_name=tool_name,
                execution_ms=elapsed,
            )
