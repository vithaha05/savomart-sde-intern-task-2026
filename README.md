# Savomart Loyalty Companion App

Production-ready scaffold for the Savomart SDE Intern Task 2026.

## Stack

- Backend: FastAPI, SQLAlchemy async, PostgreSQL
- Frontend: React, Vite
- Deployment: Render for backend and database, Vercel for frontend
- Brand colors: `#782B90` and `#FFF200`

## Project Structure

```text
savomart-sde-intern-task-2026/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
└── frontend/
```

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API health check is available at `GET /api/health`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment

Backend configuration is loaded from `backend/.env` using `pydantic-settings`.
Use `backend/.env.example` as the source of required environment variables.

## Deployment Notes

- Set backend environment variables in Render.
- Use a Render PostgreSQL database URL with the `postgresql+asyncpg://` scheme.
- Set frontend environment variables in Vercel when API integration is added.

## Deploying Backend to Render (step-by-step)

1. Create a Render account and connect your GitHub account.
2. In your Render dashboard, create a new PostgreSQL database (Free plan). Name it `savomart-db`.
3. Create a new Web Service → Select `Docker` and point to this repository. For the Dockerfile path enter `backend/Dockerfile`.
4. In the Web Service settings, set the following environment variables (Render UI) — see descriptions below:
	- `DATABASE_URL` — set from the database you created (Render can populate it automatically when you select the DB in `render.yaml`).
	- `SECRET_KEY` — strong random secret for signing tokens.
	- `FRONTEND_URL` — your frontend origin (e.g. `https://savomart-sde-intern-task-2026.vercel.app`).
	- `GROQ_API_KEY` — (optional) if using external Groq APIs.
	- `OTP_DEV_MODE` — `true` or `false`.
	- `SAVOMART_API_URL` — (optional) internal Savomart bridge URL.
	- `SAVOMART_API_TOKEN` — (optional) token for Savomart bridge.
	- `SUPPORT_PHONE` — contact phone number for support messages.
	- `SUPPORT_EMAIL` — contact email for support messages.

5. Deploy. Render will build the Docker image using `backend/Dockerfile`. The container runs `alembic upgrade head` before starting `uvicorn`.

Notes:
- The backend exposes a public health endpoint at `GET /health` which returns service status.
- On Render free tier, instances have 512MB RAM and may spin down after inactivity; expect cold starts.
- To run the seed script on Render after deploy, use a one-off job or run the `scripts/seed_data.py` locally against the deployed database.

Environment variables reference (what to set on Render):

- `DATABASE_URL` — (required) Postgres connection string provided by Render. Must be available to the container before migrations run. Render can inject this from the created DB.
- `SECRET_KEY` — (required) JWT secret used by the backend.
- `FRONTEND_URL` — (recommended) Frontend origin to allow CORS.
- `GROQ_API_KEY` — (optional) external API key used by some services.
- `OTP_DEV_MODE` — (optional) when `true` bypasses OTP for development.
- `SAVOMART_API_URL` & `SAVOMART_API_TOKEN` — (optional) bridge service URL and token.
- `SUPPORT_PHONE` & `SUPPORT_EMAIL` — (optional) displayed in support messages.

If you prefer to use the `render.yaml` manifest, push it to the repo root and Render will auto-detect the services and database configuration.
