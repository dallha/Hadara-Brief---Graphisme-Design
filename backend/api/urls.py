from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BriefViewSet, TemplateViewSet, PortfolioItemViewSet, StoreProductViewSet,
    ai_analyze_brief, chat_api_view, ocr_correct_api_view,
    ClientViewSet, BillingDocumentViewSet, PaymentViewSet,
)

router = DefaultRouter()
router.register(r'briefs', BriefViewSet)
router.register(r'templates', TemplateViewSet)
router.register(r'portfolio', PortfolioItemViewSet)
router.register(r'store/products', StoreProductViewSet)
router.register(r'billing/clients', ClientViewSet)
router.register(r'billing/documents', BillingDocumentViewSet)
router.register(r'billing/payments', PaymentViewSet)

from .auth_views import AdminLoginView, AdminVerifyView

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', chat_api_view, name='chat-api'),
    path('ocr-correct/', ocr_correct_api_view, name='ocr-correct-api'),
    path('ai-analyze/<str:pk>/', ai_analyze_brief, name='ai-analyze-brief'),
    path('auth/login/', AdminLoginView.as_view(), name='auth-login'),
    path('auth/verify/', AdminVerifyView.as_view(), name='auth-verify'),
]
