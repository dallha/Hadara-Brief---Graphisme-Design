from django.urls import path

from hadara_ai.api import views

urlpatterns = [
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
]
