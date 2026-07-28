🎨 Le Graphiste de la Hadara — Plateforme de Brief Créatif & Gestion de Projets

Cette application web complète (PWA) a été développée pour Le Graphiste de la Hadara (Dakar, Sénégal).  Elle permet de collecter efficacement les briefs créatifs des clients pour la conception d’affiches, de bâches grand format, de banderoles, de flyers et d’identités visuelles associées à des événements religieux, des cérémonies (Gamou, Magal, Ziarra), des dahiras et des complexes, et de livrer des fichiers HD prêts pour l’impression.

—

📌 1. Vue d’Ensemble & Concept

Cette application répond au problème récurrent des informations imprécises ou incomplètes lors de la création de visuels.

Pour le Client : un parcours utilisateur guidé par étapes permet de préciser les détails du projet (titre principal, textes secondaires, thématiques islamiques, dimensions, budget en FCFA et échéances).
Pour le Graphiste : un tableau de bord centralisé offre une vue d’ensemble des briefs, facilite l’analyse, permet l’ajustement des devis, la génération de réponses WhatsApp préformatées et l’utilisation d’un Assistant IA Directeur Artistique alimenté par Gemini.

> ⚠️ Clarification importante sur le livrable : le studio assure la conception graphique sur mesure et livre des fichiers numériques HD prêts à imprimer (PDF Haute Définition CMJN, PNG sans fond, fichiers vectoriels). L’impression physique est à la charge du client auprès de l’imprimeur de son choix.

—

🚀 2. Fonctionnalités Clés

📱 A. Progressive Web App (PWA) & Splash Screen

Splash Screen Immersif : une page d’accueil soignée met en valeur le logo officiel, la devise et l’identité de marque avant l’accès à l’application.
PWA Intégrée : application installable sur mobile et bureau (manifest.webmanifest, icônes Apple et favicons haute définition, compatible avec le mode hors ligne).

📝 B. Formulaire de Brief Express (5 Étapes Fluides)

Un formulaire guidé permet de recueillir précisément les besoins du client (contact, type de projet, contenus textuels, ambiance, devis/délais).
Un PDF du dossier client est généré automatiquement à la fin du parcours.

💬 C. Notifications WhatsApp Instantanées (CallMeBot)

À la validation d’un brief, le backend Django transmet automatiquement une alerte WhatsApp gratuite à l’administrateur avec les éléments clés (client, budget, urgence) via l’API CallMeBot.

🤖 D. Assistant IA Directeur Artistique (Gemini)

L’analyse automatique vérifie la cohérence du brief.
Une palette de couleurs recommandée (codes HEX et dénominations) est proposée.
Des recommandations typographiques et de mise en page sont fournies, prêtes à être intégrées au devis.

📊 E. Tableau de Bord Graphiste & Bibliothèque de Modèles

Gestion des Briefs Clients : suivi des statuts, recherche rapide, modification des tarifs.
Protection Anti-Spam : le backend sécurise les soumissions (idempotence de 5 minutes) et génère des identifiants uniques (ex. : HADARA-2026-001).

—

🛠️ 3. Architecture Technique

Frontend : React 18, TypeScript, Tailwind CSS, Vite (plugin PWA).
Backend API : Python / Django REST Framework avec base de données SQLite3.
IA : Google Gemini API (gemini-2.5-flash).
Notifications : CallMeBot HTTP API pour WhatsApp.

—

⚙️ 4. Installation and Local Launch

Prerequisites

Node.js (v18+)
Python 3.10+
Un compte Google AI Studio (clé API Gemini)
Une clé API CallMeBot (pour les alertes WhatsApp)

A. Frontend (React / Vite)

Installer les dépendances
npm install

Démarrer le serveur de développement (Port 5173)
npm run dev

B. Backend (Django)

Se déplacer dans le dossier backend
cd backend

Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate

Installer les dépendances (django, djangorestframework, django-cors-headers, requests, google-genai)
pip install django djangorestframework django-cors-headers requests google-genai
Effectuer les migrations de la base de données
python manage.py migrate
Lancer le serveur Django (Port 8000)
python manage.py runserver

C. Variables d’Environnement & Sécurité (IMPORTANT)

> 🚨 Ne jamais commettre vos clés API sur GitHub !

Dans le dossier backend/, créer un fichier nommé .env (ce fichier est ignoré par .gitignore).  Remplir ce fichier avec vos propres clés privées :
backend/.env
GEMINIAPIKEY=votrecleapigeminisecrete
CALLMEBOT_PHONE=+221770000000
CALLMEBOTAPIKEY=votrecleapicallmebotsecrete
Un fichier .env.example est fourni dans le code pour servir de modèle.

—

📄 Licence & Crédits
Développé pour Le Graphiste de la Hadara — Dakar, Sénégal.
