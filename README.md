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
