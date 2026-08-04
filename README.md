# StrikeLab

**Browser-based quantitative finance education for high schoolers.**

StrikeLab teaches quant finance by making students *build* the engine — not just read about it. Work through 21 lessons across three tracks, from what a stock is to a working Black-Scholes engine to CAPM and backtesting, implement the pricing functions in an in-browser Python playground, and watch the Greek curves update live as you drag sliders.

Live → **[strikelab.dev](https://strikelab.dev)** · Free · Open source · MIT license

---

## Curriculum

Three tracks, 21 lessons, each ending with a coding exercise — students fill in missing functions in a real pricing engine, run unit tests in-browser, and see live charts update.

**Investing Fundamentals** (Beginner, 6 lessons) — stocks, markets, valuation, risk, and building a portfolio.

**Options Pricing** (Intermediate, 10 lessons):

| # | Lesson | Key concept |
|---|--------|-------------|
| 1 | What Is an Option? | Calls, puts, strike price, expiration |
| 2 | Put-Call Parity | The no-arbitrage relationship that ties it together |
| 3 | Black-Scholes Formula | Deriving intuition for the formula |
| 4 | Delta: Directional Exposure | How option value moves with the underlying |
| 5 | Theta: Time Decay | Why options lose value as expiration approaches |
| 6 | Gamma: Rate of Change of Delta | Directional exposure and its rate of change |
| 7 | Vega: Volatility Sensitivity | How option value responds to implied vol |
| 8 | Implied Volatility | Inverting Black-Scholes with Newton-Raphson |
| 9 | Option Strategies | Spreads, straddles, and iron condors |
| 10 | Binomial Trees | Pricing American options via the CRR model |

**Quant Investing** (Advanced, 5 lessons) — CAPM and beta, factor investing, backtesting, portfolio optimization, statistical arbitrage.

---

## Platform surfaces

| Surface | What it does |
|---------|-------------|
| **Lesson track** | 21 structured lessons across three tracks, each ending with a Pyodide-powered coding exercise that runs directly in the browser — no install. |
| **Pricing playground** | A CodeMirror editor pre-loaded with a partial Black-Scholes engine. Implement `compute_delta`, `compute_gamma`, `compute_theta`, `compute_vega`, click Run, and all four Greek curves render live. |
| **Greek visualizer** | Recharts plots of Δ, Γ, Θ, ν as functions of strike price. Drag sliders for stock price (S), time to expiry (T), risk-free rate (r), and volatility (σ) to reshape the curves in real time. |
| **Paper-trading sandbox** | $100,000 in simulated cash, options priced live with the same Black-Scholes engine from the lessons. |
| **Weekly challenges** | Time-boxed quant-interview-style problems, scored on correctness + elegance, with a live leaderboard. |
| **Dashboard** | XP, streaks, a full-year activity heatmap, per-difficulty stats, and 12 achievement badges. |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Code editor | CodeMirror 6 via `@uiw/react-codemirror` |
| Python runtime | [Pyodide](https://pyodide.org) — WebAssembly, runs entirely client-side |
| Charts | Recharts |
| Auth + database | Supabase (Postgres, auth, RLS) |
| Payments | Stripe |
| Deployment | Vercel |

---

## Running locally

```bash
npm install
npm run dev       # dev server at localhost:3000
npm run build     # production build
```

Environment variables (create `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PRO_PRICE_ID=...
STRIPE_SCHOOL_PRICE_ID=...
```

The app runs without any of these set — Supabase-backed features (auth, progress sync, sandbox) and Stripe checkout fall back to a clean disabled state instead of crashing.

---

## The pricing engine

The Black-Scholes formula for a call option:

```
C = S₀ · N(d₁) − K · e^(−rT) · N(d₂)

d₁ = [ln(S₀/K) + (r + σ²/2)·T] / (σ·√T)
d₂ = d₁ − σ·√T
```

In the playground, `black_scholes_call` and the helper functions (`_d1`, `_d2`, `_norm_cdf`, `_norm_pdf`) are pre-implemented. Students implement the four Greeks:

```python
def compute_delta(S, K, T, r, sigma, option_type="call"):
    d1 = _d1(S, K, T, r, sigma)
    return _norm_cdf(d1) if option_type == "call" else _norm_cdf(d1) - 1

def compute_gamma(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    return _norm_pdf(d1) / (S * sigma * math.sqrt(T))

def compute_theta(S, K, T, r, sigma, option_type="call"):
    d1, d2 = _d1(S, K, T, r, sigma), _d2(S, K, T, r, sigma)
    term1 = -S * _norm_pdf(d1) * sigma / (2 * math.sqrt(T))
    if option_type == "call":
        return (term1 - r * K * math.exp(-r * T) * _norm_cdf(d2)) / 365
    return (term1 + r * K * math.exp(-r * T) * _norm_cdf(-d2)) / 365

def compute_vega(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    return S * _norm_pdf(d1) * math.sqrt(T) / 100
```

Lesson 8 adds the Newton-Raphson implied volatility solver:

```python
def implied_vol(C_mkt, S, K, T, r, tol=1e-6, max_iter=100):
    sigma = 0.2
    for _ in range(max_iter):
        diff = black_scholes_call(S, K, T, r, sigma) - C_mkt
        if abs(diff) < tol:
            break
        sigma -= diff / compute_vega(S, K, T, r, sigma) * 0.01
    return sigma
```

---

## Why this exists

Quant finance is gatekept behind elite university networks. Students at top schools get exposure through alumni pipelines; everyone else finds it junior year of college — four years too late. StrikeLab is the fastest path from "what is a stock?" to implementing Black-Scholes, computing the Greeks, and backtesting a factor model, for free, in a browser.

> *Quant finance shouldn't require the right zip code.*
