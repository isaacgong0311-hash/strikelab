# Pilot Outreach Kit

Everything for finding and signing fall pilot leaders, in one place: who to contact, what to send, how to run the call, and what to send after a yes. It goes with `pilot-one-pager.md` (the long version) and the targets in `docs/superpowers/plans/2026-09-29-work-plan-to-first-kickoff.md` (§2.3: about 40 contacts → 10 calls → 2 yeses by Oct 16).

Log every touch in `crm.csv` the same day. If a message isn't in the CRM, it didn't happen.

---

## 1. Who to contact, in order

Warm contacts convert several times better than cold email, and the fall deadline doesn't leave room for the slow way. Work down this list and don't start a tier until the one above is exhausted.

| Tier | Who | Source tag (`?src=`) |
|---|---|---|
| 1 | Teachers and club sponsors at your own school: math, CS, AP Stats, AP CS, AP Macro/Micro, personal finance, economics, and the sponsors of DECA, FBLA, investing club, Math Club/MAO, Science Olympiad and robotics | `email-warm` |
| 2 | Teachers you've had before, and any teacher you know from competitions, camps or summer programs | `email-warm` |
| 3 | Introductions: ask every tier-1 and tier-2 contact "Who else runs a club like this?", and ask parents and friends at nearby schools | `email-intro` |
| 4 | Cold: club sponsors listed on nearby high schools' websites (club directories, activity pages) | `email-cold` |

**Qualify before you send:** prefer clubs that already meet weekly, have 8+ regular members, and can meet in a room with devices. After-school clubs where students use personal accounts often need no approval (path A), which makes them the best bet for the fall.

---

## 2. Messages

Fill in the brackets. Send from your personal address, one person at a time. Keep them short: the demo link does the explaining.

### Warm email (tiers 1–2)

> **Subject:** A six-week quant lab for [club name]?
>
> Hi [name],
>
> I'm [your name], a [grade] here at [school]. Over the past year I built StrikeLab, a free six-week lab where students code real finance models (option pricing, a backtest) in the browser and finish with a project they can show.
>
> I'd love to run it with [club name] this fall, with me supporting every week. It's one 45-minute meeting a week, and there's zero prep for you: each week comes with a plan, a message for students and a progress view.
>
> Could I show you in 15 minutes? [Cal.com link]
> Or look first: strikelab.dev/demo?src=email-warm
>
> Thanks,
> [your name]

### Text or chat (someone who knows you well)

> Hi [name]! Quick one: I built a free six-week quant finance lab for high-school clubs (students code option pricing and backtests in the browser). Would [club name] want to try it this fall? I'd run it with you. 2-minute look: strikelab.dev/demo?src=text

### Introduction ask (to a contact who knows other leaders)

> Thanks again for [the call / your help]. Do you know one or two teachers who run a math, CS, investing or econ club at another school? If so, could you forward the note below, or introduce us by email? It's free for them this fall.
>
> *Forwardable:* [Your name] built StrikeLab, a free six-week lab where club students code real finance models in the browser and finish with a capstone. They're looking for two or three clubs to run it with this fall and will support every week. Demo: strikelab.dev/demo?src=email-intro

### Cold email (tier 4)

> **Subject:** Six-week quant lab for [club name] (free, zero prep)
>
> Hi [name],
>
> I'm [your name], a high-school student at [school] in [city]. I built StrikeLab, where club students learn quantitative finance by coding it: they implement Black-Scholes, test a trading strategy honestly, and finish with a capstone they can show colleges.
>
> I'm looking for two or three clubs to run the six-week lab with this fall, free, with me supporting every week. It's one 45-minute meeting a week and no prep for you.
>
> Two-minute look: strikelab.dev/demo?src=email-cold
> 15-minute call: [Cal.com link]
>
> [your name]

### Follow-ups (one line each, one new fact each time)

- **Day 3:** "Just floating this back up. Here's what you'd see each week as the leader: strikelab.dev/demo?src=followup (the Teacher view tab)."
- **Day 7:** "Last note from me. Here's an example of what students build by week 6: strikelab.dev/demo/capstone/option-pricing?src=followup. If fall doesn't work, would January?"

After day 7, mark the contact `no_response` and stop. A "not this fall" is a spring lead: set `next_action` to "Re-ask Nov 16 for January".

---

## 3. The 15-minute call

Keep `/demo` and `/teach/new` open in two tabs before the call starts.

| Minutes | What happens | What you say or do |
|---|---|---|
| 0–4 | **Discovery**: listen more than you talk | "How does [club] run now? What do students want to get out of it? When do you meet, for how long, how many regulars?" |
| 4–9 | **Demo** | `/demo`: Teacher view (scorecard, the week's plan, copy-ready message), then Student view (the cohort home, one short lesson), then an example capstone |
| 9–12 | **Qualify**: ask all five, and write the answers down | See below |
| 12–15 | **Close** | Propose a week-1 date. Offer to set up the class right now in `/teach/new` while you're both on the call, so they leave with an invite link |

### The five qualifying questions

These answers decide the Fall go/no-go (work plan §6), so don't skip any.

1. **"When would week 1 be?"** For the fall it must be on or before **Mon Nov 2** (Oct 26 is better).
2. **"What does your school need before students use an outside website?"**
   - Nothing, because students use personal accounts after school → **path A**.
   - A sponsor or principal OK → **path B**.
   - A district vendor or data-privacy review → **path C** (usually too slow for fall; aim for January and start the paperwork now).
3. **"What do students sign in with at school: a personal email, or a school Google account?"** School Google accounts for under-18s are often blocked from outside apps, so plan on email sign-up.
4. **"Any breaks between now and mid-December?"** Thanksgiving week is assumed; ask about fall break and finals.
5. **"Who else would need to say yes?"**

### After the call (same day)

- [ ] `crm.csv`: status, approval path (in `notes` as `path:A/B/C`), expected students, start date, and next action.
- [ ] `interview-log.csv`: the observation, one direct quote, a pain score from 1 to 5, and what they use now.
- [ ] If it's a yes, send the **approval packet** (§5) within the hour.

---

## 4. Objections

| They say | You say |
|---|---|
| "I don't have time." | "It's one 45-minute meeting a week. Each week comes with a plan and a message you can paste to students, and I'll be at the first meeting." |
| "My students aren't coders." | "Week 1 has no code at all. After that, the Python is scaffolded: students fill in one function at a time, and it runs in the browser with nothing to install." |
| "I don't know finance." | "You don't need to. The lessons teach it; you run the room. The facilitator guide has the discussion prompts and the common sticking points." |
| "Our district needs a data agreement." | "Send me your district's standard agreement (many Texas districts use the TXSPA one) and I'll sign yours rather than bring my own. Meanwhile here's our data map and privacy page." Then mark it path C, and aim for January. |
| "Can I see it first?" | "Yes: strikelab.dev/demo, no account needed. The Teacher view tab is what you'd see each week." |
| "What does it cost later?" | "Free for this pilot. If you want to continue next term, it's $199 a year for a club or $499 for a school. That's a conversation for after, not a condition." |
| "Students will just copy the code." | "The exercises test whether the code behaves correctly, not whether it matches an answer. The capstone asks for a written defense, and you can see who ran what." |
| "Is it safe for students?" | "13 and up only, no ads, private by default, no public profiles or leaderboards, and students can delete everything at any time." Then send the approval packet. |
| "We're too busy this fall." | "Totally fair. Could we pencil in January? Teachers plan spring clubs in November and December, so I'll check back mid-November." |

---

## 5. The approval packet (send the same day as a yes)

One email, with everything a sponsor, principal or IT person asks for:

> **Subject:** StrikeLab pilot: details for approval
>
> Thanks, [name]! Here's everything your school might ask for:
>
> - **What it is:** a free six-week lab, one meeting a week, run by you, with me supporting. One page: [pilot one-pager link, or attach it as a PDF]
> - **Privacy:** 13 and up only, no ads, private by default, students can delete their account and all their data at any time. Privacy page: strikelab.dev/privacy
> - **What we store and who can see it:** https://strikelab.dev/trust (the same facts as `docs/trust/data-map.md`; attach that as a PDF if the school wants a file)
> - **Websites to allow on the school network:** [the IT allowlist from `kickoff-kit.md`]
> - **Cost:** free for this pilot. No payment details are ever collected from students.
>
> If your school has its own agreement it would like me to sign, send it over.
>
> Proposed week 1: [date]. I'll send the invite link and a printable join card a week before.

---

## 6. Weekly rhythm (weeks 3–5)

| Day | Outreach work |
|---|---|
| Mon | 10 new messages (tiers in order), plus day-3 follow-ups |
| Tue–Thu | Calls; day-7 follow-ups; introduction asks after every call |
| Fri | CRM clean-up, and the pipeline rows in `weekly-scorecard.md` |

**When to change course** (work plan §8):
- Under 20% replies after 20 messages: the message is wrong. Rewrite it around what leaders said in discovery, and push harder on introductions.
- Calls but no yeses: ask directly, "What would make this a yes?", and log the answer as an objection.
- Yeses stuck in approval: they're spring leads. Look harder for path-A clubs for the fall.

---

## 7. CRM rules (so `npm run pipeline` can count)

`npm run pipeline` reads `crm.csv` and prints this week's pipeline rows for `weekly-scorecard.md`, plus a **follow up today** list (open leads with no contact for 3+ days). It only works if every row follows these rules:

- **`status` is the furthest stage the leader has reached**, from this list:

  | Status | Meaning |
  |---|---|
  | `to_contact` | On the list, not messaged yet |
  | `contacted` | Messaged personally |
  | `replied` | Answered (including "no") |
  | `call_booked` | A call is on the calendar |
  | `call_held` | The call happened |
  | `verbal_yes` | Said they'll run it, and named a week-1 date |
  | `locked` | Verbal yes, plus approval done or not needed, plus the date on both calendars |
  | `running` | The cohort has started |
  | `completed` | The cohort has finished |
  | `committed` | A signed, dated, priced commitment for next term |
  | `paid` | Money received |

- **When a lead ends, keep its status** and write `closed: <reason>` in `next_action` (`closed: no_response`, `closed: not_now (re-ask Nov 16)`, `closed: declined`). The funnel then still shows how far they got.
- **`source`** is one of `own_school`, `own_teacher`, `warm_intro`, `referral` (these count as warm), `cold_email`, `event`.
- **Approval path** goes in `notes` as `path:A`, `path:B` or `path:C`.
- **`last_contact`** is `YYYY-MM-DD`, updated on every touch.
- Rows starting with `EXAMPLE` are ignored. Delete them once real rows exist.
