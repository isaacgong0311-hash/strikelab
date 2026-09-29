# StrikeLab Data Map

What StrikeLab stores about students, who can see it, where it goes, and how long it's kept. It's written for a club sponsor, principal or district IT reviewer, and it goes in the pilot approval packet (`docs/gtm/outreach-kit.md` §5). It's a plain description of how the product works, not a legal document.

**Last checked against the code:** 2026-09-29, through migration `0022`. Update this page in the same PR as any migration that adds a table or column holding student data.

## Principles

- **13 and up only.** No accounts for under-13s.
- **Minimal:** an email address, an optional display name, and learning activity. No birth date, address, phone number, school ID, photos, grades or location.
- **Private by default.** Nothing about a student is public unless they create a share link for their own capstone, and even that shows no name.
- **No ads, no selling data, no tracking across sites.**
- **Students can delete everything themselves** (Settings → Delete my account), immediately.

## What's stored, and who can read it

Enforced in the database with row-level security (RLS): each rule below is a database policy, and tests run every policy on every change (`src/lib/**/*.db.test.ts`).

| Data | Where (table) | Personal? | The student | Their club leader | Anyone else |
|---|---|---|---|---|---|
| Email, password hash (or Google sign-in) | Supabase Auth | Yes | Yes | **No** | No |
| Display name (what they typed at sign-up; the form suggests a first name and last initial) | `profiles` | Yes | Yes | Yes (roster, scorecard, kickoff view) | No |
| How they found StrikeLab (`?src=` tag) | `profiles.signup_source` | No | Yes | No | No |
| Lessons completed, XP, streak, timezone | `progress` | Activity | Yes | Number of lessons and tracks completed, and last-active date (not XP or streak) | No |
| When each lesson was completed (server clock) | `lesson_completions` | Activity | Yes | Yes, for class members | No |
| Short-session results (accuracy, time) | `session_completions` | Activity | Yes | Only whether they finished the first short lesson (kickoff live view); never accuracy or time | No |
| Exercise code | `lesson_submissions` | Student work | Yes | Yes, for class members | No |
| Capstone (title, thesis, code, results, reflection) | `capstone_submissions` | Student work | Yes | Opens it explicitly; **each view is logged and shown to the student** | Only via a share link the student creates: no name, and it stops working when they turn sharing off |
| Log of teacher views of a capstone | `capstone_access_log` | Activity | Yes | No | No |
| Class membership, and when they joined | `class_members` | Activity | Yes | Yes | No |
| Weekly challenge times | `challenge_completions` | Activity | Yes | No | The leaderboard shows times only, never names (since `0022`) |
| Paper-trading sandbox balance and trades | `sandbox_*` | Activity | Yes | No | No |
| AI tutor usage counts (not the messages) | `ai_usage`, `hint_usage` | Activity | Yes | No | No |
| Certificates (name, track, date) | `certificates` | Yes | Yes | No | Only someone the student gives the certificate link to |
| Subscription status (if a paid plan) | `subscriptions` | No card data | Yes | No | No |
| Request counters for abuse limits | `rate_limits` | No | No | No | No |
| Optional Discord webhook URL | `profiles.discord_webhook_url` | No | Yes | No | No |

**StrikeLab staff** (the founder) can read the database to operate and support the service, and does so only for support, debugging and aggregate pilot metrics. Pilot reports use aggregate numbers only.

## Where data goes (subprocessors)

| Vendor | What for | What it receives |
|---|---|---|
| Supabase | Database and sign-in | Everything in the table above |
| Vercel | Hosting; cookie-free, aggregate page analytics | Web requests (IP address, pages visited), no account data in analytics |
| Sentry | Error reports | The error, the page, and the account id of a signed-in user (no email or name) |
| Groq | AI tutor and hints (only when a student uses them) | The question or code the student sends, without their name or email |
| Google | "Continue with Google" (only if used) | The sign-in itself |
| Stripe | Payments (never used by students in a pilot) | The payer's checkout details, handled entirely by Stripe |
| Web3Forms | Newsletter sign-up (only if used) | The email address entered |
| jsDelivr | A backup source for the in-browser Python runtime, used only if strikelab.dev's own copy fails to load | A normal file download (IP address); no account data |
| Discord | Only if a student connects their own server's webhook | Lesson and achievement names posted to that server |

Resend (sign-up emails) will join this list if production-readiness P2 chooses custom SMTP.

## Cookies and browser storage

- **Cookies:** Supabase's sign-in session cookies, plus two short-lived (one-hour) cookies that carry the `?src=` tag and the student/leader choice through Google sign-in.
- **Browser storage:** progress and code are also kept in `localStorage` so lessons work offline and without an account. The `?src=` tag is kept in `sessionStorage` for the visit.
- No advertising or cross-site tracking cookies.

## Retention and deletion

*Proposed defaults. The founder confirms them (master plan E2) and states them in each pilot agreement.*

- **Account deletion is immediate and self-serve.** It removes the account and every row above (they cascade on delete), including capstones, share links and class memberships.
- **Requests** (from a student, parent or school) to see or delete data: handled within 30 days, usually the same week. Contact: the address on strikelab.dev/privacy.
- **Pilot data** is kept for 12 months after the cohort ends, for the pilot report and to let students keep their work, unless the school asks for earlier deletion.
- **Backups:** Supabase's own backup window. Deleted data drops out of backups when they expire.

## Security basics

- Every table has row-level security on, and the policies are tested automatically on every change.
- Joining a class requires the class's invite code and an account. Joining, class creation, capstone saves and sharing, and account deletion are rate-limited per account.
- Teachers can only see students who joined *their* class, and only the fields marked above.
- All traffic is HTTPS. Secrets live in the hosting provider's environment settings, never in the code.
