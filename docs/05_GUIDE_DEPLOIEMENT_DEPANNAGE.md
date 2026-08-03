# Déploiement & Dépannage (Troubleshooting)

> [!WARNING]  
> **Clause de Stricte Réalité** : Cette section se base exclusivement sur l'environnement de production configuré dans `render.json` et les journaux (logs) du backend Django.

---

## 1. Processus de Déploiement

Le projet se déploie via la plateforme **Render.com**.
Le fichier `render.json` à la racine configure deux services (un Frontend Vite et un Backend Django) avec des *Rewrites* pour que toutes les requêtes `/api/*` aillent au backend, et le reste au frontend.

### A. Variables d'Environnement Obligatoires (Secrets)
*   `DATABASE_URL` : Connexion PostgreSQL (obligatoire en prod).
*   `GEMINI_API_KEY` : Requis pour la fonctionnalité d'Analyse IA.
*   `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID` : Requis pour les alertes sur nouveaux briefs.
*   Variables d'authentification Admin de Django.

---

## 2. Guide de Dépannage (Troubleshooting)

Cette section aide à résoudre les problèmes d'exploitation les plus courants.

### 🔴 Erreur 404 (Not Found)
*   **Symptôme** : L'accès à une page spécifique renvoie une erreur 404 ou une page blanche.
*   **Cause probable** : Sur l'environnement de production (Render), le routage côté client (React Router) n'est pas transmis au fichier `index.html`.
*   **Solution** : Assurez-vous que le fichier `render.json` contient bien la règle de rewrite : `{"source": "/(.*)", "destination": "/index.html"}` pour le service Frontend.

### 🔴 Erreur 500 (Internal Server Error)
*   **Symptôme** : Le bouton d'enregistrement dans l'admin renvoie un bandeau rouge.
*   **Solution** : Vérifiez les logs Render du service Backend. C'est généralement causé par un champ obligatoire manquant dans la base de données, ou une variable d'environnement (ex: Clé secrète Django) absente.

### 🔴 Erreur PostgreSQL (`dj_database_url`)
*   **Symptôme** : Les produits ou les briefs disparaissent, ou l'application tourne dans le vide.
*   **Solution** : Assurez-vous que la variable `DATABASE_URL` (format `postgresql://...`) est bien définie. Si elle est absente, Django tentera d'écrire dans SQLite (qui sera écrasé à chaque redéploiement sur Render).

### 🔴 Erreur Gemini (IA Indisponible)
*   **Symptôme** : Le bouton "Analyser avec l'IA" retourne l'erreur "Clé API Gemini non configurée".
*   **Solution** : La variable `GEMINI_API_KEY` a expiré ou n'a pas été fournie dans les Settings de Render. Mettez-la à jour. Si le problème persiste, vérifiez les quotas Google Cloud.

### 🔴 Erreur Telegram (Aucune notification)
*   **Symptôme** : Un client soumet un brief, mais aucune alerte n'arrive sur le téléphone de l'administrateur.
*   **Solution** : Le thread asynchrone a probablement échoué en silence (pour ne pas bloquer le client). Lisez les logs Render pour trouver `Erreur d'envoi Telegram asynchrone`. Vérifiez que le `TELEGRAM_CHAT_ID` correspond toujours (il peut changer si le bot est supprimé puis recréé).

### 🔴 Erreurs de Build & Render
*   **Symptôme** : Le déploiement "Build Failed" sur Render.
*   **Solution** : 
    *   **Backend** : Vérifiez `requirements.txt` (Assurez-vous que les librairies sont figées avec leurs numéros de version).
    *   **Frontend** : Vérifiez la compilation TypeScript en exécutant localement `npm run build`. Souvent causé par des erreurs de typage dans `src/types.ts`.

### 🔴 Erreur de Migration (Auto-Seeding)
*   **Symptôme** : L'application backend plante au démarrage (Render logs : `django.db.migrations.exceptions...`).
*   **Solution** : La migration `0003_seed_store_products.py` ou `0004` essaie d'insérer des données, mais la structure de la table a changé (ou il y a un conflit d'ID). Purgez la base de données PostgreSQL ou utilisez `python manage.py migrate api zero` (attention : supprime les données de l'application) pour réinitialiser la structure.
