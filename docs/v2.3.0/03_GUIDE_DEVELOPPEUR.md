# HADARA SUITE v2.3.0 — Guide Développeur & Architecture Technique 💻

Ce guide détaille la structure du codebase, les modèles de données Django, les composants React 19 et les migrations de base de données.

---

## 🏗️ 1. Architecture du Codebase

```text
Hadara Brief - Graphisme & Design/
├── backend/                             ← Django 5.x Backend
│   ├── api/                             ← Application Métier
│   │   ├── models.py                    ← Brief, PortfolioItem, StoreProduct, Template, ToolUsageLog
│   │   ├── admin.py                     ← Formulaires & Fieldsets Hadara Manager
│   │   ├── views.py                     ← REST API endpoints
│   │   └── migrations/                  ← Migrations DB (0001 à 0012)
│   ├── static/                          ← CSS & JS Hadara Manager
│   │   ├── css/hadara_admin.css         ← Design Tokens & Styles Admin
│   │   └── js/hadara_admin.js           ← Uploader WebP, Color Picker, Chips
│   └── hadara_project/                  ← Réglages & JAZZMIN_SETTINGS
├── src/                                 ← React 19 + TypeScript + Vite + Tailwind
│   ├── components/                      ← Composants Frontend & Portail Client
│   │   ├── client/ClientPortalView.tsx  ← Portail Client & Lightbox HD
│   │   ├── BriefForm.tsx                ← Formulaire de Brief Public
│   │   └── PortfolioShowcase.tsx        ← Portfolio Public
│   └── types.ts                         ← Modèles TypeScript (DeliverableVersion, etc.)
└── docs/v2.3.0/                         ← Documentation Complète v2.3.0
```

---

## 🗄️ 2. Modèles de Données Django (`backend/api/models.py`)

### 1. `Brief` (Modèle de Production)
- `id` : `CharField(primary_key=True, blank=True)` ➔ Auto-généré `HAD-XXXX` dans `save()`.
- `client_name`, `whatsapp`, `email`, `organization`, `city_country`.
- `project_type`, `context_description`, `primary_objective`, `main_title`, `full_text_content`.
- `style_preferences`, `preferred_colors`, `avoid_colors` (`blank=True, null=True`).
- `quoted_price_fcfa`, `status` (`nouveau`, `devis_envoye`, `acompte_recu`, `en_creation`, `validation`, `termine`).

### 2. `PortfolioItem` (Portfolio Créatif)
- `id` : `CharField(primary_key=True, blank=True)` ➔ Auto-généré `PRT-XXXX`.
- `title`, `category`, `image_url` (Obligatoires).
- `description`, `badge`, `price_estimate`, `accent_hex` (`#816C07` par défaut), `features` (`blank=True, null=True`).

### 3. `StoreProduct` (Boutique Hadara Store)
- `id` : `CharField(primary_key=True, blank=True)` ➔ Auto-généré `PRD-XXXX`.
- `name`, `category`, `status` (`STATUS_CHOICES`) (Obligatoires).
- `brand`, `description`, `image`, `price`, `visible`, `featured` (`blank=True, null=True`).

### 4. `Template` (Modèles de Brief)
- `id` : `CharField(primary_key=True, blank=True)` ➔ Auto-généré `TPL-XXXX`.
- `title`, `category`, `project_type`, `technical_format` (Obligatoires).
- Tous les autres presets rendus optionnels.

---

## 🛠️ 3. Historique des Migrations Django (`backend/api/migrations/`)

- `0009_seed_portfolio_and_templates.py` : Population initiale de Neon PostgreSQL avec garde-fou `count() == 0`.
- `0010_make_template_fields_optional.py` : Assouplissement du modèle `Template` (4 champs obligatoires, ID auto).
- `0011_make_portfolio_fields_optional.py` : Assouplissement du modèle `PortfolioItem` (3 champs obligatoires, ID auto).
- `0012_make_storeproduct_fields_optional.py` : Assouplissement du modèle `StoreProduct` (3 champs obligatoires, ID auto).
