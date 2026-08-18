from __future__ import annotations

from rest_framework import serializers


class AgentRunRequestSerializer(serializers.Serializer):
    """Requête d'exécution d'un agent."""
    message = serializers.CharField(max_length=5000)
    brief_id = serializers.CharField(max_length=50, required=False, default="")
    client_id = serializers.CharField(max_length=50, required=False, default="")
    trace_id = serializers.UUIDField(required=False)


class AgentRunResponseSerializer(serializers.Serializer):
    """Réponse d'exécution d'un agent."""
    success = serializers.BooleanField()
    content = serializers.CharField()
    agent_slug = serializers.CharField()
    iterations = serializers.IntegerField()
    tool_calls = serializers.IntegerField()
    total_input_tokens = serializers.IntegerField()
    total_output_tokens = serializers.IntegerField()
    total_cost_usd = serializers.FloatField()
    total_duration_ms = serializers.IntegerField()
    model_used = serializers.CharField()
    stopped_reason = serializers.CharField()
    error = serializers.CharField(required=False, default="")


class ExecutionDetailSerializer(serializers.Serializer):
    """Détail d'une exécution IA."""
    id = serializers.IntegerField()
    trace_id = serializers.UUIDField()
    request_id = serializers.UUIDField()
    agent = serializers.CharField(allow_null=True)
    provider = serializers.CharField()
    model = serializers.CharField()
    input_tokens = serializers.IntegerField()
    output_tokens = serializers.IntegerField()
    cost_usd = serializers.FloatField()
    duration_ms = serializers.IntegerField()
    status = serializers.CharField()
    error_message = serializers.CharField()
    brief_id = serializers.CharField()
    client_id = serializers.CharField()
    created_at = serializers.DateTimeField()


class UsageSummarySerializer(serializers.Serializer):
    """Résumé d'utilisation."""
    total_input_tokens = serializers.IntegerField()
    total_output_tokens = serializers.IntegerField()
    total_cost_usd = serializers.FloatField()
    total_ai_calls = serializers.IntegerField()
    total_errors = serializers.IntegerField()
    total_tool_calls = serializers.IntegerField()
    avg_duration_ms = serializers.IntegerField()


class CostByModelSerializer(serializers.Serializer):
    """Coût par modèle."""
    provider = serializers.CharField()
    model = serializers.CharField()
    total_cost = serializers.FloatField()
    total_calls = serializers.IntegerField()
    total_input_tokens = serializers.IntegerField()
    total_output_tokens = serializers.IntegerField()


class CostByAgentSerializer(serializers.Serializer):
    """Coût par agent."""
    agent_slug = serializers.CharField()
    total_cost = serializers.FloatField()
    total_calls = serializers.IntegerField()
    total_input_tokens = serializers.IntegerField()
    total_output_tokens = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    """Dashboard AI complet."""
    summary = UsageSummarySerializer()
    by_model = CostByModelSerializer(many=True)
    by_agent = CostByAgentSerializer(many=True)
    recent_executions = ExecutionDetailSerializer(many=True)
