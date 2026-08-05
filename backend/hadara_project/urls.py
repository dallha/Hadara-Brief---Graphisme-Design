"""
URL configuration for hadara_project project.
"""
from django.contrib import admin
from django.urls import path, include
from api.admin_site import hadara_admin_site

urlpatterns = [
    path('api/django-admin/', hadara_admin_site.urls),
    path('api/', include('api.urls')),
]
