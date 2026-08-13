-- Certificates of completion, issued when a user finishes every lesson in a
-- track. Roadmap item: "Certificates of completion — shareable on LinkedIn,
-- verifiable" (Q4 2026, see src/app/roadmap/page.tsx).
--
-- Deliberately NO RLS select/insert policies for anon/authenticated roles —
-- RLS defaults to deny-all once enabled, so the table is unreachable from the
-- browser's Supabase client entirely. Every read and write goes through the
-- service-role admin client server-side:
--   - src/app/api/certificates/issue/route.ts verifies track completion
--     against the caller's OWN progress row (via their session-bound client)
--     before writing.
--   - src/lib/certificates.ts's getCertificateById() is the only reader, used
--     by the public /certificate/[id] page and its opengraph-image route —
--     both return only id/track_id/display_name/issued_at, never user_id.
-- This makes an individual certificate URL (an unguessable uuid) fully
-- public and shareable by design, while keeping the table itself un-listable
-- (no "dump every certificate ever issued" vector via the anon key).
create table if not exists public.certificates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  track_id     text not null,
  display_name text not null,
  issued_at    timestamptz not null default now(),
  unique (user_id, track_id)
);

alter table public.certificates enable row level security;
