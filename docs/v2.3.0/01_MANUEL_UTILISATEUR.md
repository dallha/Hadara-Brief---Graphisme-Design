# HADARA SUITE v2.3.0 — Manuel Utilisateur & Guide du Cockpit Manager 📱

Ce guide explique le fonctionnement quotidien de **Hadara Manager** (`/api/django-admin/`) et du **Portail Client** pour le designer et l'administrateur du studio.

---

## 🏠 1. Hadara Manager : Cockpit de Production

Le cockpit d'administration (`/api/django-admin/`) est l'outil central de suivi et de gestion du studio.

### Tableau de Bord (Dashboard)
- **KPI 1 : Briefs en attente** (Compteur de commandes à traiter).
- **KPI 2 : Chiffre d'Affaires Cumulé** (Montant FCFA formaté avec séparateurs de milliers).
- **KPI 3 : Produits Boutique Actifs**.
- **Tableau "🔥 À traiter maintenant"** : Accès direct aux briefs les plus récents.

---

## 📋 2. Saisie Ultra-Rapide (3 à 4 Champs Obligatoires Max)

### 1. Ajouter un Brief Client
- **Obligatoires** : Nom du client, WhatsApp, Type de projet.
- **Auto-générés** : `id` (`HAD-0001`), date de création.
- **Section repliée `collapse`** : Styles, spécifications techniques, budget et pièces jointes.

### 2. Ajouter un Projet Portfolio
- **Obligatoires** : Titre du projet, Catégorie, Image.
- **Auto-générés** : `id` (`PRT-0001`), Couleur d'accent par défaut (`#816C07`).
- **Section repliée `collapse`** : Description, badges, livrables inclus (formatés en Hadara Chips).

### 3. Ajouter un Produit Boutique
- **Obligatoires** : Nom du produit, Catégorie, Statut Stock (`En stock`, `Sur commande`, etc.).
- **Auto-générés** : `id` (`PRD-0001`), horodatages `created_at` et `updated_at`.
- **Section repliée `collapse`** : Marque, description, image, prix FCFA.

---

## 📷 3. Upload & Compression Mobile d'Images

- Sur mobile (iPhone / Android), cliquer sur `📷 Ajouter une image` ouvre les options d'origine :
  - 📷 **Appareil photo** (Prise de vue directe)
  - 🖼️ **Photos** (Galerie)
  - 📁 **Fichiers**
- **Compression WebP automatique** : Le navigateur optimise l'image sous 500 Ko pour le web et affiche la miniature `✓ Image optimisée`.
- **Fallback d'image sans icône cassée `?`** : Si une URL d'image est invalide, elle est remplacée automatiquement par un badge propre `🖼️ Sans image`.

---

## 📱 4. Portail Client & Suivi de Projet

- **Connexion Client** : Authentification fluide par numéro WhatsApp.
- **Suivi Workflow 6 Étapes** : *Brief Reçu ➔ Devis Transmis ➔ Acompte Validé (50%) ➔ En Création ➔ Révision Client ➔ Livraison HD*.
- **Prévisualisation Maquette Fluidifiée (`previewUrl`)** :
  - Image WebP légère affichée instantanément.
  - Bouton **`ZoomIn`** (Lightbox plein écran pour agrandir le projet).
  - Historique non destructif des versions (**V1, V2, V3**).
  - Validation ou demande de retours en un clic.
