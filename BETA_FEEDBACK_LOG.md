# VisaCoach Beta Feedback Log

Use this file as the working record for beta sessions. Keep sensitive user details out of the log.

## Summary Dashboard

Update this after every small batch of testers.

| Metric | Current |
| --- | --- |
| Testers invited | 0 |
| Testers completed one session | 0 |
| Summaries copied | 0 |
| Accounts created | 0 |
| Saved sessions confirmed | 0 |
| Users asking for deeper visa coaching | 0 |
| Users asking for job/school/founder modes | 0 |
| Blocking bugs found | 0 |

## Tester Log

| Date | Tester | Visa path | Completed session? | Copied summary? | Created account? | Main confusion | Main requested improvement | Asked for non-visa mode? | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | T1 | US F1 | Yes/No | Yes/No | Yes/No |  |  | Yes/No |  |

## Analytics Snapshot

Record this from `npm run beta:health` and backend logs.

| Date | session_started | first_answer_submitted | session_completed | summary_copied | question_set_prepared | Gemini question sets | Local question sets | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| YYYY-MM-DD | 0 | 0 | 0 | 0 | 0 | 0 | 0 |  |

## Decision Rubric

Score each item from `0` to `2`.

| Signal | 0 | 1 | 2 | Score |
| --- | --- | --- | --- | --- |
| First-screen clarity | Most testers confused | Some hesitation | Most start easily |  |
| Session completion | Few complete | About half complete | Most complete |  |
| Feedback usefulness | Generic/not useful | Mixed | Clearly useful |  |
| Summary usefulness | Rarely copied/used | Mixed | Often copied/valued |  |
| Profile clarity | Confusing | Mixed | Understandable |  |
| Personalized questions | Not noticed or weak | Mixed | Clearly better |  |
| Visa-depth demand | No requests | Some interest | Repeated requests |  |
| Non-visa demand | No requests | Some interest | Repeated requests |  |

Interpretation:

- If visa-depth demand is high and core clarity is good, deepen visa coaching.
- If non-visa demand is high and core clarity is good, sketch M8 mode architecture.
- If clarity or completion is weak, fix the current visa flow before adding scope.

## Decision Notes

Use this section after each review.

```text
Review date:
Main evidence:
Decision:
Next build bet:
Risks:
```
