# VisaCoach Product Roadmap

Last updated: 2026-05-25

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

Status: core complete; backend tests and frontend summary/feedback formatting tests added.

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
  - delete saved session
  - search, filter, and sort saved sessions
  - restart practice from a saved session with saved context prefilled
- Add server-side account data export from settings.
- Remove premium/upgrade language until there is a real monetization plan.

Exit criteria:

- Logged-in users can see real saved history.
- Logged-in users can delete saved sessions.
- Logged-in users can export account/session data.
- Logged-in users can delete their account and embedded saved history.
- Logged-out users can still complete a session.
- The profile area no longer contains mock/premium dashboard artifacts.

## Milestone 5: UI And Launch Polish

Status: in progress. Legacy pages/claims removed, info pages added, local analytics added, backend rate limiting added, account navigation polished, prep setup compacted, account export/delete hardened, unused mock components/services removed, mobile CSS pass started, and Playwright desktop/mobile checks now cover landing, prep, full session completion, summary copy, saved-session search/filter/delete, practice-again from history, account export/delete, dropdown behavior, email login/profile refresh, and local-session migration after registration.

Goal: make the app feel credible enough to share publicly.

Deliverables:

- Simplify the prep screen into a compact setup panel.
- Keep homepage calls to action clear: choosing a visa path starts setup, not the interview itself.
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

Status: live. VisaCoach is deployed at `https://visacoach.kakugri.dev` on the Oracle Traefik stack. Backend health, MongoDB, Google login, and Gemini feedback are working in production.

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
- Add Gemini quota fallback labeling and default to `gemini-2.5-flash-lite`.

Exit criteria:

- Production URL works.
- Gemini feedback works in production.
- MongoDB sessions save in production.
- No secrets are committed.

Completed hardening:

- Server-side account export endpoint returns sanitized profile data and saved sessions.

Remaining hardening:

- Rotate any exposed Gemini keys after testing.
- Decide whether to enable paid Gemini billing or add a secondary provider.
- Add uptime and error monitoring beyond Docker logs.

## Milestone 7: Question Personalization And Profile Onboarding

Status: core complete for question personalization; onboarding polish in progress. The product keeps the static question bank as a fallback while using backend-generated personalized question sets when Gemini is available. Saved sessions can relaunch practice with prior applicant context prefilled, logged-in users can save a practice profile before starting a simulation, and first-run registrations are guided into that setup.

Goal: make each practice session feel tailored without making the first-use flow slower or fragile.

Design decisions:

- Keep no-login practice as the fastest path to value.
- Offer account creation before practice for users who already know they want saved history.
- Keep static visa question banks as a reliable fallback.
- Use Gemini to generate a five-question session from selected visa path and applicant context.
- Label whether the question set came from Gemini or the question bank.
- Do not let question generation block practice when Gemini quota is exhausted.

Deliverables:

- Add a backend question-generation endpoint.
- Add frontend question-source labeling.
- Add a "personalize questions with my context" control.
- Add pre-practice sign-in/create-profile entry points.
- Save question-set source metadata with account history.
- Reuse saved profile/session context when starting another practice session.
- Save account-level practice profile defaults.
- Keep prep tips curated for public beta; revisit model-assisted tips after quota/provider decisions.

Exit criteria:

- Users can create a profile before starting practice.
- Users can still practice without login.
- Context-aware question sets work in production.
- Gemini quota fallback remains clear and non-blocking.

## Milestone 8: Expansion Beyond Visa Interviews

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

Milestones 1 and 2 are implemented in the core no-login flow. Milestone 3 is now core-complete on the backend with structured feedback, visa-specific prompt profiles, validation, local fallback, and tests. Milestone 4 is complete for the current product scope. Milestone 6 is live. Milestone 5 polish and Milestone 7 personalization/profile onboarding are the active workstreams.

Immediate next build priorities:

- Add broader frontend tests around account prompts and auth redirects.
- Continue cleanup of unused assets and old CSS as the UI settles.
