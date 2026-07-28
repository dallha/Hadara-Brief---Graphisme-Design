# 🎨 Le Graphiste de la Hadara — Plateforme de Brief Créatif & Gestion de Projets

Une application web complète (PWA) conçue spécialement pour le **Graphiste de la Hadara** (Dakar, Sénégal). Elle permet de collecter les briefs créatifs des clients pour la conception d'affiches, bâches grand format, banderoles, flyers et identités visuelles pour événements religieux, cérémonies (Gamou, Magal, Ziarra), dahiras et complexes, puis de livrer les fichiers HD prêts pour l'impression.

---

## 📌 1. Vue d'Ensemble & Concept

Cette application résout le défi de la collecte d'informations imprécises ou incomplètes lors de la création de visuels graphiques. 

- **Pour le Client** : Un parcours guidé en étapes pour définir avec précision son projet (titre principal, textes secondaires, thématiques islamiques, dimensions, budget en FCFA et échéances).
- **Pour le Graphiste** : Un tableau de bord centralisé pour analyser les briefs, ajuster les devis, générer des réponses WhatsApp pré-formatées et utiliser un **Assistant IA Directeur Artistique** alimenté par Gemini.

> ⚠️ **Clarification importante sur le livrable** : Le studio assure la **conception graphique sur mesure** et livre les **fichiers numériques HD prêts à imprimer** (PDF Haute Définition CMJN, PNG sans fond, vectoriel). L'impression physique est réalisée par le client auprès de l'imprimeur de son choix.

---

## 🚀 2. Fonctionnalités Clés

### 📱 A. Progressive Web App (PWA) & Splash Screen
- **Splash Screen Immersif** : Une page d'accueil d'impact mettant en valeur le logo officiel, la devise et l'identité de marque avant d'entrer dans l'application.
- **PWA Intégrée** : Application installable sur mobile et bureau (manifest.webmanifest, icônes Apple et favicons haute définition, offline-ready).

### 📝 B. Formulaire de Brief Express (5 Étapes Fluides)
- Formulaire guidé de bout en bout pour extraire le besoin exact du client (Contact, Type de projet, Contenus textes, Ambiance, Devis/Délais).
- Génération PDF automatique du dossier client en fin de parcours.

### 💬 C. Notifications WhatsApp Instantanées (CallMeBot)
- À la validation d'un brief, le backend Django envoie **automatiquement une alerte WhatsApp gratuite** à l'administrateur avec les détails essentiels (Client, Budget, Urgence) via l'API CallMeBot.

### 🤖 D. Assistant IA Directeur Artistique (Gemini)
- Analyse automatique de la cohérence du brief.
- Génération d'une **palette de couleurs recommandée** (codes HEX & dénominations).
- Recommandations typographiques et de mise en page, prêtes à être copiées-collées pour le devis.

### 📊 E. Tableau de Bord Graphiste & Bibliothèque de Modèles
- **Gestion des Briefs Clients** : Statuts d'avancement, recherche rapide, édition des tarifs.
- **Protection Anti-Spam** : Le backend sécurise la soumission des briefs (idempotence de 5 minutes) et auto-génère des identifiants (ex: `HADARA-2026-001`).

---

## 🛠️ 3. Architecture Technique

- **Frontend** : React 18, TypeScript, Tailwind CSS, Vite (PWA plugin).
- **Backend API** : **Python / Django REST Framework** avec base de données SQLite3.
- **IA** : API Google Gemini (`gemini-2.5-flash`).
- **Notifications** : API HTTP CallMeBot pour WhatsApp.

---

## ⚙️ 4. Installation et Lancement en Local

### Prérequis
- Node.js (v18+)
- Python 3.10+
- Un compte Google AI Studio (clé API Gemini)
- Une clé API CallMeBot (pour les alertes WhatsApp)

### A. Frontend (React / Vite)
```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement (Port 5173)
npm run dev
```

### B. Backend (Django)
```bash
# Se placer dans le dossier backend
cd backend

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances (django, djangorestframework, django-cors-headers, requests, google-genai)
pip install django djangorestframework django-cors-headers requests google-genai

# Effectuer les migrations de la base de données
python manage.py migrate

# Lancer le serveur Django (Port 8000)
python manage.py runserver
```

### C. Variables d'Environnement & Sécurité (IMPORTANT)
> 🚨 **Ne commitez JAMAIS vos clés API sur GitHub !**

Dans le dossier `backend/`, créez un fichier nommé **`.env`** (ce fichier est ignoré par `.gitignore`). Remplissez-le avec vos propres clés privées :
```env
# backend/.env
GEMINI_API_KEY=votre_cle_api_gemini_secrete
CALLMEBOT_PHONE=+221770000000
CALLMEBOT_API_KEY=votre_cle_api_callmebot_secrete
```
Un fichier `.env.example` est fourni dans le code pour vous servir de modèle.

---

## 📄 Licence & Crédits
Développé pour **Le Graphiste de la Hadara** — Dakar, Sénégal.
