# 01 — Architecture

> Hadara Suite v2.3.0 — Cartographie de l'architecture technique
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵 — voir CONVENTIONS.md

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  React 19 + TypeScript + Tailwind v4 (SPA/PWA)                 │
│  Vite 8.x (build)                                              │
│  Port: 5173 (dev)                                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (fetch API)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REVERSE PROXY                                │
│  Cloudflare (CDN, SSL, DDoS protection)                        │
│  Domaine: hadarastudio.com                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API                                   │
│  Django 6.x + DRF                                              │
│  Gunicorn (WSGI)                                               │
│  Port: 8000                                                    │
│  Render.com (PaaS)                                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   api app    │  │ hadara_ai    │  │ hadara_project     │   │
│  │  (métier)    │  │  app (IA)    │  │  (settings/root)   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────┘   │
│         │                 │                                     │
│         ▼                 ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Render)                        │   │
│  │  Production: PostgreSQL managed                         │   │
│  │  Dev/Local: SQLite (fallback)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼ (appels IA)
┌─────────────────────────────────────────────────────────────────┐
│                    PROVIDERS IA EXTERNES                         │
│  🔵 Groq API (llama-3.3-70b-versatile, mixtral-8x7b)          │
│  🔵 OpenAI API (gpt-4o, gpt-4o-mini)                           │
│  🔵 Google Gemini API (gemini-1.5-flash, gemini-1.5-pro)       │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Architecture Backend

### 2.1 Django Apps

| App | Emplacement | Responsabilité | État |
|-----|-------------|---------------|------|
| `api` | `backend/api/` | Modèles métier, vues CRUD, auth, facturation | 🟢 |
| `hadara_ai` | `backend/hadara_ai/` | Système IA complet (agents, tools, providers, tracing, analytics, workflow) | 🟢 |
| `hadara_project` | `backend/hadara_project/` | Settings Django, URL racine, WSGI | 🟢 |

### 2.2 Structure `hadara_ai`

```
hadara_ai/
├── agents/           # 4 agents IA + services + engine
│   ├── brief_analyst.py
│   ├── brief_analyst_service.py
│   ├── pricing_agent.py
│   ├── pricing_agent_service.py
│   ├── creative_assistant.py
│   ├── creative_assistant_service.py
│   ├── communication_agent.py
│   ├── communication_agent_service.py
│   ├── engine.py           # AgentEngine, AgentStep, AgentResult
│   └── routing.py          # ModelRouter
├── api/              # Endpoints IA (v1)
│   ├── views.py
│   └── urls.py
├── brand/            # Brand DNA + quality gate
│   ├── dna.py              # HADARA_DNA
│   └── quality_gate.py     # validate_creative_output
├── models/           # Modèles Django IA
│   ├── __init__.py
│   ├── agent.py            # AgentDefinition
│   ├── analysis.py         # BriefAIAnalysis
│   ├── provider.py         # AIProvider, AIProviderConfig
│   ├── prompt.py           # PromptTemplate, PromptVersion
│   ├── trace.py            # AIExecution, ToolExecution, UsageLog, CostLog
│   ├── workflow.py         # AIWorkflowExecution, AIWorkflowStepExecution
│   └── analytics.py        # AIAgentUsageLog, AIDailyAggregate
├── prompts/          # PromptEngine
│   └── engine.py
├── providers/        # 3 providers IA
│   ├── base.py             # AbstractAIProvider, AIResponse
│   ├── registry.py         # ProviderRegistry
│   ├── groq_provider.py
│   ├── openai_provider.py
│   └── gemini_provider.py
├── services/         # Service IA
│   └── ai_service.py       # get_ai_response
├── tools/            # 5 tools IA
│   ├── implementations.py  # brief_get, client_get, client_history, pricing_calculate, brief_analyze
│   ├── registry.py         # ToolRegistry, ToolDefinition
│   └── context.py          # ToolContext, ToolPermission, ToolRole
├── tracing/          # Traçabilité
│   ├── service.py          # ExecutionTraceService
│   └── aggregator.py       # CostCalculator, UsageAggregator
├── analytics/        # Analytics
│   └── service.py          # AnalyticsService
└── workflow/          # Orchestration
    └── orchestrator.py     # WorkflowOrchestrator
```

### 2.3 Architecture Frontend

```
src/
├── App.tsx                 # Routes + state principal
├── config.ts               # API_BASE (dev/prod)
├── types.ts                # Toutes les interfaces TS
├── main.tsx                # Entry point
├── index.css               # Tailwind imports
├── utils/
│   └── cn.ts               # Utility (classnames)
├── components/
│   ├── BriefForm.tsx        # Formulaire 5 étapes
│   ├── HadaraStore.tsx      # Boutique
│   ├── AIChatWidget.tsx     # Chatbot legacy 🟠
│   ├── HadaraClientCombobox.tsx  # Combobox client
│   ├── client/
│   │   └── ClientPortalView.tsx  # Portail client
│   └── admin/
│       ├── AdminDashboard.tsx     # Dashboard admin (lazy)
│       ├── KanbanTab.tsx          # Kanban board
│       ├── Project360Modal.tsx    # Vue 360° projet
│       ├── BriefAnalysisPanel.tsx # Panel Brief Analyst
│       ├── PricingAgentPanel.tsx  # Panel Pricing Agent
│       ├── CreativeAssistantPanel.tsx  # Panel Creative Assistant
│       ├── CommunicationAgentPanel.tsx # Panel Communication Agent
│       ├── WorkflowPanel.tsx      # Panel Workflow complet
│       ├── AnalyticsDashboardPanel.tsx # Panel Analytics
│       └── MigrationTool.tsx      # Outil migration
└── hooks/                   # N'existe pas ⚪
```

### 2.4 Auth

| Mécanisme | Emplacement | État | Notes |
|-----------|-------------|------|-------|
| Admin login | `backend/api/auth_views.py` → `AdminLoginView` | 🟢 | Password-based, `TimestampSigner` |
| Admin verify | `backend/api/auth_views.py` → `AdminVerifyView` | 🟢 | Vérifie le token signé |
| Client login | `backend/api/auth_views.py` → `ClientLoginView` | 🟢 | Code SMS/email, `TimestampSigner` |
| Session storage | Frontend: `sessionStorage.getItem('hadara_admin_token')` | 🟢 | Token dans sessionStorage |
| JWT | — | ⚪ | Non détecté dans le code exploré |

### 2.5 Déploiement

| Composant | Service | Config |
|-----------|---------|--------|
| Backend | Render.com | Gunicorn, port 8000 |
| Frontend | Render.com (ou build statique) | Vite build → dist/ |
| Base de données | Render PostgreSQL | Managed database |
| CDN/Proxy | Cloudflare | SSL, DDoS, cache |
| Domaine | hadarastudio.com | Via Cloudflare |

## 3. Conventions de Nommage Backend

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Models | PascalCase | `Brief`, `BillingDocument` |
| Views | PascalCase (classes) ou snake_case (fonctions) | `BriefViewSet`, `ai_analyze_brief` |
| Serializers | PascalCase + `Serializer` | `BriefSerializer` |
| URLs | kebab-case | `store-products/`, `ai-analyze/` |
| Files | snake_case | `brief_analyst.py`, `ai_service.py` |

## 4. Conventions de Nommage Frontend

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Components | PascalCase | `KanbanTab`, `BriefAnalysisPanel` |
| Types/Interfaces | PascalCase | `BriefData`, `PricingAgentResult` |
| Files | PascalCase (composants) ou camelCase (utils) | `BriefForm.tsx`, `cn.ts` |
| CSS | Tailwind v4 utility-first | Classes inline |

## 5. Points d'Architecture Notables

### 🔴 Systèmes IA en parallèle

```
Legacy (🟠)                         Hadara AI Core (🟢)
├── /api/chat/                      ├── /api/ai/v1/agents/run/
├── /api/ai-analyze/{pk}/           ├── /api/ai/v1/briefs/{id}/analyze/
├── ai_utils.py (Groq direct)       ├── /api/ai/v1/briefs/{id}/pricing-agent/
├── AIChatWidget.tsx                 ├── /api/ai/v1/briefs/{id}/creative-assistant/
└── Pas de traçabilité              ├── /api/ai/v1/briefs/{id}/communication-agent/
                                    ├── /api/ai/v1/workflow/start/
                                    ├── AgentEngine + ModelRouter
                                    ├── ProviderRegistry (3 providers)
                                    ├── ToolRegistry (5 tools)
                                    ├── ExecutionTraceService
                                    ├── AnalyticsService
                                    └── WorkflowOrchestrator
```

### 🟡 Auth sans JWT

- `TimestampSigner` de Django signe un token avec timestamp
- Pas de refresh token, pas de JWT
- Le token est stocké dans `sessionStorage`
- ⚪ Non vérifié si middleware de vérification existe côté backend

### 🟡 Pas de hooks/services/API client côté frontend

- Aucun répertoire `src/hooks/`, `src/services/`, `src/api/`
- Appels `fetch()` directs dans chaque composant
- Pas de couche d'abstraction API
- `API_BASE` importé depuis `src/config.ts`
