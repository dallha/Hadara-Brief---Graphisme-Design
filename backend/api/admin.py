from django.contrib import admin
from django.db.models import Sum
from django.utils.html import format_html
from .models import Brief, PortfolioItem, StoreProduct, Template, ToolUsageLog, Client, BillingDocument, BillingLine, Payment
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
        
        # Dashboard financier recommandé
        docs = BillingDocument.objects.exclude(payment_status='annule').exclude(doc_type='proforma')
        factures_total = docs.filter(doc_type='facture').aggregate(total=Sum('total'))['total'] or 0
        avoirs_total = docs.filter(doc_type='avoir').aggregate(total=Sum('total'))['total'] or 0
        ca_facture = factures_total - avoirs_total
        
        ca_encaisse = Payment.objects.exclude(billing_document__payment_status='annule').filter(
            billing_document__doc_type='facture'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        ca_restant = max(0, ca_facture - ca_encaisse)
        en_retard = docs.filter(payment_status='en_retard').count()
        
        active_products = StoreProduct.objects.filter(visible=True).count()
        latest_briefs = list(Brief.objects.order_by('-created_at')[:6])
    except Exception:
        pending = all_briefs = active_products = 0
        ca_facture = ca_encaisse = ca_restant = en_retard = 0
        latest_briefs = []

    ctx.update({
        'kpi_pending_briefs': pending,
        'kpi_all_briefs': all_briefs,
        'kpi_ca_facture': f"{ca_facture:,}".replace(',', '\u202f'),
        'kpi_ca_encaisse': f"{ca_encaisse:,}".replace(',', '\u202f'),
        'kpi_ca_restant': f"{ca_restant:,}".replace(',', '\u202f'),
        'kpi_en_retard': en_retard,
        'kpi_active_products': active_products,
        'kpi_latest_briefs': latest_briefs,
    })
    return ctx


admin.AdminSite.each_context = _hadara_each_context


# ─── ModelAdmin classes ──────────────────────────────────────────────────────

@admin.register(Brief)
class BriefAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'status', 'direct_actions')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'client_name', 'email', 'whatsapp')
    readonly_fields = ('id', 'created_at', 'ai_analysis', 'status_actions_guided', 'display_client_files_and_references', 'display_deliverable_versions')
    ordering = ('-created_at',)

    actions = ['send_whatsapp_quote', 'publish_new_version', 'mark_acompte_recu', 'mark_en_creation', 'mark_termine', 'generate_ai_analysis']

    @admin.display(description='📎 Références & Fichiers Client (Gestionnaire Cockpit)')
    def display_client_files_and_references(self, obj):
        from django.utils.safestring import mark_safe
        if not obj or not obj.id:
            return mark_safe('<span style="color:#A8B0BD;">Enregistrez le brief pour afficher le gestionnaire de fichiers client.</span>')

        attachments = obj.attachments if isinstance(obj.attachments, list) else []
        ref_links = []
        if obj.reference_links:
            ref_links = [r.strip() for r in str(obj.reference_links).split('\n') if r.strip()]

        cards_html = []
        
        # Section 1: Client Files (attachments)
        cards_html.append('<div style="background:#070B18; border:1px solid #335A79; border-radius:12px; padding:1rem; margin-bottom:0.75rem;">')
        cards_html.append('<strong style="color:#64B5F6; font-size:0.95rem; display:block; margin-bottom:0.5rem;">🖼️ Fichiers Client Reçus (' + str(len(attachments)) + ')</strong>')
        
        if not attachments:
            cards_html.append('<p style="color:#A8B0BD; font-size:0.85rem; margin:0.3rem 0;">Aucun fichier client téléversé.</p>')
        else:
            for idx, att in enumerate(attachments):
                if isinstance(att, str) and att.strip():
                    is_img = att.startswith('data:image/') or any(att.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.webp'])
                    cards_html.append(f'''
                    <div style="background:#111827; border:1px solid rgba(100,181,246,0.3); border-radius:10px; padding:0.6rem 0.8rem; margin-bottom:0.4rem; display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            {'<img src="' + att + '" style="width:45px; height:45px; object-fit:cover; border-radius:6px; border:1px solid rgba(208,162,28,0.4);" />' if is_img else '<span style="font-size:1.5rem;">📄</span>'}
                            <div>
                                <strong style="color:#F4F1EA; font-size:0.85rem;">Fichier Client #{idx+1}</strong>
                                <span style="display:block; color:#00C9A7; font-size:0.75rem;">✓ Document/Visuel sécurisé</span>
                            </div>
                        </div>
                        <div>
                            <a href="{att}" target="_blank" style="background:#335A79; color:#FFFFFF; padding:4px 10px; border-radius:6px; font-size:0.75rem; text-decoration:none; font-weight:bold;">👁️ Voir Fichier</a>
                        </div>
                    </div>
                    ''')
        cards_html.append('</div>')

        # Section 2: Inspiration Links (reference_links)
        cards_html.append('<div style="background:#070B18; border:1px solid #335A79; border-radius:12px; padding:1rem;">')
        cards_html.append('<strong style="color:#64B5F6; font-size:0.95rem; display:block; margin-bottom:0.5rem;">🔗 Liens d\'Inspiration & Références (' + str(len(ref_links)) + ')</strong>')
        
        if not ref_links:
            cards_html.append('<p style="color:#A8B0BD; font-size:0.85rem; margin:0.3rem 0;">Aucun lien d\'inspiration transmis par le client.</p>')
        else:
            for link in ref_links:
                cards_html.append(f'''
                <div style="background:#111827; border:1px solid rgba(51,90,121,0.4); border-radius:8px; padding:0.5rem 0.75rem; margin-bottom:0.4rem; display:flex; align-items:center; justify-content:space-between;">
                    <a href="{link}" target="_blank" rel="noreferrer" style="color:#64B5F6; font-size:0.85rem; text-decoration:underline; font-weight:bold; overflow:hidden; text-overflow:ellipsis; max-width:80%;">🔗 {link}</a>
                    <a href="{link}" target="_blank" style="background:rgba(100,181,246,0.15); color:#64B5F6; border:1px solid #64B5F6; padding:2px 8px; border-radius:6px; font-size:0.75rem; text-decoration:none; font-weight:bold;">Ouvrir</a>
                </div>
                ''')
        cards_html.append('</div>')

        return mark_safe(''.join(cards_html))

    @admin.display(description='🎨 Versions & Maquettes Publiées (V1, V2, V3)')
    def display_deliverable_versions(self, obj):
        from django.utils.safestring import mark_safe
        if not obj or not obj.id:
            return mark_safe('<span style="color:#A8B0BD;">Enregistrez le brief pour publier des maquettes.</span>')
        
        versions = obj.deliverable_versions if isinstance(obj.deliverable_versions, list) else []
        v_num = len(versions) + 1
        cards_html = []

        if not versions:
            cards_html.append('''
            <div style="background:#070B18; border:1px dashed #D0A21C; border-radius:12px; padding:1.25rem; text-align:center; margin-bottom:0.75rem;">
                <div style="font-size:1.8rem; margin-bottom:0.3rem;">🎨</div>
                <strong style="color:#D0A21C; font-size:1rem; display:block; margin-bottom:0.3rem;">Aucune maquette publiée pour le moment</strong>
                <p style="color:#A8B0BD; font-size:0.85rem; margin-bottom:0.5rem;">Publiez votre première proposition visuelle V1 à destination du Portail Client.</p>
            </div>
            ''')
        else:
            for v in versions:
                v_n = v.get('versionNumber', 1)
                title = v.get('title', f'Maquette V{v_n}')
                file_url = v.get('previewUrl') or v.get('fileUrl') or ''
                date_str = v.get('createdAt', '')
                is_approved = v.get('status') == 'approved'
                status_str = '🟢 Approuvé par le Client' if is_approved else '🟡 En Révision Client'
                
                card = f'''
                <div style="background:#070B18; border:1px solid rgba(208,162,28,0.3); border-radius:12px; padding:1rem; margin-bottom:0.75rem;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                        <div>
                            <strong style="color:#D0A21C; font-size:1rem;">🎨 Version V{v_n} : {title}</strong>
                            <span style="display:block; color:#A8B0BD; font-size:0.8rem;">Publié le {date_str}</span>
                        </div>
                        <span style="background:{'rgba(16,185,129,0.2)' if is_approved else 'rgba(245,158,11,0.2)'}; color:{'#34D399' if is_approved else '#FBBF24'}; border:1px solid {'#10B981' if is_approved else '#F59E0B'}; border-radius:20px; padding:3px 10px; font-size:0.75rem; font-weight:bold;">{status_str}</span>
                    </div>
                    {f'<div style="margin-top:0.5rem;"><img src="{file_url}" style="max-height:160px; border-radius:8px; border:1px solid rgba(208,162,28,0.3);" /><br/><a href="{file_url}" target="_blank" style="color:#D0A21C; font-size:0.8rem; text-decoration:underline; display:inline-block; margin-top:0.3rem;">🖼️ Ouvrir l\'aperçu</a></div>' if file_url else ''}
                </div>
                '''
                cards_html.append(card)

        cards_html.append(f'''
        <div style="background:rgba(208,162,28,0.1); border:1px solid rgba(208,162,28,0.4); border-radius:10px; padding:0.8rem 1rem; text-align:center;">
            <span style="color:#F4F1EA; font-size:0.88rem; display:block;">Pour publier la <strong>Maquette V{v_num}</strong> au client, utilisez l\'action <strong>"🎨 Publier Nouvelle Maquette / Version V1-V2-V3"</strong>.</span>
        </div>
        ''')

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

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('<path:object_id>/publish-version/', self.admin_site.admin_view(self.publish_version_view), name='api_brief_publish_version'),
            path('<path:object_id>/analyze/', self.admin_site.admin_view(self.analyze_brief_view), name='api_brief_analyze'),
        ]
        return custom_urls + urls

    def analyze_brief_view(self, request, object_id, *args, **kwargs):
        from django.http import HttpResponseRedirect, Http404
        from django.contrib import messages
        from django.urls import reverse
        from .pricing_engine import pricing_engine
        
        # 1. Vérification méthode POST uniquement
        if request.method != 'POST':
            messages.error(request, "L'analyse doit être déclenchée via un bouton (POST).")
            return HttpResponseRedirect(reverse('admin:api_brief_change', args=[object_id]))
            
        # 2. Vérification existence et permissions
        brief = self.get_object(request, object_id)
        if brief is None:
            raise Http404("Le brief n'existe pas.")
            
        if not self.has_change_permission(request, brief):
            messages.error(request, "Vous n'avez pas la permission d'analyser ce brief.")
            return HttpResponseRedirect(reverse('admin:api_brief_change', args=[object_id]))
            
        # 3. Calcul métier pur
        pricing_result = pricing_engine.calculate(brief)
        
        # 4. Interprétation IA + fusion
        analysis = analyze_brief_with_ai(brief, pricing_result)
        
        # 5. Sauvegarde
        import datetime
        analysis['analyzed_at'] = datetime.datetime.now().isoformat()
        analysis['analysis_version'] = "2.0"
        
        brief.ai_analysis = analysis
        brief.save()
        
        # 6. Redirection
        messages.success(request, "✅ Analyse Hadara AI mise à jour avec succès.")
        return HttpResponseRedirect(reverse('admin:api_brief_change', args=[object_id]))

    def publish_version_view(self, request, object_id, *args, **kwargs):
        from django.http import HttpResponseRedirect
        from django.contrib import messages
        import datetime
        brief = self.get_object(request, object_id)
        if not brief:
            return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
        
        if not isinstance(brief.attachments, list) or not any(isinstance(att, str) and att.strip() for att in brief.attachments):
            self.message_user(request, "⚠️ Ajoutez d’abord la maquette à publier dans la section 'Pièces Jointes'.", messages.ERROR)
            return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
            
        valid_attachments = [att.strip() for att in brief.attachments if isinstance(att, str) and att.strip()]
        file_url = valid_attachments[-1]
        
        versions = brief.deliverable_versions if isinstance(brief.deliverable_versions, list) else []
        v_num = len(versions) + 1
        now_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
        
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
        
        self.message_user(request, f"Maquette V{v_num} publiée avec succès ! Elle est immédiatement visible par le client.", messages.SUCCESS)
        return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))

    @admin.display(description='Actions Directes')
    def direct_actions(self, obj):
        from django.utils.safestring import mark_safe
        from django.urls import reverse
        
        edit_url = reverse('admin:api_brief_change', args=[obj.id])
        publish_url = reverse('admin:api_brief_publish_version', args=[obj.id])
        
        versions = obj.deliverable_versions if isinstance(obj.deliverable_versions, list) else []
        v_num = len(versions) + 1
        
        html = f'<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">'
        
        html += f'<a href="{edit_url}" class="direct-action-btn btn-open" style="background:rgba(51,90,121,0.2); border:1px solid #335A79; color:#64B5F6; padding:4px 10px; border-radius:6px; text-decoration:none; font-size:0.8rem; font-weight:bold; white-space:nowrap;">👁️ Ouvrir</a>'
        
        if obj.status in ['nouveau', 'devis_envoye', 'acompte_recu', 'en_creation']:
            html += f'<a href="{publish_url}" onclick="return confirm(\'Publier cette maquette en V{v_num} ? Elle sera immédiatement visible par le client.\');" class="direct-action-btn btn-publish" style="background:#D0A21C; border:1px solid #E7BE35; color:#070B18; padding:4px 10px; border-radius:6px; text-decoration:none; font-size:0.8rem; font-weight:bold; white-space:nowrap; box-shadow: 0 2px 5px rgba(208,162,28,0.3);">🎨 Publier V{v_num}</a>'
        elif obj.status == 'approved':
            html += f'<a href="{edit_url}" class="direct-action-btn btn-publish" style="background:#10B981; border:1px solid #34D399; color:#070B18; padding:4px 10px; border-radius:6px; text-decoration:none; font-size:0.8rem; font-weight:bold; white-space:nowrap; box-shadow: 0 2px 5px rgba(16,185,129,0.3);">📦 Préparer Livraison</a>'
            
        html += '</div>'
        return mark_safe(html)

    @admin.display(description='⚡ Panneau d\'Action Studio (Workflow Guidé)')
    def status_actions_guided(self, obj):
        from django.utils.safestring import mark_safe
        from django.urls import reverse
        if not obj or not obj.id:
            return mark_safe('<span style="color:#A8B0BD;">Enregistrez le brief pour débloquer le panneau d\'action.</span>')
        
        try:
            publish_url = reverse('admin:api_brief_publish_version', args=[obj.id])
            edit_url = reverse('admin:api_brief_change', args=[obj.id])
            analyze_url = reverse('admin:api_brief_analyze', args=[obj.id])
        except Exception:
            publish_url = "#"
            edit_url = "#"
            analyze_url = "#"
            
        import json
        
        # UI pour l'analyse IA (basique P0.3 pour test)
        ai_block = ""
        js_submit = f"""
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '{analyze_url}';
            const csrf = document.createElement('input');
            csrf.type = 'hidden';
            csrf.name = 'csrfmiddlewaretoken';
            csrf.value = document.querySelector('[name=csrfmiddlewaretoken]').value;
            form.appendChild(csrf);
            document.body.appendChild(form);
            form.submit();
        """
        
        if obj.ai_analysis:
            ai = obj.ai_analysis.get('ai', {})
            pricing = obj.ai_analysis.get('pricing', {})
            
            decision = ai.get('decision_recommandee', 'INCONNUE').upper()
            decision_color = "#10B981" if "ACCEPTER" in decision and "RÉSERVE" not in decision else "#F59E0B" if "RÉSERVE" in decision or "CLARIFIER" in decision else "#EF4444"
            
            comp_score = ai.get('score_completude', 0)
            comp_color = "#10B981" if comp_score >= 80 else "#F59E0B" if comp_score >= 40 else "#EF4444"
            
            cpx_score = ai.get('complexite_percue', 5)
            cpx_color = "#EF4444" if cpx_score >= 8 else "#F59E0B" if cpx_score >= 5 else "#10B981"
            
            # Helper to generate lists
            def build_list(items, empty_msg="Aucun"):
                if not items: return f'<span style="color:#64748B; font-style:italic;">{empty_msg}</span>'
                return '<ul style="margin: 0; padding-left: 1.2rem; color: #94A3B8; font-size: 0.85rem; line-height: 1.4;">' + ''.join([f'<li>{i}</li>' for i in items]) + '</ul>'
            
            risques_html = build_list(ai.get('risques', []) + ai.get('informations_manquantes', []), "Aucun risque ou manque détecté")
            questions_html = build_list(ai.get('questions_client', []), "Aucune question requise")
            
            whatsapp_text = ai.get('brouillon_whatsapp', '').replace('"', '&quot;').replace("'", "&#39;")
            
            # Format prices
            def format_price(p):
                return "{:,.0f}".format(p).replace(',', ' ')
            
            ai_block = f'''
            <style>
                .hadara-ai-dashboard {{
                    background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; color: #E2E8F0; font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }}
                .hadara-ai-header {{
                    display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1E293B; padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 10px;
                }}
                .hadara-ai-stats {{
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;
                }}
                .hadara-ai-pricing {{
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
                }}
                .hadara-ai-details {{
                    display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;
                }}
                @media (max-width: 768px) {{
                    .hadara-ai-dashboard {{ padding: 1rem; }}
                    .hadara-ai-pricing {{ grid-template-columns: 1fr; gap: 0.8rem; }}
                    .hadara-ai-details {{ grid-template-columns: 1fr; gap: 1rem; }}
                }}
            </style>
            <div class="hadara-ai-dashboard">
                <!-- Header -->
                <div class="hadara-ai-header">
                    <h3 style="margin: 0; color: #F8FAFC; display: flex; align-items: center; gap: 8px; font-size: 1.2rem;">
                        <span>✨</span> Hadara AI Analyzer
                    </h3>
                    <button type="button" onclick="{js_submit.replace('"', '&quot;')}" style="background: #1E293B; border: 1px solid #334155; color: #94A3B8; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; white-space: nowrap;">🔄 Réanalyser</button>
                </div>

                <!-- Top Stats Grid -->
                <div class="hadara-ai-stats">
                    <div style="background: #1E293B; padding: 1rem; border-radius: 12px; border-left: 4px solid {decision_color};">
                        <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Recommandation</div>
                        <div style="font-size: 1.05rem; font-weight: bold; color: {decision_color};">{decision}</div>
                        <div style="font-size: 0.75rem; color: #64748B; margin-top: 0.4rem; line-height: 1.3;">{ai.get('raison_decision', '')}</div>
                    </div>
                    
                    <div style="background: #1E293B; padding: 1rem; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Complétude</span>
                            <span style="font-weight: bold; color: {comp_color};">{comp_score}%</span>
                        </div>
                        <div style="background: #0F172A; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: {comp_color}; width: {comp_score}%; height: 100%;"></div>
                        </div>
                    </div>

                    <div style="background: #1E293B; padding: 1rem; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Complexité IA</span>
                            <span style="font-weight: bold; color: {cpx_color};">{cpx_score}/10</span>
                        </div>
                        <div style="background: #0F172A; height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: {cpx_color}; width: {cpx_score * 10}%; height: 100%;"></div>
                        </div>
                    </div>
                </div>

                <!-- Pricing Engine Grid -->
                <div style="background: linear-gradient(to right, #064E3B, #022C22); border: 1px solid #047857; border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem;">
                    <h4 style="margin: 0 0 1rem 0; color: #34D399; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
                        <span>💰</span> Estimation Métier (Pricing Engine)
                    </h4>
                    <div class="hadara-ai-pricing">
                        <div>
                            <div style="font-size: 0.7rem; color: #6EE7B7; text-transform: uppercase;">Budget Estimé</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #FFF; margin: 0.2rem 0;">{format_price(pricing.get('prix_min', 0))} – {format_price(pricing.get('prix_max', 0))} <span style="font-size: 0.75rem; font-weight: normal;">FCFA</span></div>
                            <div style="font-size: 0.75rem; color: #34D399;">Acompte: {format_price(pricing.get('acompte_conseille', 0))}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: #6EE7B7; text-transform: uppercase;">Charge de travail</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #FFF; margin: 0.2rem 0;">{pricing.get('heures_min', 0)}h – {pricing.get('heures_max', 0)}h</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: #6EE7B7; text-transform: uppercase;">Délai conseillé</div>
                            <div style="font-size: 1.1rem; font-weight: bold; color: #FFF; margin: 0.2rem 0;">{pricing.get('delai_min_jours', 0)} – {pricing.get('delai_max_jours', 0)} <span style="font-size: 0.75rem; font-weight: normal;">jours</span></div>
                        </div>
                    </div>
                </div>

                <!-- AI Analysis Details -->
                <div class="hadara-ai-details">
                    <div>
                        <h4 style="color: #F8FAFC; margin: 0 0 0.8rem 0; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">⚠️ Points d'attention</h4>
                        {risques_html}
                    </div>
                    <div>
                        <h4 style="color: #F8FAFC; margin: 0 0 0.8rem 0; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">❓ À clarifier</h4>
                        {questions_html}
                    </div>
                </div>

                <!-- WhatsApp Draft -->
                <div style="background: #1E293B; border-left: 4px solid #25D366; border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                        <span style="font-size: 0.85rem; font-weight: bold; color: #25D366; display: flex; align-items: center; gap: 6px;">
                            📱 Brouillon WhatsApp (Généré par IA)
                        </span>
                        <button type="button" data-text="{whatsapp_text}" onclick="navigator.clipboard.writeText(this.dataset.text); this.innerText='✅ Copié!'; setTimeout(()=>this.innerText='📋 Copier', 2000);" style="background: #25D366; border: none; color: #000; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: bold; transition: background 0.2s;">📋 Copier</button>
                    </div>
                    <div style="color: #E2E8F0; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; background: #0F172A; padding: 1rem; border-radius: 6px; border: 1px solid #334155;">{ai.get('brouillon_whatsapp', '')}</div>
                </div>
            </div>
            '''
        else:
            ai_block = f'''
            <div style="background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">✨</div>
                <h4 style="color: #F8FAFC; margin: 0 0 0.5rem 0; font-size: 1.2rem;">Hadara AI Analyzer</h4>
                <p style="color: #94A3B8; font-size: 0.9rem; margin-bottom: 1.2rem; max-width: 400px; margin-left: auto; margin-right: auto;">
                    Obtenez instantanément l'estimation métier (prix/délai) couplée à une analyse intelligente des risques et un brouillon de réponse client.
                </p>
                <button type="button" onclick="{js_submit.replace('"', '&quot;')}" style="background: #D0A21C; border: none; color: #070B18; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 10px rgba(208,162,28,0.2);">✨ Analyser ce brief</button>
            </div>
            '''
            
        versions = obj.deliverable_versions if isinstance(obj.deliverable_versions, list) else []
        v_num = len(versions) + 1
        
        btn_publish = f'<a href="{publish_url}" onclick="return confirm(\'Publier cette maquette en V{v_num} ? Elle sera immédiatement visible par le client.\');" style="display:inline-block; margin-top:0.5rem; background:#D0A21C; border:1px solid #E7BE35; color:#070B18; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:0.9rem; font-weight:bold; box-shadow: 0 4px 10px rgba(208,162,28,0.3);">📤 Publier V{v_num}</a>'
        btn_delivery = f'<a href="{edit_url}" style="display:inline-block; margin-top:0.5rem; background:#10B981; border:1px solid #34D399; color:#070B18; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:0.9rem; font-weight:bold; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">📦 Préparer la livraison HD</a>'

        status_map = {
            'nouveau': (
                '<div style="background: rgba(208,162,28,0.12); border: 1px solid #D0A21C; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #D0A21C; font-size: 1.05rem;">📨 Brief reçu</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Vérifiez les informations du client et saisissez le devis.</p>'
                '</div>'
            ),
            'devis_envoye': (
                '<div style="background: rgba(51,90,121,0.2); border: 1px solid #335A79; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #64B5F6; font-size: 1.05rem;">💰 Devis Transmis</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">En attente de validation client. Aucun travail requis.</p>'
                '</div>'
            ),
            'acompte_recu': (
                '<div style="background: rgba(0,201,167,0.15); border: 1px solid #00C9A7; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #00C9A7; font-size: 1.05rem;">💳 Paiement confirmé</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Le projet peut commencer.</p>'
                f'{btn_publish}'
                '</div>'
            ),
            'en_creation': (
                '<div style="background: rgba(0,201,167,0.18); border: 1px solid #00C9A7; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                f'<strong style="color: #00C9A7; font-size: 1.05rem;">{"🎨 Projet en création" if v_num == 1 else "🔵 Le client demande une modification"}</strong>'
                f'<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">{"La prochaine étape est de publier la première proposition." if v_num == 1 else "Publiez la nouvelle maquette une fois corrigée."}</p>'
                f'{btn_publish}'
                '</div>'
            ),
            'validation': (
                '<div style="background: rgba(208,162,28,0.12); border: 1px solid #D0A21C; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #D0A21C; font-size: 1.05rem;">🟡 En attente du retour client</strong>'
                '<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">Aucun travail requis pour le moment.</p>'
                '</div>'
            ),
            'approved': (
                '<div style="background: rgba(16,185,129,0.2); border: 1px solid #10B981; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #34D399; font-size: 1.05rem;">🟢 Conception validée</strong>'
                f'<p style="color: #F4F1EA; margin: 0.3rem 0 0.6rem 0; font-size: 0.88rem;">La maquette finale a été approuvée par le client.</p>'
                f'{btn_delivery}'
                '</div>'
            ),
            'termine': (
                '<div style="background: rgba(16,185,129,0.2); border: 1px solid #10B981; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">'
                '<strong style="color: #34D399; font-size: 1.05rem;">✅ Projet Officiellement Terminé & Livré</strong>'
                '</div>'
            )
        }
        return mark_safe(ai_block + status_map.get(obj.status, '<span style="color:#A8B0BD;">Projet en cours de traitement.</span>'))

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
            'fields': ('status_actions_guided', 'status')
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
        ('📋 Engagements Client (Validation Initial Brief)', {
            'fields': ('accept_process', 'accept_deadlines'),
            'classes': ('collapse',),
        }),
        ('📎 Références & Fichiers Client (Vue Cockpit Clean)', {
            'fields': ('display_client_files_and_references',),
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


# ─── MODULE FACTURATION & REVENUS ────────────────────────────────────────────────────

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'organization', 'whatsapp', 'email', 'created_at')
    search_fields = ('id', 'name', 'organization', 'whatsapp', 'email')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Identifiant', {'fields': ('id', 'created_at')}),
        ('Informations Client', {'fields': ('name', 'organization', 'email', 'whatsapp', 'address')}),
    )


class BillingLineInline(admin.TabularInline):
    model   = BillingLine
    extra   = 1
    fields  = ('designation', 'quantity', 'unit_price', 'line_total_display')
    readonly_fields = ('line_total_display',)

    def line_total_display(self, obj):
        if obj and obj.pk:
            formatted = f'{obj.line_total:,}'.replace(',', '\u202f')
            return format_html('<strong>{} FCFA</strong>', formatted)
        return '—'
    line_total_display.short_description = 'Total ligne'


class PaymentInline(admin.TabularInline):
    model   = Payment
    extra   = 1
    fields  = ('id', 'amount', 'method', 'payment_date', 'reference_code', 'note')
    readonly_fields = ('id',)


@admin.register(BillingDocument)
class BillingDocumentAdmin(admin.ModelAdmin):
    list_display  = ('document_number', 'doc_type', 'billing_client_name', 'display_total', 'display_paid', 'display_balance', 'payment_status_badge', 'issue_date')
    list_filter   = ('doc_type', 'payment_status', 'issue_date')
    search_fields = ('document_number', 'billing_client_name', 'billing_organization')
    readonly_fields = (
        'document_number', 'issue_date', 'created_at', 'updated_at',
        'display_total', 'display_paid', 'display_balance', 'payment_status_badge',
    )
    inlines = [BillingLineInline, PaymentInline]
    save_on_top = True

    fieldsets = (
        ('📄 Document', {
            'fields': ('document_number', 'doc_type', 'payment_status', 'issue_date', 'due_date', 'notes')
        }),
        ('👤 Lien Projet', {
            'fields': ('client', 'brief'),
        }),
        ('📸 Snapshot Client (Immuable sur la facture)', {
            'classes': ('collapse',),
            'fields': ('billing_client_name', 'billing_organization', 'billing_address', 'billing_email', 'billing_whatsapp'),
        }),
        ('💰 Finance', {
            'fields': ('subtotal', 'discount', 'display_total', 'currency'),
        }),
        ('📊 Encaissements', {
            'fields': ('display_paid', 'display_balance', 'payment_status_badge'),
        }),
    )

    def display_total(self, obj):
        total = int(obj.total) if obj.total is not None else 0
        formatted = f'{total:,}'.replace(',', '\u202f')
        return format_html('<strong style="color:#f59e0b">{} FCFA</strong>', formatted)
    display_total.short_description = 'Total net'

    def display_paid(self, obj):
        paid = int(obj.paid_amount) if obj.paid_amount is not None else 0
        color = '#10b981' if paid > 0 else '#64748b'
        formatted = f'{paid:,}'.replace(',', '\u202f')
        return format_html('<span style="color:{}">{} FCFA</span>', color, formatted)
    display_paid.short_description = 'Encaissé'

    def display_balance(self, obj):
        bal = int(obj.balance_due) if obj.balance_due is not None else 0
        color = '#ef4444' if bal > 0 else '#10b981'
        label = f'{bal:,} FCFA'.replace(',', '\u202f')
        return format_html('<strong style="color:{}">{}</strong>', color, label)
    display_balance.short_description = 'Reste à payer'

    def payment_status_badge(self, obj):
        colors = {
            'brouillon':         '#64748b',
            'en_attente':        '#94a3b8',
            'partiellement_paye':'#f59e0b',
            'paye':              '#10b981',
            'en_retard':         '#ef4444',
            'annule':            '#6b7280',
        }
        label = obj.get_payment_status_display()
        color = colors.get(obj.payment_status, '#94a3b8')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold">{}</span>',
            color, label
        )
    payment_status_badge.short_description = 'Statut'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('id', 'billing_document', 'amount', 'method', 'payment_date', 'reference_code')
    list_filter   = ('method', 'payment_date')
    search_fields = ('reference_code', 'billing_document__document_number')
    readonly_fields = ('id',)
    ordering = ('-payment_date',)
