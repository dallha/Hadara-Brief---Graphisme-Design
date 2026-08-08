# Hadara Suite — Documentation Officielle
## Volume 2 : Architecture & Guide Développeur

| Attribut | Valeur |
| :--- | :--- |
| **Version** | 2.1.0 |
| **Date** | Août 2026 |

> [!WARNING]
> **Clause de Stricte Réalité** : Cette documentation est générée à partir de l'état actuel du code source.

---

## 1. Stack Technologique

### 1.1 Frontend
*   **Framework** : React 19 avec Vite 6.
*   **Routage** : `react-router-dom` (Routage côté client, SPA).
*   **Stylisation** : Tailwind CSS v4 — approche **Mobile-First**.
*   **Icônes** : `lucide-react`.
*   **Langage** : TypeScript.
*   **Animations** : `framer-motion`.
*   **PWA** : `vite-plugin-pwa` avec génération automatique du Service Worker.

### 1.2 Backend
*   **Framework** : Django 5.
*   **API** : Django Rest Framework (DRF).
*   **Base de Données** : SQLite (dev local) / PostgreSQL (production Render).
*   **Intégration IA Chat** : `groq` SDK — Modèle `llama-3.1-8b-instant`.
*   **Intégration IA Brief** : `google-genai` SDK — Modèle `gemini-2.5-flash`.
*   **Administration** : `django-jazzmin`.
*   **Génération PDF** : `reportlab`.

### 1.3 Hébergement & CI/CD
*   **Frontend** : Render Static Site (build Vite, servi en tant que fichiers statiques).
*   **Backend** : Render Web Service (Gunicorn + Django).
*   **Base de données** : Render PostgreSQL.
*   **CI/CD** : Déploiement automatique à chaque `git push` sur la branche `main`.

---

## 2. Structure du Code

### 2.1 Le Frontend (`src/`)
```
src/
├── App.tsx                  — Routage global, état admin, PWA offline
├── types.ts                 — Types TypeScript (BriefData, StoreProduct, etc.)
├── index.css                — Design system Tailwind + @media print
├── components/
│   ├── LandingHero.tsx      — Page d'accueil (Bento Grid, Mobile-First)
│   ├── PortfolioShowcase.tsx — Portfolio filtrable
│   ├── BriefForm.tsx        — Formulaire multi-étapes (5 steps, mobile scroll)
│   ├── ResumeCV.tsx         — CV interactif + mode ATS imprimable
│   ├── RoadmapView.tsx      — Feuille de route produit
│   ├── HadaraStore.tsx      — Boutique e-commerce
│   ├── AIChatWidget.tsx     — Widget Mme Niass Madina (chat IA)
│   ├── AdminDashboard.tsx   — Dashboard admin (Kanban swipeable)
│   ├── ToolsNav.tsx         — Navigation entre les outils (scrollable mobile)
│   ├── InvoiceTool.tsx      — Générateur de factures (print via new window)
│   ├── BgRemovalTool.tsx    — Détourage IA (imgly)
│   ├── QRCodeTool.tsx       — Générateur QR Code
│   ├── OCRTool.tsx          — Extracteur de texte (Tesseract.js, ara+fra)
│   └── client/
│       └── ClientPortalView.tsx — Portail client (suivi, maquettes HD)
```

### 2.2 Le Backend (`backend/`)
```
backend/
├── hadara_project/
│   ├── settings.py          — Configuration Django
│   └── urls.py              — Routage principal
└── api/
    ├── models.py            — Brief, PortfolioItem, StoreProduct, Template
    ├── views.py             — ViewSets DRF + endpoint /api/chat/
    ├── serializers.py       — Sérialisation JSON
    └── pdf_utils.py         — Génération PDF (reportlab, en mémoire)
```

---

## 3. Schémas de Base de Données

1.  **`Brief`** — ID format `HAD-XXXX`
    *   Champs clients : nom, email, WhatsApp.
    *   Spécifications : contexte, objectif, cible, textes, formats.
    *   Champs admin : `designer_notes`, `quoted_price_fcfa`, `ai_analysis`.

2.  **`PortfolioItem`** — ID format `PRT-XXXX`
    *   Titre, catégorie, image URL, prix estimatif.

3.  **`StoreProduct`** — ID format `PRD-XXXX`
    *   Titre, marque, catégorie, image, prix, statut stock.

4.  **`Template`** — Modèles de briefs prédéfinis.

---

## 4. API REST — Points de Terminaison

Tous les endpoints sont sous le préfixe `/api/`.

| Endpoint | Méthode | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login/` | POST | Non | Authentification admin |
| `/api/briefs/` | GET | Non | Liste tous les briefs |
| `/api/briefs/` | POST | Non | Soumettre un nouveau brief |
| `/api/briefs/<id>/` | PATCH | Oui | Modifier un brief |
| `/api/briefs/<id>/analyze/` | POST | Oui | Analyse IA Gemini |
| `/api/briefs/<id>/download_pdf/` | GET | Non | Télécharger le devis PDF |
| `/api/portfolio/` | GET | Non | Liste le portfolio |
| `/api/store/products/` | GET | Non | Liste les produits boutique |
| **`/api/chat/`** | **POST** | **Non** | **Chat IA — Mme Niass Madina** |

### 4.1 Endpoint Chat IA (`/api/chat/`)
```json
// Requête
POST /api/chat/
{ "message": "Quels sont vos services ?" }

// Réponse
{ "reply": "Bonjour ! Je suis Mme Niass Madina..." }
```
*   Appelle l'API Groq avec le modèle `llama-3.1-8b-instant`.
*   Inclut un **prompt système** définissant le rôle, le nom et les compétences de Mme Niass Madina.
*   Aucun historique de conversation n'est conservé côté serveur (stateless).

---

## 5. Mécanismes Spécifiques

### 5.1 Sécurité Anti-Brute-Force Admin
1.  **Frontend** : Compte les échecs via `localStorage`. Après 5 erreurs → blocage UI 15 min.
2.  **Backend** : Décorateur `ratelimit` bloquant l'IP sur `/api/auth/login/`.

### 5.2 Résilience Hors-Ligne (Mode Lecture Seule)
*   Le frontend met en cache les produits boutique dans `localStorage`.
*   Si le réseau est absent, le store charge le cache local.
*   Les mutations (écriture) échouent sans réseau (pas de queue locale).

### 5.3 Génération PDF Devis (Backend — `pdf_utils.py`)
*   Généré en mémoire (pas de fichier temporaire sur le disque).
*   Utilise `reportlab.platypus` (SimpleDocTemplate, Paragraph, Table).
*   Retourné avec `Content-Disposition: attachment`.

### 5.4 Générateur de Factures (Frontend — `InvoiceTool.tsx`)
*   Entièrement côté client (aucune donnée envoyée au serveur).
*   **Méthode d'impression** : `window.open()` crée une nouvelle fenêtre contenant le HTML complet de la facture avec son propre CSS (`@page { size: A4; margin: 15mm; }`), puis appelle `window.print()` automatiquement.
*   Cette approche garantit : fond blanc, une seule page A4, aucun élément du site principal imprimé.

### 5.5 OCR Multilingue (Frontend — `OCRTool.tsx`)
*   Propulsé par `Tesseract.js` (traitement 100% local, in-browser).
*   Langues chargées : `ara` (arabe) + `fra` (français).
*   Prétraitement de l'image (niveaux de gris, contraste) avant OCR.
*   Limitations : l'arabe manuscrit ou sur images de faible résolution peut avoir des imperfections.

### 5.6 Détourage IA (Frontend — `BgRemovalTool.tsx`)
*   Propulsé par `@imgly/background-removal` (modèle WASM local).
*   Redimensionnement automatique à 1024px max avant traitement pour optimiser les performances.
*   100% privé (aucune image n'est uploadée sur un serveur).

### 5.7 Refonte Mobile-First (v2.1.0)
Toutes les vues principales ont été refactorisées en Août 2026 :
*   **Breakpoints** : Classes Tailwind par défaut = mobile, `sm:` = 640px+, `md:` = 768px+.
*   **Kanban Admin** : Remplacé `grid` fixe par `flex overflow-x-auto snap-x` pour le swipe mobile.
*   **BriefForm** : Pills de navigation en `flex overflow-x-auto` sur mobile.
*   **ToolsNav** : Défilement horizontal sur mobile (`overflow-x-auto scrollbar-hide`).
*   **InvoiceTool** : Tableau d'articles scrollable horizontalement (`overflow-x-auto`).
*   **PWA iOS** : Ajout de `apple-mobile-web-app-capable` et `apple-mobile-web-app-status-bar-style: black-translucent` dans `index.html`.

### 5.8 Mme Niass Madina — Widget Chat IA
*   Composant : `AIChatWidget.tsx`
*   Position mobile : `bottom-24` (au-dessus de la barre de navigation mobile).
*   Position desktop : `bottom-6`.
*   Appel API : `POST /api/chat/` → Groq → `llama-3.1-8b-instant`.

---

## 6. Variables d'Environnement

### Backend (`.env` ou Render Environment Variables)
```
DJANGO_SECRET_KEY=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
ADMIN_STATIC_TOKEN=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
GOOGLE_API_KEY=...          # Gemini (analyse briefs)
GROQ_API_KEY=...            # Llama (chat Mme Niass Madina)
DATABASE_URL=...            # PostgreSQL Render
```

### Frontend (`.env.local`)
```
VITE_API_BASE_URL=https://hadara-backend.onrender.com
```

---

## 7. Déploiement Render

1.  `git push origin main` → déclenche les builds automatiques.
2.  **Frontend** : Build Vite → `dist/` → servi en Static Site.
3.  **Backend** : `gunicorn hadara_project.wsgi` → Web Service.
4.  **Migrations** : `python manage.py migrate` en Pre-Deploy Command.
