# HADARA SUITE v2.3.0 — Documentation Officielle & Index Sommaire 📚

> **Hadara Studio & Hadara Manager v2.3.0** — Plateforme de Gestion de Studio Créatif, Automatisation IA, Store et Portail Client.

---

## 🏛️ Structure du Dossier /docs/v2.3.0/

```text
/docs/v2.3.0/
├── 00_INDEX.md                           ← Sommaire Général & Architecture
├── 01_MANUEL_UTILISATEUR.md              ← Guide d'Exploitation & Cockpit Manager
├── 02_HADARA_DESIGN_SYSTEM.md            ← Design Tokens, Typographies & UI Grammar
├── 03_GUIDE_DEVELOPPEUR.md               ← Architecture Django, React & Modèles DB
└── 04_GUIDE_DEPLOIEMENT_ET_EXPLOITATION.md← Render, Neon PostgreSQL & Feature Freeze
```

---

## 🚀 Vue d'Ensemble de l'Architecture v2.3.0

```text
                       HADARA SUITE v2.3.0
                                │
            ┌───────────────────┴───────────────────┐
            │                                       │
      SITE PUBLIC                              HADARA MANAGER
 (https://hadara-design.com/)              (/api/django-admin/)
            │                                       │
     Vitrine Client                           Cockpit Studio
   (Conversion & Briefs)                  (Productivité Studio)
            │                                       │
            └───────────────────┬───────────────────┘
                                │
                      HADARA DESIGN SYSTEM
                  (#070B18, #D0A21C, #335A79)
                                │
                     NEON POSTGRESQL DATABASE
                  (Source de Vérité Structurée)
```

---

## 🔑 Nouveautés de la Version v2.3.0

1. **Standard Hadara Manager (Formulaires Ultra-Épurés)** :
   - 3 à 4 champs obligatoires maximum par formulaire (`Brief`, `PortfolioItem`, `StoreProduct`, `Template`).
   - Masquage automatique des options secondaires dans des sections repliables `collapse`.
   - Disparition de la syntaxe JSON brute (`[]` ou `{}`) au profit de widgets Hadara Chips interactifs.

2. **Hadara Mobile Image Uploader & Compression WebP** :
   - Sélection directe depuis Photos / Caméra / Fichiers sur smartphone.
   - Compression WebP client-side (< 500 Ko) avec aperçu immédiat `✓ Image optimisée`.
   - Élimination des icônes cassées `?` grâce au composant de secours `🖼️ Sans image`.

3. **Génération Automatique des Identifiants & Dates** :
   - `HAD-XXXX` (Briefs), `PRD-XXXX` (Store), `PRT-XXXX` (Portfolio), `TPL-XXXX` (Modèles).
   - Zero saisie d'ID manuelle par l'administrateur.

4. **Pipeline Dual-File & Portail Client (V1, V2, V3)** :
   - Separation claire entre `previewUrl` (affichage rapide WebP < 500 Ko + Lightbox ZoomIn) et `originalFileUrl` (livrable HD source PDF/AI/SVG).
   - Conservation intégrale et non destructive de l'historique des révisions client.
