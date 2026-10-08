# Pilot Smoke Test

A 20–30 minute click-through of the whole pilot journey, with a SQL check at each step that proves the data landed. Run it:

- on **staging** (production-readiness P5) in week 5, as part of rehearsal;
- on **production** in week 6 with throwaway accounts, which delete themselves at the end;
- after any deploy that touches sign-up, joining, completions or capstones.

**Automated part (30 seconds, no account, writes nothing).** Before the click-through, run the public half against the deployed URL:

    PLAYWRIGHT_BASE_URL=https://<deployment> npm run smoke
    SMOKE_EXPECT_INDEXABLE=1 PLAYWRIGHT_BASE_URL=https://strikelab.dev npm run smoke   # production

It checks that the public pages load, the Python runtime is served from our own origin (the school-filter failure in step 4), the pilot entry points and bad invite links behave, the founder metrics page is hidden, and `robots.txt` matches the environment. It does **not** cover anything below: sign-up, joining, completions, sync, the scorecard, capstones or deletion. Those need a real project and stay manual until staging exists.

**You need:** a laptop (the leader) and a phone (the student), two email addresses you can read (plus-addressing like `you+lead@gmail.com` works), and the Supabase SQL editor open for the project you're testing.

Write each result in the log at the bottom. **Stop at the first failure.** It's either a bug or a missing migration, so run `scripts/metrics/check-migrations.sql` first.

---

## 1. Leader sign-up and class setup (laptop)

1. Open `/pilot?src=smoke`, then click **Set it up now**.
2. You should reach sign-up with **"A club leader or teacher"** preselected. Sign up with the leader email and confirm it (or not, if confirmation is off; see P2).
3. You land on `/teach/new`. Name the class `Smoke Test <date>`, pick a first meeting date next Monday, and add a break week.
4. You land on the invite page with the link, message, QR card and kickoff checklist. **Time it:** from clicking "Set it up now" to the invite page should take under 3 minutes.
5. Click **Print** and check the card fits on one page.

```sql
-- The leader, their role and source, and the class with its schedule.
select u.email, u.raw_user_meta_data ->> 'signup_role' as role, p.signup_source,
       c.name, c.join_code, c.template_id, c.starts_on, c.skip_weeks, c.launched_at
from auth.users u
join public.profiles p on p.id = u.id
left join public.classes c on c.teacher_id = u.id
where u.email = 'LEADER_EMAIL';
```
**Pass:** role = `leader`, `signup_source` = `smoke`, one class with `template_id`, `starts_on` and `skip_weeks` set.

## 2. Student joins from the link (phone)

1. On the phone, scan the QR code from the printed card or the screen.
2. You should reach sign-up with **"A student"** preselected. Sign up with the student email and confirm it.
3. You land on the **cohort home** (`/cohort/<id>`), showing week 1 and **one** next-step button.

```sql
select c.name, m.joined_at
from public.class_members m
join public.classes c on c.id = m.class_id
join auth.users u on u.id = m.user_id
where u.email = 'STUDENT_EMAIL';
```
**Pass:** one row, with `joined_at` from the last few minutes.

## 3. First lesson, in bite-sized sessions (phone)

1. Tap the next-step button. It opens `/learn/inv-1.1`.
2. Finish sessions `inv-1.1`, `inv-1.2` and `inv-1.3`. Get at least one question wrong on purpose, and check it comes back later in the session.
3. After the last session, the cohort home marks lesson 1 done.

```sql
-- Session results (one row per session) and the lesson completion (server-timestamped).
select 'session' as kind, s.session_id as id, s.completed_at, s.accuracy
from public.session_completions s join auth.users u on u.id = s.user_id
where u.email = 'STUDENT_EMAIL'
union all
select 'lesson', l.lesson_id, l.completed_at, null
from public.lesson_completions l join auth.users u on u.id = l.user_id
where u.email = 'STUDENT_EMAIL'
order by completed_at;
```
**Pass:** three session rows, and **exactly one** `lesson` row for `inv-1` with a `completed_at` from the last few minutes. Its timestamp comes from the database clock, never the phone.

## 4. Code syncs across devices (laptop and phone)

1. On the laptop, sign in as the student (in a private window). Open `/lesson/3` (Black-Scholes, which has a Python exercise) and type a comment in the code. Wait for **Saved**.
2. On the phone, open the same lesson. The comment is there.
3. Click **Run**. Python loads and the tests run. (If it says "Python couldn't load" on a school network, the filter is blocking the runtime download from `strikelab.dev/pyodide/`. See the IT allowlist in `kickoff-kit.md`.)

```sql
select lesson_id, updated_at, last_passed_at, length(code) as chars
from public.lesson_submissions ls join auth.users u on u.id = ls.user_id
where u.email = 'STUDENT_EMAIL';
```
**Pass:** a row for that lesson. `last_passed_at` is set if the tests passed.

## 5. The scorecard (laptop, as the leader)

1. Open `/teach`. The class card shows 1 enrolled, and where the class is in the six weeks.
2. Open the class page. The scorecard shows the student as enrolled. Activation is "pending" until the 7-day window closes, or "activated" if the cohort has already started.
3. Download the **CSV** and open it: one row for the student, with lessons done = 1. No formula warnings in your spreadsheet app.

**Pass:** the numbers match what you did by hand.

## 6. Capstone: draft, submit, teacher view, share, revoke

Capstones open in cohort week 5. To test before that, launch a second throwaway class with a first meeting date 5 weeks in the past, and join it with the student too.

1. Student: open the capstone from the cohort home, pick a prompt, fill in a title and thesis, and wait for the autosave. Reload the page: the draft is still there. Then **Submit**.
2. Leader: open the student's capstone from the class page.
3. Student: turn on **sharing** and copy the link. Open it in a private window: the capstone shows, **with no student name**.
4. Student: turn sharing **off**. Reload the private window: it now shows **404**.

```sql
select cs.status, cs.submitted_at, cs.share_token is not null as shared,
       (select count(*) from public.capstone_access_log a where a.capstone_id = cs.id) as teacher_views
from public.capstone_submissions cs join auth.users u on u.id = cs.user_id
where u.email = 'STUDENT_EMAIL';
```
**Pass:** `status = submitted`, `shared = false` after revoking, and `teacher_views ≥ 1`.

## 7. Clean up: accounts delete themselves

1. Student: Settings → **Delete my account…** → confirm.
2. Leader: the same.

```sql
select
  (select count(*) from auth.users where email in ('LEADER_EMAIL', 'STUDENT_EMAIL')) as users,
  (select count(*) from public.classes c join auth.users u on u.id = c.teacher_id where u.email = 'LEADER_EMAIL') as classes;
```
**Pass:** both counts are 0, and every row from steps 1–6 is gone (they cascade on delete).

---

## Log

| Date | Project (staging/prod) | Build / commit | Result | Failed step and notes |
|---|---|---|---|---|
| | | | | |
