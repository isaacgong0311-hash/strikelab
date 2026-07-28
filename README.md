# StrikeLab

**Browser-based quantitative finance education for high schoolers.**

StrikeLab teaches options pricing by making students *build* the engine — not just read about it. Work through ten lessons from call/put basics to binomial trees, implement the pricing functions in an in-browser Python playground, and watch the Greek curves update live as you drag sliders.

Live → **[strikelab.dev](https://strikelab.dev)** · Free · Open source · MIT license

---

## Curriculum

| # | Lesson | Key concept |
|---|--------|-------------|
| 1 | Option Fundamentals | Calls, puts, strike price, expiration |
| 2 | Intrinsic & Time Value | Why options are worth more than their payoff |
| 3 | The Black-Scholes Model | Deriving intuition for the formula |
| 4 | The Greeks: Delta & Gamma | Directional exposure and its rate of change |
| 5 | The Greeks: Theta & Vega | Time decay and volatility sensitivity |
| 6 | Rho & the Full Picture | Interest rate sensitivity and the complete Greek surface |
| 7 | Put-Call Parity | The no-arbitrage relationship that ties it together |
| 8 | Implied Volatility | Inverting Black-Scholes with Newton-Raphson |
| 9 | Option Strategies | Spreads, straddles, and iron condors |
| 10 | Binomial Trees | Pricing American options via the CRR model |

Each lesson ends with a coding exercise. Students fill in missing functions in a real pricing engine, run unit tests in-browser, and see live charts update.

---

## Platform surfaces

| Surface | What it does |
|---------|-------------|
| **Lesson track** | Ten structured lessons, each ending with a Pyodide-powered coding exercise that runs directly in the browser — no install. |
| **Pricing playground** | A CodeMirror editor pre-loaded with a partial Black-Scholes engine. Implement `compute_delta`, `compute_gamma`, `compute_theta`, `compute_vega`, click Run, and all four Greek curves render live. |
| **Greek visualizer** | Recharts plots of Δ, Γ, Θ, ν as functions of strike price. Drag sliders for stock price (S), time to expiry (T), risk-free rate (r), and volatility (σ) to reshape the curves in real time. |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Code editor | CodeMirror 6 via `@uiw/react-codemirror` |
| Python runtime | [Pyodide](https://pyodide.org) — WebAssembly, runs entirely client-side |
| Charts | Recharts |
| Auth | Clerk |
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
```

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

Quant finance is gatekept behind elite university networks. Students at top schools get exposure through alumni pipelines; everyone else finds it junior year of college — four years too late. StrikeLab is the fastest path from "what is a call option?" to implementing Black-Scholes and computing all five Greeks, for free, in a browser.

> *Quant finance shouldn't require the right zip code.*
