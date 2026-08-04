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
from .auth_views import verify_admin_token
from .pdf_utils import generate_brief_pdf

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

class BriefViewSet(viewsets.ModelViewSet):
    queryset = Brief.objects.all().order_by('-created_at')
    serializer_class = BriefSerializer

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
