# VisaCoach Monitoring

Use this after deploying VisaCoach on the Oracle Traefik stack. The goal for beta is simple: know whether the app is reachable, whether the backend is alive, whether MongoDB is connected, and whether Gemini is falling back too often.

## Uptime Kuma Monitors

Create these monitors in Uptime Kuma.

| Name | Type | URL | Expected |
| --- | --- | --- | --- |
| VisaCoach frontend | HTTP(s) | `https://visacoach.kakugri.dev/` | status 200 |
| VisaCoach backend live | HTTP(s) keyword | `https://visacoach.kakugri.dev/api/live` | `"status":"ok"` |
| VisaCoach backend health | HTTP(s) keyword | `https://visacoach.kakugri.dev/api/health` | `"status":"ok"` |
| VisaCoach analytics route | HTTP(s) keyword | `https://visacoach.kakugri.dev/api/analytics/status` | `"totalEvents"` |

Suggested intervals:

- Frontend and `/api/live`: 60 seconds.
- `/api/health`: 2-5 minutes.
- Analytics status: 5-10 minutes.

Keep retry count at 2 or 3 so brief deploy restarts do not page you unnecessarily.

## What Health Means

`/api/live` only means the backend process is running.

`/api/health` is the stronger check. It should include:

```json
{
  "status": "ok",
  "checks": {
    "mongo": { "label": "connected" },
    "ai": {
      "quotaCooldown": { "active": false },
      "usageSinceStart": {}
    },
    "analytics": {
      "totalEvents": 0,
      "eventsByName": {}
    }
  }
}
```

If `status` is `degraded`, inspect:

- `checks.mongo.label`: MongoDB connectivity.
- `checks.ai.quotaCooldown.active`: Gemini quota cooldown.
- `checks.analytics.eventsByName`: whether real users are reaching product milestones.

## Manual Beta Check

After each deploy:

```bash
cd /opt/docker/apps/visacoach/source
git pull
npm run smoke:prod
```

Then run one real browser session:

1. Open the homepage.
2. Choose `United States` and `F1 Student Visa`.
3. Start a practice session.
4. Submit one short answer.
5. Confirm the feedback source label appears.
6. Check health:

```bash
curl https://visacoach.kakugri.dev/api/health
```

You should see `checks.analytics.eventsByName.session_started`, `checks.analytics.eventsByName.question_set_prepared`, and `checks.ai.usageSinceStart` begin to move.

For question personalization quality, inspect backend logs for sanitized `question_set_prepared` events. Useful fields are `questionSource`, `questionSourceReason`, `personalizedQuestions`, `questionCount`, `contextFieldCount`, and `concernCount`. These should not include applicant answers, notes, or documents.

## Logs

For backend logs:

```bash
docker logs --tail=200 visacoach-backend
```

Useful filters:

```bash
docker logs --tail=500 visacoach-backend | grep product_analytics_event
docker logs --tail=500 visacoach-backend | grep "Error in AI response"
docker logs --tail=500 visacoach-backend | grep "status\":5"
```

Do not paste logs containing secrets into public places. The current request logs and analytics events should not include API keys or applicant answers, but still treat production logs as private operational data.
