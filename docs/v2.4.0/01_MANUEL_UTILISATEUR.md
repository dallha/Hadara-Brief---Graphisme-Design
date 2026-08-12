# Manuel Utilisateur — v2.4.0

Ce manuel décrit les procédures d'utilisation de **Hadara Manager** (le Cockpit administrateur) et du **Portail Client** pour les utilisateurs finaux.

## 1. Hadara Manager (L'Administration Django)

L'accès principal pour la gestion du studio se fait via `/api/django-admin/`.

### 1.1 Le Cockpit (Tableau de Bord)
Le Cockpit (page d'accueil de l'administration) est divisé en deux grandes sections pour une meilleure lisibilité :
- **Dashboard Financier** : Affiche les KPIs financiers calculés en temps réel (CA Facturé, CA Encaissé, Reste à Encaisser, Factures en Retard).
- **Activité Opérationnelle** : Affiche les projets en cours (Nouveaux briefs à deviser, Historique).

### 1.2 Séparation "Projets & Briefs" et "Facturation & Revenus"
Pour clarifier les opérations, le menu latéral gauche sépare désormais la gestion opérationnelle de la gestion comptable :
- **Projets & Briefs** :
  - **Briefs** : Gestion des demandes clientes.
  - **Livrables (Versions)** : Suivi des V1, V2, V3 et validation des maquettes.
- **Facturation & Revenus** :
  - **Proformas** : Devis officiels.
  - **Factures** : Documents légaux engageant le client à payer.
  - **Paiements** : Enregistrement des encaissements réels.

### 1.3 Traitement d'un Brief
1. Lorsqu'un client soumet un formulaire sur le site public, un **Brief** est créé avec le statut `Nouveau`.
2. L'administrateur l'ouvre, estime le coût (`quoted_price_fcfa`), et génère une Proforma ou une Facture liée à ce client.
3. Les livrables (maquettes) sont téléchargés via l'interface simplifiée d'upload (qui compresse automatiquement les images en WebP).

---

## 2. Le Portail Client

Le portail client est l'espace privatif où le client de l'agence peut suivre l'avancement de ses projets et consulter ses factures.

### 2.1 Connexion Sécurisée
1. Le client accède à la page de connexion du portail.
2. Il saisit son **Numéro WhatsApp** (qui lui sert d'identifiant unique).
3. Le backend vérifie l'existence du numéro dans la table `Client`. Si reconnu, un jeton d'accès sécurisé (token) est généré et stocké côté client.
4. Ce jeton permet au portail React d'interroger les API. **Toutes les données retournées sont strictement filtrées** par le backend. Il est impossible pour un client de voir les factures d'un autre client.

### 2.2 Consultation des Projets et Livrables
Dans son espace, le client peut :
- Voir la liste de ses briefs (projets).
- Cliquer sur un projet pour voir les **maquettes (Livrables)** associées.
- Visualiser les images (qui s'ouvrent via une Lightbox fluide). La séparation claire entre l'aperçu léger (WebP) et le fichier source original (PDF/AI) permet une navigation rapide même sur mobile.

### 2.3 Espace Facturation
Le client dispose d'un onglet "Factures" où il peut :
- Télécharger ses factures officielles en PDF.
- Suivre le statut de ses paiements (Payé, En attente, En retard, Partiellement payé).
- Le montant affiché ici correspond au **véritable montant facturé** et non au prix estimatif initial du brief.
