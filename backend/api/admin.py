from django.contrib import admin
from django.db.models import Sum
from .models import Brief, PortfolioItem, StoreProduct, Template


# ─── Injection sécurisée des KPIs via each_context ──────────────────────────
# On surcharge each_context (appelé sur CHAQUE page admin) pour injecter
# les stats uniquement sur la page index. C'est l'API officielle Django.
_original_each_context = admin.AdminSite.each_context


def _hadara_each_context(self, request):
    ctx = _original_each_context(self, request)
    # Injecte les KPIs seulement si on est sur l'index (pas de surcharge inutile)
    try:
        pending = Brief.objects.filter(status__in=['nouveau', 'pending']).count()
        all_briefs = Brief.objects.count()
        revenue_agg = Brief.objects.exclude(
            status__in=['rejected', 'refusé']
        ).aggregate(total=Sum('quoted_price_fcfa'))
        revenue = revenue_agg['total'] or 0
        active_products = StoreProduct.objects.filter(visible=True).count()
        latest_briefs = list(Brief.objects.order_by('-created_at')[:6])
    except Exception:
        pending = all_briefs = active_products = revenue = 0
        latest_briefs = []

    ctx.update({
        'kpi_pending_briefs': pending,
        'kpi_all_briefs': all_briefs,
        'kpi_total_revenue': f"{revenue:,}".replace(',', '\u202f'),
        'kpi_active_products': active_products,
        'kpi_latest_briefs': latest_briefs,
    })
    return ctx


admin.AdminSite.each_context = _hadara_each_context


# ─── ModelAdmin classes ──────────────────────────────────────────────────────

@admin.register(Brief)
class BriefAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'email', 'whatsapp', 'status', 'created_at', 'quoted_price_fcfa')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'client_name', 'email', 'whatsapp')
    readonly_fields = ('id', 'created_at', 'ai_analysis')
    ordering = ('-created_at',)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        try:
            response = super().change_view(request, object_id, form_url, extra_context)
            if hasattr(response, 'render') and callable(response.render):
                response.render()
            return response
        except Exception as e:
            import traceback
            from django.http import HttpResponse
            return HttpResponse(f"<h1>Error in change_view</h1><pre>{traceback.format_exc()}</pre>", status=500)

    fieldsets = (
        ('Informations Client', {
            'fields': ('id', 'client_name', 'organization', 'email', 'whatsapp', 'city_country')
        }),
        ('Détails du Projet', {
            'fields': ('project_type', 'project_type_custom', 'context_description',
                       'primary_objective', 'target_audience', 'main_title', 'full_text_content')
        }),
        ('Style & Direction', {
            'fields': ('style_preferences', 'preferred_colors', 'avoid_colors')
        }),
        ('Spécifications Techniques', {
            'fields': ('technical_format', 'custom_dimensions', 'usage_type',
                       'budget_range', 'desired_delivery_date', 'critical_deadline')
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


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'price_estimate', 'badge')
    list_filter = ('category',)
    search_fields = ('title', 'id')


@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand', 'category', 'price', 'status', 'visible', 'featured')
    list_filter = ('status', 'category', 'visible', 'featured')
    search_fields = ('name', 'brand', 'id')
    list_editable = ('status', 'visible', 'featured', 'price')


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'suggested_price_fcfa')
    list_filter = ('category',)
    search_fields = ('title',)
