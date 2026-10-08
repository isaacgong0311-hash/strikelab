# Kickoff Kit

Everything for the week before a cohort starts and for the first meeting itself. Activation (a student finishing the first lesson within 7 days) is the first number the pilot is judged on, and most of it is won or lost in the room at kickoff (master plan G1 T-0). This kit exists so it's won.

Sections:
1. IT allowlist (send to the school)
2. Device and network test (T-7, at the school)
3. Kickoff-day runbook (T-0)
4. Parent and guardian note
5. Incident runbook

---

## 1. IT allowlist

Send this to the school's IT contact as soon as a pilot has a date. Fill in `[project-ref]` from `NEXT_PUBLIC_SUPABASE_URL` in Vercel (the part before `.supabase.co`). The list was captured on 2026-09-29 by loading the invite, session, lesson (with Python running) and cohort pages and recording every host the browser contacted. **Re-checked 2026-10-08** on a production build with `node scripts/audit/network-hosts.mjs <url>` (the invite, session, lesson with Python running, cohort, demo, trust and sign-in pages): the browser contacted only `strikelab.dev` itself, so no new third-party host has appeared since the capture, and the Python runtime came from `strikelab.dev/pyodide/`, never from jsdelivr. Supabase, Google and Sentry only appear with the production keys or a Google sign-in, so that run could not exercise them. Re-check it if a new third-party service is added. School web filters sometimes block the service that delivers the in-browser Python, which would break lessons from week 3 on.

> **Subject:** Websites to allow for StrikeLab (club pilot starting [date])
>
> Hi [name], [club] will use StrikeLab, a free browser-based learning site, starting [date]. Could you confirm students can reach these on the school network and devices? Nothing needs installing.
>
> | Website | Why | Required? |
> |---|---|---|
> | `strikelab.dev` | The site itself (including its built-in page analytics) | Yes |
> | `[project-ref].supabase.co` | Sign-in and saving students' progress | Yes |
> | `cdn.jsdelivr.net` | A backup copy of the in-browser Python runtime, used only if strikelab.dev's own copy fails | Optional |
> | `accounts.google.com` | Only if students use "Continue with Google" | Optional |
> | `*.ingest.sentry.io` | Anonymous error reports that help us fix bugs | Optional: blocking it breaks nothing |
>
> Everything is HTTPS on port 443. Privacy details: strikelab.dev/privacy. Happy to answer any questions.

## 2. Device and network test (T-7)

Do this **at the school, on the school network, on the kind of device students will use** (usually a school Chromebook). Home Wi-Fi proves nothing. Allow 30 minutes and bring the leader's invite link.

| # | Step | Pass | If it fails |
|---|---|---|---|
| 1 | Open the invite link (type it, and scan the QR card with a phone) | The "Join [class]" page loads | The filter blocks `strikelab.dev`: send the allowlist |
| 2 | Sign up as a test student with the method chosen in production-readiness P2/P3 | The account works; if email confirmation is on, the email arrives within 1 minute | Email: check spam and P2. Google: "this app is blocked" means the district restricts third-party apps, so use email |
| 3 | Join, and land on the cohort home | "This week" shows week 1 and one Start button | Screenshot it and send it to the founder |
| 4 | Finish session `inv-1.1` | The summary screen shows | Note where it stuck |
| 5 | Open `/lesson/3` and click **Run** on the exercise | Python loads (the first time downloads about 13 MB and can take 5–30s on school Wi-Fi: measured 2026-10-08 on a local production build, ready in 5s at 20 Mbps, 8s at 10, 13s at 5 and 28s at 2 Mbps, so under about 2 Mbps expect more than 30s; the file is cached for good after the first load) and tests run | "Python couldn't load": the filter blocks large downloads from `strikelab.dev/pyodide/`. Weeks 1–2 don't need it; get it allowed before week 3 |
| 6 | **Time** how long the cohort home takes to appear on a fresh load | Under about 3s | Tell the founder the device model and the time |
| 7 | In the Supabase SQL editor, check that the test student has a `lesson_completions` row (smoke-test step 3's query) | One row | Measurement is broken: stop, and fix before kickoff |
| 8 | Delete the test account (Settings → Delete my account) | Gone | — |

Log the result (date, device model, pass/fail per step) in the CRM notes for that school.

## 3. Kickoff-day runbook (T-0)

**Goal:** every student leaves the room having joined and finished the first short session. That makes them "activated" on day one.

### Before the meeting

- [ ] The leader's class is launched (`/teach` shows it with the right start date and break weeks).
- [ ] Printed join cards (from the invite page, one per 2–3 students) or the invite link on the projector.
- [ ] The leader's **invite page** (`/teach/<class>/invite`) is open on their laptop. Its "During your first meeting" panel shows, live, who has joined and who has finished the first short lesson, with students still at "Joined" listed first.
- [ ] You're signed in as the founder on a second device with the class scorecard open.
- [ ] You know who can turn off email confirmation in Supabase, and how (P2 fallback), and it takes under 2 minutes.
- [ ] Backup: the join code written on the board, for anyone whose camera won't scan.

### The 45 minutes

| Min | What happens | Who |
|---|---|---|
| −15 | Projector on; join card up; test the room's Wi-Fi once | Founder |
| 0–5 | Welcome. "For six weeks, you'll learn how professionals price risk, by building the models yourself, and finish with a project you can show." | Leader |
| 5–15 | **Everyone joins.** Scan the card, sign up with the email you actually check, confirm the email. Walk the room: the most common problems are a mistyped email and a confirmation email in spam | Founder circulates |
| 15–35 | **First session together** (`inv-1.1`, about 5 minutes), then keep going through `inv-1.2` and `inv-1.3`. Fast students help neighbors. Walk to whoever the live panel still shows at "Joined" | Everyone |
| 35–40 | Show the cohort home: "This is where each week's work appears. This week: three short lessons, due [date]." | Leader |
| 40–45 | Closing question, out loud: "Why would anyone hold more than one stock?" (the week-1 objective) | Leader |

### Fallbacks

| Problem | Do this |
|---|---|
| Confirmation emails aren't arriving for several students | Wait 2 minutes, then have them tap **Resend email**. If they still don't arrive, turn off "Confirm email" in Supabase (P2) and have them sign up again. Log it as an incident |
| A student has no phone or device | Pair them with someone, and they sign up on the leader's device at the end or at home that evening. Note their name for the leader |
| A student is under 13 | They don't create an account. The leader decides whether they can follow along on a partner's screen |
| Python is blocked on the network | Week 1 has no code. Carry on, and get `strikelab.dev/pyodide/` allowed before week 3 |
| The site is down | Check the Vercel dashboard. If the last deploy broke it, roll back (§5). Otherwise switch the meeting to discussion using the facilitator guide's week-1 prompts, and have students join that evening |

### After the meeting (same day)

- [ ] Scorecard: how many joined, and how many finished `inv-1`. Anyone who didn't join or start gets a note to the leader within 24 hours.
- [ ] Send the leader the week-1 message (copy-ready in the leader toolkit on the class page) if they haven't sent it.
- [ ] Observation notes (`pilot-observation-notes.md`): where students got stuck, by lesson and step.
- [ ] 15-minute kickoff interview with the leader, logged in `interview-log.csv`.

## 4. Parent and guardian note

The leader can send this, or print it for students to take home.

> **Subject:** [Club name] is running a six-week quant finance lab
>
> This term, [club name] will run StrikeLab's Quant Foundations Lab: six weekly meetings where students learn how markets price risk by writing small programs in Python (option pricing, testing a strategy honestly), and finish with a short capstone project.
>
> **What students need:** a device with a web browser. Nothing to install, and it's free.
>
> **Privacy:** StrikeLab is for ages 13 and up. Students sign up with an email address and a display name, nothing else. There are no ads, no public profiles and no public leaderboards with names; the club leader sees their student's progress and work. A capstone is only shared if the student turns on a share link, and even then it shows no name. Students can delete their account and all their data at any time. Full details: strikelab.dev/privacy
>
> **Questions:** [leader name and email], or StrikeLab's founder at [founder email].

## 5. Incident runbook

An incident is anything that stops students from working during a pilot, or that involves student data.

**1. Stabilize (minutes)**

| If | Do |
|---|---|
| A deploy broke the site | Vercel → Project → Deployments → the previous good production deploy → **Instant Rollback** |
| One feature is broken (e.g. the session player) | Roll back, or if it's content, point students to the long-form lesson (`/lesson/<id>`) for that week |
| Sign-up emails aren't delivered | Turn off "Confirm email" (production-readiness P2) until SMTP is fixed |
| The database is down or paused | Check status.supabase.com and the project dashboard. A paused free-tier project is restored from the dashboard |
| Suspected data exposure (a student sees another student's data, a share link shows a name, etc.) | Take the affected feature offline first (roll back or disable), then go to step 2 immediately |

**2. Tell people**

- **Student data involved:** tell the leader within 24 hours (what happened, which data, what you've done), and follow the school's own process if the pilot agreement names one.
- **No data involved:** tell the leader the same school day if students were affected.

**3. Write it down** in `docs/gtm/incidents.md` (create it on first use): date, what happened, how long, who was affected, the fix, and what prevents a repeat. Add a decision-log row if it changes the plan.

**Contacts to keep handy:** the Vercel dashboard, the Supabase dashboard, Sentry, the Discord ops channel, each leader's phone number (in the CRM), and the school IT contact.
