# Hadara Suite - Documentation Officielle
## Volume 3 : Guide de Déploiement & DevOps

Ce volume s'adresse aux administrateurs système et au personnel en charge de l'hébergement de l'application Hadara Suite. Il documente exclusivement la configuration de déploiement en place sur la plateforme Render.

> [!WARNING]  
> **Clause de Stricte Réalité** : Cette documentation est générée à partir de l'état actuel du code source et de la configuration (`render.json`, `.env`).

---

## 1. Architecture de Déploiement (Render)

L'application est configurée pour être déployée sur [Render.com](https://render.com) en utilisant le fichier `render.json` fourni à la racine du dépôt.

### 1.1 Fichier `render.json`
Le projet utilise une configuration de type "Blueprint" contenant deux services virtuels (Frontend et Backend) avec un mécanisme de réécriture d'URL (Rewrites) :
*   **Service Frontend** : Situé à la racine (`.`), utilise le framework `vite` (Génère le build React dans `dist/`).
*   **Service Backend** : Situé dans le dossier `backend`.
*   **Règles de Routage** :
    *   Toutes les requêtes commençant par `/api/` sont redirigées vers le service **Backend**.
    *   Toutes les autres requêtes (`/(.*)`) sont servies par le service **Frontend** (Support du routage côté client via React Router).

---

## 2. Variables d'Environnement (Secrets)

Pour fonctionner correctement en production, les variables d'environnement suivantes doivent être configurées dans le tableau de bord Render :

### 2.1 Backend (`backend/.env`)
*   `GEMINI_API_KEY` : Clé API pour le service Google Gemini (Requis pour l'analyse IA des briefs).
*   `GROQ_API_KEY` : Clé API pour le service Groq (Requis pour le chat Mme Niass Madina et correction OCR).
*   `TELEGRAM_BOT_TOKEN` : Jeton d'authentification du Bot Telegram.
*   `TELEGRAM_CHAT_ID` : L'identifiant du chat administrateur pour recevoir les notifications.
*   `DATABASE_URL` : URL de connexion SSL à la base de données **Neon PostgreSQL Serverless** (ex: `postgresql://neondb_owner:*****@ep-falling-sunset-axfvhryv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require`).
*   *(Variables d'authentification Admin)* : Les identifiants administrateurs définis dans les paramètres du projet Django.

### 2.2 Frontend (`.env`)
Bien que le backend proxy gère la majorité des requêtes internes, si des clés API publiques sont requises côté client (ex: Analytics, Bien que non implémenté actuellement), elles doivent être préfixées par `VITE_`.

---

## 3. Processus de Build & Déploiement

### 3.1 Côté Frontend
Le processus de build du frontend est géré par Node.js via le fichier `package.json`.
1.  **Installation** : `npm install`
2.  **Compilation** : `npm run build`
    *   Appelle Vite via TypeScript (`tsc -b && vite build`).
    *   Les fichiers de production optimisés sont générés dans le dossier `/dist/`.

### 3.2 Côté Backend
Le backend Django nécessite un environnement Python.
1.  **Installation** : `pip install -r backend/requirements.txt`
2.  **Migrations de Base de Données** : `python manage.py migrate`
    *   Crée les tables (Briefs, Portfolio, StoreProduct).
    *   **Auto-Seeding** : La migration `api/migrations/0003_seed_store_products.py` s'exécute automatiquement et insère les 12 produits par défaut dans la base de données PostgreSQL si elle est vierge.
    *   **Mise à jour des URLs** : La migration `0004_update_store_images.py` s'exécute pour modifier l'ancienne URL des images (`Unsplash`) par les images locales HD stockées dans le build public (`/images/store/prod-XX.jpg`).
3.  **Collecte des fichiers statiques** : `python manage.py collectstatic --noinput` (Pour servir l'interface d'administration Django de base si activée).

---

## 4. Stratégie de Base de Données
*   **Développement Local** : SQLite (`backend/db.sqlite3`).
*   **Production** : **Neon PostgreSQL Serverless** (configuré via `DATABASE_URL` avec `sslmode=require`). Django détecte la présence de la variable et bascule automatiquement via `dj_database_url.config` avec pooling de connexions.
*   **Sécurisation** : Le mot de passe de base de données ne doit jamais être commité sous Git. En cas de rotation du mot de passe dans Neon Console, mettre à jour la variable `DATABASE_URL` sur Render.

---

## 5. Maintenance Opérationnelle

### 5.1 Sécurisation des accès
*   Si le panneau d'administration subit des tentatives de force brute (erreurs 429), le blocage est temporaire (15 minutes). Aucune intervention DevOps n'est nécessaire pour débloquer, le délai expirera tout seul.

### 5.2 Mise à jour des assets locaux
Les images HD générées de la boutique sont des assets statiques traqués sous Git (`public/images/store/`). Toute nouvelle image ajoutée devra être commitée et poussée vers Render qui servira automatiquement les nouveaux fichiers via le build de Vite.
