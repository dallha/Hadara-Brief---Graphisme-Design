"""
PublicChatService — Assistant commercial intelligent pour le chat public.

Ce module transforme le chatbot de simple FAQ en assistant commercial
capable de :
- Détecter l'intention de l'utilisateur (11 intents)
- Fournir des estimations de prix via le Pricing Engine
- Poser des questions ciblées quand l'information est insuffisante
- Répondre aux questions sur le studio, les services, la localisation
- Rediriger vers le brief uniquement quand nécessaire

Architecture :
    User message
        ↓
    IntentDetector
        ↓
    ├── GREETING → salutation
    ├── SERVICE_REQUEST → besoin spécifique + questions ciblées
    ├── PRICING → PricingEngine + estimation
    ├── PRICING_CLARIFICATION → questions sur le prix
    ├── SERVICES → catalogue complet
    ├── ABOUT_STUDIO → informations sur le studio
    ├── LOCATION → localisation
    ├── CONTACT → coordonnées
    ├── BRIEF → formulaire
    ├── HUMAN_CONTACT → contact humain
    └── FAQ → base de connaissances

    Le Pricing Engine reste souverain. Le LLM ne fabrique jamais de prix.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional

from hadara_ai.brand.profile import PROFILE, Service

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Intent Detection
# ─────────────────────────────────────────────────────────────────────────────

class Intent(Enum):
    GREETING = "greeting"
    SERVICE_REQUEST = "service_request"
    PRICING = "pricing"
    PRICING_CLARIFICATION = "pricing_clarification"
    SERVICES = "services"
    ABOUT_STUDIO = "about_studio"
    LOCATION = "location"
    CONTACT = "contact"
    BRIEF = "brief"
    HUMAN_CONTACT = "human_contact"
    FAQ = "faq"
    UNKNOWN = "unknown"


@dataclass
class DetectedIntent:
    intent: Intent
    service: Optional[Service] = None
    confidence: float = 0.0
    extracted_info: Optional[dict] = None
    needs_clarification: bool = False


# Mots-clés pour la détection d'intention
PRICING_KEYWORDS = [
    "prix", "price", "coût", "cout", "tarif", "combien", "fcfa",
    "budget", "estimation", "devis", "coute", "coûte",
    "cher", "pas cher", "abordable", "gratuit", "payant",
]

ABOUT_KEYWORDS = [
    "studio", "hadara", "qui êtes", "qui es tu", "présentation",
    "about", "histoire", "equipe", "équipe", "fondateur",
]

LOCATION_KEYWORDS = [
    "adresse", "localisation", "situé", "situ",
    "quartier", "ville", "pays",
]

CONTACT_KEYWORDS = [
    "téléphone", "telephone", "email", "mail", "whatsapp",
    "numéro", "numero", "contacter", "joindre", "coordonnée",
]

HUMAN_KEYWORDS = [
    "humain", "personne", "parler", "appeler", "discuter",
    "appel", "vraie personne", "真人",
]

GREETING_KEYWORDS = [
    "bonjour", "bonsoir", "salut", "hello", "hey", "coucou",
    "rebonjour", "salutations", "bonne journée",
]

BRIEF_KEYWORDS = [
    "brief", "formulaire", "soumettre", "envoyer mon projet",
    "commencer", "démarrer", "lancer", "commander",
]


class IntentDetector:
    """Détecte l'intention de l'utilisateur à partir de son message."""

    def detect(self, message: str) -> DetectedIntent:
        """Analyse le message et retourne l'intention détectée."""
        lower = message.lower().strip()

        # 1. Salutation (priorité haute si message court)
        if any(kw in lower for kw in GREETING_KEYWORDS):
            if len(lower.split()) <= 4:
                return DetectedIntent(intent=Intent.GREETING, confidence=0.9)

        # 2. Contact humain
        if any(kw in lower for kw in HUMAN_KEYWORDS):
            return DetectedIntent(intent=Intent.HUMAN_CONTACT, confidence=0.85)

        # 3. Brief / formulaire
        if any(kw in lower for kw in BRIEF_KEYWORDS):
            return DetectedIntent(intent=Intent.BRIEF, confidence=0.8)

        # 4. Localisation
        if any(kw in lower for kw in LOCATION_KEYWORDS):
            return DetectedIntent(intent=Intent.LOCATION, confidence=0.85)

        # 5. Contact / coordonnées
        if any(kw in lower for kw in CONTACT_KEYWORDS):
            return DetectedIntent(intent=Intent.CONTACT, confidence=0.85)

        # 6. À propos du studio
        if any(kw in lower for kw in ABOUT_KEYWORDS):
            return DetectedIntent(intent=Intent.ABOUT_STUDIO, confidence=0.8)

        # 7. Détection de service (via BusinessProfile)
        detected_service = PROFILE.services.find_by_keyword(lower)

        # 8. Demande de prix
        has_pricing_keyword = any(kw in lower for kw in PRICING_KEYWORDS)

        if has_pricing_keyword and detected_service:
            return DetectedIntent(
                intent=Intent.PRICING,
                service=detected_service,
                confidence=0.9,
                extracted_info=self._extract_info(lower),
            )
        elif has_pricing_keyword:
            return DetectedIntent(
                intent=Intent.PRICING,
                confidence=0.7,
                extracted_info=self._extract_info(lower),
            )

        # 9. Demande de service spécifique
        if detected_service:
            # Vérifier si c'est une demande ou juste une mention
            is_request = any(w in lower for w in [
                "veux", "besoin", "cherche", "want", "need",
                "pour", "afin", "créer", "faire", "réaliser",
                "demander", "obtenir", "avoir", "commander",
                "de", "avec",
            ])
            if is_request:
                return DetectedIntent(
                    intent=Intent.SERVICE_REQUEST,
                    service=detected_service,
                    confidence=0.85,
                    extracted_info=self._extract_info(lower),
                )
            else:
                return DetectedIntent(
                    intent=Intent.SERVICES,
                    service=detected_service,
                    confidence=0.7,
                )

        # 10. Liste des services
        list_keywords = [
            "services", "proposez", "offrez", "qu'est-ce", "quoi",
            "liste", "catalogue", "tout", "tous",
        ]
        if any(kw in lower for kw in list_keywords):
            return DetectedIntent(intent=Intent.SERVICES, confidence=0.7)

        # 11. FAQ (fallback)
        return self._detect_faq(lower)

    def _detect_faq(self, text: str) -> DetectedIntent:
        """Détecte les questions FAQ courantes."""
        for question, answer in PROFILE.knowledge.faq:
            # Vérifier si le message correspond à une question FAQ
            question_words = question.lower().split()
            matches = sum(1 for w in question_words if w in text)
            if matches >= 2:
                return DetectedIntent(intent=Intent.FAQ, confidence=0.7)

        return DetectedIntent(intent=Intent.UNKNOWN, confidence=0.3)

    def _extract_info(self, text: str) -> dict:
        """Extrait les informations exploitables du message."""
        info = {}

        # Détecter les dimensions (ex: "3m", "3 m", "100x200", "3x2m")
        dim_patterns = [
            r"(\d+)\s*[mM]\s+(?:de\s+)?(?:large|hauteur|longueur|côté|cote)",
            r"(\d+)\s*[mMx×]\s*(\d+)?\s*[mM]?",
            r"(\d+)\s*[xX×]\s*(\d+)",
        ]
        for pattern in dim_patterns:
            dim_match = re.search(pattern, text)
            if dim_match:
                info["dimension"] = dim_match.group(0)
                break

        # Détecter les quantités
        qty_patterns = [
            r"(\d+)\s*(?:pièce|piece|exemplaire|unité|unit|nb)",
            r"(\d+)\s*(?:x|×)\s*(?:pièce|piece)",
        ]
        for pattern in qty_patterns:
            qty_match = re.search(pattern, text)
            if qty_match:
                info["quantity"] = int(qty_match.group(1))
                break

        # Détecter l'urgence
        urgency_keywords = {
            "tres_urgent": ["urgent", "demain", "immédiat", "asap", "48h", "24h"],
            "urgent": ["cette semaine", "vite", "rapidement", "assez vite"],
            "rapide": ["bientôt", "prochainement", "2 semaines", "vite"],
        }
        for level, keywords in urgency_keywords.items():
            if any(kw in text for kw in keywords):
                info["urgency"] = level
                break

        # Détecter le contexte événementiel
        event_keywords = [
            "événement", "evenement", "fête", "fete", "concert",
            "conférence", "conference", "séminaire", "seminaire",
            "lancement", "inauguration", "promotion",
        ]
        if any(kw in text for kw in event_keywords):
            info["context"] = "event"

        return info


# ─────────────────────────────────────────────────────────────────────────────
# Pricing Integration
# ─────────────────────────────────────────────────────────────────────────────

class PricingIntegration:
    """Intègre le Pricing Engine dans le flux de chat."""

    def get_estimate(self, service: Service, extra_info: Optional[dict] = None) -> dict:
        """Retourne une estimation de prix pour un service."""
        from api.pricing_engine import HadaraPricingEngine

        engine = HadaraPricingEngine()
        brief = self._create_minimal_brief(service, extra_info)
        result = engine.calculate(brief)

        return {
            "service_key": service.key,
            "service_name": service.name,
            "price_min": result.get("prix_min_fcfa", service.price_min),
            "price_max": result.get("prix_max_fcfa", service.price_max),
            "delay_min": result.get("delai_min_jours", service.delay_min_days),
            "delay_max": result.get("delai_max_jours", service.delay_max_days),
            "complexity": result.get("score_complexite", 5),
        }

    def _create_minimal_brief(self, service: Service, extra_info: Optional[dict] = None):
        """Crée un objet Brief minimal pour le Pricing Engine."""
        class MinimalBrief:
            def __init__(self, svc, info):
                self.client_name = "Chat Public"
                self.project_type = svc.key
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

                if info:
                    if info.get("urgency"):
                        self.critical_deadline = info["urgency"]
                    if info.get("context") == "event":
                        self.context_description = "Projet événementiel"

        return MinimalBrief(service, extra_info or {})


# ─────────────────────────────────────────────────────────────────────────────
# Response Generator
# ─────────────────────────────────────────────────────────────────────────────

class ResponseGenerator:
    """Génère les réponses du chatbot en fonction de l'intention détectée."""

    def generate_greeting(self) -> str:
        return (
            f"Bonjour ! 👋 Je suis {PROFILE.identity.assistant_name}, "
            f"{PROFILE.identity.assistant_role}.\n\n"
            "Je peux vous renseigner sur nos services et vous donner "
            "une estimation pour votre projet.\n\n"
            "Que recherchez-vous ?"
        )

    def generate_service_request(
        self, service: Service, extra_info: Optional[dict] = None
    ) -> str:
        """Répond à une demande de service spécifique."""
        # Si on a assez d'infos, donner une estimation
        if extra_info and (extra_info.get("dimension") or extra_info.get("quantity")):
            from hadara_ai.services.public_chat import pricing_integration
            estimate = pricing_integration.get_estimate(service, extra_info)
            return self._format_pricing_response(estimate, extra_info)

        # Sinon, poser des questions ciblées
        return self._ask_clarification_questions(service)

    def _ask_clarification_questions(self, service: Service) -> str:
        """Pose des questions ciblées pour un service."""
        return (
            f"**{service.name}** — excellent choix !\n\n"
            f"Fourchette de base : **{service.price_min:,} à {service.price_max:,} FCFA**\n"
            f"Délai estimé : {service.delay_min_days} à {service.delay_max_days} jours\n\n"
            "Pour affiner l'estimation, j'aurais besoin de quelques précisions :\n\n"
            "1. **Dimensions** : quelle taille souhaitez-vous ?\n"
            "2. **Quantité** : combien d'exemplaires ?\n"
            "3. **Délai** : quand avez-vous besoin du livrable ?\n\n"
            "Ou vous pouvez "
            "[remplir notre brief](/brief) pour un devis complet."
        )

    def generate_pricing(
        self, service: Optional[Service], extra_info: Optional[dict] = None
    ) -> str:
        """Donne une estimation de prix."""
        if service:
            from hadara_ai.services.public_chat import pricing_integration
            estimate = pricing_integration.get_estimate(service, extra_info)
            return self._format_pricing_response(estimate, extra_info)
        else:
            return self._ask_for_service_type()

    def _format_pricing_response(
        self, estimate: dict, extra_info: Optional[dict] = None
    ) -> str:
        """Formate une réponse avec estimation de prix."""
        price_min = estimate["price_min"]
        price_max = estimate["price_max"]
        delay_min = estimate["delay_min"]
        delay_max = estimate["delay_max"]
        service_name = estimate["service_name"]

        response = (
            f"**Estimation pour {service_name}**\n\n"
            f"💰 **Prix estimé : {price_min:,} à {price_max:,} FCFA**\n"
            f"📅 **Délai : {delay_min} à {delay_max} jours ouvrables**\n\n"
        )

        if extra_info:
            if extra_info.get("urgency") == "tres_urgent":
                response += (
                    "⚠️ Pour un projet urgent (< 48h), des majorations "
                    "peuvent s'appliquer.\n\n"
                )
            if extra_info.get("dimension"):
                response += f"📏 Format détecté : {extra_info['dimension']}\n\n"

        response += (
            "Ces tarifs sont indicatifs et peuvent varier selon les "
            "spécifications exactes (finition, quantité, complexité).\n\n"
            "Pour un devis définitif, "
            "[remplissez notre brief](/brief) ou donnez-moi plus de détails."
        )

        return response

    def _ask_for_service_type(self) -> str:
        """Demande de préciser le type de service."""
        return (
            "Je peux vous donner une estimation ! "
            "Quel type de projet recherchez-vous ?\n\n"
            "🎨 **Identité visuelle** : logo, charte, branding\n"
            "📢 **Supports** : affiche, bâche, flyer\n"
            "💻 **Digital** : réseaux sociaux, site web\n\n"
            "Ou décrivez-moi votre projet et je vous oriente."
        )

    def generate_services_list(self, service: Optional[Service] = None) -> str:
        """Retourne la liste des services ou un service spécifique."""
        if service:
            return (
                f"**{service.name}**\n\n"
                f"{service.description}\n\n"
                f"💰 Fourchette : {service.price_min:,} - {service.price_max:,} FCFA\n"
                f"📅 Délai : {service.delay_min_days} à {service.delay_max_days} jours\n\n"
                "Souhaitez-vous une estimation ?"
            )

        categories = PROFILE.services.get_categories()
        response = "**Nos services**\n\n"

        for category, services in categories.items():
            response += f"**{category}**\n"
            for s in services:
                response += f"• {s.name} ({s.price_min:,} - {s.price_max:,} FCFA)\n"
            response += "\n"

        response += "Pour un devis, demandez-moi une estimation !"
        return response

    def generate_about_studio(self) -> str:
        """Informations sur le Studio Hadara."""
        return (
            f"**{PROFILE.identity.brand_name}**\n\n"
            f"📍 {PROFILE.location.city}, {PROFILE.location.country}\n"
            f"🎨 {PROFILE.identity.public_title} — {PROFILE.identity.owner_name}\n\n"
            "Spécialisés dans :\n"
            "• Identité visuelle et branding\n"
            "• Supports publicitaires grand format\n"
            "• Solutions digitales et web\n\n"
            f"« {PROFILE.identity.tagline} »"
        )

    def generate_location(self) -> str:
        """Localisation du studio."""
        return (
            f"📍 **{PROFILE.location.city}, {PROFILE.location.country}**\n\n"
            "Nous travaillons avec des clients de toute l'Afrique de l'Ouest.\n"
            "Les projets se font principalement à distance, "
            "avec possibilité de rendez-vous à Dakar."
        )

    def generate_contact(self) -> str:
        """Coordonnées du studio."""
        return (
            "**Contactez-nous**\n\n"
            f"📱 **WhatsApp** : [{PROFILE.contacts.phone_primary}]"
            f"(https://wa.me/{PROFILE.contacts.whatsapp_primary})\n"
            f"📱 **WhatsApp** : [{PROFILE.contacts.phone_secondary}]"
            f"(https://wa.me/{PROFILE.contacts.whatsapp_secondary})\n"
            f"✉️ **Email** : {PROFILE.contacts.email}\n"
            f"🎨 **Behance** : {PROFILE.contacts.behance}\n\n"
            "Nous sommes disponibles du lundi au samedi."
        )

    def generate_human_contact(self) -> str:
        """Contact humain."""
        return self.generate_contact()

    def generate_brief(self) -> str:
        """Encourage le formulaire de brief."""
        return (
            "Pour soumettre un brief, rendez-vous sur "
            "[notre formulaire](/brief). C'est gratuit et sans engagement !\n\n"
            "Je peux aussi vous donner une estimation avant si vous le souhaitez."
        )

    def generate_faq(self, question: Optional[str] = None) -> str:
        """Répond aux questions FAQ."""
        if question:
            for q, a in PROFILE.knowledge.faq:
                if question.lower() in q.lower() or q.lower() in question.lower():
                    return a

        return (
            "Je peux vous renseigner sur :\n\n"
            "• Nos **services** (logo, affiche, bâche, site web...)\n"
            "• Nos **tarifs** (estimations par type de projet)\n"
            "• Notre **studio** (localisation, équipe)\n"
            "• Comment **soumettre un brief**\n\n"
            "Ou vous pouvez "
            f"[nous contacter directement](https://wa.me/{PROFILE.contacts.whatsapp_primary})."
        )

    def generate_fallback(self) -> str:
        """Réponse par défaut."""
        return self.generate_faq()


# ─────────────────────────────────────────────────────────────────────────────
# Public Chat Service (point d'entrée unique)
# ─────────────────────────────────────────────────────────────────────────────

class PublicChatService:
    """Service de chat public intelligent avec détection d'intention."""

    def __init__(self):
        self.detector = IntentDetector()
        self.responder = ResponseGenerator()

    def process_message(self, user_message: str) -> str:
        """Traite un message utilisateur et retourne la réponse."""
        detected = self.detector.detect(user_message)

        logger.info(
            "Chat intent: %s (service=%s, confidence=%.2f)",
            detected.intent.value,
            detected.service.key if detected.service else None,
            detected.confidence,
        )

        if detected.intent == Intent.GREETING:
            return self.responder.generate_greeting()

        elif detected.intent == Intent.SERVICE_REQUEST:
            return self.responder.generate_service_request(
                detected.service, detected.extracted_info
            )

        elif detected.intent == Intent.PRICING:
            return self.responder.generate_pricing(
                detected.service, detected.extracted_info
            )

        elif detected.intent == Intent.SERVICES:
            return self.responder.generate_services_list(detected.service)

        elif detected.intent == Intent.ABOUT_STUDIO:
            return self.responder.generate_about_studio()

        elif detected.intent == Intent.LOCATION:
            return self.responder.generate_location()

        elif detected.intent == Intent.CONTACT:
            return self.responder.generate_contact()

        elif detected.intent == Intent.BRIEF:
            return self.responder.generate_brief()

        elif detected.intent == Intent.HUMAN_CONTACT:
            return self.responder.generate_human_contact()

        elif detected.intent == Intent.FAQ:
            return self.responder.generate_faq(user_message)

        else:
            return self.responder.generate_fallback()


# ─────────────────────────────────────────────────────────────────────────────
# Instances
# ─────────────────────────────────────────────────────────────────────────────

pricing_integration = PricingIntegration()
public_chat = PublicChatService()
