from django.contrib import admin
from hadara_ai.models import AIProvider, AIProviderConfig


class AIProviderConfigInline(admin.TabularInline):
    model = AIProviderConfig
    extra = 0


@admin.register(AIProvider)
class AIProviderAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'is_active', 'priority')
    list_filter = ('is_active',)
    list_editable = ('is_active', 'priority')
    inlines = [AIProviderConfigInline]


@admin.register(AIProviderConfig)
class AIProviderConfigAdmin(admin.ModelAdmin):
    list_display = (
        'model_id', 'provider', 'display_name',
        'is_active', 'supports_json_mode', 'supports_tool_calling',
    )
    list_filter = ('provider', 'is_active')
