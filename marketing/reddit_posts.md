# Reddit Posts

---

## r/learnmath
**Title: I built a free browser-based options pricing curriculum for high schoolers (Black-Scholes from scratch)**

I'm a high school freshman. I got obsessed with quant finance last year and couldn't find anything that taught options pricing at my level — everything was either a grad textbook or a $50/mo adult MOOC.

So I built it: **StrikeLab** — 23 lessons across three tracks (Investing Fundamentals → Options Pricing → Quant Investing) that take you from "what is a stock" to implementing Black-Scholes, all five Greeks, implied vol via Newton-Raphson, binomial trees for American options, and CAPM/backtesting/portfolio optimization.

The format: each lesson ends with a coding exercise where you implement missing functions in a real Python pricing engine. Tests run instantly in-browser via Pyodide (no install). There's a live Greek visualizer where you drag sliders and watch Δ, Γ, Θ, ν, ρ update in real time — and a $100k paper-trading sandbox if you want to actually use what you learned.

Finish a track and you get a shareable certificate (verifiable by URL, decent as a LinkedIn/résumé line) — not why I built it, but nice to have proof you actually did the math.

Math prereqs: pre-calc + basic stats. No finance background assumed.

Free, open source, no install: **strikelab.dev**

Happy to answer questions about how I built it or about the math.

---

## r/mathcompetitions / r/AIME
**Title: Built a free options pricing course that I think AMC/AIME people would actually enjoy**

If you've done AMC/AIME, you already have the math for Black-Scholes:

- Log-normal distributions → you've seen this
- Partial derivatives (the Greeks) → standard calc
- Newton-Raphson for implied vol → classic numerical method
- Binomial trees → essentially DP

The problem is nothing connects that math to what quant traders actually do. **StrikeLab** is my attempt at that bridge.

23 lessons across three tracks, each ending with a coding exercise (Python, runs in-browser via WebAssembly). Free, no install. There's also a $100k paper-trading sandbox once you're through the pricing lessons, so you can actually trade against the math instead of just reading about it.

If your study group or math club has a Discord, there's a one-click webhook in settings that auto-posts to your server when someone finishes a lesson, track, or unlocks an achievement — built it because that's how I'd actually want to see my own group's progress.

**strikelab.dev**

Would genuinely love feedback from this community — you're my exact target user.

---

## r/personalfinance / r/investing (lighter tone)
**Title: I'm a high school freshman and I built a free site that teaches options pricing properly (not the TikTok version)**

If you've ever tried to actually understand how options are priced — not just "delta is how much the option moves" but *why* the formula is what it is — most resources are either textbooks or expensive adult courses.

I built a free, browser-based curriculum that covers it properly: Black-Scholes derivation, all five Greeks with live visualizations, implied volatility, binomial trees, and — if you want to go further — CAPM and backtesting. Each lesson has a coding exercise where you implement the actual pricing functions, and there's a $100k paper-trading sandbox to try it for real (simulated money, real math). Finish a track and there's a verifiable certificate if you want a record of it.

No install, no cost: **strikelab.dev**

Built it because I wanted it to exist. Feedback welcome.

---

## r/algotrading / r/quant (sandbox-focused)
**Title: Built a paper-trading sandbox where every option is priced with the same Black-Scholes engine you can read/fork**

Not pitching a strategy — pitching the tooling. StrikeLab's sandbox gives you $100k in simulated cash to trade stocks, calls, and puts across ~90 real tickers. Every option is priced live off a TypeScript port of the exact Black-Scholes formula the platform's lessons teach you to implement yourself in Python — so the pricing isn't a black box, you can go read the source.

Built this on top of a free options-pricing curriculum I made for high schoolers (Black-Scholes, the Greeks, binomial trees, CAPM — 23 lessons total). The sandbox was the piece that was missing: somewhere to actually *use* the math with consequences, even simulated ones.

Source is public on GitHub if you want to see how the pricing engine works: strikelab.dev/sandbox — main site at strikelab.dev.
