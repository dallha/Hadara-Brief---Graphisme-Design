# Hadara Suite
## Plateforme SaaS de gestion et d'orchestration de projets créatifs

**Documentation officielle**  
**Version :** 2.0.0  
**Date :** Août 2026  
**Auteur :** El Hadji Abdoulaye Mouhamed Lamine Niass (Graphiste de la Hadara)

---

## Sommaire
1. [Historique des versions](#historique-des-versions)
2. [Vue d'Ensemble des Espaces (Routage)](#2-vue-densemble-des-espaces-routage)
3. [Espace Client (Utilisateur Final)](#3-espace-client-utilisateur-final)
4. [Espace Administrateur (Django Jazzmin)](#4-espace-administrateur-django-jazzmin)
5. [Système de Notifications et Devis PDF](#5-système-de-notifications-et-devis-pdf)

---

## Historique des versions

| Version | Date | Modifications |
| :--- | :--- | :--- |
| 1.0 | Février 2026 | Première version (Socle SaaS & Brief Intelligent) |
| 1.5 | Avril 2026 | Ajout Hadara Store et Espace Client |
| 2.0.0 | Août 2026 | Intégration de Django Jazzmin, Génération PDF et Notifications Email |

---

## 2. Vue d'Ensemble des Espaces (Routage)

L'application web est structurée autour de plusieurs chemins principaux (`routes`), chacun correspondant à un espace dédié :
- `/studio` (ou `/`) : Page d'accueil principale (Landing Hero).
- `/portfolio` : Vitrine des réalisations passées.
- `/brief` : Formulaire intelligent pour la création d'un nouveau brief client.
- `/boutique` (ou `/store`) : Boutique d'accessoires et outils créatifs.
- `/cv` : Curriculum Vitae interactif du graphiste.
- `/roadmap` : Feuille de route des fonctionnalités (Roadmap).
- `/espace-client` (ou `/portail-client`, `/suivi`) : Portail sécurisé pour le suivi des projets clients.
- `/api/django-admin/` : Espace d'administration centralisé backend (Django Jazzmin).

---

## 3. Espace Client (Utilisateur Final)

Cette section couvre les parcours destinés aux visiteurs et clients du studio.

### 3.1 Navigation & Découverte
*   **Écran d'Accueil (Splash Screen)** : Lors de la première visite stricte sur `/`, un écran de chargement (SplashEntry) s'affiche avec le slogan *"L'art de donner vie à vos idées"*, avant d'entrer dans le Studio.
*   **Portfolio** : Les utilisateurs peuvent consulter les projets filtrables par catégories. Ils peuvent cliquer sur "Je veux ce style !" sur un projet spécifique pour être redirigés vers le formulaire de brief avec le style présélectionné.
*   **Curriculum Vitae** : Présentation interactive du parcours professionnel et des compétences du graphiste (optimisée Mobile-First), avec des boutons d'appel à l'action pour démarrer un projet.

### 3.2 Création de Projet (Le Brief Intelligent)
Le parcours de commande s'effectue via le composant **BriefForm**.
1.  **Formulaire Multi-étapes** : L'utilisateur remplit un formulaire détaillé structurant sa demande (Client, WhatsApp, Titre, Contexte, Objectif, Cible, Textes, Formats techniques).
2.  **Soumission** : 
    *   L'application vérifie l'idempotence (si le même client avec le même numéro WhatsApp soumet un brief dans les 5 minutes, il n'est pas dupliqué).
    *   Le backend génère un identifiant unique (ex: `HAD-0001`).
    *   **Notification Email & Telegram** : Un email de confirmation est envoyé au client. Un message récapitulatif est instantanément envoyé au bot Telegram de l'administrateur.
3.  **Confirmation** : L'utilisateur est redirigé vers la page `/confirmation` avec la possibilité d'imprimer son ticket récapitulatif.

### 3.3 La Boutique (Hadara Store)
*   **Consultation** : Les utilisateurs accèdent au catalogue des produits (Accessoires informatiques, impression, etc.).
*   **Statuts de Stock** : Les produits affichent leur disponibilité (ex: *Sur Commande (24-48h)*, *En Stock*).
*   **Achat** : L'achat s'effectue via le bouton "Commander sur WhatsApp" qui génère un message pré-rempli redirigeant vers le numéro `+221 77 623 27 41`.

### 3.4 Le Portail Client (`/espace-client`)
*   **Suivi de projet** : Le client peut y accéder avec un Code d'Accès ou son numéro de téléphone. Il peut alors consulter les détails de son brief (Statut, Devis estimatif FCFA, Notes du designer).
*   **Téléchargement du Devis PDF** : Le client dispose d'un bouton pour générer et télécharger automatiquement son devis/facture au format PDF.
*   **Validation des Livrables** : Le client peut valider ou demander des révisions sur les versions HD livrées par le graphiste.

---

## 4. Espace Administrateur (Django Jazzmin)

L'administration backend (accessible via `/api/django-admin/`) a été totalement refondue en utilisant le thème SaaS premium **Django Jazzmin**.

### 4.1 Interface & Ergonomie (SaaS Mode)
*   **Thème Sombre Intégré** : L'interface utilise le mode *Darkly* avec des accents *Ambre/Or* pour respecter l'identité de marque Hadara.
*   **Menu Latéral & Icônes** : Navigation fluide avec des icônes FontAwesome spécifiques à chaque modèle (Briefs, Portfolio, Store, Users).

### 4.2 Gestion des Données
*   **Gestion des Briefs** : L'administrateur peut visualiser tous les briefs clients, modifier leur statut, et définir le prix devisé (qui se mettra à jour en temps réel sur l'espace client).
*   **Boutique (Hadara Store)** : Gestion complète (Ajout/Modification/Suppression) des produits, prix et statuts de stock.
*   **Portfolio** : Mise à jour de la vitrine avec la possibilité d'uploader des images de présentation.

### 4.3 Analyse IA Intégrée (Hadara AI)
*   L'application intègre **Gemini 2.5 Pro/Flash** pour analyser les briefs soumis.
*   L'IA génère automatiquement un brouillon de devis, une estimation de budget, et 3 propositions de concepts créatifs originaux pour inspirer le graphiste.

---

## 5. Système de Notifications et Devis PDF

Afin d'offrir une expérience utilisateur irréprochable digne d'une plateforme SaaS professionnelle, le système est doté d'outils d'automatisation.

### 5.1 Génération Automatique de Devis (PDF)
*   La plateforme utilise la librairie `reportlab` pour générer des PDF à la volée.
*   Le PDF inclut le logo Hadara, le résumé détaillé du besoin client, et la tarification chiffrée.
*   Les fichiers PDF ne sont pas stockés sur le serveur pour économiser l'espace, ils sont générés dynamiquement via la route API `/api/briefs/<id>/download_pdf/`.

### 5.2 Emails Transactionnels
*   Le système est connecté à un relais SMTP Gmail (`mrniass@gmail.com`).
*   **Création de projet** : Email de confirmation de réception avec un lien d'accès à l'espace client.
*   **Changement d'état** : Dès que l'administrateur passe un projet en statut "Devis Envoyé" ou "Terminé" via le panel Django, un email HTML charté est automatiquement expédié au client pour l'informer de l'avancement.
