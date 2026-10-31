# Class workspace and student work view

**Date:** 2026-10-27 · **Status:** shipped in `feat/class-workspace`

## Why

StrikeLab's paid product is the leader's side: a club leader or teacher runs the six-week lab and needs to know who is keeping up and what they are actually able to do. Before this change the class page was nine panels stacked in one column (invite, launch, scorecard, season board, toolkit, AI switch, assign, roster, assignments), and a leader could see counts but never the work. The database already allowed it: migration 0018 lets a leader read the exercise code of students in their classes, and the privacy page tells students their teacher "sees … your exercise code". No screen used it.

## What

1. **Workspace with four sections** on `/dashboard/class/[id]`, picked by `?tab=` so each has a link:
   - **Overview:** launch call-to-action until the cohort is launched, the invite while nobody has joined, then the scorecard (names link to students) and the season board.
   - **Students:** one table of everyone, those who need a nudge first, with assigned done, overdue, lifetime lessons, last active and status. Every name opens the student's page. The tab shows a badge with the number who need a nudge.
   - **Plan:** schedule and break weeks, this week's meeting plan and messages, assigning lessons, and per-assignment status.
   - **Settings:** invite link and printable kickoff, AI tutor switch, roster export.
2. **Student work page** `/dashboard/class/[id]/student/[studentId]`: needs-a-nudge or next-up callout, four stats (assigned finished, overdue, Python exercises passing, capstone), activity by program week, then every assigned lesson by week with status, due date, finish date and the student's latest code (expandable, read-only), plus lessons they did outside the assignments.
3. **The same page in the demo** at `/demo/student/[id]`, linked from the demo scorecard, using the demo club and StrikeLab's reference solutions, labeled as sample data. Prospects can see the leader's most useful view without signing up.

## Rules it keeps

- Ownership first: `requireTeacherOwnsClass` on the leader's session, then membership of that student in that class (a leader with two classes can't open a student through the wrong class).
- Completions and code are read on the leader's session, so the RLS policies from migrations 0016 and 0018 enforce access too; the admin client reads only the membership row, name and schedule, as the roster already does.
- A failed read is an error page, never an empty student. If saved code can't be read (0018 not applied), completions still show with a note.
- Untouched starter code is neither shown nor counted as an attempt.
- Code views are not logged, unlike capstone views, because students are told up front that their leader sees exercise code; capstones are private by default and opened deliberately. Revisit if a school asks for an access log.
- No migration.

## Logic

`src/lib/teach/studentWork.ts` (pure, tested) decides each lesson's state: `passed` (tests passed once, or a coding lesson completed before code sync existed), `completed` (investing lesson finished), `attempted` (changed code, not passing) or `not-started`; overdue means assigned, unfinished, due before today in the cohort's timezone. `loadStudentWork.ts` does the reads. `StudentWorkView.tsx` only formats, and is shared by the real page and the demo.

## Next candidates

- Run a student's saved code against the lesson tests from the leader's page (Pyodide is already in the browser).
- Leader comments on a lesson's code, visible to the student.
- Sort and filter the Students table; bulk "nudge" message to everyone overdue.
