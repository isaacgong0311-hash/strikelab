# Reddit Posts

---

## r/learnmath
**Title: I built a free browser-based options pricing curriculum for high schoolers (Black-Scholes from scratch)**

I'm a high school freshman. I got obsessed with quant finance last year and couldn't find anything that taught options pricing at my level — everything was either a grad textbook or a $50/mo adult MOOC.

So I built it: **StrikeLab** — 10 lessons that take you from "what is a call option" to implementing Black-Scholes, all five Greeks, implied vol via Newton-Raphson, and binomial trees for American options.

The format: each lesson ends with a coding exercise where you implement missing functions in a real Python pricing engine. Tests run instantly in-browser via Pyodide (no install). There's a live Greek visualizer where you drag sliders and watch Δ, Γ, Θ, ν update in real time.

Math prereqs: pre-calc + basic stats. No finance background assumed.

Free, open source, no install: **strikelabco.vercel.app**

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

10 lessons, each ending with a coding exercise (Python, runs in-browser via WebAssembly). Free, no install.

**strikelabco.vercel.app**

Would genuinely love feedback from this community — you're my exact target user.

---

## r/personalfinance / r/investing (lighter tone)
**Title: I'm a high school freshman and I built a free site that teaches options pricing properly (not the TikTok version)**

If you've ever tried to actually understand how options are priced — not just "delta is how much the option moves" but *why* the formula is what it is — most resources are either textbooks or expensive adult courses.

I built a free, browser-based curriculum that covers it properly: Black-Scholes derivation, all five Greeks with live visualizations, implied volatility, and binomial trees. Each lesson has a coding exercise where you implement the actual pricing functions.

No install, no cost: **strikelabco.vercel.app**

Built it because I wanted it to exist. Feedback welcome.
