/**
 * Weekly coding challenges for StrikeLab Pro.
 *
 * Each challenge rotates on a weekly cadence based on the ISO week number.
 * Add new challenges to the array — they'll automatically cycle.
 */

export interface Challenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string; // markdown-compatible
  starterCode: string;
  testCode: string;       // run after student code to validate
  solutionHint: string;   // shown after 3 failed attempts
  conceptTag: string;     // e.g. "Black-Scholes", "Greeks", "Binomial Trees"
  xpReward: number;
}

export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: "wc-vega-surface",
    title: "Vega Surface",
    difficulty: "medium",
    description: `
Vega measures how much an option's price changes per 1% move in implied volatility.

**Your task:** Implement \`vega_surface(S, K_list, T_list, r, sigma)\` that returns a 2D list (matrix) of vega values, where rows correspond to strikes K and columns to expiries T.

Each cell should equal: \`S · N'(d₁) · √T / 100\`

where \`N'(x)\` is the standard normal PDF and \`d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)\`.
    `.trim(),
    starterCode: `import math

def _norm_pdf(x):
    return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def vega_surface(S, K_list, T_list, r, sigma):
    """
    Returns a 2D list: result[i][j] = vega for K_list[i], T_list[j]
    """
    raise NotImplementedError("Implement vega_surface")
`,
    testCode: `
import math

def _norm_pdf(x):
    return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def expected_vega(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    return S * _norm_pdf(d1) * math.sqrt(T) / 100

S, r, sigma = 100, 0.05, 0.2
K_list = [90, 100, 110]
T_list = [0.25, 0.5, 1.0]

result = vega_surface(S, K_list, T_list, r, sigma)
assert len(result) == 3, f"Expected 3 rows (one per strike), got {len(result)}"
assert len(result[0]) == 3, f"Expected 3 cols (one per expiry), got {len(result[0])}"

for i, K in enumerate(K_list):
    for j, T in enumerate(T_list):
        got = result[i][j]
        exp = expected_vega(S, K, T, r, sigma)
        assert abs(got - exp) < 1e-6, f"K={K}, T={T}: expected {exp:.6f}, got {got:.6f}"

print("✓ All tests passed!")
`,
    solutionHint: "Loop over K_list and T_list. For each (K, T) pair, compute d1, then return S · N'(d1) · √T / 100.",
    conceptTag: "Greeks",
    xpReward: 150,
  },
  {
    id: "wc-put-call-parity",
    title: "Put-Call Parity Arbitrage Detector",
    difficulty: "easy",
    description: `
Put-call parity states: \`C - P = S - K·e^(-rT)\`

If this relationship doesn't hold in the market, there's an arbitrage opportunity.

**Your task:** Implement \`arbitrage_profit(C, P, S, K, T, r)\` that returns the arbitrage profit (positive number) if parity is violated, or 0.0 if it holds within a tolerance of \`1e-4\`.
    `.trim(),
    starterCode: `import math

def arbitrage_profit(C, P, S, K, T, r, tol=1e-4):
    """
    Returns the arbitrage profit if put-call parity is violated, else 0.0.
    Parity: C - P = S - K * e^(-rT)
    """
    raise NotImplementedError("Implement arbitrage_profit")
`,
    testCode: `
import math

# No arbitrage — should return 0
C, P, S, K, T, r = 10.45, 5.57, 100, 95, 0.5, 0.05
result = arbitrage_profit(C, P, S, K, T, r)
assert abs(result) < 1e-4, f"Expected ~0 when parity holds, got {result}"

# Violated parity
C2, P2 = 12.0, 5.57  # C is overpriced
result2 = arbitrage_profit(C2, P2, S, K, T, r)
expected = abs((C2 - P2) - (S - K * math.exp(-r * T)))
assert abs(result2 - expected) < 1e-4, f"Expected {expected:.4f}, got {result2}"

print("✓ All tests passed!")
`,
    solutionHint: "Compute lhs = C - P and rhs = S - K * e^(-rT). If |lhs - rhs| > tol, return |lhs - rhs|, else return 0.0.",
    conceptTag: "Put-Call Parity",
    xpReward: 100,
  },
  {
    id: "wc-binomial-american",
    title: "American Put via Binomial Tree",
    difficulty: "hard",
    description: `
European options can't be exercised early — American options can. This changes the pricing.

**Your task:** Implement \`american_put_binomial(S, K, T, r, sigma, N)\` using an N-step CRR binomial tree.

At each node, the option value is \`max(intrinsic value, discounted expected value)\` — this is the early exercise condition.

CRR parameters:
- \`u = e^(σ√(Δt))\`, \`d = 1/u\`
- \`p = (e^(rΔt) - d) / (u - d)\`
- \`Δt = T / N\`
    `.trim(),
    starterCode: `import math

def american_put_binomial(S, K, T, r, sigma, N=100):
    """
    Price an American put option using an N-step CRR binomial tree.
    """
    raise NotImplementedError("Implement american_put_binomial")
`,
    testCode: `
import math

# Reference: known value for S=100, K=100, T=1, r=0.05, sigma=0.2
# American put should be >= European put (early exercise premium)
result = american_put_binomial(100, 100, 1.0, 0.05, 0.20, N=200)
assert 5.5 < result < 7.5, f"American put value {result:.4f} out of expected range (5.5, 7.5)"

# Deep in-the-money: early exercise should kick in
result_itm = american_put_binomial(80, 100, 1.0, 0.05, 0.20, N=200)
assert result_itm > 18.0, f"Deep ITM American put {result_itm:.4f} should be > 18"

print("✓ All tests passed!")
`,
    solutionHint: "Build the terminal stock prices first (S * u^j * d^(N-j) for j=0..N). Compute terminal payoffs max(K-S,0). Then backfill: at each node, value = max(K - S_node, disc * (p*V_up + (1-p)*V_down)).",
    conceptTag: "Binomial Trees",
    xpReward: 200,
  },
  {
    id: "wc-implied-vol-bisection",
    title: "Implied Volatility via Bisection",
    difficulty: "medium",
    description: `
You've seen implied vol solved with Newton-Raphson. Now implement it with **bisection search** — simpler and more robust when vega is near zero.

**Your task:** Implement \`implied_vol_bisection(C_mkt, S, K, T, r)\` that finds σ such that \`BS_call(S, K, T, r, σ) = C_mkt\`, using bisection on the interval [0.001, 5.0] with tolerance 1e-6.
    `.trim(),
    starterCode: `import math

def _norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def black_scholes_call(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2)

def implied_vol_bisection(C_mkt, S, K, T, r, tol=1e-6):
    """
    Returns implied volatility using bisection search.
    Search interval: [0.001, 5.0]
    """
    raise NotImplementedError("Implement implied_vol_bisection")
`,
    testCode: `
import math

# Round-trip: compute a call price, then recover sigma
sigma_true = 0.25
C = black_scholes_call(100, 100, 0.5, 0.05, sigma_true)
sigma_recovered = implied_vol_bisection(C, 100, 100, 0.5, 0.05)
assert abs(sigma_recovered - sigma_true) < 1e-5, f"Expected {sigma_true}, got {sigma_recovered:.8f}"

# Another spot check
C2 = black_scholes_call(110, 105, 1.0, 0.03, 0.30)
sigma2 = implied_vol_bisection(C2, 110, 105, 1.0, 0.03)
assert abs(sigma2 - 0.30) < 1e-5, f"Expected 0.30, got {sigma2:.8f}"

print("✓ All tests passed!")
`,
    solutionHint: "Set lo=0.001, hi=5.0. Each iteration: mid=(lo+hi)/2, price=BS_call(mid). If price < C_mkt, set lo=mid else hi=mid. Repeat until hi-lo < tol.",
    conceptTag: "Implied Volatility",
    xpReward: 150,
  },
];

/** Returns the challenge for the current ISO week (cycles through the list). */
export function getCurrentChallenge(): Challenge {
  const now = new Date();
  // ISO week number
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const weekNum = Math.ceil(((now.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7);
  return WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length];
}

/** Returns the date the next challenge drops (next Monday 00:00 UTC). */
export function getNextChallengeDate(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon ...
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntilMonday);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}
