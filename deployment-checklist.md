# Render Deployment Checklist

Use this checklist to verify the backend is deployed successfully on Render.

1. Service built and running
   - [ ] The `savomart-backend` service shows a healthy build and active instance in Render.
2. Database connected
   - [ ] The `savomart-db` Postgres instance is `Healthy` in Render and the web service shows `DATABASE_URL` mapped.
3. Migrations ran
   - [ ] Confirm `alembic` migrations ran during startup (check build logs for `alembic upgrade head`).
4. Health endpoint
   - [ ] Visit `https://<your-backend-url>/health` and get:
     ```json
     {"status":"ok","service":"savomart-api","version":"1.0.0"}
     ```
5. CORS & Frontend
   - [ ] `FRONTEND_URL` is set on Render and is included in `CORS_ORIGINS` (backend should accept requests from the frontend origin).
6. API smoke test
   - [ ] Call a simple authenticated endpoint (or public endpoint) to verify the API responds.
7. Ticket flow
   - [ ] Submit a support request via the frontend and verify the API returns `ticket_saved: true` (if applicable) and ticket ID is visible.
8. Seed data (optional)
   - [ ] Run `python scripts/seed_data.py` as a one-off job against the Render DB or run locally pointing `DATABASE_URL` to Render DB.

Notes:
- Render free tier provides 512MB RAM and may cold-start; expect occasional longer response times after inactivity.
- If migrations fail, check `DATABASE_URL` env var and DB user permissions.
