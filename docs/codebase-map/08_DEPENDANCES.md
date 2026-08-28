# 08 — Dépendances

> Hadara Suite v2.3.0 — Cartographie des dépendances
> Date : 2026-08-26 | Marqueurs : 🟢🟡🟠🔴⚪🔵

---

## 1. Backend Dependencies

### 1.1 Python (requirements.txt)

**Emplacement** : `backend/requirements.txt`

#### Framework & Serveur

| Package | Version | Usage |
|---------|---------|-------|
| `django` | >=5.0 | Framework web |
| `djangorestframework` | >=3.15 | API REST |
| `django-cors-headers` | >=4.4 | CORS |
| `gunicorn` | >=23.0 | Serveur production |

#### IA Providers

| Package | Version | Usage | État |
|---------|---------|-------|------|
| `groq` | — | Groq API client (llama, mixtral) | 🟢 |
| `google-genai` | — | Google Gemini SDK | 🟢 |
| `requests` | — | OpenAI HTTP direct (pas de SDK officiel) | 🟢 |

#### Données & Stockage

| Package | Version | Usage |
|---------|---------|-------|
| `psycopg2-binary` | — | PostgreSQL |
| `Pillow` | — | Images |
| `django-storages` | — | Stockage cloud |
| `boto3` | — | AWS S3 (Render) |
| `whitenoise` | — | Static files |

#### Auth & Sécurité

| Package | Version | Usage |
|---------|---------|-------|
| `itsdangerous` | — | TimestampSigner |
| `signing` | — | Token signing |

#### PDF & Web

| Package | Version | Usage |
|---------|---------|-------|
| `weasyprint` | — | Génération PDF |
| `playwright` | — | Navigation web |

#### Monitoring & Logging

| Package | Version | Usage |
|---------|---------|-------|
| `structlog` | — | Structured logging |

---

## 2. Frontend Dependencies

### 2.1 Production (package.json)

**Emplacement** : `package.json`

#### Framework & Build

| Package | Version | Usage |
|---------|---------|-------|
| `react` | ^19.1.1 | UI library |
| `react-dom` | ^19.1.1 | DOM renderer |
| `react-router-dom` | ^7.9.3 | Routing |
| `vite` | ^8.3.4 | Build tool |
| `typescript` | ~6.2.2 | Language |

#### UI & Styling

| Package | Version | Usage |
|---------|---------|-------|
| `tailwindcss` | ^4.1.12 | CSS framework |
| `@tailwindcss/vite` | ^4.1.12 | Vite plugin |
| `lucide-react` | ^0.545.0 | Icons |

#### Libs

| Package | Version | Usage |
|---------|---------|-------|
| `clsx` | ^2.1.1 | Classnames utility |
| `class-variance-authority` | ^0.7.1 | Variants |
| `tailwind-merge` | ^3.3.1 | Tailwind class merge |

### 2.2 Dev Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@types/react` | ^19.1.12 | React types |
| `@types/react-dom` | ^19.1.12 | ReactDOM types |
| `@types/node` | ^24.0.10 | Node types |
| `@vitejs/plugin-react` | ^4.5.2 | Vite React plugin |
| `autoprefixer` | ^10.4.21 | CSS prefix |
| `postcss` | ^8.5.6 | CSS processing |

---

## 3. External Services

### 3.1 Cloud & Hosting

| Service | Usage | État |
|---------|-------|------|
| **Render** | Backend hosting + PostgreSQL | 🟢 |
| **Cloudflare Pages** | Frontend hosting | 🟢 |

### 3.2 AI Providers

| Service | API Key | Usage | Modèles | État |
|---------|---------|-------|---------|------|
| **Groq** | `GROQ_API_KEY` | LLM principal | llama-3.3-70b, mixtral-8x7b, gemma2-9b | 🟢 |
| **OpenAI** | `OPENAI_API_KEY` | LLM secondaire | gpt-4o, gpt-4o-mini | 🟢 |
| **Google Gemini** | `GEMINI_API_KEY` | LLM tertiaire | gemini-1.5-flash, gemini-1.5-pro | 🟢 |

### 3.3 Database

| Service | Usage | État |
|---------|-------|------|
| **PostgreSQL** | Base de données production | 🟢 |

### 3.4 Infrastructure

| Service | Usage | État |
|---------|-------|------|
| **Render Web Service** | Backend API | 🟢 |
| **Cloudflare Pages** | Frontend SPA | 🟢 |
| **Cloudflare CDN** | Static assets | 🟢 |

---

## 4. Matrice de Dépendance Backend → Frontend

```
Backend (Django) ──────── Frontend (React)
       │                        │
  ┌────┴────┐            ┌──────┴──────┐
  │ API v1  │ ◄───────── │ BriefForm   │
  │         │ ◄───────── │ KanbanTab   │
  │         │ ◄───────── │ AdminDash.  │
  │         │ ◄───────── │ ClientPortal│
  │         │ ◄───────── │ Store       │
  └─────────┘            └─────────────┘
       │
  ┌────┴────┐
  │ IA Core │ ◄───────── Panels IA (4)
  └─────────┘
```

---

## 5. Risques de Dépendance

| Risque | Niveau | Impact | Mitigation |
|--------|--------|--------|------------|
| Groq API indisponible | 🔴 | Brief Analyst, Pricing Agent, Creative Assistant, Communication Agent tous bloqués | Fallback automatique sur autre provider |
| PostgreSQL indisponible | 🔴 | Toute l'application tombe | Backup Render |
| Cloudflare Pages indisponible | 🟠 | Frontend inaccessible | Cache CDN |
| Render indisponible | 🔴 | API backend inaccessible | Aucun |
| Token admin expiré | 🟡 | Accès admin bloqué | Re-login nécessaire |

---

## 6. Compatibilité Version

| Élément | Version | Compatibilité | État |
|---------|---------|---------------|------|
| Python | >=3.10 | Django 6.0 | 🟢 |
| Node.js | >=18 | Vite 8, React 19 | 🟢 |
| Django | 6.0 | DRF 3.15 | 🟢 |
| React | 19 | React Router 7 | 🟢 |
| Tailwind CSS | 4.x | PostCSS 8 | 🟢 |
