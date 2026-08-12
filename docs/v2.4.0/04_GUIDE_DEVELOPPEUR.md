# Guide Développeur & Architecture (v2.4.0)

Ce guide documente les choix architecturaux et la logique technique d'implémentation de la v2.4.0.

## 1. Architecture du Projet

Le projet suit une architecture monolithique découplée :
- **Backend** : Django 6.0 + Django REST Framework.
- **Frontend** : React 18 (Vite, TypeScript, TailwindCSS/CSS Custom).
- **Base de données** : NeonDB (PostgreSQL Serverless).

## 2. API et Sécurité (Le Cœur de la v2.4.0)

### 2.1 Authentification du Portail Client
Pour permettre au client d'accéder à son portail sans créer de compte complexe avec mot de passe, un système d'authentification par token basé sur le numéro WhatsApp est utilisé :
1. Le client soumet son WhatsApp via l'endpoint `/api/auth/client/login/` (Vue `ClientLoginView`).
2. Si le client existe, l'API renvoie un token de sécurité unique.
3. Ce token est inclus dans les headers des requêtes suivantes (`Authorization: ClientToken <token>`).

### 2.2 Permissions avec `AdminOrClientTokenPermission`
Cette classe de permission personnalisée sécurise les ViewSets (`BriefViewSet`, `BillingDocumentViewSet`, `PaymentViewSet`).
- Si la requête vient d'un Admin (Session ou Token), elle est autorisée avec plein accès.
- Si la requête contient un `ClientToken` valide, la vue filtre automatiquement le `queryset` pour ne renvoyer que les données de ce client spécifique (`queryset.filter(client_id=client.id)`).

### 2.3 Documentation OpenAPI 3 (Swagger & ReDoc)
L'API est entièrement auto-documentée via `drf-spectacular`.
Les routes disponibles sont :
- `/api/schema/` : Spécification YAML/JSON.
- `/docs/` : Interface Swagger UI interactive pour tester les requêtes.
- `/redoc/` : Documentation ReDoc statique et lisible.

## 3. Le Dashboard Cockpit (`admin.py`)

Les indicateurs clés de performance (KPIs) sont injectés globalement sur la page d'accueil de l'administration via la surcharge de la méthode `each_context` de `AdminSite`.

**⚠️ Important (Leçon de la v2.3 vers v2.4)** :
La fonction `format_html` convertit ses arguments en texte de façon sécurisée (pour empêcher les failles XSS). Il ne faut **jamais** lui passer un formatage de chaîne python dépendant du type numérique (comme `{:,}`) à l'intérieur des balises HTML si l'argument lui est passé ensuite.
- Mauvaise pratique : `format_html('<b>{:,}</b>', obj.montant)` -> Crée une `ValueError` fatale 500 car le framework stringifie l'argument avant de formater.
- Bonne pratique : `formate = f"{obj.montant:,}"; format_html('<b>{}</b>', formate)`

## 4. Modèles Financiers (`models.py`)

Les trois modèles essentiels pour la séparation métier sont :
1. `Brief` (Client, Type de projet, Demandes, Prix estimatif).
2. `BillingDocument` (Facture ou Proforma avec un `doc_type`, lié à un client et optionnellement à un Brief).
3. `Payment` (Montant encaissé, lié à un `BillingDocument`).

Le calcul des montants (`total`, `subtotal`) se fait côté modèle par agrégation des lignes (`BillingLine`), permettant une consistance parfaite des données en base.
