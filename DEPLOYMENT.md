# VisaCoach Deployment Runbook

This runbook keeps deployment target-neutral first, then includes the Oracle Traefik path for the current production target.

## Services

- Frontend: static React build from `frontend/build`.
- Backend: Node/Express service from `backend/server.js`.
- Database: MongoDB-compatible hosted database.
- AI provider: Gemini API key.

## Frontend

Build command:

```bash
cd frontend
npm install
npm run build
```

Publish directory:

```text
frontend/build
```

Production environment variables:

```bash
REACT_APP_API_BASE_URL=https://your-backend.example.com
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_CONTACT_URL=mailto:feedback@example.com?subject=VisaCoach%20feedback
```

`REACT_APP_GOOGLE_CLIENT_ID` is optional. If it is not set, email login/register still renders and Google auth is hidden.
`REACT_APP_CONTACT_URL` is optional. If set, the Contact page links to that feedback/support channel.

## Backend

Start command:

```bash
cd backend
npm install
npm start
```

Production environment variables:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
CORS_ORIGINS=https://your-frontend.example.com
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-lite
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX=20
ANALYTICS_RATE_LIMIT_WINDOW_MS=60000
ANALYTICS_RATE_LIMIT_MAX=120
JSON_BODY_LIMIT=100kb
REQUEST_LOGGING=true
LOG_LEVEL=info
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

Use the backend host's provided `PORT` if it injects one automatically.

## Oracle Traefik Deployment

The repo includes a deployment bundle at:

```text
deploy/oracle-traefik
```

This matches the existing `/opt/docker` template:

- Traefik v3 on `websecure`
- Let's Encrypt resolver named `letsencrypt`
- included app compose files under `/opt/docker/apps/<app>/compose.yaml`
- hostnames defined from `/opt/docker/.env`

Recommended production shape:

```text
https://visa.yourdomain.com/        -> visacoach-frontend
https://visa.yourdomain.com/api/*   -> visacoach-backend
https://visa.yourdomain.com/health  -> visacoach-backend
```

Do not put `authelia@docker` on the VisaCoach routers for the public v1 launch. The product needs no-login practice sessions to be reachable.

See [deploy/oracle-traefik/README.md](./deploy/oracle-traefik/README.md) for copy/build/start commands.

## Health Checks

The backend exposes:

```text
GET /health
GET /api/health
```

A healthy response returns `200` with:

```json
{
  "status": "ok",
  "service": "visacoach-backend"
}
```

If MongoDB is configured but disconnected, health returns `503` with `status: "degraded"`.

The detailed health payload also includes sanitized AI runtime state under `checks.ai`, including the configured model, Gemini quota cooldown status, and in-memory counts of Gemini responses versus local fallbacks since the backend process started. Product event counters appear under `checks.analytics`. These fields do not expose API keys or user answers.

## Logging

Backend requests emit structured JSON logs with:

- `requestId`
- `method`
- `path`
- `status`
- `durationMs`
- `ip`

Every response includes `X-Request-Id` so a user-facing error can be matched to server logs.

## Pre-Deploy Checklist

Run locally before each deploy:

```bash
cd backend
npm test
```

```bash
cd frontend
npm run build
npm run e2e
```

Confirm:

- `.env` files are not committed.
- Production `CORS_ORIGINS` contains only deployed frontend origins.
- `JWT_SECRET`, `MONGODB_URI`, and `GEMINI_API_KEY` are set in the backend environment.
- Frontend `REACT_APP_API_BASE_URL` points to the deployed backend.
- For the Oracle Traefik deployment, `/opt/docker/.env` contains `VISACOACH_HOSTNAME`.
- For the Oracle Traefik deployment, `/opt/docker/data/visacoach/backend.env` contains backend secrets unless `DOCKER_DATA_DIR` points somewhere else.
- `GET /health` returns `200` after deploy.
- A no-login practice session works.
- Login/register works.
- A no-login session migrates into saved history after signup/login.

## Production Smoke Test

After deploying, run the non-AI smoke test from the repo root:

```bash
npm run smoke:prod
```

For a different hostname:

```bash
APP_URL=https://your-host.example.com npm run smoke:prod
```

This checks the frontend app shell, `/api/live`, `/api/health`, `/health`, public prep tips, and the sanitized analytics event endpoint. It intentionally does not call Gemini so it does not consume the limited AI quota.

Then do one browser smoke pass:

- Start a no-login practice session.
- Confirm the question source label is visible.
- Submit one short answer and confirm the feedback source label is visible.
- Sign in or register and confirm saved history loads.
- Delete the test saved session.

For AI/quota diagnostics:

```bash
curl https://visacoach.kakugri.dev/api/health
```

Check `checks.ai.quotaCooldown.active`, `checks.ai.quotaCooldown.retryAfterSeconds`, `checks.ai.usageSinceStart`, and `checks.analytics.eventsByName`.

## Rollback

- Keep the previous frontend build/deployment available if the host supports instant rollback.
- Keep the previous backend release available if the host supports release rollback.
- Do not run destructive database migrations without a backup/export path.
