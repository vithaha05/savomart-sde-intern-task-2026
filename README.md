# Savomart Loyalty Companion App

**Candidate:** Vithahaselvi Haribalajhee, M.Sc. Theoretical Computer Science, PSG College of Technology
**Repo:** https://github.com/vithaha05/savomart-sde-intern-task-2026
**Frontend:** https://savomart-peach.vercel.app
**Backend:** https://savomart-backend-v5el.onrender.com
**Demo video:** *(link added after recording)*

---

## 1. Setup — run locally end-to-end

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — fill DATABASE_URL, SECRET_KEY, GROQ_API_KEY, OTP_DEV_MODE=true
alembic upgrade head
python3 scripts/seed_data.py
uvicorn app.main:app --reload
# API at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env with: VITE_API_URL=http://localhost:8000
npm run dev
# App at http://localhost:5173
```

### Environment variables (backend/.env)

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY` | Any strong random string |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` |
| `GROQ_API_KEY` | Your Groq API key (from console.groq.com) |
| `OTP_DEV_MODE` | `true` (returns OTP in API response) |
| `SAVOMART_API_URL` | `https://internal-service.savomart.in/bridge/api/store/list` |
| `SAVOMART_API_TOKEN` | `savo-bridge-cron-secret` |
| `FRONTEND_URL` | `http://localhost:5173` (or Vercel URL) |

---

## 2. How to log in and test the app

1. Open https://savomart-peach.vercel.app
2. Enter any valid 10-digit Indian mobile number (e.g. `9876543210`)
3. Click **Send OTP**
4. The OTP appears in the UI in a yellow banner (dev mode — no SMS needed)
5. Enter the 6-digit OTP and click **Verify & Login**
6. You land on the loyalty dashboard

**Sample credentials** (run `python3 scripts/seed_data.py` once after migrations):

| Mobile | Points | Tier |
|---|---|---|
| `9876543210` | 250 | Silver |
| `9876543211` | 1500 | Gold |
| `9876543212` | 6200 | Platinum |

**OTP behaviour:** Hashed with HMAC-SHA256, expires in 5 min, single-use, rate-limited to 3 requests per mobile per 10 min. In `OTP_DEV_MODE=true`, the OTP is returned in the API response and shown in a yellow UI banner clearly labelled "Dev mode".

---

## 3. Data model and schema

| Table | Key fields | Purpose |
|---|---|---|
| `users` | id, mobile_number, name, email, is_active | Auth identity |
| `loyalty_profiles` | user_id, points_balance, tier, total_earned, total_redeemed | Loyalty state per user |
| `coupons` | user_id, code, discount_type, discount_value, valid_until, is_used | User-specific coupons |
| `otps` | mobile_number, otp_code (HMAC hash), expires_at, is_used | OTP lifecycle |
| `offers` | title, description, discount_label, is_all_stores, store_ids, valid_until | Promotional offers |
| `support_tickets` | name, contact, issue_category, description, status | Support requests |

**Tier logic:** Silver = 0–999 pts · Gold = 1,000–4,999 pts · Platinum = 5,000+ pts

**AI chat tickets:** Savi collects structured data through conversation and appends rows to `backend/data/support_tickets.xlsx`. Ticket IDs: `SAVO-YYYYMMDD-XXXX`.

**Migrations:** Alembic with async SQLAlchemy. `alembic upgrade head` applies all migrations. Offline SQL mode used during build (no local DB needed).

---

## 4. Tech and library choices

### Backend
| Library | Why |
|---|---|
| FastAPI | Async-first, auto-generated OpenAPI docs, fast to build with |
| SQLAlchemy async + asyncpg | Non-blocking PostgreSQL, handles concurrency without threads |
| Alembic | Schema migrations with offline SQL support for CI |
| python-jose | JWT signing and verification |
| HMAC-SHA256 | OTPs never stored in plaintext — production security from day one |
| groq (Python SDK) | Llama 3.3 70B for Savi — sub-second inference, free tier, reliable JSON extraction |
| openpyxl | Lightweight Excel ticket archive immediately usable by support team |
| httpx | Async HTTP client for proxying Savomart live store API |

### Frontend
| Library | Why |
|---|---|
| React 18 + Vite | Fast SPA dev, tiny production bundles, hot module reload |
| Tailwind CSS v3 | Utility-first, brand colors `#782B90` and `#FFF200` applied consistently |
| Axios | HTTP client with JWT interceptors and 401 auto-redirect |
| TanStack Query | Data fetching, caching, background refresh, loading states |
| React Router v6 | Client-side navigation with protected routes |
| react-leaflet + Leaflet | Interactive store map using OpenStreetMap — fully free |

### Deployment
| Service | Purpose |
|---|---|
| Render (Docker) | Backend + PostgreSQL free tier, Singapore region |
| Vercel | Static frontend with SPA routing via `vercel.json` |

---

## 5. Design decisions and trade-offs

**OTP via mobile number**
Mobile OTP is the standard for Indian consumer apps — familiar, low-friction, no password to forget. Dev mode returns the OTP in the API response so the full auth flow can be tested without an SMS gateway. The architecture is MSG91-ready: `app/utils/otp.py → send_otp()` is the single swap point for production SMS. This was a deliberate choice — full testability without paid dependencies.

**Savi as a conversational support form**
Rather than a rigid ticket form, Savi collects support details through natural conversation. This reduces drop-off and feels more human. Structured extraction uses a second Groq call with JSON-mode output — deterministic, auditable, no regex fragility. The trigger phrase "I'll log this for you" signals extraction.

**Excel ticket archive**
The support team gets a `support_tickets.xlsx` file they can open immediately in any spreadsheet app — no dashboard needed. In production this becomes a Postgres-backed ticket service with an admin UI. Right call for a 36-hour MVP.

**Haversine from scratch**
One function, no geopy dependency, same result. Fewer dependencies = simpler Docker build, faster cold starts.

**5-minute in-memory store cache**
The Savomart live API is called once and cached for 5 minutes per service instance. Falls back to stale cache on upstream failure. Returns 503 only if no cache exists at all.

---

## 6. Known issues and what I'd improve

**Known issues**
- No real SMS delivery — `OTP_DEV_MODE=true` returns OTPs in the response
- Render free tier cold starts: first request after inactivity can take 30–50 seconds
- Map tiles intermittently blank on some connections (OpenStreetMap CDN)
- `support_tickets.xlsx` is not horizontally scalable
- CORS requires `FRONTEND_URL` to match exactly on Render

**With more time**
- Integrate MSG91 or Fast2SMS for real OTP delivery
- Persist support tickets in Postgres with an admin dashboard for triage
- End-to-end tests: Playwright (frontend), pytest + httpx (backend)
- Harden token refresh and silent re-auth
- Push notifications for points updates and new offers
- Real-time analytics: offer redemption rates, store visit heatmap
- Improve Savi's extraction with few-shot examples in the system prompt
- Offer images and admin UI for creating/editing offers without code changes

---

## 7. OTP strategy reasoning

OTPs are stored as HMAC-SHA256 hashes — never plaintext. Expire in 5 minutes, single-use, rate-limited to 3 requests per mobile per 10 minutes.

In `OTP_DEV_MODE=true`, the OTP is returned in the API response and shown in a yellow banner in the UI. This is clearly flagged as a dev convenience — not a production pattern.

The integration point is `app/utils/otp.py → send_otp()`. Swapping in MSG91 requires adding credentials to `.env` and implementing one function — nothing else in the codebase changes.

---

## 8. AI agent design — Savi

**Why a named assistant**
A named, warm persona (Savi = Savomart's virtual assistant) reduces the friction of submitting a support issue. Customers describe their problem naturally rather than filling in form fields.

**Conversation → structured data pipeline**
1. Messages stream through Groq Llama 3.3 70B with a carefully crafted system prompt
2. Savi collects name, contact, issue_category, description through conversation
3. On confirmation ("I'll log this for you"), a second Groq call with JSON-mode extracts structured data
4. Row appended to `support_tickets.xlsx` with `SAVO-YYYYMMDD-XXXX` ticket ID
5. Ticket ID returned to customer in chat
6. Hard cap at 20 turns, then graceful wrap-up

**Why Groq over OpenAI**
Sub-second inference makes the chat feel responsive. Llama 3.3 70B handles JSON extraction reliably. Free-tier friendly for a 36-hour build.

---

## 9. Architecture overview
Browser (Vercel)
├── React SPA
│   ├── Auth (OTP login + JWT)
│   ├── Dashboard (points, tier, coupons)
│   ├── Offers (filterable)
│   ├── Stores (Leaflet map + list, nearest store)
│   ├── Support (contact info + ticket form)
│   └── Savi chat (AI agent)
│
▼
FastAPI (Render Docker)
├── /auth     — OTP send/verify, JWT issue, logout
├── /profile  — loyalty profile + coupons
├── /offers   — active offers
├── /stores   — proxy + 5-min cache Savomart live API, haversine nearest
├── /support  — contact info + ticket creation
└── /chat     — Savi agent (Groq Llama 3.3 70B)
PostgreSQL (Render)
└── users, loyalty_profiles, coupons, otps, offers, support_tickets
Savomart Live API
└── https://internal-service.savomart.in/bridge/api/store/list
---

## 10. How I used AI tools

| Tool | How I used it |
|---|---|
| **Claude (Anthropic)** | System architecture, phase-by-phase build plan, 5-layer context prompts for each module, Savi's system prompt and personality design, debugging integration issues, README |
| **Codex (OpenAI)** | Agentic backend code generation — SQLAlchemy models, Alembic migrations, FastAPI routers, auth service, OTP utils, seed scripts |
| **GitHub Copilot** | Inline code suggestions and boilerplate completion in VS Code |
| **Antigravity** | Agentic frontend development — dashboard, offers, stores map, support, Savi chat UI |
| **ChatGPT (OpenAI)** | Brainstorming trade-offs, quick syntax lookups, debugging error messages |
| **Grok (xAI)** | Research on Indian SMS providers (MSG91 vs Fast2SMS) and OTP security patterns |
| **Groq API (Llama 3.3 70B)** | The AI model powering Savi at runtime — not a dev tool, but embedded in the product |

AI accelerated scaffolding, boilerplate, and code generation. Architecture decisions, trade-off reasoning, prompt design, integration debugging, and final polish were done manually.

---

## 11. Deployment

### Backend (Render)

1. Create Render account → connect GitHub repo
2. Create PostgreSQL: `savomart-db`, free tier, Singapore
3. Create Web Service: Docker, Dockerfile `backend/Dockerfile`, context `backend`
4. Set environment variables (see Section 1)
5. Deploy — Render builds Docker image, runs `alembic upgrade head`, starts uvicorn
6. Verify: `GET https://savomart-backend-v5el.onrender.com/health`

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

Add `VITE_API_URL=https://savomart-backend-v5el.onrender.com` in Vercel → Settings → Environment Variables → Redeploy.

---

## 12. Key API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/send-otp` | — | Send OTP to mobile |
| POST | `/auth/verify-otp` | — | Verify OTP, receive JWT |
| POST | `/auth/logout` | JWT | End session |
| GET | `/profile` | JWT | Loyalty profile + coupons |
| GET | `/offers` | JWT | Active offers |
| GET | `/stores` | JWT | All stores (live API proxy) |
| GET | `/stores/nearest` | JWT | Nearest store by lat/lng |
| POST | `/support/ticket` | JWT | Submit support ticket |
| POST | `/chat/message` | JWT | Send message to Savi |
| GET | `/chat/tickets/export` | JWT | Download support_tickets.xlsx |
| GET | `/health` | — | Health check |

Interactive docs: https://savomart-backend-v5el.onrender.com/docs

---

## 13. Health check

```bash
curl https://savomart-backend-v5el.onrender.com/health
# {"status":"ok","service":"savomart-api","version":"1.0.0"}
```

---

*Built in 36 hours for the Savomart SDE Intern Task 2026.*
