# Season 1 outreach kit (proving ground)

**Goal (spec §4, §7):** 100 students and 5 chapters playing Season 1, **Nov 30 to Dec 20**; 3 finance or quant people asked to judge by Oct 31; a parent waitlist for the January intensive that opens *after* Season 1 has results.
**Kill rule:** under 30 students in Season 1 means the message or channel is wrong. Fix that before building more.

Drafted by the agent. **Isaac approves every message before it goes out.** Nothing here has been sent.

## Rules (apply to every message)

1. **Only true claims.** No user counts, schools, quotes, or "trusted by". Season 1 has not run, so say that plainly.
2. **Adults by email; students only through public community posts** that follow each community's rules. No DMs to students. No collecting students' personal information outside the site's sign-up.
3. **Don't promise:** prizes (none are funded), sponsor names (none are signed), "FERPA/COPPA compliant", recruiting or internship outcomes, or that firms will see student results. Firms see aggregates only, and individual introductions are 18+ and not built.
4. **Every link carries a `?src=` tag**, and every touch goes in `crm.csv` the same day.
5. **Say what is real about the rules:** timed challenges, everyone gets their own numbers, the AI tutor is off during an attempt, leaderboards show handles only.

## Links to use

| Page | URL | Use for |
|---|---|---|
| Season | `strikelab.dev/seasons?src=TAG` | Students, chapters |
| Intensive waitlist | `strikelab.dev/intensive?src=TAG` | Parents only, after Season 1 |
| Club tooling | `strikelab.dev/clubs?src=TAG` | Advisors who ask how a chapter works |
| Demo (sample data) | `strikelab.dev/demo?src=TAG` | Anyone who asks "what does it look like" |

Before sending a link, open it on production. The seasons page only exists once PR #42 is merged.

---

## A. Isaac: teachers and club advisors (target 5 chapters)

Who: advisors of math team, investing club, CS club, DECA/FBLA, AP Stats/Econ teachers. Start at your own school (Chapter 1), then teachers you know, then introductions. Tag: `email-chapter`.

### A1. Warm email

> **Subject:** A free 3-week quant season for [club name]
>
> Hi [name],
>
> I'm building StrikeLab, a site where high schoolers learn quant finance by writing real Python (option pricing, the Greeks) in the browser.
>
> From Nov 30 to Dec 20 we're running Season 1: one timed challenge a week, three weeks, free. Each student gets their own randomized numbers, so answers can't be copied, and the AI helper is off during a challenge. There's a ranked board for the whole season and a private board just for your club.
>
> Would [club name] want to play as a chapter? It's about one hour a week for students. Setup for you is a few minutes: make a free class on StrikeLab and share its join link, and your club's board appears for members and you. I can do it with you.
>
> This is the first season, so I can't point you to past results yet. I can show you the challenges in a 10-minute call or in person.
>
> [Isaac]
> strikelab.dev/seasons?src=email-chapter

### A2. Follow-up (5 days later, once)

> Hi [name], following up on Season 1 (Nov 30 to Dec 20, free, three one-hour challenges). If a club isn't the right fit, is there another teacher I should ask? Thanks either way.

### A3. Intro request (to anyone who said yes or no kindly)

> Thanks again. Do you know another teacher or advisor, at your school or elsewhere, whose students would want this? A name and email is plenty; I'll mention you sent me.

### Answers to likely questions

| They ask | Say |
|---|---|
| "What do students need to know?" | Some Python helps; the 23 free lessons on the site cover what the challenges use. |
| "Is it safe for my students?" | Students 13+ sign up themselves; public boards show a chosen handle, never a real name; records are private until the student shares them; anyone can delete their account. See strikelab.dev/privacy. |
| "Does it cost anything?" | Seasons are free. |
| "Who's behind it?" | Me, a high school student, plus [teammate] on outreach. Say this plainly. |
| "Can you guarantee no cheating?" | No. Per-student numbers, server-timed windows, the AI tutor off, and a short live defense before a top placing appears on a record make it hard, not impossible. |

---

## B. Isaac: finance and quant people (target: 3 asked to judge by Oct 31)

Who: people you or your parents know, alumni of your school in finance, local advisors, university quant-club officers, people who post about quant education. Ask for **judging one challenge**, not money. Tag: `email-judge`.

### B1. Ask to judge

> **Subject:** 20 minutes to judge a high school quant challenge?
>
> Hi [name],
>
> I'm a high school student building StrikeLab, where students prove they can do real quant work through timed Python challenges (put-call parity, Black-Scholes, delta) and a capstone they defend live.
>
> Season 1 runs Nov 30 to Dec 20. Would you judge one week? That means reading the top few written explanations (a paragraph each, shown only by handle) and scoring them on a short rubric, about 20 to 30 minutes, any time that week.
>
> If you'd rather write a challenge than judge one, even better: send me an idea and I'll build it.
>
> No money is involved and you wouldn't receive any student's personal information.
>
> [Isaac]
> strikelab.dev/seasons?src=email-judge

### B2. Follow-up (one week later, once)

> Hi [name], one more try on judging a week of Season 1 (20 to 30 minutes in December). If now isn't a good time, no problem. Is there someone you'd suggest instead?

**Not yet:** don't ask anyone to sponsor before Season 1 has results. A judge who liked it is the person you ask about sponsorship in January.

---

## C. Teammate: community posts (not email)

Where: AoPS forums, competition-math, USACO and CS Discords, r/highschool, r/learnpython, r/quant (check each community's self-promotion rules first; ask a moderator if unsure). Post as yourself, say you're on the team. Tag per community: `?src=aops`, `?src=discord-[server]`, `?src=reddit-[sub]`.

The older drafts in `outreach-drafts/` are about the lessons; use these for Season 1.

### C1. AoPS / forum post

> **Title:** Free 3-week quant finance season for high schoolers (Nov 30 to Dec 20)
>
> I'm on the team behind StrikeLab, a free site for learning quant finance by writing Python in the browser. We're running Season 1: three weekly timed challenges (put-call parity, Black-Scholes, option delta), one hour each.
>
> - Everyone gets their own randomized numbers.
> - The AI helper is off during a challenge.
> - The leaderboard shows handles only, never names.
> - It's the first season, so the problems are new and the board starts empty.
>
> If you've done AMC/AIME or USACO and wondered what quant work actually looks like, this is a fast way to find out. Free lessons on the site cover everything the challenges use.
>
> strikelab.dev/seasons?src=aops
>
> Happy to answer questions here. Feedback on the problems is very welcome.

### C2. Discord (short)

> Free 3-week quant season for high schoolers, Nov 30 to Dec 20: one timed Python challenge a week (option pricing, Greeks), per-student numbers, handle-only leaderboard, AI helper off during attempts. First season, so it's a fresh board. strikelab.dev/seasons?src=discord-[server] (mods: let me know if this belongs in a different channel)

### C3. Reddit

> **Title:** We made a free timed quant challenge season for high schoolers. Looking for feedback on the problems
>
> [C1 body, then:] What would make a challenge like this actually meaningful to you or to a college/program reading your record?

### C4. In-person club visit (60 seconds)

> "Hi, I'm [name] from StrikeLab. Starting Nov 30 there's a free three-week quant season: one hour-long Python challenge a week on option pricing, ranked, and your club gets its own board. Your advisor can scan this [QR to `/seasons?src=visit-[school]`]. Any questions?"

---

## D. Parents: intensive waitlist (after Season 1 only)

Don't start this until Season 1 has real numbers. Owner: teammate, through school parent channels; Isaac approves. Tag: `parent-[channel]`.

> **Subject:** January quant intensive for high schoolers: waitlist
>
> StrikeLab is running a six-week quant finance intensive in January for 8 to 12 high school students: weekly mentor review of their Python work, ending in a capstone the student defends live (with a parent's consent; calls are never one-on-one and private).
>
> The price is $349. Joining the waitlist is free and doesn't commit you; we only charge once a cohort fills, after you've seen the terms.
>
> In Season 1 (Dec), [N students from M schools took part]. ← fill in only with the real numbers
>
> strikelab.dev/intensive?src=parent-[channel]

**No payments** until a parent holds the Stripe account and the terms and refund policy have been reviewed (spec §4).

---

## Weekly check (Isaac + teammate, 30 minutes)

| Number | Source |
|---|---|
| Contacts sent, replies, yeses, by tag | `crm.csv`, `npm run pipeline` |
| Season sign-ups (handles set) and attempts | Ask the agent for a read-only database query; not on `/admin/metrics` yet |
| Chapters confirmed | `crm.csv` |
| Judges confirmed | `crm.csv` |
| One decision: which message or channel to drop | `decision-log.md` |
