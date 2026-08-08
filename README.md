🎨 Hadara Suite v2.3.0 — Plateforme SaaS ERP, CRM & AI pour Studios Graphiques

**Hadara Suite** est une suite logicielle SaaS professionnelle (Web & PWA) développée pour **Hadara Studio** (Dakar, Sénégal).  
Elle réunit en une seule plateforme : la vitrine studio, le formulaire de brief intelligent, l'ERP de production, la boutique Hadara Store, le copilote **Hadara AI Studio** et le cockpit **Hadara Manager**.

---

📌 1. Les 4 Espaces Produit

1. **Hadara Studio** (Vitrine & Conversion) :
   - Formulaire de brief intelligent en 5 étapes avec validation en temps réel.
   - Portfolio Bento Grid des créations (affiches, bâches grand format, diplômes, identités visuelles).
   - **Portail Client** : Authentification par numéro WhatsApp, suivi du workflow 6 étapes, prévisualisation maquette WebP fluidifiée (`previewUrl`), Lightbox plein écran (`ZoomIn`) et versionnage des livrables (V1, V2, V3).

2. **Hadara Manager** (ERP & Cockpit d'Administration Unifié `/api/django-admin/`) :
   - **Hadara Design System** : Design Tokens unifiés (`#070B18`, `#D0A21C`, `#335A79`) et grammaire d'interaction partagée avec le site public.
   - **Formulaires Ultra-Épurés (3-4 Champs Obligatoires Max)** : Briefs, Portfolio, Store, Modèles.
   - **Génération Automatique des Identifiants** : `HAD-XXXX`, `PRD-XXXX`, `PRT-XXXX`, `TPL-XXXX`.
   - **Hadara Mobile Image Uploader & Compression WebP** : Upload direct depuis Photos/Caméra sur iPhone/Android avec compression automatique canvas et aperçu instantané `✓ Image optimisée`.
   - **Hadara Chips & Color Picker Widgets** : Manipulation des tags/livrables et des palettes de couleurs sans aucune syntaxe JSON `[]` brute.

3. **Hadara AI Pro** (Copilote & Directeur Artistique IA) :
   - Prompts structurés pour Midjourney v6, Adobe Firefly, DALL-E 3 et Stable Diffusion.
   - Copywriter automatique pour réseaux sociaux.
   - Audit de densité de texte pour affiches & bâches.

4. **Hadara Cloud** (Administration SaaS Multi-Studios) :
   - Tableau de bord éditeur : Suivi des métriques **MRR, ARR, Churn Rate**.
   - Licences White-Label & Support.

---

🛠️ 2. Architecture Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS (v4), Vite PWA.
- **Backend API** : Python 3.10+ / Django 5.x REST Framework + Django Jazzmin.
- **Base de Données** : **Neon PostgreSQL Serverless** (Source de vérité structurée permanente).
- **Hébergement** : Render Cloud (Frontend Static App + Backend Web Service Django).
- **Documentation Complete** : Dossier [`/docs/v2.3.0/`](file:///Users/mac/Documents/Mes%20Docs/code/Hadara%20Brief%20-%20Graphisme%20&%20Design/docs/v2.3.0/00_INDEX.md).

---

⚙️ 3. Lancement Local

```bash
# 1. Frontend (React / Vite)
npm install
npm run dev

# 2. Backend (Django)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

📄 Documentation Complète
Consultez la [DOCUMENTATION.md](file:///Users/mac/Documents/Mes%20Docs/code/Hadara%20Brief%20-%20Graphisme%20&%20Design/DOCUMENTATION.md) pour les détails d'architecture de bout en bout.

Développé pour Le Graphiste de la Hadara — Dakar, Sénégal.

