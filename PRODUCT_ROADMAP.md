# VisaCoach Product Roadmap

Last updated: 2026-05-24

VisaCoach starts as a visa interview practice tool, not a broad interview platform. The product should first become excellent at one short workflow:

```text
select visa path -> provide context -> answer practice questions -> get useful feedback -> save or share summary
```

## Milestone 1: Polished Visa Practice MVP

Status: complete.

Goal: make the current no-login practice flow feel smooth, useful, and credible in under five minutes.

Deliverables:

- Keep the first screen focused on visa practice, not a marketing landing page.
- Support a five-question practice sprint.
- Auto-advance after feedback so users do not need a second click after every answer.
- Show whether feedback came from Gemini or local fallback.
- Make `brief`, `detailed`, and `realistic` feedback modes behave differently and clearly.
- Render feedback as readable structured coaching, not raw Markdown text.
- Save the latest session locally for no-login users.
- Provide a copyable session summary.
- Keep legal/outcome boundaries visible: practice only, no legal advice, no guarantee.

Exit criteria:

- A new user can complete one useful session without login.
- Backend unavailable still gives local fallback feedback.
- Gemini available gives visibly better feedback.
- `npm run build` passes.

## Milestone 2: Personal Context Intake

Status: complete.

Goal: make questions and feedback more personalized without turning the app into a long form.

Deliverables:

- Add a short pre-session intake:
  - home country or current residence
  - destination country
  - visa type
  - school, employer, trip, or program name
  - funding source
  - return plan or home ties
- Decide whether to keep the confidence slider.
- If kept, use confidence in:
  - Gemini prompt context
  - final session summary
  - before/after confidence comparison
- Use selected concerns in prompts:
  - answering questions
  - documentation
  - English clarity
  - nervousness
- Add optional paste boxes for statement of purpose, resume, or application notes.

Exit criteria:

- Feedback references the user's own context.
- Confidence and concerns either influence the session or are removed.
- Intake can be completed in under one minute.

## Milestone 3: Structured AI Feedback

Status: core complete; backend tests added. Frontend summary/rendering tests remain.

Goal: make AI output reliable enough for product use.

Deliverables:

- Return structured JSON from the backend instead of free-form text.
- Normalize response fields:
  - quick read
  - main fix
  - stronger answer
  - consistency check
  - risk flags
  - follow-up question
- Add separate prompt templates for:
  - F1 student visa
  - B1/B2 visitor/business visa
  - generic fallback visa practice
- Keep `realistic` mode as officer-style follow-up, not coaching.
- Add backend validation for required request fields.
- Add graceful Gemini error handling and local fallback metadata.

Exit criteria:

- Frontend rendering no longer depends on parsing Markdown.
- Similar answers produce similarly structured feedback.
- Bad or missing backend responses do not break the interview flow.

## Milestone 4: Sessions And Accounts

Status: complete for the current product scope. Authenticated history works, and the latest no-login session migrates into the account after signup/login.

Goal: let users save and revisit practice without forcing login before first value.

Deliverables:

- Keep no-login practice available.
- Invite account creation after a completed session.
- Save authenticated sessions to MongoDB.
- Replace mock profile data with real saved sessions.
- Build a simple saved-sessions page:
  - date
  - visa path
  - questions answered
  - top improvement areas
  - copied/exported summary
- Remove premium/upgrade language until there is a real monetization plan.

Exit criteria:

- Logged-in users can see real saved history.
- Logged-out users can still complete a session.
- The profile area no longer contains mock/premium dashboard artifacts.

## Milestone 5: UI And Launch Polish

Status: in progress. Legacy pages/claims removed, info pages added, local analytics added, backend rate limiting added, mobile CSS pass started, and Playwright desktop/mobile checks now cover landing, prep, full session completion, summary copy, saved-session navigation, and local-session migration after registration.

Goal: make the app feel credible enough to share publicly.

Deliverables:

- Simplify the prep screen into a compact setup panel.
- Make the interview screen feel like a focused practice console.
- Clean legacy files and CSS:
  - old landing page
  - unused premium sections
  - unused mock services
  - dead routes
- Add responsive checks for mobile.
- Add empty, loading, and error states.
- Add privacy, terms, and contact pages.
- Add basic analytics:
  - session started
  - first answer submitted
  - session completed
  - summary copied
  - feedback source used
- Add rate limiting and basic abuse protection on the backend.

Exit criteria:

- Public demo can be shared without explaining caveats.
- Mobile flow is usable.
- No broken nav links or dead premium CTAs.

## Milestone 6: Deployment

Status: in progress. Deployment runbook, backend health checks, request IDs, structured request logging, runtime config validation, production env templates, and an Oracle Traefik deployment bundle are in place. Production hosting is not deployed yet.

Goal: make VisaCoach available to real users.

Deliverables:

- Use the existing Oracle Traefik stack for frontend and backend.
- Configure production environment variables:
  - frontend API URL
  - backend CORS origins
  - MongoDB URI
  - Gemini key and model
  - JWT secret
  - Google OAuth client ID, if auth remains enabled
- Add production logging.
- Add basic monitoring.
- Add backup/export path for saved sessions.

Exit criteria:

- Production URL works.
- Gemini feedback works in production.
- MongoDB sessions save in production.
- No secrets are committed.

## Milestone 7: Expansion Beyond Visa Interviews

Status: intentionally deferred.

Goal: expand only after the visa workflow proves useful.

Deliverables:

- Extract a generic interview-mode framework:
  - visa
  - job
  - school
  - founder/pitch
- Add mode-specific intake fields.
- Add mode-specific question banks and rubrics.
- Keep each mode small and complete before adding another.

Exit criteria:

- Visa mode remains the polished flagship.
- New modes reuse the core session engine.
- Expansion does not make first-use visa practice slower.

## Current Priority

Milestones 1 and 2 are implemented in the core no-login flow. Milestone 3 is now core-complete on the backend with structured feedback, visa-specific prompt profiles, validation, local fallback, and tests. Milestone 4 is complete for the current product scope. Milestone 5 is the active workstream, with Milestone 6 deployment prep started.

Immediate next build priorities:

- Add frontend tests for summary generation, structured feedback rendering, and account prompts.
- Complete the first live deployment on the Oracle Traefik stack.
- Expand Playwright checks to cover live authenticated login and profile refresh behavior.
