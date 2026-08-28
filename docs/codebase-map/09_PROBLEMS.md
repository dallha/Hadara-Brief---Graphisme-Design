# 09 — Problèmes Détectés

> Hadara Suite v2.3.0 — Cartographie des problèmes et dettes techniques
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵

---

## 1. Code Legacy Actif (🟠)

### 1.1 Chatbot Legacy

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/AIChatWidget.tsx` + `POST /api/chat/` |
| **Problème** | Appelle directement Groq API depuis le frontend (pas de provider) |
| **Impact** | Sécurité exposée (clé API côté client potentiellement), aucun tracé |
| **Statut** | 🟠 ENCOURS — Encore présent, pas de date de retrait |
| **Action** | Retirer ou migrer vers Hadara AI Core |

### 1.2 AI Analyze Legacy

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/api/views.py` → `ai_analyze_brief` + `backend/api/ai_utils.py` → `analyze_brief_with_ai` |
| **Problème** | Appelle directement Groq SDK (llama-3.3-70b), pas de provider |
| **Impact** | Pas de tracé, pas de fallback multi-provider, pas de cost tracking |
| **Statut** | 🟠 ENCOURS — Remplacé par `brief_analyze` (v1) mais toujours exposé |
| **Action** | Retirer les endpoints `/api/ai-analyze/{pk}/` et `/api/chat/` |

### 1.3 ToolUsageLog

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/api/models.py:187` |
| **Problème** | Table legacy dans `api` app, remplacée par `ToolExecution` dans `hadara_ai` |
| **Impact** | Table orpheline, pas utilisée |
| **Statut** | 🟠 |
| **Action** | Supprimer après migration des données |

---

## 2. Sécurité (🔴)

### 2.1 Token Stocké dans sessionStorage

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/App.tsx` — `sessionStorage.setItem('hadara_admin_token', ...)` |
| **Problème** | Token accessible via JavaScript (XSS), pas de HttpOnly cookie |
| **Impact** | Si XSS → vol de token admin |
| **Recommandation** | Utiliser HttpOnly cookie ou rotate le token |

### 2.2 Pas de CSRF sur Endpoints IA

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/hadara_ai/api/` |
| **Problème** | Pas de middleware CSRF configuré pour les API endpoints IA |
| **Impact** | Risque CSRF si auth basée sur cookie |
| **Statut** | ⚪ À vérifier |

---

## 3. Architecture Frontend (🟡)

### 3.1 Pas de Couche d'Abstraction API

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | Tous les composants |
| **Problème** | Chaque composant fait directement `fetch()` — pas de `src/services/` ni `src/api/` |
| **Impact** | Duplication de code, gestion d'erreur incohérente, pas de cache, pas de retry |
| **Recommandation** | Créer un `apiClient` centralisé avec interceptors |

### 3.2 Pas de State Management

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | Tous les composants |
| **Problème** | State local uniquement (useState), pas de store global |
| **Impact** | State prop drilling, pas de partage d'état entre composants sœurs |
| **Recommandation** | Évaluer Zustand ou Jotai pour l'état global (auth, briefs, etc.) |

### 3.3 Pas de Hooks Custom

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | Aucun répertoire `src/hooks/` |
| **Problème** | Logique réutilisable non extraite (fetch brief, fetch client, etc.) |
| **Impact** | Duplication de patterns (loading, error, success) dans chaque panel |

### 3.4 Pas de Tests Frontend

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | Aucun fichier `*.test.tsx` ou `*.spec.tsx` |
| **Problème** | Zéro couverture de tests frontend |
| **Impact** | Pas de garantie de non-régression |

---

## 4. Architecture Backend (🟡)

### 4.1 Deux Systèmes IA parallèles

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/api/` (legacy) + `backend/hadara_ai/` (core) |
| **Problème** | Deux systèmes IA distincts coexistent |
| **Impact** | Confusion possible, maintenance double, pas de tracé unifié |
| **Action** | Retirer complètement le legacy (`/api/chat/`, `/api/ai-analyze/`, `ai_utils.py`) |

### 4.2 ToolRegistry vs Tools Hardcodés

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/hadara_ai/tools/registry.py` + `backend/hadara_ai/tools/implementations.py` |
| **Problème** | Les 5 outils sont hardcodés dans `implementations.py`, le registry est minimal |
| **Impact** | Pas d'extensibilité facile des outils |
| **Action** | Enrichir le registry avec découverture automatique |

### 4.3 Pas de Tests Backend

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | Aucun fichier `test_*.py` trouvé |
| **Problème** | Zéro couverture de tests backend |
| **Impact** | Pas de garantie de non-régression |

---

## 5. Dépendances (🟡)

### 5.1 OpenAI SDK manquant

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/hadara_ai/providers/openai_provider.py` |
| **Problème** | Utilise `requests` pour appeler OpenAI HTTP directement (pas le SDK officiel) |
| **Impact** | Pas de retry, pas de gestion des rate limits, pas de streaming |
| **Recommandation** | Installer `openai` Python SDK |

### 5.2 google-genai SDK

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `backend/hadara_ai/providers/gemini_provider.py` |
| **Problème** | Utilise `google-genai` (SDK non-officiel Google, pas `google-generativeai`) |
| **Impact** | Risque de breaking changes |
| **Statut** | ⚪ À vérifier |

---

## 6. UX (🟡)

### 6.1 Pas de Lazy Loading pour les Panels IA

| Propriété | Valeur |
|-----------|--------|
| **Emplacement** | `src/components/admin/AdminDashboard.tsx` |
| **Problème** | `AdminDashboard` est lazy, mais les 4 panels IA sont importés directement |
| **Impact** | Bundle admin contient tous les panels même si non utilisés |
| **Recommandation** | Lazy charger chaque panel individuellement |

### 6.2 Pas de Responsive Design

| Propriété | Valeur |
|-----------|--------|
| **Problème** | Pas de media queries ni de breakpoints mobiles visibles |
| **Impact** | Admin dashboard peut ne pas être utilisable sur mobile |

---

## 7. Matrice de Gravité

| ID | Problème | Gravité | Impact | Priorité |
|----|----------|---------|--------|----------|
| P01 | Chatbot legacy exposé | 🟠 | Sécurité, UX | Haute |
| P02 | AI Analyze legacy exposé | 🟠 | Maintenance, tracé | Haute |
| P03 | Token sessionStorage | 🔴 | Sécurité | Critique |
| P04 | Pas de tests backend | 🟠 | Qualité | Haute |
| P05 | Pas de tests frontend | 🟠 | Qualité | Haute |
| P06 | Pas de couche API frontend | 🟠 | Maintenabilité | Moyenne |
| P07 | Pas de state management | 🟠 | UX, Maintenabilité | Moyenne |
| P08 | OpenAI SDK manquant | 🟠 | Fiabilité | Moyenne |
| P09 | Pas de CSRF IA | 🔴 | Sécurité | Critique |
| P10 | Pas de hooks custom | 🟠 | Duplication | Basse |
| P11 | Deux systèmes IA parallèles | 🟠 | Confusion | Haute |
| P12 | Pas de responsive | 🟡 | UX | Basse |
| P13 | ToolUsageLog orpheline | 🟠 | DB | Basse |
| P14 | google-genai non-officiel | ⚪ | Fiabilité | Basse |

---

## 8. Recommandations Immédiates

1. **🔴 Sécurité** : Sécuriser le token admin (HttpOnly cookie ou rotate)
2. **🟠 Retrait legacy** : Retirer `/api/chat/`, `/api/ai-analyze/`, `AIChatWidget`
3. **🟠 Tests** : Ajouter des tests minimaux pour les 4 agents IA
4. **🟡 Frontend** : Créer un `apiClient` centralisé avec gestion d'erreur
