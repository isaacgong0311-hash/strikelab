# Cohort Student Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make cohort metrics real instead of aspirational. Right now `progress.completed` is one aggregate array with no timestamps — activation, week-N-active, and retention are not measurable at all (see `docs/gtm/metric-glossary.md`). This plan adds normalized completion records, a student cohort home, a private-by-default capstone, and a server-derived instructor scorecard, on top of the cohort-launch foundation already shipped (`docs/superpowers/plans/2026-09-13-cohort-launch-foundation.md`).

**Precondition:** the cohort-launch-foundation plan's five tasks (schedule template, `launch_cohort` RPC, launch route, teacher launch panel) are implemented and committed. Do not start Task 1 below on top of uncommitted launch-flow work.

**Architecture:** Keep the existing aggregate `progress.completed` array as-is for backward compatibility and the non-cohort dashboard. Add a parallel, normalized `lesson_completions` table that cohort metrics read from exclusively — never derive cohort metrics from the aggregate array. Metrics are computed server-side in one service module; no client ever supplies a completion count or a percentage.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Postgres/RLS, Vitest.

---

### Task 1: Normalized lesson-completion timestamps

**Files:**
- Create: `supabase/migrations/0013_lesson_completions.sql`
- Modify: `src/lib/progress/sync.ts`
- Modify: `src/app/api/progress/route.ts`
- Test: `src/lib/progress/sync.test.ts`

- [ ] **Step 1: Write failing tests** for a `recordLessonCompletion(userId, lessonId, completedAt?)` helper: inserts once per `(user_id, lesson_id)`, is idempotent on retry (no duplicate row, no error), and never backdates an already-recorded completion.
- [ ] **Step 2: Add the migration.** `lesson_completions(user_id uuid, lesson_id text, completed_at timestamptz not null default now(), primary key (user_id, lesson_id))`. RLS: a user reads their own rows; an authorized instructor reads rows for students in their own class (join through `class_members` + `classes.teacher_id`, mirroring the existing roster policy).
- [ ] **Step 3: Wire the write path.** When `POST /api/progress` adds a lesson to `completed` that wasn't there before (diff against the existing row, not the incoming payload), insert a `lesson_completions` row. Keep writing the aggregate array unchanged — this is additive, not a replacement.
- [ ] **Step 4: Verify and commit.** Run the focused test file, then the full suite.

### Task 2: Synced exercise submissions

**Files:**
- Create: `supabase/migrations/0014_lesson_submissions.sql`
- Create: `src/lib/submissions/sync.ts`
- Create: `src/app/api/submissions/[lessonId]/route.ts`
- Test: `src/lib/submissions/sync.test.ts`, `src/app/api/submissions/[lessonId]/route.test.ts`
- Modify: whichever exercise editor component currently keeps code only in local state (start from `src/components/MiniEditor.tsx` and `src/components/PracticeProblem.tsx`)

- [ ] **Step 1: Write failing tests** for save (`code`, `updated_at`, optional `last_passed_at`) and load, scoped to `(user_id, lesson_id)`.
- [ ] **Step 2: Add the migration.** `lesson_submissions(user_id uuid, lesson_id text, code text not null, updated_at timestamptz not null default now(), last_passed_at timestamptz, primary key (user_id, lesson_id))`. Same RLS shape as Task 1 — student owns their row, authorized instructor can read.
- [ ] **Step 3: Add `GET`/`PUT` `/api/submissions/[lessonId]`.** Debounce writes client-side (a few seconds after the last keystroke, not on every keystroke) — this is a save path, not a chat log.
- [ ] **Step 4: Wire the editor.** Load saved code on mount if present; fall back to the lesson's starter code otherwise. Never silently drop unsaved local edits if the network call fails — show a small inline "not saved" state instead.
- [ ] **Step 5: Verify and commit.**

### Task 3: Student cohort home

**Files:**
- Create: `src/app/cohort/[classId]/page.tsx`
- Create: `src/app/cohort/[classId]/CohortHomeClient.tsx`
- Modify: `src/lib/classes.ts` (a `getStudentCohortView` that returns current week, due date, and next action for one student)
- Test: `src/lib/classes.test.ts` additions

- [ ] **Step 1: Write failing tests** for `getStudentCohortView`: given a cohort's `starts_on` and today's date, returns the correct current week number, that week's assignments, the earliest incomplete one as "next action," and the days remaining until its due date.
- [ ] **Step 2: Implement the view function**, reading `assignments.week_number`/`position`/`due_on` (already added by the launch-foundation migration) joined against the student's `lesson_completions`.
- [ ] **Step 3: Build the page.** A signed-in student who is a member of a launched cohort class lands here (link it from wherever they currently land post-join) instead of the generic dashboard. Show: current week title, this week's lessons with a completed/not-completed mark, the due date, and one clear "next action" link. The rest of the public curriculum stays reachable from normal nav — this page doesn't wall it off.
- [ ] **Step 4: Progressive enhancement.** Server-render the current-week content; don't hide it behind a client-only fetch spinner.
- [ ] **Step 5: Verify and commit.**

### Task 4: Instructor outcome scorecard + CSV export

**Files:**
- Create: `src/lib/cohorts/metrics.ts`
- Test: `src/lib/cohorts/metrics.test.ts`
- Modify: `src/app/api/classes/[id]/roster/route.ts`
- Modify: `src/app/dashboard/class/[id]/ClassRosterClient.tsx`

- [ ] **Step 1: Write failing tests** for a pure `computeCohortMetrics(cohort, assignments, completions)` function implementing the exact definitions in `docs/gtm/metric-glossary.md`: enrolled, activated, week-N-active, week-4-retained, program-completed. Cover the boundary cases (a student who joined after cohort start, a student active in week 2 but not week 4).
- [ ] **Step 2: Implement it server-side only.** The roster route calls this and returns the aggregate counts; the client never recomputes a percentage from raw rows it wasn't given for that purpose.
- [ ] **Step 3: Render the scorecard** above the existing roster table: enrolled, activated %, week-4-retained %, capstone submissions, and a "students needing help" list (assigned work overdue with no recent activity).
- [ ] **Step 4: Add "Export cohort CSV"** alongside the existing roster export, including the new per-student cohort columns (activated, week-4-retained, capstone status) — don't just duplicate the existing roster CSV.
- [ ] **Step 5: Verify and commit.**

### Task 5: Private-by-default capstone

**Files:**
- Create: `supabase/migrations/0015_capstone_submissions.sql`
- Create: `src/app/api/capstone/route.ts`
- Create: `src/app/capstone/[token]/page.tsx` (unlisted share view)
- Test: `src/app/api/capstone/route.test.ts`

- [ ] **Step 1: Write failing tests** for submit (title, thesis, code, result summary, reflection), for default-private visibility, for generating a share token only on explicit opt-in, and for revoking it (the token stops resolving immediately).
- [ ] **Step 2: Add the migration.** `capstone_submissions(user_id uuid, class_id uuid, title text, thesis text, code text, result_summary text, reflection text, is_public boolean not null default false, share_token uuid, submitted_at timestamptz not null default now())`. RLS: owner + authorized instructor only; the public share page reads through a `security definer` function keyed on `share_token` and `is_public = true`, nothing else.
- [ ] **Step 3: Build the submission form and the instructor view** (open a student's capstone from the scorecard when educationally necessary — log that this is a manual, purposeful action, not ambient access).
- [ ] **Step 4: Build the unlisted share page and the revoke control**, and confirm revoking actually 404s the old link rather than just hiding a "make public" toggle.
- [ ] **Step 5: Verify and commit.**

### Task 6: Coverage and full rehearsal

**Files:**
- Test: end-to-end teacher→student cohort journey (extend whatever integration test harness Tasks 1–5 of the launch-foundation plan already established)

- [ ] **Step 1:** Automated test covering: teacher launches cohort → student joins → completes week-1 lessons → activation recorded → reaches week 4 → capstone submitted → teacher scorecard reflects all of it → CSV export includes it.
- [ ] **Step 2:** Manually rehearse the same journey with two real test accounts (teacher + student) against a real (non-prod) Supabase project before onboarding the first real cohort.
- [ ] **Step 3:** Run `npm run lint`, `npm test`, and `npm run build` one final time; confirm no stale references to the aggregate `progress.completed` array snuck into any cohort-metric code path.

---

### Explicitly out of scope for this plan

Real-time market data, mobile apps, district/SSO integrations, a talent marketplace, and generalized course authoring — unchanged from `docs/superpowers/specs/2026-09-13-strikelab-yc-company-design.md` §6. This plan only makes the existing pilot promises measurable.
