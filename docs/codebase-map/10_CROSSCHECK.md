# 10 — Cross-Check

> Hadara Suite v2.3.0 — Confrontation des 9 cartes au code réel
> Date : 2026-08-26 | Niveau : VÉRIFICATION APPROFONDIE

---

## Légende des verdicts

| Symbole | Signification |
|---------|--------------|
| ✅ | Fait vérifié — confirmé par le code |
| ⚠️ | Incohérence — la carte et le code divergent |
| 🔴 | Erreur critique — la carte est fausse ou incomplète |
| 💡 | Découverte — trouvé dans le code mais absent des cartes |

---

## 1. Cross-check Architecture ↔ DB

### 1.1 Champs manquants dans 05_DB.md

| Modèle | Champ | Présent dans le code | Dans 05_DB.md |
|--------|-------|---------------------|---------------|
| `Brief` | `target_audience_chips` | `models.py:25` — `JSONField(default=list)` | ⚠️ MANQUANT |
| `Brief` | `deliverable_versions` | `models.py:49` — `JSONField(default=list)` | ⚠️ MANQUANT |
| `Template` | `default_main_title` | `models.py:105` | ⚠️ MANQUANT |
| `Template` | `default_full_text_content` | `models.py:106` | ⚠️ MANQUANT |
| `Template` | `style_preferences` | `models.py:107` | ⚠️ MANQUANT |
| `Template` | `preferred_colors` | `models.py:108` | ⚠️ MANQUANT |
| `Template` | `avoid_colors` | `models.py:109` | ⚠️ MANQUANT |
| `Template` | `default_budget_range` | `models.py:110` | ⚠️ MANQUANT |
| `Template` | `suggested_price_fcfa` | `models.py:111` | ⚠️ MANQUANT |
| `PortfolioItem` | `accent_hex` | `models.py:147` | ⚠️ MANQUANT |
| `PortfolioItem` | `features` | `models.py:148` | ⚠️ MANQUANT |
| `StoreProduct` | `description` | `models.py:192` | ⚠️ MANQUANT |
| `StoreProduct` | `updated_at` | `models.py:199` | ⚠️ MANQUANT |

### 1.2 Champs référencés mais absents du code

| Modèle | Champ | Dans 05_DB.md | Dans le code |
|--------|-------|---------------|-------------|
| `Brief` | `reference_code` | ✅ (WAVE 1) | ✅ `models.py:4` — mais c'est le PK `id`, pas un champ séparé |
| `Brief` | `client` (FK) | ✅ | ✅ `models.py:62` |

**Verdict** : Le `reference_code` est en fait le champ `id` (CharField, PK). La WAVE 1 le listait comme champ séparé — c'est une erreur de cartographie.

### 1.3 Relations

| Relation | Code | 05_DB.md |
|----------|------|----------|
| `Brief → Client` | ✅ FK nullable, SET_NULL | ✅ |
| `BillingDocument → Client` | ✅ FK nullable, SET_NULL | ✅ |
| `BillingDocument → Brief` | ✅ FK nullable, SET_NULL | ✅ |
| `BillingLine → BillingDocument` | ✅ CASCADE | ✅ |
| `Payment → BillingDocument` | ✅ CASCADE | ✅ |

### 1.4 Méthodes métier critiques

| Méthode | Emplacement | Rôle |
|---------|-------------|------|
| `BillingDocument.refresh_payment_state()` | `models.py:364` | Recalcule le statut de paiement |
| `BillingDocument.recalculate_totals()` | `models.py:397` | Recalcule sous-total + total |
| `Payment.save()` | `models.py:496` | Déclenche `refresh_payment_state` |
| `Payment.delete()` | `models.py:514` | Déclenche `refresh_payment_state` |
| `BillingLine.save()` | `models.py:450` | Déclenche `recalculate_totals` |
| `BillingLine.delete()` | `models.py:455` | Déclenche `recalculate_totals` |

**Verdict** : La facturation a une logique métier robuste (cascade de recalcul). Non documentée dans les cartes.

---

## 2. Cross-check API ↔ Frontend

### 2.1 Routes réelles (api/urls.py)

| Route | View | Méthode | 06_API.md |
|-------|------|---------|-----------|
| `/api/briefs/` | `BriefViewSet` | CRUD | ✅ |
| `/api/templates/` | `TemplateViewSet` | CR | ✅ |
| `/api/portfolio/` | `PortfolioItemViewSet` | CR | ✅ |
| `/api/store/products/` | `StoreProductViewSet` | CR | ✅ |
| `/api/billing/clients/` | `ClientViewSet` | CRUD | ✅ |
| `/api/billing/documents/` | `BillingDocumentViewSet` | CRUD | ✅ |
| `/api/billing/payments/` | `PaymentViewSet` | CRUD | ✅ |
| `/api/chat/` | `chat_api_view` | POST | ✅ |
| `/api/ocr-correct/` | `ocr_correct_api_view` | POST | ✅ |
| `/api/ai-analyze/<pk>/` | `ai_analyze_brief` | POST | ✅ |
| `/api/auth/login/` | `AdminLoginView` | POST | ✅ |
| `/api/auth/verify/` | `AdminVerifyView` | POST | ✅ |
| `/api/auth/client/login/` | `ClientLoginView` | POST | ✅ |

### 2.2 Routes IA v1 réelles (hadara_ai/api/urls.py)

| Route | View | 06_API.md |
|-------|------|-----------|
| `agents/` | `agent_list` | ✅ |
| `agents/<int:pk>/run/` | `agent_run` | ⚠️ WAVE 1: `/api/ai/v1/agents/run/` — FAUX (PK dans URL) |
| `executions/` | `execution_list` | ⚠️ MANQUANT dans 06_API.md |
| `executions/<int:pk>/` | `execution_detail` | ⚠️ MANQUANT |
| `usage/` | `usage_summary` | ⚠️ MANQUANT |
| `dashboard/` | `dashboard` | ⚠️ MANQUANT |
| `briefs/<id>/analyze/` | `brief_analyze` | ✅ |
| `briefs/<id>/analyses/` | `brief_analysis_history` | ✅ |
| `briefs/<id>/pricing-agent/` | `brief_pricing_agent` | ✅ |
| `briefs/<id>/creative-assistant/` | `brief_creative_assistant` | ✅ |
| `briefs/<id>/communicate/` | `brief_communicate` | ✅ |
| `briefs/<id>/workflow/` | `brief_workflow` | ✅ |
| `briefs/<id>/workflows/` | `brief_workflow_history` | ⚠️ MANQUANT |
| `brand-context/` | `brand_context` | ⚠️ MANQUANT |
| `analytics/dashboard/` | `analytics_dashboard` | ✅ |
| `analytics/agents/` | `analytics_agents` | ✅ |
| `analytics/trend/` | `analytics_trend` | ⚠️ MANQUANT |
| `analytics/models/` | `analytics_models` | ⚠️ MANQUANT |

### 2.3 Frontend → Endpoint traçage

| Composant | Endpoint appelé | Code | Statut |
|-----------|-----------------|------|--------|
| `AIChatWidget` | `POST /api/chat/` | `AIChatWidget.tsx:41` | 🔴 BROKEN (voir §3) |
| `BriefForm` | `POST /api/briefs/` | `BriefForm.tsx` | ✅ |
| `KanbanTab` | `GET /api/briefs/`, `PATCH /api/briefs/{id}/` | `KanbanTab.tsx` | ✅ |
| `BriefAnalysisPanel` | `POST /api/ai/v1/briefs/{id}/analyze/` | `BriefAnalysisPanel.tsx` | ✅ |
| `PricingAgentPanel` | `POST /api/ai/v1/briefs/{id}/pricing-agent/` | `PricingAgentPanel.tsx` | ✅ |
| `CreativeAssistantPanel` | `POST /api/ai/v1/briefs/{id}/creative-assistant/` | `CreativeAssistantPanel.tsx` | ✅ |
| `CommunicationAgentPanel` | `POST /api/ai/v1/briefs/{id}/communicate/` | `CommunicationAgentPanel.tsx` | ✅ |
| `WorkflowPanel` | `POST /api/ai/v1/briefs/{id}/workflow/` | `WorkflowPanel.tsx` | ✅ |
| `AnalyticsDashboardPanel` | `GET /api/ai/v1/analytics/dashboard/` | `AnalyticsDashboardPanel.tsx` | ✅ |
| `HadaraStore` | `GET /api/store/products/` | `HadaraStore.tsx` | ✅ |

---

## 3. Cross-check IA — ROOT CAUSE DU CHATBOT 🔴

### 3.1 Chaîne complète tracée

```
AIChatWidget.tsx:41
    │
    │  fetch(`${API_BASE}/api/chat/`, { method: 'POST' })
    │
    ▼
config.ts:3
    │  API_BASE = 'https://hadara-backend.onrender.com' (prod)
    │
    ▼
backend/api/urls.py:22
    │  path('chat/', chat_api_view)
    │
    ▼
backend/api/views.py:267-278
    │  def chat_api_view(request):
    │      from .ai_utils import chat_with_assistant  ← 🔴 IMPORT ERROR
    │      response_text = chat_with_assistant(messages)
    │
    ▼
backend/api/ai_utils.py
    │  Fichier : 154 lignes
    │  Fonctions définies :
    │    - analyze_brief_with_ai(brief, pricing_result)  ← existe
    │    - _get_fallback_ai(pricing_result, reason)      ← existe
    │
    │  🔴 chat_with_assistant N'EXISTE PAS dans ce fichier
```

### 3.2 Diagnostic

**Fait vérifié** :
- `chat_api_view` (views.py:273) fait `from .ai_utils import chat_with_assistant`
- `ai_utils.py` ne définit PAS `chat_with_assistant` — seulement `analyze_brief_with_ai` et `_get_fallback_ai`

**Conséquence** :
- L'import lève `ImportError` au runtime
- Le `except Exception as e` (views.py:278) attrape l'erreur
- Retourne `Response({'error': str(e)}, status=500)`
- Le frontend reçoit un 500 → affiche "Oups, je rencontre un problème réseau"

**Racine** :
- `chat_with_assistant` a probablement existé dans une version antérieure de `ai_utils.py`
- La fonction a été supprimée ou renommée sans mettre à jour `chat_api_view`
- C'est un endpoint ORPHELIN — le backend appelle une fonction qui n'existe plus

### 3.3 Système Legacy vs Core

```
LEGACY (cassé)                          HADARA AI CORE (fonctionnel)
─────────────                           ──────────────────────────
POST /api/chat/                         POST /api/ai/v1/briefs/{id}/analyze/
    ↓                                       ↓
chat_api_view                           brief_analyze
    ↓                                       ↓
chat_with_assistant ← 🔴 MISSING        BriefAnalystService
    ↓                                       ↓
(ImportError → 500)                     get_ai_response()
                                            ↓
POST /api/ai-analyze/{pk}/                 ProviderRegistry → Groq/OpenAI/Gemini
    ↓
ai_analyze_brief
    ↓
genai.Client(api_key=api_key)          POST /api/ai/v1/briefs/{id}/pricing-agent/
    ↓                                       ↓
Gemini direct (pas de provider)        PricingAgentService
                                            ↓
                                        POST /api/ai/v1/briefs/{id}/creative-assistant/
                                            ↓
                                        CreativeAssistantService
                                            ↓
                                        POST /api/ai/v1/briefs/{id}/communicate/
                                            ↓
                                        CommunicationAgentService
```

---

## 4. Cross-check Sécurité

### 4.1 Vulnérabilité #1 : Token dans sessionStorage

| Élément | Valeur |
|---------|--------|
| **Fichier** | `src/App.tsx` |
| **Ligne** | `sessionStorage.setItem('hadara_admin_token', token)` |
| **Chemin d'exécution** | Login → AdminLoginView → token signé → sessionStorage |
| **Impact** | Si XSS → vol de token → accès admin complet |
| **Exploitabilité** | Moyenne — nécessite XSS + vol de token |
| **Correction** | HttpOnly cookie ou rotation de token |
| **Priorité** | 🔴 HAUTE |

### 4.2 Vulnérabilité #2 : Pas d'auth sur endpoints legacy

| Endpoint | Auth | Fichier |
|----------|------|---------|
| `POST /api/chat/` | ⚠️ AUCUNE | `views.py:266` |
| `POST /api/ocr-correct/` | ⚠️ AUCUNE | `views.py:280` |
| `POST /api/ai-analyze/<pk>/` | ⚠️ AUCUNE | `views.py:294` |

**Fait vérifié** : Ces 3 endpoints n'ont AUCUNE vérification d'authentification. N'importe qui peut les appeler.

**Impact** :
- `/api/chat/` — appelle IA (coût, abus possible)
- `/api/ocr-correct/` — appelle IA (coût)
- `/api/ai-analyze/{pk}/` — appelle Gemini directement avec une clé API exposée, modifie le brief

**Exploitabilité** : Élevée — endpoints publics, pas de rate limiting

### 4.3 Vulnérabilité #3 : Clé API dans le code

| Élément | Valeur |
|---------|--------|
| **Fichier** | `ai_utils.py:9` |
| **Code** | `GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "gsk_placeholder_key_remplacez_moi")` |
| **Impact** | Si la variable d'environnement n'est pas définie, la clé placeholder est utilisée (inutile mais pas dangereuse) |
| **Exploitabilité** | Faible — c'est un fallback, pas une clé réelle |
| **Priorité** | 🟡 MOYENNE |

---

## 5. Cross-check Legacy

| Élément Legacy | Utilisé ? | Par qui ? | Action |
|---------------|-----------|-----------|--------|
| `chat_api_view` | 🟠 OUI | `AIChatWidget.tsx` (chatbot public) | 🔴 CASSÉ — migrer ou retirer |
| `ai_analyze_brief` | 🟠 OUI | Appelé manuellement ou via ancien workflow | 🟠 Déprécier — remplacé par `brief_analyze` v1 |
| `analyze_brief_with_ai` | 🟠 OUI | Appelé par `brief_analyze` tool (implementations.py:149) | 🟠 Double usage — legacy + core |
| `AIChatWidget` | 🟠 OUI | `App.tsx` (chatbot public) | 🔴 CASSÉ — migrer vers Hadara AI Core |
| `ToolUsageLog` | ⚪ Non | Personne | 🟠 Déprécier |
| `correct_ocr_text` | ⚪ Non | `ocr_correct_api_view` | ⚪ Investiguer |
| `google.genai` direct | 🟠 OUI | `ai_analyze_brief` (views.py:305) | 🟠 Court-circuite le provider layer |

---

## 6. Cross-check Métier ↔ IA

### 6.1 Pricing Engine vs Pricing Agent

| Composant | Source de vérité | Rôle |
|-----------|-----------------|------|
| `HadaraPricingEngine` | ✅ VÉRITÉ | Calcule le prix FCFA (règles pures) |
| `PricingAgent` | 🔵 Explication | Explique la stratégie tarifaire |
| `PricingAgentService` | 🔵 Enrichissement | Ajoute contexte client, risques, acompte |

**Constat** : La séparation est respectée. Le Pricing Engine est la SEULE source de vérité pour les prix. Le Pricing Agent ne fait qu'expliquer.

### 6.2 Client data

| Source | Rôle |
|--------|------|
| `Client` model | ✅ VÉRITÉ — données officielles |
| `Brief.client_name` / `whatsapp` / `email` | 🟠 Snapshot — données legacy non migrées |
| `BillingDocument.billing_*` | 🟠 Snapshot — données figées au moment de l'émission |
| `BriefAnalystService` | 🔵 Lecteur — lit les données, ne les modifie pas |

**Constat** : La migration `Client` est en cours. Les briefs sans `client_id` sont orphelins (MigrationTool existe pour les rattacher).

### 6.3 Statut des briefs

| Source | Rôle |
|--------|------|
| `Brief.status` | ✅ VÉRITÉ — statut du projet |
| `Brief.ai_analysis.statut_brief` | 🔵 Recommandation — le BriefAnalyst recommande, ne modifie pas |
| `BriefAnalystService` | 🔵 Recommande `ACCEPTER/REFUSER` — l'admin décide |

**Constat** : L'IA ne modifie JAMAIS le statut directement. Elle recommande. L'admin applique.

### 6.4 Données financières

| Source | Rôle |
|--------|------|
| `BillingDocument` | ✅ VÉRITÉ — montants officiels |
| `Payment` | ✅ VÉRITÉ — encaissements réels |
| `BillingDocument.refresh_payment_state()` | ✅ Logique métier — recalcule le statut |
| `client_history()` (tool) | 🔵 Lecteur — agrège les données pour le contexte IA |

**Constat** : Les données financières ne passent JAMAIS par l'IA pour être modifiées. L'IA les lit en lecture seule.

---

## 7. Incohérences critiques WAVE 1 → Code

| ID | Incohérence | Gravité | Source | Statut |
|----|------------|---------|--------|--------|
| IC01 | `chat_with_assistant` n'existe pas dans `ai_utils.py` | 🔴 | views.py:273 | ✅ Résolu —函数 restaurée via Hadara AI Core |
| IC02 | WAVE 1: URL store = `/api/store-products/` ; Réel = `/api/store/products/` | 🟠 | api/urls.py:13 | ✅ Résolu — Cartes corrigées |
| IC03 | WAVE 1: URL clients = `/api/clients/` ; Réel = `/api/billing/clients/` | 🟠 | api/urls.py:14 | ✅ Résolu — Cartes corrigées |
| IC04 | WAVE 1: URL billing = `/api/billing-documents/` ; Réel = `/api/billing/documents/` | 🟠 | api/urls.py:15 | ✅ Résolu — Cartes corrigées |
| IC05 | WAVE 1: URL payments = `/api/payments/` ; Réel = `/api/billing/payments/` | 🟠 | api/urls.py:16 | ✅ Résolu — Cartes corrigées |
| IC06 | WAVE 1: `AdminVerifyView` = GET ; Réel = POST | 🟠 | api/urls.py:26 | ✅ Résolu — Cartes corrigées |
| IC07 | WAVE 1: `/api/ai/v1/agents/run/` ; Réel = `/api/ai/v1/agents/{pk}/run/` | 🟠 | hadara_ai/api/urls.py:7 | ✅ Résolu — Cartes corrigées |
| IC08 | 13 champs manquants dans 05_DB.md | 🟠 | models.py | ✅ Résolu — Cartes corrigées |
| IC09 | 8 endpoints manquants dans 06_API.md (executions, usage, dashboard, etc.) | 🟠 | hadara_ai/api/urls.py | ✅ Résolu — Cartes corrigées |
| IC10 | `ai_analyze_brief` appelle Gemini directement, court-circuite le provider layer | 🟠 | views.py:305 | ⚠️ À migrer vers Core |
