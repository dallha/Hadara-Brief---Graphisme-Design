"""
URL configuration for hadara_project project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
