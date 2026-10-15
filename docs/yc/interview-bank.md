# YC Interview Bank (v0.5, 2026-10-15)

**How to use:** write your own 30-second answer under each question (Y8.5). The agent plays a skeptical partner in chat for mock interviews (Y8.6). Goal: short, specific, honest about gaps. Facts about the product come from this repo; anything about traction stays blank until it's real.

**Answer rules:** lead with the answer, then one specific example or number. If the number is bad, say so first and say what you changed. Never say "we're pre-revenue but…" without the next step and date.

**Status key:** ☐ unanswered · ◐ drafted · ☑ rehearsed aloud

## A. The basics (they will ask these first)

1. ☐ What does StrikeLab do, in one sentence?
2. ☐ Who is the customer, and who is the user? Who pays?
3. ☐ Why would a school or club pay for this?
4. ☐ How many cohorts have run? How many students activated? What share came back in week 4?
5. ☐ What is your growth rate, and what metric do you track?
6. ☐ How much of that depended on you being in the room?
7. ☐ What have you learned from leaders that surprised you?
8. ☐ Show me the product. (Run the 2-minute demo.)
9. ☐ How many hours have you spent talking to users vs. coding in the last month?

## B. Insight and market

10. ☐ Why a stock simulator can't do this, and why financial-literacy courses can't.
11. ☐ Why hasn't a big edtech company done this?
12. ☐ A teacher says "my students can't code." What happens?
13. ☐ Why Black-Scholes? Is that a real skill or a curiosity?
14. ☐ How big is the market? Show the arithmetic and the sources.
15. ☐ $199 per club is small. How does this become a venture-scale company?
16. ☐ Which of your revenue rungs have any evidence behind them today?
17. ☐ Who actually controls the budget at a high school, and how long does a sale take?
18. ☐ Why would a finance firm sponsor seats? Have you talked to one?
19. ☐ What's the moat if the lessons are all just Python and math?
20. ☐ If a competitor copied this next week, what happens?

## C. Traction and metrics (answer with numbers only; blank until real)

21. ☐ Define activation and retention the way you measure them. (Metric glossary.)
22. ☐ Activation was X%, week-4 was Y%. Why not higher? What did you change?
23. ☐ How many capstones were submitted? Show me one.
24. ☐ How many leaders ran it without you? How do you know?
25. ☐ How many asked to run it again? How many referred another leader?
26. ☐ Who paid, how much, and how did you ask?
27. ☐ What's your support time per cohort, and is it falling?
28. ☐ Where did your students and leaders come from?
29. ☐ Tell me about a pilot that failed or a leader who said no. Why?

## D. Founder, commitment, team

30. ☐ Will you work on this full time? What happens to school? What do your parents think?
31. ☐ You're a high-school student. Can you legally sign contracts? Who does?
32. ☐ Why are you working alone? Who would you hire or recruit first?
33. ☐ Walk me through how you built this. How much did AI tools write, and what did you decide?
34. ☐ What's the hardest technical problem you solved?
35. ☐ What would make you quit?
36. ☐ What would you do with the first $500k?
37. ☐ Why are you the right person to build this?

## E. Trust, privacy, risk

38. ☐ You're handling minors' data. What do you collect, who can see it, and how do you delete it?
39. ☐ Are you FERPA/COPPA compliant? (Answer: what the docs say today, and that no compliance claim is made until a qualified review.)
40. ☐ What happens if a student posts something inappropriate in a capstone?
41. ☐ What happens if the Python runtime fails on a school network?
42. ☐ What if a school's IT blocks you?
43. ☐ What if Supabase or Vercel goes down during kickoff?
44. ☐ What stops a student from copying another's solution? Do you care?

## F. Strategy and pressure questions

45. ☐ What's the one thing that must be true for this to work, and how will you know by spring?
46. ☐ If you could only talk to 10 more leaders, who would they be?
47. ☐ Why six weeks? What would 4 or 12 change?
48. ☐ Would you do this if it only ever made $50k a year?
49. ☐ What's the best argument that you should not do this company?
50. ☐ What did you do last week that moved the main metric?

## Fact sheets for the questions the repo can answer

Verified against the repo on 2026-10-15. These are **facts to build your own answer from**, not scripts. Say them in your words. Where a fact is a weakness, say so first.

**#8 Show me the product.** Use `/demo?view=tour` (about 90 seconds) and `docs/yc/demo-script.md`. It plays labeled sample data; say so. Never present it as a real cohort.

**#33 How much did AI write?** A true answer must come from you. The repo shows what you *decided*: the cohort template and metric definitions (`docs/gtm/metric-glossary.md`), the proof thresholds, what was cut (no new tracks, no integrations) and the decision log (`docs/gtm/decision-log.md`). Be ready to explain any file in `src/lib/cohorts/`.

**#34 Hardest technical problem.** Candidate: running exercises in the browser with Pyodide so there is no install and no server-side code execution, then self-hosting the runtime so school filters that block CDNs don't break lessons. Evidence: `tests/python.spec.ts` passes with the CDN blocked and fails loudly (instead of hanging) with every source blocked.

**#38 Minors' data: what, who sees it, how to delete.** From `docs/trust/data-map.md` (live at `/trust`):
- Collected: email, an optional display name, and learning activity. No birth date, address, phone, school ID, photos, grades or location. 13 and up only.
- Leaders see display names, lesson counts, completion times, exercise code and capstones they explicitly open; **each capstone view is logged and shown to the student**. Leaders do not see emails.
- Delete: students delete their own account in Settings, immediately; every row cascades. Parent or school requests: 30 days (proposed; confirm before promising). Pilot data kept 12 months unless the school asks sooner (also proposed).
- Subprocessors: Supabase, Vercel, Sentry (account id only), Groq (tutor, no name or email), Stripe (not used in pilots), plus optional ones.

**#39 FERPA/COPPA compliant?** Say what the data map says: we minimize data and publish where it goes; **we make no compliance claim until a qualified reviewer says so** (plan Y6.4). Don't improvise past that.

**#40 Inappropriate content in a capstone.** Facts: capstones are private by default; the student must submit before sharing; share links are unlisted, show no name and die when sharing is turned off; the leader's views are logged. **Gap:** there is no automated moderation or report button today. Say so and say what you'd add first (`[NEEDS FOUNDER: your answer]`).

**#41 Python runtime fails on a school network.** The runtime is served from strikelab.dev, with jsDelivr as a backup. If everything is blocked, the Run button says so instead of hanging (tested). School allowlist: strikelab.dev and Supabase.

**#42 School IT blocks you.** Same plus the trust page, the data map and the pilot approval packet. Honest limit: no Google Workspace or Clever sign-in yet (build queue Q29, only if a paying district requires it).

**#43 Supabase or Vercel goes down during kickoff.** Honest answer: nothing in the repo fails over; lessons work offline from the browser's `localStorage`, but cohort pages and sign-up need both services. Mitigation today is rehearsal and the kickoff kit; a backup/restore drill (Y9.6) is still open.

**#44 A student copies another's solution.** Exercises are graded by unit tests; code is private to the student and leader. Nothing detects copying and the capstone is the real signal (it asks for a thesis and a reflection). `[NEEDS FOUNDER: do you care, and why?]`

**#47 Why six weeks?** The template is `quant-foundations-v1` (`src/lib/cohorts/template.ts`): 6 weeks, 12 lessons, break weeks allowed (up to 3). Founder's reason is `[NEEDS FOUNDER]`; the data to cite after cohorts run is week-4 retention and completion by cohort.

**#15 / #16 Venture scale.** Use `docs/yc/market-sizing.md`: licenses alone top out around $2.0M-$4.1M a year if every plausible school paid. Name the rung that has evidence (today: none beyond the price list).

## Partner follow-ups (the second question they ask)

| After | They will likely follow with |
|---|---|
| #3 Why would a school pay? | "Who signs the purchase order, and have you talked to them?" |
| #4 How many activated? | "Out of how many invited, and how many of those did you personally recruit?" |
| #6 Founder in the room? | "So it doesn't work without you yet?" |
| #10 Why not a simulator? | "Teachers already use HowTheMarketWorks and NGPF for free. What do they get from you that they can't get there?" |
| #15 $199 is small | "Which of the larger rungs have you tested, and what happened?" |
| #30 Full time? | "What if we say yes? When do you start?" |
| #33 AI wrote it? | "Then what is your edge if anyone can do that?" |
| #38 Minors' data | "Who has actually reviewed this? A lawyer? A school IT person?" |
| #45 The one thing that must be true | "What will you do if it isn't true by spring?" |

## How to run a mock interview (with the agent as the partner)

1. Pick 10 questions: 3 from A, 2 from C, 2 from D, 1 each from B, E, F. Ten minutes, spoken or typed, 30 seconds per answer.
2. The agent asks the question, waits, then asks **one** follow-up from the table above (or its own), as a skeptical partner: short, impatient, no praise during the round.
3. Afterwards the agent scores each answer on: *led with the answer*, *one specific example or number*, *named the weak spot first*, *under 30 seconds*, *nothing unsourced*. It lists the two weakest and the likely follow-up you didn't prepare for.
4. You rewrite the two weakest, then record the round in the log below. Keep the status key at the top current (☐ → ◐ → ☑).
5. At least 3 of the 10 official mock interviews must be with real people who have started companies (plan Y8.6).

To start one, say "mock interview" in a session.

## Mock interview log

| Date | With | Weakest answers (question #) | Fix |
|---|---|---|---|
| | | | |
