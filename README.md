# σ StrikeLab

**Browser-based options pricing education for high schoolers.**

StrikeLab teaches quantitative finance by having students *build* the engine — not just read about it. Work through five focused lessons on Black-Scholes and the Greeks, implement the pricing functions yourself in the in-browser Python playground, and watch the Greek curves update live.

Live site → **[strikelab-olive.vercel.app](https://strikelab-olive.vercel.app)**

---

## What's inside

| Surface | What it does |
|---|---|
| **Lesson track** | 5 lessons: intrinsic value → put-call parity → Black-Scholes → Delta → Theta. Each ends with a coding exercise that runs in your browser via Pyodide (no install). |
| **Pricing playground** | A CodeMirror editor pre-loaded with a partial Black-Scholes engine. Implement `compute_delta`, `compute_gamma`, `compute_theta`, and `compute_vega`, click Run, and see all four Greek curves render live. |
| **Real-time charts** | Recharts visualisations of Δ, Γ, Θ, ν as functions of strike price. Sweep stock price, time-to-expiry, risk-free rate, and volatility with live sliders. |

---

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Pyodide** — WebAssembly Python runtime, runs entirely in the browser
- **CodeMirror 6** via `@uiw/react-codemirror`
- **Recharts** for Greek visualisations
- **Electron** for desktop packaging (optional)
- **EB Garamond** + **JetBrains Mono** for the LaTeX-inspired typographic style

---

## Running locally

```bash
npm install
npm run dev          # Next.js dev server at localhost:3000
npm run electron:dev # Electron desktop app (opens alongside dev server)
```

Building a Windows installer:

```bash
npm run electron:build
```

---

## The pricing engine

`public/pricing_engine.py` contains the full Black-Scholes implementation. Delta and Theta are left as `raise NotImplementedError` stubs — filling them in is the core exercise.

**Solutions:**

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

---

## Why this exists

Quant finance is gatekept behind elite university networks. Students at top prep schools get exposure through alumni pipelines; everyone else finds it junior year of college — four years too late. StrikeLab is the fastest path from "what is a call option?" to implementing Black-Scholes and computing the Greeks, for free, in a browser.

Built for the **Creator Colosseum Startup Competition** (ages 13–18).
