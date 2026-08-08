from django.contrib import admin
from django.db.models import Sum
from .models import Brief, PortfolioItem, StoreProduct, Template, ToolUsageLog
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
    readonly_fields = ('id', 'created_at', 'ai_analysis', 'status_actions_guided', 'display_deliverable_versions')
    ordering = ('-created_at',)

    actions = ['send_whatsapp_quote', 'publish_new_version', 'mark_acompte_recu', 'mark_en_creation', 'mark_termine', 'generate_ai_analysis']

    @admin.display(description='🎨 Versions & Maquettes Publiées (V1, V2, V3)')
    def display_deliverable_versions(self, obj):
        from django.utils.safestring import mark_safe
        if not obj or not obj.deliverable_versions:
            return mark_safe('<div style="color:#A8B0BD; padding:0.5rem 0;">Aucune maquette publiée pour le moment. Utilisez l\'action "🎨 Publier Nouvelle Maquette" pour créer V1.</div>')
        
        versions = obj.deliverable_versions if isinstance(obj.deliverable_versions, list) else []
        cards_html = []
        for v in versions:
            v_num = v.get('versionNumber', 1)
            title = v.get('title', f'Maquette V{v_num}')
            file_url = v.get('previewUrl') or v.get('fileUrl') or ''
            date_str = v.get('createdAt', '')
            status_str = '✅ Approuvé' if v.get('status') == 'approved' else '🔵 En Révision Client'
            
            card = f'''
            <div style="background:#111827; border:1px solid rgba(208,162,28,0.3); border-radius:10px; padding:0.75rem 1rem; margin-bottom:0.6rem; display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <strong style="color:#D0A21C; font-size:0.95rem;">Version {v_num} : {title}</strong>
                    <span style="display:block; color:#A8B0BD; font-size:0.8rem;">Publié le {date_str}</span>
                </div>
                <div style="text-align:right;">
                    <span style="background:rgba(0,201,167,0.15); color:#00C9A7; border:1px solid #00C9A7; border-radius:12px; padding:2px 8px; font-size:0.75rem; font-weight:bold;">{status_str}</span>
                    {f'<a href="{file_url}" target="_blank" style="margin-left:8px; color:#D0A21C; text-decoration:underline; font-size:0.8rem;">🖼️ Aperçu</a>' if file_url else ''}
                </div>
            </div>
            '''
            cards_html.append(card)
        return mark_safe(''.join(cards_html))

    @admin.action(description='🎨 Publier Nouvelle Maquette / Version V1-V2-V3')
    def publish_new_version(self, request, queryset):
        import datetime
        count = 0
        for brief in queryset:
            versions = brief.deliverable_versions if isinstance(brief.deliverable_versions, list) else []
            v_num = len(versions) + 1
            now_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
            file_url = '/assets/logo-or--hmgXa1H.png'
            if isinstance(brief.attachments, list) and len(brief.attachments) > 0 and isinstance(brief.attachments[0], str) and brief.attachments[0].strip():
                file_url = brief.attachments[0]
            new_v = {
                'id': f"ver-{v_num}-{int(datetime.datetime.now().timestamp())}",
                'versionNumber': v_num,
                'title': f"Maquette V{v_num}",
                'fileUrl': file_url,
                'previewUrl': file_url,
                'createdAt': now_str,
                'status': 'client_review'
            }
            versions.append(new_v)
            brief.deliverable_versions = versions
            brief.status = 'validation'
            brief.save(update_fields=['deliverable_versions', 'status'])
            count += 1
        self.message_user(request, f"{count} nouvelle(s) version(s) V{v_num} publiée(s) avec succès pour le Portail Client !", messages.SUCCESS)

    @admin.display(description='⚡ Panneau d\'Action Studio (Workflow Guidé)')
    def status_actions_guided(self, obj):
        from django.utils.safestring import mark_safe
        if not obj or not obj.id:
            return mark_safe('<span style="color:#A8B0BD;">Enregistrez le brief pour débloquer le panneau d\'action.</span>')
        
        status_map = {
            'nouveau': (
                '<div style="background: rgba(208,162,28,0.12); border: 1px solid #D0A21C; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #D0A21C; font-size: 1.05rem;">📨 Nouveau Brief Reçu !</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Saisissez le devis estimé FCFA ci-dessous puis validez pour transmettre la notification WhatsApp au client.</p>'
                '</div>'
            ),
            'devis_envoye': (
                '<div style="background: rgba(51,90,121,0.2); border: 1px solid #335A79; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #64B5F6; font-size: 1.05rem;">💰 Devis Transmis — En attente validation client</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Dès confirmation de l\'acompte 50%, basculez le statut sur "En Création".</p>'
                '</div>'
            ),
            'acompte_recu': (
                '<div style="background: rgba(0,201,167,0.15); border: 1px solid #00C9A7; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #00C9A7; font-size: 1.05rem;">💳 Acompte 50% Confirmé !</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Le projet est prêt à être créé par l\'équipe créative.</p>'
                '</div>'
            ),
            'en_creation': (
                '<div style="background: rgba(0,201,167,0.18); border: 1px solid #00C9A7; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #00C9A7; font-size: 1.05rem;">🎨 Projet Actuellement en Création Studio</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Publiez vos prévisualisations V1/V2 via l\'uploader mobile ci-dessous. Le client les verra instantanément dans son portail.</p>'
                '</div>'
            ),
            'termine': (
                '<div style="background: rgba(16,185,129,0.2); border: 1px solid #10B981; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #34D399; font-size: 1.05rem;">✅ Projet Officiellement Terminé & Livré</strong>'
                '</div>'
            )
        }
        return mark_safe(status_map.get(obj.status, '<span style="color:#A8B0BD;">Projet en cours de traitement.</span>'))

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

    @admin.action(description='Marquer "Acompte 50%% Reçu"')
    def mark_acompte_recu(self, request, queryset):
        queryset.update(status='acompte_recu')

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
        ('⚡ Panneau d\'Action Guidé', {
            'fields': ('status_actions_guided', 'status', 'quoted_price_fcfa')
        }),
        ('👤 Informations Client (Obligatoires)', {
            'fields': ('client_name', 'whatsapp', 'email', 'organization', 'city_country')
        }),
        ('🎯 Détails du Projet', {
            'fields': ('project_type', 'project_type_custom', 'context_description',
                       'primary_objective', 'main_title', 'full_text_content')
        }),
        ('🎨 Style & Direction (Optionnels)', {
            'fields': ('target_audience', 'style_preferences', 'preferred_colors', 'avoid_colors'),
            'classes': ('collapse',),
        }),
        ('📐 Spécifications Techniques & Budget (Optionnels)', {
            'fields': ('technical_format', 'custom_dimensions', 'usage_type',
                       'budget_range', 'desired_delivery_date', 'critical_deadline'),
            'classes': ('collapse',),
        }),
        ('📎 Références & Fichiers (Optionnels)', {
            'fields': ('reference_links', 'attachments', 'accept_process', 'accept_deadlines'),
            'classes': ('collapse',),
        }),
        ('🎨 Versions & Maquettes Publiées (V1, V2, V3)', {
            'fields': ('display_deliverable_versions',)
        }),
        ('⚡ Traitement Studio & IA', {
            'fields': ('designer_notes', 'ai_analysis', 'id', 'created_at')
        }),
    )


from django.utils.html import format_html

@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('apercu_visuel', 'title', 'category', 'price_estimate', 'badge')
    list_filter = ('category',)
    search_fields = ('title', 'id')
    readonly_fields = ('id', 'created_at')

    fieldsets = (
        ('🖼️ Informations Essentielles (Obligatoires)', {
            'fields': ('title', 'category', 'image_url')
        }),
        ('🎨 Présentation & Contenu (Optionnels)', {
            'fields': ('description', 'badge', 'features'),
            'classes': ('collapse',),
        }),
        ('💰 Tarification & Style Automatique', {
            'fields': ('price_estimate', 'accent_hex', 'id', 'created_at')
        }),
    )

    @admin.display(description='Aperçu Visuel')
    def apercu_visuel(self, obj):
        img_src = obj.image_url or ''
        if img_src:
            return format_html(
                '<img src="{}" style="width: 50px; height: 36px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3);" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline-block\';" />'
                '<span style="display:none; color:#94a3b8; font-size:11px;">🖼️ Sans image</span>',
                img_src
            )
        return format_html('<span style="color:#94a3b8; font-size:11px;">🖼️ Sans image</span>')


@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    list_display = ('apercu_visuel', 'name', 'brand', 'category', 'status', 'price')
    list_filter = ('status', 'category', 'visible', 'featured')
    search_fields = ('name', 'brand', 'id')
    list_editable = ('status',)
    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = (
        ('🛍️ Informations Essentielles (Obligatoires)', {
            'fields': ('name', 'category', 'status')
        }),
        ('📦 Présentation & Tarification (Optionnelles)', {
            'fields': ('brand', 'description', 'image', 'price'),
            'classes': ('collapse',),
        }),
        ('⚙️ Options Boutique & Identifiant Automatique', {
            'fields': ('visible', 'featured', 'id', 'created_at')
        }),
    )

    @admin.display(description='Aperçu')
    def apercu_visuel(self, obj):
        img_src = obj.image or ''
        if img_src:
            return format_html(
                '<img src="{}" style="width: 45px; height: 35px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3);" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'inline-block\';" />'
                '<span style="display:none; color:#94a3b8; font-size:11px;">🖼️ Sans image</span>',
                img_src
            )
        return format_html('<span style="color:#94a3b8; font-size:11px;">🖼️ Sans image</span>')


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'project_type', 'suggested_price_fcfa')
    list_filter = ('category',)
    search_fields = ('title',)
    readonly_fields = ('id', 'usage_count')

    fieldsets = (
        ('📋 Informations Principales (Obligatoires)', {
            'fields': ('title', 'category', 'project_type', 'technical_format', 'description')
        }),
        ('🎨 Préférences & Presets (Optionnels)', {
            'fields': ('custom_dimensions', 'default_main_title', 'default_full_text_content',
                       'style_preferences', 'preferred_colors', 'avoid_colors'),
            'classes': ('collapse',),
        }),
        ('💰 Tarification & Identifiant Automatique', {
            'fields': ('default_budget_range', 'suggested_price_fcfa', 'id', 'usage_count')
        }),
    )

@admin.register(ToolUsageLog)
class ToolUsageLogAdmin(admin.ModelAdmin):
    list_display = ('tool_name', 'created_at', 'ip_address')
    list_filter = ('tool_name', 'created_at')
    search_fields = ('tool_name', 'ip_address')
    readonly_fields = ('created_at',)

