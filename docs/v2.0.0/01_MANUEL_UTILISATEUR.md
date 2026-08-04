# Hadara Suite
## Plateforme SaaS de gestion et d'orchestration de projets créatifs

**Documentation officielle**  

| Attribut | Valeur |
| :--- | :--- |
| **Version** | 2.0.0 |
| **Statut** | Production / Stable |
| **Date** | Août 2026 |
| **Auteur** | El Hadji Abdoulaye Mouhamed Lamine Niass (Graphiste de la Hadara) |

---

## 📖 Sommaire
1. [Présentation](#1-présentation)
2. [Philosophie Hadara](#2-philosophie-hadara)
3. [Les Modules](#3-les-modules)
4. [Espace Client (Utilisateur Final)](#4-espace-client-utilisateur-final)
5. [Espace Administrateur (Django Jazzmin)](#5-espace-administrateur-django-jazzmin)
6. [Système de Notifications et Devis PDF](#6-système-de-notifications-et-devis-pdf)
7. [Limites Actuelles](#7-limites-actuelles)
8. [Conventions](#8-conventions)
9. [Foire Aux Questions (FAQ)](#9-foire-aux-questions-faq)
10. [Glossaire](#10-glossaire)

---

## 1. Présentation

### Qu'est-ce que Hadara Suite ?
Hadara Suite est une plateforme logicielle intégrée (SaaS) combinant un ERP (Enterprise Resource Planning), un CRM (Customer Relationship Management) et un copilote IA. Elle orchestre l'ensemble du cycle de vie d'un projet graphique, du premier contact client jusqu'à la livraison finale.

### Pour qui ?
Ce logiciel est conçu sur-mesure pour :
- Le **Graphiste Indépendant** (ou Studio Créatif) souhaitant centraliser sa gestion.
- Les **Clients** désirant un suivi transparent et professionnel de leurs commandes.

### Pourquoi ?
Avant Hadara Suite, la gestion s'éparpillait entre WhatsApp (discussions), Excel (devis), et dossiers locaux (fichiers). Hadara Suite centralise, automatise, et professionnalise cette relation.

---

## 2. Philosophie Hadara

Hadara Suite est née d'un besoin concret : permettre à un graphiste indépendant de gérer l'ensemble de son activité depuis une seule plateforme, du premier contact jusqu'à la livraison finale.

Les principes du projet :
- **Simplicité** : Une interface épurée qui va à l'essentiel.
- **Transparence** : Le client sait exactement où en est son projet.
- **Automatisation** : Moins de temps passé sur l'administratif, plus de temps pour la création.
- **Qualité** : Des livrables irréprochables validés étape par étape.
- **Créativité assistée par IA** : Des concepts repoussant le syndrome de la page blanche.
- **Validation humaine** : L'IA propose, le graphiste dispose. L'humain reste au centre de l'art.

---

## 3. Les Modules

L'architecture s'articule autour de 4 piliers fonctionnels :

### Hadara Suite
├── **Hadara Studio** *(Vitrine publique, Portfolio, CV interactif)*
├── **Hadara Store** *(Boutique e-commerce d'outils et accessoires)*
├── **Hadara Manager** *(Backend d'administration Django Jazzmin & CRM)*
└── **Hadara AI** *(Moteur d'intelligence artificielle Gemini pour l'assistance créative)*

---

## 4. Espace Client (Utilisateur Final)

### 4.1 Navigation & Découverte
*   **Écran d'Accueil (Splash Screen)** : Lors de la première visite, un écran de chargement affiche le slogan *"L'art de donner vie à vos idées"*.
*   **Portfolio** : Les utilisateurs consultent les projets filtrables. Un clic sur "Je veux ce style !" présélectionne l'esthétique dans le brief.
*   **Curriculum Vitae** : Présentation des compétences sous forme de notation 5 étoiles et badges professionnels.

![Accueil Hadara Studio](/public/images/docs/accueil.png)
*(Aperçu de la Landing Page)*

![Portfolio Hadara](/public/images/docs/portfolio.png)
*(Aperçu de la vue Portfolio)*

### 4.2 Création de Projet (Le Brief Intelligent)
1.  **Formulaire Multi-étapes** : L'utilisateur remplit un formulaire détaillé structurant sa demande.
2.  **Soumission** : Vérification d'idempotence anti-doublon (5 min). Génération d'ID unique. Notification Telegram à l'admin et Email de confirmation au client.
3.  **Confirmation** : Redirection vers le ticket récapitulatif.

![Formulaire de Brief](/public/images/docs/brief.png)
*(Aperçu du Formulaire Intelligent)*

### 4.3 La Boutique (Hadara Store)
*   **Consultation** : Accès au catalogue (accessoires, templates).
*   **Statuts de Stock** : Affichage dynamique (*Sur Commande (24-48h)*, *En Stock*).
*   **Achat** : Bouton "Commander sur WhatsApp" générant un message pré-rempli.

![Boutique Hadara](/public/images/docs/boutique.png)
*(Aperçu de la Boutique)*

### 4.4 Le Portail Client (`/espace-client`)
*   **Suivi de projet** : Le client consulte le statut, les notes et télécharge son Devis PDF via son numéro de téléphone ou Code d'Accès.

![Portail Client](/public/images/docs/portail_client.png)
*(Aperçu du Portail Client)*

---

## 5. Espace Administrateur (Django Jazzmin)

L'administration backend (`/api/django-admin/`) a été totalement refondue avec **Django Jazzmin**.

### 5.1 Interface & Ergonomie (SaaS Mode)
*   **Thème Sombre** : Mode *Darkly* avec accents *Ambre/Or*.
*   **Menu Latéral** : Navigation fluide avec icônes spécifiques.

![Interface Jazzmin](/public/images/docs/jazzmin.png)
*(Aperçu du Backend Django Jazzmin)*

### 5.2 Gestion des Données
*   **Briefs** : Visualisation, modification des statuts, définition des prix.
*   **Boutique** : Ajout/Modification/Suppression de produits et gestion des stocks.

### 5.3 Analyse IA Intégrée (Hadara AI)
*   Intégration de **Gemini 2.5 Pro/Flash** pour l'analyse de brief.
*   Génération de devis, budget, et 3 concepts créatifs originaux.

![Analyse IA](/public/images/docs/ia.png)
*(Aperçu du rapport IA)*

---

## 6. Système de Notifications et Devis PDF

### 6.1 Génération PDF
*   Génération en mémoire vive via `reportlab` (adapté au cloud éphémère).
*   Inclus : Logo, résumé du besoin, tarification chiffrée.

### 6.2 Emails Transactionnels
*   Connexion SMTP sécurisée.
*   Envoi automatisé lors du changement de statut (Devis Envoyé, En Création, Terminé).

---

## 7. Limites Actuelles

Dans une démarche de transparence totale, voici les limitations techniques de la version actuelle :
*   Pas encore de paiement automatique intégré (ex: API Wave / Stripe).
*   Pas encore de notifications WhatsApp Business natives (utilisation de Telegram pour l'admin et Email pour le client).
*   Pas encore de système multi-utilisateurs complexes (plusieurs designers).
*   Pas encore d'application mobile native iOS/Android (la PWA fait office d'app).

---

## 8. Conventions

L'application respecte une nomenclature stricte pour garantir la traçabilité des enregistrements dans la base de données.

| Type d'Entité | Préfixe ID | Exemple |
| :--- | :--- | :--- |
| **Brief (Commande)** | `HAD-` | `HAD-00001` |
| **Produit (Store)** | `PRD-` | `PRD-00001` |
| **Portfolio (Projet)** | `PRT-` | `PRT-00001` |

---

## 9. Foire Aux Questions (FAQ)

**Je ne retrouve plus mon projet.**
> Vérifiez le numéro de téléphone utilisé lors de la commande ou votre code d'accès à 6 lettres. Assurez-vous d'être connecté sur la page `/espace-client`.

**Je n'ai pas reçu le mail.**
> Les emails de confirmation peuvent parfois glisser dans le dossier "Spam" ou "Promotions" de votre boîte de réception Gmail.

**Mon devis n'apparaît pas.**
> Le bouton "Télécharger le Devis PDF" s'affiche uniquement lorsque le designer a officiellement chiffré la prestation et changé le statut en "Devis Envoyé".

**Comment modifier un brief ?**
> Côté client, un brief soumis est définitif pour garantir l'intégrité de la commande. Contactez le designer via WhatsApp pour toute modification. L'administrateur, lui, peut tout éditer depuis le panel Django Jazzmin.

**Où retrouver mes livrables ?**
> Une fois le statut passé à "Terminé", les fichiers finaux (Haute Définition) vous seront transmis via un lien sécurisé (WeTransfer/Google Drive) affiché dans votre espace client.

---

## 10. Glossaire

*   **Brief** : Document structurant la demande initiale du client (contexte, cible, formats).
*   **Portfolio** : Vitrine des réalisations artistiques passées servant de référence.
*   **Store** : Espace boutique e-commerce de Hadara Suite.
*   **CRM (Customer Relationship Management)** : Outil de gestion de la relation client.
*   **ERP (Enterprise Resource Planning)** : Outil centralisant tous les processus d'affaires (production, finance).
*   **PWA (Progressive Web App)** : Technologie permettant d'installer le site web comme une application mobile.
*   **Kanban** : Méthode visuelle de gestion de projet avec des colonnes de statuts (À faire, En cours, Terminé).
*   **Gemini** : Modèle d'intelligence artificielle de Google propulsant Hadara AI.
*   **Template** : Modèle pré-rempli (style visuel, format) pour accélérer une commande.
*   **Lead** : Un client potentiel ayant soumis un brief mais n'ayant pas encore validé le devis.
*   **Livrable HD** : Fichier graphique finalisé en Haute Définition (prêt pour impression ou web).
