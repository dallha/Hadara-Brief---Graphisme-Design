# Hadara Suite
## Plateforme SaaS de gestion et d'orchestration de projets créatifs
**Documentation officielle**

---
**Version :** 2.3.0  
**Date :** 8 Août 2026  
**Auteur :** El Hadji Abdoulaye Mouhamed Lamine Niass  
*Graphiste de la Hadara*  

---

> [!WARNING]
> **Clause de Stricte Réalité** : Toute la documentation est générée exclusivement à partir du code actuellement présent dans le dépôt. Aucune fonctionnalité n'est documentée si elle n'est pas réellement implémentée.

---

## Sommaire Global

1. **[Manuel Utilisateur & Administrateur](./01_MANUEL_UTILISATEUR.md)** — Utilisation, Espace Client, Dashboard, Boutique, Suite des 12 Outils Gratuits, Mme Niass Madina, FAQ
2. **[Documentation Métier](./02_DOCUMENTATION_METIER.md)** — Cycle de vie d'un projet, Workflow Client & Store, Suivi de facturation
3. **[Charte Graphique](./03_CHARTE_GRAPHIQUE.md)** — Couleurs, Typographies, Univers Hadara
4. **[Guide Développeur & Architecture](./04_GUIDE_DEVELOPPEUR.md)** — Stack, Conventions, Modèles, API, Neon PostgreSQL, Mécanismes
5. **[Déploiement & Dépannage](./05_GUIDE_DEPLOIEMENT_DEPANNAGE.md)** — Render, Neon PostgreSQL, CI/CD, Variables d'environnement

---

## Historique des versions

| Version | Date | Modifications |
|---------|------|---------------|
| **1.0.0** | Juillet 2026 | Première version (Portfolio, Brief Form) |
| **1.1.0** | Juillet 2026 | Ajout de l'intégration IA Gemini |
| **1.2.0** | Juillet 2026 | Ajout du Hadara Manager (Kanban, Résumé PDF) |
| **2.0.0** | Août 2026 | Ajout du Hadara Store, Synchronisation PostgreSQL & Mode Offline |
| **2.1.0** | 8 Août 2026 | Mme Niass Madina (IA Chat Groq/Llama), Refonte Mobile-First globale, Générateur de Factures, Outils Gratuits |
| **2.2.0** | **8 Août 2026** | **Expansion Hub d'Outils (Couleurs, Mockups, Filigrane, Compresseur, Minuterie, Devis)** |
| **2.3.0** | **8 Août 2026** | **Migration Neon PostgreSQL Serverless, Nouveau Générateur Nuage de Mots, Agrandisseur HD 2x/4x (style Upscayl), Intégration Outils & ToolUsageLog dans Django Jazzmin Admin** |

---

## Nouvelles fonctionnalités v2.3.0

### 🐘 Migration Neon PostgreSQL (Serverless Source de Vérité)
- Remplacement du stockage temporaire Render DB par **Neon PostgreSQL** (`ep-falling-sunset-axfvhryv-pooler`).
- Support natif du SSL avec pooling de connexions.
- Persistance totale des Briefs (`HAD-XXXX`), Produits Store (`PRD-XXXX`), Portfolio (`PRT-XXXX`) et Logs d'utilisation.

### 🧰 Hub Complet des 12 Outils Gratuits (`/outils`)
1. **Agrandisseur HD 2x/4x** (`/outils/upscale`) : Augmentation de résolution et filtre de netteté Unsharp Mask inspiré de *Upscayl*.
2. **Générateur Nuage de Mots** (`/outils/nuage-mots`) : Algorithme de Spirale d'Archimède, stop-words multi-langues, 4 styles de fond (Sombre, Blanc-Couleur, Blanc-Noir, Transparent).
3. **Extracteur de Couleurs** (`/outils/couleurs`) : Extraction des 6 couleurs dominantes HEX/RGB via Canvas.
4. **Générateur de Mockups Device** (`/outils/mockup`) : Encadrement sur iPhone 15 Pro, MacBook Air et Navigateur Web.
5. **Ajout de Filigrane** (`/outils/filigrane`) : Protection visuelle avec nom/logo personnalisé et grille.
6. **Compresseur d'Images** (`/outils/compresseur`) : Réduction de poids JPG, PNG, WebP avec aperçu avant/après.
7. **Minuterie de Facturation** (`/outils/minuterie`) : Chronomètre horaire (FCFA/h) avec historique des sessions.
8. **Calculateur de Devis** (`/outils/devis`) : Estimation budgétaire instantanée selon révisions et délais.
9. **Générateur de Factures** (`/outils/facture`) : Export PDF propre via fenêtre dédiée.
10. **Détourage IA** (`/outils/detourage`) : Suppression d'arrière-plan 100% locale.
11. **Générateur QR Code** (`/outils/qr-code`) : QR codes personnalisés avec logo Hadara.
12. **Extracteur OCR** (`/outils/ocr`) : OCR Arabe & Français connecté à l'API IA backend.

### ⚙️ Intégration Django Jazzmin Admin
- **Section "Outils Gratuits"** ajoutée dans le menu latéral avec raccourcis directs.
- **Nouveau modèle `ToolUsageLog`** : Enregistrement et suivi de la fréquence d'utilisation de la suite d'outils.

---

## Licence

Copyright © 2026 **MrNiass / Hadara Suite**  
Tous droits réservés.
