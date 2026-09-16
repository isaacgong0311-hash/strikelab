-- Assignments: lets a teacher assign specific lessons to a class and track
-- per-student completion against them (not just aggregate track/lesson
-- counts — see supabase/migrations/0010_classes.sql). MVP slice of the
-- Q4 2026 "Assignment grading" roadmap item (src/app/roadmap/page.tsx).
--
-- One row per (class, lesson) — a "3-lesson assignment" is 3 rows created
-- in one teacher action, not a separate parent/junction table. lesson_id is
-- free text, not a foreign key: lessons live in src/lib/tracks.ts as static
-- data, not a DB table (same convention as progress.completed and
-- certificates.track_id).
--
-- Completion is computed on read as a pure intersection of a student's
-- progress.completed lesson-id array against an assignment's lesson_id
-- (see isAssignmentComplete in src/lib/classes.ts) — no completion
-- timestamp is stored here or anywhere else yet. Due dates and on-time/late
-- grading are a deliberate fast-follow, not v1: they need a per-lesson
-- completion timestamp that progress.completed doesn't have today, and
-- adding one is a breaking-ish change to ProgressPayload/mergeProgress and
-- every reader of `completed` (roster, certificates, achievements,
-- useProgress) — not something to bolt on as a side effect of this table.
create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  lesson_id   text not null,
  created_at  timestamptz not null default now(),
  unique (class_id, lesson_id)
);

alter table public.assignments enable row level security;

-- Teachers fully manage assignments for classes they own. Assignments
-- doesn't carry teacher_id directly, so this joins through classes the
-- same way "Teachers view own class roster" does on class_members.
drop policy if exists "Teachers manage own class assignments" on public.assignments;
create policy "Teachers manage own class assignments"
  on public.assignments for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = assignments.class_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = assignments.class_id and c.teacher_id = auth.uid()
    )
  );

-- A student who has joined the class can see which lessons are assigned.
-- No v1 UI reads this as a student yet, but it costs nothing now and keeps
-- the door open for a student-facing "my assignments" view later without a
-- second migration.
drop policy if exists "Members can view class assignments" on public.assignments;
create policy "Members can view class assignments"
  on public.assignments for select
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = assignments.class_id and cm.student_id = auth.uid()
    )
  );
