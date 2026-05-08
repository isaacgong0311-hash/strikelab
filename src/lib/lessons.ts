export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  content: string; // markdown-like HTML string
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
    duration: "10 min",
    content: `
<h2>Options give you the right, but not the obligation</h2>
<p>Imagine you find a house you love listed at $400,000. You're not ready to buy yet, but you're afraid the price will go up. So you pay the seller $5,000 for the <strong>right to buy the house at $400,000 any time in the next 6 months</strong>. That's an option.</p>
<p>In finance:</p>
<ul>
  <li>A <strong>call option</strong> gives you the right to <em>buy</em> a stock at a fixed price (the <strong>strike</strong>) before a fixed date (the <strong>expiry</strong>).</li>
  <li>A <strong>put option</strong> gives you the right to <em>sell</em> a stock at the strike price.</li>
</ul>
<p>The price you pay for this right is called the <strong>premium</strong>.</p>

<h2>Intrinsic vs. Extrinsic Value</h2>
<p>An option's premium has two components:</p>
<ul>
  <li><strong>Intrinsic value:</strong> how much you'd make if you exercised right now. For a call: max(S − K, 0). For a put: max(K − S, 0).</li>
  <li><strong>Extrinsic (time) value:</strong> everything else — the extra premium you pay because there's still time left for the stock to move in your favour.</li>
</ul>
<p>A call with S = 105, K = 100 has $5 of intrinsic value. If it's trading at $8, it has $3 of extrinsic value.</p>

<h2>Moneyness</h2>
<ul>
  <li><strong>In-the-money (ITM):</strong> intrinsic value &gt; 0 (call: S &gt; K, put: S &lt; K)</li>
  <li><strong>At-the-money (ATM):</strong> S ≈ K</li>
  <li><strong>Out-of-the-money (OTM):</strong> intrinsic value = 0 (call: S &lt; K, put: S &gt; K)</li>
</ul>
    `,
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
print("Tests passed!")
`,
    },
  },
  {
    id: "2",
    title: "Put-Call Parity",
    subtitle: "The iron law of options pricing",
    duration: "12 min",
    content: `
<h2>An arbitrage-free relationship</h2>
<p>Put-call parity is one of the most elegant results in finance. It says that for European options with the same strike K and expiry T on a non-dividend stock:</p>
<blockquote><strong>C − P = S − K · e<sup>−rT</sup></strong></blockquote>
<p>where C is the call price, P is the put price, S is the stock price, r is the risk-free rate, and T is time to expiry.</p>
<p>This is not a model — it's a no-arbitrage constraint. If it ever breaks, you can lock in a risk-free profit.</p>

<h2>Why does it hold?</h2>
<p>Consider two portfolios:</p>
<ul>
  <li><strong>Portfolio A:</strong> Long call + cash of K·e<sup>−rT</sup> (invested at risk-free rate)</li>
  <li><strong>Portfolio B:</strong> Long put + long stock</li>
</ul>
<p>At expiry, both portfolios pay max(S<sub>T</sub>, K). Since they have identical payoffs, they must have the same price today — otherwise arbitrage is possible.</p>

<h2>Practical use</h2>
<p>If you know the call price, you can derive the put price, and vice versa. Traders use this to check for mispricings across put and call markets.</p>
    `,
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
print("Tests passed!")
`,
    },
  },
  {
    id: "3",
    title: "Black-Scholes Formula",
    subtitle: "The equation that changed markets",
    duration: "15 min",
    content: `
<h2>The Formula</h2>
<p>Black-Scholes (1973) gives a closed-form price for European options assuming the stock follows geometric Brownian motion:</p>
<blockquote>
  <strong>C = S · N(d₁) − K · e<sup>−rT</sup> · N(d₂)</strong><br/>
  <strong>P = K · e<sup>−rT</sup> · N(−d₂) − S · N(−d₁)</strong>
</blockquote>
<p>where:</p>
<ul>
  <li>d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)</li>
  <li>d₂ = d₁ − σ·√T</li>
  <li>N(·) is the standard normal CDF</li>
  <li>σ (sigma) is the annualised volatility of the stock</li>
</ul>

<h2>Intuition for d₁ and d₂</h2>
<p>N(d₂) is approximately the risk-neutral probability that the call expires in the money. d₁ has an extra σ²/2 term — it accounts for the fact that even an average stock path benefits from the positive skew of log-normal returns.</p>

<h2>Key Assumptions</h2>
<ul>
  <li>Stock follows geometric Brownian motion (log-normal returns)</li>
  <li>Constant volatility σ</li>
  <li>No dividends</li>
  <li>No transaction costs, continuous trading possible</li>
  <li>Risk-free rate r is constant</li>
</ul>
<p>These assumptions don't hold perfectly in practice — that's why traders use implied volatility and volatility surfaces.</p>
    `,
    exercise: {
      prompt: "Implement `black_scholes_call(S, K, T, r, sigma)` from scratch.",
      starterCode: `import math

def norm_cdf(x):
    """Standard normal CDF."""
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
result = black_scholes_call(100, 100, 1.0, 0.05, 0.20)
assert abs(result - 10.4506) < 0.01, f"Expected ~10.45, got {result:.4f}"
result2 = black_scholes_call(110, 100, 0.5, 0.05, 0.25)
assert result2 > 10, f"Deep ITM call should be > 10: {result2:.4f}"
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
<h2>What is Delta?</h2>
<p>Delta (Δ) measures how much the option price changes for a $1 move in the stock price.</p>
<ul>
  <li>Call delta: between 0 and 1 — a delta of 0.6 means the call gains $0.60 for every $1 the stock rises.</li>
  <li>Put delta: between −1 and 0 — a put with delta −0.4 gains $0.40 for every $1 the stock falls.</li>
</ul>

<h2>The Formula</h2>
<blockquote>
  <strong>Δ<sub>call</sub> = N(d₁)</strong><br/>
  <strong>Δ<sub>put</sub> = N(d₁) − 1</strong>
</blockquote>
<p>Note that Δ<sub>call</sub> + |Δ<sub>put</sub>| = 1. This is a consequence of put-call parity.</p>

<h2>Delta as Hedge Ratio</h2>
<p>Market makers use delta to hedge their option books. If you're short 1 call with Δ = 0.6, you buy 0.6 shares to be delta-neutral — your portfolio is (temporarily) insensitive to small stock moves. This is called <strong>delta hedging</strong>.</p>

<h2>Delta as Probability</h2>
<p>ATM options have Δ ≈ 0.5, roughly meaning ~50% probability of finishing in the money. Deep ITM calls approach Δ = 1 (almost certain to expire ITM), deep OTM calls approach Δ = 0.</p>
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
print("Tests passed!")
`,
    },
  },
  {
    id: "5",
    title: "Theta: Time Decay",
    subtitle: "Why options are a race against the clock",
    duration: "12 min",
    content: `
<h2>Options Lose Value Over Time</h2>
<p>Theta (Θ) measures how much the option price changes for a one-day passage of time, holding everything else constant. It is almost always negative — options are <em>wasting assets</em>.</p>
<p>If you own a call with Θ = −0.05, you lose approximately $0.05 per day from time decay alone. Over a weekend (3 calendar days) you'd lose ~$0.15.</p>

<h2>The Formula</h2>
<blockquote>
  Θ<sub>call</sub> = −[S · n(d₁) · σ / (2√T)] − r · K · e<sup>−rT</sup> · N(d₂)<br/>
  Θ<sub>put</sub>  = −[S · n(d₁) · σ / (2√T)] + r · K · e<sup>−rT</sup> · N(−d₂)
</blockquote>
<p>where n(·) is the standard normal PDF (not CDF).</p>
<p>The formula gives annualised theta. Divide by 365 to get daily theta.</p>

<h2>Theta-Gamma Tradeoff</h2>
<p>Theta and gamma are fundamentally linked. Positions with high positive gamma (you profit when the stock moves a lot) always have high negative theta (you pay for that optionality via time decay). This is the core tension in options trading.</p>
<p>Long options: positive gamma, negative theta (you need the stock to move).<br/>Short options: negative gamma, positive theta (you collect decay, but risk big moves).</p>
    `,
    exercise: {
      prompt: "Implement `compute_theta(S, K, T, r, sigma, option_type)` returning daily theta.",
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
# theta at 1 month left should be more negative than at 1 year
theta_1y = compute_theta(100, 100, 1.0, 0.05, 0.20, "call")
theta_1m = compute_theta(100, 100, 1/12, 0.05, 0.20, "call")
assert theta_1m < theta_1y, "Time decay accelerates near expiry"
print("Tests passed!")
`,
    },
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
