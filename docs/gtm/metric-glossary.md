# Metric Glossary

One definition per term, so "activation" means the same thing in a founder update, a leader call, and the code. Matches `docs/superpowers/specs/2026-09-13-strikelab-yc-company-design.md` §3.

Numbers are **client-supplied never trusted** — all cohort metrics must come from a server-derived view, not from anything the browser reports about itself.

| Term | Definition | Source of truth today | Source of truth once Phase 1 ships |
|---|---|---|---|
| **Enrolled** | A signed-in student joined the cohort's class. | `class_members` row exists. | Same. |
| **Activated** | An enrolled student completed the first assigned lesson within 7 days of joining, or of the cohort start date — whichever is later. | Not measurable — `progress.completed` has no per-lesson timestamp. | A `lesson_completions` row for the first assigned lesson with `completed_at` inside the window. |
| **Week N active** | At least one assigned lesson was completed during that cohort week. | Not measurable. | `lesson_completions.completed_at` falls inside week N's date range. |
| **Week-4 retained** | An activated student was active during week 4. | Not measurable. | Derived from the above. |
| **Program completed** | All required modules and the capstone were completed by 7 days after the cohort end date. | Not measurable. | `lesson_completions` covers all assigned lessons + a capstone submission row, within the window. |
| **Capstone submitted** | A student submitted the week-6 capstone artifact (title, thesis, code, result, reflection). | No capstone artifact exists yet — the template points week 6 at the "Portfolio Optimization" lesson as a stand-in. | A `capstone_submissions` row. |
| **Leader reuse** | The leader says, at the end-of-pilot interview, they'll run it again. | Recorded manually in the interview log — never inferred from clicks. | Same — this stays a human record forever. |
| **Referral** | A leader introduces another leader who becomes a qualified contact. | Recorded manually in the CRM (`referral_from` column). | Same. |
| **Paid proof** | Money collected, or a dated, priced commitment from an authorized buyer. A "we'd probably pay" is not paid proof. | Stripe (money) or CRM `status = committed` with a signed/dated note (commitment). | Same. |

## Implementation notes (2026-09-22)

The scorecard computes these in `src/lib/cohorts/metrics.ts` (tested in `metrics.test.ts`) from `lesson_completions` (migration 0016). Choices the definitions above leave open:

- **Days** are calendar days in the cohort's timezone (`classes.timezone`), not UTC.
- **Activated** counts the first assigned lesson finished *by the end of the 7-day window*, including before it (e.g. a student who did lesson 1 the week before kickoff). While the window is still open, a student is "pending", not "not activated".
- **Break weeks** (`classes.skip_weeks`) aren't cohort weeks: activity during a break counts toward no week, and week 4 is the fourth *program* week.
- **Unknown dates:** completions recorded before timestamps existed (`completed_at` NULL) count toward lessons done, but never toward activation or weekly activity.
- **Program completed** currently means every assigned lesson by 7 days after the last week. The capstone joins the definition when capstone submissions ship (A5).
- **Needs help:** not activated after the window closes, or overdue work plus no completion or activity for 7+ days.

## Not yet measurable

**Capstone completion** can't be computed until capstone submissions ship (master plan A5). Activation, week-N-active, week-4 retention and program completion are measurable once migration 0016 is applied in production; before that, the scorecard says "not measurable" instead of estimating. Don't approximate these from the aggregate array with invented timestamps; report them as "not yet measurable" rather than a fabricated number.
