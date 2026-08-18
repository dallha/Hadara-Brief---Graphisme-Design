from __future__ import annotations

import logging

from django.contrib.auth.models import User
from rest_framework.permissions import BasePermission

from api.auth_views import verify_admin_token, verify_client_token

logger = logging.getLogger(__name__)


class HadaraAIBasePermission(BasePermission):
    """Permission de base pour l'API Hadara AI."""

    def _extract_token(self, request):
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        if auth.startswith("Bearer "):
            return auth[7:]
        return None


class AIAdminPermission(HadaraAIBasePermission):
    """Accès admin : token admin valide."""

    def has_permission(self, request, view):
        token = self._extract_token(request)
        if not token:
            return False
        try:
            verify_admin_token(request)
            return True
        except Exception:
            return False


class AIAuthenticatedPermission(HadaraAIBasePermission):
    """Accès admin OU client : token valide."""

    def has_permission(self, request, view):
        token = self._extract_token(request)
        if not token:
            return False
        try:
            verify_admin_token(request)
            request.auth_role = "admin"
            return True
        except Exception:
            pass
        try:
            whatsapp = verify_client_token(request)
            if whatsapp:
                request.auth_role = "client"
                request.client_whatsapp = whatsapp
                return True
        except Exception:
            pass
        return False


class AIClientReadOnlyPermission(HadaraAIBasePermission):
    """Client : lecture seule. Admin : full access."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return AIAuthenticatedPermission().has_permission(request, view)
        return AIAdminPermission().has_permission(request, view)
