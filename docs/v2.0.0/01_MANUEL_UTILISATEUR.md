# Hadara Suite — Documentation Officielle
## Volume 1 : Manuel Utilisateur

| Attribut | Valeur |
| :--- | :--- |
| **Version** | 2.1.0 |
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
6. [Mme Niass Madina — L'Assistante IA](#6-mme-niass-madina--lassistante-ia)
7. [Outils Publics Gratuits](#7-outils-publics-gratuits)
8. [Application Mobile (PWA)](#8-application-mobile-pwa)
9. [Système de Notifications et Devis PDF](#9-système-de-notifications-et-devis-pdf)
10. [Limites Actuelles](#10-limites-actuelles)
11. [Conventions](#11-conventions)
12. [Foire Aux Questions (FAQ)](#12-foire-aux-questions-faq)
13. [Glossaire](#13-glossaire)

---

## 1. Présentation

### Qu'est-ce que Hadara Suite ?
Hadara Suite est une plateforme logicielle intégrée (SaaS) combinant un ERP, un CRM et un copilote IA. Elle orchestre l'ensemble du cycle de vie d'un projet graphique, du premier contact client jusqu'à la livraison finale, accessible sur **mobile, tablette et ordinateur**.

### Pour qui ?
Ce logiciel est conçu sur-mesure pour :
- Le **Graphiste Indépendant** (ou Studio Créatif) souhaitant centraliser sa gestion.
- Les **Clients** désirant un suivi transparent et professionnel de leurs commandes.
- Les **Visiteurs** qui cherchent des **outils gratuits** (générateur de factures, QR code, détourage IA).

---

## 2. Philosophie Hadara

Hadara Suite est née d'un besoin concret : permettre à un graphiste indépendant de gérer l'ensemble de son activité depuis une seule plateforme, du premier contact jusqu'à la livraison finale.

Les principes du projet :
- **Mobile-First** : L'expérience est conçue pour le smartphone en priorité.
- **Simplicité** : Une interface épurée qui va à l'essentiel.
- **Transparence** : Le client sait exactement où en est son projet.
- **Automatisation** : Moins de temps passé sur l'administratif, plus de temps pour la création.
- **Qualité** : Des livrables irréprochables validés étape par étape.
- **Créativité assistée par IA** : Des concepts repoussant le syndrome de la page blanche.
- **Validation humaine** : L'IA propose, le graphiste dispose. L'humain reste au centre de l'art.

---

## 3. Les Modules

L'architecture s'articule autour de 5 piliers fonctionnels :

```
Hadara Suite
├── Hadara Studio      (Vitrine publique, Portfolio, CV interactif)
├── Hadara Store       (Boutique e-commerce d'outils et accessoires)
├── Hadara Manager     (Backend d'administration Django Jazzmin & CRM)
├── Hadara AI          (Moteur IA Groq/Llama-3.1 — Mme Niass Madina)
└── Hadara Tools       (Outils gratuits publics — Lead Magnet)
```

---

## 4. Espace Client (Utilisateur Final)

### 4.1 Navigation & Découverte
*   **Écran d'Accueil (Splash Screen)** : Lors de la première visite, un écran de chargement affiche le slogan *"L'art de donner vie à vos idées"*.
*   **Portfolio** : Les utilisateurs consultent les projets filtrables. Un clic sur "Je veux ce style !" présélectionne l'esthétique dans le brief.
*   **Curriculum Vitae** : Présentation des compétences sous forme de notation 5 étoiles et badges professionnels. Mode ATS (imprimable) disponible.

### 4.2 Création de Projet (Le Brief Intelligent)
1.  **Formulaire Multi-étapes** : L'utilisateur remplit un formulaire détaillé en 5 étapes structurant sa demande. Sur mobile, les étapes défilent horizontalement.
2.  **Soumission** : Vérification d'idempotence anti-doublon (5 min). Génération d'ID unique. Notification Telegram à l'admin et Email de confirmation au client.
3.  **Confirmation** : Redirection vers le ticket récapitulatif.

### 4.3 La Boutique (Hadara Store)
*   **Consultation** : Accès au catalogue (accessoires, templates).
*   **Statuts de Stock** : Affichage dynamique (*Sur Commande (24-48h)*, *En Stock*).
*   **Achat** : Bouton "Commander sur WhatsApp" générant un message pré-rempli.

### 4.4 Le Portail Client (`/espace-client`)
*   **Suivi de projet** : Le client consulte le statut, les notes et télécharge son Devis PDF via son numéro de téléphone WhatsApp.
*   **Avancement** : Timeline visuelle à 6 étapes (Brief Reçu → Devis → Acompte → En Création → Validation → Livré).
*   **Maquettes HD** : Les livrables publiés par le graphiste sont visibles directement dans le portail avec aperçu plein écran.

---

## 5. Espace Administrateur (Double Interface)

La gestion des projets est scindée en deux interfaces pour une ergonomie optimale :

### 5.1 Le Tableau de Bord Public (Vue Kanban)
Accessible depuis le frontend (`/admin`) :
*   **Kanban Swipeable** : Sur mobile, les colonnes du Kanban (Nouveau, Devis Envoyé, En Création...) sont défilables horizontalement par glissement du doigt.
*   **Fiche 360°** : En cliquant sur "Afficher Fiche 360°", l'administrateur consulte toutes les informations d'un brief. **Aucune modification n'est effectuée depuis cette interface.**
*   **Recherche** : Filtrage instantané par nom, ID ou titre de projet.

### 5.2 Le Backend Django Jazzmin (Gestion Avancée)
Toutes les actions de gestion se font **exclusivement** sur `/api/django-admin/` :
*   **Modification Fluide** : Les champs descriptifs ont été rendus optionnels côté Admin.
*   **Actions Rapides** : Menu déroulant "Actions" pour changer le statut de plusieurs briefs en un clic.
*   **Analyse IA Intégrée** : Génération automatique d'analyse de brief par IA.
*   **Gestion de la Boutique** : Ajout/Modification/Suppression de produits.

---

## 6. Mme Niass Madina — L'Assistante IA

**Mme Niass Madina** est l'assistante virtuelle intégrée à la plateforme. Elle est disponible sur toutes les pages via le widget de chat flottant.

### 6.1 Présentation
*   **Nom** : Mme Niass Madina
*   **Rôle** : Assistante IA de Hadara Studio
*   **Moteur** : Groq API — Modèle `llama-3.1-8b-instant`
*   **Hébergement** : Backend Django (endpoint `/api/chat/`)
*   **Philosophie** : "Caveman AI" — réponses directes, claires, sans fioritures

### 6.2 Fonctionnement
1.  Le visiteur clique sur le widget en bas à droite de l'écran.
2.  Il saisit sa question dans la boîte de chat.
3.  Le message est envoyé au backend Django, qui le transmet au modèle Llama via l'API Groq.
4.  La réponse est affichée en temps réel dans la fenêtre de chat.

### 6.3 Ce que Mme Niass Madina sait faire
*   Répondre aux questions sur les services de Hadara Studio.
*   Guider un visiteur vers le formulaire de brief.
*   Expliquer les tarifs et délais approximatifs.
*   Aider à choisir le bon type de prestation.

### 6.4 Positionnement sur l'écran
*   **Ordinateur** : Widget ancré en bas à droite de l'écran.
*   **Mobile (PWA)** : Widget positionné **au-dessus de la barre de navigation** pour ne pas être masqué.

> [!NOTE]
> Mme Niass Madina ne peut pas accéder aux commandes ou aux données privées des clients. Pour le suivi de votre projet, utilisez l'Espace Client (`/espace-client`).

---

## 7. Outils Publics Gratuits

Hadara Studio propose une suite d'outils gratuits accessibles sans inscription sur `/outils`. Leur objectif est d'attirer des visiteurs et de les convertir en clients (stratégie **Lead Magnet**).

### 7.1 Navigation entre les Outils
Une barre de navigation (`ToolsNav`) est présente en haut de chaque outil. Sur mobile, elle défile horizontalement si les boutons ne tiennent pas en largeur.

### 7.2 Détourage d'Image IA (`/outils/detourage`)
*   Supprime l'arrière-plan d'une image directement dans le navigateur.
*   **100% privé** : Aucune image n'est envoyée sur un serveur.
*   Propulsé par le modèle IA `@imgly/background-removal`.
*   **Téléchargement** : Image résultante en PNG transparent.

### 7.3 Générateur de QR Code (`/outils/qr-code`)
*   Génère un QR code personnalisé à partir de n'importe quelle URL.
*   Choix de couleurs (Classique, Hadara Or, Bleu Nuit, Émeraude).
*   Option logo Hadara intégré au centre.
*   **Téléchargement** : Export en PNG haute qualité.

### 7.4 Extracteur de Texte OCR (`/outils/ocr`)
*   Extrait le texte d'une image ou d'un document.
*   Supporte l'**arabe** et le français.
*   Propulsé par `Tesseract.js` avec les langues `ara` + `fra`.
*   Fonctionne entièrement dans le navigateur (hors-ligne possible).

> [!NOTE]
> L'OCR arabe nécessite une image de bonne qualité (haute résolution, texte net). Des imperfections peuvent apparaître sur les images de mauvaise qualité.

### 7.5 Générateur de Factures (`/outils/facture`)
*   Créez une facture professionnelle directement dans le navigateur.
*   **Champs disponibles** : Nom/Entreprise, adresse, téléphone, client, lignes d'articles (description, quantité, prix unitaire), devise, TVA.
*   **Calculs automatiques** : Sous-total, TVA, Total TTC calculés en temps réel.
*   **Impression/Export PDF** : Ouvre une nouvelle fenêtre contenant uniquement la facture (fond blanc, format A4, une seule page) et lance l'impression automatiquement.
*   **Mobile** : Le tableau des lignes défile horizontalement sur les petits écrans.

> [!IMPORTANT]
> L'export PDF s'effectue via une nouvelle fenêtre du navigateur. Si votre navigateur bloque les pop-ups, autorisez-les pour le site Hadara Studio.

---

## 8. Application Mobile (PWA)

Hadara Suite est installable comme une application native sur iPhone et Android.

### 8.1 Installation sur iPhone (iOS)
1.  Ouvrez le site dans **Safari**.
2.  Appuyez sur le bouton **Partager** (carré avec flèche vers le haut).
3.  Sélectionnez **"Sur l'écran d'accueil"**.
4.  Validez avec **"Ajouter"**.

> [!IMPORTANT]
> Après chaque mise à jour majeure du site, supprimez l'application de votre écran d'accueil et réinstallez-la pour bénéficier de la dernière version.

### 8.2 Installation sur Android
1.  Ouvrez le site dans **Chrome**.
2.  Appuyez sur les **3 points** en haut à droite.
3.  Sélectionnez **"Ajouter à l'écran d'accueil"**.

### 8.3 Expérience Mobile-First
L'application est conçue **Mobile-First** :
*   Toutes les pages s'adaptent aux petits écrans (375px à 430px).
*   La barre de navigation est optimisée pour les pouces.
*   Le Kanban admin est swipeable horizontalement.
*   Les tableaux longs (factures) défilent horizontalement.
*   La barre de status iOS est gérée (`viewport-fit=cover`, `apple-mobile-web-app-capable`).

---

## 9. Système de Notifications et Devis PDF

### 9.1 Génération PDF (Backend)
*   Génération en mémoire vive via `reportlab` (adapté au cloud éphémère Render).
*   Inclut : Logo, résumé du besoin, tarification chiffrée.
*   Accessible dans le portail client via le bouton "Télécharger le Devis PDF".

### 9.2 Génération PDF (Facture Frontend)
*   Le générateur de factures ouvre une **nouvelle fenêtre** contenant le HTML de la facture.
*   Le navigateur imprime uniquement cette fenêtre (fond blanc garanti, une seule page A4).
*   Aucune donnée n'est envoyée sur un serveur.

### 9.3 Emails Transactionnels
*   Connexion SMTP sécurisée.
*   Envoi automatisé lors du changement de statut.

---

## 10. Limites Actuelles

Dans une démarche de transparence totale :
*   Pas encore de paiement automatique intégré (API Wave / Stripe).
*   Pas encore de notifications WhatsApp Business natives.
*   Pas encore de système multi-utilisateurs (plusieurs designers).
*   L'OCR arabe peut présenter des imperfections sur images de faible qualité.

---

## 11. Conventions

| Type d'Entité | Préfixe ID | Exemple |
| :--- | :--- | :--- |
| **Brief (Commande)** | `HAD-` | `HAD-00001` |
| **Produit (Store)** | `PRD-` | `PRD-00001` |
| **Portfolio (Projet)** | `PRT-` | `PRT-00001` |

---

## 12. Foire Aux Questions (FAQ)

**Je ne retrouve plus mon projet.**
> Vérifiez le numéro de téléphone WhatsApp utilisé lors de la commande. Assurez-vous d'être sur la page `/espace-client`.

**Je n'ai pas reçu le mail.**
> Vérifiez le dossier "Spam" ou "Promotions" de votre boîte email.

**L'export PDF de la facture ouvre une page blanche ou rien ne se passe.**
> Votre navigateur bloque probablement les pop-ups. Autorisez les pop-ups pour le site Hadara Studio dans les paramètres de votre navigateur.

**Mon devis n'apparaît pas.**
> Le bouton "Télécharger le Devis PDF" s'affiche uniquement lorsque le designer a chiffré la prestation et changé le statut en "Devis Envoyé".

**Comment contacter Mme Niass Madina ?**
> Cliquez sur le widget de chat flottant en bas à droite de n'importe quelle page.

**Comment modifier un brief ?**
> Côté client, un brief soumis est définitif. Contactez le designer via WhatsApp pour toute modification.

**L'application mobile n'est pas à jour.**
> Supprimez l'application de votre écran d'accueil, videz le cache de Safari/Chrome, et réinstallez l'application depuis le site.

---

## 13. Glossaire

*   **Brief** : Document structurant la demande initiale du client.
*   **Portfolio** : Vitrine des réalisations artistiques passées.
*   **Store** : Espace boutique e-commerce de Hadara Suite.
*   **CRM** : Outil de gestion de la relation client.
*   **ERP** : Outil centralisant tous les processus d'affaires.
*   **PWA** : Progressive Web App — site installable comme une application mobile.
*   **Kanban** : Méthode visuelle de gestion de projet avec colonnes de statuts.
*   **Groq** : Service d'inférence IA ultra-rapide hébergeant le modèle Llama.
*   **Llama** : Modèle de langage open-source de Meta utilisé par Mme Niass Madina.
*   **OCR** : Optical Character Recognition — extraction de texte depuis une image.
*   **Lead Magnet** : Outil gratuit offert pour attirer des clients potentiels.
*   **Mobile-First** : Approche de design qui priorise l'expérience sur smartphone.
*   **Livrable HD** : Fichier graphique finalisé en Haute Définition.
