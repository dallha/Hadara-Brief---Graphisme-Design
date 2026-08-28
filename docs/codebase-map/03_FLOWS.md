# 03 — Flux Métier

> Hadara Suite v2.3.0 — Cartographie des flux métier
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵

---

## 1. Flux Principal : Brief → Livraison

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client   │───▶│  Brief   │───▶│ Analyse  │───▶│ Devis &  │───▶│ Création │
│  crée le  │    │  (5 étapes)│   │  IA      │    │ Facturation│   │ & Valid. │
│  brief    │    │          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
  POST /api/     BriefForm.tsx   BriefAnalyst    BillingDocument  KanbanTab
  briefs/        KanbanTab       PricingAgent    Payment          Project360
                               CreativeAssist                   Modal
                               Communication
```

### Étapes détaillées

| # | Étape | Acteur | Action | Statut | Composant |
|---|-------|--------|--------|--------|-----------|
| 1 | Création brief | Client | Remplit le formulaire 5 étapes | `nouveau` | `Component:BriefForm` |
| 2 | Réception admin | Admin | Voit le brief dans le Kanban | `nouveau` | `Component:KanbanTab` |
| 3 | Analyse IA | Admin | Lance BriefAnalyst | `nouveau` | `Component:BriefAnalysisPanel` |
| 4 | Estimation prix | Admin | Lance PricingAgent | `nouveau` | `Component:PricingAgentPanel` |
| 5 | Devis | Admin | Génère document proforma | `devis_envoye` | `Component:KanbanTab` |
| 6 | Paiement acompte | Client | Paie via Wave/OM/etc. | `acompte_recu` | `Component:KanbanTab` |
| 7 | Création | Designer | Travaille sur le projet | `en_creation` | `Component:Project360Modal` |
| 8 | Validation | Client | Approuve les livrables | `validation` | `Component:ClientPortalView` |
| 9 | Finalisation | Admin | Clôt le projet | `termine` | `Component:KanbanTab` |

---

## 2. Flux IA : Analyse de Brief

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin      │────▶│  POST        │────▶│  BriefAnalyst│
│  clique     │     │  /api/ai/v1/ │     │  Service     │
│  "Analyser" │     │  briefs/{id}/│     │              │
│             │     │  analyze/    │     │  ┌─────────┐ │
└─────────────┘     └──────────────┘     │  │ Agent   │ │
                                         │  │ Engine  │ │
                                         │  └────┬────┘ │
                                         │       │      │
                                         │  ┌────▼────┐ │
                                         │  │ Model   │ │
                                         │  │ Router  │ │
                                         │  └────┬────┘ │
                                         │       │      │
                                         │  ┌────▼────┐ │
                                         │  │Provider │ │
                                         │  │Registry │ │
                                         │  └────┬────┘ │
                                         │       │      │
                                         │  ┌────▼────┐ │
                                         │  │Groq/    │ │
                                         │  │OpenAI/  │ │
                                         │  │Gemini   │ │
                                         │  └─────────┘ │
                                         └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ BriefAI-     │
                                         │ Analysis     │
                                         │ (saved)      │
                                         └──────────────┘
```

**Outils utilisés par BriefAnalyst** :
1. `Tool:brief_get` → récupère les données du brief
2. `Tool:client_get` → récupère les données client

**Sortie** : `BriefAnalystResult` → affichée dans `Component:BriefAnalysisPanel`

---

## 3. Flux IA : Workflow Complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW ORCHESTRATOR                          │
│                                                                 │
│  ┌─────────────┐                                                │
│  │ Step 1:     │   BriefAnalyst                                │
│  │ brief_get   │───▶ client_get ───▶ Analyse structurée        │
│  │ client_get  │                                                │
│  └──────┬──────┘                                                │
│         │                                                       │
│  ┌──────▼──────┐                                                │
│  │ Step 2:     │   PricingAgent                                │
│  │ brief_get   │───▶ pricing_calculate ───▶ Estimation prix    │
│  │ pricing_    │                                                │
│  │ calculate   │                                                │
│  └──────┬──────┘                                                │
│         │                                                       │
│  ┌──────▼──────┐                                                │
│  │ Step 3:     │   CreativeAssistant                           │
│  │ brief_get   │───▶ client_history ───▶ Direction artistique  │
│  │ client_     │                                                │
│  │ history     │                                                │
│  └──────┬──────┘                                                │
│         │                                                       │
│  ┌──────▼──────┐                                                │
│  │ Step 4:     │   CommunicationAgent                          │
│  │ brief_get   │───▶ client_get ───▶ Messages client           │
│  │ client_get  │                                                │
│  └─────────────┘                                                │
│                                                                 │
│  Traçabilité : ExecutionTraceService                            │
│  Analytics : AnalyticsService                                   │
│  Modèles : AIWorkflowExecution + AIWorkflowStepExecution        │
└─────────────────────────────────────────────────────────────────┘
```

**Statuts** : `pending` → `running` → `completed` | `failed` | `skipped` | `retrying`
**Retry** : automatique en cas d'échec (max retries configuré)

---

## 4. Flux Facturation

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin       │────▶│  Création    │────▶│  Proforma    │
│  crée un     │     │  BillingDoc  │     │  envoyée au  │
│  document    │     │  (brouillon) │     │  client      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Paiement    │◀────│  Client paie │
                     │  enregistré  │     │  (Wave/OM/   │
                     │              │     │   especes)   │
                     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Statut      │
                     │  mis à jour  │
                     │  (paye/      │
                     │   partiel)   │
                     └──────────────┘
```

---

## 5. Flux Auth Admin

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin       │────▶│  POST        │────▶│  Timestamp   │
│  entre       │     │  /api/admin- │     │  Signer      │
│  credentials │     │  login/      │     │  (signe)     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Token dans  │◀────│  Token       │
                     │  sessionStorage│   │  retourné    │
                     │              │     │              │
                     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Chaque      │
                     │  requête API │
                     │  : header    │
                     │  Authorization│
                     │  Bearer {tok}│
                     └──────────────┘
```

---

## 6. Flux Client Portal

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client      │────▶│  POST        │────▶│  Code SMS/   │
│  entre son   │     │  /api/client-│     │  Email envoyé│
│  téléphone   │     │  login/      │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Portail     │◀────│  Vérification│
                     │  client      │     │  du code     │
                     │  (briefs,    │     │              │
                     │   statuts)   │     └──────────────┘
                     └──────────────┘
```

---

## 7. Flux de Communication (Agent IA)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin       │────▶│  Select type │────▶│  POST        │
│  choisit un  │     │  (proposition│     │  /api/ai/v1/ │
│  type de     │     │   devis,     │     │  briefs/{id}/│
│  message     │     │   relance...)│     │  communicate/│
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                     ┌──────────────────────────────────┐
                     │  CommunicationAgent              │
                     │  → Génère 3 versions :          │
                     │    - WhatsApp                    │
                     │    - Email (+ objets suggérés)   │
                     │    - SMS                         │
                     │  → Points clés                   │
                     │  → Prochaine action              │
                     │  → Alertes internes              │
                     └──────────────────────────────────┘
```

---

## 8. Matrice des Flux par Rôle

| Rôle | Flux accédés | Endpoints |
|------|-------------|-----------|
| **Client** | Création brief, Portail client, Paiement | `POST /api/briefs/`, `GET /api/client-briefs/{id}/`, `POST /api/auth/client/login/` |
| **Admin** | Kanban, Analyse IA, Facturation, Analytics | `GET/PUT /api/briefs/`, `POST /api/ai/v1/*`, `GET/POST /api/billing/documents/`, `GET /api/ai/v1/analytics/*` |
| **Designer** | Vue 360°, Notes projet | `GET /api/briefs/{id}/`, `PUT /api/briefs/{id}/` |
