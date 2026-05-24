export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export const QUIZZES: Record<string, QuizQuestion[]> = {
  "1": [
    {
      question: "What is the maximum loss for an option buyer?",
      options: [
        "The full stock price S",
        "The premium paid",
        "The strike price K",
        "Unlimited — losses have no cap",
      ],
      correct: 1,
      explanation:
        "The option buyer's downside is capped at the premium paid. Unlike owning stock outright, there is no further loss beyond that initial cost.",
    },
    {
      question: "A call with K = 100 and S = 115 at expiration has intrinsic value of:",
      options: ["$0", "$5", "$15", "$115"],
      correct: 2,
      explanation:
        "Intrinsic value for a call = max(S − K, 0) = max(115 − 100, 0) = $15. The option is in-the-money by $15.",
    },
    {
      question: "Which exercise style allows the holder to exercise at any time before expiration?",
      options: ["European", "Asian", "American", "Bermuda"],
      correct: 2,
      explanation:
        "American-style options can be exercised at any time up to and including the expiration date. Most equity options traded on U.S. exchanges are American-style.",
    },
  ],

  "2": [
    {
      question: "Put-call parity states that C − P equals:",
      options: [
        "K − S",
        "S − K · e^(−rT)",
        "K · e^(−rT) − S",
        "S + K",
      ],
      correct: 1,
      explanation:
        "C − P = S − K · e^(−rT), where K · e^(−rT) is the present value of the strike. The equation links calls, puts, the stock, and a risk-free bond through no-arbitrage.",
    },
    {
      question: "If C = $8.50, S = $190, K = $190, T = 0.25yr, r = 5%, what should the put price be?",
      options: ["$8.50", "$6.14", "$2.36", "$14.64"],
      correct: 1,
      explanation:
        "P = C − S + K · e^(−rT) = 8.50 − 190 + 190 · e^(−0.05 × 0.25) ≈ 8.50 − 190 + 187.64 ≈ $6.14.",
    },
    {
      question: "Put-call parity holds because of:",
      options: [
        "The Black-Scholes model assumptions",
        "The no-arbitrage principle (law of one price)",
        "Historical volatility patterns",
        "The central limit theorem",
      ],
      correct: 1,
      explanation:
        "Parity requires zero assumptions about how stock prices move — it follows purely from the fact that two portfolios with identical future payoffs must cost the same today.",
    },
  ],

  "3": [
    {
      question: "Black-Scholes models stock price movements using:",
      options: [
        "Poisson jump processes",
        "Geometric Brownian Motion (GBM)",
        "Mean-reversion (Ornstein-Uhlenbeck)",
        "Discrete binomial steps",
      ],
      correct: 1,
      explanation:
        "GBM assumes log-returns are normally distributed, making stock prices log-normally distributed. The key property: prices can't go below zero and percentage changes are stationary.",
    },
    {
      question: "Risk-neutral pricing replaces the stock's true expected return μ with:",
      options: [
        "Volatility σ",
        "The risk-free rate r",
        "The strike price K",
        "Zero",
      ],
      correct: 1,
      explanation:
        "Under continuous delta-hedging, the drift μ cancels out of the pricing equation. You price the option as if the stock grows at r — the expected return doesn't matter!",
    },
    {
      question: "In the Black-Scholes formula, N(d₂) represents:",
      options: [
        "The option's delta",
        "Risk-neutral probability the option expires in-the-money",
        "The gamma of the option",
        "The hedge ratio in units of shares",
      ],
      correct: 1,
      explanation:
        "N(d₂) is the risk-neutral probability that S_T > K at expiration — the probability you'll end up paying the strike. N(d₁) is the delta and is slightly larger due to the log-normal skew.",
    },
  ],

  "4": [
    {
      question: "A European call option delta is always:",
      options: [
        "Between −1 and 0",
        "Between 0 and 1",
        "Greater than 1 for deep ITM options",
        "Equal to N(d₂)",
      ],
      correct: 1,
      explanation:
        "Call delta = N(d₁), which always lies between 0 and 1. Deep OTM calls have Δ ≈ 0 (almost no directional exposure); deep ITM calls have Δ ≈ 1 (behave like stock).",
    },
    {
      question: "Delta is approximately equal to the probability that the option will:",
      options: [
        "Increase in price by tomorrow",
        "Expire in-the-money",
        "Double in value before expiry",
        "Have positive gamma at expiry",
      ],
      correct: 1,
      explanation:
        "Delta ≈ N(d₁) ≈ N(d₂), the risk-neutral ITM probability. An ATM option with Δ ≈ 0.50 has roughly a 50/50 chance of expiring in-the-money.",
    },
    {
      question: "A market maker who sold calls delta-hedges by:",
      options: [
        "Selling the underlying stock proportional to delta",
        "Buying the underlying stock proportional to delta",
        "Selling more calls to neutralize",
        "Buying puts with the same strike",
      ],
      correct: 1,
      explanation:
        "A short call has negative delta (loses when stock rises). The hedge is to buy Δ × shares of the underlying, creating a delta-neutral position that doesn't move for small stock changes.",
    },
  ],

  "5": [
    {
      question: "Theta for a long call or long put position is almost always:",
      options: [
        "Positive — options gain value each day",
        "Zero — only intrinsic value matters",
        "Negative — options lose time value each day",
        "Equal to delta in absolute value",
      ],
      correct: 2,
      explanation:
        "Long options have negative theta. Each passing day, with the stock unchanged, the option loses extrinsic (time) value. Option buyers are in a race against the clock.",
    },
    {
      question: "Time decay accelerates as expiration approaches because:",
      options: [
        "Implied volatility increases near expiry",
        "The rate of change of √T blows up as T → 0",
        "Gamma becomes zero at expiry",
        "Interest rate sensitivity increases",
      ],
      correct: 1,
      explanation:
        "Time value ≈ σ√T. The derivative d(√T)/dt = 1/(2√T) → ∞ as T → 0. Half of an ATM option's time value evaporates in the final 25% of its life.",
    },
    {
      question: "Which options experience the most negative theta (fastest time decay)?",
      options: [
        "Deep in-the-money options",
        "Deep out-of-the-money options",
        "At-the-money options",
        "Long-dated options with low volatility",
      ],
      correct: 2,
      explanation:
        "ATM options have the maximum extrinsic value, which is what theta erodes. Deep ITM and deep OTM options have very little extrinsic value left to decay — the real 'meat' is in ATM.",
    },
  ],

  "6": [
    {
      question: "Gamma is highest for which options?",
      options: [
        "Deep ITM options with long time to expiry",
        "Deep OTM options regardless of expiry",
        "ATM options close to expiration",
        "Long-dated ATM options",
      ],
      correct: 2,
      explanation:
        "Near expiry, an ATM option's delta changes most violently — a $1 move can flip the option from nearly worthless to almost certain to expire ITM. This rapid delta change is high gamma.",
    },
    {
      question: "Gamma is always __ for both long calls and long puts:",
      options: [
        "Negative — you always lose money on moves",
        "Zero at expiration",
        "Positive — you benefit from large moves either way",
        "Equal to delta squared",
      ],
      correct: 2,
      explanation:
        "Positive gamma means your delta improves favorably no matter which direction the stock moves. Long calls: delta rises when stock rises. Long puts: delta falls (less negative) when stock falls.",
    },
    {
      question: "In the Black-Scholes PDE, theta and gamma have:",
      options: [
        "The same sign and equal magnitudes",
        "No direct mathematical relationship",
        "Opposite signs — you can't have positive gamma without negative theta",
        "Identical values for ATM options",
      ],
      correct: 2,
      explanation:
        "Θ ≈ −½σ²S²Γ for delta-hedged positions. They are proportional with opposite signs. You cannot get the benefit of positive gamma without paying the cost of negative theta — this is the central tension in options.",
    },
  ],

  "7": [
    {
      question: "Vega (ν) measures the option's sensitivity to:",
      options: [
        "Stock price changes",
        "The passage of time",
        "Changes in implied volatility",
        "Changes in the risk-free rate",
      ],
      correct: 2,
      explanation:
        "Vega = ∂V/∂σ. A call with ν = 0.40 gains $0.40 in value for every 1 percentage point increase in implied volatility, even if the stock doesn't move.",
    },
    {
      question: "Which options have the highest vega (most sensitive to vol changes)?",
      options: [
        "Deep OTM options with short time to expiry",
        "ATM options with long time to expiry",
        "Deep ITM options with short time to expiry",
        "ATM options with very short time to expiry (0DTE)",
      ],
      correct: 1,
      explanation:
        "Vega scales with √T and peaks at the ATM strike. Long-dated ATM options have the most uncertainty about their terminal value, making them maximally sensitive to vol changes.",
    },
    {
      question: "The CBOE VIX index measures:",
      options: [
        "7-day Dow Jones realized volatility",
        "30-day implied volatility on S&P 500 options",
        "1-year implied volatility on AAPL options",
        "Historical volatility over the past year",
      ],
      correct: 1,
      explanation:
        "VIX measures the market's 30-day implied volatility expectation for the S&P 500, derived from a portfolio of SPX options across many strikes. It's quoted as an annualized percentage.",
    },
  ],

  "8": [
    {
      question: "Implied volatility cannot be solved analytically because:",
      options: [
        "Black-Scholes has no closed-form solution",
        "There is no algebraic formula to invert σ from the option price",
        "You need historical data to compute it",
        "Implied vol requires Monte Carlo simulation",
      ],
      correct: 1,
      explanation:
        "Black-Scholes has no inverse for σ. We must solve f(σ) = BS(σ) − C_market = 0 numerically — typically using Newton-Raphson iteration, which converges in 4–6 steps.",
    },
    {
      question: "Historically, implied volatility has been __ subsequently realized volatility on average:",
      options: [
        "Below — options are systematically underpriced",
        "Equal — perfectly calibrated",
        "Above — the variance risk premium makes IV slightly elevated",
        "Completely unrelated to",
      ],
      correct: 2,
      explanation:
        "IV exceeds realized vol by roughly 1–3 percentage points on average. This 'variance risk premium' compensates option sellers for providing vol insurance and is why systematic option selling has historically been profitable.",
    },
    {
      question: "The equity volatility skew means that OTM puts trade at __ implied vol compared to ATM options:",
      options: [
        "Lower IV — puts are cheaper than calls",
        "Equal IV — same strike-vol mapping",
        "Higher IV — crash risk and demand for downside protection drive up put IV",
        "Unrelated IV — each option has its own model",
      ],
      correct: 2,
      explanation:
        "Investors pay a premium for portfolio protection (demand for OTM puts), and crashes are historically correlated with vol spikes (the leverage effect). Both push OTM put IV above ATM IV.",
    },
  ],

  "9": [
    {
      question: "A bull call spread is constructed by:",
      options: [
        "Buying two calls at different strikes, same expiry",
        "Buying a lower-strike call and selling a higher-strike call",
        "Selling a lower-strike call and buying a higher-strike call",
        "Buying a call and put at the same strike",
      ],
      correct: 1,
      explanation:
        "You buy the lower strike (more expensive, more ITM) and sell the higher strike (cheaper, less ITM) to offset cost. Profit is capped at K₂ − K₁ − net premium, loss is capped at the net premium paid.",
    },
    {
      question: "A long straddle (buy call + buy put at same strike) profits from:",
      options: [
        "The stock staying flat near the strike",
        "Large moves in either direction that exceed the combined premium",
        "Rising interest rates that increase call values",
        "Falling implied volatility after purchase",
      ],
      correct: 1,
      explanation:
        "A straddle is long vega and long gamma — it needs the stock to move far enough to cover the combined call + put premium. You're buying volatility and need it to materialize.",
    },
    {
      question: "Which strategy has the most positive theta (collects time decay fastest)?",
      options: [
        "Long straddle (buy call + put)",
        "Long call only",
        "Iron condor (short inner strangle + OTM wing hedges)",
        "Bull call spread",
      ],
      correct: 2,
      explanation:
        "An iron condor is short both a call spread and a put spread — you collect two premiums. You have maximum positive theta, but need the stock to stay inside your short strikes to keep it.",
    },
  ],
};
