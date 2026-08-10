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

/**
 * A larger interactive tool (payoff diagram, binomial lattice) dropped inline
 * the same way a FormulaSandbox is — keyed by `type` instead of `computeId`
 * since these have their own dedicated components rather than a plug-in
 * compute function.
 */
export interface LessonVisual {
  afterSectionId: string;
  type: "payoffDiagram" | "binomialTree";
}

/**
 * "Before this lesson" box — what background it assumes, plus somewhere to
 * go if you don't have it yet. Optional: earlier lessons in a track can lean
 * on the lesson before them instead of repeating a prereq note every time.
 */
export interface LessonPrereqs {
  /** One line: the background this lesson assumes. Plain language, not a topic list. */
  summary: string;
  /** 1-2 outside resources for anyone missing that background. Keep it short. */
  resources?: { label: string; url: string }[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  content: string; // markdown-like HTML string
  prereqs?: LessonPrereqs;
  sandboxes?: FormulaSandboxConfig[];
  visuals?: LessonVisual[];
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
    prereqs: {
      summary: "Comfortable with the stock basics from Investing Fundamentals (what a share is, how prices move) — no options background assumed.",
      resources: [
        { label: "Investopedia — Options Basics", url: "https://www.investopedia.com/options-basics-tutorial-4583012" },
      ],
    },
    content: `
<h2>A 2,600-Year-Old Idea</h2>
<p>Options feel like a modern financial invention, but they're not. Around 600 BCE, the Greek philosopher Thales of Miletus studied the stars, decided a bumper olive harvest was coming, and acted on it — except he didn't have the money to buy up olive presses outright. So he paid a small deposit for the right to rent them at a fixed price once harvest season arrived. His prediction turned out right, demand for presses spiked, and Thales exercised that right, rented the presses at the price he'd locked in, and sublet them at the much higher going rate. The spread was his profit. Without knowing it, he'd just traded the first option on record.</p>
<p>The modern market traces to April 26, 1973, when the Chicago Board Options Exchange opened its doors — the same year Fischer Black and Myron Scholes published the formula we'll dig into in Lesson 3. Before the CBOE, options changed hands informally between dealers, with no standard terms and nobody guaranteeing either side would actually pay up. The CBOE fixed that: standardized contracts, public quotes, a clearinghouse backing every trade. Day one volume was a modest 911 contracts. Today it's roughly <strong>40 million options contracts</strong> trading daily on U.S. exchanges alone.</p>

<h2>The Core Idea</h2>
<p>An option is a contract giving its buyer the <strong>right, but not the obligation</strong>, to buy or sell something at a set price, on or before a set date. Every option, no matter how exotic it gets later, boils down to three numbers:</p>
<ul>
  <li><strong>Underlying (S):</strong> whatever the option is written on — usually a stock, but it could be an index, ETF, commodity, or currency</li>
  <li><strong>Strike price (K):</strong> the price at which the holder gets to buy or sell, also called the exercise price</li>
  <li><strong>Expiration date (T):</strong> the last day the option can be used. Miss it and, if it wasn't exercised, the contract just expires worthless</li>
</ul>
<p>Whatever you pay to own the option itself is the <strong>premium</strong> — and it's also the absolute most you can ever lose as the buyer.</p>

<h2>Calls and Puts</h2>
<p>There are only two flavors:</p>
<ul>
  <li>A <strong>call option</strong> gives you the right to <em>buy</em> the underlying at the strike. You want the price to go up.</li>
  <li>A <strong>put option</strong> gives you the right to <em>sell</em> the underlying at the strike. You want the price to go down.</li>
</ul>
<p>Every option trade has two sides. The <strong>buyer</strong> (long) hands over the premium and holds the right to act. The <strong>seller</strong> (short, or "writer") pockets that premium up front but is on the hook to fulfill the contract if the buyer decides to exercise.</p>

<h2>A Concrete Example</h2>
<p>Say Apple (AAPL) is trading at $190 and you think it's heading higher before next month's earnings. You buy one call option:</p>
<ul>
  <li>Strike: $195</li>
  <li>Expiration: 30 days</li>
  <li>Premium: $4.50 per share</li>
</ul>
<p>Since one standard equity option contract covers <strong>100 shares</strong>, that premium costs you $450 total.</p>
<p><strong>Scenario A — AAPL rises to $210 by expiration:</strong> you exercise, buying 100 shares at $195 and immediately selling at $210. That's $1,500 gross profit. Subtract the $450 you paid and you've netted $1,050 — a 233% return on the money you actually risked.</p>
<p><strong>Scenario B — AAPL sits at $190 through expiration:</strong> the call expires worthless and you lose the full $450 premium. Painful, but notice what didn't happen — you didn't lose anywhere near the $19,000 you'd have been out if you'd bought 100 shares outright and the stock went nowhere.</p>
<p>That asymmetry is the whole appeal of options in one sentence: <strong>limited downside, leveraged upside</strong>.</p>

<h2>American vs. European Options</h2>
<p>Options also come in two exercise styles:</p>
<ul>
  <li><strong>American options</strong> can be exercised any time before expiration — most U.S.-listed stock options work this way.</li>
  <li><strong>European options</strong> can only be exercised right at expiration, not a day before. Most index options (SPX, NDX) are European-style, and — slightly confusingly — the Black-Scholes formula we derive in Lesson 3 is technically built for European options only.</li>
</ul>
<p>The right to exercise early is genuinely valuable for puts, especially deep in-the-money ones, but rarely worth much for calls on stocks that don't pay dividends. We'll come back to exactly why in the Binomial Trees lesson.</p>

<h2>Intrinsic Value vs. Extrinsic Value</h2>
<p>Every option's premium is really two things stacked together:</p>
<ul>
  <li><strong>Intrinsic value</strong> — what you'd pocket if you exercised this instant. For a call: max(S − K, 0). For a put: max(K − S, 0). It's never negative; the worst case is zero.</li>
  <li><strong>Extrinsic value</strong> (or "time value") — everything left over. It's the market pricing in the chance the option gains more intrinsic value before it expires, driven mostly by how much time is left and how volatile the stock is.</li>
</ul>
<p>Concrete example: AAPL at $190, a $185-strike call trading at $9.00. Intrinsic value is $5.00, so the remaining $4.00 is extrinsic value. An option should always trade at or above its intrinsic value — if it didn't, you could exercise and resell for a free, instant profit, and the market doesn't leave that sitting around for long.</p>

<h2>Moneyness</h2>
<p>"Moneyness" is just a way of describing where the stock price sits relative to the strike:</p>
<ul>
  <li><strong>In-the-money (ITM):</strong> positive intrinsic value. Call: S &gt; K. Put: S &lt; K.</li>
  <li><strong>At-the-money (ATM):</strong> S ≈ K. Intrinsic value is close to zero, but this is where extrinsic value peaks for a given expiration.</li>
  <li><strong>Out-of-the-money (OTM):</strong> zero intrinsic value. Call: S &lt; K. Put: S &gt; K. What you're paying for here is pure time value — essentially a bet that the stock moves far enough, fast enough.</li>
</ul>
<p>Deep OTM options are cheap in dollar terms but extremely leveraged — a $0.10 option that pays off $5 hands you a 50x return. They're also the most likely to end up worthless: CBOE data puts the share of options held to expiration that expire with zero value above 70%.</p>

<h2>Why Options Exist</h2>
<p>Strip away the speculation and three legitimate uses actually drive this market:</p>
<ol>
  <li><strong>Hedging:</strong> a fund manager sitting on 10,000 shares of Apple might buy puts as insurance against a crash — a small, known premium in exchange for capping how much they can lose.</li>
  <li><strong>Speculation:</strong> traders use options to bet on direction or volatility with a defined, capped downside and outsized leverage.</li>
  <li><strong>Income generation:</strong> shareholders sell covered calls against stock they already own, collecting premium as income in exchange for giving up some of the upside if the stock rips higher.</li>
</ol>
<p>Knowing which of these three a given trade actually serves matters more than it sounds — the exact same instrument, a put option, can be portfolio insurance for a hedger, a leveraged short bet for a speculator, or a cash-secured income play for a seller, all at once, depending only on who's on which side.</p>
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
    prereqs: {
      summary: "Builds directly on Lesson 1's call and put definitions. Comfortable rearranging a simple algebraic equation.",
    },
    content: `
<h2>The Most Important Relationship in Options</h2>
<p>Put-call parity is a no-arbitrage rule linking the price of a European call, a European put, the underlying stock, and a risk-free bond. What makes it powerful is what it doesn't require: no assumption about which way the stock is headed, how volatile it is, or anything about the future at all. It falls straight out of one idea — that free money doesn't just sit around waiting to be picked up. Spend the time to really understand this relationship and you'll walk away knowing more about how options pricing actually works than you would from memorizing a dozen formulas.</p>
<p>The relationship itself:</p>
<blockquote><strong>C − P = S − K · e<sup>−rT</sup></strong></blockquote>
<p>C is the call price, P the put price, S the current stock price, K the strike both options share, r the continuously compounded risk-free rate, and T the time to expiration in years. That K · e<sup>−rT</sup> term is just the present value of K — how much you'd need to invest today at the risk-free rate to have exactly K in hand at expiration.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>Play with S, K, r, and T and watch the right-hand side, S − K·e<sup>−rT</sup>, move. That's exactly what C − P has to equal, no matter what the market's current sentiment is — it's an accounting identity, not a prediction.</p>
</div>

<h2>The Proof: Two Portfolios, One Payoff</h2>
<p>Here's the cleanest way to see why the formula has to be true. Build two portfolios today, hold both to expiration at time T, and compare what each one pays out.</p>
<p><strong>Portfolio A:</strong> buy one European call at strike K, and invest K · e<sup>−rT</sup> in a risk-free bond.</p>
<p><strong>Portfolio B:</strong> buy one European put at strike K, and buy one share of the stock.</p>
<p>Let S<sub>T</sub> be the stock price at time T, and check both portfolios in both possible worlds.</p>
<p><strong>If S<sub>T</sub> &gt; K (the call finishes in-the-money):</strong></p>
<ul>
  <li>Portfolio A: the call pays S<sub>T</sub> − K, the bond matures to K. Total: <strong>S<sub>T</sub></strong>.</li>
  <li>Portfolio B: the put expires worthless, the stock is worth S<sub>T</sub>. Total: <strong>S<sub>T</sub></strong>.</li>
</ul>
<p><strong>If S<sub>T</sub> &lt; K (the put finishes in-the-money):</strong></p>
<ul>
  <li>Portfolio A: the call expires worthless, the bond matures to K. Total: <strong>K</strong>.</li>
  <li>Portfolio B: the put pays K − S<sub>T</sub>, the stock is worth S<sub>T</sub>. Total: K − S<sub>T</sub> + S<sub>T</sub> = <strong>K</strong>.</li>
</ul>
<p>Either way, Portfolio A and Portfolio B pay out exactly the same amount: max(S<sub>T</sub>, K). Two portfolios with identical, guaranteed future cash flows have to cost the same today — if one were cheaper, you could buy it, short the pricier one, and pocket a riskless profit. Economists call this the <strong>law of one price</strong>, and it's about as close to an iron law as finance gets.</p>
<p>So C + K · e<sup>−rT</sup> = P + S, and rearranging that gives you back C − P = S − K · e<sup>−rT</sup>.</p>

<h2>What Happens When Parity Breaks?</h2>
<p>It's not entirely unbreakable, though — just very hard to break for long. Researchers later documented real put-call parity violations in equity options during the 2008 crisis. As Lehman Brothers was collapsing, puts on financial stocks traded dramatically rich relative to calls, and the usual arbitrage that should have closed the gap couldn't run: regulators had temporarily banned short selling in financial stocks, so the trade that would normally correct the mispricing simply wasn't available. It's a useful reminder that no-arbitrage relationships only hold as long as every leg of the trade stays executable.</p>
<p>Outside a crisis, though, any parity violation gets found and closed within milliseconds by algorithmic traders. Few relationships in finance are enforced as tightly as this one.</p>

<h2>Synthetic Positions</h2>
<p>Rearrange put-call parity a few different ways and you get four equivalences every options trader eventually memorizes:</p>
<ul>
  <li><strong>Synthetic long stock:</strong> C − P + K · e<sup>−rT</sup> = S. Buy a call, sell a put, invest PV(K), and you've recreated owning the stock outright.</li>
  <li><strong>Synthetic call:</strong> C = P + S − K · e<sup>−rT</sup>. If calls look overpriced, you can build one yourself out of a put plus the stock.</li>
  <li><strong>Synthetic put:</strong> P = C − S + K · e<sup>−rT</sup>. Know the call price and you can back out exactly what the put should cost.</li>
  <li><strong>Box spread:</strong> buy a call spread and sell a put spread at the same two strikes. The payoff at expiration is always the fixed gap K<sub>2</sub> − K<sub>1</sub>, no matter where the stock lands — so the box has to trade at that gap's present value. Market makers use box spreads to effectively borrow and lend at whatever rate the options market implies.</li>
</ul>

<h2>Dividends and Early Exercise</h2>
<p>Everything above assumes the stock pays no dividends. Once it does, with present value PV(D), the relationship needs one more term:</p>
<blockquote>C − P = S − PV(D) − K · e<sup>−rT</sup></blockquote>
<p>This isn't just a footnote — it shows up in real trading. In the days before a large dividend, holders of deep in-the-money American calls sometimes exercise early specifically to capture that dividend, which is exactly the situation where American and European option prices start to diverge. The dividend-adjusted version of parity is what lets you predict when that's likely to happen.</p>

<h2>A Numerical Example</h2>
<p>AAPL trades at $190. A 90-day call at K = $190 trades at $8.50. The risk-free rate is 5%, and there are no dividends. What should the put be worth?</p>
<p>Start from P = C − S + K · e<sup>−rT</sup>:</p>
<p>K · e<sup>−rT</sup> = 190 · e<sup>−0.05 × 0.25</sup> = 190 · 0.9876 = $187.64</p>
<p>P = $8.50 − $190 + $187.64 = <strong>$6.14</strong></p>
<p>Now say the market's actually quoting the put at $7.50 — that's a real violation, and here's how you'd capture it: short the put at $7.50, buy the call at $8.50, short the stock at $190, and invest $187.64 at the risk-free rate. Net cash in your pocket today: $7.50 − $8.50 + $190 − $187.64 = $1.36. Every leg cancels out at expiration no matter where AAPL ends up — the $1.36 is yours, risk-free, from a pricing inconsistency alone.</p>
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
    prereqs: {
      summary: "Comfortable with exponents and natural logs, and willing to treat the normal distribution N(d) as a lookup at first — it's explained here, not assumed.",
      resources: [
        { label: "Khan Academy — Exponential & logarithmic functions", url: "https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:exp-log" },
        { label: "Khan Academy — Normal distributions", url: "https://www.khanacademy.org/math/statistics-probability/modeling-distributions-of-data/normal-distributions-library" },
      ],
    },
    content: `
<h2>The Nobel Prize Formula</h2>
<p>On May 1, 1973 — just five days after the CBOE opened for trading — the <em>Journal of Political Economy</em> published "The Pricing of Options and Corporate Liabilities" by Fischer Black and Myron Scholes. Two journals had already rejected it. In 1997, Scholes and Robert Merton shared the Nobel Prize in Economics for the work (Black had passed away in 1995 and Nobels aren't awarded posthumously), with the committee calling it "a major contribution to economic sciences" — which undersells it a bit, honestly.</p>
<p>What the formula actually did was give options a real, theoretical price for the first time. Before 1973, pricing an option was mostly a matter of feel and negotiation. After 1973, there was an actual number to anchor around — and within a few years, nearly every options trader on the planet was using some version of it. The CBOE went as far as handing traders on its floor calculators pre-programmed with the formula.</p>

<h2>The Setup: Geometric Brownian Motion</h2>
<p>Black and Scholes needed a model of how stock prices move, and they landed on <strong>geometric Brownian motion (GBM)</strong>. The core idea: over a tiny slice of time, the <em>percentage</em> change in a stock's price is normally distributed, with mean μ dt and standard deviation σ √dt — μ being the expected return, σ the volatility.</p>
<p>Written out: dS = μS dt + σS dW<sub>t</sub>, where dW<sub>t</sub> is one increment of a Wiener process — a continuous-time random walk. This has a nice consequence: log returns, log(S<sub>t</sub>/S<sub>0</sub>), end up normally distributed, which makes the stock price itself <strong>log-normally distributed</strong>. That's actually the sensible outcome — prices can never dip below zero, and a 10% gain followed by a 10% loss doesn't get you back to where you started, which is exactly the kind of asymmetry a log-normal distribution captures and a normal one doesn't.</p>
<p>Under this model, the price at time T starting from today's price S works out to:</p>
<blockquote>S<sub>T</sub> = S · exp((μ − σ²/2)T + σ√T · Z)</blockquote>
<p>with Z ~ N(0,1). That σ²/2 term is a small correction from Jensen's inequality — since log is a concave function, the expected log return ends up a touch below μ.</p>

<h2>The Key Insight: Risk-Neutral Pricing</h2>
<p>Here's the part of the paper that made everyone sit up: <strong>the option's price turns out not to depend on the stock's expected return μ at all</strong>. That sounds wrong on first read — shouldn't a call option on a stock everyone expects to rise be worth more?</p>
<p>The reasoning behind it is subtle but airtight. If you hold a call and continuously delta-hedge it — constantly buying and selling the underlying to stay delta-neutral — you can strip out all the directional risk from the position entirely. Whatever's left over is a hedged portfolio that has to earn exactly the risk-free rate, or there's an arbitrage sitting right there. But notice what that means: the drift μ never actually appears in the pricing equation — it cancels out completely. You can price the option as if the stock simply grows at the risk-free rate r, regardless of what anyone actually believes about it. That's <strong>risk-neutral pricing</strong>.</p>
<p>Mechanically, that just means swapping μ for r in the GBM formula:</p>
<blockquote>S<sub>T</sub> = S · exp((r − σ²/2)T + σ√T · Z), where Z ~ N(0,1)</blockquote>
<p>From there, the option's price is simply the expected payoff under this risk-neutral world, discounted back at the risk-free rate.</p>

<h2>The Black-Scholes Formula</h2>
<p>Take the expected value of max(S<sub>T</sub> − K, 0) under that log-normal distribution, discount it, and out comes the formula everyone knows:</p>
<blockquote>
  <strong>C = S · N(d₁) − K · e<sup>−rT</sup> · N(d₂)</strong><br/>
  <strong>P = K · e<sup>−rT</sup> · N(−d₂) − S · N(−d₁)</strong>
</blockquote>
<p>where:</p>
<ul>
  <li>d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)</li>
  <li>d₂ = d₁ − σ·√T = [ln(S/K) + (r − σ²/2)·T] / (σ·√T)</li>
  <li>N(·) is the standard normal CDF — the probability a standard normal variable falls below a given value</li>
</ul>

<h2>Interpreting Each Term</h2>
<p>The formula isn't just symbol-pushing — each piece has a clean, readable meaning. For a call:</p>
<ul>
  <li><strong>N(d₂)</strong> is the risk-neutral probability the call finishes in-the-money (S<sub>T</sub> &gt; K) — roughly, the odds you actually end up owning the stock.</li>
  <li><strong>N(d₁)</strong> is a delta-adjusted version of that same probability — the expected fraction of the stock's value you effectively hold through the option. It's always a touch bigger than N(d₂), a consequence of the log-normal distribution's skew.</li>
  <li><strong>S · N(d₁)</strong> is the present value of receiving the stock, conditional on the call getting exercised.</li>
  <li><strong>K · e<sup>−rT</sup> · N(d₂)</strong> is the present value of having to pay the strike K, conditional on that same exercise.</li>
</ul>
<p>So the call's price is really just what you get minus what you pay — the stock side minus the strike side — each one weighted by its probability and discounted back to today.</p>

<h2>What d₁ and d₂ Measure</h2>
<p>d₁ and d₂ are best thought of as standardized versions of "how deep in-the-money is this option":</p>
<ul>
  <li>ln(S/K) captures the distance between stock and strike in log-space — positive means S &gt; K, an in-the-money call</li>
  <li>(r + σ²/2)·T adjusts for the log-normal process's built-in drift</li>
  <li>σ·√T rescales everything by how much uncertainty has accumulated over the option's life</li>
</ul>
<p>Two sanity checks worth internalizing: as T → 0 approaching expiration, the whole formula collapses down to plain intrinsic value, C → max(S − K, 0). And as σ → 0, meaning a world with no uncertainty at all, it gives you exactly the discounted certain payoff. Both edge cases behave exactly the way common sense says they should.</p>

<h2>The Assumptions (and Their Violations)</h2>
<p>Black-Scholes rests on five assumptions, and every single one of them is at least somewhat wrong in the real world:</p>
<ol>
  <li><strong>Constant volatility:</strong> real volatility drifts over time and varies by strike. That's exactly why traders talk about a "volatility smile" — different implied vols at different strikes — which is, strictly speaking, a direct contradiction of the model's own assumptions.</li>
  <li><strong>Log-normal returns:</strong> real stock returns have fatter tails than a log-normal distribution predicts — extreme moves happen far more often than the model expects. Black Monday in 1987, when the Dow fell 22.6% in a single day, was a 27-sigma event under Black-Scholes — a move the model says should essentially never happen.</li>
  <li><strong>No jumps:</strong> stocks gap overnight and on news constantly. GBM only knows how to model smooth, continuous price paths.</li>
  <li><strong>Continuous trading at zero cost:</strong> proper delta hedging needs constant rebalancing. Real trading happens in discrete chunks and comes with real transaction costs.</li>
  <li><strong>Constant risk-free rate:</strong> rates move, and that matters more the longer an option's maturity stretches out.</li>
</ol>
<p>None of that has retired the formula, though. Traders don't use Black-Scholes because they believe its output is literally correct — they use it as a shared language, a common way to quote <strong>implied volatility</strong>, which is where Lesson 8 picks up.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-black-scholes-formula",
        title: "Black-Scholes Call Price",
        formula: "C = S·N(d₁) − K·e^(−rT)·N(d₂)",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 1, min: 0.05, max: 3, step: 0.05 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 20, min: 5, max: 80, step: 1 },
        ],
        computeId: "blackScholesCall",
        resultLabel: "Call price",
        resultPrefix: "$",
        decimals: 2,
      },
    ],
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
    prereqs: {
      summary: "Builds directly on the Black-Scholes formula from Lesson 3 — Delta is just one of its terms, isolated and explained.",
    },
    content: `
<h2>The First Derivative</h2>
<p>The "Greeks" are just partial derivatives — how much the option's price shifts as you nudge each input to Black-Scholes. Delta (Δ) is the one traders reach for first, because it measures the option's sensitivity to the thing that matters most: the <em>stock price</em>.</p>
<blockquote>Δ = ∂V / ∂S</blockquote>
<p>Translated into plain English: if the stock moves up $1, the option moves roughly Δ dollars. A call with Δ = 0.60 gains about $0.60 for every $1 the stock rises. "Roughly" and "about" are doing real work in that sentence — it's a linear approximation that gets more accurate the smaller the stock's move actually is.</p>

<h2>Delta Ranges and What They Mean</h2>
<ul>
  <li><strong>Call delta:</strong> always somewhere between 0 and +1. Deep out-of-the-money calls sit near 0; deep in-the-money calls sit near 1.</li>
  <li><strong>Put delta:</strong> always between −1 and 0. Deep OTM puts sit near 0; deep ITM puts sit near −1.</li>
</ul>
<p>Straight from Black-Scholes:</p>
<blockquote>
  Δ<sub>call</sub> = N(d₁)<br/>
  Δ<sub>put</sub>  = N(d₁) − 1 = −N(−d₁)
</blockquote>
<p>Notice that Δ<sub>call</sub> + |Δ<sub>put</sub>| = N(d₁) + N(−d₁) = 1 — and this isn't a coincidence. It falls straight out of put-call parity from Lesson 2: a long call plus a short put at the same strike replicates owning the stock outright, so their deltas have no choice but to add up to exactly one.</p>

<h2>Delta as a Probability Proxy</h2>
<p>There's a handy shortcut buried in delta: it's a rough stand-in for the probability an option finishes in-the-money. An at-the-money option with Δ ≈ 0.50 is close to a coin flip. A deep OTM call at Δ = 0.05 has maybe a 5% shot.</p>
<p>It's an approximation, not an identity — the actual risk-neutral probability is N(d₂), not N(d₁) — but for short-dated options the gap is tiny, and the shortcut earns its keep day to day. Ask any options trader what a "30-delta" or "70-delta" strike means and they'll answer in terms of probability without even thinking about it.</p>

<h2>Delta Hedging: How Market Makers Think</h2>
<p>The real payoff of knowing delta is that it tells you exactly how to cancel out an option's directional risk: hold Δ shares of the underlying against it. That's <strong>delta hedging</strong>, and a position with zero net delta is <strong>delta-neutral</strong>.</p>
<p>Say a market maker sells 100 call contracts — options on 10,000 shares total — each with Δ = 0.45. To hedge, she buys 4,500 shares (10,000 × 0.45). Her net delta lands at zero, so small moves in the stock barely touch her P&L either way. Her actual profit comes from the bid-ask spread she captured on the trade, not from any view on where the stock is headed.</p>
<p>The catch is that delta doesn't sit still — it shifts as the stock moves, which is exactly what gamma (Lesson 6) measures. Stock rises, the call's delta creeps higher as it moves further in-the-money, and she has to buy more shares to stay hedged. Stock falls, she sells some back. She's constantly rebalancing, a process traders call <strong>delta-gamma hedging</strong> — and the cost of doing that rebalancing over and over is essentially how the option's premium gets "spent" over its life.</p>

<h2>Delta in Practice: Real Numbers</h2>
<p>Take an SPY option: S = 450, K = 450, T = 30 days (0.082 years), r = 5.25%, σ = 18%.</p>
<p>First, d₁: ln(450/450) + (0.0525 + 0.18²/2) × 0.082, all over 0.18 × √0.082 — that's (0 + 0.00563) / 0.0515 ≈ 0.109.</p>
<p>So Δ<sub>call</sub> = N(0.109) ≈ 0.544. A $1 move in SPY nudges this at-the-money call by about $0.544 — not the clean $0.50 you might guess, because of that r + σ²/2 drift term tucked inside d₁.</p>

<h2>Portfolio Delta and Dollar Delta</h2>
<p>What makes delta so useful in practice is that it's additive — you can just sum it across an entire portfolio. Take a portfolio manager holding:</p>
<ul>
  <li>500 shares of AAPL (Δ = 1 each): +500 portfolio delta</li>
  <li>10 AAPL call contracts (Δ = 0.4, 100 shares each): +400 portfolio delta</li>
  <li>5 AAPL put contracts (Δ = −0.3, 100 shares each): −150 portfolio delta</li>
</ul>
<p>Add it up: 500 + 400 − 150 = +750. For small moves, this whole portfolio behaves just like owning 750 plain shares of AAPL. To flatten it out entirely, sell 750 shares — or buy enough puts to offset that same 750 of delta.</p>
<p><strong>Dollar delta</strong> just scales that by the stock price: 750 × $190 = $142,500. A 1% move in AAPL shifts this portfolio's value by roughly $1,425.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "delta-ranges-and-what-they-mean",
        title: "Delta (Call)",
        formula: "Δ = N(d₁)",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 450, min: 20, max: 600, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 450, min: 20, max: 600, step: 1 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 0.08, min: 0.01, max: 2, step: 0.01 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5.25, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 18, min: 5, max: 80, step: 1 },
        ],
        computeId: "deltaCall",
        resultLabel: "Delta",
        decimals: 3,
      },
    ],
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
    prereqs: {
      summary: "Builds on Delta (Lesson 4) — same Black-Scholes formula, a different partial derivative.",
    },
    content: `
<h2>Options Are Wasting Assets</h2>
<p>Every option carries an expiration date, and that changes its whole character compared to just owning the stock. Every day that passes without the underlying moving in your favor, the option loses a little value — not because anything bad happened, but simply because there's now less time left for things to go your way. That erosion has a name, <strong>time decay</strong>, and a Greek letter attached to it: theta (Θ).</p>
<p>Theta is the option price's partial derivative with respect to time:</p>
<blockquote>Θ = ∂V / ∂t</blockquote>
<p>By convention it's quoted as the dollar change per calendar day, and for a long option it's almost always negative — time only ever works against you when you're the one holding the option.</p>
<p>Own a call with Θ = −0.05 and you're bleeding roughly $0.05 a day from decay alone, everything else held equal. Sit through a three-day weekend and that's about $0.15 gone with the stock not having moved a cent.</p>

<h2>The Formula</h2>
<p>For a European call, Black-Scholes gives:</p>
<blockquote>
  Θ<sub>call</sub> = [−S · n(d₁) · σ / (2√T) − r · K · e<sup>−rT</sup> · N(d₂)] / 365
</blockquote>
<p>and for a put:</p>
<blockquote>
  Θ<sub>put</sub> = [−S · n(d₁) · σ / (2√T) + r · K · e<sup>−rT</sup> · N(−d₂)] / 365
</blockquote>
<p>n(·) here is the standard normal PDF, not the CDF you saw earlier — a different function, easy to mix up. Dividing by 365 just converts the annualized number into something per-day. The first term, built around n(d₁), is always negative and captures pure optionality bleeding away. The second term is really interest accruing on the strike, and it can flip positive for puts — which is exactly why deep in-the-money puts occasionally show slightly positive theta, a quirk that surprises people the first time they see it.</p>

<h2>Time Decay Is Not Linear</h2>
<p>Here's the practical fact that matters more than the formula: <strong>time decay speeds up the closer you get to expiration</strong>. An at-the-money option doesn't shed a tidy 1/365th of its value each day — it loses far more in its final days than in its first.</p>
<p>The reason traces back to extrinsic value being roughly proportional to σ√T, the "vol-time" product. As T shrinks, √T doesn't shrink at a constant rate — its rate of change accelerates:</p>
<blockquote>d(√T)/dt = 1/(2√T)</blockquote>
<p>and that expression blows up as T approaches zero. An ATM option with 30 days left is decaying meaningfully faster, day for day, than the identical option with 180 days left. As a rough rule of thumb, roughly half of an ATM option's remaining time value disappears in just the final quarter of its life.</p>
<p>That's exactly why option sellers love the last few weeks before expiration — theta is paying out fastest right there. And it's why option buyers feel the clock pressing harder every day: each day of waiting costs more than the one before it.</p>

<h2>Theta and Volatility: The ATM Peak</h2>
<p>Theta hits its most negative point exactly at-the-money. That might seem backwards at first, but it tracks: ATM options carry the most extrinsic value of any strike, so naturally they have the most extrinsic value left to lose.</p>
<p>Deep ITM options barely have any extrinsic value left to decay. Deep OTM options are cheap for the same reason — barely any extrinsic value to begin with. The ATM strike sits at the peak of extrinsic value, and so it sits at the peak of theta exposure too.</p>
<p>Concretely: with S = K = 100, T = 30 days, r = 5%, σ = 20%, the ATM call's theta comes out to about −$0.045/day. Shift to an OTM call (K = 110) and it drops to roughly −$0.012/day. An ITM call (K = 92) lands around −$0.023/day — smaller than ATM, bigger than the OTM strike, exactly as you'd expect from the shape of extrinsic value.</p>

<h2>The Theta-Gamma Tradeoff: The Central Tension</h2>
<p>Theta and gamma are effectively two sides of the same coin in options trading — you cannot pick up one without paying for it with the other. That's not a rule of thumb; it falls directly out of the Black-Scholes partial differential equation:</p>
<blockquote>Θ + ½σ²S²Γ + rSΔ − rV = 0</blockquote>
<p>Every option price has to satisfy this equation. Simplify it for a delta-hedged position and you get roughly Θ ≈ −½σ²S²Γ — theta and gamma sit on opposite sides of zero and scale together.</p>
<ul>
  <li><strong>Long options (long gamma, negative theta):</strong> you benefit from a big move in either direction — gamma hands you a favorable delta adjustment "for free" as the stock moves. The cost is theta bleeding out every single day you're waiting. You're implicitly rooting for volatility to actually show up.</li>
  <li><strong>Short options (short gamma, positive theta):</strong> theta pays you every day, but a large move in the stock hurts. You're rooting for the opposite — quiet markets and time passing without incident.</li>
</ul>
<p>This tradeoff is the lens every professional options trader structures positions through — "how much gamma am I paying for with this theta?" is close to the central question of the whole business. A market maker delta-hedging an ATM option is long gamma and paying theta at the same time, which means she needs the stock to actually move enough, and often enough, to earn back what theta is quietly costing her. That hunt for enough movement to cover the decay has its own name: <strong>gamma scalping</strong>.</p>

<h2>Calendar Spreads: Trading Pure Theta</h2>
<p>A <strong>calendar spread</strong> is built specifically to exploit the theta gap between near-term and far-term options. Sell the near-term option, which decays fast and carries high theta, and buy a far-term option at the same strike, which decays much more slowly. Net theta on the position ends up positive: if the stock parks itself near the strike, the short leg decays away faster than the long leg loses value, and the difference is your profit.</p>
<p>It's really a volatility bet dressed up as a time-decay trade — you want near-term realized volatility to stay low, so the short leg expires worthless, while hoping forward-looking volatility stays elevated enough to keep the long leg valuable.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-formula",
        title: "Theta (Call)",
        formula: "Θ = [−S·n(d₁)·σ/(2√T) − r·K·e^(−rT)·N(d₂)] / 365",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 0.08, min: 0.01, max: 2, step: 0.01 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 20, min: 5, max: 80, step: 1 },
        ],
        computeId: "thetaCall",
        resultLabel: "Theta (per day)",
        resultPrefix: "$",
        decimals: 4,
      },
    ],
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
    prereqs: {
      summary: "Builds directly on Delta (Lesson 4) — Gamma is defined as Delta's own rate of change.",
    },
    content: `
<h2>The Second Derivative</h2>
<p>Delta tells you how much an option's price moves for a small move in the stock. But delta doesn't hold still either — it shifts as the stock moves, and gamma measures exactly how fast:</p>
<blockquote>Γ = ∂Δ / ∂S = ∂²V / ∂S²</blockquote>
<p>Gamma is the second derivative of the option price with respect to the stock price — it's what captures the <em>curvature</em>, or convexity, in how the option's value bends as the stock moves. Take a call with Δ = 0.50 and Γ = 0.06: after a $1 rise, delta ticks up to roughly 0.56; after $2, roughly 0.62. The option is picking up more delta the further the stock rises in its favor — that's positive convexity, and it's precisely what you're paying for when you buy an option.</p>

<h2>The Formula</h2>
<blockquote>Γ = n(d₁) / (S · σ · √T)</blockquote>
<p>with n(d₁) the standard normal PDF at d₁. Two facts worth internalizing here:</p>
<ol>
  <li><strong>Gamma is always positive for long options</strong> — calls and puts alike. Being long any option means you benefit from a big move in either direction, which is exactly what positive convexity gives you.</li>
  <li><strong>The formula is identical for calls and puts.</strong> Same strike, same expiry, same gamma — no exceptions. This is really just put-call parity again in disguise: C − P = S − PV(K) means ∂²C/∂S² = ∂²P/∂S² has to hold too.</li>
</ol>

<h2>Where Gamma Lives: ATM Near Expiry</h2>
<p>Gamma isn't spread evenly across strikes and maturities — it concentrates hard around <strong>at-the-money options close to expiration</strong>. Here's the intuition for why.</p>
<p>Picture delta as expiration approaches on an ATM option. With a full year left, a $1 stock move barely nudges the odds of finishing ITM or OTM — delta drifts slowly. With one day left, a $1 move can flip the option from "almost surely worthless" to "almost surely in the money" — delta lurches violently. That violent shift, packed into a tiny window, is what high gamma looks like.</p>
<p>Numbers make it concrete: an ATM option with a year to go might carry Γ = 0.02, meaning delta shifts just 0.02 per $1 stock move. The same option with a week left might sit at Γ = 0.15. The option is effectively "pinned" to the strike — small moves in either direction suddenly decide everything.</p>

<h2>Gamma Risk: The Pin and the Explosion</h2>
<p>That concentrated gamma creates two distinct headaches professionals watch closely.</p>
<p><strong>Pin risk:</strong> when a heavily-traded strike sits right where the stock is trading near expiration, market makers who sold those options are forced into aggressive delta-hedging. Stock ticks above the strike, they buy shares as delta climbs toward 1; it ticks below, they sell as delta falls toward 0. That hedging creates a kind of self-fulfilling gravity — the stock can end up "pinned" near the strike as hedgers chase delta from both sides at once. Traders call this the "max pain" effect, and it's visible in large-cap names on monthly options-expiration Fridays.</p>
<p><strong>Gamma explosion:</strong> in the last days before expiration, 0DTE (zero-days-to-expiration) options carry enormous gamma. A modest 5-point move in SPX can shift a 0DTE option's delta by 0.40 or more in minutes. Market makers short those options can face effectively unlimited delta exposure from moves that would be trivial on a longer-dated contract. 0DTE volume has exploded in recent years — now over 40% of SPX options volume — and that shift has genuinely changed how professionals think about hedging intraday.</p>

<h2>Gamma Scalping: Profiting from Moves</h2>
<p>Someone long gamma — long options, delta-hedged — can turn volatility itself into profit through a strategy called <strong>gamma scalping</strong>. The mechanics run like this:</p>
<ol>
  <li>Buy ATM options and delta-hedge down to neutral.</li>
  <li>Stock rises → delta drifts positive (that's gamma at work) → sell some stock to rebalance back to neutral. You just sold into strength.</li>
  <li>Stock falls back → delta drifts negative → buy stock to rebalance. You just bought into weakness.</li>
  <li>Each round trip locks in a small, real profit, roughly proportional to the squared stock move times gamma: P&L ≈ ½Γ(ΔS)².</li>
</ol>
<p>Nothing here is free, though — you're still paying theta every day for the privilege of holding this position. Gamma scalping only turns a profit if realized volatility ends up beating the implied volatility baked into the options you bought. Pay for 20% implied vol and the stock only actually moves like 15%, and theta will eat you faster than the rebalancing can pay you back. That comparison — implied vol versus what actually happens — is close to the central question every options trader is implicitly asking.</p>

<h2>The Black-Scholes PDE Revisited</h2>
<p>Back to the Black-Scholes PDE from the theta lesson:</p>
<blockquote>Θ + ½σ²S²Γ + rSΔ − rV = 0</blockquote>
<p>For a fully delta-hedged portfolio (net Δ = 0), that simplifies down to:</p>
<blockquote>Θ + ½σ²S²Γ = rV (roughly)</blockquote>
<p>½σ²S²Γ is the expected "gamma P&L" from the stock jiggling around, and Θ is what that gamma costs you in decay. In equilibrium, they exactly cancel out. Read as a sentence, the equation is saying something almost philosophical: the expected profit from continuously rebalancing a gamma position exactly offsets its theta cost, leaving nothing but a risk-free return behind. That balance is the mathematical fingerprint of an option being fairly priced under Black-Scholes.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-formula",
        title: "Gamma",
        formula: "Γ = n(d₁) / (S·σ·√T)",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 1, min: 0.02, max: 2, step: 0.02 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 20, min: 5, max: 80, step: 1 },
        ],
        computeId: "gammaCall",
        resultLabel: "Gamma",
        decimals: 4,
      },
    ],
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
    prereqs: {
      summary: "Builds on the Greeks introduced in Lessons 4–6 (Delta, Theta, Gamma) — same formula family, one more term.",
    },
    content: `
<h2>The Volatility Greek</h2>
<p>Vega (ν) measures how much an option's price shifts for a one-percentage-point change in implied volatility. It might be the single most important Greek for a professional, because professional options trading is, at its core, mostly about <em>trading volatility itself</em> — not about guessing which way a stock is headed.</p>
<blockquote>ν = ∂V / ∂σ</blockquote>
<p>An ATM one-year call with ν = 0.40 picks up $0.40 in value for every 1-point rise in implied vol. Push IV from 20% to 25% and that call gains roughly $2.00 from vega alone — the stock itself doesn't have to move an inch.</p>
<p>A small aside worth knowing: despite the name, vega isn't actually a Greek letter. Traders made it up. Academic papers sometimes use κ (kappa) or λ (lambda) instead for the same concept — "vega" just stuck because it sounds Greek enough and conveniently starts with a V, for volatility.</p>

<h2>The Formula</h2>
<blockquote>ν = S · n(d₁) · √T / 100</blockquote>
<p>with n(d₁) the standard normal PDF. Like gamma, this formula is <strong>identical for calls and puts</strong> — same strike, same expiry, same vega, no exceptions. Once again, put-call parity is why: C − P = S − PV(K) differentiated with respect to σ gives ∂C/∂σ = ∂P/∂σ directly.</p>
<p>The /100 just rescales from "per unit of vol" to "per percentage point" — a convenience, not a law of nature. Some textbooks skip that division, which means their answer is 100x bigger than what you'd get here. Always check which convention you're reading before comparing numbers across sources.</p>

<h2>Vega Is Largest for ATM Long-Dated Options</h2>
<p>Two things drive how much vega an option carries:</p>
<ul>
  <li><strong>Moneyness:</strong> vega peaks right at the ATM strike and tapers off on either side. Deep OTM options are close to binary bets — they'll be worth either a lot or nothing — so a small shift in vol barely changes that calculus. Deep ITM options are close to certain to be exercised regardless, so vol doesn't move the needle much there either.</li>
  <li><strong>Time to expiry:</strong> vega scales with √T. A 1-year ATM option carries roughly √12 ≈ 3.46× the vega of a 1-month ATM option — more time on the clock means more room for volatility to actually matter.</li>
</ul>
<p>The upshot is that long-dated options behave more like a bet on volatility than a bet on direction. A 2-year LEAPS option might sit around $0.80 of vega — a 5-point move in vol shifts its price by $4, often more than the delta-driven move you'd get from a comparable stretch of time.</p>

<h2>Implied Volatility: The Market's Forecast</h2>
<p>Black-Scholes takes σ as one of its inputs, but here's the catch: nobody can actually observe σ directly. What you do observe is the option's <em>market price</em>. So traders run the formula backwards — given this market price, what σ would make Black-Scholes spit out that exact number? That backed-out σ is <strong>implied volatility (IV)</strong>.</p>
<p>IV isn't a forecast of how volatile the stock will actually be — think of it instead as the market's collective price tag for uncertainty. Historically, IV runs above realized volatility by roughly 1–3 percentage points on average, a gap known as the <strong>variance risk premium</strong>. That gap is why selling options has historically been profitable on average — at the cost of the occasional brutal loss when volatility spikes without warning.</p>

<h2>The Volatility Surface: Where Black-Scholes Breaks Down</h2>
<p>If Black-Scholes were exactly right, every option on the same stock and expiry would carry the same implied vol. In reality, they don't come close. Plot IV against strike and you get the famous <strong>volatility smile</strong> — or in equities, more often a skew.</p>
<p><strong>Equity skew:</strong> for index options like SPX and SPY, OTM puts consistently trade at higher IV than ATM options, which in turn trade higher than OTM calls. It's lopsided, not symmetric — a skew rather than a smile — and a few things explain why:</p>
<ol>
  <li><strong>Crash risk demand:</strong> investors are willing to pay up for put protection as portfolio insurance, and that demand for OTM puts specifically pushes their IV higher.</li>
  <li><strong>Leverage effect:</strong> when stock prices drop, companies effectively become more leveraged — debt stays fixed while equity value shrinks — and that raises volatility. Crashes and vol spikes tend to arrive together.</li>
  <li><strong>Stochastic volatility:</strong> real-world volatility isn't a constant at all — it moves around, and it tends to move opposite to stock returns.</li>
</ol>
<p><strong>FX smile:</strong> currency options tend to show something closer to a real, symmetric smile — both OTM puts and OTM calls trade rich relative to ATM. That fits currencies, which can spike sharply in either direction with roughly equal plausibility.</p>

<h2>VIX: The Fear Index</h2>
<p>The CBOE Volatility Index — the VIX — is arguably the single most-watched number in markets. It captures what the market expects S&P 500 volatility to be over the next 30 days, built from a basket of SPX options spanning many strikes.</p>
<p>It's quoted as an annualized volatility percentage. A VIX of 20 says the market expects roughly 20% annualized volatility, which works out to daily moves around 20%/√252 ≈ 1.26%.</p>
<p>Some context for where VIX has actually landed historically:</p>
<ul>
  <li><strong>2017:</strong> VIX averaged 11.1 — the calmest year on record. Options were historically cheap all year.</li>
  <li><strong>2008 (Lehman crisis):</strong> VIX hit 89.5 in October 2008. Options got extraordinarily expensive.</li>
  <li><strong>March 2020 (COVID crash):</strong> VIX peaked at 85.5 on March 18, 2020 — the second-highest reading ever recorded.</li>
  <li><strong>Normal range:</strong> roughly 12–25 in calm markets, 25–40 under stress, 40+ during outright crises.</li>
</ul>
<p>It's nicknamed the "fear index" because it spikes exactly when investors are scrambling to buy protective puts. A rising VIX simply means the options market is pricing in more uncertainty — that reading says nothing on its own about whether stocks are actually going up or down.</p>

<h2>Vega in Portfolio Management</h2>
<p>Any sizable options book has a net vega — how sensitive its total value is to a broad shift up or down in the volatility surface. A portfolio that's <em>long vega</em> gains when IV rises, benefiting from fear and uncertainty. One that's <em>short vega</em> — a fund that systematically sells options to collect premium, say — gains when IV falls and gets hurt when it spikes.</p>
<p>The 2018 "Volmageddon" episode is the cautionary tale everyone in the industry knows. Several funds were running short-VIX, short-vega strategies through instruments tied to VIX futures. On February 5, 2018, VIX doubled in a single day, a move nobody had modeled for. One product, XIV, lost 96% of its value overnight and was forcibly liquidated. Understanding vega — and respecting how fast volatility can spike — isn't an academic exercise. For anyone actually trading options, it's closer to a survival requirement.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-formula",
        title: "Vega",
        formula: "ν = S·n(d₁)·√T / 100",
        variables: [
          { key: "stock", label: "Stock price (S)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "strike", label: "Strike price (K)", unit: "$", defaultValue: 100, min: 20, max: 300, step: 1 },
          { key: "time", label: "Time to expiry (T)", unit: "yrs", defaultValue: 1, min: 0.05, max: 3, step: 0.05 },
          { key: "rate", label: "Risk-free rate (r)", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 20, min: 5, max: 80, step: 1 },
        ],
        computeId: "vegaCall",
        resultLabel: "Vega (per 1% vol move)",
        resultPrefix: "$",
        decimals: 3,
      },
    ],
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
    prereqs: {
      summary: "Builds on Black-Scholes (Lesson 3) and Vega (Lesson 7). The numerical solving method (Newton-Raphson) is taught from scratch — no prior exposure needed.",
      resources: [
        { label: "Khan Academy — Newton's method", url: "https://www.khanacademy.org/math/ap-calculus-ab/ab-differential-equations-new/ab-7-8/a/newtons-method-review" },
      ],
    },
    content: `
<h2>Inverting the Formula</h2>
<p>Feed Black-Scholes its five usual inputs — S, K, T, r, and σ — and it hands back an option price. But that's backwards from how the real market actually works. What you actually observe every day is a price, set by whoever's willing to buy and sell at that level — nobody hands you σ directly. So the real question traders ask is the mirror image of the formula: what value of σ, plugged in, would make Black-Scholes reproduce the price the market is already quoting?</p>
<p>That backed-out σ is <strong>implied volatility (IV)</strong> — literally the volatility implied by the price. An option trading at $5.80 that Black-Scholes matches exactly at σ = 0.20 has an implied vol of 20%, full stop.</p>
<p>There's no algebraic shortcut for this inversion — no closed-form way to solve for σ given C. Instead you need a numerical root-finder, hunting for where this hits zero:</p>
<blockquote>f(σ) = BS(S, K, T, r, σ) − C<sub>market</sub> = 0</blockquote>
<p>The two standard tools are <strong>bisection</strong> — reliable but slow — and <strong>Newton-Raphson</strong> — fast, if occasionally finicky. Professionals lean on Newton-Raphson because for typical options it converges in just 4 to 6 iterations.</p>

<h2>Newton-Raphson: The Fast Way</h2>
<p>Newton-Raphson refines a guess using the function's own derivative:</p>
<blockquote>σ<sub>n+1</sub> = σ<sub>n</sub> − f(σ<sub>n</sub>) / f′(σ<sub>n</sub>)</blockquote>
<p>Here f(σ) = BS_price(σ) − C_market, and f′(σ) is nothing other than vega — specifically the raw, unscaled vega, S · n(d₁) · √T, not the per-1% version from Lesson 7. Written out fully:</p>
<blockquote>σ<sub>n+1</sub> = σ<sub>n</sub> − (BS(σ<sub>n</sub>) − C<sub>market</sub>) / Vega(σ<sub>n</sub>)</blockquote>
<p>Start from a reasonable guess like σ₀ = 0.20 and 5–10 iterations usually get you 6+ decimal places of precision for a typical option.</p>
<p>The one place this breaks is when vega itself is close to zero — deep OTM or very short-dated options — where the update step can blow up or bounce around. Solid implementations fall back to bisection whenever vega gets too small to trust.</p>

<h2>IV as the Market's Price of Uncertainty</h2>
<p>It's worth repeating: implied vol isn't a forecast of how volatile the stock will actually turn out to be. It's the market's <em>asking price</em> for uncertainty, and a few things follow from that framing:</p>
<ul>
  <li><strong>IV ≠ realized vol:</strong> across history, IV has averaged roughly 1–3 percentage points above the volatility that actually ended up materializing. That gap is the <strong>variance risk premium</strong>, and it's essentially why systematically selling options has been profitable on average over long stretches — you're being paid for underwriting an insurance policy.</li>
  <li><strong>IV can miss in either direction:</strong> in quiet stretches it tends to undershoot what actually happens, making options look cheap in hindsight. Ahead of known events — Fed meetings, earnings — it typically overshoots, pricing in a known dose of uncertainty in advance.</li>
  <li><strong>IV looks forward, realized vol looks back:</strong> one tells you what already happened, the other tells you what the market's currently afraid might happen. Around big events, the two can diverge sharply.</li>
</ul>

<h2>The Volatility Surface</h2>
<p>In a world where Black-Scholes held exactly, every option on the same underlying and expiry would share one IV. Real markets don't cooperate — IV varies by both <em>strike</em> and <em>time to expiry</em> at once, tracing out a full two-dimensional <strong>volatility surface</strong>.</p>
<p><strong>Term structure:</strong> IV generally rises with time to expiry — more time, more room for the market to worry — though this can flip during a crisis, when short-dated IV spikes above long-dated IV as acute fear takes over.</p>
<p><strong>Skew / smile:</strong> on equity index options like SPX and SPY, OTM puts consistently price at higher IV than ATM options, which in turn price higher than OTM calls — this lopsided shape is the <strong>volatility skew</strong>, and it comes from a few compounding effects:</p>
<ol>
  <li><strong>Demand for downside protection:</strong> investors buy OTM puts as insurance, and that steady demand pushes their price, and therefore their IV, up.</li>
  <li><strong>The leverage effect:</strong> falling stock prices reliably coincide with rising volatility — it's well documented empirically — so OTM puts are protecting against exactly the scenario where vol is spiking too, making them extra valuable.</li>
  <li><strong>Crash risk premium:</strong> markets tend to fall much faster than they climb, an asymmetry in the tails, and OTM puts get priced with that asymmetry baked in.</li>
</ol>
<p>FX options usually show something closer to a true, symmetric smile instead — both OTM puts and OTM calls trade rich to ATM — because a currency can plausibly spike hard in either direction, not just down.</p>

<h2>Practical IV Numbers</h2>
<p>A few reference points to build intuition:</p>
<ul>
  <li>SPY 30-day ATM IV: typically 12–18% in calm markets, 25–40% under stress</li>
  <li>Individual stocks: often 25–60% for large-caps, 60–150%+ for small-caps and biotech names</li>
  <li>VIX (the SPX 30-day IV index): 11–15 is extreme calm, 20–25 normal, 30–40 stressed, 40+ crisis territory</li>
</ul>
<p>High IV means options are pricey; low IV means they're cheap. Traders describe positioning around this as "buying vol" (going long options) or "selling vol" (going short options) — language that captures pure exposure to IV moving, independent of any view on stock direction.</p>

<h2>IV and the Greeks</h2>
<p>Because IV is the input traders are most actively fighting over, the Greeks all take on a vol-flavored reading once you look at them this way:</p>
<ul>
  <li><strong>Vega:</strong> pure IV exposure. Buy a straddle and if IV rises, vega books a profit no matter which way the stock actually went.</li>
  <li><strong>Gamma:</strong> the "realized vol" Greek. If the stock's actual daily moves outrun what was priced in, gamma scalping profits beat the theta bill — you come out ahead. That's the sense in which gamma is "long realized vol."</li>
  <li><strong>Theta:</strong> what you pay to hold that IV insurance. It's the variance risk premium being deducted from your account, in real time, day by day.</li>
</ul>
<p>Underneath all of it, every options trader is really asking one question: <em>is IV cheap or expensive relative to what this stock is actually going to do?</em> Think IV of 25% is too low for a stock about to realize 35% vol — buy options. Think that same 25% is wildly overpriced for a stock that's going to sit still at 5% realized vol — sell them. Everything else in this lesson is detail in service of answering that one question.</p>
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
    prereqs: {
      summary: "Builds on calls and puts (Lesson 1) and payoff thinking — no new math beyond what's already covered.",
    },
    content: `
<h2>From Single Options to Strategies</h2>
<p>Almost nobody trading options professionally is just buying or selling one contract in isolation. Real trading combines options — and sometimes the underlying stock itself — into <strong>strategies</strong>: multi-leg structures built to target a specific payoff shape, a specific risk-to-reward ratio, and a specific set of Greek exposures. Knowing why a given strategy exists, and exactly when it's the right tool, is what separates deliberate positioning from just placing a bet and hoping.</p>
<p>Every strategy is worth analyzing on two separate axes: its <strong>payoff at expiration</strong> — a function purely of where the stock ends up — and its <strong>Greeks profile</strong> — how it behaves right now as S, σ, and t shift underneath it. You need both. The payoff diagram tells you where the money is at the finish line; the Greeks tell you what the ride there actually feels like.</p>

<h2>Covered Call: Selling Upside for Income</h2>
<p>The covered call is the single most common strategy among equity investors who dabble in options. You already own the stock, and you sell a call against it:</p>
<blockquote>Long 100 shares + Short 1 call (K = strike above current price)</blockquote>
<p><strong>Payoff at expiration:</strong> if S<sub>T</sub> &lt; K, you keep the stock at its current value plus the premium you collected. If S<sub>T</sub> &gt; K, you're forced to sell at K, but you keep both the premium and the sale proceeds — your upside is simply capped there.</p>
<p><strong>Why bother?</strong> You were holding the stock anyway and don't expect a huge move soon, so collecting premium against it lowers your effective cost basis. The tradeoff is explicit: if the stock rips well past K, you leave real money on the table. You're deliberately trading some upside for income today.</p>
<p><strong>Greek profile:</strong> net delta lands around (1 − Δ_call) per share. Short vega — you want implied vol to fall, since that makes buying back the short call cheaper. Positive theta — time decay on that short call works in your favor every day.</p>

<h2>Vertical Spreads: Defined Risk, Defined Reward</h2>
<p>A vertical spread buys one option and sells another at a different strike, same expiry, same underlying. Structuring it this way caps both your risk and your reward — exactly what you want when you have a directional view but don't want to pay full price for a naked option, or take on its unlimited downside.</p>

<p><strong>Bull Call Spread:</strong> buy a call at K₁, sell a call at K₂ &gt; K₁, same expiration on both.</p>
<ul>
  <li>Max profit: (K₂ − K₁) − net premium paid, reached once S<sub>T</sub> ≥ K₂</li>
  <li>Max loss: just the net premium paid, if S<sub>T</sub> ≤ K₁</li>
  <li>Breakeven: K₁ + net premium paid</li>
</ul>
<p>You pay less up front than a naked call — the short leg subsidizes the long one — but you give up anything above K₂. Reach for this when you're moderately bullish and don't need a home run, just a move past K₂.</p>

<p><strong>Bear Put Spread:</strong> buy a put at K₂, sell a put at K₁ &lt; K₂, same expiry.</p>
<ul>
  <li>Max profit: (K₂ − K₁) − net premium paid, reached once S<sub>T</sub> ≤ K₁</li>
  <li>Max loss: the net premium paid, if S<sub>T</sub> ≥ K₂</li>
</ul>
<p>The mirror image, for when you're moderately bearish — the cheaper lower-strike short put subsidizes the higher-strike long put you actually want.</p>

<h2>Straddle: Trading Pure Volatility</h2>
<p>A long straddle buys a call and a put at the same strike and expiry:</p>
<blockquote>Long call (K, T) + Long put (K, T) — same strike and expiry</blockquote>
<p>This position profits from a big move in either direction — the call catches the upside, the put catches the downside. The one scenario that actually hurts is the stock going nowhere: both legs expire close to worthless and you lose the combined premium you paid for both.</p>
<p><strong>Break-even points:</strong> K ± total premium paid. A straddle at K = 100 with $8 total premium breaks even at $92 and $108.</p>
<p><strong>Greek profile:</strong> delta starts near zero — the call's positive delta and put's negative delta cancel out at initiation. Long gamma, since any large move helps. Short theta, since you're paying decay on two options simultaneously. Long vega — the whole position is fundamentally a bet that implied vol is currently priced too low.</p>
<p>Traders reach for long straddles ahead of known catalysts — earnings, Fed meetings — when they expect a big move but have no edge on direction. They sell straddles instead when they think IV is overpriced and the stock is going to sit still.</p>

<h2>Strangle: A Cheaper Straddle</h2>
<p>A strangle is the same idea as a straddle, just built with OTM strikes instead of ATM ones:</p>
<blockquote>Long OTM put (K₁ &lt; S) + Long OTM call (K₂ &gt; S)</blockquote>
<p>Since both legs start out-of-the-money, the total premium is lower than an equivalent straddle — but the stock has to travel further to reach either break-even point. Cheaper entry, bigger move required.</p>

<h2>Iron Condor: Selling the Tails</h2>
<p>An iron condor stitches together a bull put spread and a bear call spread:</p>
<blockquote>Short put at K₂ + Long put at K₁ (K₁ &lt; K₂) + Short call at K₃ + Long call at K₄ (K₃ &lt; K₄)</blockquote>
<p>with K₁ &lt; K₂ &lt; S &lt; K₃ &lt; K₄. The position collects premium up front and stays profitable as long as the stock finishes between K₂ and K₃ — the "condor body." The long options out at K₁ and K₄ exist purely to cap the damage if the stock makes a genuinely large move.</p>
<p><strong>Max profit:</strong> the net premium collected, if K₂ ≤ S<sub>T</sub> ≤ K₃.</p>
<p><strong>Max loss:</strong> the width of one spread minus that premium, if S<sub>T</sub> ≤ K₁ or S<sub>T</sub> ≥ K₄.</p>
<p><strong>Greek profile:</strong> short vega, so falling IV helps you. Positive theta, so time passing helps you too. Net delta sits close to zero if you build it symmetrically. In short, the iron condor is a pure volatility-selling play — you're betting the stock stays inside its range through expiration.</p>

<h2>Choosing the Right Strategy</h2>
<p>Every strategy above is, at bottom, a specific market view wearing a different outfit:</p>
<ul>
  <li><strong>Moderately bullish:</strong> bull call spread</li>
  <li><strong>Moderately bearish:</strong> bear put spread</li>
  <li><strong>Big move coming, direction unclear:</strong> long straddle or strangle</li>
  <li><strong>Stock likely flat, IV feels too high:</strong> short straddle, strangle, or iron condor</li>
  <li><strong>Already own the stock, want income:</strong> covered call</li>
</ul>
<p>Whichever you pick, its Greek profile needs to actually match your time horizon and risk appetite. Long straddles bleed theta every single day, so you need your catalyst to actually arrive on schedule. Short iron condors collect theta slowly and steadily, rewarding patience but punishing you hard if the stock breaks out of its range. Matching the position to the view — not just the view to the trade idea — is what separates systematic options trading from gambling with extra steps.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try it</span>
  <p>Build any of the strategies above with the tool below and watch its payoff shape change in real time.</p>
</div>
    `,
    visuals: [{ afterSectionId: "choosing-the-right-strategy", type: "payoffDiagram" }],
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
    prereqs: {
      summary: "Builds on Black-Scholes (Lesson 3); comfortable with basic probability (expected value of a coin-flip-style outcome).",
      resources: [
        { label: "Khan Academy — Expected value", url: "https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library/random-variables-discrete/v/expected-value-of-a-discrete-random-variable" },
      ],
    },
    content: `
<h2>Why Binomial Trees?</h2>
<p>Black-Scholes is elegant, but it's also brittle in a specific way: it assumes continuous trading, no price jumps, constant volatility, and — the important one here — European-style exercise, meaning the option can only ever be exercised right at expiration. <strong>American options</strong>, which can be exercised any time before that, have no closed-form Black-Scholes-style formula at all. Binomial trees fill that gap, and they're also the conceptual foundation nearly every numerical options-pricing method builds on.</p>
<p>The core idea is to trade continuous randomness for something you can actually compute: instead of modeling the stock as continuous Brownian motion, chop time into discrete steps. At each step the stock either moves up by factor u or down by factor d. Take enough steps and this discrete tree converges right back to the same continuous Black-Scholes model — but along the way, at every single node, you get to ask a question Black-Scholes structurally can't answer: would exercising right now beat waiting?</p>

<h2>The One-Period Model</h2>
<p>Start as simple as possible: one time step of length T. The stock sits at S today and lands at either Su or Sd by expiration. We want to price a call at strike K.</p>
<p>Define:</p>
<ul>
  <li>u = the up factor (e.g., u = e<sup>σ√T</sup> in the Cox-Ross-Rubinstein setup)</li>
  <li>d = the down factor (e.g., d = 1/u = e<sup>−σ√T</sup>)</li>
  <li>C<sub>u</sub> = max(Su − K, 0), the option's value if the stock goes up</li>
  <li>C<sub>d</sub> = max(Sd − K, 0), the option's value if it goes down</li>
</ul>
<p>The option's price today is the expected payoff under the <strong>risk-neutral measure</strong>, discounted back at the risk-free rate:</p>
<blockquote>C = e<sup>−rT</sup> · [p · C<sub>u</sub> + (1 − p) · C<sub>d</sub>]</blockquote>
<p>with the risk-neutral probability p chosen specifically so the stock's expected return works out to exactly the risk-free rate:</p>
<blockquote>p = (e<sup>rT</sup> − d) / (u − d)</blockquote>
<p>Worth being clear about: p is not anyone's real-world estimate of the odds of an up move. It's a constructed probability that makes the math come out to risk-free — the exact same risk-neutral trick from the Black-Scholes lesson, just in discrete form.</p>

<h2>The Cox-Ross-Rubinstein (CRR) Parameterization</h2>
<p>The standard choice for u and d, from Cox, Ross, and Rubinstein's 1979 paper:</p>
<blockquote>u = e<sup>σ√(T/N)</sup>, &nbsp; d = e<sup>−σ√(T/N)</sup> = 1/u</blockquote>
<p>with N the number of steps and Δt = T/N. As N grows toward infinity, this tree converges exactly onto the geometric Brownian motion underlying Black-Scholes — in practice, N = 100 steps already matches Black-Scholes to 3–4 decimal places.</p>
<p>The risk-neutral probability becomes:</p>
<blockquote>p = (e<sup>rΔt</sup> − d) / (u − d)</blockquote>

<h2>Multi-Step Backward Induction</h2>
<p>With N steps, the stock technically has 2<sup>N</sup> possible paths — but the tree recombines, since an up-then-down move ends up at the same node as down-then-up, so there are only N+1 distinct terminal prices to worry about:</p>
<blockquote>S<sub>j</sub> = S · u<sup>j</sup> · d<sup>N−j</sup>, for j = 0, 1, ..., N</blockquote>
<p>From there, the algorithm — <strong>backward induction</strong> — walks the tree from the future back to today:</p>
<ol>
  <li><strong>Terminal layer:</strong> compute the option's value at every one of the N+1 nodes at expiry: V<sub>j</sub><sup>N</sup> = max(S<sub>j</sub> − K, 0) for a call.</li>
  <li><strong>Backward step:</strong> walk back one layer at a time, n = N−1, N−2, ..., 0, computing each node's "continuation value" — the expected, discounted value of holding rather than exercising.</li>
  <li><strong>American check:</strong> at every node, compare that continuation value against the payoff of exercising right now, and keep whichever is bigger. For a call: V<sub>j</sub><sup>n</sup> = max(S<sub>j</sub><sup>n</sup> − K, continuation).</li>
  <li><strong>Root:</strong> V<sub>0</sub><sup>0</sup> — the value sitting at the very start of the tree — is today's option price.</li>
</ol>
<p>Step 3 is the whole reason this method exists for American options. At every single node you're explicitly asking "exercise now, or wait?" — a question Black-Scholes has no mechanism to even pose.</p>

<h2>When Is Early Exercise Optimal?</h2>
<p>Run this analysis enough times and a few consistent patterns fall out:</p>
<ul>
  <li><strong>American calls on non-dividend stocks:</strong> exercising early is never optimal. An American call on a stock with no dividends is worth exactly the same as its European counterpart — selling the call in the market always beats exercising it, since exercising throws away whatever time value is left.</li>
  <li><strong>American calls on dividend-paying stocks:</strong> here it can actually make sense to exercise right before the ex-dividend date, purely to capture that dividend. Binomial trees handle this case automatically, without any special-casing.</li>
  <li><strong>American puts:</strong> deep in-the-money puts can genuinely be worth exercising early, especially when rates are high — holding onto the put instead of exercising means giving up the interest you'd earn on K in the meantime. Once that forgone interest outweighs the remaining time value, early exercise wins. This is a feature entirely unique to American-style options.</li>
</ul>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try it</span>
  <p>Click through the lattice below — American vs. European, call vs. put — and watch which nodes choose to exercise early.</p>
</div>

<h2>Convergence to Black-Scholes</h2>
<p>For a European option, with no early-exercise decision to make, the binomial price converges cleanly onto Black-Scholes as N grows. Roughly:</p>
<ul>
  <li>N = 10: a rough approximation, roughly 1–2% error</li>
  <li>N = 50: solidly good, roughly 0.1–0.3% error</li>
  <li>N = 200: excellent, often accurate to well under a penny</li>
</ul>
<p>That convergence isn't perfectly smooth, though — it oscillates as N increases, because the tree's odd/even step structure alternately lands the strike exactly on a node or squarely between two nodes. Techniques like "smoothed" binomial trees, or simply averaging results from N and N+1 steps, iron out that oscillation.</p>

<h2>Beyond Binomial: Monte Carlo and Finite Difference</h2>
<p>For trickier payoffs — barrier options, Asian options, anything with multiple underlying assets — other numerical methods take over where binomial trees start to strain. <strong>Monte Carlo simulation</strong> runs thousands of simulated price paths and averages the resulting payoffs; it scales gracefully to high-dimensional problems but struggles with American options, since those need you to actually know the optimal exercise boundary in advance. <strong>Finite difference methods</strong>, like Crank-Nicolson, instead solve the Black-Scholes PDE directly on a grid — fast, highly accurate, and the go-to choice on most real derivatives desks. Every one of these methods, though, borrows its core logic straight from the binomial tree.</p>
    `,
    visuals: [{ afterSectionId: "when-is-early-exercise-optimal", type: "binomialTree" }],
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
    prereqs: {
      summary: "Builds on the Greeks from Lessons 4–7 — same formula family, the last of the five.",
    },
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
