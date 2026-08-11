# CAHIER DES CHARGES — HADARA SUITE

## Version P0 — Cockpit Studio, CRM, Briefs, IA, Facturation, Paiements & Portail Client

### Statut

**Objectif : stabilisation et cohérence métier.**

Ce document devient la référence avant toute nouvelle implémentation.

Principe directeur :

> **Une donnée saisie une fois doit être réutilisée partout sans être ressaisie ni recréée.**

Et :

> **L'interface doit guider l'action au lieu d'exposer la structure technique de la base de données.**

---

# 1. Architecture générale

```text
                         HADARA SUITE
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
   HADARA MANAGER                            SITE PUBLIC
      Django                              React / Vite PWA
          │                                       │
          │                                 ┌─────┴─────┐
          │                                 │           │
          │                              Brief      Portail
          │                              Client      Client
          │
          └──────────────────┬────────────────────┘
                             │
                     API REST / Django
                             │
                     PostgreSQL / Neon
                             │
       ┌─────────────┬───────┼──────────┬─────────────┐
       │             │       │          │             │
     Client         Brief  Factures  Paiements     Versions
```

---

# 2. Règle absolue : source de vérité

Chaque domaine possède une source unique.

| Donnée                     | Source                        |
| -------------------------- | ----------------------------- |
| Client                     | `Client`                      |
| Brief                      | `Brief`                       |
| Prix estimatif avant devis | `Brief` / Pricing Engine      |
| Prix officiel              | `BillingDocument`             |
| Paiements                  | `Payment`                     |
| Solde                      | calculé depuis `Payment`      |
| Statut financier           | calculé                       |
| V1/V2/V3                   | `deliverable_versions`        |
| Validation client          | version publiée               |
| Revenus                    | `BillingDocument` + `Payment` |

### Interdiction

Le système ne doit pas avoir :

```text
Brief = source du montant final
```

une fois qu'une facture existe.

Le Brief peut conserver :

> **Devis estimatif / budget envisagé**

mais la facture devient la source officielle du montant facturé.

---

# 3. MODULE CLIENT

## 3.1 Modèle Client

Le modèle déjà créé devient le référentiel officiel.

```text
Client
├── ID
├── Nom
├── Organisation
├── WhatsApp
├── Email
├── Adresse
└── historique des briefs/factures
```

---

# 4. NOUVEAU BESOIN P0 — SÉLECTION D'UN CLIENT EXISTANT

C'est une amélioration importante.

## Problème actuel

À chaque nouveau Brief, on risque de saisir :

```text
Marwa Voyages
+221...
adresse...
email...
```

alors que le client existe déjà.

Cela crée :

* doublons ;
* fautes de frappe ;
* numéros différents ;
* historiques fragmentés ;
* problèmes de facturation.

## Solution

Dans tous les endroits où un client doit être associé à une opération, utiliser un :

### `Client Search / Combobox`

Exemple :

```text
CLIENT

🔎 Rechercher un client...

┌──────────────────────────────────┐
│ Marwa Voyages                    │
│ +221 77 XX XX XX                 │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Institut Al Mouyassar             │
│ +221 76 XX XX XX                 │
└──────────────────────────────────┘

────────────────────────────────────

＋ Créer un nouveau client
```

---

# 5. Où cette sélection doit être disponible

### Brief

```text
Client *
[ 🔎 Rechercher un client... ]
```

avec :

**＋ Nouveau client**

---

### Facture

```text
Client
[ 🔎 Rechercher un client... ]
```

Si le Brief est déjà lié à un Client :

```text
Client
✓ Marwa Voyages

Brief associé
✓ BRF-2026-0042
```

Le système doit proposer automatiquement le client du Brief.

---

### Modification d'un client

La fiche Client doit afficher :

```text
CLIENT

Marwa Voyages

[ Modifier ]

Nom
Organisation
WhatsApp
Email
Adresse
```

La modification doit mettre à jour **le référentiel Client**, mais **ne doit jamais modifier les snapshots historiques des factures existantes**.

Exemple :

```text
Client actuel
Marwa Voyages
Nouvelle adresse : Dakar Plateau
```

Les anciennes factures restent :

```text
Adresse de facturation historique
HLM Rond-Point
```

C'est indispensable pour l'intégrité comptable.

---

# 6. Recherche intelligente

Le champ Client doit pouvoir rechercher par :

* nom ;
* organisation ;
* WhatsApp ;
* email.

Exemple :

```text
🔎 marwa

Marwa Voyages
+221 77...
```

et :

```text
🔎 7760

Marwa Voyages
+221 7760...
```

---

# 7. Création rapide d'un nouveau client

Depuis un Brief :

```text
Client *

[ 🔎 Rechercher un client... ]

＋ Créer un nouveau client
```

Le clic ouvre une petite interface :

```text
NOUVEAU CLIENT

Nom *
Organisation
WhatsApp *
Email
Adresse

[ Annuler ] [ Créer le client ]
```

Après création :

```text
✓ Client créé

Client
[ Marwa Voyages ]
```

**Pas de deuxième saisie.**

---

# 8. MODULE BRIEF

Le Brief reste le point d'entrée métier.

## Champs prioritaires

```text
Client *
Type de projet *
Description *
```

Puis informations complémentaires :

```text
Format
Dimensions
Budget
Style
Couleurs
Livrables
Délais
Références
Pièces jointes
```

Les données complexes ne doivent jamais apparaître comme :

```text
["logo","affiche","flyer"]
```

---

# 9. WORKFLOW DU BRIEF

```text
BRIEF REÇU
     ↓
ANALYSE
     ↓
DEVIS
     ↓
ACOMPTE
     ↓
EN CRÉATION
     ↓
V1
     ↓
RÉVISION
     ↓
V2
     ↓
VALIDATION
     ↓
LIVRAISON
```

---

# 10. HADARA AI — ANALYSE DU BRIEF

Le Pricing Engine reste indépendant de l'IA.

```text
Brief
 ↓
Pricing Engine
 ↓
prix / charge / complexité
 ↓
IA
 ↓
analyse qualitative
```

L'IA :

* analyse la complétude ;
* identifie les informations manquantes ;
* détecte les risques ;
* propose les questions client ;
* prépare un message WhatsApp ;
* interprète le résultat du Pricing Engine.

Elle **ne décide pas du prix**.

---

# 11. PANNEAU D'ACTION GUIDÉ

Le principe :

> **Qu'est-ce que je dois faire maintenant ?**

Exemple :

```text
⚡ PROCHAINE ACTION

Brief reçu ✓

Analyse disponible

Complétude
94 / 100

Complexité
6 / 10

Prix conseillé
30 000 – 45 000 FCFA

[ ✨ Analyser le brief ]
[ 💰 Préparer le devis ]
```

Après devis :

```text
💰 DEVIS TRANSMIS

Montant
40 000 FCFA

Statut
En attente du client

[ 💳 Confirmer acompte ]
```

Après acompte :

```text
🎨 PROJET EN CRÉATION

Acompte reçu
20 000 FCFA

[ 🎨 Publier V1 ]
```

---

# 12. FACTURATION

Les modèles déjà implémentés deviennent le socle :

```text
Client
BillingDocument
BillingLine
Payment
```

---

# 13. TYPES DE DOCUMENT

```text
Proforma
Facture
Avoir
```

Numérotation :

```text
PF-2026-0001
PF-2026-0002

FA-2026-0001
FA-2026-0002
```

Réinitialisation annuelle.

---

# 14. LIGNES DE FACTURATION

Une facture doit être réellement détaillée :

```text
DÉSIGNATION                         QTÉ     PU       TOTAL

Conception badges                   22    2 000     44 000

Remise commerciale                  1   -14 000    -14 000

                                  TOTAL           30 000
```

Le total est calculé.

Il ne doit pas être tapé manuellement.

---

# 15. STATUT FINANCIER

Le statut ne doit jamais être saisi manuellement.

Il est calculé :

```text
Total facture
     │
     ├── Paiements
     │
     ↓
Montant encaissé
     │
     ↓
Solde
```

États :

```text
Non payé
Acompte reçu
Partiellement payé
Payé
En retard
Annulé
```

---

# 16. PAIEMENTS

Un paiement doit contenir :

```text
Montant
Méthode
Date
Référence
Note
```

Méthodes :

```text
Wave
Orange Money
Espèces
Virement
Chèque
Autre
```

Exemple :

```text
PAY-0008

15 000 FCFA
Wave

11 août 2026
Référence : WAVE-XXXX

Acompte
```

---

# 17. ⚠️ CORRECTION CRITIQUE DU DASHBOARD CLIENT

C'est ici que ton problème actuel est important.

Actuellement :

```text
Portail Client
      ↓
Brief
      ↓
quoted_price_fcfa
```

Donc le client voit seulement le montant présent dans le Brief.

**Ce n'est plus acceptable après création d'une facture.**

---

# 18. NOUVELLE SOURCE FINANCIÈRE DU PORTAIL CLIENT

Le portail doit récupérer :

```text
BillingDocument
        +
Payment
        ↓
Résumé financier
```

et non seulement :

```text
Brief.quoted_price_fcfa
```

---

# 19. NOUVEAU DASHBOARD FINANCIER CLIENT

Exemple :

```text
💰 SITUATION FINANCIÈRE

Montant de la prestation
30 000 FCFA

Acompte reçu
15 000 FCFA

Solde restant
15 000 FCFA

● Partiellement payé
```

Une fois payé :

```text
💰 SITUATION FINANCIÈRE

Total
30 000 FCFA

✓ Total encaissé
30 000 FCFA

Solde
0 FCFA

🟢 PAYÉ
```

---

# 20. RÈGLE DE PRIORITÉ DES MONTANTS

Le portail doit appliquer :

### Cas 1 — aucune facture

Afficher éventuellement :

```text
Budget / estimation du brief
```

avec une mention claire :

> Estimation — non contractuelle

### Cas 2 — Proforma créée

Afficher :

```text
Proforma
PF-2026-0001

30 000 FCFA

En attente
```

### Cas 3 — Paiement enregistré

Afficher :

```text
Total
30 000 FCFA

Encaissé
15 000 FCFA

Solde
15 000 FCFA
```

### Cas 4 — Facture payée

Afficher :

```text
30 000 FCFA

🟢 PAYÉ
```

---

# 21. API FINANCIÈRE

L'API du Brief doit exposer un bloc financier structuré.

Par exemple :

```json
{
  "brief": {
    "id": "BRF-2026-0042"
  },
  "financial": {
    "hasInvoice": true,
    "documentNumber": "PF-2026-0001",
    "documentType": "proforma",
    "total": 30000,
    "paidAmount": 15000,
    "balanceDue": 15000,
    "status": "acompte"
  }
}
```

Le frontend ne doit pas recalculer lui-même les montants.

**Django reste la source de vérité.**

---

# 22. PORTAIL CLIENT — ACTIONS

Le client doit pouvoir agir lorsqu'une action est requise.

### Devis

```text
💰 DEVIS

30 000 FCFA

[ ✓ Accepter ]
[ Demander une modification ]
```

### V1

```text
🎨 MAQUETTE V1

[ Voir la maquette ]

[ ✓ Valider ]
[ ↩ Demander une modification ]
```

### Livraison

```text
📦 LIVRAISON

Projet terminé

[ Télécharger ]
```

---

# 23. VERSIONS V1 / V2 / V3

Règle :

```text
Pièce jointe client
≠
Maquette graphiste
```

Une pièce jointe reçue du client n'est jamais automatiquement une V1.

La V1 apparaît uniquement lorsque le graphiste la publie.

```text
Client
  ↓
Références / fichiers

Graphiste
  ↓
Publier V1

Client
  ↓
Valider / Réviser

Graphiste
  ↓
Publier V2
```

---

# 24. PORTAIL CLIENT — VERSIONS

```text
🎨 MAQUETTES

V2
🟡 En attente de validation

[ Voir ]
[ ✓ Valider ]
[ ↩ Demander une modification ]

────────────────

V1
✓ Validée
```

Historique non destructif.

---

# 25. MODULE REVENUS

C'est la grande évolution nécessaire après la facturation.

Le dashboard Hadara Manager doit avoir :

```text
💰 REVENUS
```

---

# 26. KPI PRINCIPAUX

```text
CA FACTURÉ
1 250 000 FCFA

CA ENCAISSÉ
890 000 FCFA

À ENCAISSER
360 000 FCFA
```

Puis :

```text
FACTURES

12
```

```text
PAYÉES

7
```

```text
EN ATTENTE

3
```

```text
EN RETARD

2
```

---

# 27. REVENUS PAR PÉRIODE

Filtres :

```text
Aujourd'hui
Cette semaine
Ce mois
Ce trimestre
Cette année
Personnalisé
```

---

# 28. REVENUS PAR CLIENT

```text
CLIENT             FACTURÉ       ENCAISSÉ

Marwa Voyages      30 000        30 000
Client B           80 000        40 000
Client C           50 000         0
```

---

# 29. REVENUS PAR TYPE DE PROJET

```text
Identité de marque      400 000
Affiches                180 000
Badges                  120 000
Réseaux sociaux         250 000
Autres                  300 000
```

---

# 30. RENTABILITÉ — P1

Je ne la mettrais pas immédiatement dans le P0.

Il faut d'abord accumuler suffisamment de données réelles :

```text
Prix facturé
+
Temps réellement passé
+
Nombre de révisions
+
Nombre de déclinaisons
```

Puis seulement :

```text
Prix
÷
Temps réel
=
Taux horaire réel
```

Cela permettra plus tard d'améliorer le Pricing Engine avec tes propres données.

---

# 31. DOCUMENTS FINANCIERS

À terme :

```text
Proforma
↓
Facture
↓
Paiement
↓
Reçu
```

Le système doit conserver l'historique.

---

# 32. DESIGN DU MODULE FACTURATION

Même ADN que Hadara Manager.

### Couleurs

```text
Background     #070B18
Surface        #111827
Or             #D0A21C
Bleu           #335A79
Accent         #00C9A7
Texte          #F4F1EA
Muted          #A8B0BD
```

Mais la priorité reste :

> **lisibilité financière avant décoration.**

---

# 33. FORMULAIRES

Tous les formulaires suivent la même grammaire :

### Sélection

```text
[ Client existant ▾ ]
```

### Choix

```text
[ Proforma ] [ Facture ] [ Avoir ]
```

### Statuts

```text
🟡 En attente
🟢 Payé
🔴 En retard
```

### Montants

```text
30 000 FCFA
```

Jamais :

```text
30000
```

---

# 34. MOBILE

Tout doit être utilisable sur smartphone.

Particulièrement :

* sélection client ;
* création facture ;
* ajout paiement ;
* upload ;
* publication V1 ;
* validation client ;
* consultation revenus.

Les boutons principaux doivent être facilement accessibles au doigt.

---

# 35. ADMIN — NAVIGATION

Je recommande cette structure :

```text
HADARA MANAGER

🏠 Tableau de bord

📥 Briefs
   ├── Tous les briefs
   ├── Nouveaux
   ├── En création
   └── Terminés

👥 Clients

💰 Facturation
   ├── Proformas
   ├── Factures
   ├── Paiements
   └── Revenus

🎨 Portfolio

🛍️ Boutique

📋 Modèles de Brief

✨ IA

⚙️ Paramètres
```

Le site public reste séparé.

---

# 36. RELATION CLIENT → BRIEF

Un client peut avoir plusieurs briefs :

```text
Marwa Voyages
     │
     ├── BRF-001 — Badges
     ├── BRF-008 — Affiche
     └── BRF-015 — Réseaux sociaux
```

---

# 37. RELATION BRIEF → FACTURES

Un Brief peut avoir :

```text
1 proforma
+
1 facture
+
éventuellement plusieurs documents associés
```

Le système doit afficher :

```text
💰 FACTURATION DU PROJET

PF-2026-0001
30 000 FCFA
🟡 Acompte

[ Voir ]

FA-2026-0001
30 000 FCFA
🟢 Payée

[ Voir ]
```

---

# 38. RELATION FACTURE → PAIEMENTS

```text
FA-2026-0001
30 000 FCFA

Paiements

15 000 FCFA — Wave
15 000 FCFA — Orange Money

Total encaissé
30 000 FCFA

Solde
0 FCFA
```

---

# 39. SNAPSHOT DE FACTURATION

Point non négociable.

Si le client change :

```text
Nom
Adresse
Organisation
Email
```

une facture ancienne ne change pas.

La facture conserve :

```text
billing_client_name
billing_organization
billing_address
billing_email
billing_whatsapp
```

---

# 40. SÉCURITÉ ET INTÉGRITÉ

### Interdit

Le frontend ne doit jamais pouvoir décider :

```text
total = 30 000
paidAmount = 20 000
status = payé
```

Le serveur calcule.

---

# 41. LOGIQUE FINANCIÈRE

```text
BillingDocument.total
        ↓
SUM(Payment.amount)
        ↓
paid_amount
        ↓
balance_due
        ↓
payment_status
```

`paid_amount` et `balance_due` restent calculés.

---

# 42. API — ORDRE D'IMPLÉMENTATION

Après P0.1 déjà réalisé :

### P0.2

```text
Client API
BillingDocument API
BillingLine API
Payment API
```

### P0.3

```text
Client Search / Combobox
```

### P0.4

```text
Dashboard Facturation
```

### P0.5

```text
Dashboard Revenus
```

### P0.6

```text
Portail Client financier
```

---

# 43. TESTS OBLIGATOIRES

## Test Client

```text
Créer Marwa Voyages
↓
Créer Brief
↓
Sélectionner Marwa Voyages
↓
Aucune ressaisie
```

✅ attendu.

---

## Test doublon

```text
Créer Marwa Voyages
Créer nouveau Brief
Rechercher "Marwa"
```

✅ Un seul client existant proposé.

---

## Test facture

```text
Brief
30 000 FCFA estimatif

Facture
40 000 FCFA

Portail
40 000 FCFA
```

**Le portail doit afficher 40 000, pas 30 000.**

---

## Test paiement

```text
Facture : 40 000

Paiement : 20 000

Portail :

Total       40 000
Encaissé    20 000
Solde       20 000
```

---

## Test paiement final

```text
+20 000

Encaissé : 40 000
Solde : 0

Statut : PAYÉ
```

---

## Test modification Client

```text
Ancienne adresse
      ↓
Modification Client
      ↓
Nouvelle adresse
```

Les anciennes factures restent inchangées.

---

# 44. DEFINITION OF DONE

Le module sera considéré comme terminé uniquement si :

### Client

* [ ] Client centralisé
* [ ] Recherche client
* [ ] Sélection client
* [ ] Création rapide
* [ ] Aucun doublon inutile
* [ ] Historique client

### Brief

* [ ] Client sélectionnable
* [ ] Brief conservé
* [ ] Prix estimatif distinct du prix facturé
* [ ] IA connectée
* [ ] Pricing Engine indépendant

### Facturation

* [x] Client
* [x] BillingDocument
* [x] BillingLine
* [x] Payment
* [x] Numérotation annuelle
* [x] Snapshot
* [x] Statut calculé
* [x] Solde calculé

### Revenus

* [ ] CA facturé
* [ ] CA encaissé
* [ ] Solde à encaisser
* [ ] Factures en retard
* [ ] Filtres temporels
* [ ] Revenus par client

### Portail Client

* [ ] Montant provenant de la facturation
* [ ] Acompte affiché
* [ ] Solde affiché
* [ ] Statut financier
* [ ] Acceptation devis
* [ ] Validation V1/V2/V3
* [ ] Demande de révision
* [ ] Livraison

### UX

* [ ] Mobile
* [ ] Recherche
* [ ] Combobox
* [ ] Chips
* [ ] Upload
* [ ] Empty states
* [ ] Aucun JSON brut
* [ ] Aucun champ technique inutile

---

# 45. ORDRE DE DÉVELOPPEMENT QUE JE RECOMMANDE

```text
ÉTAPE 1
Client Search / Combobox
        ↓
ÉTAPE 2
Liaison Brief → Client
        ↓
ÉTAPE 3
API Billing
        ↓
ÉTAPE 4
Dashboard Facturation
        ↓
ÉTAPE 5
Dashboard Revenus
        ↓
ÉTAPE 6
API financière du Portail
        ↓
ÉTAPE 7
Portail Client financier
        ↓
ÉTAPE 8
Tests End-to-End
```
