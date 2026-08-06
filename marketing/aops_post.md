# AoPS Forum Post
**Board: College Admissions / General Math / High School Math**
**Title: I built a free options pricing curriculum for math competition kids (Black-Scholes, Greeks, Pyodide)**

---

Hey AoPS,

I'm a freshman in high school. I qualified for AIME in 8th grade and last year I got obsessed with quant finance - specifically how options are actually priced mathematically.

The problem: every resource I found was either a grad-school textbook (assumes stochastic calculus) or a $50/month adult MOOC that wasn't built for me. So I built what I wanted to exist, and I've kept building on it since.

StrikeLab - strikelab.dev - free, browser-based, no install.

What it covers (22 lessons across three tracks):

**Investing Fundamentals** (6 lessons) - stocks, markets, reading financial statements, valuation, risk and diversification, building a portfolio.

**Options Pricing** (11 lessons):
1. Option fundamentals - calls, puts, strike, expiry
2. Put-call parity (the no-arbitrage proof)
3. Black-Scholes derivation (intuition, not measure theory)
4. Delta
5. Theta
6. Gamma
7. Vega
8. Implied volatility via Newton-Raphson
9. Option strategies (spreads, straddles, iron condors - with an interactive payoff diagram)
10. Binomial trees and American option pricing (CRR model - with a clickable lattice visualizer)
11. Rho and the full Greek surface

**Quant Investing** (5 lessons) - CAPM and beta, factor investing, backtesting, portfolio optimization, statistical arbitrage.

The format:

Each lesson ends with a coding exercise. You get a partial Python pricing engine with raise NotImplementedError stubs. Your job is to implement the missing functions - compute_delta, compute_gamma, etc. Click Run and unit tests fire instantly in-browser via Pyodide (Python 3 compiled to WebAssembly). No server, no install.

There's also a Greek visualizer - drag sliders for S, K, T, r, and sigma and watch delta, gamma, theta, vega, and rho update live. And once you're through the pricing lessons, there's a $100k paper-trading sandbox - real ~90-ticker watchlist, options priced with the same engine, so you can trade against your own understanding instead of just reading about it.

Why this might interest you specifically:

If you've done AMC/AIME, you already have the math for this. Black-Scholes involves log-normal distributions, partial derivatives, and the normal CDF - nothing you haven't seen. The implied vol solver is Newton-Raphson, which you probably know from calc. The binomial tree is just dynamic programming.

This is the fastest path I know from "what is a stock?" to implementing and understanding a full pricing engine, then trading against it.

It's free and open source (MIT). Would love feedback from this community - you're basically my exact target user.

strikelab.dev
