# HADARA SUITE v2.4.0 — Documentation Officielle & Index Sommaire 📚

> **Hadara Studio & Hadara Manager v2.4.0** — Plateforme de Gestion de Studio Créatif, Automatisation IA, Store, Portail Client et Facturation Avancée.

---

## 🏛️ Structure du Dossier /docs/v2.4.0/

```text
/docs/v2.4.0/
├── 00_INDEX.md                           ← Sommaire Général & Architecture
├── 01_MANUEL_UTILISATEUR.md              ← Guide d'Exploitation, Portail Client & Cockpit Manager
├── 02_DOCUMENTATION_METIER.md            ← Règles Financières (Briefs vs Factures), KPIs, Paiements
├── 03_CHARTE_GRAPHIQUE.md                ← Design Tokens, Typographies & Composants UI
├── 04_GUIDE_DEVELOPPEUR.md               ← Architecture Django, React, Sécurité (AdminToken) & Swagger API
└── 05_GUIDE_DEPLOIEMENT_DEPANNAGE.md     ← Déploiement Render, Neon DB, Migrations & Dépannage
```

---

## 🚀 Vue d'Ensemble de l'Architecture v2.4.0

```text
                        HADARA SUITE v2.4.0
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
       SITE PUBLIC & PORTAIL                    HADARA MANAGER
  (https://hadara-design.com/)              (/api/django-admin/)
             │                                       │
      Vitrine & Portail Client                 Cockpit Studio & Finance
    (Connexion via WhatsApp)               (Séparation Projets & Revenus)
             │                                       │
             └───────────────────┬───────────────────┘
                                 │
                  API SECURISEE & SWAGGER DOCS
           (REST Framework, drf-spectacular OpenAPI 3)
                                 │
                      NEON POSTGRESQL DATABASE
                    (Source de Vérité Structurée)
```

---

## 🔑 Nouveautés Majeures de la Version v2.4.0

1. **Portail Client & Sécurité Renforcée** :
   - Accès sécurisé au portail client via authentification par numéro WhatsApp.
   - Les données (Factures, Projets, Briefs) sont strictement filtrées par le backend en fonction de l'identité du client (`ClientLoginView` et `AdminOrClientTokenPermission`).
   - Le stockage local (`sessionStorage`) n'est plus utilisé comme mesure de sécurité, seul le backend fait autorité.

2. **Séparation Métier : Projets vs Facturation** :
   - Le dashboard est désormais divisé en modules clairs : "Projets & Briefs" (Kanban, Livrables) et "Facturation & Revenus" (Factures, Paiements, Proformas).
   - Fin de la confusion financière : Un Brief contient une **estimation** (`quoted_price_fcfa`). Une Facture (`BillingDocument`) représente l'engagement financier légal réel.

3. **Dashboard & KPIs Financiers Stricts** :
   - Le Chiffre d'Affaires (CA) affiché dans le Cockpit n'est plus calculé à partir des devis de briefs.
   - **CA Facturé** = Somme des factures - Somme des avoirs (les proformas sont exclus).
   - **CA Encaissé** = Somme des paiements enregistrés.
   - Indicateurs visuels immédiats des factures en retard et montants restants à encaisser.

4. **Documentation API Intégrée (Swagger / ReDoc)** :
   - Implémentation de `drf-spectacular`.
   - Accessibilité des spécifications API via `/docs/` (Swagger UI) et `/redoc/` pour faciliter les intégrations frontend et tierces.
