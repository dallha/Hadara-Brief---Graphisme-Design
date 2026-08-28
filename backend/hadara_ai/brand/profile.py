"""
Hadara Business Profile — Source de vérité centralisée.

Toutes les informations publiques du Studio Hadara sont définies ici.
Si tu changes ton numéro, tu ne modifies qu'un seul fichier.

Usage:
    from hadara_ai.brand.profile import PROFILE
    print(PROFILE.contacts.phone_primary)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass(frozen=True)
class BrandIdentity:
    """Identité de marque."""
    brand_name: str = "Studio Hadara"
    tagline: str = "Allier tradition et modernité"
    owner_name: str = "El Hadji Abdoulaye Niass"
    public_title: str = "Graphiste de la Hadara"
    assistant_name: str = "Mme Niass Madina"
    assistant_role: str = "Assistante IA du Studio Hadara"


@dataclass(frozen=True)
class Contacts:
    """Coordonnées officielles."""
    phone_primary: str = "+221 77 623 27 41"
    phone_secondary: str = "+221 76 375 63 63"
    whatsapp_primary: str = "221776232741"
    whatsapp_secondary: str = "221763756363"
    email: str = "mrniass@gmail.com"
    website: Optional[str] = None
    behance: str = "https://www.behance.net/mrniasse"


@dataclass(frozen=True)
class Location:
    """Localisation."""
    city: str = "Dakar"
    country: str = "Sénégal"
    country_code: str = "SN"
    timezone: str = "Africa/Dakar"


@dataclass(frozen=True)
class Service:
    """Un service proposé par le Studio."""
    key: str
    name: str
    description: str
    category: str
    price_min: int
    price_max: int
    delay_min_days: int
    delay_max_days: int
    keywords: tuple[str, ...] = ()


SERVICES = (
    Service(
        key="logo",
        name="Logo professionnel",
        description="Création d'un logo unique et mémorable pour votre marque.",
        category="Identité visuelle",
        price_min=35_000,
        price_max=90_000,
        delay_min_days=3,
        delay_max_days=7,
        keywords=("logo", "logotype", "sigle", "emblème"),
    ),
    Service(
        key="identite_marque",
        name="Identité de marque complète",
        description="Charte graphique, déclinaisons, guidelines complètes.",
        category="Identité visuelle",
        price_min=90_000,
        price_max=250_000,
        delay_min_days=7,
        delay_max_days=15,
        keywords=("identité", "identite", "marque", "branding", "charte"),
    ),
    Service(
        key="charte_graphique",
        name="Charte graphique",
        description="Document définissant les règles d'utilisation de votre identité visuelle.",
        category="Identité visuelle",
        price_min=60_000,
        price_max=150_000,
        delay_min_days=5,
        delay_max_days=12,
        keywords=("charte", "charte graphique", "guidelines"),
    ),
    Service(
        key="affiche",
        name="Affiche publicitaire",
        description="Affiche pour événement, promotion ou communication.",
        category="Supports publicitaires",
        price_min=18_000,
        price_max=55_000,
        delay_min_days=2,
        delay_max_days=5,
        keywords=("affiche", "poster", "poster publicitaire"),
    ),
    Service(
        key="bache",
        name="Bâche grand format",
        description="Bâche pour enseigne, événement ou publicité extérieure.",
        category="Supports publicitaires",
        price_min=15_000,
        price_max=45_000,
        delay_min_days=2,
        delay_max_days=4,
        keywords=("bâche", "bache", "enseigne", "banderole", "grand format"),
    ),
    Service(
        key="flyer",
        name="Flyer / Dépliant",
        description="Support de communication imprimé pour événement ou promotion.",
        category="Supports publicitaires",
        price_min=10_000,
        price_max=28_000,
        delay_min_days=1,
        delay_max_days=4,
        keywords=("flyer", "dépliant", "depliant", "tract", "volant"),
    ),
    Service(
        key="brochure",
        name="Brochure",
        description="Brochure professionnelle pour présenter vos services.",
        category="Supports publicitaires",
        price_min=30_000,
        price_max=90_000,
        delay_min_days=4,
        delay_max_days=10,
        keywords=("brochure", "book", "catalogue"),
    ),
    Service(
        key="carte_visite",
        name="Carte de visite",
        description="Carte de visite professionnelle et mémorable.",
        category="Documents professionnels",
        price_min=15_000,
        price_max=38_000,
        delay_min_days=1,
        delay_max_days=4,
        keywords=("carte", "carte de visite", "business card"),
    ),
    Service(
        key="reseaux_sociaux",
        name="Réseaux sociaux",
        description="Visuels pour vos publications Instagram, Facebook, etc.",
        category="Digital",
        price_min=20_000,
        price_max=70_000,
        delay_min_days=2,
        delay_max_days=6,
        keywords=("réseau", "reseau", "instagram", "facebook", "social", "post", "story"),
    ),
    Service(
        key="banniere_web",
        name="Bannière web",
        description="Bannière pour site web, newsletter ou publicité en ligne.",
        category="Digital",
        price_min=15_000,
        price_max=40_000,
        delay_min_days=1,
        delay_max_days=4,
        keywords=("bannière", "banniere", "banner", "header"),
    ),
    Service(
        key="site_web",
        name="Site web",
        description="Création de site web professionnel responsive.",
        category="Digital avancé",
        price_min=150_000,
        price_max=500_000,
        delay_min_days=14,
        delay_max_days=45,
        keywords=("site", "web", "site web", "website", "landing page"),
    ),
    Service(
        key="mockup_ui",
        name="Mockup UI",
        description="Maquette d'interface utilisateur pour application ou site.",
        category="Digital avancé",
        price_min=60_000,
        price_max=180_000,
        delay_min_days=5,
        delay_max_days=18,
        keywords=("mockup", "ui", "interface", "maquette", "wireframe"),
    ),
)


@dataclass(frozen=True)
class ServiceCatalog:
    """Catalogue des services."""
    services: tuple[Service, ...] = SERVICES

    def find_by_keyword(self, text: str) -> Optional[Service]:
        """Trouve un service par mot-clé dans le texte."""
        text_lower = text.lower()
        for service in self.services:
            for keyword in service.keywords:
                if keyword in text_lower:
                    return service
        return None

    def find_by_key(self, key: str) -> Optional[Service]:
        """Trouve un service par sa clé."""
        for service in self.services:
            if service.key == key:
                return service
        return None

    def get_categories(self) -> dict[str, list[Service]]:
        """Retourne les services groupés par catégorie."""
        categories: dict[str, list[Service]] = {}
        for service in self.services:
            if service.category not in categories:
                categories[service.category] = []
            categories[service.category].append(service)
        return categories


@dataclass(frozen=True)
class CommunicationStyle:
    """Style de communication de l'assistant."""
    language: str = "fr"
    tone: str = "chaleureux et professionnel"
    max_length: int = 4
    uses_emoji: bool = True
    never_invents: tuple[str, ...] = (
        "prix",
        "délais",
        "services",
        "coordonnées",
        "promotions",
    )


@dataclass(frozen=True)
class KnowledgeBase:
    """Base de connaissances pour le chatbot."""
    faq: tuple[tuple[str, str], ...] = (
        (
            "Quels sont vos services ?",
            "Nous proposons : identité visuelle (logo, charte), "
            "supports publicitaires (affiche, bâche, flyer), "
            "et solutions digitales (réseaux sociaux, site web).",
        ),
        (
            "Où êtes-vous situés ?",
            "Nous sommes basés à Dakar, Sénégal.",
        ),
        (
            "Quels sont vos délais ?",
            "Les délais varient selon le projet : 1-7 jours pour les petits projets, "
            "jusqu'à 45 jours pour un site web complet.",
        ),
        (
            "Comment obtenir un devis ?",
            "Remplissez notre formulaire de brief en ligne. C'est gratuit et sans engagement.",
        ),
        (
            "Travaillez-vous à distance ?",
            "Oui, nous travaillons avec des clients du Sénégal et de toute l'Afrique de l'Ouest.",
        ),
    )


@dataclass(frozen=True)
class BusinessProfile:
    """Profil complet du Studio Hadara."""
    identity: BrandIdentity = field(default_factory=BrandIdentity)
    contacts: Contacts = field(default_factory=Contacts)
    location: Location = field(default_factory=Location)
    services: ServiceCatalog = field(default_factory=ServiceCatalog)
    communication: CommunicationStyle = field(default_factory=CommunicationStyle)
    knowledge: KnowledgeBase = field(default_factory=KnowledgeBase)


# ─────────────────────────────────────────────────────────────────────────────
# INSTANCE SINGLETON
# ─────────────────────────────────────────────────────────────────────────────

PROFILE = BusinessProfile()
