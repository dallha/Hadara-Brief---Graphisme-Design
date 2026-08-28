# 13 — Architecture Cible

> Hadara Suite v2.3.0 → Gap Analysis vers Universal AI Layer
> Date : 2026-08-26 | Source : 10_CROSSCHECK.md + 11_DECISIONS.md

---

## 1. État Actuel vs Cible

```
ACTUEL                                    CIBLE
─────────                                 ──────
AIChatWidget 🔴                           Chatbot connecté au Core ✅
chat_api_view 🔴                          chat_with_assistant → Core ✅
ai_analyze_brief 🟠                       Supprimé ✅
analyze_brief_with_ai 🟠                  Supprimé ✅
ToolUsageLog 🟠                           Supprimé ✅
Token sessionStorage 🔴                   HttpOnly cookie ✅
3 endpoints sans auth 🔴                  Auth sur tous ✅
Pas de tests 🔴                           Tests minimaux ✅
```

---

## 2. Gap Analysis Détaillée

### 2.1 Chatbot (D01 + D02)

| Élément | Actuel | Cible | Effort |
|---------|--------|-------|--------|
| `AIChatWidget` | Appelle `/api/chat/` → cassé | Appelle `/api/ai/v1/chat/` → Core | 🟡 Moyen |
| `chat_api_view` | Importe `chat_with_assistant` (manquant) | Route vers `ChatService` du Core | 🟡 Moyen |
| `chat_with_assistant` | N'existe pas | Nouveau : appelle `get_ai_response()` | 🟡 Moyen |

**Architecture cible** :
```
AIChatWidget
    ↓
POST /api/ai/v1/chat/
    ↓
ChatService (nouveau)
    ↓
get_ai_response()
    ↓
ProviderRegistry → Groq/OpenAI/Gemini
```

### 2.2 Sécurité (D17 + D18)

| Élément | Actuel | Cible | Effort |
|---------|--------|-------|--------|
| Token admin | `sessionStorage` | HttpOnly cookie | 🟡 Moyen |
| Auth endpoints | 3 sans auth | `AdminTokenPermission` sur les 2 legacy | 🟢 Simple |
| Rate limiting | Aucun | `django-ratelimit` sur les endpoints IA | 🟡 Moyen |

### 2.3 Legacy IA (D03 + D04)

| Élément | Actuel | Cible | Effort |
|---------|--------|-------|--------|
| `ai_analyze_brief` | Appelle Gemini direct | Supprimé | 🟢 Simple |
| `analyze_brief_with_ai` | Appelle Groq direct | Supprimé | 🟢 Simple |
| `brief_analyze` tool | Appelle `analyze_brief_with_ai` | Appelle `BriefAnalystService` | 🟢 Simple |
| `ai_utils.py` | 154 lignes | Supprimé | 🟢 Simple |

### 2.4 Frontend

| Élément | Actuel | Cible | Effort |
|---------|--------|-------|--------|
| API calls | `fetch()` dans chaque composant | `apiClient` centralisé | 🟠 Élevé |
| State management | `useState` local | Zustand pour auth + briefs | 🟠 Élevé |
| Hooks custom | Aucun | `useBrief()`, `useAIAgent()`, etc. | 🟠 Élevé |
| Lazy loading | `AdminDashboard` seulement | Chaque panel IA en lazy | 🟡 Moyen |
| Tests | 0 | Tests minimaux (4 agents + auth) | 🟠 Élevé |

### 2.5 Backend

| Élément | Actuel | Cible | Effort |
|---------|--------|-------|--------|
| ToolRegistry | 5 outils hardcodés | Découverte automatique | 🟡 Moyen |
| Provider layer | 3 providers | + retry, circuit breaker | 🟡 Moyen |
| Tests | 0 | Tests minimaux (4 agents + pricing) | 🟠 Élevé |
| Email admin | Hardcodé | Variable d'env | 🟢 Simple |

---

## 3. Universal AI Layer — Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL AI LAYER                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ORCHESTRATION                         │   │
│  │  WorkflowOrchestrator │ ModelRouter │ PromptEngine       │   │
│  └──────────┬────────────┴──────┬───────┴──────┬───────────┘   │
│             │                   │              │                │
│  ┌──────────▼────┐  ┌──────────▼────┐  ┌─────▼──────────┐    │
│  │   AGENTS       │  │   TOOLS       │  │   TRACING      │    │
│  │  BriefAnalyst  │  │  brief_get    │  │  Execution     │    │
│  │  PricingAgent  │  │  client_get   │  │  CostCalculator│    │
│  │  CreativeAsst  │  │  pricing_calc │  │  UsageAggr.    │    │
│  │  CommAgent     │  │  brief_analyze│  │  Analytics     │    │
│  │  Chat (nouveau)│  │               │  │                │    │
│  └────────────────┘  └───────────────┘  └────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PROVIDERS                             │   │
│  │  Groq │ OpenAI │ Gemini │ (futur: Anthropic, Mistral)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BRAND                                 │   │
│  │  HADARA_DNA │ QualityGate │ PromptTemplates              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Plan de Migration

### Phase 1 — Réparation (Immédiat) ✅ COMPLÉTÉ
- [x] Recréer `chat_with_assistant` → Core (`ai_utils.py:28-58`)
- [x] Auth sur endpoints legacy (`AdminTokenPermission` sur OCR + ai-analyze)
- [x] Corriger les 6 URLs dans les cartes (06_API, 07_FRONTEND, 03_FLOWS, 00_INDEX, 02_FONCTIONNEL)
- [x] Réconcilier 8 endpoints IA manquants (06_API.md)
- [x] Réconcilier 13 champs DB manquants (05_DB.md)

### Phase 2 — Nettoyage (Avant MVP)
- [ ] Supprimer `ai_analyze_brief` de `views.py` (remplacer par Core)
- [ ] Supprimer l'ancien `analyze_brief_with_ai` de `ai_utils.py` (déjà remplacé par Core)
- [ ] Supprimer `ToolUsageLog` model (remplacé par `ToolExecution`)
- [ ] Mettre à jour `brief_analyze` tool → `BriefAnalystService`
- [ ] Tests minimaux (4 agents + auth + pricing)
- [ ] Sécuriser token (HttpOnly cookie au lieu de sessionStorage)

### Phase 3 — Frontend (After MVP)
- [ ] Créer `apiClient` centralisé
- [ ] Ajouter Zustand pour auth
- [ ] Hooks custom (`useBrief`, `useAIAgent`)
- [ ] Lazy loading panels IA

### Phase 4 — Universal AI Layer (Futur)
- [ ] ToolRegistry dynamique
- [ ] Retry + circuit breaker sur providers
- [ ] Nouveaux providers (Anthropic, Mistral)
- [ ] Prompt templates versionnés
- [ ] Analytics avancés (ROI, prédiction)

---

## 5. Stratégie de Migration Legacy → Core

### 5.1 Endpoint: `chat_api_view` → `chat_with_assistant` ✅
- **Actuel** : `chat_api_view` importe `chat_with_assistant` (manquant)
- **Corrigé** : `chat_with_assistant` utilise `get_ai_response()` du Core
- **Prochain** : Renommer endpoint en `/api/ai/v1/chat/` (Phase 2)

### 5.2 Endpoint: `ai_analyze_brief` → `brief_analyze` (Core)
- **Actuel** : Appelle Gemini directement (`genai.Client`)
- **Cible** : Supprimer, rediriger vers `POST /api/ai/v1/briefs/{id}/analyze/`
- **Migration** : Frontend doit appeler le nouveau endpoint
- **Rétrocompatibilité** : Garder l'ancien endpoint en mode dégradé pendant la transition

### 5.3 Endpoint: `ocr_correct_api_view` → Core
- **Actuel** : Appelle `correct_ocr_text()` (désormais utilise Core)
- **Corrigé** : Fonction restaurée dans `ai_utils.py:62-84`
- **Prochain** : Migrer vers un agent dédié dans le Core (Phase 3)

### 5.4 Tool: `brief_analyze` → `BriefAnalystService`
- **Actuel** : Appelle `analyze_brief_with_ai` de `ai_utils.py` (legacy)
- **Cible** : Utiliser `BriefAnalystService.analyze()` du Core
- **Migration** : Modifier `implementations.py:144-179` pour appeler le service

### 5.5 Modèle: `ToolUsageLog` → `ToolExecution`
- **Actuel** : `ToolUsageLog` dans `api/models.py`
- **Cible** : `ToolExecution` dans `hadara_ai/models/trace.py`
- **Migration** : Supprimer `ToolUsageLog` après vérification qu'aucun code ne l'utilise
