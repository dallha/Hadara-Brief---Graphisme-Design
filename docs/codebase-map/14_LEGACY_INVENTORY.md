# Phase 2.1 — Inventaire d'Utilisation du Legacy

> Date: 2026-08-28
> Status: **COMPLETED**
> Scope: Tous les éléments legacy liés à l'IA (endpoints, services, frontend, tests, modèles)

---

## Légende

| Marker | Signification |
|--------|---------------|
| 🟢 | Utilisé et nécessaire — conserver temporairement |
| 🟠 | Utilisé mais doublonné — migrer vers Core |
| 🟡 | Utilisé uniquement par Legacy — préparer dépréciation |
| 🔴 | Mort / orphelin — supprimer après vérification |
| 🐛 | Bug détecté |

---

## 1. ENDPOINTS (URL Patterns)

| # | Route | View | Auth | Status | Action |
|---|-------|------|------|--------|--------|
| 1 | `POST /api/chat/` | `chat_api_view` | Public | 🟠 Doublon | Frontend → migrer vers `/api/ai/v1/` |
| 2 | `POST /api/ocr-correct/` | `ocr_correct_api_view` | AdminToken | 🟠 Doublon | Frontend → migrer vers `/api/ai/v1/` |
| 3 | `POST /api/ai-analyze/<pk>/` | `ai_analyze_brief` | AdminToken | 🔴 Mort | Supprimer — aucun appelant frontend |

### Remplacements Core (`/api/ai/v1/`)

| Route | Remplace | Status |
|-------|----------|--------|
| `POST /api/ai/v1/briefs/<id>/analyze/` | `/api/ai-analyze/<pk>/` | 🟢 Actif |
| `POST /api/ai/v1/briefs/<id>/creative-assistant/` | — | 🟢 Actif |
| `POST /api/ai/v1/briefs/<id>/pricing-agent/` | — | 🟢 Actif |
| `POST /api/ai/v1/briefs/<id>/communicate/` | — | 🟢 Actif |
| `POST /api/ai/v1/briefs/<id>/workflow/` | — | 🟢 Actif |
| `GET /api/ai/v1/agents/` | — | 🟢 Actif |
| `GET /api/ai/v1/executions/` | — | 🟢 Actif |
| `GET /api/ai/v1/usage/` | — | 🟢 Actif |
| `GET /api/ai/v1/dashboard/` | — | 🟢 Actif |
| `GET /api/ai/v1/brand-context/` | — | 🟢 Actif |
| `GET /api/ai/v1/analytics/*` | — | 🟢 Actif |

---

## 2. VIEWS (View Functions)

### Backend Legacy — `backend/api/views.py`

| # | Function | Lignes | Ce qu'elle fait | Status |
|---|----------|--------|-----------------|--------|
| 1 | `chat_api_view` | 267-278 | Reçoit `messages[]`, appelle `chat_with_assistant()`, retourne `{reply}` | 🟠 Déjà migré vers Core via `ai_utils.py` |
| 2 | `ocr_correct_api_view` | 280-293 | Reçoit `{text}`, appelle `correct_ocr_text()`, retourne `{text}` | 🟠 Déjà migré vers Core via `ai_utils.py` |
| 3 | `ai_analyze_brief` | 295-379 | Appelle `google.genai` (Gemini) directement, contourne le Provider Layer | 🔴 **Aucun appelant frontend** — supprimer |

**Détail `ai_analyze_brief` :**
- Ligne 10-11 : `from google import genai` / `from google.genai import types`
- Ligne 307 : `client = genai.Client(api_key=api_key)` — accès direct à Gemini
- Ligne 363-369 : `client.models.generate_content(model='gemini-2.5-flash', ...)`
- Ligne 370-374 : Parse JSON, sauvegarde `brief.ai_analysis`
- **Problème** : Ce code contourne complètement le Provider Layer de Hadara AI Core

### Backend Core — `backend/hadara_ai/api/views.py`

| # | Function | Remplace | Status |
|---|----------|----------|--------|
| 1 | `brief_analyze` | `ai_analyze_brief` | 🟢 Actif |
| 2 | `brief_analysis_history` | — | 🟢 Actif |
| 3 | `brief_pricing_agent` | — | 🟢 Actif |
| 4 | `brief_creative_assistant` | — | 🟢 Actif |
| 5 | `brief_communicate` | — | 🟢 Actif |
| 6 | `brief_workflow` | — | 🟢 Actif |
| 7 | `agent_list`, `agent_run` | — | 🟢 Actif |
| 8 | `execution_list` | — | 🟢 Actif |
| 9 | `usage_summary`, `dashboard` | — | 🟢 Actif |
| 10 | `analytics_*` | — | 🟢 Actif |

---

## 3. SERVICES (ai_utils.py)

### `backend/api/ai_utils.py` — Fichier Legacy

| # | Function | Ce qu'elle fait | Status |
|---|----------|-----------------|--------|
| 1 | `chat_with_assistant(messages)` | Délègue à `get_ai_response()` du Core, prompt "Mme Niass Madina", fallback WhatsApp | 🟠 Redondant — le Core fait déjà le même travail |
| 2 | `correct_ocr_text(raw_text)` | Délègue à `get_ai_response()` du Core | 🟠 Redondant — marqué DEPRECATED dans la docstring |
| 3 | `_strip_markdown(text)` | Helper pour nettoyer les réponses IA | ⚪ Utilitaire interne |

**Problème d'architecture** : Ce fichier est une couche d'abstraction inutile. Les views appellent `ai_utils.py` qui appelle `ai_service.py`. La couche intermédiaire pourrait être supprimée.

### `hadara_ai/services/ai_service.py` — Core (canonical)

| # | Function | Ce qu'elle fait |
|---|----------|-----------------|
| 1 | `get_ai_response(messages, model, json_mode, **kwargs)` | Facade unifiée via `ProviderRegistry` |
| 2 | `analyze_brief_with_ai(brief, pricing_result)` | Analyse un brief, format AI-Safe, fallback |
| 3 | `_get_fallback_ai(pricing_result, reason)` | Structure dégradée sur erreur |

### `hadara_ai/tools/implementations.py` — Couche Outils

| # | Function | Legacy Dependency |
|---|----------|-------------------|
| 1 | `brief_analyze(arguments, context)` | Appelle `analyze_brief_with_ai()` depuis `ai_service.py` |
| 2 | `brief_get(arguments, context)` | Aucun |
| 3 | `client_get(arguments, context)` | Aucun |
| 4 | `client_history(arguments, context)` | Aucun |
| 5 | `pricing_calculate(arguments, context)` | Aucun |

---

## 4. FRONTEND (Composants Appelant Legacy)

| # | Composant | Fichier | Endpoint Appelé | Status |
|---|-----------|---------|-----------------|--------|
| 1 | `AIChatWidget` | `src/components/AIChatWidget.tsx:41` | `POST /api/chat/` | 🟠 À migrer vers `/api/ai/v1/` |
| 2 | `OCRTool` | `src/components/OCRTool.tsx:102` | `POST /api/ocr-correct/` | 🟠 À migrer vers `/api/ai/v1/` |
| 3 | `App.tsx` (handleAnalyzeWithAI) | `src/App.tsx:462` | `POST /api/briefs/${briefId}/analyze/` | 🔴 **Dead code** — fonction définie mais jamais appelée, endpoint inexistant |

### Composants déjà migrés vers Core

| # | Composant | Fichier | Endpoint |
|---|-----------|---------|----------|
| 1 | `BriefAnalysisPanel` | `src/components/admin/BriefAnalysisPanel.tsx` | `POST /api/ai/v1/briefs/<id>/analyze/` |
| 2 | `CreativeAssistantPanel` | `src/components/admin/CreativeAssistantPanel.tsx` | `POST /api/ai/v1/briefs/<id>/creative-assistant/` |
| 3 | `PricingAgentPanel` | `src/components/admin/PricingAgentPanel.tsx` | `POST /api/ai/v1/briefs/<id>/pricing-agent/` |
| 4 | `WorkflowPanel` | `src/components/admin/WorkflowPanel.tsx` | `POST /api/ai/v1/briefs/<id>/workflow/` |
| 5 | `CommunicationAgentPanel` | `src/components/admin/CommunicationAgentPanel.tsx` | `POST /api/ai/v1/briefs/<id>/communicate/` |
| 6 | `AnalyticsDashboardPanel` | `src/components/admin/AnalyticsDashboardPanel.tsx` | `GET /api/ai/v1/analytics/*` |

---

## 5. TESTS

| # | Fichier | Ce qu'il teste | Status |
|---|---------|----------------|--------|
| 1 | `backend/api/tests/test_chatbot.py` | `chat_api_view` (22 tests, 12 scénarios) | 🟢 Actif |
| 2 | `backend/api/tests/test_ai_utils.py` | `analyze_brief_with_ai` depuis `api.ai_utils` | 🔴 **BROKEN** — import cassé (fonction supprimée du fichier) |

### Tests Core

| # | Fichier | Status |
|---|---------|--------|
| 1 | `backend/hadara_ai/tests/test_api.py` | 🟢 |
| 2 | `backend/hadara_ai/tests/test_agents.py` | 🟢 |
| 3 | `backend/hadara_ai/tests/test_tools.py` | 🟢 |
| 4 | `backend/hadara_ai/tests/test_providers.py` | 🟢 |
| 5 | `backend/hadara_ai/tests/test_tracing.py` | 🟢 |
| 6 | `backend/hadara_ai/tests/test_prompt_engine.py` | 🟢 |
| 7 | `backend/hadara_ai/tests/test_brief_analyst.py` | 🟢 |
| 8 | `backend/hadara_ai/tests/test_p0_1.py` | 🟢 |

---

## 6. MODÈLES

### `api.ToolUsageLog` (Legacy)

**Fichier** : `backend/api/models.py:530-542`

| Champ | Type | Notes |
|-------|------|-------|
| `tool_name` | CharField(max 100) | |
| `created_at` | DateTimeField(auto_now_add) | |
| `ip_address` | GenericIPAddressField(null) | |
| `details` | JSONField(default=dict) | |

**Utilisations** :
- `admin.py:893-894` : `@admin.register(ToolUsageLog)` — affichage admin uniquement
- `settings.py:229` : Icône admin `"fas fa-chart-line"`
- `settings.py:236` : Liste admin
- `migrations/0008_toolusagelog.py` : Création de la table
- `migrations/0009_seed_portfolio_and_templates.py:152-160` : Seed data

**Verdict** : 🔴 **Orphelin** — Aucun code ne écrit dans cette table depuis les endpoints IA. Le modèle existe mais n'est jamais utilisé dans le pipeline IA.

### Modèles Core (`hadara_ai`)

Tous les modèles Core sont actifs et utilisés :
- `AIProvider`, `AIProviderConfig` — configuration providers
- `PromptTemplate`, `PromptVersion` — versioning prompts
- `AgentDefinition` — définitions agents
- `BriefAIAnalysis` — résultats d'analyse
- `AIExecution`, `ToolExecution`, `UsageLog`, `CostLog` — traçabilité
- `AIWorkflowExecution`, `AIWorkflowStepExecution` — workflows
- `AIAgentUsageLog`, `AIDailyAggregate` — analytics

---

## 7. IMPORTS

### Imports directs de `api.ai_utils`

| Importeur | Fichier | Ligne | Importé |
|-----------|---------|-------|---------|
| `api/views.py` | `backend/api/views.py` | 273 | `chat_with_assistant` (runtime) |
| `api/views.py` | `backend/api/views.py` | 288 | `correct_ocr_text` (runtime) |
| `test_ai_utils.py` | `backend/api/tests/test_ai_utils.py` | 15-16 | `api.ai_utils` + `analyze_brief_with_ai` (**BROKEN**) |

### Imports de `hadara_ai.services.ai_service`

| Importeur | Fichier | Ligne | Importé |
|-----------|---------|-------|---------|
| `api/ai_utils.py` | `backend/api/ai_utils.py` | 46, 72 | `get_ai_response` |
| `api/admin.py` | `backend/api/admin.py` | 5, 238, 759 | `analyze_brief_with_ai` |
| `tools/implementations.py` | `backend/hadara_ai/tools/implementations.py` | 149, 174 | `analyze_brief_with_ai` |
| `agents/*.py` | 4 fichiers | Divers | `get_ai_response` |

### Gemini direct (contournant le Provider Layer)

| Fichier | Ligne | Usage |
|---------|-------|-------|
| `api/views.py` | 10-11 | `from google import genai` / `from google.genai import types` |
| `api/views.py` | 307 | `client = genai.Client(api_key=api_key)` |
| `api/views.py` | 363-369 | `client.models.generate_content(model='gemini-2.5-flash', ...)` |

---

## 8. BUGS DÉTECTÉS

### 🐛 BUG-1 : `admin.py` ligne 759 — Arguments manquants

```python
# Ligne 759 (admin action "generate_ai_analysis")
analysis_result = analyze_brief_with_ai(brief)  # ❌ 1 argument

# Mais la signature est :
def analyze_brief_with_ai(brief: Any, pricing_result: dict) -> dict:  # ✅ 2 arguments requis
```

**Impact** : `TypeError` au runtime quand un admin lance l'action "Générer l'Analyse IA du Brief" depuis le changelist.

### 🐛 BUG-2 : `test_ai_utils.py` ligne 16 — Import cassé

```python
from api.ai_utils import analyze_brief_with_ai  # ❌ Fonction supprimée d'ai_utils.py
```

**Impact** : `ImportError` au lancement des tests. Le fichier entier est cassé.

### 🐛 BUG-3 : `ai_analyze_brief` — Gemini direct, aucun appelant

```python
# Ligne 307-369 dans views.py
client = genai.Client(api_key=api_key)
response = client.models.generate_content(model='gemini-2.5-flash', ...)
```

**Impact** : Code mort (aucun frontend ne l'appelle), mais reste dans le codebase avec des credentials Potentiellement exposés.

---

## 9. MATRICE DE DÉCISION

| Élément | Frontend | Tests | Backend | Décision |
|---------|----------|-------|---------|----------|
| `POST /api/chat/` | `AIChatWidget` | ✅ 22 tests | `chat_api_view` → `ai_utils` → Core | 🟠 **Migrer** frontend vers Core |
| `POST /api/ocr-correct/` | `OCRTool` | ❌ Aucun | `ocr_correct_api_view` → `ai_utils` → Core | 🟠 **Migrer** frontend vers Core |
| `POST /api/ai-analyze/<pk>/` | ❌ Aucun | ❌ Aucun | `ai_analyze_brief` → Gemini direct | 🔴 **Supprimer** |
| `chat_with_assistant()` | — | ✅ | `ai_utils.py` → Core | 🟠 **Supprimer** la couche intermédiaire |
| `correct_ocr_text()` | — | ❌ | `ai_utils.py` → Core | 🟠 **Supprimer** la couche intermédiaire |
| `test_ai_utils.py` | — | 🔴 BROKEN | — | 🔴 **Réécrire** ou supprimer |
| `ToolUsageLog` | — | — | Admin only | 🔴 **Supprimer** après vérification |
| Imports `google.genai` | — | — | `views.py` | 🔴 **Supprimer** avec `ai_analyze_brief` |
| `AIChatWidget` | 🟠 | — | — | 🟠 **Migrer** vers `/api/ai/v1/` |
| `OCRTool` | 🟠 | — | — | 🟠 **Migrer** vers `/api/ai/v1/` |

---

## 10. PLAN D'ACTION RECOMMANDÉ

### Phase 2.2 — Compatibility Layer

1. Créer `AICompatibilityService` dans `hadara_ai/services/`
2. Déplacer `chat_with_assistant()` et `correct_ocr_text()` dans le Core
3. Les vues legacy (`chat_api_view`, `ocr_correct_api_view`) délèguent directement au Core
4. Supprimer la couche `ai_utils.py`

### Phase 2.3 — Frontend Migration

1. `AIChatWidget` → appelle `/api/ai/v1/chat/` (nouveau endpoint Core)
2. `OCRTool` → appelle `/api/ai/v1/ocr-correct/` (nouveau endpoint Core)
3. Vérifier `App.tsx:462` — quel endpoint exactement ?

### Phase 2.4 — Dépréciation

1. Supprimer `ai_analyze_brief` + imports Gemini de `views.py`
2. Supprimer `test_ai_utils.py` (ou réécrire pour le Core)
3. Supprimer `ToolUsageLog` + migration
4. Ajouter monitoring des endpoints legacy avant suppression

---

## 11. RÉSUMÉ EXÉCUTIF

| Catégorie | Éléments | 🟢 | 🟠 | 🔴 | 🐛 |
|-----------|----------|-----|-----|-----|-----|
| Endpoints | 3 | 0 | 2 | 1 | 0 |
| Views | 3 | 0 | 2 | 1 | 1 |
| Services | 3 | 1 | 2 | 0 | 0 |
| Frontend | 2 | 0 | 2 | 0 | 0 |
| Tests | 2 | 1 | 0 | 1 | 1 |
| Modèles | 1 | 0 | 0 | 1 | 0 |
| **TOTAL** | **14** | **2** | **8** | **4** | **2** |

**Prochaine étape recommandée** : Phase 2.2 — Créer le Compatibility Layer et corriger les 3 bugs.
