from django.urls import path

from hadara_ai.api import views

urlpatterns = [
    path("health/", views.health_check, name="ai-health-check"),
    path("health/chat-test/", views.health_chat_test, name="ai-health-chat-test"),
    path("agents/", views.agent_list, name="ai-agent-list"),
    path("agents/<int:pk>/run/", views.agent_run, name="ai-agent-run"),
    path("executions/", views.execution_list, name="ai-execution-list"),
    path("executions/<int:pk>/", views.execution_detail, name="ai-execution-detail"),
    path("usage/", views.usage_summary, name="ai-usage-summary"),
    path("dashboard/", views.dashboard, name="ai-dashboard"),
    path(
        "briefs/<str:brief_id>/analyze/",
        views.brief_analyze,
        name="ai-brief-analyze",
    ),
    path(
        "briefs/<str:brief_id>/analyses/",
        views.brief_analysis_history,
        name="ai-brief-analysis-history",
    ),
    path(
        "briefs/<str:brief_id>/pricing-agent/",
        views.brief_pricing_agent,
        name="ai-brief-pricing-agent",
    ),
    path(
        "briefs/<str:brief_id>/creative-assistant/",
        views.brief_creative_assistant,
        name="ai-brief-creative-assistant",
    ),
    path(
        "brand-context/",
        views.brand_context,
        name="ai-brand-context",
    ),
    path(
        "briefs/<str:brief_id>/communicate/",
        views.brief_communicate,
        name="ai-brief-communicate",
    ),
    path(
        "briefs/<str:brief_id>/workflow/",
        views.brief_workflow,
        name="ai-brief-workflow",
    ),
    path(
        "briefs/<str:brief_id>/workflows/",
        views.brief_workflow_history,
        name="ai-brief-workflow-history",
    ),
    path(
        "analytics/dashboard/",
        views.analytics_dashboard,
        name="ai-analytics-dashboard",
    ),
    path(
        "analytics/agents/",
        views.analytics_agents,
        name="ai-analytics-agents",
    ),
    path(
        "analytics/trend/",
        views.analytics_trend,
        name="ai-analytics-trend",
    ),
    path(
        "analytics/models/",
        views.analytics_models,
        name="ai-analytics-models",
    ),
]
