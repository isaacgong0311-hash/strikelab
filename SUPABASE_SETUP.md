# Supabase Backend — Setup Guide

StrikeLab's backend is **Supabase**: Auth (email/password and Google), and a Postgres database for progress sync, classes and cohorts, the sandbox, certificates and subscriptions.

Until you finish this guide the app degrades gracefully: auth is off and progress stays in `localStorage`. Nothing breaks while the keys are missing.

This takes about 20 minutes. You need a [Supabase](https://supabase.com) account and Node (for `npx`).

---

## 1. Create the project

1. [supabase.com](https://supabase.com) → **New project**.
2. Name it `strikelab`, pick a strong database password (save it; the CLI asks for it once) and a region close to your users.
3. Wait about 2 minutes for it to provision.
4. Note the **project ref**: the `abcdefghijklmnop` in `https://abcdefghijklmnop.supabase.co`.

## 2. Apply the schema (22 migrations)

From the repo root:

```bash
npx supabase login                                  # opens a browser
npx supabase link --project-ref abcdefghijklmnop    # asks for the database password
npx supabase db push                                # applies supabase/migrations/ in order
```

`db push` runs `0001` to `0022` in order and records which have run, so it is safe to run again after pulling new migrations. Every migration is also written to be safe to re-run by hand.

<details>
<summary>No CLI? Use the SQL editor instead</summary>

In the dashboard, **SQL Editor → New query**. Paste and run each file in `supabase/migrations/` in number order, `0001_init.sql` first. If you are fixing a project where only some ran, run `0015_fix_class_rls_recursion.sql` before the others that are missing.

</details>

Then confirm they all ran. In the SQL editor, run [`scripts/metrics/check-migrations.sql`](scripts/metrics/check-migrations.sql). It lists all 22 as `applied` or `MISSING`. `0007_sandbox_atomic_trades.sql` is required: the sandbox errors on every trade without it.

What the migrations create, by feature:

| Migrations | What |
|---|---|
| `0001` | `profiles`, `progress`, Row Level Security, a trigger that makes a profile on signup |
| `0002`, `0020` | `subscriptions` (Stripe state, written only by the webhook), `hint_usage` |
| `0003`, `0022` | Weekly challenge completions and the private leaderboard |
| `0004`, `0007` | Paper-trading sandbox; atomic open/close RPCs |
| `0005` | Certificates of completion |
| `0006`, `0008`, `0021` | Discord webhook, separate AI quotas, rate limits |
| `0009`, `0013` | Signup source, learner timezone |
| `0010`, `0011`, `0012`, `0015`, `0017` | Classes, rosters, join codes, assignments, the six-week cohort, skipped weeks |
| `0014`, `0016`, `0018`, `0019` | Session, lesson, lesson-submission and capstone records |

## 3. Get your API keys

Dashboard → **Settings → API**:

| Value | Env var | Exposure |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public. Row Level Security is what protects the data |
| `service_role` / secret key | `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Bypasses Row Level Security. Used by the Stripe webhook (`src/app/api/stripe/webhook/route.ts`) because that request has no user session |

Never put the service-role key in client code or a `NEXT_PUBLIC_*` variable, and never paste it into a chat or an issue.

## 4. Add the keys locally and check them

Create `.env.local` (git-ignored; `.env.example` lists every variable):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key
```

Then:

```bash
npm run supabase:check
```

It never prints a key. It checks that each is the right kind (it catches a service-role key pasted into the public variable, and swapped keys), that the project answers, how auth is configured, and that every table the migrations create exists. It does not check Row Level Security (the unit tests replay the migrations to cover that) or the redirect URLs (step 6; the smoke test below covers those).

## 5. Run the app

`npm run dev`, then sign up. Progress made while signed out is merged into your account on first sign-in, so no completions are lost.

## 6. Auth settings (dashboard)

**Authentication → URL Configuration**

- **Site URL**: `https://strikelab.dev`
- **Redirect URLs**: add `https://strikelab.dev/**` and `http://localhost:3000/**`. The app always calls `/auth/callback` with a `?next=` query, so use patterns. Add your Vercel preview pattern too if you test sign-up on previews.

**Email confirmation.** Supabase emails a confirmation link on signup and the sign-up page handles it ("Check your email"). To skip it while testing: **Authentication → Providers → Email → turn off "Confirm email"**, and turn it back on before real students sign up.

**Custom SMTP.** Supabase's built-in sender is for development: it is tightly rate-limited, and a classroom signing up together will hit that limit. Set up custom SMTP before a kickoff; the steps are in [`docs/gtm/production-readiness-checklist.md`](docs/gtm/production-readiness-checklist.md).

**Google sign-in (optional).** **Authentication → Providers → Google**: enable it and add an OAuth client ID and secret from Google Cloud Console. The "Continue with Google" button appears once it is on. Email/password works without it.

> Don't use `supabase config push` for these settings. It overwrites the hosted project's auth settings with `supabase/config.toml`, which describes the *local* stack, and would switch off a Google provider you enabled here.

## 7. Add the keys to Vercel

Vercel project → **Settings → Environment Variables**: add the same three variables for **Production** and **Preview**, then redeploy. For Preview, point them at a separate staging project (see the checklist) so preview deploys never touch real students' data.

Don't pipe values through `vercel env add` on PowerShell: it can corrupt them with a BOM. Use the dashboard, or type the value at the prompt.

## 8. Smoke test

1. Sign up at `/sign-up` with a real address, and follow the confirmation email. You should land on your dashboard. If the link lands on the home page instead, the redirect allow-list rejected it: fix step 6.
2. Finish a lesson. In **Table Editor → `progress`** your row's `completed` and `xp` should update.
3. Run `npm run supabase:check` against the production values once more, with them exported in your shell.

## Optional: run the whole stack locally

With Docker installed, `npx supabase start` runs Postgres, Auth and the API on your machine using `supabase/config.toml` (site URL `http://localhost:3000`, 8-character passwords to match the sign-up form), applies every migration, and prints local keys to put in `.env.local`. Confirmation emails go to the local inbox it prints. Use it for working on auth without touching a hosted project.

---

## What's wired up

| Piece | File |
|---|---|
| Browser, server, proxy and admin clients | `src/lib/supabase/` |
| "Who is the signed-in user" helper | `src/lib/supabase/requireUser.ts` |
| Auth context (`useAuth`) | `src/lib/auth/AuthProvider.tsx` |
| Session refresh | `src/proxy.ts` |
| OAuth and email callback | `src/app/auth/callback/route.ts` |
| Sign in, sign up, password reset | `src/app/sign-in`, `src/app/sign-up`, `src/app/forgot-password`, `src/app/reset-password` |
| Progress sync (local and cloud) | `src/lib/useProgress.ts`, `src/lib/progress/sync.ts`, `src/app/api/progress/route.ts` |
| Subscription state (Stripe and Supabase) | `src/app/api/stripe/webhook/route.ts`, `subscriptions` table |
| Certificates | `src/app/api/certificates/issue/route.ts`, `src/app/certificate/[id]/` |
| Schema, Row Level Security, triggers | `supabase/migrations/` |
| Migration tests (replayed in-process, no hosted project) | `supabase/testing/db.ts` |
| Setup check | `scripts/supabase/check.mjs` |
