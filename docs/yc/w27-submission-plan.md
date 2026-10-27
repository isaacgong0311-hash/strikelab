# YC Winter 2027: submission plan, Oct 28 to Nov 2

**Deadline:** Mon Nov 2, 8pm PT (10pm Central). **Target:** submit Sun Nov 1, and keep Monday as a buffer. Decisions by Dec 11.
**Draft:** [`application-draft.md`](application-draft.md) v0.7. Its founder checklist takes about 60 minutes; this plan spreads it over the week alongside the two videos and the production checks.
**Time budget:** about 1 to 1.5 hours on school nights, 2 to 3 hours on the weekend. If a day slips, push its items to Monday morning, never to Monday evening.

## The two things that decide the application

1. **Batch choice (Wednesday).** Winter 2027 means working on StrikeLab full-time during the batch (about January to March) and after it ([YC FAQ](https://www.ycombinator.com/faq)). If that isn't possible, apply with **"A batch after Winter 2027"** through [Early Decision](https://www.ycombinator.com/early-decision). YC funds accepted students right away and holds a place in a later batch, and the rest of the application stays the same. This is your call, made with your parents. Every availability answer has to match it.
2. **Honest usage (Thursday).** As of Oct 27, usage is unknown, not zero. Production has the product, but Season 1 isn't scheduled in the production database. What can honestly be shown by Nov 2 is listed below.

## Day by day

### Wed Oct 28 (about 1 h): decide the batch and lock the questions
- [ ] Read the YC [FAQ](https://www.ycombinator.com/faq) and [Early Decision](https://www.ycombinator.com/early-decision) pages yourself. Talk through Winter 2027 vs. a later batch with your parents. Write the decision down (checklist item 1).
- [ ] Log in to apply.ycombinator.com, start the application, and copy each live question and its character limit into a private copy of the draft. Where the live wording differs from v0.7, move the answer and clear its `[VERIFY ON LIVE FORM]` tag. Note any question that's missing from the draft.
- [ ] Check what the form accepts for the founder video and the demo (upload or link, length, file size) and write it at the top of the draft.

### Thu Oct 29 (about 1.5 h): facts from production
- [ ] Confirm the production deployment on Vercel is READY and note its commit (several PRs were merging on Oct 27).
- [ ] In the Supabase SQL editor (production, read-only queries):
  - `scripts/metrics/check-migrations.sql`: are `0024_seasons` and `0025_verifications_and_records` applied?
  - `scripts/metrics/baseline.sql`: registered users, users with a completed lesson, completions, clubs, students in clubs, signups by source.
  - If `0024` is applied: `select count(*) from public.intensive_waitlist;` and `select count(*) from public.profiles where handle is not null;`
- [ ] Paste the numbers into the draft with today's date and "source: production query". Aggregates only, no names or emails.
- [ ] Stripe: confirm revenue (expect $0, since nothing is for sale). Write $0 only after checking.
- [ ] If Season 1 isn't scheduled: decide whether to apply the missing migrations and run `supabase/seed/season-1.sql` in production before Saturday. Use the usual process (build, PR, green CI, deploy, smoke test). It's a production write, so it's your decision. If you skip it, the application and demo must say "opens Nov 30", not show a schedule.

### Fri Oct 30 (about 1.5 h): your answers and the founder video
- [ ] Write checklist items 4 and 5 yourself (why this idea, why YC, the impressive thing, the non-computer hack). No AI drafting: these answers are about you.
- [ ] **Record the 1-minute founder video** in the evening:
  - Phone at eye level, quiet room, light in front of you, you on camera the whole time. No slides, no screen, no music.
  - Follow the four beats in the draft (who/what, why, one thing you learned, what's next with a date), in your own words. Don't read from a script.
  - Do 3 to 5 takes and keep the most natural one, not the most polished. Check it's under 60 seconds and that the audio is clear.
  - If the outreach teammate is a cofounder (checklist item 6), they need to be in it too.

### Sat Oct 31 (about 3 h): re-verify and record the product demo
- [ ] Re-run the claims table in the draft against whatever is in production today: lessons, Market Lab, pricing, the Intensive, `/seasons`, and the test count (`npx vitest run` on the deployed commit). Update the table and anything that changed.
- [ ] Make a fresh demo student account (not the founder or admin account). Set a handle.
- [ ] **Record the product demo** (a screen recording, separate from the founder video), about 2 minutes, on production, 1280×800, notifications off:

| Time | Screen | What it shows |
|---|---|---|
| 0:00–0:10 | strikelab.dev home | One sentence: what it is and who it's for |
| 0:10–0:50 | `/lab`, mission 01 (volatility) | Predict, move one input, the curve moves, write the explanation |
| 0:50–1:30 | `/lessons` → Black-Scholes lesson | Write or finish the Python, run it, tests pass in the browser, no install |
| 1:30–1:45 | `/seasons` | How a season works. Show the three challenges only if they're scheduled in production; otherwise say "Season 1 opens Nov 30" |
| 1:45–2:00 | `/pricing` → `/intensive` | Free for students and clubs; Intensive waitlist at $349, no payment yet |

  - Don't show: the founder metrics page, admin pages, any real student's name or email, club boards with real members, or numbers that aren't in the draft.
  - Don't demo AI-generated practice problems unless the Oct 27 fix (PR #66) is confirmed deployed.
  - Sample data on screen must say it's sample data. Re-record rather than edit around a mistake.
- [ ] Do checklist items 6 and 7 (team, short fills).

### Sun Nov 1 (about 2 h): read through and submit
- [ ] Read every sentence against [`docs/investor/claim-ledger.md`](../investor/claim-ledger.md): each claim is built, live, observed, paid or a forecast, and says which. Remove any number without a source and date.
- [ ] Have one person who doesn't know StrikeLab watch the demo and read the 50-character line, then say back what it is and who it's for. Fix anything they got wrong. They review; they don't write.
- [ ] Paste everything into the live form, attach both videos, preview, and **submit**.
- [ ] Save a copy of the submitted text (no personal details) as `docs/yc/submitted-2026-11-01.md` in a commit.

### Mon Nov 2: buffer only
- [ ] If not submitted, submit by noon Central. Don't start new answers or re-record today.
- [ ] `[VERIFY ON LIVE FORM]` whether the form allows edits or updates after you submit. Don't count on it.

## What real usage can honestly be shown by Nov 2

| Can show (if the Thursday query backs it) | Can't show yet |
|---|---|
| Aggregate counts from production with a date: registered users, users with a completed lesson, completions, clubs, students in clubs, signups by source | Any Season 1 result: it opens Nov 30, after the deadline |
| Intensive waitlist count (parent sign-ups; interest, not payment) | Retention, week-4 return, capstones completed, learning outcomes |
| Number of students who set a season handle (interest, not participation) | Revenue or paid commitments (expected $0; confirm in Stripe) |
| Any real club using it, as a count, only with the leader's consent | Sponsor interest (none yet) |
| What's built and live, from the claims table | "Fewer than 20 users" or any other number from earlier drafts, unless re-queried |

If the counts are small, say them anyway, with the date. Small and true reads better than vague. "Season 1 opens Nov 30; three weekly challenges through Dec 20" is a fact you can state. A forecast of how many will join is not.

**After submitting:** Season 1's first week closes Dec 6, before the Dec 11 decisions. If YC offers a way to send an update, a dated week-1 count (students with an official score, from `season_attempts`) is the one new fact worth sending. Don't send anything until you've checked how YC accepts updates.

## Early Decision, if you can't commit full-time from January to March

- Choose **"A batch after Winter 2027"** on the form. Submitting by Nov 2 is still the safe plan; check on the form or the Early Decision page whether a different deadline or decision date applies. `[VERIFY ON LIVE FORM]`
- Answer the full-time and availability questions with your actual school timeline and when you could go full-time. Don't hint at more availability than you have.
- Everything else in the draft and this plan stays the same: same videos, same usage evidence, same claims table.
- Seasons 1 and 2 then become the progress you'd report before your batch. Keep running [`founder-update-template.md`](founder-update-template.md) monthly so the record is ready.
