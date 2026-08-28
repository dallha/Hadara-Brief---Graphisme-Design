# Glossaire de la Codebase — Hadara Suite v2.3.0

> **Date d'extraction** : 2026-08-26
> **Règle de lecture** : Chaque terme porte un marqueur 🟢🟡🟠🔴⚪🔵 — voir CONVENTIONS.md

---

## 📦 Modèles Django

### Brief
- **Code réel** : `Brief` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:22`
- **Usage** : Métier
- **Canonique** : `Model:Brief`
- **Alias/Legacy** : `Brief & Projet` (verbose_name)
- **État** : 🟢
- **Champs clés** : `id`, `reference_code`, `status` (default=nouveau), `project_type`, `technical_format`, `budget_range`, `preferred_colors`, `avoid_colors`, `style_preferences`, `context_description`, `primary_objective`, `target_audience`, `full_text_content`, `main_title`, `attachments`, `client` (FK→Client), `client_name`, `organization`, `email`, `whatsapp`, `city_country`, `critical_deadline`, `quoted_price_fcfa`, `designer_notes`, `ai_analysis` (JSON), `accept_process`, `accept_deadlines`
- **Dépendances** : `Model:Client`, `Model:BriefAIAnalysis` (via ai_analysis JSON)
- **Appelé par** : `View:BriefViewSet`, `View:ai_analyze_brief`, `Agent:BriefAnalystService`, `Agent:PricingAgentService`, `Tool:brief_get`, `Tool:brief_analyze`, `Component:BriefForm`, `Component:KanbanTab`, `Component:Project360Modal`

### Client
- **Code réel** : `Client` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:6`
- **Usage** : Métier
- **Canonique** : `Model:Client`
- **État** : 🟢
- **Champs clés** : `id` (CharField, PK), `name`, `organization`, `whatsapp`, `email`, `address`
- **Dépendances** : —
- **Appelé par** : `View:ClientViewSet`, `Tool:client_get`, `Tool:client_history`, `Model:Brief` (FK), `Model:BillingDocument` (FK)

### Template
- **Code réel** : `Template` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:55`
- **Usage** : Métier
- **Canonique** : `Model:Template`
- **Alias/Legacy** : `Modèle de Brief` (verbose_name)
- **État** : 🟢
- **Champs clés** : `id`, `title`, `category`, `project_type`, `technical_format`, `custom_dimensions`, `usage_count`
- **Appelé par** : `View:TemplateViewSet`, `Component:KanbanTab`

### PortfolioItem
- **Code réel** : `PortfolioItem` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:75`
- **Usage** : Métier
- **Canonique** : `Model:PortfolioItem`
- **Alias/Legacy** : `Projet Portfolio` (verbose_name)
- **État** : 🟢
- **Champs clés** : `id`, `title`, `category`, `image_url`, `badge`, `price_estimate`
- **Appelé par** : `View:PortfolioItemViewSet`, `Component:PortfolioPage`

### StoreProduct
- **Code réel** : `StoreProduct` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:93`
- **Usage** : Métier
- **Canonique** : `Model:StoreProduct`
- **Alias/Legacy** : `Produit Boutique` (verbose_name)
- **État** : 🟢
- **Champs clés** : `id`, `name`, `category`, `brand`, `price` (FCFA), `status` (choices), `featured`, `visible`, `image`
- **Enum associé** : `Enum:StoreProductStatus` (in_stock, available_24_48h, on_order, unavailable)
- **Appelé par** : `View:StoreProductViewSet`, `Component:HadaraStore`

### BillingDocument
- **Code réel** : `BillingDocument` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:115`
- **Usage** : Facturation
- **Canonique** : `Model:BillingDocument`
- **Alias/Legacy** : `Document de Facturation` (verbose_name), `💰 Facturation` (verbose_name_plural)
- **État** : 🟢
- **Champs clés** : `id`, `document_number`, `doc_type`, `payment_status`, `billing_client_name` (snapshot), `billing_organization` (snapshot), `billing_address` (snapshot), `billing_email` (snapshot), `billing_whatsapp` (snapshot), `subtotal`, `discount`, `total`, `currency` (default=XOF), `issue_date`, `due_date`, `notes`, `brief` (FK→Brief), `client` (FK→Client)
- **Enum associé** : `Enum:DocType` (proforma, facture, avoir), `Enum:PaymentStatus` (brouillon, en_attente, acompte, partiel, paye, en_retard, annule)
- **Appelé par** : `View:BillingDocumentViewSet`, `Component:KanbanTab`, `Component:Project360Modal`

### BillingLine
- **Code réel** : `BillingLine` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:150`
- **Usage** : Facturation
- **Canonique** : `Model:BillingLine`
- **Alias/Legacy** : `Ligne de facturation` (verbose_name)
- **État** : 🟢
- **Champs clés** : `id`, `designation`, `quantity` (decimal), `unit_price` (FCFA), `document` (FK→BillingDocument)
- **Appelé par** : `Model:BillingDocument` (related_name=lines)

### Payment
- **Code réel** : `Payment` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:165`
- **Usage** : Facturation
- **Canonique** : `Model:Payment`
- **Alias/Legacy** : `Paiement` (verbose_name)
- **État** : 🟢
- **Champs clés** : `id` (CharField, PK), `amount` (FCFA), `method`, `reference_code`, `payment_date`, `note`, `billing_document` (FK→BillingDocument)
- **Enum associé** : `Enum:PaymentMethod` (wave, orange_money, especes, virement, cheque, autre)
- **Appelé par** : `View:PaymentViewSet`, `Component:KanbanTab`

### ToolUsageLog
- **Code réel** : `ToolUsageLog` (class)
- **Type** : Model
- **Emplacement** : `backend/api/models.py:187`
- **Usage** : IA (traçabilité legacy)
- **Canonique** : `Model:ToolUsageLog`
- **État** : 🟠 (legacy — remplacé par `Model:ToolExecution`)
- **Appelé par** : `View:admin_logs`

---

## 🤖 Modèles AI (`hadara_ai`)

### AIProvider
- **Code réel** : `AIProvider` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/provider.py`
- **Usage** : IA
- **Canonique** : `Model:AIProvider`
- **État** : 🟢
- **Champs clés** : `id`, `name`, `provider_type`, `is_default`
- **Appelé par** : `Provider:ProviderRegistry`, `Model:AIProviderConfig`

### AIProviderConfig
- **Code réel** : `AIProviderConfig` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/provider.py`
- **Usage** : IA
- **Canonique** : `Model:AIProviderConfig`
- **État** : 🟢
- **Champs clés** : `id`, `provider` (FK→AIProvider), `config_key`, `config_value`, `is_secret`
- **Appelé par** : `Provider:GroqProvider`, `Provider:OpenAIProvider`, `Provider:GeminiProvider`

### PromptTemplate
- **Code réel** : `PromptTemplate` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/prompt.py`
- **Usage** : IA
- **Canonique** : `Model:PromptTemplate`
- **État** : 🟢
- **Champs clés** : `id`, `name`, `template_type`, `agent_type`, `content`, `is_active`
- **Appelé par** : `Engine:PromptEngine`, `Agent:BriefAnalyst`, `Agent:PricingAgent`, `Agent:CreativeAssistant`, `Agent:CommunicationAgent`

### PromptVersion
- **Code réel** : `PromptVersion` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/prompt.py`
- **Usage** : IA
- **Canonique** : `Model:PromptVersion`
- **État** : 🟢
- **Champs clés** : `id`, `template` (FK→PromptTemplate), `version`, `content`, `created_at`
- **Appelé par** : `Model:PromptTemplate` (related_name=versions)

### AgentDefinition
- **Code réel** : `AgentDefinition` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/agent.py`
- **Usage** : IA
- **Canonique** : `Model:AgentDefinition`
- **État** : 🟢
- **Champs clés** : `id`, `name`, `slug`, `description`, `model_name`, `temperature`, `max_tokens`, `tools`, `is_active`
- **Appelé par** : `Engine:AgentEngine`, `View:agent_list`

### BriefAIAnalysis
- **Code réel** : `BriefAIAnalysis` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/analysis.py`
- **Usage** : IA
- **Canonique** : `Model:BriefAIAnalysis`
- **État** : 🟢
- **Champs clés** : `id`, `brief` (FK→Brief), `agent_type`, `analysis`, `model_used`, `confidence_score`, `created_at`
- **Appelé par** : `Agent:BriefAnalystService`, `View:brief_analyze`, `Component:BriefAnalysisPanel`

### AIExecution
- **Code réel** : `AIExecution` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/trace.py`
- **Usage** : IA (traçabilité)
- **Canonique** : `Model:AIExecution`
- **État** : 🟢
- **Champs clés** : `id`, `agent_type`, `execution_id`, `model_name`, `status`, `input_messages`, `output_response`, `tokens_input`, `tokens_output`, `latency_ms`, `estimated_cost_usd`, `provider_id`, `metadata`, `created_at`
- **Enum associé** : `Enum:ExecutionStatus` (pending, running, completed, failed, timeout, rate_limited, cancelled)
- **Appelé par** : `Tracing:ExecutionTraceService`, `View:traces_view`, `Aggregator:UsageAggregator`

### ToolExecution
- **Code réel** : `ToolExecution` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/trace.py`
- **Usage** : IA (traçabilité)
- **Canonique** : `Model:ToolExecution`
- **État** : 🟢
- **Champs clés** : `id`, `execution` (FK→AIExecution), `tool_name`, `input_data`, `output_data`, `success`, `latency_ms`, `error_message`, `created_at`
- **Appelé par** : `Tracing:ExecutionTraceService`, `Tool:brief_get`, etc.

### UsageLog
- **Code réel** : `UsageLog` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/trace.py`
- **Usage** : IA (traçabilité agrégée)
- **Canonique** : `Model:UsageLog`
- **État** : 🟢
- **Champs clés** : `id`, `date`, `provider`, `model`, `agent_type`, `tool_name`, `total_calls`, `total_tokens_in`, `total_tokens_out`, `total_cost_usd`, `avg_latency_ms`, `error_count`

### CostLog
- **Code réel** : `CostLog` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/trace.py`
- **Usage** : IA (coûts)
- **Canonique** : `Model:CostLog`
- **État** : 🟢
- **Champs clés** : `id`, `execution` (FK→AIExecution), `provider`, `model`, `tokens_in`, `tokens_out`, `estimated_cost_usd`, `created_at`

### AIWorkflowExecution
- **Code réel** : `AIWorkflowExecution` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/workflow.py`
- **Usage** : IA (orchestration)
- **Canonique** : `Model:AIWorkflowExecution`
- **État** : 🟢
- **Champs clés** : `id`, `workflow_id`, `brief` (FK→Brief), `status`, `started_at`, `completed_at`
- **Appelé par** : `Workflow:WorkflowOrchestrator`

### AIWorkflowStepExecution
- **Code réel** : `AIWorkflowStepExecution` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/workflow.py`
- **Usage** : IA (orchestration)
- **Canonique** : `Model:AIWorkflowStepExecution`
- **État** : 🟢
- **Champs clés** : `id`, `workflow` (FK→AIWorkflowExecution), `agent_type`, `status`, `execution` (FK→AIExecution), `started_at`, `completed_at`, `order`

### AIAgentUsageLog
- **Code réel** : `AIAgentUsageLog` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/analytics.py`
- **Usage** : IA (analytics)
- **Canonique** : `Model:AIAgentUsageLog`
- **État** : 🟢
- **Champs clés** : `id`, `date`, `agent_type`, `total_runs`, `avg_latency_ms`, `total_tokens`, `total_cost_usd`, `success_count`, `error_count`

### AIDailyAggregate
- **Code réel** : `AIDailyAggregate` (class)
- **Type** : Model
- **Emplacement** : `backend/hadara_ai/models/analytics.py`
- **Usage** : IA (analytics)
- **Canonique** : `Model:AIDailyAggregate`
- **État** : 🟢
- **Champs clés** : `id`, `date`, `total_runs`, `total_tokens`, `total_cost_usd`, `avg_latency_ms`, `agent_breakdown` (JSON), `model_breakdown` (JSON), `error_rate`

---

## 🔌 Views / Endpoints

### BriefViewSet
- **Code réel** : `BriefViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py:7`
- **Usage** : Métier
- **Canonique** : `View:BriefViewSet`
- **État** : 🟢
- **Endpoints** : `/api/briefs/` (CRUD), `/api/briefs/{id}/`
- **Serializer** : `Serializer:BriefSerializer`
- **Appelé par** : `Component:BriefForm`, `Component:KanbanTab`, `Component:Project360Modal`

### ClientViewSet
- **Code réel** : `ClientViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Métier
- **Canonique** : `View:ClientViewSet`
- **État** : 🟢
- **Endpoints** : `/api/billing/clients/` (CRUD)
- **Serializer** : `Serializer:ClientSerializer`

### TemplateViewSet
- **Code réel** : `TemplateViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Métier
- **Canonique** : `View:TemplateViewSet`
- **État** : 🟢
- **Endpoints** : `/api/templates/` (CRUD)

### PortfolioItemViewSet
- **Code réel** : `PortfolioItemViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Métier
- **Canonique** : `View:PortfolioItemViewSet`
- **État** : 🟢
- **Endpoints** : `/api/portfolio/` (CRUD)

### StoreProductViewSet
- **Code réel** : `StoreProductViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Métier
- **Canonique** : `View:StoreProductViewSet`
- **État** : 🟢
- **Endpoints** : `/api/store/products/` (CRUD)

### ai_analyze_brief
- **Code réel** : `ai_analyze_brief` (function-based view)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : IA (legacy)
- **Canonique** : `View:ai_analyze_brief`
- **Alias/Legacy** : `/api/ai-analyze/{pk}/`
- **État** : 🟠 (legacy — utilise Groq/llama via `ai_utils.py`)
- **Dépendances** : `Service:analyze_brief_with_ai` (legacy)

### chat_api_view
- **Code réel** : `chat_api_view` (function-based view)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : IA (legacy)
- **Canonique** : `View:chat_api_view`
- **Alias/Legacy** : `/api/chat/`
- **État** : 🟠 (legacy — chatbot direct, non structuré)

### ocr_correct_api_view
- **Code réel** : `ocr_correct_api_view` (function-based view)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : IA
- **Canonique** : `View:ocr_correct_api_view`
- **Alias/Legacy** : `/api/ocr-correct/`
- **État** : 🟡

### admin_logs
- **Code réel** : `admin_logs` (function-based view)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Admin
- **Canonique** : `View:admin_logs`
- **Endpoints** : `/api/admin/logs/`
- **État** : 🟢

### AdminLoginView
- **Code réel** : `AdminLoginView` (class)
- **Type** : View
- **Emplacement** : `backend/api/auth_views.py`
- **Usage** : Auth
- **Canonique** : `View:AdminLoginView`
- **Endpoints** : `/api/auth/login/`
- **État** : 🟢

### AdminVerifyView
- **Code réel** : `AdminVerifyView` (class)
- **Type** : View
- **Emplacement** : `backend/api/auth_views.py`
- **Usage** : Auth
- **Canonique** : `View:AdminVerifyView`
- **Endpoints** : `/api/auth/verify/`
- **État** : 🟢

### ClientLoginView
- **Code réel** : `ClientLoginView` (class)
- **Type** : View
- **Emplacement** : `backend/api/auth_views.py`
- **Usage** : Auth
- **Canonique** : `View:ClientLoginView`
- **Endpoints** : `/api/auth/client/login/`
- **État** : 🟢

### BillingDocumentViewSet
- **Code réel** : `BillingDocumentViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Facturation
- **Canonique** : `View:BillingDocumentViewSet`
- **Endpoints** : `/api/billing/documents/` (CRUD)
- **Serializer** : `Serializer:BillingDocumentSerializer`
- **État** : 🟢

### PaymentViewSet
- **Code réel** : `PaymentViewSet` (class)
- **Type** : View
- **Emplacement** : `backend/api/views.py`
- **Usage** : Facturation
- **Canonique** : `View:PaymentViewSet`
- **Endpoints** : `/api/billing/payments/` (CRUD)
- **Serializer** : `Serializer:PaymentSerializer`
- **État** : 🟢

---

## 🤖 Views AI (`hadara_ai`)

### agent_list
- **Code réel** : `agent_list` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA
- **Canonique** : `View:agent_list`
- **Endpoints** : `/api/ai/v1/agents/`
- **État** : 🟢

### agent_run
- **Code réel** : `agent_run` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA
- **Canonique** : `View:agent_run`
- **Endpoints** : `/api/ai/v1/agents/run/`
- **État** : 🟢

### brief_analyze
- **Code réel** : `brief_analyze` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA
- **Canonique** : `View:brief_analyze`
- **Endpoints** : `/api/ai/v1/briefs/{id}/analyze/`
- **État** : 🟢

### brief_pricing_agent
- **Code réel** : `brief_pricing_agent` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA / Facturation
- **Canonique** : `View:brief_pricing_agent`
- **Endpoints** : `/api/ai/v1/briefs/{id}/pricing-agent/`
- **État** : 🟢

### brief_creative_assistant
- **Code réel** : `brief_creative_assistant` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA
- **Canonique** : `View:brief_creative_assistant`
- **Endpoints** : `/api/ai/v1/briefs/{id}/creative-assistant/`
- **État** : 🟢

### brief_communication_agent
- **Code réel** : `brief_communication_agent` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA
- **Canonique** : `View:brief_communication_agent`
- **Endpoints** : `/api/ai/v1/briefs/{id}/communication-agent/`
- **État** : 🟢

### workflow_start
- **Code réel** : `workflow_start` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA (orchestration)
- **Canonique** : `View:workflow_start`
- **Endpoints** : `/api/ai/v1/workflow/start/`
- **État** : 🟢

### workflow_status
- **Code réel** : `workflow_status` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA (orchestration)
- **Canonique** : `View:workflow_status`
- **Endpoints** : `/api/ai/v1/workflow/{id}/status/`
- **État** : 🟢

### traces_view
- **Code réel** : `traces_view` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA (traçabilité)
- **Canonique** : `View:traces_view`
- **Endpoints** : `/api/ai/v1/traces/`
- **État** : 🟢

### analytics_dashboard
- **Code réel** : `analytics_dashboard` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA (analytics)
- **Canonique** : `View:analytics_dashboard`
- **Endpoints** : `/api/ai/v1/analytics/dashboard/`
- **État** : 🟢

### analytics_usage
- **Code réel** : `analytics_usage` (function-based view)
- **Type** : View
- **Emplacement** : `backend/hadara_ai/api/views.py`
- **Usage** : IA (analytics)
- **Canonique** : `View:analytics_usage`
- **Endpoints** : `/api/ai/v1/analytics/usage/`
- **État** : 🟢

---

## 🔧 Serializers

### BriefSerializer
- **Code réel** : `BriefSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py:8`
- **Usage** : Métier
- **Canonique** : `Serializer:BriefSerializer`
- **État** : 🟢

### ClientSerializer
- **Code réel** : `ClientSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py`
- **Usage** : Métier
- **Canonique** : `Serializer:ClientSerializer`
- **État** : 🟢

### TemplateSerializer
- **Code réel** : `TemplateSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py`
- **Usage** : Métier
- **Canonique** : `Serializer:TemplateSerializer`
- **État** : 🟢

### PortfolioItemSerializer
- **Code réel** : `PortfolioItemSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py`
- **Usage** : Métier
- **Canonique** : `Serializer:PortfolioItemSerializer`
- **État** : 🟢

### StoreProductSerializer
- **Code réel** : `StoreProductSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py`
- **Usage** : Métier
- **Canonique** : `Serializer:StoreProductSerializer`
- **État** : 🟢

### BillingDocumentSerializer
- **Code réel** : `BillingDocumentSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py`
- **Usage** : Facturation
- **Canonique** : `Serializer:BillingDocumentSerializer`
- **État** : 🟢

### PaymentSerializer
- **Code réel** : `PaymentSerializer` (class)
- **Type** : Serializer
- **Emplacement** : `backend/api/serializers.py`
- **Usage** : Facturation
- **Canonique** : `Serializer:PaymentSerializer`
- **État** : 🟢

---

## 🧠 Agents IA

### BriefAnalyst
- **Code réel** : `BriefAnalyst` (class)
- **Type** : Agent
- **Emplacement** : `backend/hadara_ai/agents/brief_analyst.py`
- **Usage** : IA — Analyse de briefs
- **Canonique** : `Agent:BriefAnalyst`
- **Système** : `BRIEF_ANALYST_SYSTEM_PROMPT` (défini dans le même fichier)
- **État** : 🟢
- **Entrée** : Brief fields (JSON) + contexte projet
- **Sortie** : Analyse structurée (analyse, recommendations, risks)
- **Outils utilisés** : `Tool:brief_get`, `Tool:client_get`
- **Appelé par** : `View:brief_analyze`, `Workflow:WorkflowOrchestrator`

### BriefAnalystService
- **Code réel** : `BriefAnalystService` (class)
- **Type** : Agent (service layer)
- **Emplacement** : `backend/hadara_ai/agents/brief_analyst_service.py`
- **Usage** : IA — Analyse de briefs (service)
- **Canonique** : `Agent:BriefAnalystService`
- **État** : 🟢
- **Appelé par** : `View:brief_analyze`

### PricingAgent
- **Code réel** : `PricingAgent` (class)
- **Type** : Agent
- **Emplacement** : `backend/hadara_ai/agents/pricing_agent.py`
- **Usage** : IA / Facturation — Estimation de prix
- **Canonique** : `Agent:PricingAgent`
- **Système** : `PRICING_AGENT_SYSTEM_PROMPT` (défini dans le même fichier)
- **État** : 🟢
- **Entrée** : Brief fields + contexte projet
- **Sortie** : Estimation de prix (pricing_breakdown, pricing_summary)
- **Outils utilisés** : `Tool:brief_get`, `Tool:pricing_calculate`
- **Appelé par** : `View:brief_pricing_agent`, `Workflow:WorkflowOrchestrator`

### PricingAgentService
- **Code réel** : `PricingAgentService` (class)
- **Type** : Agent (service layer)
- **Emplacement** : `backend/hadara_ai/agents/pricing_agent_service.py`
- **Usage** : IA / Facturation (service)
- **Canonique** : `Agent:PricingAgentService`
- **État** : 🟢
- **Appelé par** : `View:brief_pricing_agent`

### CreativeAssistant
- **Code réel** : `CreativeAssistant` (class)
- **Type** : Agent
- **Emplacement** : `backend/hadara_ai/agents/creative_assistant.py`
- **Usage** : IA — Suggestions créatives
- **Canonique** : `Agent:CreativeAssistant`
- **Système** : `CREATIVE_ASSISTANT_SYSTEM_PROMPT` (défini dans le même fichier)
- **État** : 🟢
- **Entrée** : Brief fields + contexte projet
- **Sortie** : Suggestions créatives (concept, style, palette, deliverables, moodboard_keywords)
- **Outils utilisés** : `Tool:brief_get`, `Tool:client_history`
- **Appelé par** : `View:brief_creative_assistant`, `Workflow:WorkflowOrchestrator`
- **Qualité** : Validate par `Brand:validate_creative_output`

### CreativeAssistantService
- **Code réel** : `CreativeAssistantService` (class)
- **Type** : Agent (service layer)
- **Emplacement** : `backend/hadara_ai/agents/creative_assistant_service.py`
- **Usage** : IA (service)
- **Canonique** : `Agent:CreativeAssistantService`
- **État** : 🟢
- **Appelé par** : `View:brief_creative_assistant`

### CommunicationAgent
- **Code réel** : `CommunicationAgent` (class)
- **Type** : Agent
- **Emplacement** : `backend/hadara_ai/agents/communication_agent.py`
- **Usage** : IA — Communication client
- **Canonique** : `Agent:CommunicationAgent`
- **Système** : `COMMUNICATION_AGENT_SYSTEM_PROMPT` (défini dans le même fichier)
- **État** : 🟢
- **Entrée** : Brief fields + contexte projet
- **Sortie** : Messages client (greeting, project_presentation, process_explanation, next_steps)
- **Outils utilisés** : `Tool:brief_get`, `Tool:client_get`
- **Appelé par** : `View:brief_communication_agent`, `Workflow:WorkflowOrchestrator`

### CommunicationAgentService
- **Code réel** : `CommunicationAgentService` (class)
- **Type** : Agent (service layer)
- **Emplacement** : `backend/hadara_ai/agents/communication_agent_service.py`
- **Usage** : IA (service)
- **Canonique** : `Agent:CommunicationAgentService`
- **État** : 🟢
- **Appelé par** : `View:brief_communication_agent`

---

## ⚙️ Services IA

### AgentEngine
- **Code réel** : `AgentEngine` (class)
- **Type** : Engine
- **Emplacement** : `backend/hadara_ai/agents/engine.py`
- **Usage** : IA — Moteur d'exécution d'agents
- **Canonique** : `Engine:AgentEngine`
- **État** : 🟢
- **Données** : `AgentStep`, `AgentResult` (dataclasses dans le même fichier)
- **Appelé par** : Tous les agents (BriefAnalyst, PricingAgent, CreativeAssistant, CommunicationAgent)

### ModelRouter
- **Code réel** : `ModelRouter` (class)
- **Type** : Router
- **Emplacement** : `backend/hadara_ai/agents/routing.py`
- **Usage** : IA — Routage de modèles
- **Canonique** : `Router:ModelRouter`
- **Erreur** : `ModelRouterError`
- **État** : 🟢
- **Appelé par** : `Engine:AgentEngine`

### PromptEngine
- **Code réel** : `PromptEngine` (class)
- **Type** : Engine
- **Emplacement** : `backend/hadara_ai/prompts/engine.py`
- **Usage** : IA — Gestion des prompts
- **Canonique** : `Engine:PromptEngine`
- **État** : 🟢
- **Appelé par** : `Engine:AgentEngine`

### ai_service
- **Code réel** : `get_ai_response` (function)
- **Type** : Service
- **Emplacement** : `backend/hadara_ai/services/ai_service.py`
- **Usage** : IA — Point d'entrée principal pour les appels IA
- **Canonique** : `Service:get_ai_response`
- **Alias** : `analyze_brief_with_ai` (dans le même fichier)
- **État** : 🟢
- **Dépendances** : `Provider:ProviderRegistry`

---

## 🔌 Providers IA

### ProviderRegistry
- **Code réel** : `ProviderRegistry` (class)
- **Type** : Registry
- **Emplacement** : `backend/hadara_ai/providers/registry.py`
- **Usage** : IA — Registre des providers
- **Canonique** : `Provider:ProviderRegistry`
- **État** : 🟢
- **Providers enregistrés** : `Provider:GroqProvider`, `Provider:OpenAIProvider`, `Provider:GeminiProvider`
- **Appelé par** : `Service:get_ai_response`, `Engine:AgentEngine`

### GroqProvider
- **Code réel** : `GroqProvider` (class)
- **Type** : Provider
- **Emplacement** : `backend/hadara_ai/providers/groq_provider.py`
- **Usage** : IA — Provider Groq
- **Canonique** : `Provider:GroqProvider`
- **État** : 🟢
- **Modèles** : llama-3.3-70b-versatile, mixtral-8x7b-32768, gemma2-9b-it
- **Dépendances** : `🔵 EXTERNAL` — SDK `groq`
- **Appelé par** : `Provider:ProviderRegistry`

### OpenAIProvider
- **Code réel** : `OpenAIProvider` (class)
- **Type** : Provider
- **Emplacement** : `backend/hadara_ai/providers/openai_provider.py`
- **Usage** : IA — Provider OpenAI
- **Canonique** : `Provider:OpenAIProvider`
- **État** : 🟢
- **Modèles** : gpt-4o, gpt-4o-mini
- **Dépendances** : `🔵 EXTERNAL` — SDK `openai`
- **Appelé par** : `Provider:ProviderRegistry`

### GeminiProvider
- **Code réel** : `GeminiProvider` (class)
- **Type** : Provider
- **Emplacement** : `backend/hadara_ai/providers/gemini_provider.py`
- **Usage** : IA — Provider Google Gemini
- **Canonique** : `Provider:GeminiProvider`
- **État** : 🟢
- **Modèles** : gemini-1.5-flash, gemini-1.5-pro
- **Dépendances** : `🔵 EXTERNAL` — SDK `google-generativeai`
- **Appelé par** : `Provider:ProviderRegistry`

### AbstractAIProvider
- **Code réel** : `AbstractAIProvider` (class)
- **Type** : Abstract
- **Emplacement** : `backend/hadara_ai/providers/base.py`
- **Usage** : IA — Classe abstraite pour les providers
- **Canonique** : `Abstract:AbstractAIProvider`
- **État** : 🟢
- **Données** : `AIResponse` (dataclass dans le même fichier)

---

## 🛠️ Outils IA (Tools)

### ToolRegistry
- **Code réel** : `ToolRegistry` (class)
- **Type** : Registry
- **Emplacement** : `backend/hadara_ai/tools/registry.py`
- **Usage** : IA — Registre des outils
- **Canonique** : `Tool:ToolRegistry`
- **État** : 🟢
- **Données** : `ToolDefinition` (dataclass dans le même fichier)
- **Appelé par** : `Engine:AgentEngine`

### brief_get
- **Code réel** : `brief_get` (function)
- **Type** : Tool
- **Emplacement** : `backend/hadara_ai/tools/implementations.py`
- **Usage** : IA — Récupération d'un brief
- **Canonique** : `Tool:brief_get`
- **État** : 🟢
- **Entrée** : brief_id (int)
- **Sortie** : Brief JSON
- **Appelé par** : `Agent:BriefAnalyst`, `Agent:PricingAgent`, `Agent:CreativeAssistant`, `Agent:CommunicationAgent`

### client_get
- **Code réel** : `client_get` (function)
- **Type** : Tool
- **Emplacement** : `backend/hadara_ai/tools/implementations.py`
- **Usage** : IA — Récupération d'un client
- **Canonique** : `Tool:client_get`
- **État** : 🟢
- **Entrée** : client_id (int)
- **Sortie** : Client JSON
- **Appelé par** : `Agent:BriefAnalyst`, `Agent:CommunicationAgent`

### client_history
- **Code réel** : `client_history` (function)
- **Type** : Tool
- **Emplacement** : `backend/hadara_ai/tools/implementations.py`
- **Usage** : IA — Historique d'un client
- **Canonique** : `Tool:client_history`
- **État** : 🟢
- **Entrée** : client_id (int)
- **Sortie** : Historique JSON
- **Appelé par** : `Agent:CreativeAssistant`

### pricing_calculate
- **Code réel** : `pricing_calculate` (function)
- **Type** : Tool
- **Emplacement** : `backend/hadara_ai/tools/implementations.py`
- **Usage** : IA / Facturation — Calcul de prix
- **Canonique** : `Tool:pricing_calculate`
- **État** : 🟢
- **Entrée** : brief_id, project_type, format, usage, deadline, budget_range
- **Sortie** : Estimation de prix (FCFA)
- **Dépendances** : `Service:HADARA_PRICING` (pure Python, pas d'IA)
- **Appelé par** : `Agent:PricingAgent`

### brief_analyze
- **Code réel** : `brief_analyze` (function)
- **Type** : Tool
- **Emplacement** : `backend/hadara_ai/tools/implementations.py`
- **Usage** : IA — Analyse de brief (via IA)
- **Canonique** : `Tool:brief_analyze`
- **État** : 🟢
- **Entrée** : brief_id (int)
- **Sortie** : Analyse IA structurée
- **Dépendances** : `Service:ai_service.get_ai_response`

---

## 🏷️ Outils Métier (Legacy)

### HadaraPricingEngine
- **Code réel** : `HadaraPricingEngine` (class)
- **Type** : Service
- **Emplacement** : `backend/api/pricing_engine.py`
- **Usage** : Facturation — Moteur de tarification
- **Canonique** : `Service:HADARA_PRICING`
- **Alias/Legacy** : `HADARA_PRICING` (instance globale)
- **État** : 🟢
- **Méthodes** : `estimate_price()`, `get_price_range()`
- **Dépendances** : Aucune (pure Python)

### analyze_brief_with_ai (legacy)
- **Code réel** : `analyze_brief_with_ai` (function)
- **Type** : Service
- **Emplacement** : `backend/api/ai_utils.py`
- **Usage** : IA (legacy)
- **Canonique** : `Service:analyze_brief_with_ai_legacy`
- **Alias/Legacy** : `/api/ai-analyze/{pk}/` endpoint
- **État** : 🟠 (legacy — utilise Groq/llama directement, non structuré)
- **Dépendances** : `🔵 EXTERNAL` — Groq API (llama-3.3-70b-versatile)

---

## 🎨 Brand / Qualité

### HADARA_DNA
- **Code réel** : `HADARA_DNA` (dict)
- **Type** : Constant
- **Emplacement** : `backend/hadara_ai/brand/dna.py`
- **Usage** : Brand
- **Canonique** : `Constant:HADARA_DNA`
- **État** : 🟢
- **Contenu** : valeurs, ton, mission, public_cible, avantages_clés, elements_visuels, mots_interdits
- **Fonction** : `get_brand_context_for_prompt()` → injecte le contexte brand dans les prompts IA
- **Appelé par** : `Agent:BriefAnalyst`, `Agent:PricingAgent`, `Agent:CreativeAssistant`, `Agent:CommunicationAgent`

### validate_creative_output
- **Code réel** : `validate_creative_output` (function)
- **Type** : QualityGate
- **Emplacement** : `backend/hadara_ai/brand/quality_gate.py`
- **Usage** : Brand — Contrôle qualité
- **Canonique** : `Brand:validate_creative_output`
- **État** : 🟢
- **Données** : `QualityGateResult` (dataclass dans le même fichier)
- **Appelé par** : `Agent:CreativeAssistant`

---

## 📊 Traçabilité / Analytics

### ExecutionTraceService
- **Code réel** : `ExecutionTraceService` (class)
- **Type** : Service
- **Emplacement** : `backend/hadara_ai/tracing/service.py`
- **Usage** : IA — Traçabilité des exécutions
- **Canonique** : `Tracing:ExecutionTraceService`
- **État** : 🟢
- **Appelé par** : `Engine:AgentEngine`

### CostCalculator
- **Code réel** : `CostCalculator` (class)
- **Type** : Service
- **Emplacement** : `backend/hadara_ai/tracing/aggregator.py`
- **Usage** : IA — Calcul des coûts
- **Canonique** : `Aggregator:CostCalculator`
- **État** : 🟢

### UsageAggregator
- **Code réel** : `UsageAggregator` (class)
- **Type** : Service
- **Emplacement** : `backend/hadara_ai/tracing/aggregator.py`
- **Usage** : IA — Agrégation de l'utilisation
- **Canonique** : `Aggregator:UsageAggregator`
- **État** : 🟢

### AnalyticsService
- **Code réel** : `AnalyticsService` (class)
- **Type** : Service
- **Emplacement** : `backend/hadara_ai/analytics/service.py`
- **Usage** : IA — Analytics
- **Canonique** : `Service:AnalyticsService`
- **État** : 🟢

---

## 🔄 Workflow / Orchestration

### WorkflowOrchestrator
- **Code réel** : `WorkflowOrchestrator` (class)
- **Type** : Orchestrator
- **Emplacement** : `backend/hadara_ai/workflow/orchestrator.py`
- **Usage** : IA — Orchestration multi-agents
- **Canonique** : `Workflow:WorkflowOrchestrator`
- **État** : 🟢
- **Étapes** : BriefAnalyst → PricingAgent → CreativeAssistant → CommunicationAgent
- **Appelé par** : `View:workflow_start`

---

## 🖥️ Frontend — Composants React

### App (Root)
- **Code réel** : `App` (function component)
- **Type** : Component
- **Emplacement** : `src/App.tsx`
- **Usage** : Frontend — Routeur principal
- **Canonique** : `Component:App`
- **État** : 🟢
- **Routes** : `/` (Accueil), `/brief` (BriefForm), `/admin` (AdminDashboard lazy), `/admin/kanban` (KanbanTab), `/admin/project360` (Project360Modal), `/store` (HadaraStore), `/login` (LoginView), `/client-portal` (ClientPortalView)
- **State** : `isAuthenticated`, `userRole`, `userEmail`, `userName`, `userOrganization`

### AdminDashboard
- **Code réel** : `AdminDashboard` (lazy-loaded)
- **Type** : Component
- **Emplacement** : `src/components/admin/AdminDashboard.tsx`
- **Usage** : Admin
- **Canonique** : `Component:AdminDashboard`
- **État** : 🟢
- **Sous-composants** : `Component:KanbanTab`, `Component:Project360Modal`, `Component:BriefAnalysisPanel`, `Component:PricingAgentPanel`, `Component:CreativeAssistantPanel`, `Component:CommunicationAgentPanel`, `Component:WorkflowPanel`, `Component:AnalyticsDashboardPanel`, `Component:MigrationTool`

### KanbanTab
- **Code réel** : `KanbanTab` (function component)
- **Type** : Component
- **Emplacement** : `src/components/admin/KanbanTab.tsx`
- **Usage** : Admin
- **Canonique** : `Component:KanbanTab`
- **État** : 🟢

### Project360Modal
- **Code réel** : `Project360Modal` (function component)
- **Type** : Component
- **Emplacement** : `src/components/admin/Project360Modal.tsx`
- **Usage** : Admin
- **Canonique** : `Component:Project360Modal`
- **État** : 🟢

### BriefForm
- **Code réel** : `BriefForm` (function component)
- **Type** : Component
- **Emplacement** : `src/components/BriefForm.tsx`
- **Usage** : Frontend — Formulaire 5 étapes
- **Canonique** : `Component:BriefForm`
- **État** : 🟢
- **Endpoints** : POST `/api/briefs/`

### AIChatWidget
- **Code réel** : `AIChatWidget` (function component)
- **Type** : Component
- **Emplacement** : `src/components/AIChatWidget.tsx`
- **Usage** : Frontend — Chatbot legacy
- **Canonique** : `Component:AIChatWidget`
- **Alias/Legacy** : `/api/chat/`
- **État** : 🟠 (legacy — appelle `/api/chat/` qui utilise Groq directement)

### ClientPortalView
- **Code réel** : `ClientPortalView` (function component)
- **Type** : Component
- **Emplacement** : `src/components/client/ClientPortalView.tsx`
- **Usage** : Frontend — Portail client
- **Canonique** : `Component:ClientPortalView`
- **État** : 🟢
- **Endpoints** : GET `/api/client-briefs/{id}/`

### HadaraStore
- **Code réel** : `HadaraStore` (function component)
- **Type** : Component
- **Emplacement** : `src/components/HadaraStore.tsx`
- **Usage** : Frontend — Boutique
- **Canonique** : `Component:HadaraStore`
- **État** : 🟢
- **Endpoints** : GET `/api/store/products/`

---

## 📋 Enums / Statuts

### BriefStatus
- **Code réel** : `BRIEF_STATUS_CHOICES` (Python), `BriefStatus` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:24` (Python), `src/types.ts` (TS)
- **Usage** : Métier
- **Canonique** : `Enum:BriefStatus`
- **Valeurs** :
  - `nouveau` — Nouveau brief
  - `en_cours` — En cours de traitement
  - `termine` — Projet terminé
  - `archive` — Archivé
- **État** : 🟢

### ProjectType
- **Code réel** : `PROJECT_TYPE_CHOICES` (Python), `ProjectType` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:30` (Python), `src/types.ts` (TS)
- **Usage** : Métier
- **Canonique** : `Enum:ProjectType`
- **Valeurs** :
  - `affiche` — Affiche / Poster
  - `logo` — Logo / Identité visuelle
  - `brochure` — Brochure / Flyer
  - `cv` — CV / Portfolio
  - `carte_visite` — Carte de visite
  - `reseaux_sociaux` — Contenu réseaux sociaux
  - `presentation` — Présentation / Slide
  - `banniere` — Bannière / Header
  - `autre` — Autre (utilise project_type_custom)
- **État** : 🟢

### UsageType
- **Code réel** : `USAGE_TYPE_CHOICES` (Python), `UsageType` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:41` (Python), `src/types.ts` (TS)
- **Usage** : Métier
- **Canonique** : `Enum:UsageType`
- **Valeurs** :
  - `impression` — Impression
  - `web` — Web / Digital
  - `les_deux` — Impression + Web
- **État** : 🟢

### TechnicalFormat
- **Code réel** : `TECHNICAL_FORMAT_CHOICES` (Python), `TechnicalFormat` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:47` (Python), `src/types.ts` (TS)
- **Usage** : Métier
- **Canonique** : `Enum:TechnicalFormat`
- **Valeurs** :
  - `a4` — A4
  - `a3` — A3
  - `a5` — A5
  - `carrer` — Carré
  - `paysage` — Paysage
  - `custom` — Personnalisé (utilise custom_dimensions)
- **État** : 🟢

### StoreProductStatus
- **Code réel** : `STATUS_CHOICES` (Python), `StoreProductStatus` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:97` (Python), `src/types.ts` (TS)
- **Usage** : Métier
- **Canonique** : `Enum:StoreProductStatus`
- **Valeurs** :
  - `in_stock` — En stock
  - `available_24_48h` — Disponible 24-48h
  - `on_order` — Sur commande
  - `unavailable` — Indisponible
- **État** : 🟢

### DocType
- **Code réel** : `DOC_TYPE_CHOICES` (Python), `DocType` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:118` (Python), `src/types.ts` (TS)
- **Usage** : Facturation
- **Canonique** : `Enum:DocType`
- **Valeurs** :
  - `proforma` — Proforma
  - `facture` — Facture
  - `avoir` — Avoir
- **État** : 🟢

### PaymentStatus
- **Code réel** : `PAYMENT_STATUS_CHOICES` (Python), `PaymentStatus` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:125` (Python), `src/types.ts` (TS)
- **Usage** : Facturation
- **Canonique** : `Enum:PaymentStatus`
- **Valeurs** :
  - `brouillon` — Brouillon
  - `en_attente` — En attente de paiement
  - `acompte` — Acompte reçu
  - `partiel` — Partiellement payé
  - `paye` — Payé ✅
  - `en_retard` — En retard 🔴
  - `annule` — Annulé
- **État** : 🟢

### PaymentMethod
- **Code réel** : `PAYMENT_METHOD_CHOICES` (Python), `PaymentMethod` (TS)
- **Type** : Enum
- **Emplacement** : `backend/api/models.py:171` (Python), `src/types.ts` (TS)
- **Usage** : Facturation
- **Canonique** : `Enum:PaymentMethod`
- **Valeurs** :
  - `wave` — 🟣 Wave
  - `orange_money` — 🟠 Orange Money
  - `especes` — 💵 Espèces
  - `virement` — 🏦 Virement
  - `cheque` — 📋 Chèque
  - `autre` — 💳 Autre
- **État** : 🟢

### UserRole
- **Code réel** : `UserRole` (TS)
- **Type** : Enum
- **Emplacement** : `src/types.ts`
- **Usage** : Auth
- **Canonique** : `Enum:UserRole`
- **Valeurs** :
  - `admin` — Administrateur
  - `client` — Client
- **État** : 🟢

### ExecutionStatus
- **Code réel** : `ExecutionStatus` (TS), `EXECUTION_STATUS_CHOICES` (Python)
- **Type** : Enum
- **Emplacement** : `src/types.ts`, `backend/hadara_ai/models/trace.py`
- **Usage** : IA (traçabilité)
- **Canonique** : `Enum:ExecutionStatus`
- **Valeurs** :
  - `pending` — En attente
  - `running` — En cours
  - `completed` — Terminé
  - `failed` — Échoué
  - `timeout` — Timeout
  - `rate_limited` — Rate limited
  - `cancelled` — Annulé
- **État** : 🟢

### RetentionPolicy
- **Code réel** : `RETENTION_POLICY` (Python dict)
- **Type** : Constant
- **Emplacement** : `backend/hadara_ai/models/trace.py`
- **Usage** : IA (traçabilité)
- **Canonique** : `Constant:RetentionPolicy`
- **État** : 🟢
- **Contenu** : Rétention par type (default 365 jours, failed 90 jours, etc.)

---

## 🔗 Routes Backend (URL Configuration)

### api_patterns
- **Code réel** : `urlpatterns` (list)
- **Type** : URLConfig
- **Emplacement** : `backend/api/urls.py`
- **Usage** : Métier
- **Canonique** : `URL:api_patterns`
- **Préfixe** : `/api/`
- **Routes** : `briefs/`, `clients/`, `templates/`, `portfolio/`, `store-products/`, `billing-documents/`, `payments/`, `admin-login/`, `admin-verify/`, `client-login/`, `admin/logs/`, `ai-analyze/{pk}/`, `chat/`, `ocr-correct/`, `client-briefs/{id}/`
- **État** : 🟢

### ai_patterns
- **Code réel** : `urlpatterns` (list)
- **Type** : URLConfig
- **Emplacement** : `backend/hadara_ai/api/urls.py`
- **Usage** : IA
- **Canonique** : `URL:ai_patterns`
- **Préfixe** : `/api/ai/v1/`
- **Routes** : `agents/`, `agents/run/`, `briefs/{id}/analyze/`, `briefs/{id}/pricing-agent/`, `briefs/{id}/creative-assistant/`, `briefs/{id}/communication-agent/`, `workflow/start/`, `workflow/{id}/status/`, `traces/`, `analytics/dashboard/`, `analytics/usage/`
- **État** : 🟢

### root_urlconf
- **Code réel** : `urlpatterns` (list)
- **Type** : URLConfig
- **Emplacement** : `backend/hadara_project/urls.py`
- **Usage** : Métier + IA
- **Canonique** : `URL:root_urlconf`
- **Préfixes** : `/api/` → api_patterns, `/api/ai/v1/` → ai_patterns, `/api/django-admin/` → Django admin
- **État** : 🟢

---

## 📐 Types TypeScript (Frontend)

### BriefData
- **Code réel** : `BriefData` (interface)
- **Type** : Type
- **Emplacement** : `src/types.ts`
- **Usage** : Frontend — Données brief
- **Canonique** : `Type:BriefData`
- **État** : 🟢
- **Champs** : id, reference_code, status, project_type, technical_format, budget_range, preferred_colors, avoid_colors, style_preferences, context_description, primary_objective, target_audience, full_text_content, main_title, attachments, client_name, organization, email, whatsapp, city_country, critical_deadline, quoted_price_fcfa, designer_notes, ai_analysis, created_at

### BillingDocumentData
- **Code réel** : `BillingDocumentData` (interface)
- **Type** : Type
- **Emplacement** : `src/types.ts`
- **Usage** : Frontend — Données facturation
- **Canonique** : `Type:BillingDocumentData`
- **État** : 🟢

### PaymentData
- **Code réel** : `PaymentData` (interface)
- **Type** : Type
- **Emplacement** : `src/types.ts`
- **Usage** : Frontend — Données paiement
- **Canonique** : `Type:PaymentData`
- **État** : 🟢

### ClientData
- **Code réel** : `ClientData` (interface)
- **Type** : Type
- **Emplacement** : `src/types.ts`
- **Usage** : Frontend — Données client
- **Canonique** : `Type:ClientData`
- **État** : 🟢

### StoreProductData
- **Code réel** : `StoreProductData` (interface)
- **Type** : Type
- **Emplacement** : `src/types.ts`
- **Usage** : Frontend — Données produit boutique
- **Canonique** : `Type:StoreProductData`
- **État** : 🟢

---

## ⚙️ Config Frontend

### config
- **Code réel** : `API_BASE` (const)
- **Type** : Config
- **Emplacement** : `src/config.ts`
- **Usage** : Frontend — Configuration API
- **Canonique** : `Config:API_BASE`
- **État** : 🟢
- **Valeurs** : dev → `http://localhost:8000`, prod → `https://hadara-backend.onrender.com`
- **Appelé par** : Tous les appels fetch du frontend

---

## 📦 Migrations

### 0015 (migration)
- **Code réel** : `0015_client_alter_brief_options_and_more` (Migration)
- **Type** : Migration
- **Emplacement** : `backend/api/migrations/0015_client_alter_brief_options_and_more.py`
- **Usage** : Métier
- **Canonique** : `Migration:0015`
- **État** : 🟢
- **Contenu** : Création des modèles Client, BillingDocument, BillingLine, Payment + alteration de Brief/Template/PortfolioItem/StoreProduct

---

## 🔵 Dépendances Externes (Backend)

### Django
- **Type** : Framework
- **Version** : 6.0
- **État** : 🟢

### Django REST Framework (DRF)
- **Type** : Framework
- **État** : 🟢

### Groq SDK
- **Type** : SDK
- **État** : 🟢
- **Utilisé par** : `Provider:GroqProvider`, `Service:analyze_brief_with_ai_legacy`

### OpenAI SDK
- **Type** : SDK
- **État** : 🟢
- **Utilisé par** : `Provider:OpenAIProvider`

### google-generativeai SDK
- **Type** : SDK
- **État** : 🟢
- **Utilisé par** : `Provider:GeminiProvider`

---

## 🔵 Dépendances Externes (Frontend)

### React
- **Type** : Framework
- **Version** : 19.1.0
- **État** : 🟢

### Tailwind CSS
- **Type** : CSS Framework
- **Version** : 4.1.12
- **État** : 🟢

### Vite
- **Type** : Build Tool
- **Version** : 8.3.6
- **État** : 🟢

### TypeScript
- **Type** : Language
- **Version** : 6.2.2
- **État** : 🟢

---

## 🗺️ Index de Navigation

| Fichier | Contenu |
|---------|---------|
| `00_INDEX.md` | Glossaire complet (ce fichier) |
| `CONVENTIONS.md` | Règles de nommage et marqueurs |
| `01_ARCHITECTURE.md` | *(WAVE 1)* Architecture backend + frontend |
| `02_FONCTIONNEL.md` | *(WAVE 1)* Fonctionnalités métier |
| `03_FLOWS.md` | *(WAVE 1)* Flux métier |
| `04_IA.md` | *(WAVE 1)* Système IA complet |
| `05_DB.md` | *(WAVE 1)* Modèle de données |
| `06_API.md` | *(WAVE 1)* Endpoints API |
| `07_FRONTEND.md` | *(WAVE 1)* Architecture frontend |
| `08_DEPENDANCES.md` | *(WAVE 1)* Dépendances |
| `09_PROBLEMS.md` | *(WAVE 1)* Problèmes détectés |
| `CROSS_CHECK_REPORT.md` | *(WAVE 2)* Vérification croisée |
| `CARTE_MERE.md` | *(WAVE 3)* Carte-mère |
| `MATRICE_PROBLEMES.md` | *(WAVE 4)* Matrice des risques |
| `DECISIONS.md` | *(WAVE 4)* Décisions techniques |
