# AoPS Forum Post
**Board: College Admissions / General Math / High School Math**
**Title: I built a free options pricing curriculum for math competition kids (Black-Scholes, Greeks, Pyodide)**

---

Hey AoPS,

I'm a freshman in high school. I qualified for AIME in 8th grade and last year I got obsessed with quant finance - specifically how options are actually priced mathematically.

The problem: every resource I found was either a grad-school textbook (assumes stochastic calculus) or a $50/month adult MOOC that wasn't built for me. So I spent the last six months building what I wanted to exist.

StrikeLab - strikelab.dev - free, browser-based, no install.

What it covers (10 lessons):

1. Option fundamentals - calls, puts, strike, expiry
2. Intrinsic and time value
3. Black-Scholes derivation (intuition, not measure theory)
4. Delta and Gamma
5. Theta and Vega
6. Rho and the full Greek surface
7. Put-call parity (the no-arbitrage proof)
8. Implied volatility via Newton-Raphson
9. Option strategies (spreads, straddles, iron condors)
10. Binomial trees and American option pricing (CRR model)

The format:

Each lesson ends with a coding exercise. You get a partial Python pricing engine with raise NotImplementedError stubs. Your job is to implement the missing functions - compute_delta, compute_gamma, etc. Click Run and unit tests fire instantly in-browser via Pyodide (Python 3 compiled to WebAssembly). No server, no install.

There's also a Greek visualizer - drag sliders for S, K, T, r, and sigma and watch delta, gamma, theta, and vega update live.

Why this might interest you specifically:

If you've done AMC/AIME, you already have the math for this. Black-Scholes involves log-normal distributions, partial derivatives, and the normal CDF - nothing you haven't seen. The implied vol solver is Newton-Raphson, which you probably know from calc. The binomial tree is just dynamic programming.

This is the fastest path I know from "what is a call option?" to implementing and understanding the full pricing engine.

It's free and open source (MIT). Would love feedback from this community - you're basically my exact target user.

strikelab.dev
