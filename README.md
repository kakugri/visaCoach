# VisaCoach

VisaCoach is a small visa-interview practice MVP. The current product goal is simple:

```text
choose country and visa type -> answer five practice questions -> get feedback -> copy/save a session summary
```

The first-use flow does not require login. Authenticated history and remote AI feedback are available when the backend environment is configured.

## What Works Now

- Five-question visa interview practice sprint.
- Country and visa-type selection.
- Short personal context intake for home country, program/purpose, funding, return plan, concerns, and confidence.
- Gemini-backed structured feedback after each answer, with brief, detailed, and realistic modes.
- Local fallback feedback when the backend or AI provider is not configured.
- Local session save through `localStorage`.
- Copyable end-of-session practice summary.
- Authenticated users can save and revisit session history from MongoDB.
- Basic About, Privacy, Terms, and Contact pages are included for public demos.
- Local-only analytics events are recorded for session starts, first answers, completions, copied summaries, and feedback source usage.
- Backend rate limiting, security headers, and request body limits are configured.

## Product Boundary

VisaCoach is a practice tool. It is not legal advice, does not replace official visa guidance, and does not predict or guarantee any visa outcome.

## Tech Stack

- Frontend: React, React Router, Axios, Create React App.
- Backend: Node.js, Express, MongoDB/Mongoose, JWT auth, optional Google OAuth, optional Gemini feedback.

## Quick Start: Frontend MVP

Create `frontend/.env` with:

```bash
REACT_APP_API_BASE_URL=http://127.0.0.1:5000
```

Then run:

```bash
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000`. The API URL is configurable through `REACT_APP_API_BASE_URL`; if the backend is unavailable, the app falls back to local heuristic feedback.

## Frontend Browser Checks

Playwright is configured for desktop and mobile Chromium smoke checks. With the frontend already running at `http://127.0.0.1:3000`, run:

```bash
cd frontend
npm run e2e
```

To let Playwright start its own frontend server on port `3001`, run:

```bash
cd frontend
npm run e2e:with-server
```

## Optional Backend

The backend is useful when you want authenticated users, remote AI feedback, and saved interview history.

Create `backend/.env` with:

```bash
PORT=5000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX=20
JSON_BODY_LIMIT=100kb
GOOGLE_CLIENT_ID=your_google_client_id
```

Then run:

```bash
cd backend
npm install
node server.js
```

The backend runs at `http://localhost:5000`.

For production setup, environment variables, health checks, and the Oracle Traefik deployment bundle, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Near-Term Roadmap

- Add interview modes after the visa flow proves useful: job, school, founder, and grant/pitch interviews.
- Add frontend tests around live login, profile refresh, and authenticated history errors.
- Deploy the first public build to the Oracle Traefik stack.
