# Hadara Suite
## Plateforme SaaS de gestion et d'orchestration de projets créatifs
**Documentation officielle**

---
**Version :** 2.1.0
**Date :** 8 Août 2026
**Auteur :** El Hadji Abdoulaye Mouhamed Lamine Niass
*Graphiste de la Hadara*

---

> [!WARNING]
> **Clause de Stricte Réalité** : Toute la documentation est générée exclusivement à partir du code actuellement présent dans le dépôt. Aucune fonctionnalité n'est documentée si elle n'est pas réellement implémentée.

## Sommaire Global

1. **[Manuel Utilisateur & Administrateur](./01_MANUEL_UTILISATEUR.md)** — Utilisation, Espace Client, Dashboard, Boutique, Outils Gratuits, Mme Niass Madina, FAQ
2. **[Documentation Métier](./02_DOCUMENTATION_METIER.md)** — Cycle de vie d'un projet, Workflow Client
3. **[Charte Graphique](./03_CHARTE_GRAPHIQUE.md)** — Couleurs, Typographies, Univers Hadara
4. **[Guide Développeur & Architecture](./04_GUIDE_DEVELOPPEUR.md)** — Stack, Conventions, Modèles, API, Mécanismes
5. **[Déploiement & Dépannage](./05_GUIDE_DEPLOIEMENT_DEPANNAGE.md)** — Render, CI/CD, Variables d'environnement

---

## Historique des versions

| Version | Date | Modifications |
|---------|------|---------------|
| **1.0.0** | Juillet 2026 | Première version (Portfolio, Brief Form) |
| **1.1.0** | Juillet 2026 | Ajout de l'intégration IA Gemini |
| **1.2.0** | Juillet 2026 | Ajout du Hadara Manager (Kanban, Résumé PDF) |
| **2.0.0** | Août 2026 | Ajout du Hadara Store, Synchronisation PostgreSQL & Mode Offline |
| **2.1.0** | **8 Août 2026** | **Mme Niass Madina (IA Chat Groq/Llama), Refonte Mobile-First globale, Générateur de Factures, Outils Gratuits (Détourage, QR Code, OCR arabe), Correction PDF impression** |

---

## Nouvelles fonctionnalités v2.1.0

### 🤖 Mme Niass Madina — Assistante IA
- Remplacement du widget WhatsApp statique par un **vrai chat IA**.
- Moteur : API **Groq** + modèle **Llama-3.1-8b-instant** (gratuit, ultra-rapide).
- Endpoint backend : `POST /api/chat/`.
- Widget flottant sur toutes les pages, position ajustée pour le mobile (au-dessus de la barre de nav).

### 📱 Refonte Mobile-First Globale
- Approche **Mobile-First** sur l'intégralité de la plateforme.
- Kanban admin : swipeable horizontalement sur mobile (`snap-x`).
- BriefForm : étapes en défilement horizontal sur petits écrans.
- ToolsNav : défilement horizontal sur mobile.
- Facture : tableau scrollable sur mobile.
- PWA iOS : balises `apple-mobile-web-app-capable` ajoutées.

### 🧰 Suite d'Outils Gratuits (`/outils`)
- **Détourage IA** : suppression d'arrière-plan 100% local (`@imgly/background-removal`).
- **Générateur QR Code** : personnalisable, export PNG.
- **OCR Arabe + Français** : extraction de texte via Tesseract.js.
- **Générateur de Factures** : calculs automatiques, export PDF propre via `window.open()`.

### 🖨️ Correction Impression PDF Factures
- Méthode précédente (`window.print()`) imprimait toute la page.
- **Nouvelle méthode** : ouverture d'une nouvelle fenêtre contenant uniquement le HTML de la facture, impression automatique. Fond blanc garanti, une seule page A4.

---

## À propos (Vision & Mission)

### Le Créateur
El Hadji Abdoulaye Mouhamed Lamine Niass, *Graphiste de la Hadara*.

### Vision
Offrir une expérience créative "Premium", où chaque client se sent accompagné de bout en bout, grâce à des outils technologiques de pointe et un design immersif — **accessible depuis n'importe quel appareil**.

### Mission
Centraliser la prise de commande, l'analyse des besoins, la facturation et le suivi de projet au sein d'une seule et même application SaaS.

### Objectifs
- **Fluidifier la prise de brief** grâce à un formulaire intelligent et une assistance IA.
- **Attirer des clients** via des outils gratuits (Lead Magnet : Factures, QR Code, OCR, Détourage).
- **Garantir une transparence totale** avec un Portail Client sécurisé.

---

## Licence

Copyright © 2026 **MrNiass / Hadara Suite**
Tous droits réservés.
