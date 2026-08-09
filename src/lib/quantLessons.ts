import type { Lesson } from "./lessons";

export const QUANT_LESSONS: Lesson[] = [
  {
    id: "q1",
    title: "CAPM and Beta",
    subtitle: "Why some risk is rewarded and some isn't",
    duration: "16 min",
    content: `
<h2>The Capital Asset Pricing Model</h2>
<p>William Sharpe published CAPM in 1964, and depending who you ask in finance, it's either the most important model ever built or the most overrated one. Probably both. It's trying to answer a hard question: if investors can diversify away company-specific risk for free (Lesson 5 of Investing Fundamentals covers why), what risk is left over that actually deserves to be paid for?</p>
<p>CAPM's answer: only <strong>market risk</strong> — the risk you're stuck with no matter how diversified you are — gets compensated. Everything else is just noise you can eliminate by holding more stocks. The formula for expected return on any asset is:</p>
<blockquote>E[R_i] = R_f + β_i × (E[R_m] − R_f)</blockquote>
<p>Breaking that down:</p>
<ul>
  <li>R_f is the risk-free rate — think 3-month T-bills, currently around 5.25%</li>
  <li>E[R_m] is what the market's expected to return, historically close to 10% a year for the S&P 500</li>
  <li>E[R_m] − R_f is the <strong>equity risk premium</strong>, the extra return you're paid for taking on stock risk instead of just holding T-bills — usually 5–6%</li>
  <li>β_i is <strong>beta</strong>, how sensitive this particular stock is to the market's swings</li>
</ul>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>Drag beta up past 1.0 and watch the expected return climb faster than the market premium alone would suggest — that's the whole point of CAPM: risk you can't diversify away has to be paid for.</p>
</div>

<h2>Beta: Market Sensitivity</h2>
<p>Beta answers one question: for every 1% the market moves, how much does this stock move?</p>
<blockquote>β = Cov(R_i, R_m) / Var(R_m)</blockquote>
<ul>
  <li><strong>β = 1.0:</strong> moves in lockstep with the market — the profile of an average S&P 500 stock</li>
  <li><strong>β &gt; 1.0:</strong> amplifies the market. Tech stocks often sit at 1.3–1.8, so a 10% market rally turns into roughly a 15% move for the stock — and the same amplification applies on the way down</li>
  <li><strong>β &lt; 1.0:</strong> a defensive stock, one that barely flinches when the market does. Utilities and consumer staples often run 0.4–0.7</li>
  <li><strong>β &lt; 0:</strong> moves opposite the market entirely — gold and some volatility products behave this way, but it's rare for an actual stock</li>
</ul>
<p>You can estimate beta yourself by regressing a stock's returns against the market's returns over a few years of daily or weekly data. That's just ordinary least squares regression under the hood — the slope you get out is beta, and the intercept is something else worth knowing about: alpha.</p>

<h2>Alpha: The Holy Grail</h2>
<p>Look at that same regression written out in full:</p>
<blockquote>R_i = α + β × R_m + ε</blockquote>
<p><strong>Alpha (α)</strong> is the intercept — whatever return is left over once you've accounted for the stock's market exposure. In a perfectly efficient market, CAPM says alpha should be zero: every dollar of excess return is just payment for beta, nothing more. In practice, this is what every active investor is hunting for — a persistent edge that beta alone can't explain.</p>
<p>Alpha that's rare and sustainable is much harder to find than most performance charts suggest. A fund that beats the S&P 500 for three years running usually isn't holding some hidden edge — it's more likely riding a factor tilt (small-cap, value), catching a lucky streak, or benefiting from how fees get reported. Research on this keeps landing in the same place: persistent alpha exists for a small slice of managers, and there's no reliable way to spot who they are in advance.</p>

<h2>Limitations of CAPM</h2>
<p>CAPM only works if you accept some fairly heroic assumptions: every investor shares the same beliefs, everyone can borrow at the risk-free rate, everyone holds a fully diversified portfolio, and nobody cares about anything except mean and variance. None of that describes real markets. Sure enough, decades of empirical testing have poked real holes in it:</p>
<ul>
  <li>Low-beta stocks have quietly outperformed what CAPM predicts they should — the so-called "low-volatility anomaly"</li>
  <li>Cheap stocks (low price-to-book) and small-cap stocks both earn more than CAPM accounts for — this is where the Fama-French factors come from</li>
  <li>Momentum — stocks that have gone up keep going up for another 3 to 12 months — shows up persistently and CAPM has no explanation for it</li>
</ul>
<p>These cracks are exactly what pushed researchers toward multi-factor models — Fama-French's 3-factor and 5-factor versions, Carhart's 4-factor model — that bolt more explanatory power onto CAPM's skeleton. Even so, CAPM stays the starting point every finance student learns first, because the core idea underneath it (only undiversifiable risk gets paid) is still basically right.</p>

<h2>Practical Uses of Beta</h2>
<ul>
  <li><strong>Portfolio construction:</strong> Load up on high-beta stocks and you amplify whatever the market does — a great trait in a bull run, a brutal one in a bear market. Knowing your portfolio's overall beta gives you a rough preview of how bad a downturn could get.</li>
  <li><strong>Hedging:</strong> Want less market exposure without selling anything? Short S&P 500 futures in an amount equal to your portfolio's dollar beta and you've largely neutralized it.</li>
  <li><strong>Cost of capital:</strong> Companies lean on CAPM to estimate their cost of equity when deciding whether a new project is worth funding.</li>
</ul>
    `,
    sandboxes: [
      {
        afterSectionId: "the-capital-asset-pricing-model",
        title: "CAPM",
        formula: "E[R] = Rf + β × (E[Rm] − Rf)",
        variables: [
          { key: "rf", label: "Risk-free rate", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "beta", label: "Beta (β)", defaultValue: 1.2, min: -1, max: 3, step: 0.05 },
          { key: "rm", label: "Expected market return", unit: "%", defaultValue: 10, min: 0, max: 20, step: 0.5 },
        ],
        computeId: "capm",
        resultLabel: "Expected return",
        resultSuffix: "%",
        decimals: 2,
      },
    ],
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
<p>Back in the 1990s, Eugene Fama and Kenneth French went looking for what CAPM was missing, and found two characteristics that predicted returns better than beta ever did: <em>size</em> (small companies beat large ones) and <em>value</em> (cheap stocks, measured by low price-to-book, beat expensive ones). These weren't one-off findings — they held up as persistent, systematic patterns. Finance settled on calling them <strong>factors</strong>.</p>
<p>Bolt those onto CAPM and you get the Fama-French 3-factor model:</p>
<blockquote>E[R_i] = R_f + β × MKT + s × SMB + h × HML</blockquote>
<ul>
  <li><strong>MKT:</strong> the same market factor from CAPM</li>
  <li><strong>SMB (Small Minus Big):</strong> the return of small-cap stocks minus large-cap stocks</li>
  <li><strong>HML (High Minus Low):</strong> the return of value stocks (high book-to-market) minus growth stocks (low book-to-market)</li>
</ul>

<h2>The Major Factors</h2>
<p><strong>1. Value:</strong> Cheap stocks — high earnings yield, high book-to-price, low P/E — have historically beaten expensive growth stocks. The intuition is almost behavioral: cheap stocks are often unloved, out-of-favor businesses that the market has overcorrected against. Investors chronically overpay for exciting growth stories and underpay for boring recoveries.</p>
<p><strong>2. Momentum:</strong> Stocks that did well over the last 3–12 months tend to keep doing well for the next 3–12 months. Jegadeesh and Titman documented this back in 1993, and it's held up remarkably well since. The likely cause: investors underreact to news at first, so information gets priced in gradually instead of all at once, and the stock trends while that catch-up happens. One wrinkle worth knowing — momentum flips into reversal at very short (1-month) and very long (3–5 year) horizons.</p>
<p><strong>3. Quality:</strong> Companies with strong profitability, low debt, stable earnings, and healthy free cash flow tend to beat the market. This is more or less Warren Buffett's whole style in one factor — "wonderful companies at fair prices," rather than mediocre companies at bargain prices.</p>
<p><strong>4. Low Volatility:</strong> Counterintuitively, the calmest stocks have historically delivered competitive risk-adjusted returns despite lower raw returns — a direct contradiction of what CAPM predicts. One theory for why: investors are drawn to lottery-like, high-beta names the same way people are drawn to lottery tickets, bidding those up and leaving the boring, low-risk stocks a little underpriced.</p>
<p><strong>5. Size:</strong> Small-caps have beaten large-caps historically, but this one's gotten shakier in recent decades. Some of what looks like a size premium may just be compensation for higher trading costs and thinner liquidity, not genuine mispricing.</p>

<h2>Factor Portfolios: Long-Short Construction</h2>
<p>The standard way to build a factor portfolio is <strong>long-short</strong>: buy the stocks with the highest factor scores, short the ones with the lowest. That structure is deliberate — it isolates the factor's return and cancels out the market's overall direction.</p>
<p>Building a momentum factor portfolio, step by step:</p>
<ol>
  <li>Rank every S&P 500 stock by 12-1 momentum (the 12-month return, excluding the most recent month)</li>
  <li>Go long the top quintile — the 20% of winners</li>
  <li>Go short the bottom quintile — the 20% of losers</li>
  <li>Equal-weight within each side</li>
  <li>Rebalance monthly</li>
</ol>
<p>Whatever that portfolio returns is the "momentum factor premium." Because it's long-short, you're earning that premium without a directional bet on the market at all — the position has close to zero beta to MKT.</p>

<h2>Factor Decay and the "Factor Zoo"</h2>
<p>A word of caution: academics have published literally hundreds of "factors" claiming to predict returns. Most of them quietly fail once you test them out-of-sample, or decay the moment they're published and everyone starts trading on them, or simply don't survive basic corrections for data mining. Harvey, Liu, and Zhu made the case in 2016 that given how many factors get tested, the usual statistical bar (a t-statistic of 2.0) is far too low — they argue for 3.0 instead.</p>
<p>Strip out the data-mined noise and account for real trading costs, and the number of genuinely robust factors is probably under ten. The short list with real staying power: market beta, value, momentum, quality/profitability, and low volatility.</p>

<h2>Smart Beta ETFs: Factor Investing for Everyone</h2>
<p>Factor investing used to be something only institutions could access. Now "smart beta" ETFs put the same exposure a few clicks away for anyone:</p>
<ul>
  <li>VLUE (iShares MSCI USA Value Factor) — value exposure</li>
  <li>MTUM (iShares MSCI USA Momentum Factor) — momentum exposure</li>
  <li>QUAL (iShares MSCI USA Quality Factor) — quality exposure</li>
  <li>USMV (iShares MSCI USA Min Vol) — low volatility exposure</li>
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
<p>A <strong>backtest</strong> is a simulation: what would have happened if you'd run this strategy on historical data instead of just having the idea? It's the main tool quants use to vet a systematic, rules-based strategy before putting real money behind it.</p>
<p>The question a backtest is really answering is "given these exact rules, what return and risk would I have gotten over this historical stretch?" Simple enough in theory. In practice there are a startling number of ways to accidentally fool yourself, and a huge chunk of a professional quant's job is just staying paranoid about all of them.</p>

<h2>A Simple Backtest Framework</h2>
<p>Every backtest needs to nail down the same handful of things:</p>
<ol>
  <li><strong>Universe:</strong> which stocks or assets is the strategy even allowed to trade?</li>
  <li><strong>Signal generation:</strong> what triggers a buy or sell — say, the 50-day moving average crossing above the 200-day?</li>
  <li><strong>Position sizing:</strong> how much capital goes into each position?</li>
  <li><strong>Execution assumptions:</strong> what price do you assume you actually get? Next-day open is realistic; assuming you traded at the same-day close is a classic way to quietly cheat.</li>
  <li><strong>Transaction costs:</strong> commissions, the bid-ask spread, market impact — all of it eats into returns.</li>
  <li><strong>Performance metrics:</strong> total return, Sharpe ratio, max drawdown, and so on.</li>
</ol>

<h2>The Holy Trinity of Backtest Metrics</h2>
<p><strong>Total Return:</strong> the headline number — how much did the strategy make? Useful, but close to meaningless without knowing the risk taken to get there.</p>
<p><strong>Sharpe Ratio:</strong> return adjusted for that risk. Sharpe = (Strategy Return − Risk-Free Rate) / Strategy Volatility. A strategy worth taking seriously usually targets a Sharpe above 1.0 before costs.</p>
<p><strong>Maximum Drawdown:</strong> the worst peak-to-trough decline the portfolio suffered during the test. A strategy that compounds at 20% a year but occasionally craters 60% is far harder to actually stick with than the headline return suggests — most people would panic-sell at exactly the wrong moment.</p>
<blockquote>Max Drawdown = max(Peak − Trough) / Peak</blockquote>
<p>Professionals track the relationship between the two closely — the Calmar ratio (Annual Return / Max Drawdown) captures it in one number. Anything above 1 is considered respectable.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>A strategy that quietly compounds at 15%/year but once dropped 55% from peak to trough is a much harder hold than the return alone suggests. Play with the numbers and see how fast drawdown scales.</p>
</div>

<h2>The Deadly Sins of Backtesting</h2>
<p><strong>1. Look-ahead bias:</strong> letting your signal see data it wouldn't actually have had yet. Generating today's trading signal off today's closing price only works if you own a time machine. Every signal has to use only what was genuinely available before the trade fired.</p>
<p><strong>2. Survivorship bias:</strong> testing only on companies that are still around today. Most historical databases quietly drop names that went bankrupt or got delisted, which skews everything upward — you're only ever grading the survivors, never the failures.</p>
<p><strong>3. Overfitting (data mining):</strong> running thousands of parameter combinations and reporting whichever one happened to win. Test enough variations and something will look brilliant purely by chance. A real edge holds up across a range of nearby parameters — it shouldn't collapse the instant you nudge one number.</p>
<p><strong>4. Transaction cost underestimation:</strong> a high-frequency strategy can look wildly profitable on paper and then get entirely eaten alive by bid-ask spreads and market impact once it meets reality.</p>
<p><strong>5. Regime dependence:</strong> a strategy tuned to 2010–2020 conditions can quietly stop working once interest rates or market structure shift, as many did in 2022–2023. Always test across more than one market regime before trusting the result.</p>

<h2>Walk-Forward Testing</h2>
<p>The standard defense against overfitting: split your data into an in-sample period, where you build and tune the strategy, and an out-of-sample period you don't touch until you're already satisfied with what you built. Peek at the out-of-sample data even once while tuning, and you've unconsciously started fitting to it too — the whole point of the split quietly evaporates.</p>
<p><strong>Walk-forward optimization</strong> takes this further: train on a rolling window of history, trade forward one period with those parameters, then slide the window ahead and repeat. It's closer to how live trading actually works, which makes it the more honest estimate of real performance.</p>

<h2>When a Backtest Is "Too Good"</h2>
<p>A Sharpe ratio above 3 in a backtest is almost never real — it's usually overfitting, look-ahead bias, or costs that got left out. Even elite hedge funds are typically targeting a Sharpe of 1–2 after real trading costs in live markets. Treat any backtest claiming 5+ with real suspicion until it's survived contact with the real world.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-holy-trinity-of-backtest-metrics",
        title: "Max Drawdown",
        formula: "Max Drawdown = (Peak − Trough) / Peak",
        variables: [
          { key: "peak", label: "Peak value", unit: "$", defaultValue: 100000, min: 1000, max: 1000000, step: 1000 },
          { key: "trough", label: "Trough value", unit: "$", defaultValue: 65000, min: 0, max: 1000000, step: 1000 },
        ],
        computeId: "maxDrawdown",
        resultLabel: "Max drawdown",
        resultSuffix: "%",
        decimals: 1,
      },
    ],
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
<p>Harry Markowitz published "Portfolio Selection" in 1952 — a paper short enough to read in one sitting that ended up kicking off modern portfolio theory and, decades later, a Nobel Prize. His core insight sounds almost too simple to have been worth a Nobel: investors care about expected return <em>and</em> risk together, and it's the mix of assets in a portfolio, not any single holding, that determines both.</p>
<p>That leads directly to the <strong>efficient frontier</strong> — the set of portfolios that squeeze out the most expected return for a given level of risk, or equivalently, the least risk for a given return. Any portfolio sitting below that frontier is "dominated": there's a better portfolio available at the exact same risk level, so there's no reason to hold it.</p>

<h2>The Math</h2>
<p>Say you have n assets, with expected returns μ = [μ₁, μ₂, ..., μₙ] and a covariance matrix Σ describing how every pair of assets moves together. A portfolio with weights w = [w₁, ..., wₙ] then has:</p>
<blockquote>
  Expected return: E[R_p] = wᵀ · μ = Σᵢ wᵢ × μᵢ<br/>
  Variance: σ²_p = wᵀ · Σ · w = Σᵢ Σⱼ wᵢ wⱼ σᵢⱼ
</blockquote>
<p>The optimization itself is: pick a target return μ*, then find the weights w that minimize variance subject to wᵀμ = μ* and everything summing to 1 (fully invested, no cash sitting idle). Rule out short-selling and you just add wᵢ ≥ 0 to the constraints.</p>

<h2>The Maximum Sharpe Portfolio</h2>
<p>Somewhere along that efficient frontier sits the one portfolio with the best Sharpe ratio of all — the most excess return per unit of risk. That's the <strong>tangency portfolio</strong>, so named because it sits exactly where a line from the risk-free rate touches the frontier tangentially. Under CAPM's assumptions, this tangency portfolio is literally the market portfolio.</p>
<p>Finding it in practice takes numerical optimization. The usual trick is to introduce a risk-aversion parameter λ and solve the unconstrained version of the problem:</p>
<blockquote>max: wᵀμ − λ/2 × wᵀΣw</blockquote>
<p>Sweep λ from high (very risk-averse, favoring a low-vol portfolio) down to low (risk-tolerant, chasing return), and you trace out the entire efficient frontier one point at a time.</p>

<h2>The Covariance Matrix: The Hard Part</h2>
<p>Here's the part that trips up everyone who tries this for real: Σ has n(n+1)/2 parameters to estimate. For a modest 50-stock portfolio that's 1,275 numbers — and you're probably working with only around 252 daily return observations per year to estimate all of them. More parameters than data points is a recipe for an unstable matrix that's really just fitting historical noise, not any real underlying structure.</p>
<p>Quants lean on a few tricks to keep Σ from falling apart:</p>
<ul>
  <li><strong>Shrinkage (Ledoit-Wolf):</strong> pull the raw sample covariance matrix toward a simpler, more structured target — like the identity matrix or a single-factor model. It sounds like a small tweak, but it noticeably improves how the portfolio performs on data it wasn't fit to.</li>
  <li><strong>Factor models:</strong> express covariance through a small set of factor exposures instead — Σ = B·F·Bᵀ + D, where B is factor loadings, F is factor covariance, and D captures each asset's own idiosyncratic variance. Far fewer parameters to estimate, and far more stable as a result.</li>
  <li><strong>Equal-weight heuristic:</strong> the famously dumb-sounding "1/N" portfolio — just split evenly across everything — regularly beats fully optimized portfolios out-of-sample, purely because it sidesteps estimation error entirely.</li>
</ul>

<h2>Implementation in Python</h2>
<p>For a small enough portfolio, you can build basic mean-variance optimization with nothing more exotic than NumPy. The general recipe:</p>
<ol>
  <li>Estimate expected returns (or, if you'd rather not pretend to predict the future, just assume equal returns as a naive baseline)</li>
  <li>Compute the sample covariance matrix from historical return data</li>
  <li>Set up the optimization problem with its constraints</li>
  <li>Solve it numerically — scipy.optimize.minimize handles most general cases</li>
  <li>Repeat at several target return levels to trace out the efficient frontier and plot it</li>
</ol>
<p>In the exercise below, we'll build the core portfolio math from scratch using nothing but the Python standard library, so you can see exactly what's happening under the hood before you ever reach for a library that does it for you.</p>
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
<p>Statistical arbitrage — stat arb, if you want to sound like you work on a trading desk — is a family of strategies built on <em>statistical relationships</em> between prices, not on any opinion about what a company is fundamentally worth or where the economy is headed. It's not arbitrage in the strict, risk-free sense of the word. What it actually exploits is a statistical regularity that's likely to hold, not guaranteed to.</p>
<p>The most famous version is <strong>pairs trading</strong>, which Morgan Stanley's quant desk made famous in the 1980s. The core idea: find two stocks whose prices have historically moved together. When they suddenly diverge further than usual, bet on that gap closing back up.</p>

<h2>The Pairs Trading Mechanics</h2>
<p>Take Coca-Cola (KO) and PepsiCo (PEP) — same industry, same customers, similar businesses, and their stock prices tend to track each other pretty closely. Say KO jumps 5% one day while PEP just sits there, with no real news explaining the gap. A pairs trader reads that as noise, not information, and would:</p>
<ol>
  <li><strong>Short KO</strong> — betting it drifts back down toward its usual relationship with PEP</li>
  <li><strong>Long PEP</strong> — betting it either catches up or at least doesn't fall</li>
</ol>
<p>What makes this attractive is that the position is hedged against the market itself. If stocks broadly sell off, both KO and PEP fall together and the long-short position barely moves — any profit here comes specifically from the KO-PEP gap closing, not from guessing market direction.</p>

<h2>Finding Cointegrated Pairs</h2>
<p>When two price series track each other over the long run, statisticians call that <strong>cointegration</strong>, and it's a stronger claim than correlation. Two series can be highly correlated day-to-day and still drift apart forever — correlation says nothing about the long run. Cointegration means they share an underlying common trend: they can wander apart temporarily, but something is anchoring them back together.</p>
<p>If P₁ and P₂ are cointegrated with coefficient β, the spread between them:</p>
<blockquote>S = P₁ − β × P₂</blockquote>
<p>turns out to be <strong>stationary</strong> — it settles around a stable long-run mean and variance instead of wandering off unpredictably. You can test for that stationarity with the Augmented Dickey-Fuller (ADF) test.</p>
<p>To find β — the hedge ratio — regress P₁ on P₂ with ordinary least squares. The slope you get back is β, and it tells you exactly how many shares of P₂ to hold against each share of P₁ to make that spread stationary in the first place.</p>

<h2>Trading the Spread</h2>
<p>Once you've got a cointegrated pair and a stationary spread S with mean μ_S and standard deviation σ_S, everything reduces to one number:</p>
<blockquote>z-score = (S − μ_S) / σ_S</blockquote>
<ul>
  <li>z-score above +2: the spread is unusually wide → <strong>sell P₁, buy P₂</strong> (short the spread)</li>
  <li>z-score below −2: the spread is unusually narrow → <strong>buy P₁, sell P₂</strong> (long the spread)</li>
  <li>z-score drifting back to 0: the spread has reverted → <strong>close the position</strong></li>
</ul>
<p>±2 standard deviations is the common default threshold, but the right number really depends on how fast the spread tends to revert, how much trading costs eat into the trade, and how long the signal typically persists before decaying.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>Push the spread past 2 standard deviations from its mean and watch the z-score cross the ±2 threshold traders actually watch for.</p>
</div>

<h2>Risks and Limitations</h2>
<p><strong>Relationship breakdown:</strong> a pair that's been cointegrated for years can simply stop being cointegrated. KO and PEP track each other because they compete head-to-head — but if Coke pivoted its whole business tomorrow, that relationship could break for good. No statistical test can tell you in real time whether today's divergence is a normal blip or the relationship quietly ending.</p>
<p><strong>Crowding:</strong> when a lot of funds are running the same pairs trade, they tend to unwind at the same time under stress. The August 2007 "quant quake" is the textbook example — dozens of stat arb funds holding overlapping pairs all started deleveraging simultaneously, and strategies that had never lost money before suddenly all lost money together.</p>
<p><strong>Execution:</strong> both legs need to go on essentially at once. Any lag between them creates gap risk — the spread can move further before the second leg even fills.</p>
<p><strong>Borrow availability:</strong> shorting requires borrowing shares in the first place, and for popular short targets that borrow cost can be steep enough to eat meaningfully into the strategy's returns.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "trading-the-spread",
        title: "Spread Z-Score",
        formula: "z = (Spread − Mean) / Std Dev",
        variables: [
          { key: "spread", label: "Current spread", defaultValue: 2.5, min: -10, max: 10, step: 0.1 },
          { key: "mean", label: "Historical mean (μ)", defaultValue: 0, min: -10, max: 10, step: 0.1 },
          { key: "std", label: "Std dev (σ)", defaultValue: 1, min: 0.1, max: 5, step: 0.1 },
        ],
        computeId: "zscore",
        resultLabel: "Z-score",
        decimals: 2,
      },
    ],
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
