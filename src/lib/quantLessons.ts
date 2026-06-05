import type { Lesson } from "./lessons";

export const QUANT_LESSONS: Lesson[] = [
  {
    id: "q1",
    title: "CAPM and Beta",
    subtitle: "Why some risk is rewarded and some isn't",
    duration: "16 min",
    content: `
<h2>The Capital Asset Pricing Model</h2>
<p>The Capital Asset Pricing Model (CAPM), developed by William Sharpe in 1964, is one of the most important — and most criticized — models in finance. It answers a fundamental question: if investors can diversify away idiosyncratic risk for free, what risk should be compensated with higher expected returns?</p>
<p>CAPM says: only <strong>market risk</strong> (also called systematic risk or undiversifiable risk) is rewarded. The expected return of any asset is:</p>
<blockquote>E[R_i] = R_f + β_i × (E[R_m] − R_f)</blockquote>
<p>Where:</p>
<ul>
  <li>R_f = risk-free rate (e.g., 5.25% on 3-month T-bills)</li>
  <li>E[R_m] = expected market return (~10% historically for S&P 500)</li>
  <li>E[R_m] − R_f = <strong>equity risk premium</strong> — the extra return for taking equity risk (~5–6%)</li>
  <li>β_i = <strong>beta</strong> — a stock's sensitivity to market movements</li>
</ul>

<h2>Beta: Market Sensitivity</h2>
<p>Beta measures how much a stock moves for a 1% move in the market:</p>
<blockquote>β = Cov(R_i, R_m) / Var(R_m)</blockquote>
<ul>
  <li><strong>β = 1.0:</strong> Moves exactly with the market. Average S&P 500 stock.</li>
  <li><strong>β &gt; 1.0:</strong> Amplified market sensitivity. Tech stocks often have β = 1.3–1.8. When the market rises 10%, the stock rises ~15%. But also falls more.</li>
  <li><strong>β &lt; 1.0:</strong> Defensive — less sensitive to market swings. Utilities, consumer staples often have β = 0.4–0.7.</li>
  <li><strong>β &lt; 0:</strong> Moves opposite the market. Gold, some volatility products. Rare for stocks.</li>
</ul>
<p>You can estimate beta by regressing a stock's returns against market returns over 1–5 years of daily or weekly data. This is ordinary least squares (OLS) linear regression — the slope is beta, the intercept is alpha.</p>

<h2>Alpha: The Holy Grail</h2>
<p>In the CAPM regression:</p>
<blockquote>R_i = α + β × R_m + ε</blockquote>
<p><strong>Alpha (α)</strong> is the intercept — the return unexplained by market exposure. In CAPM theory, alpha should be zero in an efficient market: all excess returns are just compensation for beta. In practice, investors hunt for positive alpha — returns above what beta predicts.</p>
<p>Genuine alpha is rare and hard to sustain. Most of what looks like alpha (a fund beating the S&P 500 for 3 years) is often just factor exposure (small-cap tilt, value tilt), luck, or fee-driven illusions. Academic research suggests persistent alpha exists only for a small fraction of managers, and it's hard to identify in advance.</p>

<h2>Limitations of CAPM</h2>
<p>CAPM makes heroic assumptions: all investors have the same beliefs, can borrow at the risk-free rate, hold diversified portfolios, and only care about mean and variance. None of these are true. Empirical tests have found that:</p>
<ul>
  <li>Low-beta stocks have historically outperformed what CAPM predicts ("low-volatility anomaly")</li>
  <li>Value stocks (low price-to-book) and small-cap stocks earn higher returns than CAPM predicts — the Fama-French factors</li>
  <li>Momentum (stocks that went up continue going up for 3–12 months) is a persistent anomaly</li>
</ul>
<p>These empirical failures led to multi-factor models (Fama-French 3-factor, Carhart 4-factor, Fama-French 5-factor) that extend CAPM. But CAPM remains the starting point for thinking about risk and return.</p>

<h2>Practical Uses of Beta</h2>
<ul>
  <li><strong>Portfolio construction:</strong> A portfolio of high-beta stocks will amplify market swings. During bull markets, great. During bear markets, devastating. Knowing your portfolio's beta lets you predict drawdowns.</li>
  <li><strong>Hedging:</strong> To reduce market exposure, short futures on the S&P 500 equal to your portfolio's dollar beta.</li>
  <li><strong>Cost of capital:</strong> Companies use CAPM to estimate their cost of equity for capital budgeting (should we invest in this project?)</li>
</ul>
    `,
    exercise: {
      prompt: "Implement `compute_beta` (from return series) and `expected_return_capm`.",
      starterCode: `def compute_beta(stock_returns, market_returns):
    """
    Compute beta = Cov(stock, market) / Var(market)
    Use sample covariance and sample variance (divide by n-1).

    stock_returns, market_returns: lists of returns (same length)
    """
    # YOUR CODE HERE
    pass

def expected_return_capm(beta, risk_free_rate, market_return):
    """
    CAPM expected return: E[R] = Rf + beta * (Rm - Rf)
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def compute_beta(stock_returns, market_returns):
    n = len(stock_returns)
    mean_s = sum(stock_returns) / n
    mean_m = sum(market_returns) / n
    cov = sum((s - mean_s) * (m - mean_m) for s, m in zip(stock_returns, market_returns)) / (n - 1)
    var_m = sum((m - mean_m) ** 2 for m in market_returns) / (n - 1)
    return cov / var_m

def expected_return_capm(beta, risk_free_rate, market_return):
    return risk_free_rate + beta * (market_return - risk_free_rate)
`,
      testFn: `
# Beta = 1 when stock moves exactly with market
market = [0.01, -0.02, 0.03, -0.01, 0.02]
stock_same = market[:]
beta_1 = compute_beta(stock_same, market)
assert abs(beta_1 - 1.0) < 1e-6, f"Beta should be 1.0: {beta_1}"

# High-beta stock
stock_hi = [r * 1.5 for r in market]
beta_hi = compute_beta(stock_hi, market)
assert abs(beta_hi - 1.5) < 1e-6, f"Beta should be 1.5: {beta_hi}"

# Low-beta stock (defensive)
stock_lo = [r * 0.5 for r in market]
beta_lo = compute_beta(stock_lo, market)
assert abs(beta_lo - 0.5) < 1e-6, f"Beta should be 0.5: {beta_lo}"

# CAPM expected returns
er = expected_return_capm(1.0, 0.05, 0.10)
assert abs(er - 0.10) < 1e-9, f"Market beta -> market return: {er}"

er_hi = expected_return_capm(1.5, 0.05, 0.10)
assert abs(er_hi - 0.125) < 1e-9, f"High beta: {er_hi}"

er_rf = expected_return_capm(0.0, 0.05, 0.10)
assert abs(er_rf - 0.05) < 1e-9, f"Zero beta -> risk-free rate: {er_rf}"

print("Tests passed!")
`,
    },
  },
  {
    id: "q2",
    title: "Factor Investing",
    subtitle: "Value, momentum, and quality — the systematic edge",
    duration: "17 min",
    content: `
<h2>Why Factors?</h2>
<p>In the 1990s, Eugene Fama and Kenneth French discovered that two characteristics predicted stock returns better than CAPM: company <em>size</em> (small-cap stocks outperformed large-cap) and company <em>value</em> (cheap stocks — low price-to-book — outperformed expensive stocks). These persistent, systematic return differences are called <strong>factors</strong>.</p>
<p>The Fama-French 3-factor model extended CAPM:</p>
<blockquote>E[R_i] = R_f + β × MKT + s × SMB + h × HML</blockquote>
<ul>
  <li><strong>MKT:</strong> Market factor (as in CAPM)</li>
  <li><strong>SMB (Small Minus Big):</strong> Return of small-cap stocks minus large-cap stocks</li>
  <li><strong>HML (High Minus Low):</strong> Return of high book-to-market (value) stocks minus low book-to-market (growth) stocks</li>
</ul>

<h2>The Major Factors</h2>
<p><strong>1. Value:</strong> Cheap stocks (high earnings yield, high book/price, low P/E) historically outperform expensive (growth) stocks. The intuition: cheap stocks are often out-of-favor businesses that are undervalued. Investors overpay for growth and underpay for recovery stories.</p>
<p><strong>2. Momentum:</strong> Stocks that performed well over the past 3–12 months tend to continue outperforming for the next 3–12 months. Jegadeesh and Titman (1993) documented this. The intuition: investors underreact to news; prices trend as information is gradually priced in. Note: momentum reverses over very short (1-month) and very long (3–5 year) horizons.</p>
<p><strong>3. Quality:</strong> Companies with high profitability, low debt, stable earnings, and strong free cash flow generation tend to outperform. Buffett's investing style is largely quality investing — "wonderful companies at fair prices."</p>
<p><strong>4. Low Volatility:</strong> Lower-risk stocks have historically produced competitive risk-adjusted returns despite having lower raw returns. This "low-vol anomaly" contradicts CAPM and is attributed to investor preference for lottery-like high-beta stocks, creating mispricing on the low-risk end.</p>
<p><strong>5. Size:</strong> Small-cap stocks have outperformed large-cap historically, but this premium has been elusive in recent decades and may partly reflect higher transaction costs and liquidity risk rather than true mispricing.</p>

<h2>Factor Portfolios: Long-Short Construction</h2>
<p>A factor portfolio is typically constructed as a <strong>long-short</strong> portfolio: go long the stocks with the highest factor scores and short the stocks with the lowest factor scores. This isolates the factor return independently of market direction.</p>
<p>For a momentum factor portfolio:</p>
<ol>
  <li>Rank all S&P 500 stocks by 12-1 momentum (12-month return excluding the most recent month)</li>
  <li>Go long the top quintile (20%) — the winners</li>
  <li>Go short the bottom quintile — the losers</li>
  <li>Equal-weight within each quintile</li>
  <li>Rebalance monthly</li>
</ol>
<p>The return of this portfolio is the "momentum factor premium." Factor premia can be earned without a directional bet on the market — they have low beta to MKT.</p>

<h2>Factor Decay and "Factor Zoo"</h2>
<p>A cautionary note: researchers have published hundreds of "factors" that appear to predict returns. Most don't survive out-of-sample testing, post-publication decay, or simple data-mining corrections. Harvey, Liu, and Zhu (2016) argue that due to multiple-testing bias, a t-statistic of 3.0 (not the usual 2.0) should be the bar for factor publication.</p>
<p>After controlling for data mining and transaction costs, robust factors likely number fewer than ten. The ones with the strongest theoretical and empirical support: market beta, value, momentum, profitability/quality, and low volatility.</p>

<h2>Smart Beta ETFs: Factor Investing for Everyone</h2>
<p>Factor investing was once available only to institutional investors. Today, "smart beta" or "factor ETFs" provide low-cost factor exposure:</p>
<ul>
  <li>VLUE (iShares MSCI USA Value Factor): Value exposure</li>
  <li>MTUM (iShares MSCI USA Momentum Factor): Momentum exposure</li>
  <li>QUAL (iShares MSCI USA Quality Factor): Quality exposure</li>
  <li>USMV (iShares MSCI USA Min Vol): Low volatility exposure</li>
</ul>
    `,
    exercise: {
      prompt: "Implement `momentum_score` and `factor_rank` to build a simple factor screener.",
      starterCode: `def momentum_score(prices):
    """
    12-1 momentum: return over the past 12 months, excluding last month.
    prices: list of monthly prices, ordered from oldest to newest.
    Needs at least 13 prices (12 months ago, ..., 2 months ago, last month).

    Score = (price[-2] - price[-13]) / price[-13]
    (Return from 12 months ago to 1 month ago, skipping the most recent month.)

    Return None if len(prices) < 13.
    """
    # YOUR CODE HERE
    pass

def factor_rank(scores):
    """
    Given a list of factor scores, return the percentile rank of each
    as a float between 0 and 1 (0 = lowest, 1 = highest).
    Ties get the average rank.

    Example: scores = [10, 30, 20] -> ranks [0.0, 1.0, 0.5]
    (3 items -> sorted: 10=0/2, 20=1/2, 30=2/2)
    Formula: rank = position / (n - 1) where position is 0-indexed sorted rank.
    Return [0.0] * n if n == 1.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def momentum_score(prices):
    if len(prices) < 13:
        return None
    return (prices[-2] - prices[-13]) / prices[-13]

def factor_rank(scores):
    n = len(scores)
    if n == 1:
        return [0.0]
    indexed = sorted(range(n), key=lambda i: scores[i])
    ranks = [0.0] * n
    for position, idx in enumerate(indexed):
        ranks[idx] = position / (n - 1)
    return ranks
`,
      testFn: `
# Momentum: 50% gain over 12 months (prices[-13]=100, prices[-2]=150)
prices = [100 + i for i in range(13)]  # 100..112
# prices[-13] = 100, prices[-2] = 111 -> return 11%
score = momentum_score(prices)
assert abs(score - 0.11) < 1e-6, f"Momentum: {score:.4f}"

# Price went up then stayed
prices2 = [100] * 1 + [150] * 12
score2 = momentum_score(prices2)
assert abs(score2 - 0.50) < 1e-6, f"Score: {score2:.4f}"

# Not enough data
assert momentum_score([100, 101]) is None

# Factor rank
ranks = factor_rank([10, 30, 20])
assert abs(ranks[0] - 0.0) < 1e-9  # lowest
assert abs(ranks[1] - 1.0) < 1e-9  # highest
assert abs(ranks[2] - 0.5) < 1e-9  # middle

ranks2 = factor_rank([5, 5, 5, 5])
# All equal -> all at various ranks based on sort stability; avg should be valid
assert all(0.0 <= r <= 1.0 for r in ranks2)

print("Tests passed!")
`,
    },
  },
  {
    id: "q3",
    title: "Backtesting a Strategy",
    subtitle: "Testing ideas on historical data without fooling yourself",
    duration: "18 min",
    content: `
<h2>What Is Backtesting?</h2>
<p>A <strong>backtest</strong> simulates what would have happened if you had applied an investment strategy to historical data. It's the primary tool for evaluating systematic (rules-based) investment strategies before risking real money.</p>
<p>The core question a backtest answers: "Given the rules of this strategy, what would my return and risk have been over the historical period?" But there are countless ways to fool yourself with backtests, and professional quantitative researchers spend enormous effort avoiding these pitfalls.</p>

<h2>A Simple Backtest Framework</h2>
<p>Every backtest needs:</p>
<ol>
  <li><strong>Universe:</strong> Which stocks/assets can the strategy trade?</li>
  <li><strong>Signal generation:</strong> When does the strategy buy or sell? (e.g., when 50-day MA crosses above 200-day MA)</li>
  <li><strong>Position sizing:</strong> How much capital to allocate to each position?</li>
  <li><strong>Execution assumptions:</strong> What price do you assume you get? (Next-day open is realistic; same-day close often cheats.)</li>
  <li><strong>Transaction costs:</strong> Commissions, bid-ask spread, market impact.</li>
  <li><strong>Performance metrics:</strong> Total return, Sharpe ratio, max drawdown, etc.</li>
</ol>

<h2>The Holy Trinity of Backtest Metrics</h2>
<p><strong>Total Return:</strong> How much did the strategy make? Important but meaningless without risk context.</p>
<p><strong>Sharpe Ratio:</strong> Risk-adjusted return. Sharpe = (Strategy Return − Risk-Free Rate) / Strategy Volatility. A good strategy targets Sharpe &gt; 1.0 before costs.</p>
<p><strong>Maximum Drawdown:</strong> The largest peak-to-trough decline in portfolio value during the test period. A strategy that returns 20%/year but occasionally loses 60% is psychologically and practically very hard to implement — you'd likely panic and stop at the worst moment.</p>
<blockquote>Max Drawdown = max(Peak − Trough) / Peak</blockquote>
<p>In practice, professionals care deeply about the <strong>Sharpe-to-max-drawdown</strong> relationship (Calmar ratio = Annual Return / Max Drawdown). A Calmar ratio above 1 is respectable.</p>

<h2>The Deadly Sins of Backtesting</h2>
<p><strong>1. Look-ahead bias:</strong> Using data in your signal that wasn't available at the time. Using today's closing price to generate today's trading signal means you'd need a time machine. Always ensure signals use data available <em>before</em> the trade executes.</p>
<p><strong>2. Survivorship bias:</strong> Testing only on stocks that still exist today. Most databases exclude companies that went bankrupt or were delisted. This creates a massive upward bias — you're testing on the survivors, ignoring the losers.</p>
<p><strong>3. Overfitting (data mining):</strong> Running thousands of parameter combinations and reporting the best-performing one. If you run enough tests, something will look amazing by pure chance. True edge should be robust across a range of parameters, not just a single "magic" setting.</p>
<p><strong>4. Transaction cost underestimation:</strong> High-frequency strategies can appear profitable on paper but wipe out all gains from bid-ask spreads and market impact in practice.</p>
<p><strong>5. Regime dependence:</strong> A strategy that worked perfectly in 2010–2020 may fail in 2022–2023 when interest rate conditions changed dramatically. Test across multiple market regimes.</p>

<h2>Walk-Forward Testing</h2>
<p>The gold standard for avoiding overfitting: divide your data into an in-sample period (for developing the strategy) and an out-of-sample period (for testing). Never touch the out-of-sample data until you're satisfied with the in-sample strategy — otherwise you're unconsciously fitting to it too.</p>
<p><strong>Walk-forward optimization</strong> goes further: train on a rolling window of history, make one period of trades with those parameters, then roll forward and repeat. This mimics live trading and provides the most realistic performance estimate.</p>

<h2>When a Backtest Is "Too Good"</h2>
<p>Sharpe above 3 in a backtest almost always means overfitting, look-ahead bias, or transaction cost ignorance. Real live-trading strategies by elite hedge funds target Sharpe of 1–2 after costs. Be very suspicious of any backtest claiming 5+ Sharpe before real-world verification.</p>
    `,
    exercise: {
      prompt: "Implement `backtest_simple_ma` — a simple moving average crossover backtest.",
      starterCode: `def simple_moving_average(prices, window):
    """
    Compute SMA for each day. Return list of same length as prices.
    First (window-1) values should be None (not enough data).
    """
    # YOUR CODE HERE
    pass

def backtest_simple_ma(prices, short_window, long_window):
    """
    Moving average crossover strategy:
    - BUY (hold=1) when short SMA crosses ABOVE long SMA
    - SELL (hold=0) when short SMA crosses BELOW long SMA

    Returns dict with:
      'total_return': cumulative return of strategy (e.g. 0.35 = 35%)
      'buy_and_hold': return of simply holding the asset the whole time
      'num_trades': number of times the signal changed

    Use prices[i+1]/prices[i] - 1 as the return on day i.
    Strategy return = product of (1 + daily_return) for days when hold=1, else 1.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def simple_moving_average(prices, window):
    result = []
    for i in range(len(prices)):
        if i < window - 1:
            result.append(None)
        else:
            result.append(sum(prices[i-window+1:i+1]) / window)
    return result

def backtest_simple_ma(prices, short_window, long_window):
    short_sma = simple_moving_average(prices, short_window)
    long_sma = simple_moving_average(prices, long_window)

    hold = 0
    cum_return = 1.0
    num_trades = 0

    for i in range(long_window, len(prices)):
        s = short_sma[i]
        l = long_sma[i]
        if s is None or l is None:
            continue

        new_hold = 1 if s > l else 0
        if new_hold != hold:
            num_trades += 1
        hold = new_hold

        if hold == 1 and i + 1 < len(prices):
            daily_ret = prices[i + 1] / prices[i] - 1
            cum_return *= (1 + daily_ret)

    buy_hold = prices[-1] / prices[long_window] - 1

    return {
        'total_return': cum_return - 1,
        'buy_and_hold': buy_hold,
        'num_trades': num_trades,
    }
`,
      testFn: `
# SMA test
prices_flat = [100.0] * 10
sma = simple_moving_average(prices_flat, 3)
assert sma[0] is None and sma[1] is None
assert abs(sma[2] - 100.0) < 1e-9

# Rising prices: short SMA should cross above long SMA
import math
prices_up = [100.0 * (1.01 ** i) for i in range(50)]
result = backtest_simple_ma(prices_up, 5, 20)
assert isinstance(result['total_return'], float)
assert isinstance(result['num_trades'], int)
assert result['num_trades'] >= 0
assert result['buy_and_hold'] > 0, "Rising prices should give positive B&H"

# Flat prices: no trades (or near-zero trades)
prices_flat50 = [100.0] * 50
result_flat = backtest_simple_ma(prices_flat50, 5, 20)
assert result_flat['num_trades'] == 0, "Flat prices should have zero trades"

print("Tests passed!")
`,
    },
  },
  {
    id: "q4",
    title: "Portfolio Optimization",
    subtitle: "Building the efficient frontier in Python",
    duration: "20 min",
    content: `
<h2>Markowitz's Mean-Variance Optimization</h2>
<p>In 1952, Harry Markowitz published "Portfolio Selection" — the paper that launched modern portfolio theory and eventually earned him the Nobel Prize. His key insight: investors care about both expected return <em>and</em> risk (variance), and the composition of the portfolio determines both.</p>
<p>The <strong>efficient frontier</strong> is the set of portfolios that maximize expected return for a given level of risk, or equivalently, minimize risk for a given expected return. Any portfolio below the frontier is "dominated" — you could get more return for the same risk by moving to the frontier.</p>

<h2>The Math</h2>
<p>Given n assets with expected returns μ = [μ₁, μ₂, ..., μₙ] and covariance matrix Σ (an n×n matrix of return covariances), the portfolio with weights w = [w₁, ..., wₙ] has:</p>
<blockquote>
  Expected return: E[R_p] = wᵀ · μ = Σᵢ wᵢ × μᵢ<br/>
  Variance: σ²_p = wᵀ · Σ · w = Σᵢ Σⱼ wᵢ wⱼ σᵢⱼ
</blockquote>
<p>The optimization problem: given a target return μ*, find weights w that minimize variance subject to wᵀμ = μ* and Σwᵢ = 1 (fully invested). With a short-selling constraint, add wᵢ ≥ 0.</p>

<h2>The Maximum Sharpe Portfolio</h2>
<p>Among all efficient portfolios, the one with the highest Sharpe ratio — maximum excess return per unit of risk — is called the <strong>tangency portfolio</strong>. It lies at the tangent point between the efficient frontier and a line from the risk-free rate. In the CAPM framework, the tangency portfolio is the market portfolio.</p>
<p>In practice, finding the tangency portfolio requires numerical optimization. The most common approach: parameterize by risk aversion λ and solve the unconstrained problem:</p>
<blockquote>max: wᵀμ − λ/2 × wᵀΣw</blockquote>
<p>Sweeping λ from high (risk averse → low-vol portfolio) to low (risk tolerant → high-return portfolio) traces out the efficient frontier.</p>

<h2>The Covariance Matrix: The Hard Part</h2>
<p>The covariance matrix Σ has n(n+1)/2 parameters. For a 50-stock portfolio, that's 1,275 parameters to estimate — but you typically have only 252 daily return observations per year. With more parameters than observations, the estimated covariance matrix becomes unstable and "over-fit" to historical noise.</p>
<p>Professionals use regularization techniques to stabilize Σ:</p>
<ul>
  <li><strong>Shrinkage (Ledoit-Wolf):</strong> Shrink the sample covariance matrix toward a structured target (like identity or a single-factor model covariance). This dramatically improves out-of-sample performance.</li>
  <li><strong>Factor models:</strong> Model covariance through factor exposures: Σ = B·F·Bᵀ + D, where B is a factor loading matrix, F is factor covariance, and D is diagonal idiosyncratic variance. This uses far fewer parameters.</li>
  <li><strong>Equal-weight heuristic:</strong> The famous "1/N" portfolio (equal weights) often beats optimized portfolios out-of-sample because it avoids estimation error entirely.</li>
</ul>

<h2>Implementation in Python</h2>
<p>For a small portfolio, you can implement basic mean-variance optimization using only NumPy. The key steps:</p>
<ol>
  <li>Estimate expected returns (or use equal returns as a naive assumption)</li>
  <li>Compute the sample covariance matrix from return histories</li>
  <li>Set up the optimization problem with constraints</li>
  <li>Solve numerically (scipy.optimize.minimize for general cases)</li>
  <li>Plot the efficient frontier by solving at multiple target return levels</li>
</ol>
<p>In the exercise, we'll build the core portfolio math from scratch using only Python standard library tools.</p>
    `,
    exercise: {
      prompt: "Implement `portfolio_return`, `portfolio_variance`, and `min_variance_weights` for a 2-asset portfolio.",
      starterCode: `def portfolio_return(weights, expected_returns):
    """
    Compute portfolio expected return.
    weights: list of weights (must sum to 1)
    expected_returns: list of individual asset expected returns

    E[Rp] = sum(w_i * mu_i)
    """
    # YOUR CODE HERE
    pass

def portfolio_variance(weights, cov_matrix):
    """
    Compute portfolio variance.
    cov_matrix: 2D list (n x n), cov_matrix[i][j] = covariance of asset i and j

    sigma^2_p = sum_i sum_j w_i * w_j * cov[i][j]
    """
    # YOUR CODE HERE
    pass

def min_variance_weights_2asset(sigma1, sigma2, correlation):
    """
    For a 2-asset portfolio, find the weight in asset 1 that
    minimizes portfolio variance (the minimum variance portfolio).

    Analytical solution:
    w1* = (sigma2^2 - sigma1*sigma2*rho) / (sigma1^2 + sigma2^2 - 2*sigma1*sigma2*rho)
    w2* = 1 - w1*

    Return (w1, w2). Values may be negative if short-selling is allowed.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def portfolio_return(weights, expected_returns):
    return sum(w * r for w, r in zip(weights, expected_returns))

def portfolio_variance(weights, cov_matrix):
    n = len(weights)
    total = 0.0
    for i in range(n):
        for j in range(n):
            total += weights[i] * weights[j] * cov_matrix[i][j]
    return total

def min_variance_weights_2asset(sigma1, sigma2, correlation):
    cov = sigma1 * sigma2 * correlation
    denom = sigma1**2 + sigma2**2 - 2 * cov
    w1 = (sigma2**2 - cov) / denom
    return w1, 1 - w1
`,
      testFn: `
import math

# Portfolio return: 50/50 split
er = portfolio_return([0.5, 0.5], [0.10, 0.06])
assert abs(er - 0.08) < 1e-9, f"Expected return: {er}"

# All-in on asset 1
er2 = portfolio_return([1.0, 0.0], [0.12, 0.06])
assert abs(er2 - 0.12) < 1e-9

# Portfolio variance: uncorrelated, equal weights
# sigma_p^2 = 0.5^2 * 0.04 + 0.5^2 * 0.09 = 0.01 + 0.0225 = 0.0325
cov = [[0.04, 0.0], [0.0, 0.09]]
pv = portfolio_variance([0.5, 0.5], cov)
assert abs(pv - 0.0325) < 1e-9, f"Variance: {pv}"

# Min variance weights
w1, w2 = min_variance_weights_2asset(0.20, 0.30, 0.0)
# With zero correlation: w1* = sigma2^2 / (sigma1^2 + sigma2^2)
expected_w1 = 0.09 / (0.04 + 0.09)
assert abs(w1 - expected_w1) < 1e-6, f"w1*: {w1:.4f} vs {expected_w1:.4f}"
assert abs(w1 + w2 - 1.0) < 1e-9

# With perfect correlation, both weights give same variance (degenerate)
w1_corr1, w2_corr1 = min_variance_weights_2asset(0.20, 0.20, 1.0)
# Perfect correlation: all weight in lower-risk asset (same vol here, so w1=0.5)
# Actually formula should still sum to 1
assert abs(w1_corr1 + w2_corr1 - 1.0) < 1e-6

print("Tests passed!")
`,
    },
  },
  {
    id: "q5",
    title: "Statistical Arbitrage",
    subtitle: "Pairs trading and the mathematics of mean reversion",
    duration: "17 min",
    content: `
<h2>What Is Statistical Arbitrage?</h2>
<p>Statistical arbitrage (stat arb) is a family of strategies that exploit <em>statistical relationships</em> between asset prices — rather than fundamental value or macroeconomic views. Unlike pure arbitrage (which exploits risk-free mispricings), stat arb involves statistical regularities that are highly likely but not guaranteed to hold.</p>
<p>The most famous stat arb strategy is <strong>pairs trading</strong>, popularized by Morgan Stanley's quant group in the 1980s. The idea: find two stocks whose prices historically move together (high correlation). When they diverge unusually far, bet on the spread returning to its historical mean.</p>

<h2>The Pairs Trading Mechanics</h2>
<p>Consider Coca-Cola (KO) and PepsiCo (PEP). They're both consumer staples, compete in the same market, have similar business profiles, and their stock prices tend to move together. If KO suddenly jumps 5% while PEP stays flat (for no apparent fundamental reason), a pairs trader would:</p>
<ol>
  <li><strong>Short KO</strong> (bet it falls back toward its historical relationship with PEP)</li>
  <li><strong>Long PEP</strong> (bet it rises toward KO, or at least doesn't fall)</li>
</ol>
<p>The position is hedged against market direction — if the whole market sells off, both stocks fall, and the long-short position stays approximately flat. Profit comes only from the KO-PEP spread reverting.</p>

<h2>Finding Cointegrated Pairs</h2>
<p>Two price series that move together in the long run are called <strong>cointegrated</strong>. Cointegration is stronger than correlation: two series can be highly correlated yet drift apart indefinitely. Cointegration implies they share a common stochastic trend — they can diverge temporarily but must revert.</p>
<p>Mathematically: if P₁ and P₂ are cointegrated with coefficient β, then the spread:</p>
<blockquote>S = P₁ − β × P₂</blockquote>
<p>is <strong>stationary</strong> — it has a stable long-run mean and variance. Stationarity is detectable with the Augmented Dickey-Fuller (ADF) test.</p>
<p>Step to find β (the hedge ratio): regress P₁ on P₂ using OLS. The slope coefficient is β. This tells you how many shares of P₂ to hold for each share of P₁ to make the spread stationary.</p>

<h2>Trading the Spread</h2>
<p>Once you have a cointegrated pair and a stationary spread S with mean μ_S and standard deviation σ_S:</p>
<blockquote>z-score = (S − μ_S) / σ_S</blockquote>
<ul>
  <li>When z-score &gt; +2: spread is unusually wide → <strong>sell P₁, buy P₂</strong> (short the spread)</li>
  <li>When z-score &lt; −2: spread is unusually narrow → <strong>buy P₁, sell P₂</strong> (long the spread)</li>
  <li>When z-score → 0: spread has mean-reverted → <strong>close position</strong></li>
</ul>
<p>The ±2 sigma threshold is a common choice, but optimal thresholds depend on the speed of reversion, transaction costs, and signal half-life.</p>

<h2>Risks and Limitations</h2>
<p><strong>Relationship breakdown:</strong> Pairs can stop cointegrating. Coke and Pepsi move together because they compete in the same market — but if Coke acquires a tech company and pivots its strategy, the relationship breaks permanently. No statistical test can tell you in advance if today's divergence is a temporary blip or a regime change.</p>
<p><strong>Crowding:</strong> When many funds run the same pairs trade, the positions unwind simultaneously when markets stress. The August 2007 "quant quake" was exactly this: dozens of stat arb funds holding similar pairs all began unwinding simultaneously, causing cascading losses across strategies that had never lost money historically.</p>
<p><strong>Execution:</strong> Requires simultaneously entering both legs. Any delay between legs creates gap risk — the spread might move further before the second leg executes.</p>
<p><strong>Borrow availability:</strong> Short selling requires borrowing shares. For popular short targets, borrow costs can be substantial and eat into returns.</p>
    `,
    exercise: {
      prompt: "Implement `compute_spread`, `zscore`, and `pairs_trade_signals`.",
      starterCode: `def compute_spread(prices1, prices2, hedge_ratio):
    """
    Compute the spread: S = P1 - hedge_ratio * P2
    prices1, prices2: lists of prices (same length)
    Returns list of spread values.
    """
    # YOUR CODE HERE
    pass

def zscore(series):
    """
    Compute z-score of each element: (x - mean) / std_dev
    Use sample std dev (divide by n-1).
    Returns list of z-scores.
    Returns [0.0]*n if std_dev is 0.
    """
    # YOUR CODE HERE
    pass

def pairs_trade_signals(zscores, entry_z=2.0, exit_z=0.5):
    """
    Generate trading signals based on z-scores.
    Returns list of: 'long_spread', 'short_spread', 'flat', or signal carry from previous.

    Rules (applied sequentially):
    - If z > +entry_z: signal = 'short_spread' (spread is too high, sell P1 buy P2)
    - If z < -entry_z: signal = 'long_spread' (spread is too low, buy P1 sell P2)
    - If currently in 'short_spread' and z < +exit_z: signal = 'flat'
    - If currently in 'long_spread' and z > -exit_z: signal = 'flat'
    - Otherwise: carry previous signal
    Start with signal = 'flat'.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def compute_spread(prices1, prices2, hedge_ratio):
    return [p1 - hedge_ratio * p2 for p1, p2 in zip(prices1, prices2)]

def zscore(series):
    n = len(series)
    mean = sum(series) / n
    if n < 2:
        return [0.0] * n
    std = (sum((x - mean) ** 2 for x in series) / (n - 1)) ** 0.5
    if std == 0:
        return [0.0] * n
    return [(x - mean) / std for x in series]

def pairs_trade_signals(zscores, entry_z=2.0, exit_z=0.5):
    signals = []
    current = 'flat'
    for z in zscores:
        if z > entry_z:
            current = 'short_spread'
        elif z < -entry_z:
            current = 'long_spread'
        elif current == 'short_spread' and z < exit_z:
            current = 'flat'
        elif current == 'long_spread' and z > -exit_z:
            current = 'flat'
        signals.append(current)
    return signals
`,
      testFn: `
# Spread
p1 = [100, 102, 101, 103, 100]
p2 = [50, 51, 50.5, 51.5, 50]
spread = compute_spread(p1, p2, 2.0)
# S = P1 - 2 * P2
for i in range(len(p1)):
    assert abs(spread[i] - (p1[i] - 2 * p2[i])) < 1e-9

# Z-score of constant series
zs = zscore([5, 5, 5])
assert all(z == 0.0 for z in zs)

# Z-score of known values
zs2 = zscore([0.0, 2.0])
assert abs(zs2[0] - (-1.0)) < 1e-6
assert abs(zs2[1] - 1.0) < 1e-6

# Signals
zscores_test = [0.5, 1.5, 2.5, 2.8, 0.3, -0.1, -2.5, -3.0, 0.0, 0.6]
sigs = pairs_trade_signals(zscores_test)
assert sigs[0] == 'flat'
assert sigs[2] == 'short_spread'   # z > 2.0
assert sigs[6] == 'long_spread'    # z < -2.0
assert isinstance(sigs[-1], str)

print("Tests passed!")
`,
    },
  },
];
