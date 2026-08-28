# 02 — Fonctionnel

> Hadara Suite v2.3.0 — Cartographie des fonctionnalités métier
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵

---

## 1. Vue d'ensemble des Features

```
Hadara Suite v2.3.0
├── Feature: Brief Management
├── Feature: Client Management
├── Feature: AI Analysis (Legacy)
├── Feature: Hadara AI Core (4 agents)
├── Feature: Workflow Orchestration
├── Feature: Pricing Engine
├── Feature: Billing & Payments
├── Feature: Portfolio
├── Feature: Hadara Store
├── Feature: Templates
├── Feature: Client Portal
├── Feature: Admin Dashboard
├── Feature: Analytics & ROI
├── Feature: Chatbot (Legacy)
└── Feature: Migration Tool
```

---

## 2. Feature: Brief Management

**Description** : Création, suivi et gestion des briefs/projets graphiques.

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Model** | `Brief` | `backend/api/models.py:22` | 🟢 |
| **Serializer** | `BriefSerializer` | `backend/api/serializers.py:8` | 🟢 |
| **View** | `BriefViewSet` (CRUD) | `backend/api/views.py` | 🟢 |
| **Endpoint** | `GET/POST /api/briefs/`, `GET/PUT/DELETE /api/briefs/{id}/` | `backend/api/urls.py` | 🟢 |
| **Component** | `BriefForm` (5 étapes) | `src/components/BriefForm.tsx` | 🟢 |
| **Component** | `KanbanTab` (board) | `src/components/admin/KanbanTab.tsx` | 🟢 |
| **Component** | `Project360Modal` (vue 360°) | `src/components/admin/Project360Modal.tsx` | 🟢 |

**Données clés** : `reference_code`, `status` (BriefStatus), `project_type` (ProjectType), `technical_format`, `budget_range`, `preferred_colors`, `avoid_colors`, `style_preferences`, `context_description`, `primary_objective`, `target_audience`, `attachments`, `client` (FK→Client), `quoted_price_fcfa`, `ai_analysis` (JSON)

**Workflow de statuts** :
```
nouveau → devis_envoye → acompte_recu → en_creation → validation → termine
```

---

## 3. Feature: Client Management

**Description** : Gestion des clients (nom, organisation, contact).

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Model** | `Client` | `backend/api/models.py:6` | 🟢 |
| **Serializer** | `ClientSerializer` | `backend/api/serializers.py` | 🟢 |
| **View** | `ClientViewSet` (CRUD) | `backend/api/views.py` | 🟢 |
| **Endpoint** | `GET/POST /api/billing/clients/` | `backend/api/urls.py` | 🟢 |
| **Component** | `HadaraClientCombobox` | `src/components/HadaraClientCombobox.tsx` | 🟢 |
| **Component** | `ClientPortalView` | `src/components/client/ClientPortalView.tsx` | 🟢 |

**Données clés** : `id` (CharField, auto), `name`, `organization`, `whatsapp`, `email`, `address`

---

## 4. Feature: Pricing Engine (Souverain)

**Description** : Moteur de tarification pure Python — aucune IA. Source de vérité pour les prix.

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Service** | `HadaraPricingEngine` | `backend/api/pricing_engine.py` | 🟢 |
| **Instance** | `HADARA_PRICING` (globale) | `backend/api/pricing_engine.py` | 🟢 |
| **Tool IA** | `pricing_calculate` | `backend/hadara_ai/tools/implementations.py` | 🟢 |

**Méthodes** :
- `estimate_price(project_type, format, usage, deadline, budget_range)` → `{min, max, hours_min, hours_max}`
- `get_price_range(project_type, format)` → fourchette de base

**Règle** : Le Pricing Engine est **souverain** — les agents IA l'utilisent mais ne remplacent jamais ses estimations.

---

## 5. Feature: Hadara AI Core (4 Agents)

**Description** : Système IA structuré avec 4 agents spécialisés, traçabilité, analytics.

### 5.1 Brief Analyst

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Feature** | Brief Analyst | — | 🟢 |
| **Agent** | `BriefAnalyst` | `backend/hadara_ai/agents/brief_analyst.py` | 🟢 |
| **Service** | `BriefAnalystService` | `backend/hadara_ai/agents/brief_analyst_service.py` | 🟢 |
| **Prompt** | `BRIEF_ANALYST_SYSTEM_PROMPT` | `backend/hadara_ai/agents/brief_analyst.py` | 🟢 |
| **Endpoint** | `POST /api/ai/v1/briefs/{id}/analyze/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Component** | `BriefAnalysisPanel` | `src/components/admin/BriefAnalysisPanel.tsx` | 🟢 |
| **Model** | `BriefAIAnalysis` | `backend/hadara_ai/models/analysis.py` | 🟢 |
| **Tools** | `brief_get`, `client_get` | `backend/hadara_ai/tools/implementations.py` | 🟢 |
| **Tracing** | via `ExecutionTraceService` | `backend/hadara_ai/tracing/service.py` | 🟢 |

**Entrée** : Brief fields (JSON) + contexte projet
**Sortie** : `BriefAnalystResult` (statut_brief, score_completude, decision_recommandee, pricing, contexte_client, brouillon_whatsapp)
**Fallback** : Si indisponible, retourne score=50 avec raison "indisponible"

### 5.2 Pricing Agent

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Feature** | Pricing Agent | — | 🟢 |
| **Agent** | `PricingAgent` | `backend/hadara_ai/agents/pricing_agent.py` | 🟢 |
| **Service** | `PricingAgentService` | `backend/hadara_ai/agents/pricing_agent_service.py` | 🟢 |
| **Prompt** | `PRICING_AGENT_SYSTEM_PROMPT` | `backend/hadara_ai/agents/pricing_agent.py` | 🟢 |
| **Endpoint** | `POST /api/ai/v1/briefs/{id}/pricing-agent/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Component** | `PricingAgentPanel` | `src/components/admin/PricingAgentPanel.tsx` | 🟢 |
| **Tools** | `brief_get`, `pricing_calculate` | `backend/hadara_ai/tools/implementations.py` | 🟢 |

**Entrée** : Brief fields + contexte projet
**Sortie** : `PricingAgentResult` (prix_recommande, explication, strategie_commerciale, risques_commerciaux, brouillon_devis)

### 5.3 Creative Assistant

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Feature** | Creative Assistant | — | 🟢 |
| **Agent** | `CreativeAssistant` | `backend/hadara_ai/agents/creative_assistant.py` | 🟢 |
| **Service** | `CreativeAssistantService` | `backend/hadara_ai/agents/creative_assistant_service.py` | 🟢 |
| **Prompt** | `CREATIVE_ASSISTANT_SYSTEM_PROMPT` | `backend/hadara_ai/agents/creative_assistant.py` | 🟢 |
| **Endpoint** | `POST /api/ai/v1/briefs/{id}/creative-assistant/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Component** | `CreativeAssistantPanel` | `src/components/admin/CreativeAssistantPanel.tsx` | 🟢 |
| **Quality Gate** | `validate_creative_output` | `backend/hadara_ai/brand/quality_gate.py` | 🟢 |
| **Brand DNA** | `HADARA_DNA` | `backend/hadara_ai/brand/dna.py` | 🟢 |
| **Tools** | `brief_get`, `client_history` | `backend/hadara_ai/tools/implementations.py` | 🟢 |

**Entrée** : Brief fields + contexte projet
**Sortie** : `CreativeAssistantResult` (direction_artistique, concepts_visuels, conseils_production, livrables_recommandes, _quality_gate)

### 5.4 Communication Agent

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Feature** | Communication Agent | — | 🟢 |
| **Agent** | `CommunicationAgent` | `backend/hadara_ai/agents/communication_agent.py` | 🟢 |
| **Service** | `CommunicationAgentService` | `backend/hadara_ai/agents/communication_agent_service.py` | 🟢 |
| **Prompt** | `COMMUNICATION_AGENT_SYSTEM_PROMPT` | `backend/hadara_ai/agents/communication_agent.py` | 🟢 |
| **Endpoint** | `POST /api/ai/v1/briefs/{id}/communication-agent/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Component** | `CommunicationAgentPanel` | `src/components/admin/CommunicationAgentPanel.tsx` | 🟢 |
| **Tools** | `brief_get`, `client_get` | `backend/hadara_ai/tools/implementations.py` | 🟢 |

**Entrée** : Brief fields + contexte projet + type (proposition/devis/relance/livraison/acceptation/complet)
**Sortie** : `CommunicationResult` (messages.whatsapp/email/sms, objets_email, points_cles, prochaine_action, alertes_internes)

---

## 6. Feature: Workflow Orchestration

**Description** : Exécution séquentielle des 4 agents avec traçabilité.

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Feature** | Workflow Orchestration | — | 🟢 |
| **Orchestrator** | `WorkflowOrchestrator` | `backend/hadara_ai/workflow/orchestrator.py` | 🟢 |
| **Endpoint** | `POST /api/ai/v1/workflow/start/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Endpoint** | `GET /api/ai/v1/workflow/{id}/status/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Component** | `WorkflowPanel` | `src/components/admin/WorkflowPanel.tsx` | 🟢 |
| **Models** | `AIWorkflowExecution`, `AIWorkflowStepExecution` | `backend/hadara_ai/models/workflow.py` | 🟢 |

**Séquence** : BriefAnalyst → PricingAgent → CreativeAssistant → CommunicationAgent

**Statuts** : `pending` → `running` → `completed` | `failed` | `skipped` | `retrying`

---

## 7. Feature: Billing & Payments

**Description** : Facturation proforma/facture/avoir + suivi des paiements.

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Models** | `BillingDocument`, `BillingLine`, `Payment` | `backend/api/models.py:115-190` | 🟢 |
| **Serializers** | `BillingDocumentSerializer`, `PaymentSerializer` | `backend/api/serializers.py` | 🟢 |
| **Views** | `BillingDocumentViewSet`, `PaymentViewSet` | `backend/api/views.py` | 🟢 |
| **Endpoints** | `GET/POST /api/billing/documents/`, `GET/POST /api/billing/payments/` | `backend/api/urls.py` | 🟢 |

**Statuts paiement** : `brouillon` → `en_attente` → `acompte` → `partiel` → `paye` | `en_retard` | `annule`

**Méthodes paiement** : wave, orange_money, especes, virement, cheque, autre

---

## 8. Feature: Portfolio

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Model** | `PortfolioItem` | `backend/api/models.py:75` | 🟢 |
| **View** | `PortfolioItemViewSet` | `backend/api/views.py` | 🟢 |
| **Endpoint** | `GET/POST /api/portfolio/` | `backend/api/urls.py` | 🟢 |

---

## 9. Feature: Hadara Store

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Model** | `StoreProduct` | `backend/api/models.py:93` | 🟢 |
| **View** | `StoreProductViewSet` | `backend/api/views.py` | 🟢 |
| **Endpoint** | `GET/POST /api/store/products/` | `backend/api/urls.py` | 🟢 |
| **Component** | `HadaraStore` | `src/components/HadaraStore.tsx` | 🟢 |

---

## 10. Feature: Templates

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Model** | `Template` | `backend/api/models.py:55` | 🟢 |
| **View** | `TemplateViewSet` | `backend/api/views.py` | 🟢 |
| **Endpoint** | `GET/POST /api/templates/` | `backend/api/urls.py` | 🟢 |

---

## 11. Feature: Client Portal

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **View** | `ClientLoginView` | `backend/api/auth_views.py` | 🟢 |
| **Endpoint** | `POST /api/auth/client/login/` | `backend/api/urls.py` | 🟢 |
| **Endpoint** | `GET /api/client-briefs/{id}/` | `backend/api/urls.py` | 🟢 |
| **Component** | `ClientPortalView` | `src/components/client/ClientPortalView.tsx` | 🟢 |

---

## 12. Feature: Analytics & ROI

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Service** | `AnalyticsService` | `backend/hadara_ai/analytics/service.py` | 🟢 |
| **Endpoint** | `GET /api/ai/v1/analytics/dashboard/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Endpoint** | `GET /api/ai/v1/analytics/agents/` | `backend/hadara_ai/api/views.py` | 🟢 |
| **Component** | `AnalyticsDashboardPanel` | `src/components/admin/AnalyticsDashboardPanel.tsx` | 🟢 |
| **Models** | `AIAgentUsageLog`, `AIDailyAggregate` | `backend/hadara_ai/models/analytics.py` | 🟢 |

**KPIs** : coût total, tokens, workflows complétés, briefs analysés, taux d'acceptation, ROI, coût par brief

---

## 13. Feature: Chatbot (Legacy)

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Feature** | Chatbot | — | 🟠 |
| **View** | `chat_api_view` | `backend/api/views.py` | 🟠 |
| **Endpoint** | `POST /api/chat/` | `backend/api/urls.py` | 🟠 |
| **Component** | `AIChatWidget` | `src/components/AIChatWidget.tsx` | 🟠 |

**Note** : Appel direct à Groq API, pas de traçabilité, pas de structure.

---

## 14. Feature: Migration Tool

| Couche | Implémentation | Emplacement | État |
|--------|---------------|-------------|------|
| **Component** | `MigrationTool` | `src/components/admin/MigrationTool.tsx` | 🟢 |
| **Endpoint** | `PATCH /api/briefs/{id}/` | `backend/api/urls.py` | 🟢 |

**Usage** : Rattachement des anciens briefs sans client_id à des clients existants.
