# 🎨 Graphiste de la Hadara — Plateforme de Brief Créatif & Gestion de Projets

Une application web complète conçue spécialement pour le **Graphiste de la Hadara** (Dakar, Sénégal). Elle permet de collecter les briefs créatifs des clients pour la conception d'affiches, bâches grand format, banderoles, flyers et identités visuelles pour événements religieux, cérémonies (Gamou, Magal, Ziarra), dahiras et complexes, puis de livrer les fichiers HD prêts pour l'impression.

---

## 📌 1. Vue d'Ensemble & Concept

Cette application résout le défi de la collecte d'informations imprécises ou incomplètes lors de la création de visuels graphiques. 

- **Pour le Client** : Un parcours guidé en étapes pour définir avec précision son projet (titre principal, textes secondaires, thématiques islamiques, dimensions, budget en FCFA et échéances).
- **Pour le Graphiste** : Un tableau de bord centralisé pour analyser les briefs, ajuster les devis, générer des réponses WhatsApp pré-formatées et utiliser un **Assistant IA Directeur Artistique** alimenté par Gemini.

> ⚠️ **Clarification importante sur le livrable** : Le studio assure la **conception graphique sur mesure** et livre les **fichiers numériques HD prêts à imprimer** (PDF Haute Définition CMJN, PNG sans fond, vectoriel). L'impression physique est réalisée par le client auprès de l'imprimeur de son choix.

---

## 🚀 2. Fonctionnalités Clés

### 📱 A. Navigation Ergonomique (Menu Fixe en Bas)
- Positionné en `fixed bottom-0 left-0 right-0 z-50` pour une accessibilité mobile optimale.
- 4 onglets principaux :
  1. **Accueil** : Présentation du studio et du processus de création.
  2. **Portfolio** : Galerie de réalisations avec modèles indicatifs.
  3. **Créer Brief** (Bouton central en surbrillance) : Formulaire guidé pas-à-pas.
  4. **Graphiste** : Tableau de bord d'administration des briefs clients.

### 📝 B. Formulaire de Brief Express (5 Étapes Fluides)
- **Étape 1 : Contact Client** (Coordonnées, Dahira, WhatsApp, Ville/Pays).
- **Étape 2 : Choix du Projet** (Affiche, Bâche grand format, Flyer, Pack Event, Contexte).
- **Étape 3 : Titre & Contenu** (Titre principal en grandes lettres, textes complets à imprimer, publics cibles).
- **Étape 4 : Style & Fichiers** (Ambiance visuelle, palette de couleurs, téléversement des logos & photos).
- **Étape 5 : Devis & Validation** (Format technique, demande de devis FCFA, délai de livraison & validation).

### 💬 C. Intégration WhatsApp Instantanée
- À la validation du brief, un bouton dédié génère automatiquement un lien WhatsApp (`wa.me`) pré-rempli avec la synthèse complète du dossier pour un échange immédiat avec le graphiste.

### 🤖 D. Assistant IA Directeur Artistique (Gemini)
- Analyse automatique de la cohérence du brief.
- Génération d'une **palette de couleurs recommandée** (codes HEX & dénominations).
- Recommandations typographiques et de mise en page.
- Rédaction d'une **proposition de devis au format WhatsApp** prête à être copiée-collée.

### 📊 E. Tableau de Bord Graphiste & Bibliothèque de Modèles
- **Gestion des Briefs Clients** : Suivi des statuts (*Nouveau Brief*, *Devis Envoyé*, *Acompte Reçu*, *En Création*, *En Validation*, *Terminé / Livré HD*), recherche rapide, édition du tarif devisé en FCFA et impression PDF de fiche brief.
- **Bibliothèque de Modèles Récurrents** : Section dédiée permettant de créer, modifier et stocker des briefs préconfigurés pour les grands événements (Grand Magal, Gamou Annuel, Conférences & Ziarra, Appels aux dons Dahira).
- **Génération Express de Projets** : Création en 1 clic d'un dossier client à partir d'un modèle type pré-rempli, avec compteur d'utilisation automatique.

---

## 🛠️ 3. Architecture Technique

- **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide React (Icônes).
- **Backend API** : Express.js (`server.ts`) avec routes REST `/api/briefs`.
- **IA** : SDK `@google/genai` avec Gemini 2.5 Flash pour l'analyse des briefs.
- **Port** : Binds sur `0.0.0.0:3000`.

---

## 🔄 4. Workflow de Travail (Du Brief à la Livraison)

```
[Client rempli le Brief] ➔ [Génération Référence HADARA-2026-XXX] ➔ [Notification WhatsApp / Admin]
                                                                        │
[Livraison des fichiers HD] ◄─ [Paiement Solde] ◄─ [Validation Visuel] ◄─ [Acompte 50% & Création]
```

1. **Soumission** : Le client remplit le formulaire et envoie le résumé au graphiste par WhatsApp.
2. **Analyse & Devis** : Le graphiste examine le besoin (avec l'aide de l'IA) et valide le tarif en FCFA.
3. **Création** : Dès réception de l'acompte (50%), le travail de conception démarre.
4. **Validation & Livraison HD** : Une fois le visuel validé et le solde réglé, le fichier numérique HD (PDF CMJN 300 DPI, PNG) est transmis au client pour impression chez son imprimeur.

---

## 📄 Licence & Crédits
Développé pour **Graphiste de la Hadara** — Dakar, Sénégal.
