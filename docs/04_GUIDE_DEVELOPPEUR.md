# Hadara Suite - Documentation Officielle
## Volume 2 : Architecture & Guide Développeur

Ce volume détaille l'architecture logicielle, les choix technologiques et les flux de données internes. Il est destiné aux développeurs amenés à maintenir ou étendre l'application.

> [!WARNING]  
> **Clause de Stricte Réalité** : Cette documentation est générée à partir de l'état actuel du code source.

---

## 1. Stack Technologique

Le projet suit une architecture monolithique découplée (Frontend en React, servi par Django en production).

### 1.1 Frontend
*   **Framework** : React 18 avec Vite.
*   **Routage** : `react-router-dom` (Routage côté client).
*   **Stylisation** : Tailwind CSS (configuration utilitaire pure, pas de CSS Modules).
*   **Icônes** : `lucide-react`.
*   **Langage** : TypeScript.

### 1.2 Backend
*   **Framework** : Django 5.
*   **API** : Django Rest Framework (DRF).
*   **Base de Données** : SQLite (Environnement local de développement) et PostgreSQL (Production).
*   **Intégration IA** : `google-genai` (SDK Google Gemini).
*   **Administration** : `django-jazzmin` (Interface admin SaaS moderne et responsive).
*   **Génération PDF** : `reportlab` (Création dynamique de factures et devis).

---

## 2. Structure du Code

### 2.1 Le Frontend (`src/`)
*   `App.tsx` : Point d'entrée principal. Gère le routage global, les appels APIs initiaux (fetchBriefs, fetchPortfolio, fetchStoreProducts), le state global (session d'admin) et le mécanisme PWA/Offline cache.
*   `components/` : Contient l'ensemble des composants d'interface.
    *   `BriefForm.tsx`, `LandingHero.tsx`, `PortfolioShowcase.tsx` : Vues publiques.
    *   `AdminDashboard.tsx` : Point d'entrée de l'administration. Divisé en sous-composants (`BriefsTab`, `PortfolioTab`, `StoreTab`).
*   `types.ts` : Définition des types TypeScript (interfaces pour les Briefs, Produits, Portfolio).

### 2.2 Le Backend (`backend/api/`)
*   `models.py` : Schémas de base de données.
*   `views.py` : Contrôleurs DRF (ViewSets) exposant les points d'API REST.
*   `serializers.py` : Conversion des modèles Django en JSON pour l'API.
*   `migrations/` : Scripts de création et de remplissage de la base (ex: `0003_seed_store_products.py`).

---

## 3. Schémas de Base de Données (`models.py`)

1.  **`Brief`** :
    *   ID au format string personnalisé : `HAD-XXXX`
    *   Champs clients (Nom, Email, WhatsApp).
    *   Spécifications du projet (Contexte, Objectif, Cible, Textes).
    *   Champs techniques et Budget.
    *   Champs Administrateur (`designer_notes`, `quoted_price_fcfa`, `ai_analysis`).
2.  **`PortfolioItem`** :
    *   ID au format string personnalisé : `PRT-XXXX`
    *   Titre, Catégorie, Image URL, Prix estimatif.
3.  **`StoreProduct`** :
    *   ID au format string personnalisé : `PRD-XXXX`
    *   Titre, Marque, Catégorie, Image (Chemin local).
    *   Prix (Entier, null si sur demande).
    *   Visibilité (`visible`, booléen) et Mise en avant (`featured`, booléen).
    *   Statuts : `in_stock`, `available_24_48h`, `on_order`, `unavailable`.
4.  **`Template`** :
    *   Modèles de briefs prédéfinis pour accélérer la création côté client.

---

## 4. Documentation de l'API REST (`views.py`)

Les points de terminaison sont servis sous le préfixe `/api/`.

### 4.1 Authentification (`/api/auth/login/`)
*   **Méthode** : `POST`
*   **Corps** : `{"username": "...", "password": "..."}`
*   **Comportement** : Vérifie les identifiants contre les variables d'environnement (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). Retourne un `ADMIN_STATIC_TOKEN` si succès. Implémente un *Rate Limiting* très strict côté serveur.

### 4.2 Les Briefs (`/api/briefs/`)
*   `GET /api/briefs/` : Liste tous les briefs. (La vérification du token est désactivée dans la vue actuelle pour simplifier la consultation depuis l'admin).
*   `POST /api/briefs/` : Créer un brief (Public).
    *   **Workflow asynchrone** : Dès qu'un Brief est sauvegardé, un `threading.Thread` est lancé pour appeler l'API Telegram (`https://api.telegram.org/bot<TOKEN>/sendMessage`) sans bloquer la réponse HTTP.
*   `PATCH /api/briefs/<id>/` : Met à jour un brief (Admin requis).

### 4.3 Analyse IA (`/api/briefs/<id>/analyze/`)
*   **Méthode** : `POST`
*   **Comportement** : 
    *   Instancie le client `genai.Client`.
    *   Utilise le modèle `gemini-2.5-flash`.
    *   Fournit un prompt structuré avec le contenu du brief.
    *   Spécifie un schéma de réponse JSON strict (`response_schema`).
    *   Sauvegarde l'analyse dans le champ `ai_analysis` du brief.

### 4.4 Portfolio & Boutique
*   `GET/POST/PATCH/DELETE /api/portfolio/` (Admin requis pour mutations).
*   `GET/POST/PATCH/DELETE /api/store/products/` (Admin requis pour mutations).

---

## 5. Mécanismes Spécifiques

### 5.1 Sécurité Brute-Force Admin
Une double protection est implémentée :
1.  **Frontend (`App.tsx`)** : Compte les échecs via `localStorage`. Au bout de 5 erreurs, bloque l'UI pendant 15 minutes.
2.  **Backend (`views.py`)** : Le décorateur `ratelimit` bloque l'IP après un nombre restreint d'échecs sur le endpoint `/api/auth/login/`.

### 5.2 Résilience Hors-Ligne (Mode Lecture Seule)
Le système *"Offline"* actuellement implémenté est un système de cache passif :
*   Le frontend met en cache les appels API de la boutique dans le `localStorage` (`hadara_store_products`).
*   Si le `fetch` échoue (serveur injoignable, pas de réseau), le store charge le fallback local pour que le visiteur puisse toujours consulter le catalogue.
*   **Attention** : Les actions de mutation (Créer/Éditer/Supprimer) déclenchent directement le `fetch` HTTP et échouent si le réseau est indisponible. Il n'y a pas de file d'attente locale (Pending Mutations Queue) dans le code de production actuel.

### 5.3 Moteur de Génération PDF (`pdf_utils.py`)
La génération des devis PDF est réalisée en mémoire (sans écriture sur le disque du serveur, crucial pour un hébergement éphémère comme Render) :
*   Utilise `reportlab.platypus` (SimpleDocTemplate, Paragraph, Table).
*   Le PDF est généré dynamiquement lors d'un appel `GET` sur la route `@action` `download_pdf` du `BriefViewSet`.
*   Le fichier est retourné avec un `Content-Disposition: attachment`.

### 5.4 Moteur de Notifications (Emails & Telegram)
*   **Telegram** : Utilisé de manière asynchrone (`threading.Thread`) dans la méthode `create()` du `BriefViewSet` pour alerter l'administrateur sans bloquer la réponse HTTP.
*   **Email SMTP** : Géré via `django.core.mail.EmailMultiAlternatives`.
    *   **Création** : Un email HTML est envoyé au client pour confirmer la réception.
    *   **Mise à jour** : Les méthodes `update()` et `partial_update()` interceptent les changements de la propriété `status`. Si le statut évolue, la fonction utilitaire `send_status_email()` génère et expédie un template HTML adapté à la situation (Devis, En Création, Terminé).
    *   **Fallback** : En l'absence de mot de passe SMTP (`EMAIL_HOST_PASSWORD`), Django bascule automatiquement sur le `console.EmailBackend` pour éviter les plantages (utile en dev).
