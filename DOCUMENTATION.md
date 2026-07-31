# 📘 Documentation Technique & Fonctionnelle Complète (De Bout en Bout)
**Projet** : Le Graphiste de la Hadara
**Version** : 1.0.0
**Mise à jour** : Juillet 2026

Cette documentation décrit l'ensemble de l'architecture, du fonctionnement et des processus de déploiement de l'application "Le Graphiste de la Hadara".

---

## 📑 Sommaire
1. [Présentation du Produit](#1-présentation-du-produit)
2. [Architecture Technique Globale](#2-architecture-technique-globale)
3. [Le Frontend (React / Vite PWA)](#3-le-frontend-react--vite-pwa)
4. [Le Backend (Django REST Framework)](#4-le-backend-django-rest-framework)
5. [Intégrations Tiers (IA, WhatsApp, Supabase)](#5-intégrations-tiers)
6. [Processus d'Installation (De Zéro)](#6-processus-dinstallation)
7. [Structure des Dossiers](#7-structure-des-dossiers)

---

## 1. Présentation du Produit

"Le Graphiste de la Hadara" est un studio de création graphique basé à Dakar (Sénégal), spécialisé dans la conception d'identités visuelles religieuses (Magal, Gamou, Ziarra).

Le logiciel est un outil métier SaaS ("Software as a Service") permettant :
- **Pour le client** : De remplir un "Brief Express" précis via un formulaire web guidé en 5 étapes.
- **Pour l'administrateur** : De recevoir des alertes WhatsApp instantanées, de gérer les briefs via un tableau de bord, et d'obtenir des devis ou recommandations créatives autogénérées par l'Intelligence Artificielle.

---

## 2. Architecture Technique Globale

Le projet repose sur une architecture moderne découplée (Frontend séparé du Backend).

- **Frontend** : Application mono-page (SPA) + Progressive Web App (PWA) construite avec React, TypeScript et Vite.
- **Backend** : Serveur d'API robuste construit avec Python et Django REST Framework.
- **Base de Données** : Supabase (PostgreSQL Cloud) gérée par Django via l'ORM.

```mermaid
graph TD
    Client[Client Mobile/Web] -->|HTTPS| React[Frontend React PWA]
    React -->|Appels REST API| Django[Backend Django]
    Django -->|Lecture/Écriture| Supabase[(Base de données Supabase PostgreSQL)]
    Django -->|Prompt IA| Gemini[API Google Gemini 2.5]
    Django -->|Notifications HTTP| CallMeBot[API CallMeBot WhatsApp]
```

---

## 3. Le Frontend (React / Vite PWA)

### Technologies
- **React 18** : Rendu des composants UI.
- **TypeScript** : Typage strict pour éviter les erreurs lors de la manipulation des données (ex: type `BriefData`).
- **Tailwind CSS (v4)** : Stylisation utilitaire avec un Design System "Premium".
- **Design System & Thématique** : Utilisation de typographies élégantes (`Cinzel`, `Cairo`, `Amiri`, `Libre Caslon Text`). L'interface combine le Glassmorphism en thème sombre et un **Mode Clair ("Parchemin Lumineux")** qui préserve le contraste et l'élégance des cartes sombres ("Bento Grid").
- **Vite PWA Plugin** : Permet l'installation de l'application sur smartphone (Offline, Icônes Apple Touch 180x180px, Splash screen).

### Composants Principaux
- `App.tsx` : Gère le routage par état local (`splash`, `home`, `portfolio`, `brief`, `admin`).
- `SplashEntry.tsx` : Écran d'accueil immersif plein écran.
- `LandingHero.tsx` : Présentation des services via une architecture moderne en "Bento Grid" et timeline de processus connectée.
- `ResumeCV.tsx` : Mini-site CV intégré avec bascule vue interactive / vue impression ATS.
- `BriefForm.tsx` : Moteur de formulaire en 5 étapes professionnalisé (avec restriction d'upload à 5Mo max).
- `AdminDashboard.tsx` : Espace protégé (refondu pour une meilleure ergonomie) pour gérer les données provenant de l'API.

---

## 4. Le Backend (Django REST Framework)

### Technologies
- **Django 6.0** : Cadre de travail sécurisé (protection CSRF, requêtes SQL préparées).
- **Django REST Framework (DRF)** : Création des endpoints `/api/briefs/`.
- **SQLite (Développement) -> PostgreSQL (Supabase)** : Modèle de données via ORM.

### Sécurité & Fiabilité
- **Idempotence** : Le backend mémorise la signature d'un brief pour empêcher les soumissions multiples accidentelles dans une fenêtre de 5 minutes.
- **Génération Auto d'ID** : Surcharge de la méthode `save()` pour générer des IDs professionnels (`HADARA-2026-001`).
- **CORS** : Le package `django-cors-headers` autorise le frontend React (port 5173) à communiquer avec Django (port 8000).

---

## 5. Intégrations Tiers

### A. Google Gemini (IA)
Lorsqu'un administrateur clique sur "Analyse IA" dans le tableau de bord, Django envoie le contenu du brief à `gemini-2.5-flash`.
L'IA est instruite pour agir comme un "Directeur Artistique" (via un prompt système caché dans `views.py`), elle renvoie :
- Une analyse du projet.
- Une palette de couleurs conseillée (HEX).
- Un brouillon de message WhatsApp avec devis.

### B. CallMeBot (WhatsApp)
Lors de la création d'un nouveau brief (méthode `create` dans `views.py`), le serveur Django fait une requête HTTP à l'API gratuite de CallMeBot. 
- **Résultat** : L'administrateur reçoit un message WhatsApp sur son téléphone avec le nom du client, le budget, et un lien pour voir le brief.

### C. Supabase (PostgreSQL)
Configuration via `dj-database-url` utilisant le **Connection Pooler IPv4** (port 5432/6543) pour éviter les blocages de résolutions DNS IPv6 fréquents sur les environnements de développement.

---

## 6. Processus d'Installation

### 6.1. Variables d'Environnement (Secrets)
Toutes les clés privées doivent être isolées dans le dossier `backend/.env`. Ce fichier est protégé par `.gitignore`.
```env
GEMINI_API_KEY=xxx
CALLMEBOT_PHONE=+221xxxx
CALLMEBOT_API_KEY=xxx
DATABASE_URL=postgresql://postgres.upqakzypahnercsppgwc:MOTDEPASSE@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
```

### 6.2. Lancement Local
Ouvrir deux terminaux :

**Terminal 1 (Frontend) :**
```bash
npm install
npm run dev
# Accessible sur http://localhost:5173
```

**Terminal 2 (Backend) :**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# Accessible sur http://localhost:8000
```

---

## 7. Structure des Dossiers Principaux

```text
Hadara Brief - Graphisme & Design/
│
├── public/                 # Ressources publiques (Icônes PWA, Favicons Safari, Logos)
├── src/                    # Code source Frontend (React)
│   ├── components/         # Blocs d'interface réutilisables (Boutons, Formulaires)
│   ├── data/               # Données statiques (Portfolio)
│   ├── types.ts            # Définitions TypeScript
│   └── main.tsx            # Point d'entrée React
│
├── backend/                # Code source Backend (Django)
│   ├── api/                # Application API (Modèles, Vues, IA, WhatsApp)
│   ├── hadara_project/     # Configuration centrale Django (settings.py, urls.py)
│   ├── .env                # Fichier caché des mots de passe
│   ├── requirements.txt    # Liste des librairies Python (psycopg2, dj-database-url...)
│   └── manage.py           # Outil de commande Django
│
├── .gitignore              # Règles d'exclusion Git globales
├── package.json            # Dépendances Node.js (React/Vite)
├── vite.config.ts          # Configuration du bundler Vite et plugin PWA
└── README.md               # Guide rapide d'accueil GitHub
```

---
*Fin de la documentation technique.*
