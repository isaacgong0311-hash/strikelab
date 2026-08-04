# StrikeLab Paper-Trading Sandbox — STEMist Hacks IV Submission

**Live demo:** https://strikelab.dev/sandbox
**Repo:** https://github.com/isaacgong0311-hash/strikelab
**Track:** Best Overall

---

## Tagline

A paper-trading sandbox for StrikeLab — trade real options math against $100,000
in simulated cash, with an AI coach that explains every trade in plain English.

---

## What it does

The Paper-Trading Sandbox is a new feature on StrikeLab, a free, open-source quant
finance curriculum for high schoolers. It gives every signed-in user a persistent
$100,000 simulated cash account to trade stocks, calls, and puts across ~90 real
tickers spanning tech, financials, healthcare, consumer, energy, and major ETFs.

Every trade is priced live:
- **Stocks** move on a deterministic, seeded geometric Brownian motion walk —
  simulated, but statistically real, and stable enough that refreshing the page
  mid-session shows a consistent price rather than a random jump.
- **Options** are priced with a TypeScript port of the same Black-Scholes engine
  StrikeLab's lessons teach students to implement in Python — so the sandbox
  prices contracts with the exact math the platform already teaches.

Click **"✨ AI take on this trade"** on any position — open or proposed — and a
Groq-powered coach streams back a short, plain-English read on the trade's
risk/reward: moneyness, position sizing relative to the account, and a reminder
that it's a simulation, not financial advice.

Open a position, watch it mark-to-market live, close it, and the P&L books
back to your cash balance — a full round trip, backed by real Postgres tables
with row-level security so every user only ever sees their own account.

## Inspiration

StrikeLab already taught the theory — Black-Scholes, the Greeks, quant
investing — through interactive lessons and a live Python playground. What was
missing was a place to actually *use* what you learned with consequences (even
simulated ones). Reading a formula and watching a position you opened lose
money to time decay are very different kinds of understanding.

## How we built it

- **Frontend:** Next.js 16 (App Router) + React 19, a two-column order-ticket
  and portfolio UI styled to match StrikeLab's existing design system.
- **Pricing engine (`src/lib/pricing.ts`):** a from-scratch TypeScript port of
  Black-Scholes (verified against textbook reference values — S=K=100, T=1,
  r=5%, σ=20% → call ≈ $10.4506, put ≈ $5.5735, matched to 4 decimal places),
  plus a seeded mulberry32 PRNG driving a Box-Muller-sampled GBM price walk
  per symbol, reseeded once per UTC day for a consistent "live" feel without
  needing any real market-data API.
- **Backend:** three Supabase-backed API routes (`portfolio`, `execute`,
  `close`) following the app's existing `requireUser()` auth pattern, writing
  to three new Postgres tables (`sandbox_accounts`, `sandbox_positions`,
  `sandbox_trades`) with RLS policies scoped to `auth.uid()`.
- **AI coach:** a new `/api/ai/sandbox-insight` route reusing StrikeLab's
  existing Groq streaming infrastructure (`streamGroqChat`, `consumeAiQuota`)
  — the same plumbing that powers the platform's lesson tutor and code
  reviewer — so the sandbox's AI feature shares the same per-user daily
  budget and graceful-fallback behavior as the rest of the app.

## Challenges we ran into

- **Scoping the data source.** Real-time market data would have meant a new
  external API dependency, a key to provision, and a new failure surface —
  all on a same-day deadline. We chose a larger *simulated* universe (~90
  tickers, real names) over real data: it reads as "any stock" to a user
  while staying fully self-contained.
- **Merging into a moving codebase.** StrikeLab's `master` branch shipped a
  full palette/typography redesign and a new AI-tutor subsystem while this
  feature was in progress. Resolving that merge meant confirming every CSS
  custom property the sandbox depends on (`--grass`, `--ink`, `--font-mono`,
  etc.) survived the redesign under the same names, and renumbering a
  migration file that collided with one added independently on `master`.
- **Verifying without a screenshot.** Our browser tooling couldn't render
  visual screenshots during development, so every trade — buy, mark-to-market,
  close — was verified by reading actual API responses and network requests
  directly against production Supabase, not by eyeballing the UI.

## Accomplishments we're proud of

- A hand-verified, textbook-accurate options pricing engine reused across
  three separate surfaces (Python lessons, Playground, and now the sandbox).
- A full buy → mark-to-market → close round trip, verified live against
  production Supabase, not just a local mock.
- An AI feature that reuses existing infrastructure instead of bolting on a
  new one-off integration — same quota system, same streaming pattern,
  same fallback behavior as the rest of the platform.

## What we learned

Simulating a believable market without real data is its own small design
problem — the difference between a random walk and a *good* random walk is
whether it survives a page refresh looking consistent.

## What's next

- A weekly cohort challenge with a shared leaderboard (scoped out for time —
  see `supabase/migrations/` and the original design spec in
  `docs/superpowers/specs/`).
- Multi-leg option spreads (covered calls, straddles) beyond single-leg
  stock/call/put.
- Real market data as an opt-in "hard mode" once the simulated mode has
  proven the UX out.

## Built with

Next.js · React · TypeScript · Supabase (Postgres + Auth + RLS) · Groq
(Llama 3.3 70B) · Recharts · Vercel

---

## Judging-criteria self-check

| Criterion | How this submission addresses it |
|---|---|
| **Originality** | Reuses the team's own hand-built quant pricing engine instead of a payoff-diagram demo; AI coach is trade-specific, not a generic chatbot bolted on. |
| **Effort** | New pricing engine, 3 DB tables + RLS, 4 API routes, full UI, AI integration — all built and verified end-to-end in the hackathon window. |
| **Impact** | Ships to StrikeLab's existing free, open-source user base immediately — not a throwaway demo. |
| **Project Condition** | Verified live on production (strikelab.dev/sandbox): full trade round-trip, AI coach streaming a real response, no console/server errors. |
