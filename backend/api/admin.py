from django.contrib import admin
from .models import Brief, PortfolioItem, StoreProduct, Template
from .admin_site import hadara_admin_site


# ─── Classes ModelAdmin ────────────────────────────────────────────────────────

class BriefAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'email', 'whatsapp', 'status', 'created_at', 'quoted_price_fcfa')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'client_name', 'email', 'whatsapp')
    readonly_fields = ('id', 'created_at', 'ai_analysis')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations Client', {
            'fields': ('id', 'client_name', 'organization', 'email', 'whatsapp', 'city_country')
        }),
        ('Détails du Projet', {
            'fields': ('project_type', 'project_type_custom', 'context_description', 'primary_objective', 'target_audience', 'main_title', 'full_text_content')
        }),
        ('Style & Direction', {
            'fields': ('style_preferences', 'preferred_colors', 'avoid_colors')
        }),
        ('Spécifications Techniques', {
            'fields': ('technical_format', 'custom_dimensions', 'usage_type', 'budget_range', 'desired_delivery_date', 'critical_deadline')
        }),
        ('Références', {
            'fields': ('reference_links', 'attachments', 'accept_process', 'accept_deadlines')
        }),
        ('Administration & IA', {
            'fields': ('status', 'quoted_price_fcfa', 'designer_notes', 'ai_analysis')
        }),
        ('Dates', {
            'fields': ('created_at',)
        }),
    )


class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'price_estimate', 'badge')
    list_filter = ('category',)
    search_fields = ('title', 'id')


class StoreProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand', 'category', 'price', 'status', 'visible', 'featured')
    list_filter = ('status', 'category', 'visible', 'featured')
    search_fields = ('name', 'brand', 'id')
    list_editable = ('status', 'visible', 'featured', 'price')


class TemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'suggested_price_fcfa')
    list_filter = ('category',)
    search_fields = ('title',)


# ─── Register in default admin (garde la compatibilité) ────────────────────────
admin.site.register(Brief, BriefAdmin)
admin.site.register(PortfolioItem, PortfolioItemAdmin)
admin.site.register(StoreProduct, StoreProductAdmin)
admin.site.register(Template, TemplateAdmin)

# ─── Register in custom HadaraAdminSite ───────────────────────────────────────
hadara_admin_site.register(Brief, BriefAdmin)
hadara_admin_site.register(PortfolioItem, PortfolioItemAdmin)
hadara_admin_site.register(StoreProduct, StoreProductAdmin)
hadara_admin_site.register(Template, TemplateAdmin)
