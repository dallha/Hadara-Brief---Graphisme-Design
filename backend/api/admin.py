from django.contrib import admin
from django.db.models import Sum
from .models import Brief, PortfolioItem, StoreProduct, Template
from .ai_utils import analyze_brief_with_ai
from django.contrib import messages


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

    actions = ['send_whatsapp_quote', 'mark_en_creation', 'mark_termine', 'generate_ai_analysis']

    @admin.action(description='Générer & Envoyer Devis via WhatsApp')
    def send_whatsapp_quote(self, request, queryset):
        import urllib.parse
        from django.utils.safestring import mark_safe
        
        count = 0
        links = []
        for brief in queryset:
            brief.status = 'devis_envoye'
            brief.save(update_fields=['status'])
            
            phone = str(brief.whatsapp).strip()
            if phone.startswith('+'):
                phone = phone[1:]
                
            ai_data = brief.ai_analysis or {}
            message = ai_data.get("brouillon_whatsapp", f"Bonjour {brief.client_name}, nous avons bien reçu votre brief pour {brief.project_type}. Êtes-vous disponible pour en discuter ?")
            
            encoded_message = urllib.parse.quote(message)
            link = f"https://wa.me/{phone}?text={encoded_message}"
            links.append(f"<a href='{link}' target='_blank' style='background-color:#25D366;color:white;padding:5px 10px;border-radius:4px;font-weight:bold;text-decoration:none;margin-right:10px;'>Ouvrir WhatsApp pour {brief.client_name}</a>")
            count += 1
            
        if links:
            msg = mark_safe(f"{count} projet(s) mis(s) à jour. " + " ".join(links))
            self.message_user(request, msg, messages.SUCCESS)

    @admin.action(description='Marquer comme "En Création"')
    def mark_en_creation(self, request, queryset):
        queryset.update(status='en_creation')

    @admin.action(description='Marquer comme "Terminé"')
    def mark_termine(self, request, queryset):
        queryset.update(status='termine')

    @admin.action(description='Générer l\'Analyse IA du Brief (Gratuit)')
    def generate_ai_analysis(self, request, queryset):
        count = 0
        for brief in queryset:
            analysis_result = analyze_brief_with_ai(brief)
            brief.ai_analysis = analysis_result
            brief.save(update_fields=['ai_analysis'])
            count += 1
        self.message_user(
            request,
            f"{count} brief(s) analysé(s) avec succès par l'IA.",
            messages.SUCCESS
        )

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
