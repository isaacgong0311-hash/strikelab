-- Fix: the class policies from 0010/0011 query each other, which Postgres
-- rejects with "infinite recursion detected in policy" on EVERY signed-in
-- read of classes, class_members or assignments:
--   classes."Members can view their class"      -> selects class_members
--   class_members."Teachers view own class roster" -> selects classes -> ...
-- That breaks session-bound reads such as GET /api/classes, /api/classes/joined
-- and requireTeacherOwnsClass (caught by supabase/testing, PGlite-backed).
--
-- The membership checks move into SECURITY DEFINER helpers. They run as the
-- table owner, so their lookups skip RLS and can't recurse, and they only
-- ever answer about the caller (auth.uid()), so they expose nothing new.

create or replace function public.is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.teacher_id = auth.uid()
  );
$$;

create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members cm
    where cm.class_id = p_class_id and cm.student_id = auth.uid()
  );
$$;

-- True when the caller teaches a class that p_student_id belongs to.
create or replace function public.teaches_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.student_id = p_student_id and c.teacher_id = auth.uid()
  );
$$;

revoke all on function public.is_class_teacher(uuid) from public;
revoke all on function public.is_class_member(uuid) from public;
revoke all on function public.teaches_student(uuid) from public;
grant execute on function public.is_class_teacher(uuid) to authenticated;
grant execute on function public.is_class_member(uuid) to authenticated;
grant execute on function public.teaches_student(uuid) to authenticated;

drop policy if exists "Members can view their class" on public.classes;
create policy "Members can view their class"
  on public.classes for select
  using (public.is_class_member(id));

drop policy if exists "Teachers view own class roster" on public.class_members;
create policy "Teachers view own class roster"
  on public.class_members for select
  using (public.is_class_teacher(class_id));

drop policy if exists "Teachers manage own class assignments" on public.assignments;
create policy "Teachers manage own class assignments"
  on public.assignments for all
  using (public.is_class_teacher(class_id))
  with check (public.is_class_teacher(class_id));

drop policy if exists "Members can view class assignments" on public.assignments;
create policy "Members can view class assignments"
  on public.assignments for select
  using (public.is_class_member(class_id));
