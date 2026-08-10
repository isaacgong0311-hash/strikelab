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

  // ─── Investing Fundamentals track ─────────────────────────────────────────

  "inv-1": [
    {
      question: "What does owning stock in a company give you?",
      options: [
        "A proportional claim on the company's assets and earnings",
        "A loan to the company that pays fixed interest",
        "The right to manage day-to-day company operations",
        "A guaranteed annual payment regardless of profit",
      ],
      correct: 0,
      explanation:
        "Stock represents fractional ownership — a proportional claim on the company's assets and earnings. As a shareholder, if the company earns profit, you own a slice of that profit, either as dividends or retained value.",
    },
    {
      question: "Market capitalization equals:",
      options: [
        "Total annual revenue of a company",
        "Share price × shares outstanding",
        "Total debt the company owes",
        "Net income × price-to-earnings ratio",
      ],
      correct: 1,
      explanation:
        "Market Cap = Share Price × Shares Outstanding. It's the market's current opinion of total company value — distinct from enterprise value, which also accounts for debt and cash.",
    },
    {
      question: "A stock with a high P/E ratio (e.g., 60×) suggests that investors:",
      options: [
        "Believe the company is likely to go bankrupt",
        "Expect minimal growth and want income through dividends",
        "Expect significant future earnings growth relative to today's earnings",
        "Are pricing the stock at exactly book value",
      ],
      correct: 2,
      explanation:
        "A high P/E means investors pay a large multiple of current earnings — they're pricing in strong future growth. It doesn't automatically mean overvalued; growth stocks often justify high P/E if growth materializes.",
    },
  ],

  "inv-2": [
    {
      question: "The bid-ask spread is best described as:",
      options: [
        "The stock's daily high-minus-low price range",
        "The annual fee charged by your brokerage",
        "The gap between the highest buy price and the lowest sell price — your transaction cost for immediate execution",
        "The difference between a stock's IPO price and current price",
      ],
      correct: 2,
      explanation:
        "Spread = Ask − Bid. When you submit a market order to buy, you pay the ask; when you sell, you receive the bid. The market maker captures this spread as compensation for providing liquidity.",
    },
    {
      question: "A limit order guarantees:",
      options: [
        "Execution speed — it fills immediately",
        "Your price — it executes only at your specified price or better",
        "Both price and execution — it always fills at your price",
        "Protection against all price gaps and slippage",
      ],
      correct: 1,
      explanation:
        "A limit order guarantees price but not execution. If the market never reaches your limit price, the order simply doesn't fill. For most deliberate purchases, limit orders are better than market orders.",
    },
    {
      question: "The S&P 500 index is:",
      options: [
        "A price-weighted index of 30 large U.S. companies",
        "An equal-weighted index of all NASDAQ-listed companies",
        "A market-cap weighted index of 500 large U.S. companies — the primary U.S. equity benchmark",
        "A government bond index maintained by the Federal Reserve",
      ],
      correct: 2,
      explanation:
        "The S&P 500 tracks 500 large U.S. companies weighted by market cap. It's the most important U.S. equity benchmark — used by index funds, options, and as the baseline for measuring manager performance.",
    },
  ],

  "inv-3": [
    {
      question: "Free Cash Flow (FCF) is calculated as:",
      options: [
        "Net income minus taxes paid",
        "Revenue minus cost of goods sold",
        "Operating cash flow minus capital expenditures",
        "EBITDA minus depreciation and amortization",
      ],
      correct: 2,
      explanation:
        "FCF = Operating Cash Flow − Capital Expenditures. It measures the cash available to return to shareholders or reinvest after maintaining and growing the asset base. Many investors consider FCF the ultimate measure of business quality.",
    },
    {
      question: "Why do analysts add back depreciation and amortization to get EBITDA?",
      options: [
        "Depreciation is an illegal accounting charge under GAAP",
        "D&A are non-cash expenses — adding them back reveals operating cash earnings",
        "It inflates reported profits to attract investors",
        "D&A represents future cash the company will spend next year",
      ],
      correct: 1,
      explanation:
        "Depreciation and amortization are accounting entries that reduce net income but don't represent actual cash leaving the business. EBITDA adds them back to approximate cash-based operating earnings, enabling better cross-company comparisons.",
    },
    {
      question: "Net income growing faster than operating cash flow is:",
      options: [
        "Always a strong positive signal — the company is highly profitable",
        "Expected and normal for all technology companies",
        "A potential red flag — earnings may be manipulated since cash is harder to fake",
        "Required by SEC accounting rules for growing companies",
      ],
      correct: 2,
      explanation:
        "Net income can be managed through accounting choices (revenue recognition timing, write-offs). Cash flows are much harder to fake. When income consistently outpaces operating cash flow, it can signal aggressive accounting or deteriorating collections.",
    },
  ],

  "inv-4": [
    {
      question: "Enterprise Value (EV) is calculated as:",
      options: [
        "Share price × shares outstanding only",
        "Market cap + total debt − cash and cash equivalents",
        "Revenue × industry price-to-sales multiple",
        "Net income × the price-to-earnings ratio",
      ],
      correct: 1,
      explanation:
        "EV = Market Cap + Total Debt − Cash. It's the true 'acquisition price' of a company — if you bought it outright you'd assume its debt and receive its cash. EV is capital-structure neutral, making cross-company comparison more meaningful.",
    },
    {
      question: "Professionals often prefer EV/EBITDA over P/E because:",
      options: [
        "EV/EBITDA is simpler to compute from a stock ticker",
        "EV/EBITDA is capital-structure neutral and pre-tax, so it's more comparable across companies with different debt levels or tax jurisdictions",
        "P/E ratios change daily while EV/EBITDA is constant",
        "EV/EBITDA ignores revenue, making it a cleaner profitability measure",
      ],
      correct: 1,
      explanation:
        "P/E is affected by a company's leverage and tax situation — two companies with identical operations but different debt levels will have different P/Es. EV/EBITDA strips both out, letting you compare businesses on their fundamental economics.",
    },
    {
      question: "In a DCF model, terminal value typically accounts for what share of total value?",
      options: [
        "10–20% — the forecast period dominates",
        "Exactly 50% by construction",
        "60–80% — which is why small changes in growth or discount rate assumptions dramatically move the output",
        "100% — the forecast period FCFs are negligible",
      ],
      correct: 2,
      explanation:
        "Terminal value (capturing all cash flows beyond the explicit forecast period) routinely represents 60–80% of total DCF value. This is the root cause of 'garbage in, garbage out' DCF criticism — tiny changes in the terminal growth rate swing valuations enormously.",
    },
  ],

  "inv-5": [
    {
      question: "To annualize daily return volatility, you multiply the daily standard deviation by:",
      options: [
        "√365 — calendar days per year",
        "√252 — the standard convention using trading days per year",
        "√12 — months per year",
        "365 — a simple linear scaling",
      ],
      correct: 1,
      explanation:
        "There are ~252 trading days per year. Since variance scales linearly with time and standard deviation scales with the square root, annualized vol = daily vol × √252. This convention is universal across finance.",
    },
    {
      question: "The Sharpe ratio measures:",
      options: [
        "Total portfolio return over a calendar year",
        "Excess return earned per unit of volatility risk — a risk-adjusted return metric",
        "Maximum loss from peak to trough during a period",
        "Correlation between the portfolio and the S&P 500",
      ],
      correct: 1,
      explanation:
        "Sharpe = (R_portfolio − R_risk_free) / σ_portfolio. It normalizes return for risk, allowing fair comparison across strategies. A fund returning 12% with low volatility can have a higher Sharpe — and better risk-adjusted performance — than one returning 20% with extreme swings.",
    },
    {
      question: "Which type of risk can be largely eliminated through diversification?",
      options: [
        "Systematic (market) risk — driven by economy-wide factors like recessions",
        "Interest rate risk — changes in the Federal Reserve's policy rate",
        "Idiosyncratic (specific) risk — company-specific events like CEO scandals or product failures",
        "Inflation risk — the purchasing power erosion of returns",
      ],
      correct: 2,
      explanation:
        "Idiosyncratic risk is company-specific and diversifiable — random bad luck at one company is offset by good luck at another. Holding 20–50 uncorrelated stocks eliminates ~90% of it. Market risk (beta) affects all stocks simultaneously and cannot be diversified away.",
    },
  ],

  "inv-6": [
    {
      question: "Research shows that long-term portfolio performance is primarily driven by:",
      options: [
        "Individual stock selection — picking winners over losers",
        "Market timing — buying before rallies and selling before crashes",
        "Asset allocation — how you divide capital across stocks, bonds, and cash",
        "Choosing the right brokerage platform",
      ],
      correct: 2,
      explanation:
        "Studies (Brinson, Hood & Beebower) show asset allocation explains roughly 90% of long-term portfolio return variability. Whether you hold Apple or Microsoft matters far less than whether you're 80% equities vs. 50% equities.",
    },
    {
      question: "$10,000 invested at 10%/year for 40 years grows to approximately:",
      options: [
        "$67,000 — modest but steady",
        "$174,000 — reasonable long-run growth",
        "$452,000 — the power of compounding over four decades",
        "$1,200,000 — exponential blowup",
      ],
      correct: 2,
      explanation:
        "$10,000 × (1.10)^40 ≈ $452,593. Compounding over 40 years turns $10K into nearly half a million. Starting at 18 instead of 28 — just 10 extra years — roughly doubles your ending wealth. Time is the most powerful investing variable.",
    },
    {
      question: "Annual portfolio rebalancing mechanically enforces:",
      options: [
        "Concentrating capital into your best-performing assets",
        "Buying low and selling high — without emotional decision-making",
        "Maximizing trading frequency to capture more opportunities",
        "Reducing equity exposure as you age, regardless of returns",
      ],
      correct: 1,
      explanation:
        "When equities surge and drift above your target weight, rebalancing sells some (high) to buy what lagged (low). This systematic process enforces buy-low-sell-high discipline automatically — removing emotion from one of investing's hardest behaviors.",
    },
  ],

  "inv-7": [
    {
      question: "When market interest rates rise, the price of an existing fixed-rate bond:",
      options: [
        "Rises, since higher rates mean the issuer earns more",
        "Falls, since new bonds now pay more and the old bond's fixed coupon is less attractive by comparison",
        "Stays the same — only newly issued bonds are affected",
        "Falls to zero immediately",
      ],
      correct: 1,
      explanation:
        "A bond's price adjusts so its yield stays competitive with what's newly available. If rates rise and your bond still pays its old, lower coupon, its price has to drop until the yield a new buyer would get catches up.",
    },
    {
      question: "A 30-year Treasury bond is more sensitive to a change in interest rates than a 6-month T-bill because:",
      options: [
        "Longer-maturity bonds have more future coupon payments getting repriced by the rate change",
        "The 30-year bond has a lower credit rating",
        "T-bills are not affected by interest rates at all",
        "The 30-year bond pays no coupon",
      ],
      correct: 0,
      explanation:
        "This is duration: the longer the time to maturity, the more future cash flows there are to discount at the new rate, so the price swings further for the same change in yield.",
    },
    {
      question: "A bond trading below its face value (a \"discount\") most likely means:",
      options: [
        "The issuer has already defaulted",
        "The bond's coupon rate is below the current market yield",
        "The bond has no maturity date",
        "The face value was miscalculated",
      ],
      correct: 1,
      explanation:
        "If the market yield is higher than the bond's fixed coupon, buyers won't pay full face value for those below-market payments — the price falls until the yield an new buyer earns matches the market.",
    },
  ],

  "inv-8": [
    {
      question: "The main difference between a Traditional and a Roth retirement account is:",
      options: [
        "Traditional accounts have no contribution limits",
        "Roth accounts only allow bond investments",
        "Whether you pay income tax before contributing (Roth) or when you withdraw in retirement (Traditional)",
        "Roth accounts can only be opened after age 30",
      ],
      correct: 2,
      explanation:
        "Traditional accounts give a tax deduction now and tax withdrawals later; Roth accounts skip the deduction now so that withdrawals — growth included — are entirely tax-free in retirement.",
    },
    {
      question: "A high schooler is often a good candidate for a Roth account because:",
      options: [
        "Roth accounts guarantee a higher return than Traditional accounts",
        "They're likely in the lowest tax bracket they'll ever be in, so paying tax now is comparatively cheap",
        "Minors are legally required to use Roth accounts",
        "Roth accounts have no investment risk",
      ],
      correct: 1,
      explanation:
        "Roth tends to win when your tax bracket later is higher than it is today. A first job's income usually sits in the lowest bracket someone will ever be in, making the \"pay tax once, cheaply, now\" trade favorable.",
    },
    {
      question: "An employer 401(k) match is often called the best guaranteed return in investing because:",
      options: [
        "It's the only investment with zero risk of any kind",
        "The match adds free money the instant you contribute, before the funds are even invested",
        "Employer contributions grow faster than personal ones",
        "It's not actually guaranteed — it's a marketing term",
      ],
      correct: 1,
      explanation:
        "A 50% match, for example, means every dollar contributed instantly becomes $1.50 before any market return is even involved — an immediate, guaranteed gain no stock pick or strategy can match.",
    },
  ],

  "inv-9": [
    {
      question: "Research on market timing generally shows that investors who try to dodge downturns by moving to cash:",
      options: [
        "Reliably improve their long-run returns",
        "Often miss the market's best days, which tend to cluster near its worst ones, damaging long-run returns",
        "Have no measurable difference in outcome versus staying invested",
        "Always time it correctly if they use technical analysis",
      ],
      correct: 1,
      explanation:
        "A large share of the market's long-run return comes from a small number of days each year, and those days often arrive amid the same volatility that scares people into selling — so missing them while trying to avoid a crash can cost more than the crash itself.",
    },
    {
      question: "A 1% annual expense ratio, compared to a 0.03% index fund, mainly matters because:",
      options: [
        "It's illegal to charge more than 0.05% in most states",
        "Compounded over decades, even a small fee gap creates a large dollar gap in ending wealth",
        "Funds with higher fees are always fraudulent",
        "It only affects returns in the fund's first year",
      ],
      correct: 1,
      explanation:
        "The same compounding math that grows wealth also compounds a fee against you. A 1-point annual gap, held for decades, routinely adds up to tens of thousands of dollars on an otherwise identical investment.",
    },
    {
      question: "\"This is a great company\" and \"this is a good investment\" are different questions because:",
      options: [
        "Great companies never go public",
        "A company's quality can already be fully priced in, making it a poor investment at today's price despite being an excellent business",
        "Only bad companies can be good investments",
        "Investment quality has nothing to do with the price paid",
      ],
      correct: 1,
      explanation:
        "Valuation exists precisely to separate these two questions. A wonderful business bought at too high a price can still be a bad investment — the price you pay determines the return you get, regardless of how good the underlying company is.",
    },
  ],

  // ─── Quant Investing track ─────────────────────────────────────────────────

  "q1": [
    {
      question: "The CAPM formula for a stock's expected return is:",
      options: [
        "E[R] = Rf + α (alpha plus risk-free rate)",
        "E[R] = Rf + β × (Rm − Rf)",
        "E[R] = β × Rm (beta times market return)",
        "E[R] = Rf × (1 + β)",
      ],
      correct: 1,
      explanation:
        "CAPM: E[R_i] = Rf + β × (Rm − Rf), where (Rm − Rf) is the equity risk premium (~5–6% historically). A stock with β = 1.5 and a 5% risk-free rate earns an expected return of 5% + 1.5 × 5% = 12.5%.",
    },
    {
      question: "A stock with β = 0.4 is described as:",
      options: [
        "Highly aggressive — it amplifies market swings",
        "Negatively correlated with the market",
        "Defensive — it moves less than the market and dampens portfolio swings",
        "Uncorrelated with the market (market-neutral)",
      ],
      correct: 2,
      explanation:
        "β < 1 means the stock moves less than the market. Utilities and consumer staples typically have β ≈ 0.4–0.7. They fall less in downturns (valuable protection) but also lag in rallies. CAPM predicts lower expected returns as compensation for lower risk.",
    },
    {
      question: "In a CAPM regression (R_stock = α + β × R_market + ε), alpha represents:",
      options: [
        "The slope — the stock's market sensitivity",
        "Returns above or below what beta alone would predict — the 'skill' component",
        "The risk-free rate built into the intercept",
        "The residual variance of returns",
      ],
      correct: 1,
      explanation:
        "Alpha is the y-intercept: returns unexplained by market exposure. CAPM theory says alpha should be zero in efficient markets. In practice, investors hunt for persistent positive alpha — but genuine alpha is rare and hard to distinguish from luck over typical timeframes.",
    },
  ],

  "q3": [
    {
      question: "Survivorship bias in backtesting means:",
      options: [
        "Only testing the strategy during market upturns when it performs best",
        "Testing on a universe that includes only stocks still trading today, ignoring companies that went bankrupt or were delisted",
        "Running the backtest for too short a historical period",
        "Using leverage in your backtest that wasn't available in practice",
      ],
      correct: 1,
      explanation:
        "If your data only contains today's S&P 500 constituents, you've excluded hundreds of companies that failed over the years. Your backtest is trained exclusively on survivors, producing an upward-biased return estimate that can't be replicated going forward.",
    },
    {
      question: "Look-ahead bias in a backtest occurs when:",
      options: [
        "You test too many strategy variations in the same dataset",
        "The trading signal uses information that was not actually available at the time the trade was placed",
        "You project returns too far into the future",
        "You test only during historical bear markets",
      ],
      correct: 1,
      explanation:
        "Example: using today's closing price to generate today's trading signal means you'd need a time machine to execute it. Realistic backtests use signals computed from data available before market open, then execute at next-day open.",
    },
    {
      question: "A backtest producing a Sharpe ratio above 3 almost certainly indicates:",
      options: [
        "A genuinely superior strategy ready for immediate live deployment",
        "Overfitting, look-ahead bias, or severely understated transaction costs",
        "The strategy only works on large-cap stocks",
        "The discount rate used was too conservative",
      ],
      correct: 1,
      explanation:
        "Elite live-trading strategies at top hedge funds target Sharpe of 1–2 after costs. Sharpe above 3 in a backtest is a near-certain red flag: the strategy is overfit to historical data, uses look-ahead bias, or ignores real bid-ask spreads and market impact.",
    },
  ],

  "q4": [
    {
      question: "The efficient frontier represents portfolios that:",
      options: [
        "Maximize leverage for a given level of expected return",
        "Maximize expected return for each level of risk, or equivalently minimize risk for each level of expected return",
        "Have the lowest possible tax liability in each return bracket",
        "Have portfolio beta exactly equal to 1.0",
      ],
      correct: 1,
      explanation:
        "Portfolios on the efficient frontier are 'Pareto optimal' — you cannot get more return without taking more risk, or reduce risk without sacrificing return. Any portfolio below the frontier is dominated: you could do better.",
    },
    {
      question: "The simple 1/N equal-weight portfolio often outperforms mean-variance optimization out-of-sample because:",
      options: [
        "Equal-weighting produces higher expected returns by construction",
        "Optimization relies on estimated parameters that contain errors, and equal-weighting sidesteps estimation error entirely",
        "Regulators require equal-weighting for institutional portfolios",
        "Optimization only works when you have more than 100 assets",
      ],
      correct: 1,
      explanation:
        "Markowitz optimization is extremely sensitive to tiny errors in estimated returns and covariances — and those estimates are always noisy. Equal-weighting avoids these errors by making no assumptions. Its naive simplicity becomes a strength out-of-sample.",
    },
    {
      question: "The covariance matrix becomes unstable and unreliable when:",
      options: [
        "All assets in the portfolio have high positive correlations",
        "You have more parameters to estimate than data observations — common with many assets and limited history",
        "All assets have the same expected return",
        "Interest rates are above 5%",
      ],
      correct: 1,
      explanation:
        "An n-stock covariance matrix has n(n+1)/2 unique parameters. A 50-stock portfolio needs 1,275 estimates, but with only 252 daily observations per year, the problem is vastly underdetermined. Ledoit-Wolf shrinkage and factor models regularize the matrix to improve out-of-sample stability.",
    },
  ],

};
