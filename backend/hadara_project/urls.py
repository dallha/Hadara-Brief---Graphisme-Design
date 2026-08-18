"""
URL configuration for hadara_project project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('api/django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/ai/v1/', include('hadara_ai.api.urls')),
    
    # Swagger API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
