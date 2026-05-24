# Savomart Loyalty Companion App

**Candidate:** Vithahaselvi Haribalajhee, M.Sc. Theoretical Computer Science, PSG College of Technology
**Repo:** https://github.com/vithaha05/savomart-sde-intern-task-2026
**Frontend:** https://savomart-peach.vercel.app
**Backend:** https://savomart-backend-v5el.onrender.com
**Demo video:** https://drive.google.com/file/d/<VIDEO_ID>/view?usp=sharing

---

## 1. Setup — local end-to-end

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, OTP_DEV_MODE=true
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 2. How to log in / test the app

1. Open the login page
2. Enter any valid 10-digit Indian mobile number (e.g. `9876543210`)
3. Click **Send OTP**
4. In dev mode (`OTP_DEV_MODE=true`), the OTP appears directly in the UI — no SMS gateway needed
5. Enter the 6-digit OTP and verify
6. You land on the loyalty dashboard

**Sample credentials (run seed script first):**
- `9876543210` — 250 pts, Silver tier
- `9876543211` — 1500 pts, Gold tier
- `9876543212` — 6200 pts, Platinum tier

Run seed data once after migrations:
```bash
cd backend
python3 scripts/seed_data.py
```

---

## 3. Data model + schema

| Model | Key fields | Purpose |
|---|---|---|
| `users` | id, mobile_number, name, email, is_active | Auth identity |
| `loyalty_profiles` | user_id, points_balance, tier, total_earned, total_redeemed | Loyalty state |
| `coupons` | code, discount_type, discount_value, valid_until, is_used | User coupons |
| `otps` | mobile_number, otp_code (HMAC hash), expires_at, is_used | OTP lifecycle |
| `offers` | title, discount_label, is_all_stores, store_ids, valid_until | Store offers |
| `support_tickets` | name, contact, issue_category, description, status | Support requests |

**Tier logic:** Silver = 0–999 pts, Gold = 1000–4999 pts, Platinum = 5000+ pts

**Chat ticket extraction:** Savi captures structured data from conversation and appends rows to `backend/data/support_tickets.xlsx`. Ticket IDs follow `SAVO-YYYYMMDD-XXXX`.

---

## 4. Tech and library choices

### Backend
- **FastAPI** — async, auto-validated, OpenAPI docs out of the box
- **SQLAlchemy async + asyncpg** — non-blocking Postgres access built for concurrency
- **Alembic** — schema migrations with offline SQL support (no local DB needed for CI)
- **python-jose** — JWT signing and verification
- **passlib + HMAC** — OTP hashing; OTPs are never stored in plaintext
- **groq (Python SDK)** — Llama 3.3 70B for Savi agent and structured JSON extraction
- **openpyxl** — lightweight Excel ticket archive for the support team

### Frontend
- **React 18 + Vite** — fast SPA development and production builds
- **Tailwind CSS v3** — utility-first, consistent brand styling with no custom CSS files
- **Axios** — HTTP client with JWT interceptors and 401 auto-redirect
- **TanStack Query** — data fetching, caching, and loading states
- **React Router v6** — client-side navigation with protected routes
- **react-leaflet + Leaflet** — interactive store map using OpenStreetMap (fully free)

### Deployment
- **Render** — Docker-based backend + PostgreSQL free tier
- **Vercel** — static frontend with SPA routing via `vercel.json`

---

## 5. Design decisions and trade-offs

**OTP via mobile number**
Mobile OTP is the standard in Indian consumer apps. Dev mode returns the OTP directly in the API response — no SMS gateway required locally. The architecture is MSG91-ready: `app/utils/otp.py` has a single `send_otp()` integration point that raises `NotImplementedError` in production until a real provider is wired in. This was a deliberate choice: it lets the full auth flow be tested end-to-end without a paid dependency.

**Savi as a conversational form**
Rather than a rigid ticket form, Savi collects support details through natural conversation. This reduces drop-off and makes the experience feel more human. The structured extraction happens in a second Groq call with JSON-mode output — deterministic and auditable.

**Excel ticket archive**
The support team gets a `support_tickets.xlsx` file they can open immediately without a dashboard. In production I would replace this with a Postgres-backed ticket service and an admin view, but for a 36-hour MVP it's the right call.

**Haversine from scratch**
Nearest store calculation uses a hand-rolled haversine formula rather than a geopy dependency. Fewer dependencies, same result, and it's a single function.

---

## 6. Known issues and what I'd improve

**Known issues**
- No real SMS delivery. `OTP_DEV_MODE=true` returns OTPs in the response.
- Render free tier cold starts can delay the first request by up to 50 seconds.
- `support_tickets.xlsx` is a proof-of-concept archive, not horizontally scalable.
- CORS requires `FRONTEND_URL` to be set correctly on Render.

**With more time**
- Integrate MSG91 or Fast2SMS for real OTP delivery
- Persist support tickets in Postgres with an admin dashboard
- Add end-to-end tests for auth, chat, and support flows
- Harden token refresh and session expiry handling
- Improve Savi's extraction reliability with few-shot examples in the system prompt

---

## 7. OTP strategy reasoning

OTPs are stored as HMAC-SHA256 hashes — never plaintext. They expire in 5 minutes, are single-use, and are rate-limited to 3 requests per mobile per 10 minutes.

In dev mode (`OTP_DEV_MODE=true`), the generated OTP is returned in the API response so the full flow can be tested without an SMS gateway. This is clearly flagged in the UI with a yellow banner.

The integration point is `app/utils/otp.py → send_otp()`. Swapping in MSG91 requires adding credentials to `.env` and implementing one function — nothing else changes.

---

## 8. AI agent design — Savi

**Why a named assistant**
Savi is Savomart's virtual assistant. A named, warm persona reduces the friction of submitting a support issue. Customers describe their problem naturally instead of filling out a form.

**Conversation → structured data pipeline**
1. User messages stream through Groq Llama 3.3 70B with a crafted system prompt
2. Savi collects: name, contact, issue_category, description through natural conversation
3. When Savi confirms ("I'll log this for you"), a second Groq call extracts structured JSON
4. The structured data is appended to `support_tickets.xlsx` with a `SAVO-YYYYMMDD-XXXX` ticket ID
5. The ticket ID is returned to the customer in the chat

**Why Groq over OpenAI**
Groq's inference speed makes the chat feel responsive. Llama 3.3 70B handles JSON extraction reliably. It's also free-tier friendly for a 36-hour build.

---

## 9. Architecture overview
Browser (Vercel)
│
├── React SPA
│   ├── Auth (OTP login)
│   ├── Dashboard (loyalty, coupons)
│   ├── Offers
│   ├── Stores (Leaflet map + list)
│   ├── Support (contact + ticket form)
│   └── Savi chat (AI agent)
│
▼
FastAPI (Render Docker)
├── /auth        — OTP send/verify, JWT
├── /profile     — loyalty profile + coupons
├── /offers      — active offers
├── /stores      — proxy + cache Savomart live API, haversine nearest
├── /support     — contact info + ticket creation
└── /chat        — Savi agent (Groq Llama 3.3 70B)
│
├── PostgreSQL (Render)
│   └── users, loyalty_profiles, coupons, otps, offers, support_tickets
│
└── Savomart Live API
└── https://internal-service.savomart.in/bridge/api/store/list

---

## 10. How I used AI tools

- **Claude (Anthropic)** — shaped the system architecture, phase-by-phase build plan, 5-layer context prompts for each module, Savi's system prompt and personality design, and debugging integration issues across the stack
- **Codex (OpenAI)** — agentic code generation for backend modules including models, routers, services, and auth system
- **GitHub Copilot** — inline code suggestions and boilerplate during implementation inside VS Code
- **Antigravity** — agentic frontend development for React screens including the dashboard, offers, stores map, support, and Savi chat UI

AI was used to accelerate scaffolding, boilerplate, and code generation. Architecture decisions, trade-off reasoning, prompt design, and integration debugging were done manually.

---

## 11. Deployment

### Backend (Render)

1. Create Render account, connect GitHub repo
2. Create PostgreSQL database: `savomart-db` (free tier, Singapore)
3. Create Web Service: Docker, Dockerfile path `backend/Dockerfile`, Docker context `backend`
4. Set environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Internal Postgres URL from Render (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | Any strong random string |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` |
| `GROQ_API_KEY` | Your Groq API key |
| `OTP_DEV_MODE` | `true` |
| `SAVOMART_API_URL` | `https://internal-service.savomart.in/bridge/api/store/list` |
| `SAVOMART_API_TOKEN` | `savo-bridge-cron-secret` |
| `FRONTEND_URL` | `https://savomart-peach.vercel.app` |

5. Deploy. Render builds the Docker image, runs `alembic upgrade head`, then starts uvicorn.
6. Verify: `GET https://savomart-backend-v5el.onrender.com/health`

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

Set `VITE_API_URL=https://savomart-backend-v5el.onrender.com` in Vercel dashboard → Environment Variables → Redeploy.

---

## 12. Health check

```bash
curl https://savomart-backend-v5el.onrender.com/health
# {"status":"ok","service":"savomart-api","version":"1.0.0"}
```