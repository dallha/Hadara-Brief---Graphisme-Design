from __future__ import annotations

import logging
import uuid
from datetime import date, timedelta

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from hadara_ai.agents.engine import AgentEngine
from hadara_ai.agents.routing import ModelRouter
from hadara_ai.api.permissions import AIAdminPermission, AIAuthenticatedPermission
from hadara_ai.api.serializers import (
    AgentRunRequestSerializer,
    AgentRunResponseSerializer,
    DashboardSerializer,
    ExecutionDetailSerializer,
    UsageSummarySerializer,
    CostByModelSerializer,
    CostByAgentSerializer,
)
from hadara_ai.models import AgentDefinition
from hadara_ai.models.trace import AIExecution, ExecutionStatus
from hadara_ai.tools.context import ToolContext, ToolRole
from hadara_ai.tools.registry import ToolRegistry
from hadara_ai.tracing.aggregator import CostCalculator, UsageAggregator
from hadara_ai.tracing.service import ExecutionTraceService

logger = logging.getLogger(__name__)


def _build_tool_registry() -> ToolRegistry:
    """Construit le ToolRegistry avec les outils autorisés."""
    from hadara_ai.tools.context import ToolPermission
    from hadara_ai.tools.implementations import (
        brief_get,
        client_get,
        client_history,
        pricing_calculate,
        brief_analyze,
    )

    registry = ToolRegistry()

    tools = [
        ("brief.get", "Lecture d'un brief", ToolPermission.READ, brief_get),
        ("client.get", "Informations client", ToolPermission.READ, client_get),
        ("client.history", "Historique client", ToolPermission.READ, client_history),
        ("pricing.calculate", "Calcul tarifaire", ToolPermission.READ, pricing_calculate),
        ("brief.analyze", "Analyse IA d'un brief", ToolPermission.READ, brief_analyze),
    ]

    for name, desc, perm, impl in tools:
        from hadara_ai.tools.registry import ToolDefinition
        registry.register(
            ToolDefinition(name=name, description=desc, permission=perm),
            impl,
        )

    return registry


@api_view(["POST"])
@permission_classes([AIAuthenticatedPermission])
def agent_run(request, pk=None):
    """POST /api/ai/v1/agents/{id}/run

    Exécute un agent avec un message utilisateur.
    """
    serializer = AgentRunRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    # Récupérer l'agent
    try:
        agent = AgentDefinition.objects.get(pk=pk)
    except AgentDefinition.DoesNotExist:
        return Response(
            {"error": f"Agent introuvable: {pk}"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not agent.is_active:
        return Response(
            {"error": f"Agent désactivé: {agent.slug}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Construire le contexte
    role = ToolRole.ADMIN if getattr(request, "auth_role", "") == "admin" else ToolRole.VIEWER
    trace_id = data.get("trace_id") or uuid.uuid4()

    context = ToolContext(
        user_id=getattr(request, "client_whatsapp", "admin"),
        role=role,
        trace_id=str(trace_id),
    )

    # Exécuter
    tool_registry = _build_tool_registry()
    engine = AgentEngine(
        tool_registry=tool_registry,
        model_router=ModelRouter(),
    )

    result = engine.execute(agent, data["message"], context)

    # Tracer
    trace_service = ExecutionTraceService()
    ai_exec = trace_service.start_ai_execution(
        trace_id=trace_id,
        agent=agent,
        provider=result.model_used.split("/")[0] if "/" in result.model_used else result.model_used,
        model=result.model_used,
        brief_id=data.get("brief_id", ""),
        client_id=data.get("client_id", ""),
    )
    trace_service.complete_ai_execution(
        ai_exec,
        input_tokens=result.total_input_tokens,
        output_tokens=result.total_output_tokens,
        cost_usd=result.total_cost_usd,
        duration_ms=result.total_duration_ms,
        status=ExecutionStatus.SUCCESS if result.success else ExecutionStatus.ERROR,
        error_message=result.error,
    )

    response_data = {
        "success": result.success,
        "content": result.content,
        "agent_slug": agent.slug,
        "iterations": result.iterations,
        "tool_calls": result.tool_calls,
        "total_input_tokens": result.total_input_tokens,
        "total_output_tokens": result.total_output_tokens,
        "total_cost_usd": result.total_cost_usd,
        "total_duration_ms": result.total_duration_ms,
        "model_used": result.model_used,
        "stopped_reason": result.stopped_reason,
        "error": result.error,
    }

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AIAdminPermission])
def execution_list(request):
    """GET /api/ai/v1/executions

    Liste des exécutions IA (admin only).
    """
    limit = int(request.query_params.get("limit", 20))
    offset = int(request.query_params.get("offset", 0))

    qs = AIExecution.objects.all().order_by("-created_at")
    total = qs.count()
    executions = qs[offset:offset + limit]

    data = {
        "total": total,
        "offset": offset,
        "limit": limit,
        "results": ExecutionDetailSerializer(executions, many=True).data,
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AIAdminPermission])
def execution_detail(request, pk):
    """GET /api/ai/v1/executions/{id}

    Détail d'une exécution IA (admin only).
    """
    try:
        execution = AIExecution.objects.get(pk=pk)
    except AIExecution.DoesNotExist:
        return Response(
            {"error": "Exécution introuvable"},
            status=status.HTTP_404_NOT_FOUND,
        )

    data = ExecutionDetailSerializer(execution).data
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AIAdminPermission])
def usage_summary(request):
    """GET /api/ai/v1/usage

    Résumé d'utilisation (admin only).
    """
    days = int(request.query_params.get("days", 30))
    start_date = date.today() - timedelta(days=days)

    aggregator = UsageAggregator()
    summary = aggregator.get_usage_summary(start_date=start_date)

    return Response(summary, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AIAdminPermission])
def dashboard(request):
    """GET /api/ai/v1/dashboard

    Dashboard AI complet (admin only).
    """
    days = int(request.query_params.get("days", 30))
    start_date = date.today() - timedelta(days=days)

    calculator = CostCalculator()
    aggregator = UsageAggregator()

    summary = aggregator.get_usage_summary(start_date=start_date)
    by_model = calculator.cost_by_model(start_date=start_date)
    by_agent = calculator.cost_by_agent(start_date=start_date)

    recent = AIExecution.objects.all().order_by("-created_at")[:10]

    # Convertir by_model en format sérialisé
    by_model_data = []
    for m in by_model:
        by_model_data.append({
            "provider": m["provider"],
            "model": m["model"],
            "total_cost": float(m["total_cost"]),
            "total_calls": m["total_calls"],
            "total_input_tokens": m["total_input_tokens"] or 0,
            "total_output_tokens": m["total_output_tokens"] or 0,
        })

    # Convertir by_agent
    by_agent_data = []
    for a in by_agent:
        by_agent_data.append({
            "agent_slug": a["agent_slug"],
            "total_cost": float(a["total_cost"]),
            "total_calls": a["total_calls"],
            "total_input_tokens": a["total_input_tokens"] or 0,
            "total_output_tokens": a["total_output_tokens"] or 0,
        })

    data = {
        "summary": summary,
        "by_model": by_model_data,
        "by_agent": by_agent_data,
        "recent_executions": ExecutionDetailSerializer(recent, many=True).data,
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AIAdminPermission])
def agent_list(request):
    """GET /api/ai/v1/agents

    Liste des agents disponibles (admin only).
    """
    agents = AgentDefinition.objects.all()
    data = [
        {
            "id": a.id,
            "slug": a.slug,
            "name": a.name,
            "description": a.description,
            "is_active": a.is_active,
            "model_primary": a.model_primary.model_id if a.model_primary else "",
            "tools_allowed": a.tools_allowed,
            "max_iterations": a.max_iterations,
        }
        for a in agents
    ]
    return Response(data, status=status.HTTP_200_OK)
