# Cohort Launch Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a teacher launch StrikeLab's fixed six-week Quant Foundations pilot from an existing class and see its scheduled assignments, while restoring a clean production baseline.

**Architecture:** Keep curriculum structure in a pure TypeScript domain module and send the generated schedule through one transactional Supabase RPC. Extend the existing class and assignment models rather than adding a general course-authoring system. The current client-rendered class page remains the interaction boundary; authorization stays in the existing session-bound route-handler pattern.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Postgres/RLS, Vitest, Recharts.

---

### Task 1: Restore the production-quality baseline

**Files:**
- Modify: `src/app/dashboard/class/[id]/ClassRosterClient.tsx`
- Modify: `src/app/api/classes/[id]/roster/route.ts`
- Modify: `src/components/GreekChart.tsx`
- Modify: `src/components/PayoffDiagram.tsx`
- Modify: `src/app/sandbox/SandboxClient.tsx`
- Modify: `src/app/for-schools/page.tsx`
- Modify: `src/app/roadmap/page.tsx`

- [ ] **Step 1: Make roster recency use the server response timestamp**

Return `generatedAt: new Date().toISOString()` from the roster route. Store it with the response and replace render-time `Date.now()` with `new Date(generatedAt).getTime()`.

- [ ] **Step 2: Give Recharts a valid minimum container size**

Add `minWidth={0}` and `minHeight={0}` to each `ResponsiveContainer` that currently renders during static generation.

- [ ] **Step 3: Make public copy match shipped functionality**

State that the teacher dashboard, roster, CSV export, and lesson assignments are live; keep SSO explicitly unavailable. Move assignment grading from the planned roadmap list to shipped work.

- [ ] **Step 4: Verify and commit**

Run `npm run lint`, `npm test`, and `npm run build`. Expected: lint and tests pass; build completes without the negative-size Recharts warning.

### Task 2: Define the fixed pilot curriculum and schedule

**Files:**
- Create: `src/lib/cohorts/template.ts`
- Test: `src/lib/cohorts/template.test.ts`

- [ ] **Step 1: Write failing schedule tests**

Cover the template ID, six ordered weeks, known lesson IDs, stable positions, and due dates calculated as the final day of each seven-day cohort week.

- [ ] **Step 2: Implement the template**

Export `QUANT_FOUNDATIONS_TEMPLATE`, `QUANT_FOUNDATIONS_TEMPLATE_ID`, `buildCohortSchedule(startsOn)`, and these week definitions:

```ts
[
  { week: 1, title: "Markets and risk", lessonIds: ["inv-1", "inv-2", "inv-5"] },
  { week: 2, title: "Options and payoffs", lessonIds: ["1", "2"] },
  { week: 3, title: "Pricing", lessonIds: ["3"] },
  { week: 4, title: "Risk sensitivities", lessonIds: ["4", "5", "6", "7"] },
  { week: 5, title: "Research discipline", lessonIds: ["q3"] },
  { week: 6, title: "Portfolio capstone", lessonIds: ["q4"] },
]
```

Reject an invalid `YYYY-MM-DD` start date and return rows shaped as `{ lessonId, weekNumber, position, dueOn }`.

- [ ] **Step 3: Verify and commit**

Run `npm test -- src/lib/cohorts/template.test.ts`. Expected: all template tests pass.

### Task 3: Add transactional cohort persistence

**Files:**
- Create: `supabase/migrations/0012_cohort_launch.sql`

- [ ] **Step 1: Extend classes and assignments**

Add nullable `template_id`, `starts_on`, and `timezone` columns to `classes`, plus nullable `week_number`, `position`, and `due_on` columns to `assignments`. Constrain week numbers to 1–6 and positions to positive integers.

- [ ] **Step 2: Add the launch RPC**

Create `launch_cohort(uuid, text, date, text, jsonb)` as a security-invoker PL/pgSQL function. It must verify `auth.uid()` owns the class, update cohort metadata, parse schedule rows with `jsonb_to_recordset`, and upsert assignments on `(class_id, lesson_id)` in one transaction. Grant execution only to `authenticated`.

- [ ] **Step 3: Add indexes and document rollback behavior**

Index assignments by `(class_id, week_number, position)` and note that re-launching intentionally updates the fixed schedule idempotently.

### Task 4: Expose cohort launch through the class API

**Files:**
- Create: `src/app/api/classes/[id]/launch/route.ts`
- Test: `src/app/api/classes/[id]/launch/route.test.ts`
- Modify: `src/lib/classes.ts`
- Modify: `src/app/api/classes/[id]/roster/route.ts`
- Modify: `src/app/api/classes/[id]/assignments/route.ts`

- [ ] **Step 1: Write failing route tests**

Cover unauthenticated access, non-owner 404, invalid start date, invalid timezone, successful RPC arguments, and database failure.

- [ ] **Step 2: Implement `POST /api/classes/[id]/launch`**

Validate `{ startsOn, timezone }`, verify ownership, call `buildCohortSchedule`, and invoke `launch_cohort` with the fixed template ID and schedule. Return the template metadata and generated assignments.

- [ ] **Step 3: Return schedule metadata everywhere it is consumed**

Extend owned-class and assignment response types with `templateId`, `startsOn`, `timezone`, `weekNumber`, `position`, and `dueOn`. Preserve `null` values for old manually created classes and assignments.

- [ ] **Step 4: Verify and commit**

Run the focused route and domain tests, then the full test suite.

### Task 5: Build the teacher launch experience

**Files:**
- Create: `src/app/dashboard/class/[id]/CohortLaunchPanel.tsx`
- Modify: `src/app/dashboard/class/[id]/ClassRosterClient.tsx`
- Modify: `src/app/dashboard/class/[id]/AssignmentsPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Render the cohort launch card**

For an unlaunched class, show the six-week outline, required start date, fixed `America/Chicago` default timezone, and a `Launch pilot cohort` button. Submit to the launch route and refresh the roster response.

- [ ] **Step 2: Render launched cohort status**

Show the start date, six-week duration, and template name. Group scheduled assignments by week and display each due date. Continue showing old manual assignments in an `Other assignments` group.

- [ ] **Step 3: Preserve progressive enhancement and accessibility**

Keep the outline visible before JavaScript interaction, use native date/select controls and semantic headings, and show request errors inline without removing the form.

- [ ] **Step 4: Final verification**

Run `npm run lint`, `npm test`, and `npm run build`. Manually verify the unlaunched, launching, launched, old-class, empty-roster, and unauthorized states with local test accounts when Supabase credentials are available.

### Follow-on plans after this slice

- Timestamped lesson completions and a cohort-first student dashboard.
- Synced exercise work and the private-by-default capstone artifact.
- Activation/retention scorecards, pilot CSVs, and founder metrics.
- School privacy/operations readiness and paid-pilot conversion.
