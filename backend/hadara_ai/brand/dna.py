"""Hadara Design DNA — Identité visuelle et principes directeurs.

Ce module définit l'ADN créatif d'Hadara : valeurs, couleurs, typographies,
styles, interdits et références culturelles. Utilisé par le Creative Assistant
pour produire des directions artistiques reconnaissables.
"""

from __future__ import annotations

from typing import Any


HADARA_DNA: dict[str, Any] = {
    "brand": "Hadara",
    "tagline": "Graphisme & Design — Excellence créative ouest-africaine",

    "valeurs": [
        "Sobriété élégante",
        "Profondeur culturelle",
        "Modernité enracinée",
        "Prestige discret",
        "Authenticité",
    ],

    "positionnement": "Studio de graphisme haut de gamme spécialisé dans l'identité visuelle pour le marché ouest-africain, avec une sensibilité culturelle forte.",

    "palette_principale": [
        {
            "nom": "Bleu Hadara",
            "hex": "#335A79",
            "usage": "Couleur principale — confiance, profondeur, sérénité",
            "règle": "Dominante dans 60% des compositions",
        },
        {
            "nom": "Or Hadara",
            "hex": "#816C07",
            "usage": "Couleur d'accent — prestige, excellence, valeur",
            "règle": "Utilisé avec parcimonie (10-15% max), jamais en surcharge",
        },
        {
            "nom": "Blanc Hadara",
            "hex": "#F8F8F8",
            "usage": "Fond et respiration — clarté, espace, modernité",
            "règle": "Fond privilégié, laisser respirer",
        },
    ],

    "palette_secondaire": [
        {"nom": "Gris Hadara", "hex": "#4A4A4A", "usage": "Texte et détails"},
        {"nom": "Beige Sable", "hex": "#F5E6D3", "usage": "Fonds chauds, texture"},
        {"nom": "Vert Forêt", "hex": "#2D5A3D", "usage": "Accent nature, croissance"},
    ],

    "typographies_principales": [
        {
            "nom": "Playfair Display",
            "usage": "Titres et accroches",
            "style": "Élégant, serif, caractère",
            "règle": "Pour les titres uniquement, jamais en corps de texte",
        },
        {
            "nom": "Inter",
            "usage": "Corps de texte et interfaces",
            "style": "Moderne, neutre, lisible",
            "règle": "Police de travail, lisibilité maximale",
        },
    ],

    "typographies_accent": [
        {
            "nom": "Cormorant Garamond",
            "usage": "Citations et sous-titres élégants",
            "style": "Raffiné, classique",
        },
        {
            "nom": "Montserrat",
            "usage": "Étiquettes et navigations",
            "style": "Géométrique, moderne",
        },
    ],

    "styles_recommandes": [
        {
            "nom": "Minimalisme culturel",
            "description": "Espace blanc, détails culturels subtils, typographie soignée",
            "适用": "Institutions, professions libérales, événements officiels",
        },
        {
            "nom": "Élégance contemporaine",
            "description": "Lignes épurées, couleurs profondes, touches dorées mesurées",
            "适用": "Lancements de produits, mode, luxe",
        },
        {
            "nom": "Modernité enracinée",
            "description": "Formes modernes inspirées de motifs traditionnels ouest-africains",
            "适用": "Culture, artisanat, tourisme, restauration",
        },
    ],

    "principes_composition": [
        "Laisser respirer — l'espace négatif est un allié",
        "Un seul point focal — ne pas disperser l'attention",
        "Typographie hiérarchisée — titre > sous-titre > corps",
        "Couleurs avec intention — chaque couleur a un rôle",
        "Subtilité culturelle — évoquer sans caricaturer",
        "Prestige discret — jamais de surcharge décorative",
    ],

    "references_culturelles": [
        {
            "type": "inspirer",
            "elements": [
                "Architecture sénégalaise contemporaine (Alain Siby, Faada Fadi)",
                "Textiles traditionnels (tissu wax, tissu riche)",
                "Calligraphie arabe maîtrisée et épurée",
                "Formes géométriques inspirées des motifs traditionnels",
                "Nature tropicale (baobab, acacia, mangrove)",
            ],
        },
        {
            "type": "éviter",
            "elements": [
                "Style mosquée générique — trop cliché",
                "Surcharge dorée — vulgaire et peu professionnel",
                "Motifs islamiques copiés-collés — sans originalité",
                "Esthétique orientale copiée — pas d'identité propre",
                "Templates luxe occidentaux — pas adaptés au contexte",
                "Clip art et images stock visibles — manque d'authenticité",
            ],
        },
    ],

    "secteurs_expertise": [
        {
            "secteur": "Institutions publiques",
            "approche": "Sérieux, sobre, prestige institutionnel",
        },
        {
            "secteur": "Entreprises privées",
            "approche": "Professionnel, moderne, efficient",
        },
        {
            "secteur": "Événementiel",
            "approche": "Dynamique, élégant, mémorable",
        },
        {
            "secteur": "Culture & Art",
            "approche": "Créatif, authentique, inspirant",
        },
        {
            "secteur": "Restauration & Gastronomie",
            "approche": "Chaleureux, raffiné, appétissant",
        },
        {
            "secteur": "Mode & Beauté",
            "approche": "Élégant, tendance, sophistiqué",
        },
    ],

    "regles_absolues": [
        "NE JAMAIS utiliser de clip art ou d'images stock génériques",
        "NE JAMAIS surcharger avec de l'or — moins est plus",
        "NE JAMAIS copier des templates occidentaux sans adaptation",
        "NE JAMAIS caricaturer les motifs culturels",
        "TOUJOURS laisser de l'espace — la sobriété est la signature Hadara",
        "TOUJOURS justifier chaque choix colorimétrique",
        "TOUJOURS penser lisibilité avant esthétique",
    ],
}


def get_brand_context_for_prompt() -> str:
    """Génère le contexte Hadara DNA pour injection dans un prompt IA."""
    lines = []
    lines.append("=== HADARA DESIGN DNA — Identité du studio ===")
    lines.append(f"Positionnement: {HADARA_DNA['positionnement']}")
    lines.append("")

    lines.append("Palette principale (obligatoire):")
    for c in HADARA_DNA["palette_principale"]:
        lines.append(f"  - {c['nom']} ({c['hex']}) — {c['usage']}")
    lines.append("")

    lines.append("Typographies:")
    for t in HADARA_DNA["typographies_principales"]:
        lines.append(f"  - {t['nom']} — {t['usage']}")
    lines.append("")

    lines.append("Styles recommandés:")
    for s in HADARA_DNA["styles_recommandes"]:
        lines.append(f"  - {s['nom']}: {s['description']}")
    lines.append("")

    lines.append("Principes de composition:")
    for p in HADARA_DNA["principes_composition"]:
        lines.append(f"  - {p}")
    lines.append("")

    lines.append("À éviter absolument:")
    for ref in HADARA_DNA["references_culturelles"]:
        if ref["type"] == "éviter":
            for e in ref["elements"]:
                lines.append(f"  ❌ {e}")
    lines.append("")

    lines.append("Règles absolues:")
    for r in HADARA_DNA["regles_absolues"]:
        lines.append(f"  - {r}")

    return "\n".join(lines)
