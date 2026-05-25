# VisaCoach Next Build Candidates

Use this after the first beta feedback review. Do not build all of these at once.

Current recommendation:

```text
A1 Answer Revision Loop -> D1 Progress Dashboard -> C1 Visa Fact Consistency Prep
```

M8/job interviews remain deferred unless users repeatedly ask for non-visa modes.

## Candidate A: Deeper Visa Coaching

Best if testers complete sessions and ask for more rigorous visa-specific help.

Scope:

- Stricter officer mode for F1 and B1/B2.
- Answer revision loop after feedback.
- Visa-specific consistency checklist.
- Session comparison over time.

Why it could win:

- Keeps the product focused.
- Builds depth where the current wedge already exists.
- Avoids competing directly with broad job-interview platforms too early.

Risks:

- Can drift toward legal/immigration advice if boundaries are not tight.
- More visa-specific rubrics require careful wording.

First slice:

```text
answer -> feedback -> revise answer -> compare original vs revised -> save both in summary
```

## Candidate B: Job Interview Pilot

Best if testers repeatedly ask for job interview practice and the visa workflow is stable.

Benchmark:

- Big Interview is the main reference for depth and polish.
- The goal is not a generic chatbot. The goal is a focused loop: prep, tailored practice, feedback, answer revision, and progress.

Scope:

- Job target intake:
  - role
  - company
  - seniority
  - resume/context notes
  - interview type
- Behavioral and role-specific question sets.
- STAR answer rubric.
- Answer revision loop.
- Session summary and progress history.

Risks:

- Crowded market.
- Larger surface area than visa practice.
- Needs a clear differentiator before it is worth building.

First slice:

```text
role/company/context -> 5 behavioral questions -> STAR feedback -> revise one answer -> copy summary
```

## Candidate C: Visa Document Consistency Prep

Best if testers say the interview questions are useful but they worry about matching answers to documents.

Scope:

- Structured fact sheet, not document uploads:
  - school/program
  - funding source
  - sponsor
  - return plan
  - ties
  - dates
- Consistency warnings in feedback.
- Copyable prep checklist.

Why it could win:

- Valuable for visa users.
- Safer than asking for sensitive documents.
- Strengthens the current product without expanding modes.

Risks:

- Must avoid legal-advice language.
- Could become a long form if not kept compact.

First slice:

```text
profile facts -> answer feedback checks facts -> end summary lists consistency gaps
```

## Candidate D: Progress Dashboard

Recommended after Candidate A. It becomes more useful once sessions include original/revised answers and richer improvement patterns.

Scope:

- Track sessions over time.
- Show confidence before/after trends.
- Show recurring improvement areas.
- Show feedback source and question source history.

Why it could win:

- Increases account value.
- Uses data the app already saves.

Risks:

- Less useful if users only do one session.
- Can feel like fake precision if scoring is overemphasized.

First slice:

```text
profile page -> progress panel -> confidence trend + recurring focus areas
```

## Selection Rule

Pick one candidate after the first beta review:

- Default to A first.
- Choose D second if users repeat sessions or save revised answers.
- Choose C after A/D if users worry about document/fact consistency.
- Choose B only if non-visa demand is repeated and specific.
