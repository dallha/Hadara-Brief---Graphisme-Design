import os
import json
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from google import genai
from google.genai import types

from .models import Brief, Template, PortfolioItem, StoreProduct
from .serializers import BriefSerializer, TemplateSerializer, PortfolioItemSerializer, StoreProductSerializer
from .auth_views import verify_admin_token, verify_client_token
from .pdf_utils import generate_brief_pdf
from rest_framework.permissions import BasePermission

class AdminTokenPermission(BasePermission):
    """Permission that checks for valid admin token in Authorization header"""
    def has_permission(self, request, view):
        return verify_admin_token(request)

class AdminOrClientTokenPermission(BasePermission):
    """Permission that checks for valid admin or client token in Authorization header"""
    def has_permission(self, request, view):
        if verify_admin_token(request):
            request.is_admin = True
            return True
        
        client_whatsapp = verify_client_token(request)
        if client_whatsapp:
            request.is_admin = False
            request.client_whatsapp = client_whatsapp
            return True
        return False

def send_status_email(brief, old_status, new_status):
    if old_status == new_status or not brief.email:
        return
        
    subject = f"[Hadara Studio] Mise à jour de votre projet : {brief.main_title}"
    
    # Text message based on status
    status_msg = ""
    if new_status == 'devis_envoye':
        status_msg = "Votre devis a été généré et est disponible sur votre espace client."
    elif new_status == 'acompte_recu':
        status_msg = "Nous avons bien reçu votre acompte de démarrage. L'équipe commence la création."
    elif new_status == 'en_creation':
        status_msg = "Votre projet est actuellement en cours de création par notre équipe."
    elif new_status == 'validation':
        status_msg = "Une première version de votre projet est prête. Veuillez vous connecter pour la valider."
    elif new_status == 'termine':
        status_msg = "Félicitations, votre projet est terminé et vos fichiers finaux (HD) sont disponibles au téléchargement."
    
    if not status_msg:
        return
        
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #FBBF24;">Bonjour {brief.client_name},</h2>
            <p>{status_msg}</p>
            <p><strong>Statut actuel :</strong> {new_status.replace('_', ' ').title()}</p>
            <br/>
            <p>Consultez votre espace client pour plus de détails et pour télécharger votre devis PDF :</p>
            <p><a href="{os.getenv('FRONTEND_URL', 'https://hadara-design.com')}" style="padding: 10px 20px; background-color: #FBBF24; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mon espace</a></p>
            <br/><br/>
            <p>L'équipe Hadara Studio.</p>
        </body>
    </html>
    """
    text_content = strip_tags(html_content)
    
    try:
        msg = EmailMultiAlternatives(subject, text_content, os.getenv('DEFAULT_FROM_EMAIL', 'Hadara Studio <mrniass@gmail.com>'), [brief.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    except Exception as e:
        print(f"Erreur envoi email: {e}")

from rest_framework.permissions import AllowAny

class BriefViewSet(viewsets.ModelViewSet):
    queryset = Brief.objects.all().order_by('-created_at')
    serializer_class = BriefSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [AdminOrClientTokenPermission()]

    def get_queryset(self):
        qs = super().get_queryset()
        # AdminOrClientTokenPermission sets request.is_admin and request.client_whatsapp
        if hasattr(self.request, 'is_admin') and self.request.is_admin:
            return qs
        if hasattr(self.request, 'client_whatsapp') and self.request.client_whatsapp:
            # Client can only see their own briefs, matching whatsapp partially or exactly
            # Since whatsapp numbers might be formatted differently, we do an icontains or exact match
            # For exact security we should match the exact stripped number
            return qs.filter(whatsapp__icontains=self.request.client_whatsapp)
        return qs.none()

    def update(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        instance = self.get_object()
        old_status = instance.status
        kwargs['partial'] = True
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200:
            new_status = response.data.get('status')
            send_status_email(instance, old_status, new_status)
        return response

    def partial_update(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        instance = self.get_object()
        old_status = instance.status
        response = super().partial_update(request, *args, **kwargs)
        if response.status_code == 200:
            new_status = response.data.get('status')
            send_status_email(instance, old_status, new_status)
        return response
        
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        brief = self.get_object()
        pdf_bytes = generate_brief_pdf(brief)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Devis_Brief_{brief.id}.pdf"'
        return response

    def destroy(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        from django.utils import timezone
        import datetime
        import requests
        from urllib.parse import quote
        
        # Idempotency check: prevent duplicate submissions
        client_name = request.data.get('clientName')
        whatsapp = request.data.get('whatsapp')
        
        if client_name and whatsapp:
            time_threshold = timezone.now() - datetime.timedelta(minutes=5)
            recent_brief = Brief.objects.filter(
                client_name=client_name, 
                whatsapp=whatsapp, 
                created_at__gte=time_threshold
            ).first()
            
            if recent_brief:
                # Return the existing brief instead of creating a new one
                serializer = self.get_serializer(recent_brief)
                return Response(serializer.data, status=status.HTTP_200_OK)
                
        response = super().create(request, *args, **kwargs)
        
        # Send Notification via Official Telegram Bot
        if response.status_code == status.HTTP_201_CREATED:
            telegram_token = os.getenv("TELEGRAM_BOT_TOKEN")
            telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
            
            if telegram_token and telegram_chat_id:
                import threading
                
                def send_telegram_alert(data, token, chat_id):
                    try:
                        # Extraction des données
                        dossier = data.get('id', 'N/A')
                        client = data.get('clientName', 'N/A')
                        orga = data.get('organization') or 'Particulier'
                        wa_num = data.get('whatsapp', 'N/A')
                        projet = data.get('projectType', 'N/A')
                        format_tech = data.get('technicalFormat', '')
                        evenement = data.get('contextDescription', 'N/A')[:50] + "..."
                        livraison = data.get('desiredDeliveryDate', 'N/A')
                        budget = data.get('budgetRange', 'N/A')
                        urgence = "Haute" if data.get('criticalDeadline') else "Normale"
                        
                        # Message propre sans markdown ni emojis cassés
                        titre = data.get('mainTitle', 'N/A')
                        msg  = f"NOUVEAU BRIEF RECU\n"
                        msg += f"{'─' * 30}\n"
                        msg += f"N° Dossier      : {dossier}\n"
                        msg += f"Client          : {client} ({orga})\n"
                        msg += f"WhatsApp        : {wa_num}\n"
                        msg += f"Type de projet  : {projet.capitalize()}\n"
                        msg += f"Intitule        : {titre}\n"
                        msg += f"Format          : {format_tech}\n"
                        msg += f"Budget          : {budget}\n"
                        msg += f"Livraison       : {livraison}\n"
                        msg += f"Urgence         : {urgence}\n"
                        msg += f"{'─' * 30}\n"
                        frontend_url = os.getenv("FRONTEND_URL", "https://mrniass.dynv6.net").rstrip('/')
                        msg += f"Ouvrir : {frontend_url}/admin"
                        
                        url = f"https://api.telegram.org/bot{token}/sendMessage"
                        payload = {
                            "chat_id": chat_id,
                            "text": msg,
                        }
                        requests.post(url, json=payload, timeout=5)
                    except Exception as e:
                        print(f"Erreur d'envoi Telegram asynchrone: {e}")
                
                # Launch thread
                thread = threading.Thread(target=send_telegram_alert, args=(response.data, telegram_token, telegram_chat_id))
                thread.start()

            # Auto-trigger Hadara AI Workflow (async)
            try:
                import threading as _threading
                brief_id = response.data.get('id')
                if brief_id:
                    def _run_ai_workflow(bid):
                        try:
                            from hadara_ai.workflow.orchestrator import WorkflowOrchestrator
                            WorkflowOrchestrator().run(str(bid), skip_communication=True)
                        except Exception as e:
                            print(f"Erreur Hadara AI Workflow: {e}")
                    _threading.Thread(target=_run_ai_workflow, args=(brief_id,), daemon=True).start()
            except Exception:
                pass
            
            # Send Email Confirmation to Client
            client_email = response.data.get('email')
            if client_email:
                try:
                    subject = "[Hadara Studio] Confirmation de réception de votre brief"
                    html_content = f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; color: #333;">
                            <h2 style="color: #FBBF24;">Bonjour {response.data.get('clientName')},</h2>
                            <p>Nous vous confirmons la bonne réception de votre demande (Projet: {response.data.get('mainTitle', '')}).</p>
                            <p>Notre équipe va l'étudier avec attention. Vous recevrez très prochainement une estimation ou un devis détaillé.</p>
                            <br/>
                            <p>Vous pouvez suivre l'avancement de votre projet depuis votre espace client :</p>
                            <p><a href="{os.getenv('FRONTEND_URL', 'https://hadara-design.com')}" style="padding: 10px 20px; background-color: #FBBF24; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Mon espace projet</a></p>
                            <br/><br/>
                            <p>L'équipe Hadara Studio.</p>
                        </body>
                    </html>
                    """
                    text_content = strip_tags(html_content)
                    msg = EmailMultiAlternatives(subject, text_content, os.getenv('DEFAULT_FROM_EMAIL', 'Hadara Studio <mrniass@gmail.com>'), [client_email])
                    msg.attach_alternative(html_content, "text/html")
                    msg.send()
                except Exception as e:
                    print(f"Erreur envoi email confirmation: {e}")
                    
        return response

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

@api_view(['POST'])
def chat_api_view(request):
    try:
        messages = request.data.get('messages', [])
        if not messages:
            return Response({'error': 'Messages missing'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .ai_utils import chat_with_assistant
        response_text = chat_with_assistant(messages)
        
        return Response({'reply': response_text})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def ocr_correct_api_view(request):
    try:
        raw_text = request.data.get('text', '')
        if not raw_text:
            return Response({'error': 'Texte manquant'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .ai_utils import correct_ocr_text
        corrected_text = correct_ocr_text(raw_text)
        
        return Response({'text': corrected_text})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def ai_analyze_brief(request, pk):
    try:
        brief = Brief.objects.get(pk=pk)
    except Brief.DoesNotExist:
        return Response({'error': 'Brief non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return Response({'error': 'Clé API Gemini non configurée'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    client = genai.Client(api_key=api_key)

    prompt_text = f"""
Tu es le directeur artistique du "Graphiste de la Hadara" (Elhadji Abdoulaye Mouhamed Lamine Niass).
Ta mission est de proposer pour ce brief client une exploration conceptuelle riche en générant 3 concepts visuels radicalement différents.

CONSIGNES STRICTES DE CONCEPT :
1. Chaque concept doit inclure :
   - Un nom inspirant
   - Une métaphore visuelle (le symbole caché)
   - Une description visuelle claire
   - La direction artistique (Couleurs Hexa, style photo/illustration)
   - L'angle marketing (pourquoi cette idée percutera la cible d'un point de vue psychologique)
2. BANIS LES CLICHÉS ÉCULÉS : Pas de chameaux, pas de croissants de lune basiques, pas de mosquées génériques (sauf si réinterprétés de façon ultra-moderne).
3. Respecte impérativement le slogan "Allier tradition et modernité".
4. Utilise prioritairement la palette officielle : Bleu profond (#335A79), Or olive (#816C07), Crème doux (#F5F5DC), Vert forêt (#224A33), Rouge rouille (#A6472F).

INFORMATIONS DU BRIEF CLIENT:
- ID Brief : {brief.id}
- Client : {brief.client_name} ({brief.organization or "Particulier"})
- Type de projet : {brief.project_type}
- Titre / Slogan : {brief.main_title}
- Contexte : {brief.context_description}
- Objectif : {brief.primary_objective}
- Cible : {brief.target_audience} ({', '.join(brief.target_audience_chips)})
- Texte à afficher : {brief.full_text_content}
- Styles souhaités : {', '.join(brief.style_preferences)}
- Couleurs préférées : {brief.preferred_colors}
- Format technique : {brief.technical_format} ({brief.custom_dimensions or ""})

Génère la réponse sous forme de JSON strict avec le schéma suivant :
{{
  "summary": "Résumé fluide du projet en 2 phrases",
  "strengths": ["point fort 1", "point fort 2"],
  "missingDetails": ["élément à clarifier 1"],
  "recommendedColors": [
    {{"hex": "#335A79", "name": "Bleu Profond Hadara"}}
  ],
  "suggestedTypography": "Recommandation typographique",
  "layoutAdvice": "Conseil de composition visuelle",
  "estimatedHours": "4 à 6 heures",
  "suggestedPriceFCFA": 65000,
  "whatsappQuoteDraft": "Message politesse + devis WhatsApp",
  "concepts": [
    {{
      "number": 1,
      "name": "Nom du Concept 1",
      "metaphorSymbol": "Description de la métaphore visuelle",
      "visualDescription": "Ce qu'on voit précisément sur l'image",
      "artDirection": "Palette Hexa, style photo/illustration",
      "marketingAngle": "Pourquoi cette idée percutera la cible"
    }}
  ]
}}
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        analysis = json.loads(response.text)
        
        # Save analysis to brief
        brief.ai_analysis = analysis
        brief.save()
        
        return Response({'success': True, 'analysis': analysis})
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PortfolioItemViewSet(viewsets.ModelViewSet):
    queryset = PortfolioItem.objects.all().order_by('-created_at')
    serializer_class = PortfolioItemSerializer

    def create(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        return super().destroy(request, *args, **kwargs)

class StoreProductViewSet(viewsets.ModelViewSet):
    queryset = StoreProduct.objects.all().order_by('-created_at')
    serializer_class = StoreProductSerializer

    def create(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not verify_admin_token(request):
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)
        return super().destroy(request, *args, **kwargs)


# ──────────────────────────────────────────────
# Billing ViewSets
# ──────────────────────────────────────────────
from .models import Client, BillingDocument, BillingLine, Payment  # noqa: E402 (late import ok)
from .serializers import ClientSerializer, BillingDocumentSerializer, BillingLineSerializer, PaymentSerializer
from django.db.models import Sum
import datetime


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('name')
    serializer_class = ClientSerializer


class BillingDocumentViewSet(viewsets.ModelViewSet):
    queryset = BillingDocument.objects.all().order_by('-created_at')
    serializer_class = BillingDocumentSerializer
    permission_classes = [AdminOrClientTokenPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Security: if client, only return their documents
        if not getattr(self.request, 'is_admin', False):
            client_whatsapp = getattr(self.request, 'client_whatsapp', None)
            if client_whatsapp:
                qs = qs.filter(client__whatsapp=client_whatsapp)
            else:
                qs = qs.none()

        doc_type = self.request.query_params.get('type')
        status_param = self.request.query_params.get('status')
        client_id = self.request.query_params.get('client')
        if doc_type:
            qs = qs.filter(doc_type=doc_type)
        if status_param:
            qs = qs.filter(payment_status=status_param)
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Dashboard financier : CA facturé, encaissé, restant, impayés, en retard."""
        if not getattr(request, 'is_admin', False):
            return Response({"error": "Seul l'administrateur peut voir les statistiques."}, status=403)
            
        # Ne considérer que les factures et avoirs valides (pas proforma, pas annulés)
        docs = BillingDocument.objects.exclude(payment_status='annule').exclude(doc_type='proforma')

        # CA total facturé = Somme des factures - Somme des avoirs
        factures_total = docs.filter(doc_type='facture').aggregate(s=Sum('total'))['s'] or 0
        avoirs_total = docs.filter(doc_type='avoir').aggregate(s=Sum('total'))['s'] or 0
        ca_facture = factures_total - avoirs_total

        # CA encaissé = Somme de tous les paiements liés à des factures valides
        ca_encaisse = Payment.objects.exclude(
            billing_document__payment_status='annule'
        ).filter(
            billing_document__doc_type='facture'
        ).aggregate(s=Sum('amount'))['s'] or 0

        # Reste à encaisser = CA facturé - CA encaissé
        ca_restant = max(0, ca_facture - ca_encaisse)

        # Compteurs par statut (uniquement pour les factures)
        factures_actives = docs.filter(doc_type='facture')
        en_retard = factures_actives.filter(payment_status='en_retard').count()
        non_payees = factures_actives.filter(payment_status='en_attente').count()
        partielles = docs.filter(payment_status='partiellement_paye').count()

        # Revenus par mois (6 derniers mois)
        today = datetime.date.today()
        monthly = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - datetime.timedelta(days=i * 30)).replace(day=1)
            month_end = (month_start + datetime.timedelta(days=32)).replace(day=1)
            month_pays = Payment.objects.filter(
                payment_date__gte=month_start,
                payment_date__lt=month_end,
            ).aggregate(s=Sum('amount'))['s'] or 0
            monthly.append({
                'month': month_start.strftime('%b %Y'),
                'encaisse': month_pays,
            })

        return Response({
            'ca_facture': ca_facture,
            'ca_encaisse': ca_encaisse,
            'ca_restant': ca_restant,
            'en_retard': en_retard,
            'non_payees': non_payees,
            'partielles': partielles,
            'monthly': monthly,
        })


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [AdminOrClientTokenPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Security: if client, only return their payments
        if not getattr(self.request, 'is_admin', False):
            client_whatsapp = getattr(self.request, 'client_whatsapp', None)
            if client_whatsapp:
                qs = qs.filter(billing_document__client__whatsapp=client_whatsapp)
            else:
                qs = qs.none()

        doc_id = self.request.query_params.get('document')
        if doc_id:
            qs = qs.filter(billing_document_id=doc_id)
        return qs

    def perform_create(self, serializer):
        # Ensure payment does not exceed invoice total
        billing_doc = serializer.validated_data.get('billing_document')
        amount = serializer.validated_data.get('amount')
        if billing_doc:
            if amount > billing_doc.balance_due:
                raise serializers.ValidationError('Payment amount exceeds outstanding balance.')
        serializer.save()
        # refresh_payment_state is called automatically in Payment.save()

    def perform_destroy(self, instance):
        instance.delete()  # delete() déclenche refresh_payment_state via signal/override
