# Supabase Backend — Setup Guide

StrikeLab now has a real backend: **Supabase Auth** (email/password + Google)
and a Postgres database that syncs **lesson progress** and stores **user
profiles** across devices.

Until you complete the steps below, the app degrades gracefully — auth is
disabled and progress falls back to `localStorage` (the old behavior). Nothing
breaks in production while the keys are missing.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a name (e.g. `strikelab`), a strong database password, and a region
   close to your users.
3. Wait ~2 minutes for it to provision.

## 2. Run the database schema

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Click **Run**. This creates the `profiles` and `progress` tables, Row Level
   Security policies, and a trigger that auto-creates a profile on signup.

## 3. Grab your API keys

In the dashboard: **Settings → API**. Copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> The anon key is safe to expose in the browser — Row Level Security is what
> protects the data. You do **not** need the service-role key for this setup.

## 4. Add the keys locally

Edit `.env.local` (already created, git-ignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
```

Then `npm run dev` — you can now sign up, sign in, and your progress syncs.

## 5. Add the keys to Vercel (for production)

In your Vercel project: **Settings → Environment Variables**. Add the same two
variables for the **Production** (and Preview) environments, then redeploy.

> Heads up: don't paste keys through `vercel env add` via a piped value on
> PowerShell — it can corrupt them with a BOM. Use the Vercel dashboard UI, or
> type the value at the interactive prompt.

## 6. Configure Auth redirect URLs

In Supabase: **Authentication → URL Configuration**:

- **Site URL**: `https://strikelabco.vercel.app`
- **Redirect URLs**: add both
  - `https://strikelabco.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

### Email confirmation (optional)

By default Supabase emails a confirmation link on signup. The signup page
handles this ("Check your email"). To skip it for testing:
**Authentication → Providers → Email → disable "Confirm email."**

### Google login (optional)

The "Continue with Google" button appears automatically once Supabase is
configured. To make it work: **Authentication → Providers → Google**, enable
it, and add your Google OAuth client ID/secret (from Google Cloud Console).
If you don't set this up, just use email/password — everything else works.

---

## What's wired up

| Piece | File |
|-------|------|
| Browser/server/middleware clients | `src/lib/supabase/` |
| Auth context (`useAuth`) | `src/lib/auth/AuthProvider.tsx` |
| Session refresh | `src/middleware.ts` |
| OAuth/email callback | `src/app/auth/callback/route.ts` |
| Sign in / sign up | `src/app/sign-in`, `src/app/sign-up` |
| Progress sync (local ⇄ cloud) | `src/lib/useProgress.ts`, `src/lib/progress/sync.ts` |
| Progress API (server) | `src/app/api/progress/route.ts` |
| Schema + RLS + trigger | `supabase/migrations/0001_init.sql` |

Progress made while logged out is preserved and **merged up** to your account
on first sign-in — no completions are lost.
