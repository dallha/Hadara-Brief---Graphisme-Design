"""
PublicChatService — Assistant commercial intelligent pour le chat public.

Ce module transforme le chatbot de simple FAQ en assistant commercial
capable de :
- Détecter l'intention de l'utilisateur
- Fournir des estimations de prix via le Pricing Engine
- Poser des questions ciblées quand l'information est insuffisante
- Rediriger vers le brief uniquement quand nécessaire

Architecture :
    User message
        ↓
    IntentDetector
        ↓
    ├── FAQ → réponse directe
    ├── PRICING → PricingEngine + LLM formule la réponse
    ├── SERVICES → liste des services
    ├── BRIEF → encourage le formulaire
    └── HUMAN → contact WhatsApp

    Le Pricing Engine reste souverain. Le LLM ne fabrique jamais de prix.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Intent Detection
# ─────────────────────────────────────────────────────────────────────────────

class Intent(Enum):
    FAQ = "faq"
    PRICING = "pricing"
    SERVICES = "services"
    BRIEF = "brief"
    HUMAN_CONTACT = "human_contact"
    GREETING = "greeting"
    UNKNOWN = "unknown"


@dataclass
class DetectedIntent:
    intent: Intent
    project_type: Optional[str] = None
    confidence: float = 0.0
    extracted_info: Optional[dict] = None


# Mots-clés pour la détection d'intention
PRICING_KEYWORDS = [
    "prix", "price", "coût", "cout", "tarif", "tarif", "combien", "FCFA",
    "fcfa", "budget", "estimation", "devis", "coute", "coûte", "prix",
    "cher", "pas cher", "abordable", "gratuit", "payant",
]

SERVICE_KEYWORDS = [
    "logo", "identité", "identite", "charte", "affiche", "bâche", "bache",
    "flyer", "brochure", "catalogue", "réseau", "reseau", "instagram",
    "facebook", "bannière", "banniere", "carte", "visite", "rapport",
    "présentation", "presentation", "menu", "site", "web", "mockup",
    "ui", "design", "graphisme", "creation", "création",
]

BRIEF_KEYWORDS = [
    "brief", "formulaire", "soumettre", "envoyer mon projet", "commencer",
    "démarrer", "lancer", "commander",
]

HUMAN_KEYWORDS = [
    "humain", "personne", "parler", "appeler", "téléphone", "telephone",
    "whatsapp", "contacter", "joindre", "appel", "discuter",
]

GREETING_KEYWORDS = [
    "bonjour", "bonsoir", "salut", "hello", "hey", "coucou", "bonne",
    "rebonjour", "salutations",
]

# Mapping des mots-clés vers les types de projets du Pricing Engine
PROJECT_TYPE_KEYWORDS = {
    "logo": "logo",
    "identité": "identite_marque",
    "identite": "identite_marque",
    "charte": "charte_graphique",
    "affiche": "affiche",
    "bâche": "bache",
    "bache": "bache",
    "flyer": "flyer",
    "brochure": "brochure",
    "catalogue": "catalogue",
    "réseau": "reseaux_sociaux",
    "reseau": "reseaux_sociaux",
    "instagram": "reseaux_sociaux",
    "facebook": "reseaux_sociaux",
    "bannière": "banniere_web",
    "banniere": "banniere_web",
    "carte": "carte_visite",
    "visite": "carte_visite",
    "rapport": "rapport",
    "présentation": "presentation",
    "presentation": "presentation",
    "menu": "menu",
    "site": "site_web_ui",
    "web": "site_web_ui",
    "mockup": "mockup_ui",
    "ui": "mockup_ui",
}


class IntentDetector:
    """Détecte l'intention de l'utilisateur à partir de son message."""

    def detect(self, message: str) -> DetectedIntent:
        """Analyse le message et retourne l'intention détectée."""
        lower = message.lower().strip()

        # 1. Salutation
        if any(kw in lower for kw in GREETING_KEYWORDS):
            if len(lower.split()) <= 3:
                return DetectedIntent(intent=Intent.GREETING, confidence=0.9)

        # 2. Contact humain
        if any(kw in lower for kw in HUMAN_KEYWORDS):
            return DetectedIntent(intent=Intent.HUMAN_CONTACT, confidence=0.85)

        # 3. Brief / formulaire
        if any(kw in lower for kw in BRIEF_KEYWORDS):
            return DetectedIntent(intent=Intent.BRIEF, confidence=0.8)

        # 4. Détection de type de projet
        has_project_type = self._detect_project_type(lower)

        # 5. Demande de prix
        has_pricing_keyword = any(kw in lower for kw in PRICING_KEYWORDS)

        if has_pricing_keyword and has_project_type:
            return DetectedIntent(
                intent=Intent.PRICING,
                project_type=has_project_type,
                confidence=0.9,
                extracted_info=self._extract_info(lower),
            )
        elif has_pricing_keyword:
            return DetectedIntent(
                intent=Intent.PRICING,
                confidence=0.7,
                extracted_info=self._extract_info(lower),
            )

        # 6. Demande de service (sans prix)
        if has_project_type:
            return DetectedIntent(
                intent=Intent.SERVICES,
                project_type=has_project_type,
                confidence=0.8,
            )

        # 7. Question générale (FAQ)
        return DetectedIntent(intent=Intent.FAQ, confidence=0.5)

    def _detect_project_type(self, text: str) -> Optional[str]:
        """Détecte le type de projet mentionné dans le texte."""
        for keyword, project_type in PROJECT_TYPE_KEYWORDS.items():
            if keyword in text:
                return project_type
        return None

    def _extract_info(self, text: str) -> dict:
        """Extrait les informations exploitables du message."""
        info = {}

        # Détecter les dimensions (ex: "3m", "3 m", "100x200")
        dim_pattern = r"(\d+)\s*[mMx×]\s*(\d+)?"
        dim_match = re.search(dim_pattern, text)
        if dim_match:
            info["dimension"] = dim_match.group(0)

        # Détecter les quantités
        qty_pattern = r"(\d+)\s*(?:pièce|piece|exemplaire|unité|unit|nb)"
        qty_match = re.search(qty_pattern, text)
        if qty_match:
            info["quantity"] = int(qty_match.group(1))

        # Détecter l'urgence
        urgency_keywords = {
            "tres_urgent": ["urgent", "demain", "immédiat", "asap", "48h"],
            "urgent": ["cette semaine", "vite", "rapidement"],
            "rapide": ["bientôt", "prochainement", "2 semaines"],
        }
        for level, keywords in urgency_keywords.items():
            if any(kw in text for kw in keywords):
                info["urgency"] = level
                break

        return info


# ─────────────────────────────────────────────────────────────────────────────
# Pricing Integration
# ─────────────────────────────────────────────────────────────────────────────

class PricingIntegration:
    """Intègre le Pricing Engine dans le flux de chat."""

    def get_estimate(self, project_type: str, extra_info: Optional[dict] = None) -> dict:
        """Retourne une estimation de prix pour un type de projet."""
        from api.pricing_engine import HadaraPricingEngine

        engine = HadaraPricingEngine()

        # Créer un Brief minimal pour le Pricing Engine
        brief = self._create_minimal_brief(project_type, extra_info)
        result = engine.calculate(brief)

        return {
            "project_type": project_type,
            "price_min": result.get("prix_min_fcfa", 0),
            "price_max": result.get("prix_max_fcfa", 0),
            "delay_min": result.get("delai_min_jours", 0),
            "delay_max": result.get("delai_max_jours", 0),
            "complexity": result.get("score_complexite", 5),
        }

    def _create_minimal_brief(self, project_type: str, extra_info: Optional[dict] = None):
        """Crée un objet Brief minimal pour le Pricing Engine."""
        class MinimalBrief:
            def __init__(self, ptype, info):
                self.client_name = "Chat Public"
                self.project_type = ptype
                self.project_type_custom = ""
                self.context_description = f"Demande depuis le chat public"
                self.primary_objective = ""
                self.target_audience = ""
                self.technical_format = ""
                self.budget_range = "non_defini"
                self.desired_delivery_date = ""
                self.style_preferences = []
                self.preferred_colors = []
                self.main_title = ""
                self.whatsapp = ""
                self.email = ""
                self.reference_links = ""
                self.full_text_content = ""
                self.critical_deadline = ""

                # Appliquer les infos extraites
                if info:
                    if info.get("urgency"):
                        self.critical_deadline = info["urgency"]

        return MinimalBrief(project_type, extra_info or {})


# ─────────────────────────────────────────────────────────────────────────────
# Response Generator
# ─────────────────────────────────────────────────────────────────────────────

class ResponseGenerator:
    """Génère les réponses du chatbot en fonction de l'intention détectée."""

    def generate_greeting(self) -> str:
        return (
            "Bonjour ! 👋 Je suis Mme Niass Madina, assistante IA du Studio Hadara.\n\n"
            "Je peux vous renseigner sur nos services et vous donner une estimation "
            "pour votre projet.\n\n"
            "Que recherchez-vous ?"
        )

    def generate_service_info(self, project_type: str) -> str:
        """Retourne des informations sur un service spécifique."""
        from api.pricing_engine import TARIFS_BASE

        tarif = TARIFS_BASE.get(project_type, TARIFS_BASE.get("autre"))
        min_price = tarif["min"]
        max_price = tarif["max"]

        service_names = {
            "logo": "Logo professionnel",
            "identite_marque": "Identité de marque complète",
            "charte_graphique": "Charte graphique",
            "affiche": "Affiche publicitaire",
            "bache": "Bâche grand format",
            "flyer": "Flyer / Dépliant",
            "brochure": "Brochure",
            "catalogue": "Catalogue",
            "reseaux_sociaux": "Réseaux sociaux",
            "banniere_web": "Bannière web",
            "carte_visite": "Carte de visite",
            "site_web_ui": "Site web / UI",
            "mockup_ui": "Mockup UI",
        }

        name = service_names.get(project_type, project_type)
        return (
            f"**{name}**\n\n"
            f"Fourchette de prix : {min_price:,} à {max_price:,} FCFA\n"
            f"Délai estimé : {tarif['h'][0]} à {tarif['h'][1]} jours\n\n"
            "Pour un devis précis, vous pouvez remplir notre formulaire de brief, "
            "ou me donner plus de détails sur votre projet."
        )

    def generate_pricing_response(
        self, project_type: str, estimate: dict, extra_info: Optional[dict] = None
    ) -> str:
        """Génère une réponse avec estimation de prix."""
        from api.pricing_engine import TARIFS_BASE

        price_min = estimate["price_min"]
        price_max = estimate["price_max"]
        delay_min = estimate["delay_min"]
        delay_max = estimate["delay_max"]

        # Noms des services en français
        service_names = {
            "logo": "un logo professionnel",
            "identite_marque": "une identité de marque complète",
            "charte_graphique": "une charte graphique",
            "affiche": "une affiche publicitaire",
            "bache": "une bâche grand format",
            "flyer": "un flyer",
            "brochure": "une brochure",
            "catalogue": "un catalogue",
            "reseaux_sociaux": "un pack réseaux sociaux",
            "banniere_web": "une bannière web",
            "carte_visite": "des cartes de visite",
            "site_web_ui": "un site web",
            "mockup_ui": "un mockup UI",
        }

        service_name = service_names.get(project_type, "votre projet")

        response = (
            f"**Estimation pour {service_name}**\n\n"
            f"💰 **Prix estimé : {price_min:,} à {price_max:,} FCFA**\n"
            f"📅 **Délai : {delay_min} à {delay_max} jours ouvrables**\n\n"
        )

        # Ajouter des informations contextuelles
        if extra_info:
            if extra_info.get("urgency") == "tres_urgent":
                response += (
                    "⚠️ Pour un projet urgent (< 48h), des majorations "
                    "peuvent s'appliquer.\n\n"
                )
            if extra_info.get("dimension"):
                response += (
                    f"📏 Format détecté : {extra_info['dimension']}\n"
                )

        response += (
            "Ces tarifs sont indicatifs et peuvent varier selon les "
            "spécifications exactes (finition, quantité, complexité).\n\n"
            "Pour un devis définitif, "
            "[remplissez notre brief](/brief) ou donnez-moi plus de détails."
        )

        return response

    def generate_insufficient_info(self, project_type: Optional[str] = None) -> str:
        """Pose des questions ciblées quand l'information est insuffisante."""
        if project_type:
            from api.pricing_engine import TARIFS_BASE
            tarif = TARIFS_BASE.get(project_type, TARIFS_BASE.get("autre"))

            return (
                f"Je peux vous donner une estimation ! "
                f"Pour affiner le prix, j'aurais besoin de quelques précisions :\n\n"
                f"1. **Dimensions** : quelle taille souhaitez-vous ?\n"
                f"2. **Quantité** : combien d'exemplaires ?\n"
                f"3. **Délai** : quand avez-vous besoin du livrable ?\n\n"
                f"En attendant, la fourchette de base est de "
                f"**{tarif['min']:,} à {tarif['max']:,} FCFA**."
            )
        else:
            return (
                "Je peux vous aider ! Pour vous donner une estimation précise, "
                "j'aurais besoin de savoir :\n\n"
                "1. **Type de projet** : logo, affiche, bâche, site web ?\n"
                "2. **Dimensions** : quelle taille ?\n"
                "3. **Délai** : quand avez-vous besoin du livrable ?\n\n"
                "Vous pouvez aussi "
                "[remplir notre brief](/brief) pour un devis complet."
            )

    def generate_human_contact(self) -> str:
        return (
            "Bien sûr ! Vous pouvez contacter directement notre équipe :\n\n"
            "📱 **WhatsApp** : [+221 77 623 27 41](https://wa.me/221776232741)\n"
            "📱 **WhatsApp** : [+221 76 375 63 63](https://wa.me/221763756363)\n"
            "✉️ **Email** : mrniass@gmail.com\n\n"
            "Nous sommes disponibles du lundi au samedi."
        )

    def generate_fallback(self) -> str:
        return (
            "Je ne suis pas sûre de comprendre votre demande. "
            "Je peux vous renseigner sur :\n\n"
            "• Nos **services** (logo, affiche, bâche, site web...)\n"
            "• Nos **tarifs** (estimations par type de projet)\n"
            "• Comment **soumettre un brief**\n\n"
            "Ou vous pouvez "
            "[nous contacter directement](https://wa.me/221776232741)."
        )


# ─────────────────────────────────────────────────────────────────────────────
# Public Chat Service (point d'entrée unique)
# ─────────────────────────────────────────────────────────────────────────────

class PublicChatService:
    """Service de chat public intelligent avec détection d'intention."""

    def __init__(self):
        self.detector = IntentDetector()
        self.pricing = PricingIntegration()
        self.responder = ResponseGenerator()

    def process_message(self, user_message: str) -> str:
        """Traite un message utilisateur et retourne la réponse."""
        detected = self.detector.detect(user_message)

        logger.info(
            "Chat intent: %s (project_type=%s, confidence=%.2f)",
            detected.intent.value,
            detected.project_type,
            detected.confidence,
        )

        if detected.intent == Intent.GREETING:
            return self.responder.generate_greeting()

        elif detected.intent == Intent.HUMAN_CONTACT:
            return self.responder.generate_human_contact()

        elif detected.intent == Intent.BRIEF:
            return (
                "Pour soumettre un brief, rendez-vous sur "
                "[notre formulaire](/brief). C'est gratuit et sans engagement !\n\n"
                "Je peux aussi vous donner une estimation avant si vous le souhaitez."
            )

        elif detected.intent == Intent.PRICING:
            if detected.project_type:
                estimate = self.pricing.get_estimate(
                    detected.project_type, detected.extracted_info
                )
                return self.responder.generate_pricing_response(
                    detected.project_type, estimate, detected.extracted_info
                )
            else:
                return self.responder.generate_insufficient_info()

        elif detected.intent == Intent.SERVICES:
            if detected.project_type:
                return self.responder.generate_service_info(detected.project_type)
            else:
                return self._generate_services_list()

        else:  # FAQ or UNKNOWN
            return self.responder.generate_fallback()

    def _generate_services_list(self) -> str:
        """Retourne la liste complète des services."""
        return (
            "**Nos services**\n\n"
            "🎨 **Identité visuelle**\n"
            "• Logo professionnel\n"
            "• Identité de marque complète\n"
            "• Charte graphique\n\n"
            "📢 **Supports publicitaires**\n"
            "• Affiche / Flyer\n"
            "• Bâche grand format\n"
            "• Brochure / Catalogue\n"
            "• Carte de visite\n\n"
            "💻 **Digital**\n"
            "• Réseaux sociaux\n"
            "• Bannière web\n"
            "• Site web / UI\n\n"
            "Pour un devis, "
            "[remplissez notre brief](/brief) ou demandez-moi une estimation !"
        )


# Instance singleton
public_chat = PublicChatService()
