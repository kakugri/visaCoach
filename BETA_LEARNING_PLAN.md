# VisaCoach Beta Learning Plan

Last updated: 2026-05-25

VisaCoach is public-beta ready. The next phase is learning from real use before adding large new product scope.

## Weekly Review

Run this review at least once per week during beta, and after any meaningful user test.

1. Check production availability:

```bash
npm run beta:health
```

This checks `/api/live`, `/api/health`, and `/api/analytics/status`. It does not call Gemini feedback or question-generation routes.

2. Check Uptime Kuma:

- Frontend is up.
- Backend live is up.
- Backend health is up.
- Analytics status is up.

3. Inspect backend logs:

```bash
docker logs --tail=500 visacoach-backend | grep product_analytics_event
docker logs --tail=500 visacoach-backend | grep "Error in AI response"
```

## Signals To Watch

Reliability:

- MongoDB stays connected in `/api/health`.
- Gemini quota cooldown is rare or clearly labeled.
- Backend logs do not show repeated 5xx errors.
- Uptime Kuma remains `Up: 4`.

Practice funnel:

- `question_set_prepared`
- `session_started`
- `first_answer_submitted`
- `session_completed`
- `summary_copied`

Personalization:

- Compare `questionSource: gemini` vs `questionSource: local`.
- Watch `questionSourceReason` for quota/network fallback.
- Watch `contextFieldCount` to see if users are giving enough context for personalization to matter.
- Watch `concernCount` to see which coaching needs are most common.

Qualitative feedback:

- Did the questions feel realistic?
- Was the feedback too generic, too harsh, or useful?
- Did users understand profile setup?
- Did users know what to do after the summary?
- Did anyone ask for job, school, or founder interview modes unprompted?

Use [BETA_TESTING_GUIDE.md](./BETA_TESTING_GUIDE.md) when recruiting early testers so feedback is consistent.
Record results in [BETA_FEEDBACK_LOG.md](./BETA_FEEDBACK_LOG.md) so product decisions are based on the same evidence each week.

## Decision Gates

Use the rubric in [BETA_FEEDBACK_LOG.md](./BETA_FEEDBACK_LOG.md) before committing to a larger build direction.

Deepen visa coaching if:

- Users complete sessions but ask for better/stricter visa-specific coaching.
- Users want document consistency checks, answer rewrites, or more realistic follow-ups.
- Personalized questions are used often and feedback says they feel relevant.

Start M8 mode planning if:

- Multiple users explicitly ask for non-visa modes.
- The visa workflow feels stable and self-explanatory.
- The core session engine no longer needs major changes.
- We can define a job-interview pilot that has a clear edge against Big Interview-style training plus mock interview products.

Do not expand yet if:

- Users are confused before starting practice.
- Saved profile setup is unclear.
- Gemini quota/fallback behavior causes distrust.
- Session completion or summary copy rates are weak.

## Next Product Bets

Visa-depth candidates:

- Stricter officer mode for F1/B1-B2.
- Answer rewrite practice after each feedback item.
- Document consistency checklist tied to answers.
- Session comparison over time.

Expansion candidates:

- Job interview mode, with Big Interview as the benchmark for prep depth, tailored practice, feedback, and progress tracking.
- School/admissions interview mode.
- Founder or pitch practice mode.

The default next bet is the V1 answer revision loop, followed by progress visibility and then visa fact consistency. M8/job interviews remain deferred unless beta users pull strongly toward another mode.

Use [NEXT_BUILD_CANDIDATES.md](./NEXT_BUILD_CANDIDATES.md) to pick the first post-beta build slice after reviewing tester evidence.
