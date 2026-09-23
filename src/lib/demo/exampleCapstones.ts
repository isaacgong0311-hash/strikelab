import type { CapstoneViewData } from "@/app/capstone/CapstoneView";

/**
 * Founder-written example capstones (decision log 2026-09-23). Shown on the
 * homepage and /demo, ALWAYS labeled "Example", until consented student work
 * exists. The option example's prices are computed by the code shown (and
 * re-checked in fixtures.test.ts); the backtest example says plainly that
 * its numbers are illustrative.
 */
export const EXAMPLE_CAPSTONES: (CapstoneViewData & { slug: string })[] = [
  {
    slug: "option-pricing",
    promptId: "option-pricing",
    title: "Is a 30-day SPY call fairly priced at 18% volatility?",
    thesis:
      "SPY trades at $521 and a 30-day $525 call is quoted around $9.70. Black-Scholes only matches that price at one volatility. Is that volatility believable, given how much SPY has actually moved?",
    code: `from math import erf, exp, log, sqrt

def N(x):
    return 0.5 * (1 + erf(x / sqrt(2)))

def bs_call(S, K, T, r, sigma):
    d1 = (log(S / K) + (r + sigma**2 / 2) * T) / (sigma * sqrt(T))
    d2 = d1 - sigma * sqrt(T)
    return S * N(d1) - K * exp(-r * T) * N(d2)

S, K, T, r = 521, 525, 30 / 365, 0.044
for sigma in (0.13, 0.18, 0.23):
    print(f"sigma={sigma:.2f}  call={bs_call(S, K, T, r, sigma):.2f}")`,
    resultSummary:
      "At 18% volatility the model gives $9.73, almost exactly the quoted price, so the market is implying about 18%. At 13% the call would be worth $6.75; at 23%, $12.70. A 5-point mistake in volatility moves the price by about $3, roughly 30%.\n\nIn this example, SPY's realized volatility over the last month was closer to 14%, so buyers would be paying for more movement than recently happened.",
    reflection:
      "Realized volatility looks backward and implied looks forward, so \"too expensive\" isn't proven: an earnings season or a Fed meeting inside the 30 days could justify it. Next I'd compare implied and realized volatility across a year of dates to see how often the premium pays off.",
    submittedAt: null,
  },
  {
    slug: "backtest",
    promptId: "backtest",
    title: "Does a 50/200-day moving-average crossover beat buying and holding?",
    thesis:
      "The \"golden cross\" rule says buy when the 50-day average rises above the 200-day and sell when it falls below. Does it beat simply holding the index, after I remove the ways a backtest can fool me?",
    code: `import numpy as np

def backtest(prices):
    fast = np.convolve(prices, np.ones(50) / 50, mode="valid")[150:]
    slow = np.convolve(prices, np.ones(200) / 200, mode="valid")
    px = prices[199:]
    # Trade on TOMORROW's return: no look-ahead
    signal = (fast > slow)[:-1]
    daily = np.diff(px) / px[:-1]
    strat = daily * signal
    sharpe = lambda r: r.mean() / r.std() * np.sqrt(252)
    return sharpe(strat), sharpe(daily)`,
    resultSummary:
      "Illustrative numbers for this example: over 20 years of an S&P 500 index fund, suppose the crossover's Sharpe ratio comes out at 0.52 versus 0.61 for buying and holding. A typical pattern: it sidesteps part of a crash like 2008 but misses the sharp rebounds after it, and those rebounds are where much of the return comes from.",
    reflection:
      "Testing on an index fund avoids survivorship bias (the index already includes companies that later failed), and trading on the next day's return avoids look-ahead. But I only tested one pair of window lengths. Trying many and reporting the best would be data snooping, so I'd pick windows on 2000–2012 and test once on 2013–2024.",
    submittedAt: null,
  },
];
