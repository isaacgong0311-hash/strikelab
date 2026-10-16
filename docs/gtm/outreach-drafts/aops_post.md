# AoPS Forum Post
**Board: College Admissions / General Math / High School Math**
**Title: I built a free options pricing curriculum for math competition kids (Black-Scholes, Greeks, Pyodide)**

---

Hey AoPS,

I'm a freshman in high school. I qualified for AIME in 8th grade and last year I got obsessed with quant finance - specifically how options are actually priced mathematically.

The problem: every resource I found was either a grad-school textbook (assumes stochastic calculus) or a $50/month adult MOOC that wasn't built for me. So I built what I wanted to exist, and I've kept building on it since.

StrikeLab - strikelab.dev - free, browser-based, no install.

What it covers (23 lessons across three tracks):

**Investing Fundamentals** (9 lessons) - what is a stock, how markets work, reading financial statements, valuation, risk/return/diversification, building a portfolio, bonds and fixed income, retirement accounts and tax drag, common investing mistakes.

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

**Quant Investing** (3 lessons, more on the way) - CAPM and beta, backtesting a strategy, portfolio optimization. VaR/GARCH/Monte Carlo is on the roadmap.

The format:

Each lesson ends with a coding exercise. You get a partial Python pricing engine with raise NotImplementedError stubs. Your job is to implement the missing functions - compute_delta, compute_gamma, etc. Click Run and unit tests fire instantly in-browser via Pyodide (Python 3 compiled to WebAssembly). No server, no install.

There's also a Greek visualizer - drag sliders for S, K, T, r, and sigma and watch delta, gamma, theta, vega, and rho update live. And once you're through the pricing lessons, there's a $100k paper-trading sandbox - real ~90-ticker watchlist, options priced with the same engine, so you can trade against your own understanding instead of just reading about it.

Finish a track and you get a shareable, verifiable certificate - genuinely useful if you're building out a college application and want something concrete to point to. There's also a Discord webhook if your math club or study group wants lesson/track completions posted to your server automatically.

Why this might interest you specifically:

If you've done AMC/AIME, you already have the math for this. Black-Scholes involves log-normal distributions, partial derivatives, and the normal CDF - nothing you haven't seen. The implied vol solver is Newton-Raphson, which you probably know from calc. The binomial tree is just dynamic programming.

This is the fastest path I know from "what is a stock?" to implementing and understanding a full pricing engine, then trading against it.

It's free, and the source is public on GitHub if you want to see how the pricing engine works. Would love feedback from this community - you're basically my exact target user.

strikelab.dev
