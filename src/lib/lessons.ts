export interface SandboxVariable {
  key: string;
  label: string;
  unit?: string;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
}

/**
 * A "try it" widget dropped inline, right after the section that introduces
 * its formula — build intuition by playing with real numbers, rather than
 * only testing recall (Checkpoint) or requiring the full coding exercise at
 * the end. `afterSectionId` matches a slugified <h2> id from the lesson's
 * table of contents (see src/lib/lessonToc.ts).
 *
 * `computeId` keys into the registry in FormulaSandbox.tsx rather than
 * holding an actual function — this data flows from a Server Component
 * (the lesson page) into a Client Component prop, and functions can't cross
 * that boundary (they're not serializable).
 */
export interface FormulaSandboxConfig {
  afterSectionId: string;
  title: string;
  formula: string;
  variables: SandboxVariable[];
  computeId: string;
  resultLabel: string;
  resultPrefix?: string;
  resultSuffix?: string;
  decimals?: number;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  content: string; // markdown-like HTML string
  sandboxes?: FormulaSandboxConfig[];
  exercise: {
    prompt: string;
    starterCode: string;
    solution: string;
    testFn: string; // Python code that calls the function and asserts correctness
  };
}

export const LESSONS: Lesson[] = [
  {
    id: "1",
    title: "What Is an Option?",
    subtitle: "Calls, puts, and why they exist",
    duration: "15 min",
    content: `
<h2>A 2,600-Year-Old Idea</h2>
<p>Options are not a modern invention. Around 600 BCE, the Greek philosopher Thales of Miletus predicted a bumper olive harvest based on his study of the stars. He didn't have money to buy olive presses outright, so he paid a small deposit to lock in the right to rent them at a fixed price when harvest season arrived. When his prediction proved correct and demand for presses surged, Thales exercised his right, rented the presses at the agreed price, and sublet them at the higher market rate, pocketing the difference. He had just traded the world's first recorded option.</p>
<p>The modern options market traces to April 26, 1973, when the Chicago Board Options Exchange (CBOE) opened for business — the same year Fischer Black and Myron Scholes published the formula we'll study in Lesson 3. Before the CBOE, options were traded informally between dealers, with no standardized terms and no central clearing. The CBOE introduced standardized contracts, public price quotes, and a clearinghouse that guaranteed both sides. Trading volume on day one: 911 contracts. Today, roughly <strong>40 million options contracts</strong> trade daily on U.S. exchanges alone.</p>

<h2>The Core Idea</h2>
<p>An option is a contract that gives its buyer the <strong>right, but not the obligation</strong>, to buy or sell an asset at a predetermined price on or before a specified date. Three terms define every option:</p>
<ul>
  <li><strong>Underlying (S):</strong> the asset the option is written on — most commonly a stock, but also an index, ETF, commodity, or currency.</li>
  <li><strong>Strike price (K):</strong> the price at which the option holder may buy or sell. Also called the exercise price.</li>
  <li><strong>Expiration date (T):</strong> the last date the option can be exercised. After this date it expires worthless if unexercised.</li>
</ul>
<p>The price paid for the option itself is the <strong>premium</strong>. This is the most the buyer can ever lose.</p>

<h2>Calls and Puts</h2>
<p>There are exactly two kinds of options:</p>
<ul>
  <li>A <strong>call option</strong> gives the holder the right to <em>buy</em> the underlying at the strike price. Calls profit when the underlying rises.</li>
  <li>A <strong>put option</strong> gives the holder the right to <em>sell</em> the underlying at the strike price. Puts profit when the underlying falls.</li>
</ul>
<p>Every option has two parties. The <strong>buyer</strong> (long) pays the premium and holds the right. The <strong>seller</strong> (short, or writer) collects the premium and takes on the obligation to fulfill the contract if the buyer exercises.</p>

<h2>A Concrete Example</h2>
<p>Suppose Apple (AAPL) is trading at $190. You believe it will rise before earnings next month. You buy one call option with:</p>
<ul>
  <li>Strike: $195</li>
  <li>Expiration: 30 days</li>
  <li>Premium: $4.50 per share</li>
</ul>
<p>One standard equity option contract covers <strong>100 shares</strong>, so you pay $450 total.</p>
<p><strong>Scenario A — AAPL rises to $210 at expiration:</strong> You exercise the call, buying 100 shares at $195 and immediately selling them at $210. Gross profit: $1,500. Subtract the $450 premium. Net profit: $1,050 — a 233% return on your $450 outlay.</p>
<p><strong>Scenario B — AAPL stays at $190 at expiration:</strong> The call expires worthless. You lose your entire $450 premium. The stock moved against you, but your maximum loss was capped at the premium — not the full $19,000 you'd have lost buying 100 shares.</p>
<p>This asymmetry is the fundamental appeal of options: <strong>limited downside, leveraged upside</strong>.</p>

<h2>American vs. European Options</h2>
<p>Options come in two exercise styles:</p>
<ul>
  <li><strong>American options</strong> can be exercised at any time before expiration. Most stock options traded on U.S. exchanges are American-style.</li>
  <li><strong>European options</strong> can only be exercised at expiration. Most index options (SPX, NDX) are European-style. The Black-Scholes formula we'll derive in Lesson 3 is technically for European options.</li>
</ul>
<p>The ability to exercise early is almost always worth something for put options (especially deep in-the-money puts) but rarely worth much for calls on non-dividend stocks. We'll revisit this in the Binomial Trees lesson.</p>

<h2>Intrinsic Value vs. Extrinsic Value</h2>
<p>An option's premium decomposes into two components:</p>
<ul>
  <li><strong>Intrinsic value</strong> is what you'd capture if you exercised right now. For a call: max(S − K, 0). For a put: max(K − S, 0). It can never be negative.</li>
  <li><strong>Extrinsic value</strong> (also called time value) is everything else. It reflects the probability that the option will gain more intrinsic value before expiry, driven by time remaining and volatility.</li>
</ul>
<p>Example: AAPL at $190, call with K = $185 trading at $9.00. Intrinsic value = $5.00. Extrinsic value = $4.00. An option always trades at or above intrinsic value — otherwise there's an immediate arbitrage.</p>

<h2>Moneyness</h2>
<p>Moneyness describes where the current stock price sits relative to the strike:</p>
<ul>
  <li><strong>In-the-money (ITM):</strong> the option has positive intrinsic value. Call: S &gt; K. Put: S &lt; K.</li>
  <li><strong>At-the-money (ATM):</strong> S ≈ K. Intrinsic value is approximately zero but extrinsic value is at its maximum for a given expiry.</li>
  <li><strong>Out-of-the-money (OTM):</strong> intrinsic value is zero. Call: S &lt; K. Put: S &gt; K. Pure time value — essentially a bet that the stock will move enough.</li>
</ul>
<p>Deep OTM options are cheap in absolute terms but highly leveraged. A $0.10 option that pays off $5 delivers a 50x return. They are also the most likely to expire worthless — over 70% of options held to expiration expire with zero value according to CBOE data.</p>

<h2>Why Options Exist</h2>
<p>Three legitimate uses drive the options market:</p>
<ol>
  <li><strong>Hedging:</strong> A portfolio manager owning 10,000 shares of Apple might buy puts to protect against a crash — paying a small premium to cap downside losses. This is portfolio insurance.</li>
  <li><strong>Speculation:</strong> Traders use options to express directional or volatility views with defined risk and high leverage.</li>
  <li><strong>Income generation:</strong> Shareholders sell covered calls against stock they own, collecting premium as income in exchange for capping their upside.</li>
</ol>
<p>Understanding which use case a trade serves is critical to evaluating whether it makes sense. The same instrument — a put option — can be portfolio insurance for a hedger, a speculative short bet for a directional trader, or a cash-secured income trade for a seller.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "intrinsic-value-vs-extrinsic-value",
        title: "Intrinsic Value (Call)",
        formula: "Intrinsic Value = max(Stock Price − Strike, 0)",
        variables: [
          { key: "price", label: "Stock price", unit: "$", defaultValue: 190, min: 50, max: 400, step: 1 },
          { key: "strike", label: "Strike price", unit: "$", defaultValue: 185, min: 50, max: 400, step: 1 },
        ],
        computeId: "intrinsicValueCall",
        resultLabel: "Intrinsic value",
        resultPrefix: "$",
        decimals: 2,
      },
    ],
    exercise: {
      prompt: "Implement `intrinsic_value(S, K, option_type)` that returns the intrinsic value of an option.",
      starterCode: `def intrinsic_value(S, K, option_type="call"):
    """
    Return the intrinsic value of an option.
    S = stock price, K = strike price
    For a call: max(S - K, 0)
    For a put:  max(K - S, 0)
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def intrinsic_value(S, K, option_type="call"):
    if option_type == "call":
        return max(S - K, 0.0)
    else:
        return max(K - S, 0.0)
`,
      testFn: `
assert intrinsic_value(105, 100, "call") == 5.0, "ITM call"
assert intrinsic_value(95, 100, "call") == 0.0, "OTM call"
assert intrinsic_value(95, 100, "put") == 5.0, "ITM put"
assert intrinsic_value(105, 100, "put") == 0.0, "OTM put"
assert intrinsic_value(100, 100, "call") == 0.0, "ATM call"
assert intrinsic_value(100, 100, "put") == 0.0, "ATM put"
print("Tests passed!")
`,
    },
  },
  {
    id: "2",
    title: "Put-Call Parity",
    subtitle: "The iron law of options pricing",
    duration: "15 min",
    content: `
<h2>The Most Important Relationship in Options</h2>
<p>Put-call parity is a no-arbitrage constraint that ties together the prices of European calls, European puts, the underlying stock, and a risk-free bond. It requires no assumptions about how stock prices move — it follows purely from the absence of free money. Understanding it deeply will teach you more about options pricing than memorizing any formula.</p>
<p>The relationship is:</p>
<blockquote><strong>C − P = S − K · e<sup>−rT</sup></strong></blockquote>
<p>where C is the call price, P is the put price, S is the current stock price, K is the shared strike, r is the continuously compounded risk-free rate, and T is time to expiration in years. The term K · e<sup>−rT</sup> is the present value of K — what you'd need to invest today at the risk-free rate to have exactly K at expiration.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>Play with S, K, r, and T and watch the right-hand side, S − K·e<sup>−rT</sup>, move. That's exactly what C − P has to equal, no matter what the market's current sentiment is — it's an accounting identity, not a prediction.</p>
</div>

<h2>The Proof: Two Portfolios, One Payoff</h2>
<p>Consider two portfolios constructed today and held to expiration at time T:</p>
<p><strong>Portfolio A:</strong> Buy one European call at strike K. Invest K · e<sup>−rT</sup> in a risk-free bond.</p>
<p><strong>Portfolio B:</strong> Buy one European put at strike K. Buy one share of the stock.</p>
<p>What does each portfolio pay at expiration? Let S<sub>T</sub> denote the stock price at time T.</p>
<p><strong>If S<sub>T</sub> &gt; K (call expires in-the-money):</strong></p>
<ul>
  <li>Portfolio A: Call pays S<sub>T</sub> − K. Bond matures to K. Total: <strong>S<sub>T</sub></strong>.</li>
  <li>Portfolio B: Put expires worthless (worth 0). Stock worth S<sub>T</sub>. Total: <strong>S<sub>T</sub></strong>.</li>
</ul>
<p><strong>If S<sub>T</sub> &lt; K (put expires in-the-money):</strong></p>
<ul>
  <li>Portfolio A: Call expires worthless. Bond matures to K. Total: <strong>K</strong>.</li>
  <li>Portfolio B: Put pays K − S<sub>T</sub>. Stock worth S<sub>T</sub>. Total: K − S<sub>T</sub> + S<sub>T</sub> = <strong>K</strong>.</li>
</ul>
<p>In both cases, Portfolio A and Portfolio B pay identical amounts at expiration: max(S<sub>T</sub>, K). Since they have identical future cash flows with certainty, they must cost the same today — otherwise you could buy the cheap portfolio, short the expensive one, and lock in a risk-free profit. This argument is called the <strong>law of one price</strong>.</p>
<p>Therefore: C + K · e<sup>−rT</sup> = P + S, which rearranges to C − P = S − K · e<sup>−rT</sup>.</p>

<h2>What Happens When Parity Breaks?</h2>
<p>In 2010, researchers documented persistent put-call parity violations in equity options during the 2008 financial crisis. When Lehman Brothers was failing, put prices on financial stocks were dramatically elevated relative to calls — a violation of parity that couldn't be easily arbitraged away because shorting the required stocks was impossible (regulators had temporarily banned short selling in financial stocks). This is a perfect example of how no-arbitrage relationships depend on the ability to execute all legs of the trade freely.</p>
<p>In normal markets, any violation is exploited and closed within milliseconds by algorithmic traders. The parity relationship is one of the most tightly enforced in all of finance.</p>

<h2>Synthetic Positions</h2>
<p>Rearranging put-call parity gives you four synthetic equivalences that every options trader knows:</p>
<ul>
  <li><strong>Synthetic long stock:</strong> C − P + K · e<sup>−rT</sup> = S. Buy call, sell put, invest PV(K) → same payoff as owning the stock.</li>
  <li><strong>Synthetic call:</strong> C = P + S − K · e<sup>−rT</sup>. If calls are expensive, you can replicate one using a put plus stock.</li>
  <li><strong>Synthetic put:</strong> P = C − S + K · e<sup>−rT</sup>. If you know the call price, you can derive the put price exactly.</li>
  <li><strong>Box spread:</strong> Buy a call spread and sell a put spread at the same strikes. The payoff at expiration is always K<sub>2</sub> − K<sub>1</sub> (a constant), so the box must trade at its present value. Box spreads are used by market makers to borrow and lend at the implied options rate.</li>
</ul>

<h2>Dividends and Early Exercise</h2>
<p>The parity formula above assumes no dividends. When the underlying pays a dividend with present value PV(D), the relationship becomes:</p>
<blockquote>C − P = S − PV(D) − K · e<sup>−rT</sup></blockquote>
<p>This matters enormously in practice. In the days before a large dividend, deep ITM call holders sometimes exercise early to capture the dividend — a situation where American and European prices diverge. The dividend-adjusted parity helps predict when this will happen.</p>

<h2>A Numerical Example</h2>
<p>AAPL is trading at $190. A 90-day call with K = $190 trades at $8.50. The risk-free rate is 5%. No dividends. What should the put trade at?</p>
<p>Using P = C − S + K · e<sup>−rT</sup>:</p>
<p>K · e<sup>−rT</sup> = 190 · e<sup>−0.05 × 0.25</sup> = 190 · 0.9876 = $187.64</p>
<p>P = $8.50 − $190 + $187.64 = <strong>$6.14</strong></p>
<p>If the market is quoting the put at $7.50, that's a violation. You'd short the put at $7.50, buy the call at $8.50, short the stock at $190, and invest $187.64 at the risk-free rate. Your net cash inflow today: $7.50 − $8.50 + $190 − $187.64 = $1.36. At expiration, all legs net to zero regardless of where AAPL trades. Free money.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-most-important-relationship-in-options",
        title: "Put-Call Parity",
        formula: "C − P = S − K·e^(−rT)",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 190, min: 50, max: 400, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 190, min: 50, max: 400, step: 1 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 0.25, min: 0.01, max: 2, step: 0.01 },
        ],
        computeId: "putCallParity",
        resultLabel: "C − P",
        resultPrefix: "$",
        decimals: 2,
      },
    ],
    exercise: {
      prompt: "Implement `put_from_call(call_price, S, K, T, r)` using put-call parity.",
      starterCode: `import math

def put_from_call(call_price, S, K, T, r):
    """
    Derive put price from call price using put-call parity:
    C - P = S - K * e^(-rT)
    Therefore: P = C - S + K * e^(-rT)
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def put_from_call(call_price, S, K, T, r):
    return call_price - S + K * math.exp(-r * T)
`,
      testFn: `
import math
result = put_from_call(10.4506, 100, 100, 1.0, 0.05)
expected = 5.5735
assert abs(result - expected) < 0.01, f"Expected ~{expected}, got {result:.4f}"

# Test the AAPL example from the lesson
result2 = put_from_call(8.50, 190, 190, 0.25, 0.05)
assert abs(result2 - 6.14) < 0.05, f"AAPL example: expected ~6.14, got {result2:.4f}"

# Test that call and put prices are consistent: C - P = S - PV(K)
C, P, S, K, T, r = 5.0, 2.0, 103.0, 100.0, 0.5, 0.04
derived_P = put_from_call(C, S, K, T, r)
parity_check = C - derived_P - (S - K * math.exp(-r * T))
assert abs(parity_check) < 1e-9, "Parity identity broken"
print("Tests passed!")
`,
    },
  },
  {
    id: "3",
    title: "Black-Scholes Formula",
    subtitle: "The equation that changed markets",
    duration: "20 min",
    content: `
<h2>The Nobel Prize Formula</h2>
<p>On May 1, 1973 — exactly five days after the CBOE opened — the <em>Journal of Political Economy</em> published "The Pricing of Options and Corporate Liabilities" by Fischer Black and Myron Scholes. The paper had been rejected by two journals before publication. In 1997, Scholes and Robert Merton shared the Nobel Prize in Economics for this work (Black had died in 1995). The committee called it "a major contribution to economic sciences."</p>
<p>The formula gave options a theoretical price for the first time. Before 1973, traders priced options by feel. After 1973, there was a number — and within years, almost every options trader on earth was using it. The CBOE even distributed hand-held calculators pre-programmed with Black-Scholes to traders on its floor.</p>

<h2>The Setup: Geometric Brownian Motion</h2>
<p>Black and Scholes modeled stock price movements as <strong>geometric Brownian motion (GBM)</strong>. The key intuition: the <em>percentage</em> change in a stock price over a small time interval is normally distributed with mean μ dt and standard deviation σ √dt, where μ is the expected return and σ is the volatility.</p>
<p>In math: dS = μS dt + σS dW<sub>t</sub>, where dW<sub>t</sub> is an increment of a Wiener process (continuous-time random walk). This implies that log returns — log(S<sub>t</sub>/S<sub>0</sub>) — are normally distributed, making the stock price itself <strong>log-normally distributed</strong>. Log-normal makes sense: prices can't go below zero, and a 10% gain followed by a 10% loss doesn't return you to the starting price.</p>
<p>Under this model, the stock price at time T starting from S today is:</p>
<blockquote>S<sub>T</sub> = S · exp((μ − σ²/2)T + σ√T · Z)</blockquote>
<p>where Z ~ N(0,1). The σ²/2 term is a Jensen's inequality correction — because log is concave, the expected log return is slightly less than μ.</p>

<h2>The Key Insight: Risk-Neutral Pricing</h2>
<p>Black and Scholes made a stunning discovery: <strong>the option price does not depend on the expected return μ of the stock</strong>. This seems wrong at first — surely a stock that's expected to rise is worth more as a call option?</p>
<p>The logic is subtle. If you hold a call and continuously delta-hedge it (buy and sell the underlying to stay delta-neutral), you can eliminate all directional risk from the position. The resulting hedged portfolio must earn the risk-free rate — otherwise there's an arbitrage. But this means the drift μ cancels out of the pricing equation entirely. You can price the option as if the stock grows at the risk-free rate r, regardless of its true expected return. This is <strong>risk-neutral pricing</strong>.</p>
<p>Mathematically, this means replacing μ with r in the GBM, which gives:</p>
<blockquote>S<sub>T</sub> = S · exp((r − σ²/2)T + σ√T · Z), where Z ~ N(0,1)</blockquote>
<p>The option price is then the expected payoff under this risk-neutral measure, discounted at the risk-free rate.</p>

<h2>The Black-Scholes Formula</h2>
<p>Taking the expected value of max(S<sub>T</sub> − K, 0) under the log-normal distribution and discounting gives:</p>
<blockquote>
  <strong>C = S · N(d₁) − K · e<sup>−rT</sup> · N(d₂)</strong><br/>
  <strong>P = K · e<sup>−rT</sup> · N(−d₂) − S · N(−d₁)</strong>
</blockquote>
<p>where:</p>
<ul>
  <li>d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)</li>
  <li>d₂ = d₁ − σ·√T = [ln(S/K) + (r − σ²/2)·T] / (σ·√T)</li>
  <li>N(·) is the standard normal CDF — the probability that a standard normal variable is below a given value</li>
</ul>

<h2>Interpreting Each Term</h2>
<p>The formula has a clean interpretation. For a call:</p>
<ul>
  <li><strong>N(d₂)</strong> is the risk-neutral probability that the call expires in-the-money (S<sub>T</sub> &gt; K). It's approximately the probability you'll end up with the stock.</li>
  <li><strong>N(d₁)</strong> is a delta-adjusted probability — the expected fraction of the stock price you effectively "own" through the option. It's always slightly larger than N(d₂) because of the log-normal skew.</li>
  <li><strong>S · N(d₁)</strong> is the present value of receiving the stock conditional on the call being exercised.</li>
  <li><strong>K · e<sup>−rT</sup> · N(d₂)</strong> is the present value of paying the strike K conditional on exercise.</li>
</ul>
<p>The call price is what you get (the stock) minus what you pay (the strike), each probability-weighted and discounted.</p>

<h2>What d₁ and d₂ Measure</h2>
<p>Think of d₁ and d₂ as standardized measures of how far in-the-money the option is:</p>
<ul>
  <li>ln(S/K) measures how far the stock is from the strike in log-space. Positive means S &gt; K (ITM call).</li>
  <li>(r + σ²/2)·T adjusts for the drift of the log-normal process.</li>
  <li>σ·√T normalizes by the uncertainty over the life of the option.</li>
</ul>
<p>As T → 0 at expiration, the formula collapses to the intrinsic value: C → max(S − K, 0). As σ → 0 (certain world), the formula gives the discounted payoff with certainty. Both limits make sense.</p>

<h2>The Assumptions (and Their Violations)</h2>
<p>Black-Scholes makes five key assumptions, all of which are violated to some degree in practice:</p>
<ol>
  <li><strong>Constant volatility:</strong> Real volatility changes over time and across strikes. This is why traders use the "volatility smile" — different implied vols for different strikes — a direct contradiction of the model.</li>
  <li><strong>Log-normal returns:</strong> Real stock returns have "fat tails" — extreme moves happen far more often than the normal distribution predicts. The 1987 Black Monday crash (Dow −22.6% in one day) was a 27-sigma event under Black-Scholes — theoretically impossible.</li>
  <li><strong>No jumps:</strong> Stocks can gap overnight or on news. GBM assumes continuous paths.</li>
  <li><strong>Continuous trading at zero cost:</strong> Delta hedging requires continuous rebalancing. In practice, trading is discrete and has transaction costs.</li>
  <li><strong>Constant risk-free rate:</strong> Interest rates move, especially over longer option maturities.</li>
</ol>
<p>Despite these violations, Black-Scholes remains the lingua franca of options markets. Traders don't use it to believe its prices are correct — they use it as a common language to quote <strong>implied volatility</strong>, which we'll study in Lesson 8.</p>
    `,
    exercise: {
      prompt: "Implement `black_scholes_call(S, K, T, r, sigma)` from scratch.",
      starterCode: `import math

def norm_cdf(x):
    """Standard normal CDF using the complementary error function."""
    return 0.5 * math.erfc(-x / math.sqrt(2))

def black_scholes_call(S, K, T, r, sigma):
    """
    Price a European call using Black-Scholes.
    C = S*N(d1) - K*exp(-rT)*N(d2)
    d1 = (ln(S/K) + (r + sigma^2/2)*T) / (sigma*sqrt(T))
    d2 = d1 - sigma*sqrt(T)
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def black_scholes_call(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)
`,
      testFn: `
# Standard test case
result = black_scholes_call(100, 100, 1.0, 0.05, 0.20)
assert abs(result - 10.4506) < 0.01, f"Expected ~10.45, got {result:.4f}"

# Deep ITM call: price ≈ S - PV(K)
result_itm = black_scholes_call(200, 100, 1.0, 0.05, 0.20)
pv_k = 100 * __import__('math').exp(-0.05 * 1.0)
assert abs(result_itm - (200 - pv_k)) < 1.0, "Deep ITM call should be close to S - PV(K)"

# Deep OTM call: price should be near zero
result_otm = black_scholes_call(50, 100, 1.0, 0.05, 0.20)
assert result_otm < 0.01, f"Deep OTM call should be nearly zero: {result_otm:.6f}"

# Higher vol = higher price
c_low_vol  = black_scholes_call(100, 100, 1.0, 0.05, 0.10)
c_high_vol = black_scholes_call(100, 100, 1.0, 0.05, 0.50)
assert c_high_vol > c_low_vol, "Higher vol should give higher option price"

print("Tests passed!")
`,
    },
  },
  {
    id: "4",
    title: "Delta: Directional Exposure",
    subtitle: "The most important Greek",
    duration: "15 min",
    content: `
<h2>The First Derivative</h2>
<p>The Greeks are the partial derivatives of an option's price with respect to each input in the Black-Scholes formula. Delta (Δ) is the most important: it's the partial derivative of the option price with respect to the <em>stock price</em>.</p>
<blockquote>Δ = ∂V / ∂S</blockquote>
<p>In plain English: if the stock moves up by $1, the option moves up by approximately Δ dollars. If a call has Δ = 0.60, a $1 rise in the stock produces approximately a $0.60 rise in the call price. This approximation improves as the stock move gets smaller.</p>

<h2>Delta Ranges and What They Mean</h2>
<ul>
  <li><strong>Call delta:</strong> always between 0 and +1. Deep OTM calls have Δ near 0; deep ITM calls have Δ near 1.</li>
  <li><strong>Put delta:</strong> always between −1 and 0. Deep OTM puts have Δ near 0; deep ITM puts have Δ near −1.</li>
</ul>
<p>The Black-Scholes formulas:</p>
<blockquote>
  Δ<sub>call</sub> = N(d₁)<br/>
  Δ<sub>put</sub>  = N(d₁) − 1 = −N(−d₁)
</blockquote>
<p>Note that Δ<sub>call</sub> + |Δ<sub>put</sub>| = N(d₁) + N(−d₁) = 1. This follows directly from put-call parity: a long call and short put at the same strike is equivalent to owning the stock (a synthetic long), so their deltas must sum to 1.</p>

<h2>Delta as a Probability Proxy</h2>
<p>There's a useful intuition: an option's delta is approximately the risk-neutral probability that it will expire in-the-money. An ATM option with Δ ≈ 0.50 has roughly a 50/50 chance of expiring ITM. A deep OTM call with Δ = 0.05 has only about a 5% chance.</p>
<p>This approximation is not exact — the true risk-neutral ITM probability is N(d₂), not N(d₁) — but the difference is small for short-dated options, and the intuition is extremely useful. Traders think of delta as moneyness and probability simultaneously.</p>

<h2>Delta Hedging: How Market Makers Think</h2>
<p>The key insight of Black-Scholes is that you can hedge away the directional risk of an option by holding Δ shares of the underlying. This is called <strong>delta hedging</strong> or being <strong>delta-neutral</strong>.</p>
<p>Example: A market maker sells 100 call contracts (options on 10,000 shares) with Δ = 0.45. To hedge, she buys 4,500 shares (10,000 × 0.45). Her net delta is zero — small stock moves don't hurt her. She makes money from the bid-ask spread, not from directional bets.</p>
<p>But delta changes as the stock moves — that's gamma, which we cover in Lesson 6. When the stock rises, the call delta rises (options go more ITM), so the market maker must buy more shares. When the stock falls, she sells shares. She's perpetually rebalancing. This dynamic hedging process is called <strong>delta-gamma hedging</strong>, and the cost of doing it continuously is how the option's premium is "consumed."</p>

<h2>Delta in Practice: Real Numbers</h2>
<p>Consider an SPY (S&P 500 ETF) option with the following inputs: S = 450, K = 450, T = 30 days (0.082 years), r = 5.25%, σ = 18%.</p>
<p>Computing d₁: ln(450/450) + (0.0525 + 0.018²/2) × 0.082 all over 0.18 × √0.082 = (0 + 0.00447) / 0.0516 ≈ 0.0866</p>
<p>Δ<sub>call</sub> = N(0.0866) ≈ 0.535. So a $1 move in SPY moves this ATM call by about $0.535. Not exactly $0.50 because of the r + σ²/2 drift term in d₁.</p>

<h2>Portfolio Delta and Dollar Delta</h2>
<p>The beauty of delta is that it's additive across positions. A portfolio's total delta is just the sum of deltas weighted by position size. A portfolio manager with:</p>
<ul>
  <li>Long 500 shares of AAPL (Δ = 1 each): portfolio delta +500</li>
  <li>Long 10 AAPL call contracts (Δ = 0.4, 100 shares each): portfolio delta +400</li>
  <li>Long 5 AAPL put contracts (Δ = −0.3, 100 shares each): portfolio delta −150</li>
</ul>
<p>Total delta: 500 + 400 − 150 = +750. The portfolio behaves like owning 750 shares of AAPL for small moves. To go delta-neutral, sell 750 shares (or buy puts covering 750 shares of delta).</p>
<p><strong>Dollar delta</strong> scales this by the stock price: 750 × $190 = $142,500. A 1% move in AAPL changes this portfolio by approximately $1,425.</p>
    `,
    exercise: {
      prompt: "Implement `compute_delta(S, K, T, r, sigma, option_type)` using the Black-Scholes formula.",
      starterCode: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def compute_delta(S, K, T, r, sigma, option_type="call"):
    """
    Delta of a European option.
    call delta = N(d1)
    put  delta = N(d1) - 1
    d1 = (ln(S/K) + (r + sigma^2/2)*T) / (sigma*sqrt(T))
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def compute_delta(S, K, T, r, sigma, option_type="call"):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    if option_type == "call":
        return norm_cdf(d1)
    else:
        return norm_cdf(d1) - 1.0
`,
      testFn: `
# ATM call delta should be ~0.5
d = compute_delta(100, 100, 1.0, 0.05, 0.20, "call")
assert 0.5 < d < 0.65, f"ATM call delta off: {d:.4f}"

# Deep ITM call delta near 1
d2 = compute_delta(200, 100, 1.0, 0.05, 0.20, "call")
assert d2 > 0.95, f"Deep ITM delta should be near 1: {d2:.4f}"

# Put delta = call delta - 1
d_call = compute_delta(100, 100, 1.0, 0.05, 0.20, "call")
d_put  = compute_delta(100, 100, 1.0, 0.05, 0.20, "put")
assert abs(d_call + abs(d_put) - 1.0) < 0.001, "Call + |put| delta should = 1"

# Deep OTM call delta near 0
d_otm = compute_delta(50, 100, 1.0, 0.05, 0.20, "call")
assert d_otm < 0.05, f"Deep OTM delta should be near 0: {d_otm:.4f}"

# Put delta is negative
d_put_sign = compute_delta(100, 100, 1.0, 0.05, 0.20, "put")
assert d_put_sign < 0, "Put delta must be negative"

print("Tests passed!")
`,
    },
  },
  {
    id: "5",
    title: "Theta: Time Decay",
    subtitle: "Why options are a race against the clock",
    duration: "15 min",
    content: `
<h2>Options Are Wasting Assets</h2>
<p>Every option has an expiration date. Each day that passes without a favorable move in the underlying, the option loses value — not because the stock moved against you, but simply because there's less time remaining for it to move in your favor. This erosion is called <strong>time decay</strong>, and it's measured by theta (Θ).</p>
<p>Theta is the partial derivative of the option price with respect to time:</p>
<blockquote>Θ = ∂V / ∂t</blockquote>
<p>By convention, theta is typically quoted as the change in option price per calendar day, with a negative sign — theta is almost always negative for long options because options lose value as time passes.</p>
<p>If you own a call with Θ = −0.05, you lose approximately $0.05 per day from time decay alone, all else equal. Over a three-day weekend, you'd lose ~$0.15 without the stock moving at all.</p>

<h2>The Formula</h2>
<p>The Black-Scholes theta for a European call is:</p>
<blockquote>
  Θ<sub>call</sub> = [−S · n(d₁) · σ / (2√T) − r · K · e<sup>−rT</sup> · N(d₂)] / 365
</blockquote>
<p>And for a put:</p>
<blockquote>
  Θ<sub>put</sub> = [−S · n(d₁) · σ / (2√T) + r · K · e<sup>−rT</sup> · N(−d₂)] / 365
</blockquote>
<p>where n(·) is the standard normal PDF (not CDF). The division by 365 converts from annualized to daily theta. The first term — involving n(d₁) — is always negative and represents the optionality decaying. The second term involves the interest on the strike and can be positive for puts, which is why deep ITM puts sometimes have slightly positive theta.</p>

<h2>Time Decay Is Not Linear</h2>
<p>One of the most important practical facts about theta: <strong>time decay accelerates as expiration approaches</strong>. An ATM option doesn't lose 1/365 of its value each day — it loses much more in its final days.</p>
<p>The reason is that the option's extrinsic value is approximately proportional to σ√T (the "vol-time" product). As T decreases, the rate of decrease of √T accelerates:</p>
<blockquote>d(√T)/dt = 1/(2√T)</blockquote>
<p>This blows up as T → 0. An ATM option with 30 days left decays much faster per day than the same option with 180 days left. Empirically, roughly half of an ATM option's time value is lost in the final 25% of its life.</p>
<p>This is why option sellers love the final weeks before expiration — theta is collecting fastest. It's also why option buyers need their underlying to move quickly — each day of delay costs more than the previous one.</p>

<h2>Theta and Volatility: The ATM Peak</h2>
<p>Theta is largest (most negative) for <strong>at-the-money options</strong>. This seems counterintuitive — shouldn't the most expensive options decay fastest in absolute terms? Yes, and ATM options have the most extrinsic value, so they decay the most.</p>
<p>Deep ITM options have almost no extrinsic value left to decay. Deep OTM options are cheap and also have little extrinsic value. The ATM option has the maximum extrinsic value — and therefore the maximum theta exposure.</p>
<p>Numerically: with S = K = 100, T = 30 days, r = 5%, σ = 20%, the ATM call theta is about −$0.055/day. The same call but OTM (K = 120) has theta of about −$0.012/day. The ITM call (K = 80) has theta of about −$0.030/day.</p>

<h2>The Theta-Gamma Tradeoff: The Central Tension</h2>
<p>Theta and gamma are the yin and yang of options trading. You cannot have one without paying for the other. This relationship comes directly from the Black-Scholes partial differential equation:</p>
<blockquote>Θ + ½σ²S²Γ + rSΔ − rV = 0</blockquote>
<p>This is the Black-Scholes PDE, and it must hold for any option price. Rearranging roughly: Θ ≈ −½σ²S²Γ for delta-hedged positions. Theta and gamma have opposite signs and are proportional to each other.</p>
<ul>
  <li><strong>Long options (long gamma, negative theta):</strong> You benefit from large moves in either direction — gamma gives you a "free" improvement in delta when the stock moves. But you pay for this through daily theta decay. You're rooting for volatility to materialize.</li>
  <li><strong>Short options (short gamma, positive theta):</strong> You collect theta every day, but lose when the stock makes a large move. You're rooting for the stock to go nowhere and time to pass quietly.</li>
</ul>
<p>Professional options traders frame every position around this tradeoff. "How much gamma am I paying for with theta?" is the question that drives structuring decisions. A market maker delta-hedging an ATM option is long gamma (profits from moves) and paying theta (loses each quiet day). They need enough moves to cover the theta cost — this is called <strong>gamma scalping</strong>.</p>

<h2>Calendar Spreads: Trading Pure Theta</h2>
<p>A <strong>calendar spread</strong> exploits the difference in theta between near-term and far-term options. You sell the near-term option (high theta, decays faster) and buy the far-term option (lower theta, decays slower) at the same strike. Your net theta is positive. If the stock stays near the strike, the near-term option decays faster than the long option, and you profit.</p>
<p>This is a pure volatility play: you want near-term realized volatility to be low (so the short option expires worthless) and forward volatility to remain high (keeping the long option valuable).</p>
    `,
    exercise: {
      prompt: "Implement `compute_theta(S, K, T, r, sigma, option_type)` returning daily theta (annualized / 365).",
      starterCode: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def compute_theta(S, K, T, r, sigma, option_type="call"):
    """
    Daily theta (annualised / 365).
    theta_call = (- S*n(d1)*sigma/(2*sqrt(T)) - r*K*exp(-rT)*N(d2)) / 365
    theta_put  = (- S*n(d1)*sigma/(2*sqrt(T)) + r*K*exp(-rT)*N(-d2)) / 365
    """
    if T <= 0:
        return 0.0
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def compute_theta(S, K, T, r, sigma, option_type="call"):
    if T <= 0:
        return 0.0
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    common = -S * norm_pdf(d1) * sigma / (2 * math.sqrt(T))
    if option_type == "call":
        return (common - r * K * math.exp(-r * T) * norm_cdf(d2)) / 365
    else:
        return (common + r * K * math.exp(-r * T) * norm_cdf(-d2)) / 365
`,
      testFn: `
theta = compute_theta(100, 100, 1.0, 0.05, 0.20, "call")
assert theta < 0, f"Theta should be negative: {theta:.6f}"
assert abs(theta) < 0.1, f"Theta magnitude seems too large: {theta:.6f}"

# Theta accelerates near expiry
theta_1y = compute_theta(100, 100, 1.0, 0.05, 0.20, "call")
theta_1m = compute_theta(100, 100, 1/12, 0.05, 0.20, "call")
assert theta_1m < theta_1y, "Time decay accelerates near expiry"

# ATM has more theta than deep OTM
theta_atm = compute_theta(100, 100, 0.25, 0.05, 0.20, "call")
theta_otm = compute_theta(100, 140, 0.25, 0.05, 0.20, "call")
assert abs(theta_atm) > abs(theta_otm), "ATM should decay faster than deep OTM"

# T=0 returns 0
assert compute_theta(100, 100, 0, 0.05, 0.20) == 0.0

print("Tests passed!")
`,
    },
  },
  {
    id: "6",
    title: "Gamma: Rate of Change of Delta",
    subtitle: "Why delta hedging requires constant rebalancing",
    duration: "15 min",
    content: `
<h2>The Second Derivative</h2>
<p>Delta tells you how much an option moves for a small stock price change. But delta itself changes as the stock moves — and gamma measures how fast. Formally:</p>
<blockquote>Γ = ∂Δ / ∂S = ∂²V / ∂S²</blockquote>
<p>Gamma is the second derivative of the option price with respect to the stock price. It measures the <em>convexity</em> of the option price curve. If a call has Δ = 0.50 and Γ = 0.06, then after a $1 rise in the stock, the new delta is approximately 0.56. After a $2 rise, it's approximately 0.62. The option gains delta as the stock rises — this is positive convexity, and it's what option buyers are paying for.</p>

<h2>The Formula</h2>
<blockquote>Γ = n(d₁) / (S · σ · √T)</blockquote>
<p>where n(d₁) is the standard normal PDF evaluated at d₁. Two crucial facts:</p>
<ol>
  <li><strong>Gamma is always positive for long options</strong> — both calls and puts. If you're long options, you benefit from large moves in either direction (positive convexity).</li>
  <li><strong>The formula is identical for calls and puts.</strong> A call and put with the same strike and expiry have the same gamma. This follows from put-call parity: C − P = S − PV(K), so ∂²C/∂S² = ∂²P/∂S².</li>
</ol>

<h2>Where Gamma Lives: ATM Near Expiry</h2>
<p>Gamma is not uniformly distributed across strikes and maturities. It is highest for <strong>at-the-money options close to expiration</strong>. Let's understand why intuitively:</p>
<p>Think about what delta does as expiration approaches for an ATM option. With 1 year left, a $1 move in the stock barely changes whether the option expires ITM or OTM — delta changes slowly. With 1 day left, a $1 move can flip the option from almost certainly OTM to almost certainly ITM — delta changes violently. This rapid delta change is high gamma.</p>
<p>Numerically: an ATM option with 1 year to expiration might have Γ = 0.02 (delta changes by 0.02 per $1 stock move). The same option with 1 week to expiration might have Γ = 0.15. The option is "pinned" near the strike — either side wins big, and small moves determine everything.</p>

<h2>Gamma Risk: The Pin and the Explosion</h2>
<p>High gamma near expiration creates two distinct risks that options professionals manage carefully:</p>
<p><strong>Pin risk:</strong> When a heavily-traded option's strike coincides with the stock price near expiration, market makers who have sold those options must delta-hedge aggressively. As the stock moves above the strike, they buy shares (delta rising toward 1). As it moves below, they sell shares (delta falling toward 0). This creates a self-fulfilling "magnetism" — the stock can get pinned to the strike as hedgers chase delta on both sides. This phenomenon is called the "max pain" effect and is visible in large-cap stocks on monthly expiration Fridays (OpEx).</p>
<p><strong>Gamma explosion:</strong> In the days before expiration, 0DTE (zero days to expiration) options have enormous gamma. A 5-point SPX move can change a 0DTE option's delta by 0.40 or more. Market makers short 0DTE options face potentially unlimited delta exposure from small moves. The rise of 0DTE trading — 0DTE options now account for over 40% of SPX options volume — has fundamentally changed how professionals think about intraday hedging.</p>

<h2>Gamma Scalping: Profiting from Moves</h2>
<p>A trader who is long gamma (long options, delta-hedged) can make money from volatility through a strategy called <strong>gamma scalping</strong>. The mechanics:</p>
<ol>
  <li>Buy ATM options and delta-hedge to neutrality.</li>
  <li>When the stock rises, your delta becomes positive (gamma effect). Sell some stock to rebalance to delta-neutral. You've sold high.</li>
  <li>When the stock then falls back, your delta becomes negative. Buy stock to rebalance. You've bought low.</li>
  <li>Each round-trip rebalance locks in a small profit proportional to the stock move squared times gamma: P&L ≈ ½Γ(ΔS)².</li>
</ol>
<p>The catch: you're paying theta every day for this privilege. Gamma scalping is profitable only if the realized volatility exceeds the implied volatility embedded in the options you bought. If IV = 20% but the stock only moves as if σ = 15%, you'll lose theta faster than you earn from rebalancing. This is the core question every options trader faces: is the option cheap or expensive relative to realized vol?</p>

<h2>The Black-Scholes PDE Revisited</h2>
<p>Recall the Black-Scholes PDE from the theta lesson:</p>
<blockquote>Θ + ½σ²S²Γ + rSΔ − rV = 0</blockquote>
<p>For a delta-hedged portfolio (net Δ = 0), this simplifies to:</p>
<blockquote>Θ + ½σ²S²Γ = rV (roughly)</blockquote>
<p>The term ½σ²S²Γ is the "gamma P&L" from stock moves, and Θ is the theta cost. In equilibrium, they balance. This equation is essentially saying: the expected gamma profits from continuous rebalancing exactly offset the theta cost, leaving a risk-free return. It's the mathematical statement that options are "fairly priced" under Black-Scholes.</p>
    `,
    exercise: {
      prompt: "Implement `compute_gamma(S, K, T, r, sigma)` using the Black-Scholes formula.",
      starterCode: `import math

def _norm_pdf(x):
    """Standard normal PDF: n(x) = exp(-x²/2) / sqrt(2π)"""
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def compute_gamma(S, K, T, r, sigma):
    """
    Gamma = n(d1) / (S * sigma * sqrt(T))
    Same for calls and puts.

    d1 = (ln(S/K) + (r + sigma^2/2)*T) / (sigma*sqrt(T))
    n(d1) is the PDF — use _norm_pdf(d1), NOT the CDF.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def _norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def compute_gamma(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    return _norm_pdf(d1) / (S * sigma * math.sqrt(T))
`,
      testFn: `
# ATM gamma should be positive
g = compute_gamma(100, 100, 1.0, 0.05, 0.20)
assert g > 0, f"Gamma must be positive: {g}"

# Deep ITM gamma should be smaller than ATM
g_itm = compute_gamma(200, 100, 1.0, 0.05, 0.20)
g_atm = compute_gamma(100, 100, 1.0, 0.05, 0.20)
assert g_itm < g_atm, "ATM gamma should exceed deep-ITM gamma"

# Gamma increases as expiry approaches (for ATM options)
g_1y = compute_gamma(100, 100, 1.0, 0.05, 0.20)
g_1m = compute_gamma(100, 100, 1/12, 0.05, 0.20)
assert g_1m > g_1y, "Gamma should increase as expiry approaches (ATM)"

# Gamma is symmetric: call and put gamma are equal
# (same formula, both depend on d1 only)
g1 = compute_gamma(105, 100, 0.5, 0.05, 0.25)
g2 = compute_gamma(105, 100, 0.5, 0.05, 0.25)
assert abs(g1 - g2) < 1e-10, "Call and put gamma should be equal"

print("Tests passed!")
`,
    },
  },
  {
    id: "7",
    title: "Vega: Volatility Sensitivity",
    subtitle: "How option prices respond to changes in implied vol",
    duration: "15 min",
    content: `
<h2>The Volatility Greek</h2>
<p>Vega (ν) measures how much an option price changes for a one percentage-point change in implied volatility. It is in some ways the most important Greek for professional options traders, because professional options trading is largely about <em>trading volatility</em> — not direction.</p>
<blockquote>ν = ∂V / ∂σ</blockquote>
<p>An ATM one-year call with ν = 0.40 gains $0.40 in value for every 1% rise in implied vol. If IV moves from 20% to 25%, the call gains approximately $2.00 from vega alone, even if the stock doesn't move.</p>
<p>Note: despite the Greek letter, "vega" is not actually a Greek letter — it was invented by traders. In academic literature it sometimes appears as κ (kappa) or λ (lambda). The name stuck because it sounds Greek-ish and starts with 'v' for volatility.</p>

<h2>The Formula</h2>
<blockquote>ν = S · n(d₁) · √T / 100</blockquote>
<p>where n(d₁) is the standard normal PDF. The formula is <strong>identical for calls and puts</strong> — a call and put with the same strike and expiry have the same vega. This again follows from put-call parity: C − P = S − PV(K), and differentiating both sides with respect to σ gives ∂C/∂σ = ∂P/∂σ.</p>
<p>The division by 100 converts from "per unit vol" to "per percentage point." Some books define vega without the /100, which means the answer is 100x larger — always check which convention is being used.</p>

<h2>Vega Is Largest for ATM Long-Dated Options</h2>
<p>Two factors drive vega:</p>
<ul>
  <li><strong>Moneyness:</strong> Vega peaks at the ATM strike and falls off for ITM and OTM options. Deep OTM options are nearly binary (they'll either be worth a lot or nothing), so an incremental vol change doesn't matter much. Deep ITM options will likely be exercised regardless.</li>
  <li><strong>Time to expiry:</strong> Vega scales with √T. A 1-year ATM option has roughly √(12) ≈ 3.46× the vega of a 1-month ATM option. Longer-dated options have more time for vol to matter, making them much more sensitive to vol changes.</li>
</ul>
<p>This means long-dated options are "vol products" more than "directional products." A 2-year LEAPS option might have vega of $0.80 — a 5 vol-point move shifts its price by $4, far more than most delta-driven moves over the same period.</p>

<h2>Implied Volatility: The Market's Forecast</h2>
<p>Black-Scholes takes σ as an input. In reality, σ is not directly observable. What we observe is the <em>market price</em> of an option. Traders invert the formula: given the market price, what σ makes Black-Scholes match it? That σ is called <strong>implied volatility (IV)</strong>.</p>
<p>Implied vol is not a prediction of actual future volatility — it's the market's consensus <em>price</em> for uncertainty. Historically, IV tends to exceed realized volatility by 1–3 percentage points on average. This gap — called the <strong>variance risk premium</strong> — is why option selling (collecting IV premium) has historically been profitable on average, at the cost of occasional large losses when volatility spikes.</p>

<h2>The Volatility Surface: Where Black-Scholes Breaks Down</h2>
<p>If Black-Scholes were literally true, every option on the same stock and expiry would have the same implied vol. In practice, they don't. Plotting IV against strike gives the famous <strong>volatility smile</strong> (or skew).</p>
<p><strong>Equity skew:</strong> For equity index options (SPX, SPY), OTM puts almost always trade at higher IV than ATM options, which trade at higher IV than OTM calls. The shape is asymmetric — a skew rather than a smile. This reflects:</p>
<ol>
  <li><strong>Crash risk demand:</strong> Investors pay a premium for put protection (portfolio insurance). High demand for OTM puts drives their IV up.</li>
  <li><strong>Leverage effect:</strong> When stocks fall, companies become more levered (debt stays constant, equity falls), increasing volatility. Crashes historically come with vol spikes.</li>
  <li><strong>Stochastic volatility:</strong> Real volatility is not constant — it varies, and it's negatively correlated with stock returns.</li>
</ol>
<p><strong>FX smile:</strong> Currency options often show a true smile — both OTM puts and calls trade at elevated IV relative to ATM. This reflects the possibility of large moves in either direction (currencies can appreciate or depreciate sharply).</p>

<h2>VIX: The Fear Index</h2>
<p>The CBOE Volatility Index (VIX) is perhaps the most important single number in financial markets. It measures the market's expectation for S&P 500 volatility over the next 30 days, derived from a portfolio of SPX options across many strikes.</p>
<p>VIX is expressed as an annualized volatility percentage. A VIX of 20 means the market expects roughly 20% annualized volatility, which translates to daily moves of about 20%/√252 ≈ 1.26% per day.</p>
<p>Historical VIX context:</p>
<ul>
  <li><strong>2017:</strong> VIX averaged 11.1 — the calmest year in recorded history. Options were historically cheap.</li>
  <li><strong>2008 (Lehman crisis):</strong> VIX hit 89.5 in October 2008. Options became extraordinarily expensive.</li>
  <li><strong>March 2020 (COVID crash):</strong> VIX peaked at 85.5 on March 18, 2020 — the second-highest reading ever.</li>
  <li><strong>Normal range:</strong> 12–25 in calm markets, 25–40 in stressed markets, 40+ in crises.</li>
</ul>
<p>VIX is often called the "fear index" because it spikes when investors are buying protective puts aggressively. A rising VIX means the options market is pricing in more uncertainty — regardless of whether the stock market itself is up or down.</p>

<h2>Vega in Portfolio Management</h2>
<p>A large options portfolio has a net vega — the sensitivity of its total value to a parallel shift in the vol surface. A portfolio that is <em>long vega</em> gains when IV rises (benefits from fear/uncertainty). A portfolio that is <em>short vega</em> — like a fund that systematically sells options for premium — gains when IV falls and loses when it spikes.</p>
<p>The 2018 "Volmageddon" event illustrates the risk. Several funds were short VIX (short vega) using instruments tied to VIX futures. On February 5, 2018, VIX doubled in a single day — an unprecedented move. One product (XIV) lost 96% of its value overnight and was liquidated. Understanding vega, and the risk of sudden vol spikes, is not academic — it is survival.</p>
    `,
    exercise: {
      prompt: "Implement `compute_vega(S, K, T, r, sigma)` returning vega per 1% vol move.",
      starterCode: `import math

def _norm_pdf(x):
    """Standard normal PDF: n(x) = exp(-x²/2) / sqrt(2π)"""
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def compute_vega(S, K, T, r, sigma):
    """
    Vega = S * n(d1) * sqrt(T) / 100
    Same for calls and puts.
    Divide by 100 so result is per 1 percentage-point move in vol.

    d1 = (ln(S/K) + (r + sigma^2/2)*T) / (sigma*sqrt(T))
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def _norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def compute_vega(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    return S * _norm_pdf(d1) * math.sqrt(T) / 100
`,
      testFn: `
# ATM vega should be positive
v = compute_vega(100, 100, 1.0, 0.05, 0.20)
assert v > 0, f"Vega must be positive: {v}"

# Longer expiry = more vega
v_1y = compute_vega(100, 100, 1.0, 0.05, 0.20)
v_1m = compute_vega(100, 100, 1/12, 0.05, 0.20)
assert v_1y > v_1m, "Longer expiry should have more vega"

# Vega scales with sqrt(T) approximately
import math
ratio = v_1y / v_1m
expected_ratio = math.sqrt(1.0) / math.sqrt(1/12)
assert abs(ratio - expected_ratio) < 0.5, f"Vega ratio should be ~sqrt(12): {ratio:.2f} vs {expected_ratio:.2f}"

# ATM has more vega than deep OTM
v_atm = compute_vega(100, 100, 1.0, 0.05, 0.20)
v_otm = compute_vega(100, 140, 1.0, 0.05, 0.20)
assert v_atm > v_otm, "ATM should have more vega than deep OTM"

# Call and put vega are equal (same formula)
v_call = compute_vega(100, 105, 0.5, 0.05, 0.25)
v_put  = compute_vega(100, 105, 0.5, 0.05, 0.25)
assert abs(v_call - v_put) < 1e-10, "Call and put vega must be equal"

print("Tests passed!")
`,
    },
  },
  {
    id: "8",
    title: "Implied Volatility",
    subtitle: "What the market thinks about uncertainty",
    duration: "18 min",
    content: `
<h2>Inverting the Formula</h2>
<p>Black-Scholes takes five inputs — S, K, T, r, and σ — and produces an option price. But in real markets, you observe prices, not volatilities. Every day, options trade at market prices that are set by supply and demand. The question becomes: what value of σ makes the Black-Scholes formula match the observed market price?</p>
<p>That σ is called <strong>implied volatility (IV)</strong>. It is the volatility "implied" by the market price. If an option is trading at $5.80 and Black-Scholes with σ = 0.20 produces $5.80, then the implied vol is 20%.</p>
<p>This inversion cannot be done analytically — there is no closed-form formula for σ given C. Instead, we use a numerical root-finding method. We want to find the zero of:</p>
<blockquote>f(σ) = BS(S, K, T, r, σ) − C<sub>market</sub> = 0</blockquote>
<p>The two most common methods are <strong>bisection</strong> (reliable, slow) and <strong>Newton-Raphson</strong> (fast, occasionally brittle). Professionals use Newton-Raphson because it converges in 4–6 iterations for typical option inputs.</p>

<h2>Newton-Raphson: The Fast Way</h2>
<p>Newton-Raphson iteratively improves an estimate of the root using the derivative of the function:</p>
<blockquote>σ<sub>n+1</sub> = σ<sub>n</sub> − f(σ<sub>n</sub>) / f′(σ<sub>n</sub>)</blockquote>
<p>Here f(σ) = BS_price(σ) − C_market, and f′(σ) = ∂BS/∂σ = vega (divided by 100, in the same units). Specifically:</p>
<blockquote>σ<sub>n+1</sub> = σ<sub>n</sub> − (BS(σ<sub>n</sub>) − C<sub>market</sub>) / Vega(σ<sub>n</sub>)</blockquote>
<p>where Vega is the raw vega (S · n(d₁) · √T), not the per-1% version we computed in Lesson 7. Starting from σ₀ = 0.20 (20%) and iterating 5–10 times typically gives convergence to 6+ decimal places for standard options.</p>
<p>The method can fail when vega is near zero (deep OTM or very short-dated options), so good implementations add a fallback to bisection when vega is too small.</p>

<h2>IV as the Market's Price of Uncertainty</h2>
<p>Implied vol is not a forecast of realized volatility — it is the market's <em>price</em> for uncertainty. Several things follow from this:</p>
<ul>
  <li><strong>IV ≠ realized vol:</strong> On average across history, IV has been about 1–3 percentage points above subsequently realized volatility. This gap is the <strong>variance risk premium</strong> — compensation for the risk of providing vol insurance. It's why systematic option selling has historically been profitable on average.</li>
  <li><strong>IV can be wrong in both directions:</strong> In quiet markets, IV undershoots realized vol (options are cheap). Before major events (Fed decisions, earnings), IV overshoots — the premium for the known uncertainty.</li>
  <li><strong>IV is forward-looking:</strong> Realized vol looks backward (what has happened). IV looks forward (what the market fears may happen). They can diverge dramatically around events.</li>
</ul>

<h2>The Volatility Surface</h2>
<p>If Black-Scholes were literally true, every option on the same underlying and expiry would have the same IV. In practice, IVs vary across both <em>strike</em> and <em>time to expiry</em>, forming a two-dimensional <strong>volatility surface</strong>.</p>
<p><strong>Term structure:</strong> IV typically increases with time to expiry (the market fears more as time horizon lengthens), but can invert during crises (short-dated IV spikes more than long-dated IV when fear is acute).</p>
<p><strong>Skew / smile:</strong> For equity index options (SPX, SPY), OTM puts consistently trade at higher IV than ATM options, which trade at higher IV than OTM calls. The shape is called the <strong>volatility skew</strong>. It reflects:</p>
<ol>
  <li><strong>Demand for downside protection:</strong> Investors buy OTM puts as portfolio insurance. High demand → high price → high IV.</li>
  <li><strong>The leverage effect:</strong> When stocks fall, equity volatility rises (empirically well-documented). OTM puts protect against this correlated scenario, so they're especially valuable.</li>
  <li><strong>Crash risk premium:</strong> Markets can crash much faster than they can rise (asymmetric tails), so OTM puts command an asymmetric premium.</li>
</ol>
<p>For FX options, you often see a true symmetric smile — OTM puts and calls both trade above ATM — because currencies can move sharply in both directions.</p>

<h2>Practical IV Numbers</h2>
<p>Some intuition-building reference points:</p>
<ul>
  <li>SPY 30-day ATM IV: normally 12–18% in calm markets, 25–40% during stress</li>
  <li>Individual stocks: often 25–60% for large-caps, 60–150%+ for small-caps and biotechs</li>
  <li>VIX (SPX 30-day IV index): 11–15 = extreme calm, 20–25 = normal, 30–40 = stressed, 40+ = crisis</li>
</ul>
<p>High IV means options are expensive. Low IV means options are cheap. Options traders say they are "buying vol" (going long options) or "selling vol" (going short options) to describe their exposure to IV changes, independent of any directional view.</p>

<h2>IV and the Greeks</h2>
<p>Because IV is the key input that traders control, the Greeks take on a vol-centric interpretation:</p>
<ul>
  <li><strong>Vega:</strong> Direct IV exposure. If you buy a straddle and IV rises, vega profits regardless of where the stock went.</li>
  <li><strong>Gamma:</strong> The "realized vol" Greek. If actual daily moves are larger than implied, gamma scalping profits exceed theta cost — you win. This is why people say gamma is "long realized vol."</li>
  <li><strong>Theta:</strong> The cost of owning the IV insurance. You're paying the variance risk premium in real time.</li>
</ul>
<p>The core question every options trader asks is: <em>Is IV cheap or expensive relative to what the stock will actually do?</em> If IV = 25% and you think the stock will realize 35% vol, buy options. If IV = 25% and you think the stock will barely move (5% realized vol), sell options. Everything else is details.</p>
    `,
    exercise: {
      prompt: "Implement `implied_vol(C_market, S, K, T, r, option_type)` using Newton-Raphson iteration.",
      starterCode: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def bs_price(S, K, T, r, sigma, option_type="call"):
    """Black-Scholes price for call or put."""
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    if option_type == "call":
        return S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)
    else:
        return K * math.exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1)

def bs_vega_raw(S, K, T, r, sigma):
    """Raw vega: S * n(d1) * sqrt(T).  Used as f'(sigma) in Newton-Raphson."""
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    return S * norm_pdf(d1) * math.sqrt(T)

def implied_vol(C_market, S, K, T, r, option_type="call",
                sigma0=0.20, tol=1e-6, max_iter=100):
    """
    Find sigma such that bs_price(S,K,T,r,sigma,option_type) == C_market.

    Use Newton-Raphson:
        sigma_new = sigma - (bs_price(sigma) - C_market) / bs_vega_raw(sigma)

    Return sigma after convergence or max_iter steps.
    If bs_vega_raw is too small (< 1e-8), just return the current sigma.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def bs_price(S, K, T, r, sigma, option_type="call"):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    if option_type == "call":
        return S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)
    else:
        return K * math.exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1)

def bs_vega_raw(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    return S * norm_pdf(d1) * math.sqrt(T)

def implied_vol(C_market, S, K, T, r, option_type="call",
                sigma0=0.20, tol=1e-6, max_iter=100):
    sigma = sigma0
    for _ in range(max_iter):
        price = bs_price(S, K, T, r, sigma, option_type)
        vega  = bs_vega_raw(S, K, T, r, sigma)
        if vega < 1e-8:
            break
        diff = price - C_market
        if abs(diff) < tol:
            break
        sigma = sigma - diff / vega
        sigma = max(sigma, 1e-6)   # keep sigma positive
    return sigma
`,
      testFn: `
import math

# Round-trip: BS -> price -> IV -> should recover original sigma
sigma_true = 0.25
S, K, T, r = 100, 100, 0.5, 0.05
market_price = bs_price(S, K, T, r, sigma_true, "call")
iv = implied_vol(market_price, S, K, T, r, "call")
assert abs(iv - sigma_true) < 1e-4, f"Round-trip call: expected {sigma_true}, got {iv:.6f}"

# Put round-trip
put_price = bs_price(S, K, T, r, sigma_true, "put")
iv_put = implied_vol(put_price, S, K, T, r, "put")
assert abs(iv_put - sigma_true) < 1e-4, f"Round-trip put: expected {sigma_true}, got {iv_put:.6f}"

# High vol round-trip
sigma_hi = 0.60
price_hi = bs_price(100, 110, 1.0, 0.04, sigma_hi, "call")
iv_hi = implied_vol(price_hi, 100, 110, 1.0, 0.04, "call")
assert abs(iv_hi - sigma_hi) < 1e-4, f"High-vol round-trip: {iv_hi:.4f} vs {sigma_hi}"

# IV is monotone: higher market price => higher IV
price_low = bs_price(S, K, T, r, 0.15, "call")
price_mid = bs_price(S, K, T, r, 0.25, "call")
price_hi2 = bs_price(S, K, T, r, 0.40, "call")
iv_low = implied_vol(price_low, S, K, T, r)
iv_mid = implied_vol(price_mid, S, K, T, r)
iv_hi2 = implied_vol(price_hi2, S, K, T, r)
assert iv_low < iv_mid < iv_hi2, "IV should increase with market price"

print("Tests passed!")
`,
    },
  },
  {
    id: "9",
    title: "Option Strategies",
    subtitle: "Spreads, straddles, and how to use the Greeks",
    duration: "20 min",
    content: `
<h2>From Single Options to Strategies</h2>
<p>Real options trading is almost never about buying or selling a single option in isolation. Instead, traders combine options (and sometimes the underlying stock) into <strong>strategies</strong> — multi-leg structures that target specific payoff profiles, risk/reward ratios, and Greek exposures. Understanding why each strategy exists, and when to use it, is the difference between speculation and precision.</p>
<p>Every strategy can be analyzed in two dimensions: its <strong>payoff at expiration</strong> (a function of the stock price) and its <strong>Greeks profile</strong> (how it responds to moves in S, σ, and t right now). Both dimensions matter. The payoff diagram tells you where you make money at expiration; the Greeks tell you how you feel getting there.</p>

<h2>Covered Call: Selling Upside for Income</h2>
<p>The covered call is the most common options strategy used by equity investors. You own the underlying stock and sell a call option against it:</p>
<blockquote>Long 100 shares + Short 1 call (K = strike above current price)</blockquote>
<p><strong>Payoff at expiration:</strong> If S<sub>T</sub> &lt; K: you keep the stock (worth S<sub>T</sub>) plus the call premium. If S<sub>T</sub> &gt; K: you keep the premium plus K (you're forced to sell at K, capping your upside).</p>
<p><strong>Why use it?</strong> You're long the stock anyway and don't expect a large move. The call premium provides income and reduces your effective cost basis. The risk: if the stock surges past K, you miss the extra gains. The trade is explicitly giving up upside for current income.</p>
<p><strong>Greek profile:</strong> Net delta ≈ (1 − Δ_call) per share. Short vega (you want volatility to drop — it makes the short call cheaper to close). Positive theta (you earn time decay on the short call).</p>

<h2>Vertical Spreads: Defined Risk, Defined Reward</h2>
<p>A vertical spread buys one option and sells another option at a different strike with the same expiry and underlying. The spread limits both risk and reward, making it ideal when you have a directional view but want to reduce the cost and avoid unlimited naked short risk.</p>

<p><strong>Bull Call Spread:</strong> Buy a call at K₁, sell a call at K₂ &gt; K₁. Both same expiry.</p>
<ul>
  <li>Max profit: (K₂ − K₁) − net premium paid. Achieved when S<sub>T</sub> ≥ K₂.</li>
  <li>Max loss: net premium paid. Achieved when S<sub>T</sub> ≤ K₁.</li>
  <li>Breakeven: K₁ + net premium paid.</li>
</ul>
<p>You pay less than buying a naked call (the short call subsidizes the long), but you cap your upside at K₂. Use when you're moderately bullish — you don't need a home run, just a move above K₂.</p>

<p><strong>Bear Put Spread:</strong> Buy a put at K₂, sell a put at K₁ &lt; K₂. Both same expiry.</p>
<ul>
  <li>Max profit: (K₂ − K₁) − net premium paid. Achieved when S<sub>T</sub> ≤ K₁.</li>
  <li>Max loss: net premium paid. Achieved when S<sub>T</sub> ≥ K₂.</li>
</ul>
<p>Use when you're moderately bearish. The short lower-strike put subsidizes the higher-strike long put.</p>

<h2>Straddle: Trading Pure Volatility</h2>
<p>A long straddle buys a call and a put at the same strike and expiry:</p>
<blockquote>Long call (K, T) + Long put (K, T) — same strike and expiry</blockquote>
<p>The straddle profits from large moves in either direction. If the stock shoots up, the call profits. If it crashes, the put profits. The only scenario that hurts is the stock staying near K — in which case both options expire near-worthless and you lose the combined premium.</p>
<p><strong>Break-even points:</strong> K ± total premium paid. A straddle with K = 100 and total premium of $8 has break-evens at $92 and $108.</p>
<p><strong>Greek profile:</strong> Delta ≈ 0 at initiation (the call's positive delta and the put's negative delta cancel). Long gamma (profits from any large move). Short theta (pays time decay on two options). Long vega (profits when IV rises — the straddle is a bet on IV being too low right now).</p>
<p>Traders buy straddles before events (earnings, Fed decisions) when they expect a large move but are unsure of direction. They sell straddles when they believe IV is too high and the stock will stay quiet.</p>

<h2>Strangle: A Cheaper Straddle</h2>
<p>A strangle is like a straddle but uses OTM strikes instead of ATM:</p>
<blockquote>Long OTM put (K₁ &lt; S) + Long OTM call (K₂ &gt; S)</blockquote>
<p>Because both options are OTM, the premium paid is lower than a straddle. But the stock must move even further to reach the break-even points. Strangles are cheaper but require larger moves to profit.</p>

<h2>Iron Condor: Selling the Tails</h2>
<p>An iron condor combines a bull put spread and a bear call spread:</p>
<blockquote>Short put at K₂ + Long put at K₁ (K₁ &lt; K₂) + Short call at K₃ + Long call at K₄ (K₃ &lt; K₄)</blockquote>
<p>where K₁ &lt; K₂ &lt; S &lt; K₃ &lt; K₄. The position collects premium and profits as long as the stock stays between K₂ and K₃ at expiration — the "condor body." The long options at K₁ and K₄ cap losses if the stock makes a large move.</p>
<p><strong>Max profit:</strong> Net premium collected. Achieved when K₂ ≤ S<sub>T</sub> ≤ K₃.</p>
<p><strong>Max loss:</strong> Width of one spread − net premium. Achieved when S<sub>T</sub> ≤ K₁ or S<sub>T</sub> ≥ K₄.</p>
<p><strong>Greek profile:</strong> Short vega (profits from IV decrease), positive theta (time decay works for you). Net delta ≈ 0 if structured symmetrically. The iron condor is a pure volatility-selling strategy — you're betting the stock won't make a large move before expiry.</p>

<h2>Choosing the Right Strategy</h2>
<p>Each strategy expresses a specific market view:</p>
<ul>
  <li><strong>Moderately bullish:</strong> Bull call spread</li>
  <li><strong>Moderately bearish:</strong> Bear put spread</li>
  <li><strong>Big move, unclear direction:</strong> Straddle or strangle (long)</li>
  <li><strong>Stock stays flat, IV too high:</strong> Short straddle, strangle, or iron condor</li>
  <li><strong>Own stock, want income:</strong> Covered call</li>
</ul>
<p>The Greek profile should match your time horizon and risk tolerance. Buying straddles bleeds theta daily — you need your event to happen quickly. Selling iron condors collects theta slowly — you benefit from the passage of time and punish by tail moves. Understanding this alignment is what separates systematic options trading from gambling.</p>
    `,
    exercise: {
      prompt: "Implement `bull_call_spread_payoff(S_T, K1, K2, premium_paid)` — returns the P&L at expiration for a bull call spread.",
      starterCode: `def bull_call_spread_payoff(S_T, K1, K2, premium_paid):
    """
    Bull call spread: long call at K1, short call at K2 (K2 > K1).
    P&L at expiration = (call_K1_payoff - call_K2_payoff) - premium_paid

    Where:
        call_K1_payoff = max(S_T - K1, 0)
        call_K2_payoff = max(S_T - K2, 0)

    Note: premium_paid is the NET debit paid to enter the spread (positive number).
    """
    # YOUR CODE HERE
    pass

def straddle_payoff(S_T, K, premium_paid):
    """
    Long straddle: long call + long put at same strike K.
    P&L at expiration = max(S_T - K, 0) + max(K - S_T, 0) - premium_paid
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def bull_call_spread_payoff(S_T, K1, K2, premium_paid):
    call_K1 = max(S_T - K1, 0)
    call_K2 = max(S_T - K2, 0)
    return (call_K1 - call_K2) - premium_paid

def straddle_payoff(S_T, K, premium_paid):
    call_pnl = max(S_T - K, 0)
    put_pnl  = max(K - S_T, 0)
    return call_pnl + put_pnl - premium_paid
`,
      testFn: `
# Bull call spread: K1=100, K2=110, premium=3
assert bull_call_spread_payoff(115, 100, 110, 3) == 7,  "Above K2: max profit"
assert bull_call_spread_payoff(105, 100, 110, 3) == 2,  "Between strikes"
assert bull_call_spread_payoff(100, 100, 110, 3) == -3, "At K1: max loss"
assert bull_call_spread_payoff(90,  100, 110, 3) == -3, "Below K1: max loss"
assert bull_call_spread_payoff(103, 100, 110, 3) == 0,  "At breakeven (K1+premium)"

# Straddle: K=100, premium=8 (call $4 + put $4)
assert straddle_payoff(112, 100, 8) == 4,   "Above: call profit minus premium"
assert straddle_payoff(88,  100, 8) == 4,   "Below: put profit minus premium"
assert straddle_payoff(100, 100, 8) == -8,  "At strike: max loss"
assert straddle_payoff(108, 100, 8) == 0,   "Upper break-even"
assert straddle_payoff(92,  100, 8) == 0,   "Lower break-even"

# Straddle is always >= -premium
for s in [70, 80, 90, 100, 110, 120, 130]:
    assert straddle_payoff(s, 100, 8) >= -8, f"Min loss at S={s}"

print("Tests passed!")
`,
    },
  },
  {
    id: "10",
    title: "Binomial Trees",
    subtitle: "The discrete-time approach to option pricing",
    duration: "18 min",
    content: `
<h2>Why Binomial Trees?</h2>
<p>Black-Scholes is elegant but brittle. It assumes continuous trading, no jumps, constant volatility, and — critically — European exercise (the option can only be exercised at expiration). For <strong>American options</strong>, which can be exercised at any time before expiry, there is no closed-form formula. Binomial trees handle American options naturally and provide the foundation for modern numerical options pricing.</p>
<p>The key idea: instead of modeling stock prices as continuous Brownian motion, approximate the process as a discrete tree. At each time step, the stock can move up by factor u or down by factor d. With enough steps, the discrete tree converges to the continuous Black-Scholes model. But at each node, you can check whether early exercise is optimal — something Black-Scholes cannot do.</p>

<h2>The One-Period Model</h2>
<p>Start with the simplest case: one time step of length T. The stock is at S today and moves to either Su (up) or Sd (down) at expiration. We want to price a call option with strike K.</p>
<p>Define:</p>
<ul>
  <li>u = up factor (e.g., u = e<sup>σ√T</sup> in the Cox-Ross-Rubinstein model)</li>
  <li>d = down factor (e.g., d = 1/u = e<sup>−σ√T</sup>)</li>
  <li>C<sub>u</sub> = max(Su − K, 0) = option value if stock goes up</li>
  <li>C<sub>d</sub> = max(Sd − K, 0) = option value if stock goes down</li>
</ul>
<p>The option price is the expected payoff under the <strong>risk-neutral measure</strong>, discounted at the risk-free rate:</p>
<blockquote>C = e<sup>−rT</sup> · [p · C<sub>u</sub> + (1 − p) · C<sub>d</sub>]</blockquote>
<p>where the risk-neutral probability p is chosen so the stock earns the risk-free rate:</p>
<blockquote>p = (e<sup>rT</sup> − d) / (u − d)</blockquote>
<p>This is not the real-world probability of an up move — it's the probability that makes the expected return equal to r. The same risk-neutral substitution we saw in Black-Scholes.</p>

<h2>The Cox-Ross-Rubinstein (CRR) Parameterization</h2>
<p>The most common choice of u and d, introduced by Cox, Ross, and Rubinstein in 1979, is:</p>
<blockquote>u = e<sup>σ√(T/N)</sup>, &nbsp; d = e<sup>−σ√(T/N)</sup> = 1/u</blockquote>
<p>where N is the number of time steps and Δt = T/N. With this parameterization, as N → ∞, the binomial tree converges to the geometric Brownian motion of Black-Scholes. For N = 100 steps, binomial prices typically match Black-Scholes to 3–4 decimal places.</p>
<p>The risk-neutral probability becomes:</p>
<blockquote>p = (e<sup>rΔt</sup> − d) / (u − d)</blockquote>

<h2>Multi-Step Backward Induction</h2>
<p>With N steps, the stock has 2<sup>N</sup> terminal values — but because the tree recombines (an up-move followed by a down-move reaches the same node as down then up), there are only N+1 distinct terminal prices:</p>
<blockquote>S<sub>j</sub> = S · u<sup>j</sup> · d<sup>N−j</sup>, for j = 0, 1, ..., N</blockquote>
<p>The algorithm is <strong>backward induction</strong>:</p>
<ol>
  <li><strong>Terminal layer:</strong> Compute option values at expiry for all N+1 nodes: V<sub>j</sub><sup>N</sup> = max(S<sub>j</sub> − K, 0) for a call.</li>
  <li><strong>Backward step:</strong> For each earlier layer n = N−1, N−2, ..., 0, compute the "continuation value" (expected discounted future value) at each node.</li>
  <li><strong>American check:</strong> At each node, compare the continuation value to the immediate exercise value. Take the maximum. For a call: V<sub>j</sub><sup>n</sup> = max(S<sub>j</sub><sup>n</sup> − K, continuation).</li>
  <li><strong>Root:</strong> V<sub>0</sub><sup>0</sup> is the option price today.</li>
</ol>
<p>Step 3 is what makes binomial trees powerful for American options. At each node you ask: "Is it better to exercise now or wait?" Black-Scholes cannot answer this question.</p>

<h2>When Is Early Exercise Optimal?</h2>
<p>A key result from binomial tree analysis:</p>
<ul>
  <li><strong>American calls on non-dividend stocks:</strong> Never optimal to exercise early. An American call has the same price as a European call when there are no dividends. Reason: selling the call in the market always yields more than exercising it early (you lose the remaining time value).</li>
  <li><strong>American calls on dividend-paying stocks:</strong> Sometimes optimal to exercise just before the ex-dividend date, to capture the dividend. Binomial trees handle this automatically.</li>
  <li><strong>American puts:</strong> Deep ITM puts can be worth exercising early, especially when interest rates are high. Holding the put instead of exercising means you forgo the interest on K. When the interest earned on K exceeds the remaining time value, early exercise is optimal. This is a uniquely American option feature.</li>
</ul>

<h2>Convergence to Black-Scholes</h2>
<p>For a European option (no early exercise), the binomial tree price converges to the Black-Scholes formula as N → ∞. In practice:</p>
<ul>
  <li>N = 10: rough approximation (~1–2% error)</li>
  <li>N = 50: good approximation (~0.1–0.3% error)</li>
  <li>N = 200: excellent (~0.01% error, often sub-penny)</li>
</ul>
<p>The convergence is not perfectly monotone — it oscillates as N increases. This is because the odd/even step structure of the tree alternately puts the strike between nodes and exactly on a node. Techniques like the "smooth" binomial or using N and N+1 averaged results eliminate this oscillation.</p>

<h2>Beyond Binomial: Monte Carlo and Finite Difference</h2>
<p>For more complex payoffs (barrier options, Asian options, multi-asset options), other numerical methods take over. <strong>Monte Carlo simulation</strong> simulates thousands of stock price paths and averages the payoffs — it scales well to high dimensions but is slow for American options (which require knowing the optimal exercise boundary). <strong>Finite difference methods</strong> (like Crank-Nicolson) solve the Black-Scholes PDE on a grid — highly accurate, fast, and the method of choice for most derivatives desks. Binomial trees are the conceptual foundation for all of these.</p>
    `,
    exercise: {
      prompt: "Implement `binomial_european(S, K, T, r, sigma, N, option_type)` — price a European option using an N-step CRR binomial tree.",
      starterCode: `import math

def binomial_european(S, K, T, r, sigma, N=100, option_type="call"):
    """
    Price a European option using an N-step CRR binomial tree.

    CRR parameters:
        dt = T / N
        u  = exp(sigma * sqrt(dt))
        d  = 1 / u
        p  = (exp(r * dt) - d) / (u - d)   # risk-neutral probability

    Steps:
    1. Compute the N+1 terminal stock prices: S * u^j * d^(N-j) for j=0..N
    2. Compute terminal option values: max(S_j - K, 0) for call, max(K - S_j, 0) for put
    3. Discount backwards one step at a time:
           V[j] = exp(-r*dt) * (p*V[j+1] + (1-p)*V[j])
    4. Return V[0] after N backward steps.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def binomial_european(S, K, T, r, sigma, N=100, option_type="call"):
    dt = T / N
    u  = math.exp(sigma * math.sqrt(dt))
    d  = 1.0 / u
    p  = (math.exp(r * dt) - d) / (u - d)
    disc = math.exp(-r * dt)

    # Terminal stock prices and option payoffs
    V = []
    for j in range(N + 1):
        ST = S * (u ** j) * (d ** (N - j))
        if option_type == "call":
            V.append(max(ST - K, 0.0))
        else:
            V.append(max(K - ST, 0.0))

    # Backward induction (European — no early exercise check)
    for step in range(N):
        for j in range(N - step):
            V[j] = disc * (p * V[j + 1] + (1 - p) * V[j])

    return V[0]
`,
      testFn: `
import math

def norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def bs_call(S, K, T, r, sigma):
    d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))
    d2 = d1 - sigma*math.sqrt(T)
    return S*norm_cdf(d1) - K*math.exp(-r*T)*norm_cdf(d2)

def bs_put(S, K, T, r, sigma):
    d1 = (math.log(S/K) + (r + 0.5*sigma**2)*T) / (sigma*math.sqrt(T))
    d2 = d1 - sigma*math.sqrt(T)
    return K*math.exp(-r*T)*norm_cdf(-d2) - S*norm_cdf(-d1)

S, K, T, r, sigma = 100, 100, 1.0, 0.05, 0.20

# Call vs Black-Scholes (N=200, tolerance 0.05)
bc  = binomial_european(S, K, T, r, sigma, N=200, option_type="call")
bsc = bs_call(S, K, T, r, sigma)
assert abs(bc - bsc) < 0.05, f"Call: binomial={bc:.4f} BS={bsc:.4f}"

# Put vs Black-Scholes
bp  = binomial_european(S, K, T, r, sigma, N=200, option_type="put")
bsp = bs_put(S, K, T, r, sigma)
assert abs(bp - bsp) < 0.05, f"Put: binomial={bp:.4f} BS={bsp:.4f}"

# Put-call parity: C - P = S - K*exp(-rT)
parity_lhs = bc - bp
parity_rhs = S - K * math.exp(-r * T)
assert abs(parity_lhs - parity_rhs) < 0.05, f"Put-call parity: {parity_lhs:.4f} vs {parity_rhs:.4f}"

# Higher vol -> higher price
c_lo = binomial_european(S, K, T, r, 0.10, N=100, option_type="call")
c_hi = binomial_european(S, K, T, r, 0.40, N=100, option_type="call")
assert c_hi > c_lo, "Higher vol should produce higher option price"

print("Tests passed!")
`,
    },
  },
  {
    id: "11",
    title: "Rho: Interest Rate Sensitivity",
    subtitle: "The forgotten Greek that matters most when rates move",
    duration: "13 min",
    content: `
<h2>The Fifth Greek</h2>
<p>Rho (ρ) measures how much an option's price changes for a one percentage-point move in the risk-free rate. It's the least-discussed of the five Greeks traders track day to day, and for a good reason: on any given trading day, the risk-free rate barely moves, so rho's contribution to a short-dated option's P&L is usually tiny compared to delta or gamma. But "usually small" is not "always irrelevant" — and the years when it isn't small are exactly the years that catch unprepared traders off guard.</p>
<blockquote>ρ = ∂V / ∂r</blockquote>
<p>A call with ρ = 0.15 gains about $0.15 in value for every 1 percentage-point rise in the risk-free rate. That sounds negligible next to a delta of 0.60 moving the price a dollar for a dollar move in the stock. It is negligible, for a rate move of a few basis points on a normal day. It stops being negligible when the rate itself moves several percentage points over a year, which is exactly what happened from 2022 to 2023.</p>

<h2>The Formula</h2>
<blockquote>ρ<sub>call</sub> = K · T · e<sup>−rT</sup> · N(d₂) / 100<br/>ρ<sub>put</sub> = −K · T · e<sup>−rT</sup> · N(−d₂) / 100</blockquote>
<p>Unlike vega, rho is <em>not</em> the same for calls and puts — it has opposite sign. Rising rates help call holders and hurt put holders. The intuition: a call is economically similar to a leveraged long position financed at the risk-free rate. When rates rise, deferring payment of the strike price (which is what a call effectively lets you do) becomes more valuable, so the call price rises. A put is the mirror image — it's closer to a deferred short sale, and rising rates make deferring a sale less attractive.</p>
<p>As with vega, dividing by 100 expresses rho "per 1 percentage point" of rate move rather than per unit (a 1.00 move in r, i.e. a 100-point move, would be absurd). Check which convention a source uses before comparing numbers across textbooks.</p>

<h2>Why Rho Scales With Time</h2>
<p>Rho contains a T term directly in the formula, and it shows up again inside N(d₂). This means rho grows roughly linearly with time to expiration — a much stronger relationship than vega's √T scaling. A 30-day option might have a rho of $0.02; the same option struck two years out could have a rho of $1.50 or more.</p>
<p>This is why rho is nearly ignored for short-dated options and taken seriously for LEAPS (Long-term Equity AnticiPation Securities, options expiring a year or more out) and for anything priced off a long-dated bond or rate future. A trader running a book of 2-year options who ignores rho is implicitly making an unhedged bet on interest rates, whether they meant to or not.</p>

<h2>The 2022–2023 Lesson</h2>
<p>The Federal Reserve raised the federal funds rate from near 0% in March 2022 to about 5.25–5.50% by July 2023 — the fastest hiking cycle in four decades. For short-dated options, this barely registered next to the volatility from the moves themselves. For LEAPS desks and anyone holding long-dated options through the cycle, rho stopped being a rounding error. A long-dated call's rho-driven gain from that rate move alone could rival its vega-driven move from the volatility spike that accompanied it.</p>
<p>The broader lesson isn't "rho matters now, memorize a new rule." It's that every Greek's importance is conditional on the environment. Theta dominates near expiration. Vega dominates when implied vol is unstable. Rho dominates when rates are moving fast and time-to-expiry is long. Knowing which regime you're in matters more than any single number.</p>

<h2>Rho and the Discount Rate Intuition</h2>
<p>There's a simpler way to hold rho in your head, without the formula: a call option, deep in the money, behaves like owning the stock on credit — you've locked in the right to buy at K, but you haven't paid K yet. The present value of that deferred payment is K·e<sup>−rT</sup>. When r rises, that present value falls, which means the call (whose value includes "you get to keep the difference") rises. Put options work the other way: a deep ITM put is closer to a deferred sale, and the present value of the money you'll receive falls as r rises, dragging the put's value down with it.</p>
<p>This is the same K·e<sup>−rT</sup> term you've already seen in put-call parity (Lesson 2) and in the Black-Scholes formula itself (Lesson 3) — rho isn't a new idea bolted onto the model, it's what falls out when you differentiate a term that was already there.</p>

<h2>The Complete Greek Family</h2>
<table>
  <thead><tr><th>Greek</th><th>Measures sensitivity to</th><th>Typical magnitude</th></tr></thead>
  <tbody>
    <tr><td>Delta (Δ)</td><td>Stock price</td><td>Largest day-to-day driver of P&amp;L</td></tr>
    <tr><td>Gamma (Γ)</td><td>Rate of change of delta</td><td>Peaks near expiry, ATM</td></tr>
    <tr><td>Theta (Θ)</td><td>Time decay</td><td>Accelerates into expiration</td></tr>
    <tr><td>Vega (ν)</td><td>Implied volatility</td><td>Peaks for long-dated ATM options</td></tr>
    <tr><td>Rho (ρ)</td><td>Interest rates</td><td>Grows linearly with time to expiry</td></tr>
  </tbody>
</table>
<p>Every professional options desk tracks all five, even when four of them are doing all the work on a given day. The one you ignored is the one that eventually costs you.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-formula",
        title: "Rho (Call)",
        formula: "ρ = K · T · e^(−rT) · N(d₂) / 100",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 1, min: 0.05, max: 3, step: 0.05 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 20, min: 5, max: 80, step: 1 },
        ],
        computeId: "rhoCall",
        resultLabel: "Rho (per 1% rate move)",
        resultPrefix: "$",
        decimals: 3,
      },
    ],
    exercise: {
      prompt: "Implement `compute_rho(S, K, T, r, sigma, option_type=\"call\")`, returning rho per 1% move in the risk-free rate.",
      starterCode: `import math

def _norm_cdf(x):
    """Standard normal CDF: N(x)"""
    return 0.5 * math.erfc(-x / math.sqrt(2))

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def _d2(S, K, T, r, sigma):
    return _d1(S, K, T, r, sigma) - sigma * math.sqrt(T)

def compute_rho(S, K, T, r, sigma, option_type="call"):
    """
    Rho, per 1 percentage-point move in the risk-free rate.

    Call: rho = K * T * exp(-r*T) * N(d2)  / 100
    Put:  rho = -K * T * exp(-r*T) * N(-d2) / 100
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def _norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def _d2(S, K, T, r, sigma):
    return _d1(S, K, T, r, sigma) - sigma * math.sqrt(T)

def compute_rho(S, K, T, r, sigma, option_type="call"):
    d2 = _d2(S, K, T, r, sigma)
    if option_type == "call":
        return K * T * math.exp(-r * T) * _norm_cdf(d2) / 100
    else:
        return -K * T * math.exp(-r * T) * _norm_cdf(-d2) / 100
`,
      testFn: `
# Call rho is positive
rc = compute_rho(100, 100, 1.0, 0.05, 0.20, "call")
assert rc > 0, f"Call rho must be positive: {rc}"

# Put rho is negative
rp = compute_rho(100, 100, 1.0, 0.05, 0.20, "put")
assert rp < 0, f"Put rho must be negative: {rp}"

# Rho grows with time to expiry (call)
r_1y = compute_rho(100, 100, 1.0, 0.05, 0.20, "call")
r_5y = compute_rho(100, 100, 5.0, 0.05, 0.20, "call")
assert r_5y > r_1y, "Longer-dated calls should have larger rho"

# Rho magnitude roughly matches a known reference value
r_ref = compute_rho(100, 100, 1.0, 0.05, 0.20, "call")
assert 0.4 < r_ref < 0.7, f"ATM 1yr call rho out of expected range: {r_ref:.3f}"

# Deep ITM call has larger rho than deep OTM call (more likely to be exercised,
# so the deferred-payment value of K matters more)
r_itm = compute_rho(150, 100, 1.0, 0.05, 0.20, "call")
r_otm = compute_rho(60, 100, 1.0, 0.05, 0.20, "call")
assert r_itm > r_otm, "Deep ITM call should have larger rho than deep OTM call"

print("Tests passed!")
`,
    },
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export interface ComingSoonLesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  symbol: string;
}

export const COMING_SOON: ComingSoonLesson[] = [];
