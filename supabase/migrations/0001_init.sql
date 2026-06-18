-- StrikeLab initial schema: profiles + progress, with Row Level Security.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles viewable by owner" on public.profiles;
create policy "Profiles viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── Progress ────────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  completed        jsonb       not null default '[]'::jsonb,
  xp               integer     not null default 0,
  streak           integer     not null default 0,
  last_activity_date date,
  activity_by_date jsonb       not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "Progress viewable by owner" on public.progress;
create policy "Progress viewable by owner"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own progress" on public.progress;
create policy "Users insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.progress;
create policy "Users update own progress"
  on public.progress for update
  using (auth.uid() = user_id);

-- ─── Auto-create a profile row when a user signs up ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
