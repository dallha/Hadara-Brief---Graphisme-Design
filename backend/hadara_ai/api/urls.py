from django.urls import path

from hadara_ai.api import views

urlpatterns = [
    path("agents/", views.agent_list, name="ai-agent-list"),
    path("agents/<int:pk>/run/", views.agent_run, name="ai-agent-run"),
    path("executions/", views.execution_list, name="ai-execution-list"),
    path("executions/<int:pk>/", views.execution_detail, name="ai-execution-detail"),
    path("usage/", views.usage_summary, name="ai-usage-summary"),
    path("dashboard/", views.dashboard, name="ai-dashboard"),
]
