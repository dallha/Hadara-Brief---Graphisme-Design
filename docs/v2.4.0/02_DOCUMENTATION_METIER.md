# Documentation Métier (Règles Fonctionnelles & Financières) — v2.4.0

Ce document explicite les règles métier absolues régissant l'application Hadara. C'est le socle sur lequel repose toute la comptabilité et la logique de sécurité de l'application.

## 1. Séparation Stricte : Brief ≠ Facture

La mise à jour v2.4.0 corrige une dette technique majeure concernant la confusion entre la demande d'un client et ce qui lui est réellement facturé.

### 1.1 Le Brief (`Brief`)
- **Nature** : Un Brief est une demande, une spécification technique, ou un cahier des charges.
- **Finances** : Le champ `quoted_price_fcfa` contenu dans un Brief est strictement **estimatif**. Il sert de devis informel ou d'indication de budget.
- **Règle d'or** : Le montant d'un Brief **ne doit jamais** être additionné pour calculer le Chiffre d'Affaires du studio. Un Brief n'a aucune valeur légale ou comptable.

### 1.2 Le Document de Facturation (`BillingDocument`)
- **Nature** : C'est le seul document légal. Il peut être de trois types (`doc_type`) :
  1. `facture` : Facture légale. Rentre dans le calcul du CA.
  2. `proforma` : Devis officiel. Exclue du calcul du CA.
  3. `avoir` : Note de crédit (remboursement ou annulation partielle). Déduite du CA.
- **Montant** : Le champ `total` du `BillingDocument` (calculé automatiquement via les lignes `BillingLine` moins la remise `discount`) constitue la véritable **Réalité Financière**.

## 2. Calcul des KPIs Financiers (Tableau de bord Admin)

Les règles de calcul pour le tableau de bord (Cockpit) sont encodées de manière stricte dans `api/admin.py` (fonction `_hadara_each_context`) :

1. **CA Facturé** :
   ```math
   CA Facturé = SUM(Factures.total) - SUM(Avoirs.total)
   ```
   *Note : Les factures annulées (`payment_status='annule'`) et les Proformas sont totalement exclues du calcul.*

2. **CA Encaissé** :
   ```math
   CA Encaissé = SUM(Payment.amount)
   ```
   *L'argent réellement perçu par le studio. Ne compte que les paiements liés à des Factures (pas de paiements sur Proforma ou factures annulées).*

3. **Reste à Encaisser (À Encaisser)** :
   ```math
   CA Restant = CA Facturé - CA Encaissé
   ```

4. **Factures en Retard** :
   *Nombre de `BillingDocument` de type `facture` dont le `payment_status` est strictement `en_retard`.*

## 3. Règle de Sécurité : La Source de Vérité est le Client

Le modèle `Client` est le point d'ancrage de toute la base de données relationnelle pour le portail client :
- Un `Brief` appartient à un `Client`.
- Un `BillingDocument` appartient à un `Client`.
- Le numéro `whatsapp` du `Client` sert d'identifiant unique.

**Le Frontend ne décide jamais de la sécurité.** Le `sessionStorage` n'est qu'un stockage local pratique. C'est le Backend (via la classe `AdminOrClientTokenPermission` et les ViewSets filtrant par client authentifié) qui garantit l'étanchéité des données entre les clients.
