-- Classes: lets a teacher roster students and see aggregate progress.
-- MVP slice of the "Teacher dashboard (School plan)" roadmap item
-- (Q4 2026, see src/app/roadmap/page.tsx) — roster + progress only, no
-- assignments/grading yet. Not gated behind a plan check yet since there's
-- no School-plan Stripe price to check against (see src/lib/stripe.ts);
-- add that gate once one exists, matching the "don't gate what isn't
-- actually sold yet" pattern from earlier oversell-copy fixes.

create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  join_code   text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id    uuid not null references public.classes (id) on delete cascade,
  student_id  uuid not null references auth.users (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (class_id, student_id)
);

alter table public.classes enable row level security;
alter table public.class_members enable row level security;

-- Teachers fully manage classes they created.
drop policy if exists "Teachers manage own classes" on public.classes;
create policy "Teachers manage own classes"
  on public.classes for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

-- A student who has joined a class can read its name (e.g. "You're in:
-- Ms. Lee's 3rd period"). Does NOT expose join_code to other members —
-- select only, and join_code is never rendered client-side for non-owners.
drop policy if exists "Members can view their class" on public.classes;
create policy "Members can view their class"
  on public.classes for select
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = classes.id and cm.student_id = auth.uid()
    )
  );

-- Teachers can see the roster of their own class.
drop policy if exists "Teachers view own class roster" on public.class_members;
create policy "Teachers view own class roster"
  on public.class_members for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_members.class_id and c.teacher_id = auth.uid()
    )
  );

-- A student can see and create their own membership row (joining is
-- self-service via a join code, resolved to a class_id server-side —
-- see src/app/api/classes/join/route.ts).
drop policy if exists "Students view own membership" on public.class_members;
create policy "Students view own membership"
  on public.class_members for select
  using (auth.uid() = student_id);

drop policy if exists "Students join via own row" on public.class_members;
create policy "Students join via own row"
  on public.class_members for insert
  with check (auth.uid() = student_id);
