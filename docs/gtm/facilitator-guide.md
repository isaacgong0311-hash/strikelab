# Quant Foundations Lab — Facilitator Guide

> The class page shows this guide's current week (goal, meeting shape, prompts, watch-outs) with a ready-to-send message, from `src/lib/cohorts/facilitator.ts`. Keep the two in step.

For the club leader or teacher running the pilot. No finance or coding background required — you're facilitating discussion and accountability, not teaching the material line by line. The platform teaches; you keep the room moving and keep students unstuck.

**Format:** one 45–60 minute meeting per week, six weeks, in person or virtual. Independent work between meetings is optional but recommended (15–30 minutes).

**Every meeting follows the same shape:**

1. **5 min — check-in.** Who got stuck, who finished early, any blockers.
2. **30–45 min — work + discussion.** Students work through the week's lessons (individually or paired); you circulate with the discussion prompts below.
3. **5 min — closing check-in.** The week's closing question, said out loud, one student at a time or in small groups.

You don't need to solve every student's stuck point yourself — "what have you tried, and what does the error say" gets most people unstuck. If more than a third of the room is stuck on the same thing, stop and walk through it together.

---

## Week 1 — Markets and risk

**Lessons:** *What Is a Stock?* (`inv-1`) · *How Markets Work* (`inv-2`) · *Risk, Return, and Diversification* (`inv-5`)

**Objective:** everyone leaves with one correct answer to "why would anyone hold more than one stock?"

**Discussion prompts:** What does it actually mean to own a share? Who's on the other side of every trade? Why doesn't "put everything in the stock you're most sure about" work?

**Expected output:** every student completes all three lessons; most students can state the diversification argument in their own words.

**Common failure points:** treating market cap and stock price as the same thing; confusing volatility with "risk of losing everything."

---

## Week 2 — Options and payoffs

**Lessons:** *What Is an Option?* (`1`) · *Put-Call Parity* (`2`)

**Objective:** students can read a payoff diagram and explain why a bad options price creates a risk-free trade (arbitrage).

**Discussion prompts:** What's the difference between a right and an obligation? If a call is overpriced relative to put-call parity, what trade makes free money — and why does that trade eventually correct the price?

**Expected output:** every student completes both lessons and can sketch a call payoff diagram from memory.

**Common failure points:** mixing up "long a call" with "short a put"; forgetting that premium paid is a sunk cost that shifts the breakeven, not the payoff shape.

---

## Week 3 — Pricing

**Lessons:** *Black-Scholes Formula* (`3`)

**Objective:** students implement Black-Scholes in code and get a price that matches the reference answer.

**Discussion prompts:** Which input matters most to the price — and why does volatility, something nobody can directly observe, drive so much of it?

**Expected output:** every student's implementation passes the lesson's automated check.

**Common failure points:** using volatility as a percentage (5) instead of a decimal (0.05); mixing up `d1`/`d2` in the formula.

---

## Week 4 — Risk sensitivities

**Lessons:** *Delta* (`4`) · *Theta* (`5`) · *Gamma* (`6`) · *Vega* (`7`)

**Objective:** divide these four lessons across students or pairs; each explains their Greek to the group in one sentence plus a real-world analogy.

**Discussion prompts:** If you're short a call, which Greek should worry you the most as expiration approaches? Why do market makers care about gamma even when delta is hedged to zero?

**Expected output:** every student completes their assigned Greek(s); the group can state, without looking, what each of the four measures.

**Common failure points:** this is the densest week — expect it to run long. It's fine to spread it across the meeting and a homework block instead of finishing live.

---

## Week 5 — Research discipline

**Lessons:** *Backtesting a Strategy* (`q3`)

**Objective:** students can name look-ahead bias and survivorship bias and point to where their own backtest could have either.

**Discussion prompts:** What's wrong with testing a strategy on the same data you used to design it? Why would only testing on companies that still exist today make any strategy look better than it is?

**Expected output:** every student completes the lesson and can state one flaw an outside reviewer might find in their own backtest.

**Common failure points:** conflating "backtested well" with "will work going forward" — this is the week to be openly skeptical of good-looking results.

---

## Week 6 — Capstone

**Lesson:** *Portfolio Optimization* (`q4`), plus the capstone: students pick a prompt (price an option and defend the volatility, backtest a strategy honestly, or their own question) and submit from their cohort home. Submissions show on your class scorecard, and you can open each one. They stay private unless the student creates a share link.

**Objective:** each student (or team) presents a model or strategy: what question they asked, what they built, what they found, and what they'd do with another week.

**Format:** 3–5 minutes per student/team, informal — this is a share-out, not a defense in front of a panel.

**Expected output:** every student presents something, even if the result is "it didn't work, and here's why" — a clearly explained failure is a better capstone than a vague success.

**Closing for the pilot, not just the week:** ask each student what they'd want to build next if the program kept going. This is the seed of next term's recruiting pitch and of the leader's end-of-pilot feedback.

---

## After week 6

- Run the end-of-pilot interview with the leader (see `interview-log.csv`) — reuse and payment willingness go here, not into the scorecard as a guess.
- Interview at least five students.
- Export the cohort CSV (activation, weekly activity, retention, capstones) from the class page for your own records.
