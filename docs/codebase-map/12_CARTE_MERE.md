# 12 — Carte Mère

> Hadara Suite v2.3.0 — Diagramme complet du SaaS actuel
> Date : 2026-08-26 | Source : Vérifié par 10_CROSSCHECK.md

---

## Architecture Globale

```mermaid
graph TB
    subgraph CLIENT["🖥️ FRONTEND (React 19 + Vite 8 + Tailwind v4)"]
        App["App.tsx<br/>Routes + State"]
        BriefForm["BriefForm<br/>5 étapes"]
        AdminDash["AdminDashboard<br/>(lazy)"]
        AIChat["AIChatWidget 🔴<br/>CASSÉ"]
        Store["HadaraStore"]
        ClientPortal["ClientPortalView"]
        Panels["Panels IA × 4"]
    end

    subgraph API["🔌 BACKEND API (Django 6 + DRF)"]
        Router["api/urls.py<br/>Router"]
        Auth["auth_views.py<br/>TimestampSigner"]
        BriefView["BriefViewSet"]
        BillingView["BillingDocumentViewSet"]
        ChatLegacy["chat_api_view 🔴<br/>CASSÉ"]
        AnalyzeLegacy["ai_analyze_brief 🟠<br/>Legacy"]
        OCR["ocr_correct_api_view"]
    end

    subgraph AI_CORE["🤖 HADARA AI CORE"]
        AIRouter["hadara_ai/api/urls.py"]
        Services["Services × 4"]
        Engine["AgentEngine"]
        Router2["ModelRouter"]
        Providers["ProviderRegistry"]
        Tools["ToolRegistry (5)"]
        Tracing["ExecutionTraceService"]
        Analytics["AnalyticsService"]
        Workflow["WorkflowOrchestrator"]
    end

    subgraph PROVIDERS["☁️ PROVIDERS IA"]
        Groq["Groq<br/>llama-3.3-70b"]
        OpenAI["OpenAI<br/>gpt-4o"]
        Gemini["Gemini<br/>gemini-1.5-flash"]
    end

    subgraph DB["🗄️ BASE DE DONNÉES"]
        Brief["Brief"]
        Client2["Client"]
        Billing["BillingDocument"]
        Payment2["Payment"]
        Analysis["BriefAIAnalysis"]
        Execution["AIExecution"]
    end

    subgraph INFRA["🏗️ INFRA"]
        Render["Render<br/>Backend + PostgreSQL"]
        Cloudflare["Cloudflare Pages<br/>Frontend"]
        Telegram["Telegram Bot<br/>Notifications"]
    end

    App --> BriefForm
    App --> AdminDash
    App --> AIChat
    App --> Store
    App --> ClientPortal
    AdminDash --> Panels

    BriefForm --> Router
    Panels --> AIRouter
    AIChat --> ChatLegacy

    Router --> BriefView
    Router --> BillingView
    Router --> ChatLegacy
    Router --> AnalyzeLegacy
    Router --> OCR

    ChatLegacy -->|"🔴 BROKEN"| X["ImportError"]
    AnalyzeLegacy -->|"🟠"| GeminiDirect["Gemini Direct<br/>(pas de provider)"]

    AIRouter --> Services
    Services --> Engine
    Engine --> Router2
    Router2 --> Providers
    Providers --> Groq
    Providers --> OpenAI
    Providers --> Gemini
    Engine --> Tools
    Services --> Tracing
    Tracing --> Execution
    Services --> Analytics

    BriefView --> Brief
    BillingView --> Billing
    BillingView --> Payment2
    Services --> Analysis

    Brief -->|"FK"| Client2
    Billing -->|"FK"| Client2
    Billing -->|"FK"| Brief
    Payment2 -->|"FK"| Billing

    App -.->|"HTTPS"| Render
    Render -.->|"PostgreSQL"| DB
    Cloudflare -.->|"API calls"| Render
    BriefView -.->|"Async"| Telegram
```

---

## Flux Métier

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant API as Backend API
    participant AI as Hadara AI Core
    participant P as Providers

    Note over C,P: === NOUVEAU BRIEF ===
    C->>F: Remplit BriefForm
    F->>API: POST /api/briefs/
    API-->>Telegram: Notification async
    API-->>AI: WorkflowOrchestrator.run() async
    AI->>P: BriefAnalystService
    P-->>AI: Analyse structurée
    AI->>P: PricingAgentService
    P-->>AI: Estimation tarifaire
    AI->>P: CreativeAssistantService
    P-->>AI: Direction artistique
    Note over AI: CommunicationAgent skipped (skip_communication=True)

    Note over C,P: === ADMIN ANALYSE ===
    F->>AI: POST /api/ai/v1/briefs/{id}/analyze/
    AI->>P: BriefAnalystService.analyze()
    P-->>AI: {statut, score, décision}
    AI-->>F: BriefAnalystResult

    Note over C,P: === CHATBOT (CASSÉ) ===
    C->>F: Tape un message
    F->>API: POST /api/chat/
    API-->>X: ImportError<br/>chat_with_assistant<br/>N'EXISTE PAS
    X-->>F: 500 Internal Server Error
    F-->>C: "Oups, je rencontre un problème réseau"
```

---

## Matrice des endpoints

```mermaid
mindmap
  root((Hadara Suite))
    Métier
      Briefs
        GET /api/briefs/
        POST /api/briefs/
        PATCH /api/briefs/{id}/
      Clients
        GET /api/billing/clients/
        POST /api/billing/clients/
      Facturation
        GET /api/billing/documents/
        GET /api/billing/payments/
        POST /api/billing/payments/
      Boutique
        GET /api/store/products/
    Auth
      Login Admin
        POST /api/auth/login/
        GET /api/auth/verify/
      Login Client
        POST /api/auth/client/login/
    IA Core
      Agents
        GET /api/ai/v1/agents/
        POST /api/ai/v1/agents/{pk}/run/
      Brief Analysis
        POST /api/ai/v1/briefs/{id}/analyze/
      Pricing Agent
        POST /api/ai/v1/briefs/{id}/pricing-agent/
      Creative Assistant
        POST /api/ai/v1/briefs/{id}/creative-assistant/
      Communication Agent
        POST /api/ai/v1/briefs/{id}/communicate/
      Workflow
        POST /api/ai/v1/briefs/{id}/workflow/
      Analytics
        GET /api/ai/v1/analytics/dashboard/
        GET /api/ai/v1/analytics/agents/
    Legacy
      Chat 🔴
        POST /api/chat/
      AI Analyze 🟠
        POST /api/ai-analyze/{pk}/
      OCR
        POST /api/ocr-correct/
```
