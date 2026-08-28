# 11 — Décisions

> Hadara Suite v2.3.0 — Décisions d'architecture par composant
> Date : 2026-08-26 | Source : 10_CROSSCHECK.md

---

## Légende

| Décision | Signification |
|----------|--------------|
| 🟢 **GARDER** | Composant validé, architecture correcte |
| 🟡 **CORRIGER** | Composant fonctionnel mais à réparer |
| 🔴 **RECONSTRUIRE** | Composant cassé ou obsolète, à refaire |
| 🟠 **DÉPRÉCIER** | Composant à retirer, remplacé par un autre |
| 🔵 **INVESTIGUER** | Composant à analyser avant de décider |

---

## Tableau des décisions

| # | Composant | Décision | Justification | Priorité |
|---|-----------|----------|---------------|----------|
| D01 | `chat_api_view` | 🔴 **RECONSTRUIRE** | Appelle `chat_with_assistant` qui n'existe pas → ImportError → 500 systématique | Critique |
| D02 | `AIChatWidget` | 🔴 **RECONSTRUIRE** | Dépend de `chat_api_view` cassé. À migrer vers Hadara AI Core | Critique |
| D03 | `ai_analyze_brief` (views.py:294) | 🟠 **DÉPRÉCIER** | Court-circuite le provider layer (Gemini direct). Remplacé par `brief_analyze` v1 | Haute |
| D04 | `analyze_brief_with_ai` (ai_utils.py) | 🟠 **DÉPRÉCIER** | Appelé par le tool `brief_analyze` (implementations.py:149) MAIS le tool est redondant avec `BriefAnalystService` | Haute |
| D05 | `ocr_correct_api_view` | 🔵 **INVESTIGUER** | Pas d'auth, pas de trace d'utilisation. À vérifier si encore utile | Basse |
| D06 | `ToolUsageLog` | 🟠 **DÉPRÉCIER** | Table orpheline, remplacée par `ToolExecution` dans `hadara_ai` | Basse |
| D07 | `BriefAnalyst` | 🟢 **GARDER** | Architecture Core, provider layer, tracé, fallback | — |
| D08 | `PricingAgent` | 🟢 **GARDER** | Architecture Core, explique sans calculer | — |
| D09 | `CreativeAssistant` | 🟢 **GARDER** | Architecture Core, Quality Gate, HADARA_DNA | — |
| D10 | `CommunicationAgent` | 🟢 **GARDER** | Architecture Core, messages multi-canal | — |
| D11 | `HadaraPricingEngine` | 🟢 **GARDER** | Source de vérité métier, pure Python, pas d'IA | — |
| D12 | `ProviderRegistry` | 🟢 **GARDER** | 3 providers (Groq, OpenAI, Gemini), abstraction correcte | — |
| D13 | `ToolRegistry` | 🟡 **CORRIGER** | Fonctionnel mais minimal. Les outils sont hardcodés dans `implementations.py` | Moyenne |
| D14 | `WorkflowOrchestrator` | 🟢 **GARDER** | Séquence 4 agents, traçabilité, retry | — |
| D15 | `ExecutionTraceService` | 🟢 **GARDER** | Traçabilité complète (tokens, coût, latence) | — |
| D16 | `HADARA_DNA` | 🟢 **GARDER** | Brand identity, qualité créative | — |
| D17 | Token sessionStorage | 🔴 **CORRIGER** | Vulnérabilité XSS. Passer en HttpOnly cookie | Critique |
| D18 | Auth endpoints legacy | 🔴 **CORRIGER** | 3 endpoints sans auth. Ajouter `AdminTokenPermission` | Critique |
| D19 | URL routes (WAVE 1) | 🟠 **CORRIGER** | 6 URLs incorrectes dans les cartes | Haute |
| D20 | `Brief.reference_code` | 🟠 **CORRIGER** | C'est le champ `id`, pas un champ séparé | Moyenne |
| D21 | Champs manquants DB | 🟠 **CORRIGER** | 13 champs non documentés | Moyenne |
| D22 | Endpoints manquants API | 🟠 **CORRIGER** | 8 endpoints non documentés | Moyenne |
| D23 | `google.genai` direct | 🟡 **CORRIGER** | `ai_analyze_brief` appelle Gemini sans passer par le provider layer | Haute |
| D24 | Email admin default | 🟡 **CORRIGER** | `mrniass@gmail.com` hardcodé dans `views.py:77,254` | Moyenne |

---

## Décisions prioritaires

### 🔴 CRITIQUE — Immédiat

1. **D01 + D02** : Le chatbot public est cassé. Solution :
   - Option A : Supprimer `AIChatWidget` et `/api/chat/` (simplest)
   - Option B : Recréer `chat_with_assistant` dans `ai_utils.py` en appelant `get_ai_response()` du Core
   - **Recommandation** : Option B — garder le chatbot mais le connecter au Core

2. **D17** : Sécuriser le token admin
   - Passer de `sessionStorage` à HttpOnly cookie
   - Ou ajouter une rotation de token

3. **D18** : Sécuriser les endpoints legacy
   - Ajouter `AdminTokenPermission` sur `ocr_correct_api_view` et `ai_analyze_brief`
   - `chat_api_view` peut rester public (chatbot public)

### 🟠 HAUTE — Avant la production

4. **D03 + D04** : Retirer le legacy IA
   - Supprimer `ai_analyze_brief` (views.py:294-377)
   - Supprimer `analyze_brief_with_ai` (ai_utils.py:11-154)
   - Mettre à jour `brief_analyze` tool (implementations.py:144-179) pour utiliser `BriefAnalystService`

5. **D19 + D20 + D21 + D22** : Corriger les cartes
   - Mettre à jour 05_DB.md, 06_API.md avec les champs et routes réels

### 🟡 MOYENNE — After MVP

6. **D13** : Enrichir le ToolRegistry
7. **D23** : Uniformiser les appels IA via le provider layer
8. **D24** : Externaliser l'email admin dans une variable d'environnement
