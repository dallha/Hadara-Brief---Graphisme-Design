from django.contrib import admin
from .models import Brief, PortfolioItem, StoreProduct, Template

@admin.register(Brief)
class BriefAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'client_email', 'client_whatsapp', 'status', 'created_at', 'quoted_price_fcfa')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'client_name', 'client_email', 'client_whatsapp')
    readonly_fields = ('id', 'created_at', 'updated_at', 'ai_analysis')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations Client', {
            'fields': ('id', 'client_name', 'client_email', 'client_whatsapp')
        }),
        ('Détails du Projet', {
            'fields': ('project_context', 'project_objective', 'target_audience', 'creative_style', 'color_preferences', 'specific_texts')
        }),
        ('Spécifications Techniques', {
            'fields': ('dimensions', 'required_formats', 'budget_estimate', 'urgency')
        }),
        ('Administration & IA', {
            'fields': ('status', 'quoted_price_fcfa', 'designer_notes', 'ai_analysis')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'estimated_price_fcfa')
    list_filter = ('category',)
    search_fields = ('title', 'id')

@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'brand', 'category', 'price_fcfa', 'status', 'visible', 'featured')
    list_filter = ('status', 'category', 'visible', 'featured')
    search_fields = ('title', 'brand', 'id')
    list_editable = ('status', 'visible', 'featured', 'price_fcfa')

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)
