🎨 Hadara Suite v2.0.0 — Plateforme SaaS ERP, CRM & AI pour Studios Graphiques

**Hadara Suite** est une suite logicielle SaaS professionnelle (Web & PWA) développée pour **Le Graphiste de la Hadara** (Dakar, Sénégal).  
Elle réunit en une seule plateforme : la vitrine studio, le formulaire de brief intelligent, l'ERP de production (Kanban, Fiche 360°), la gestion financière (Devis & Factures PDF), le copilote **Hadara AI Studio** et l'administration multi-tenant **Hadara Cloud**.

---

📌 1. Les 4 Espaces Produit

1. **Hadara Studio** (Vitrine & Conversion) :
   - Formulaire de brief intelligent en 5 étapes avec validation en temps réel.
   - Portfolio Bento Grid des créations (affiches, bâches grand format, diplômes, identités visuelles).
   - **CV Interactif Professionnel** : Notation 5 Étoiles, badges de maîtrise (Expert, Maîtrise avancée, Bonne maîtrise, Notions) et usages réels par logiciel Adobe (Photoshop, Illustrator, InDesign, Premiere Pro, Lightroom, Acrobat Pro, After Effects).

2. **Hadara Manager** (ERP & CRM Opérationnel) :
   - **Kanban Production 6 Étapes** (`nouveau` ➔ `devis_envoye` ➔ `acompte_recu` ➔ `en_creation` ➔ `validation` ➔ `termine`).
   - **Fiche Projet 360°** : Timeline visuelle, versionnage des livrables (V1, V2, HD), checklist qualité 5 points, journal d'activité et commentaires.
   - **Finance & Facturation** : Génération de devis et factures PDF, acomptes 50%, soldes 50% et canaux locaux (Wave Sénégal, Orange Money, Free Money, Espèces).
   - **Recherche Globale (`Cmd + K`)** : Recherche universelle dans les clients, briefs, devis et fichiers.
   - **Corbeille Soft-Delete** : Restauration instantanée sans perte de données.
   - **Signature Électronique** : Validation numérique des devis par le client.

3. **Hadara AI Pro** (Copilote & Directeur Artistique IA) :
   - Prompts structurés pour Midjourney v6, Adobe Firefly, DALL-E 3 et Stable Diffusion.
   - Copywriter automatique pour réseaux sociaux.
   - Audit de densité de texte pour affiches & bâches.
   - Score Qualité /100.

4. **Hadara Cloud** (Administration SaaS Multi-Studios) :
   - Tableau de bord éditeur : Suivi des métriques **MRR, ARR, Churn Rate**.
   - Gestion multi-tenant des studios abonnés.
   - Licences White-Label & Support.

---

🛠️ 2. Architecture Technique

- **Frontend** : React 18, TypeScript, Tailwind CSS (v4), Vite PWA.
- **Backend API** : Python 3.10+ / Django REST Framework.
- **Base de Données** : Supabase (PostgreSQL Cloud).
- **Hébergement** : Render (Frontend SPA + Backend Django) + CDN Cloudflare (SSL Full Mode).

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

