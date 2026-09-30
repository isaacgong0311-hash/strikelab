# Pre-Pilot Security and Privacy Review (2026-09-29)

Work plan AG8 (master plan D11 follow-up). Scope: every surface a pilot student or leader touches:
- sign-up and sign-in, including the student/leader role and `?src=` cookies;
- invite links (`/join/[code]`) and joining;
- teacher setup and invite pages (`/teach/*`);
- the scorecard, roster and CSV;
- synced code;
- capstones: draft, submit, teacher view, share and revoke;
- the weekly challenge leaderboard;
- account deletion;
- what reaches third parties (Sentry, analytics).

Method: read each route and the RLS policies and security-definer functions behind it, and check each claim on the public pages (`/`, `/clubs`, `/privacy`) against what the code does. The PGlite tests (`*.db.test.ts`) already exercise every policy; new tests were added where a finding needed one.

## Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | **The challenge leaderboard exposed student names publicly.** Migration 0003 gave `challenge_completions` a `using (true)` select policy, so anyone with the public anon key could list every row: user ids plus the name each student typed at sign-up. `/challenges` showed those names to signed-out visitors. This contradicted the homepage, `/clubs` and the pilot packet ("no public profiles or leaderboards for students"). | **High** (minors' names, public, and a false public claim) | **Fixed.** Migration `0022`: owner-only reads, the copied names cleared, and a `challenge_leaderboard()` function returning rank, time, XP and "is this you" only. The route shows "You" or "Anonymous" and works, without names, even before 0022 is applied. Tests: `challengeLeaderboard.db.test.ts`, `challengeLeaderboard.test.ts`. **Apply 0022 in production (production-readiness P1).** |
| 2 | Signed-in students' **email** was sent to Sentry with every browser error report. | Low (a subprocessor received more than it needed) | **Fixed.** Only the account id is sent. The data map is updated. |
| 3 | The signed-out invite page (`/join/[code]`) looks up a class by code and shows its name, without a rate limit. | Low | **Accepted.** Codes are 6 characters from 34 symbols (about 1.5 billion values), a hit reveals only a class name, and joining still needs an account and is rate-limited per account. If abuse ever shows up in the logs, add a Vercel Firewall rate-limit rule on `/join/*`. A per-IP limiter in the database would need a new table for little gain. |
| 4 | `signup_role` (student or leader) lives in user metadata, which users can edit. | Info | **OK as is.** It only chooses the nav layout. Every teacher permission comes from `classes.teacher_id` in RLS and `requireTeacherOwnsClass`. **Rule: never use `signup_role` for authorization.** |
| 5 | Invite links use the request's host header (`src/lib/requestOrigin.ts`). | Info | **OK on Vercel**, which sets the host. The link is only shown to the class's own teacher. |
| 6 | Sign-up asks for "Full name", which becomes the name leaders see. | Info (minimization) | **Fixed (mega plan Q3):** the field is now "Your name", with the hint "What your club leader will see. A first name and last initial is enough." |

## Checked and fine

- **Capstone sharing:** tokens are random UUIDs minted in the database (`set_capstone_sharing`); clients can't write `share_token`, `submitted_at` or ids (column privileges revoked); `get_shared_capstone` returns the work with no name or id; turning sharing off makes the old link 404; and shared pages are `noindex`.
- **Teacher view of a capstone** goes through `open_capstone_as_teacher`, which checks class ownership and writes an access-log row the student can see.
- **Roster and scorecard:** served only after `requireTeacherOwnsClass`. They contain display name, lesson counts, completion times, last-active date and capstone status. No emails. The CSV is formula-safe.
- **Joining:** requires an account and is rate-limited per account; the membership row is inserted with the student's own session, so RLS stops anyone enrolling someone else.
- **Account deletion:** requires typing `DELETE`, is rate-limited, and uses the admin API. All student rows cascade (tested in `deletion.db.test.ts`).
- **Open redirects:** `next=` is sanitized through sign-up, sign-in and `/auth/callback` (fixed in #27).
- **Cookies set by the app:** `sl_src` and `sl_role`, one hour, `SameSite=Lax`, allow-listed values only for `sl_role`.
- **Funnel analytics:** event properties carry `?src=` tags and page names only, never names, emails or student ids.

## Follow-ups

- [ ] Founder: apply migration 0022 in production, then re-run `check-migrations.sql`.
- [ ] Re-run this review before the first paid contract (master plan E7) and whenever a migration adds a table holding student data.
