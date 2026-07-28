from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BriefViewSet, TemplateViewSet, ai_analyze_brief

router = DefaultRouter()
router.register(r'briefs', BriefViewSet)
router.register(r'templates', TemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ai-analyze/<str:pk>/', ai_analyze_brief, name='ai-analyze-brief'),
]
