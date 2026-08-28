# 06 — API Endpoints

> Hadara Suite v2.3.0 — Cartographie des endpoints API
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵

---

## 1. URL Configuration

### 1.1 Root URLconf

**Emplacement** : `backend/hadara_project/urls.py`

```
/api/           → backend/api/urls.py (métier)
/api/ai/v1/     → backend/hadara_ai/api/urls.py (IA)
/api/django-admin/ → Django admin
```

### 1.2 API Métier

**Emplacement** : `backend/api/urls.py`
**Préfixe** : `/api/`

### 1.3 API IA

**Emplacement** : `backend/hadara_ai/api/urls.py`
**Préfixe** : `/api/ai/v1/`

---

## 2. Endpoints Métier

### 2.1 Briefs

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/briefs/` | `BriefViewSet` | `BriefSerializer` | 🟢 |
| `POST` | `/api/briefs/` | `BriefViewSet` | `BriefSerializer` | 🟢 |
| `GET` | `/api/briefs/{id}/` | `BriefViewSet` | `BriefSerializer` | 🟢 |
| `PUT` | `/api/briefs/{id}/` | `BriefViewSet` | `BriefSerializer` | 🟢 |
| `PATCH` | `/api/briefs/{id}/` | `BriefViewSet` | `BriefSerializer` | 🟢 |
| `DELETE` | `/api/briefs/{id}/` | `BriefViewSet` | `BriefSerializer` | 🟢 |

### 2.2 Clients

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/billing/clients/` | `ClientViewSet` | `ClientSerializer` | 🟢 |
| `POST` | `/api/billing/clients/` | `ClientViewSet` | `ClientSerializer` | 🟢 |
| `GET` | `/api/billing/clients/{id}/` | `ClientViewSet` | `ClientSerializer` | 🟢 |
| `PUT` | `/api/billing/clients/{id}/` | `ClientViewSet` | `ClientSerializer` | 🟢 |
| `DELETE` | `/api/billing/clients/{id}/` | `ClientViewSet` | `ClientSerializer` | 🟢 |

### 2.3 Templates

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/templates/` | `TemplateViewSet` | `TemplateSerializer` | 🟢 |
| `POST` | `/api/templates/` | `TemplateViewSet` | `TemplateSerializer` | 🟢 |

### 2.4 Portfolio

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/portfolio/` | `PortfolioItemViewSet` | `PortfolioItemSerializer` | 🟢 |
| `POST` | `/api/portfolio/` | `PortfolioItemViewSet` | `PortfolioItemSerializer` | 🟢 |

### 2.5 Store Products

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/store/products/` | `StoreProductViewSet` | `StoreProductSerializer` | 🟢 |
| `POST` | `/api/store/products/` | `StoreProductViewSet` | `StoreProductSerializer` | 🟢 |

### 2.6 Billing Documents

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/billing/documents/` | `BillingDocumentViewSet` | `BillingDocumentSerializer` | 🟢 |
| `POST` | `/api/billing/documents/` | `BillingDocumentViewSet` | `BillingDocumentSerializer` | 🟢 |
| `GET` | `/api/billing/documents/{id}/` | `BillingDocumentViewSet` | `BillingDocumentSerializer` | 🟢 |
| `PUT` | `/api/billing/documents/{id}/` | `BillingDocumentViewSet` | `BillingDocumentSerializer` | 🟢 |

### 2.7 Payments

| Méthode | Endpoint | View | Serializer | État |
|---------|----------|------|------------|------|
| `GET` | `/api/billing/payments/` | `PaymentViewSet` | `PaymentSerializer` | 🟢 |
| `POST` | `/api/billing/payments/` | `PaymentViewSet` | `PaymentSerializer` | 🟢 |

### 2.8 Auth

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `POST` | `/api/auth/login/` | `AdminLoginView` | 🟢 |
| `POST` | `/api/auth/verify/` | `AdminVerifyView` | 🟢 |
| `POST` | `/api/auth/client/login/` | `ClientLoginView` | 🟢 |

### 2.9 Legacy

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/admin/logs/` | `admin_logs` | 🟢 |
| `POST` | `/api/ai-analyze/{pk}/` | `ai_analyze_brief` | 🟠 |
| `POST` | `/api/chat/` | `chat_api_view` | 🟠 |
| `POST` | `/api/ocr-correct/` | `ocr_correct_api_view` | 🟡 |
| `GET` | `/api/client-briefs/{id}/` | (client portal) | 🟢 |

---

## 3. Endpoints IA (v1)

### 3.1 Agents

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/ai/v1/agents/` | `agent_list` | 🟢 |
| `POST` | `/api/ai/v1/agents/{pk}/run/` | `agent_run` | 🟢 |

### 3.2 Executions

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/ai/v1/executions/` | `execution_list` | 🟢 |
| `GET` | `/api/ai/v1/executions/{pk}/` | `execution_detail` | 🟢 |

### 3.3 Usage

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/ai/v1/usage/` | `usage_summary` | 🟢 |

### 3.4 Dashboard

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/ai/v1/dashboard/` | `dashboard` | 🟢 |

### 3.5 Brief Analysis

| Méthode | Endpoint | View | Agent | État |
|---------|----------|------|-------|------|
| `POST` | `/api/ai/v1/briefs/{id}/analyze/` | `brief_analyze` | `BriefAnalyst` | 🟢 |
| `GET` | `/api/ai/v1/briefs/{id}/analyses/` | `brief_analysis_history` | — | 🟢 |

### 3.6 Pricing Agent

| Méthode | Endpoint | View | Agent | État |
|---------|----------|------|-------|------|
| `POST` | `/api/ai/v1/briefs/{id}/pricing-agent/` | `brief_pricing_agent` | `PricingAgent` | 🟢 |

### 3.7 Creative Assistant

| Méthode | Endpoint | View | Agent | État |
|---------|----------|------|-------|------|
| `POST` | `/api/ai/v1/briefs/{id}/creative-assistant/` | `brief_creative_assistant` | `CreativeAssistant` | 🟢 |

### 3.8 Brand Context

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/ai/v1/brand-context/` | `brand_context` | 🟢 |

### 3.9 Communication Agent

| Méthode | Endpoint | View | Agent | État |
|---------|----------|------|-------|------|
| `POST` | `/api/ai/v1/briefs/{id}/communicate/` | `brief_communicate` | `CommunicationAgent` | 🟢 |

### 3.10 Workflow

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `POST` | `/api/ai/v1/briefs/{id}/workflow/` | `brief_workflow` | 🟢 |
| `GET` | `/api/ai/v1/briefs/{id}/workflows/` | `brief_workflow_history` | 🟢 |

### 3.11 Analytics

| Méthode | Endpoint | View | État |
|---------|----------|------|------|
| `GET` | `/api/ai/v1/analytics/dashboard/` | `analytics_dashboard` | 🟢 |
| `GET` | `/api/ai/v1/analytics/agents/` | `analytics_agents` | 🟢 |
| `GET` | `/api/ai/v1/analytics/trend/` | `analytics_trend` | 🟢 |
| `GET` | `/api/ai/v1/analytics/models/` | `analytics_models` | 🟢 |

---

## 4. Authentification

| Endpoint | Mécanisme | Header |
|----------|-----------|--------|
| `/api/auth/login/` | Password → TimestampSigner | — |
| `/api/auth/verify/` | Token → vérification | `Authorization: Bearer {token}` |
| `/api/auth/client/login/` | Code SMS/email → TimestampSigner | — |
| Tous les endpoints IA v1 | Token admin requis | `Authorization: Bearer {token}` |

---

## 5. Matrice des Endpoints par Feature

| Feature | Endpoints | Méthodes |
|---------|-----------|----------|
| Brief Management | `/api/briefs/` | CRUD |
| Client Management | `/api/billing/clients/` | CRUD |
| Templates | `/api/templates/` | CR |
| Portfolio | `/api/portfolio/` | CR |
| Store | `/api/store/products/` | CR |
| Billing | `/api/billing/documents/` | CRUD |
| Payments | `/api/billing/payments/` | CR |
| Auth Admin | `/api/auth/login/`, `/api/auth/verify/` | POST |
| Auth Client | `/api/auth/client/login/` | POST |
| Brief Analyst | `/api/ai/v1/briefs/{id}/analyze/` | POST |
| Pricing Agent | `/api/ai/v1/briefs/{id}/pricing-agent/` | POST |
| Creative Assistant | `/api/ai/v1/briefs/{id}/creative-assistant/` | POST |
| Communication Agent | `/api/ai/v1/briefs/{id}/communicate/` | POST |
| Workflow | `/api/ai/v1/briefs/{id}/workflow/`, `/api/ai/v1/briefs/{id}/workflows/` | POST, GET |
| Analytics | `/api/ai/v1/analytics/dashboard/`, `/api/ai/v1/analytics/agents/`, `/api/ai/v1/analytics/trend/`, `/api/ai/v1/analytics/models/` | GET |
| Executions | `/api/ai/v1/executions/`, `/api/ai/v1/executions/{pk}/` | GET |
| Usage | `/api/ai/v1/usage/` | GET |
| Dashboard | `/api/ai/v1/dashboard/` | GET |
| Brand Context | `/api/ai/v1/brand-context/` | GET |
| Chatbot (legacy) | `/api/chat/` | POST |
| AI Analyze (legacy) | `/api/ai-analyze/{pk}/` | POST |
