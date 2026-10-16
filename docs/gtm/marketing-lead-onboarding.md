# Onboarding: marketing and outreach lead

**Who this is for:** the person joining Isaac to run outreach, messaging and partnerships. **Read this, then `docs/superpowers/plans/2026-10-15-build-plan-to-yc.md` sections 2, 4, 5 and 8.** Everything else in `docs/` is background.

## What StrikeLab is, in 30 seconds

A six-week technical-finance lab that a high-school club runs. Students write Black-Scholes pricing, the Greeks and a backtest in Python in the browser. The leader launches a cohort in minutes and sees a scorecard of who is active and who needs help. **Free for students. Pilots are free. After a pilot: $199 a year per club, $499 a year per school instructor.** Try it: strikelab.dev/demo (labeled sample data) and strikelab.dev/clubs.

## The honest state of things

Nobody outside Isaac's circle has run a cohort yet. There are no testimonials, no case studies, no paying customers. **The job right now is to find out whether anyone wants this and who would pay, not to make it look bigger than it is.**

## What you own

| Area | Build-plan task | What "done" looks like |
|---|---|---|
| Outreach volume | T1.2, T1.3 | 15+ new real contacts a week, every one logged in `docs/gtm/crm.csv` the same day, each with its own `?src=` tag so we can tell what worked |
| Message testing | T1.2 | Five variants per segment (investing club advisor, math team coach, CS teacher, econ teacher, DECA/FBLA advisor); keep the one that gets replies |
| The money question | T1.7 | Every call ends with "If this worked, who would pay: you, a parent, a sponsor, or nobody?" and the answer goes in the `payer` and `willing_to_pay` columns |
| Sponsor experiment | T2.3, T2.4 | 20 short emails to recruiting or outreach people at trading firms, banks and local advisors, asking for a 15-minute call. Not money yet. Success is 2 calls and 1 written expression of interest |
| Partner channel | T2.5 | Approach DECA, FBLA, AMC-club and Wharton-team advisors as *distribution*: "keep your game, add this for the students who want the math" |
| Parent-paid test | T2.1 | A one-page offer and a waitlist for a winter cohort, sent to 20 families. **No payments** until the legal items in T8 are done |

Isaac owns: the product, the demos, anything that needs a technical answer, school conversations, and every decision about price and legal commitments.

## Rules that protect both of you

1. **Say only what is true.** No invented users, quotes, schools, numbers or "trusted by". If it isn't on `strikelab.dev` or in a signed note, don't claim it. An empty proof section is better than a made-up one.
2. **Claims we do not make yet:**
   - "FERPA compliant" or "COPPA compliant" (no one has reviewed it).
   - "Zero prep" (the real weekly prep is not measured yet).
   - "We'll handle your district's data-privacy agreement."
   - "Trusted by N schools" or any number of clubs running it.
   - The paper-trading sandbox, weekly challenges or a leaderboard (all removed in Oct 2026), or the AI tutor (off by default for every class; the leader chooses).
3. **Adults only.** Outreach goes to teachers, advisors, parents, firms and organizations. Do not cold-message students. Do not collect any student's personal information.
4. **Consent before anything is public.** A quote, a name, a school or a photo needs written permission from that person (and a guardian for a minor). Templates: `docs/gtm/` (one page each, still pending legal review).
5. **No access to production data or keys.** You do not need the database, Stripe or any service key, and you should not be given them. The CRM is a CSV in the repo; the numbers come from `npm run pipeline`.
6. **Log everything, same day.** A lead that isn't in `crm.csv` didn't happen. Every "no" gets a one-line reason.
7. **Fix, don't hide, bad news.** If a message gets no replies, write that down and change it.

## Your first week

1. Read the files above (about an hour), then try `strikelab.dev/demo` and `strikelab.dev/clubs` and write down every sentence that confuses you. That list is valuable and Isaac needs it.
2. Run the 10-second test (T5.8): show `/clubs` to five people who don't know StrikeLab. Can four of them say what it is and who it's for?
3. Draft the five message variants for one segment; Isaac approves before anything is sent.
4. Make and log your first 15 contacts using `?src=` tags (for example `?src=mk-econ-1`).
5. Agree a 30-minute weekly review with Isaac: contacts, replies, calls, yeses, payer split, one decision.

## How you work with the repo

- Plain-text and CSV work lives in `docs/gtm/`. Changes go through a branch and a pull request, so Isaac can see and approve them.
- Run `npm run pipeline` to see the funnel and the payer split from `crm.csv`.
- Ask the agent (Claude) for message drafts, objection practice ("play a skeptical teacher with no budget") and call preparation. It cannot send messages or contact anyone for you.

## Before you contribute: the people part (Isaac, please read)

This is not legal advice; a lawyer or a trusted adult should confirm it.

- **Write down the arrangement now**, in plain words: role, hours, what you each own, and whether equity is involved. Informal promises about ownership are the most common cause of later fights.
- **Anyone whose work ends up in the repo or on the website should sign a short agreement assigning that work to the company (or to Isaac until a company exists).** This also matters for the same reason about any other past contributor to the code. Investors ask for it.
- **The plan's own rule about cofounders** (YC-readiness plan Y5.3): don't add one just for an application. If this is heading toward a cofounder, run a 4 to 6 week trial project with a clear result (for example: "40 logged contacts and one sponsor call") before any title or equity.
- **Age and signing.** If either of you is under 18, contracts and equity need a parent or guardian's involvement. Settle that before money or ownership is discussed.
