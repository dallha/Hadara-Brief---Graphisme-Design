# 07 — Frontend

> Hadara Suite v2.3.0 — Cartographie du frontend React
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT 19 + TYPESCRIPT                         │
│                    TAILWIND CSS v4                               │
│                    VITE 8.x                                      │
│                                                                 │
│  src/                                                           │
│  ├── App.tsx              # Routes + state principal            │
│  ├── config.ts            # API_BASE                            │
│  ├── types.ts             # Toutes les interfaces TS            │
│  ├── main.tsx             # Entry point                         │
│  ├── index.css            # Tailwind imports                    │
│  ├── utils/               # cn.ts (classnames)                  │
│  └── components/                                              │
│      ├── BriefForm.tsx                                         │
│      ├── HadaraStore.tsx                                       │
│      ├── AIChatWidget.tsx 🟠                                   │
│      ├── HadaraClientCombobox.tsx                               │
│      ├── client/                                               │
│      │   └── ClientPortalView.tsx                              │
│      └── admin/                                                │
│          ├── AdminDashboard.tsx (lazy)                         │
│          ├── KanbanTab.tsx                                     │
│          ├── Project360Modal.tsx                               │
│          ├── BriefAnalysisPanel.tsx                            │
│          ├── PricingAgentPanel.tsx                             │
│          ├── CreativeAssistantPanel.tsx                        │
│          ├── CommunicationAgentPanel.tsx                       │
│          ├── WorkflowPanel.tsx                                 │
│          ├── AnalyticsDashboardPanel.tsx                       │
│          └── MigrationTool.tsx                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Routes

**Emplacement** : `src/App.tsx`

| Route | Composant | Lazy | Rôle |
|-------|-----------|------|------|
| `/` | Accueil | non | Landing page |
| `/brief` | `BriefForm` | non | Formulaire 5 étapes |
| `/admin` | `AdminDashboard` | **oui** | Dashboard admin |
| `/admin/kanban` | `KanbanTab` | non (dans AdminDashboard) | Kanban board |
| `/admin/project360` | `Project360Modal` | non (dans AdminDashboard) | Vue 360° |
| `/store` | `HadaraStore` | non | Boutique |
| `/login` | LoginView | non | Connexion |
| `/client-portal` | `ClientPortalView` | non | Portail client |

---

## 3. State Management

**Emplacement** : `src/App.tsx`

| State | Type | Persist | Usage |
|-------|------|---------|-------|
| `isAuthenticated` | `boolean` | `sessionStorage` | Auth admin |
| `userRole` | `UserRole` | `sessionStorage` | Rôle utilisateur |
| `userEmail` | `string` | non | Email utilisateur |
| `userName` | `string` | non | Nom utilisateur |
| `userOrganization` | `string` | non | Organisation |

**Pas de state management externe** (pas de Redux, Zustand, Jotai, etc.)

---

## 4. Composants

### 4.1 BriefForm

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/BriefForm.tsx` |
| **Feature** | Brief Management |
| **Endpoints** | `POST /api/briefs/` |
| **État** | 🟢 |
| **Description** | Formulaire 5 étapes (Client → Projet → Contexte → Style → Technique) |

### 4.2 AdminDashboard

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/AdminDashboard.tsx` |
| **Feature** | Admin Dashboard |
| **Lazy** | **oui** (React.lazy + Suspense) |
| **État** | 🟢 |
| **Sous-composants** | KanbanTab, Project360Modal, BriefAnalysisPanel, PricingAgentPanel, CreativeAssistantPanel, CommunicationAgentPanel, WorkflowPanel, AnalyticsDashboardPanel, MigrationTool |

### 4.3 KanbanTab

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/KanbanTab.tsx` |
| **Feature** | Brief Management |
| **Endpoints** | `GET /api/briefs/`, `PATCH /api/briefs/{id}/` |
| **État** | 🟢 |
| **Description** | Board Kanban avec colonnes par statut |

### 4.4 Project360Modal

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/Project360Modal.tsx` |
| **Feature** | Brief Management |
| **Endpoints** | `GET /api/briefs/{id}/` |
| **État** | 🟢 |
| **Description** | Vue 360° d'un projet (toutes les infos, livrables, commentaires) |

### 4.5 BriefAnalysisPanel

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/BriefAnalysisPanel.tsx` |
| **Feature** | Brief Analyst |
| **Endpoints** | `POST /api/ai/v1/briefs/{id}/analyze/`, `GET /api/ai/v1/briefs/{id}/analyses/` |
| **État** | 🟢 |
| **States** | idle, loading, success, error, fallback |
| **Description** | Affiche les résultats de l'analyse IA (score, décision, risques, brouillon WhatsApp) |

### 4.6 PricingAgentPanel

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/PricingAgentPanel.tsx` |
| **Feature** | Pricing Agent |
| **Endpoints** | `POST /api/ai/v1/briefs/{id}/pricing-agent/` |
| **État** | 🟢 |
| **States** | idle, loading, success, error |
| **Description** | Affiche les recommandations tarifaires (prix, stratégie, risques, brouillon devis) |

### 4.7 CreativeAssistantPanel

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/CreativeAssistantPanel.tsx` |
| **Feature** | Creative Assistant |
| **Endpoints** | `POST /api/ai/v1/briefs/{id}/creative-assistant/` |
| **État** | 🟢 |
| **States** | idle, loading, success, error |
| **Sous-composant** | `QualityGateBar` (Quality Gate) |
| **Description** | Direction artistique IA (concepts, palette, typographies, prompts) |

### 4.8 CommunicationAgentPanel

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/CommunicationAgentPanel.tsx` |
| **Feature** | Communication Agent |
| **Endpoints** | `POST /api/ai/v1/briefs/{id}/communicate/` |
| **État** | 🟢 |
| **States** | idle, loading, success, error |
| **Description** | Messages client (WhatsApp, Email, SMS) + objets email + points clés |

### 4.9 WorkflowPanel

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/WorkflowPanel.tsx` |
| **Feature** | Workflow Orchestration |
| **Endpoints** | `POST /api/ai/v1/briefs/{id}/workflow/` |
| **État** | 🟢 |
| **States** | idle, running, completed, failed |
| **Description** | Exécution séquentielle des 4 agents avec timeline |

### 4.10 AnalyticsDashboardPanel

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/AnalyticsDashboardPanel.tsx` |
| **Feature** | Analytics & ROI |
| **Endpoints** | `GET /api/ai/v1/analytics/dashboard/`, `GET /api/ai/v1/analytics/agents/` |
| **État** | 🟢 |
| **Description** | KPIs (coût, tokens, workflows, ROI), performance par agent |

### 4.11 MigrationTool

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/MigrationTool.tsx` |
| **Feature** | Migration Tool |
| **Endpoints** | `GET /api/briefs/`, `PATCH /api/briefs/{id}/` |
| **État** | 🟢 |
| **Description** | Rattachement des anciens briefs sans client_id |

### 4.12 AIChatWidget (🟠 Legacy)

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/AIChatWidget.tsx` |
| **Feature** | Chatbot (Legacy) |
| **Endpoints** | `POST /api/chat/` |
| **État** | 🟠 |
| **Description** | Chatbot flottant, appelle directement Groq API |

### 4.13 ClientPortalView

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/client/ClientPortalView.tsx` |
| **Feature** | Client Portal |
| **Endpoints** | `GET /api/client-briefs/{id}/` |
| **État** | 🟢 |
| **Description** | Portail client (voir ses briefs, statuts) |

### 4.14 HadaraStore

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/HadaraStore.tsx` |
| **Feature** | Hadara Store |
| **Endpoints** | `GET /api/store/products/` |
| **État** | 🟢 |
| **Description** | Boutique en ligne |

### 4.15 HadaraClientCombobox

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/HadaraClientCombobox.tsx` |
| **Feature** | Client Management |
| **Endpoints** | `GET /api/billing/clients/` |
| **État** | 🟢 |
| **Description** | Combobox de sélection de client |

---

## 5. Configuration API

**Emplacement** : `src/config.ts`

| Environnement | URL | Usage |
|---------------|-----|-------|
| Development | `http://localhost:8000` | `npm run dev` |
| Production | `https://hadara-backend.onrender.com` | Build |

---

## 6. Patterns Frontend

| Pattern | Utilisation | État |
|---------|-------------|------|
| Lazy loading | `AdminDashboard` (React.lazy + Suspense) | 🟢 |
| Direct fetch | Appels `fetch()` dans chaque composant | 🟡 (pas de couche d'abstraction) |
| sessionStorage | Token admin (`hadara_admin_token`) | 🟢 |
| Pas de state management | State local uniquement (useState) | 🟡 |
| Pas de hooks custom | Aucun répertoire `src/hooks/` | ⚪ |
| Pas de services API | Aucun répertoire `src/services/` | ⚪ |

---

## 7. Types TypeScript Notables

**Emplacement** : `src/types.ts` (734 lignes)

| Type | Usage |
|------|-------|
| `UserRole` | 9 rôles (super_admin → client) |
| `ProjectType` | 11 types de projets |
| `BriefStatus` | 6 statuts de brief |
| `BriefData` | Interface complète du brief (前端) |
| `BriefAnalystResult` | Sortie du Brief Analyst |
| `PricingAgentResult` | Sortie du Pricing Agent |
| `CreativeAssistantResult` | Sortie du Creative Assistant |
| `CommunicationResult` | Sortie du Communication Agent |
| `WorkflowResult` | Sortie du Workflow |
| `AnalyticsDashboard` | Données analytics |
| `BillingDocument` | Document de facturation |
| `InvoiceData` | Données facturation (前端) |
