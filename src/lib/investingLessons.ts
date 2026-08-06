import type { Lesson } from "./lessons";

// Every lesson below still carries an `exercise` field (the type requires
// one) but LessonClient no longer renders it for this track — see
// `hasCodingExercise` there. It was a mandatory Python re-implementation of
// the same formula each lesson's FormulaSandbox already lets you play with
// no-code, which didn't fit a track pitched as "no finance background
// required, just curiosity and pre-algebra." Left in place rather than
// deleted in case a future "optional practice" mode wants it back.
export const INVESTING_LESSONS: Lesson[] = [
  {
    id: "inv-1",
    title: "What Is a Stock?",
    subtitle: "Ownership, equity, and why companies go public",
    duration: "12 min",
    content: `
<h2>Owning a Piece of a Business</h2>
<p>When a company needs capital to grow, to build factories, hire engineers, or expand into new markets, it can raise money in two ways: borrow it (debt) or sell ownership stakes (equity). A <strong>stock</strong> (also called a <strong>share</strong> or <strong>equity</strong>) represents a fractional ownership interest in a corporation.</p>
<p>If Apple has 15.3 billion shares outstanding and you own 100 shares, you own about 0.0000007% of Apple. A tiny slice, but a real one. As a shareholder, you own a proportional claim on Apple's assets and earnings. If Apple earns $100 billion in profit, your 100 shares entitle you to a proportional share of those earnings (either paid out as dividends, or reinvested in the company on your behalf).</p>

<h2>IPOs: Going Public</h2>
<p>Companies start private, owned by founders, employees, and early investors. When they decide to sell shares to the general public for the first time, they conduct an <strong>Initial Public Offering (IPO)</strong>.</p>
<p>In an IPO, the company works with investment banks (underwriters) who help set the initial share price, market the offering to institutional investors, and list the shares on an exchange (NYSE or NASDAQ). The company receives cash from the primary sale. After that, investors trade shares among themselves in the <strong>secondary market</strong>, which is what you see on stock market apps.</p>
<p>A few famous IPOs: Google in 2004 at $85/share, Facebook in 2012 at $38/share, Airbnb in 2020 at $68/share. Each was a moment when private wealth became publicly tradeable.</p>

<h2>Common vs. Preferred Stock</h2>
<p>Not all stock is equal. Most individual investors buy <strong>common stock</strong>; a smaller, more bond-like slice of the market is <strong>preferred stock</strong>.</p>
<div class="lesson-compare">
  <div>
    <span class="lesson-compare-label">Common stock</span>
    <ul>
      <li><strong>Voting rights:</strong> typically one vote per share on major decisions (electing the board, approving mergers)</li>
      <li><strong>Dividends:</strong> periodic cash payments from profits, if the board declares them</li>
      <li><strong>Residual claim:</strong> gets what's left after creditors and preferred holders are paid in a liquidation, often nothing in bankruptcies</li>
    </ul>
  </div>
  <div>
    <span class="lesson-compare-label">Preferred stock</span>
    <ul>
      <li><strong>No voting rights</strong> in most cases</li>
      <li><strong>Fixed dividend</strong> paid before common holders get anything</li>
      <li><strong>Priority in liquidation</strong>, ahead of common stock, behind debt</li>
      <li><strong>Limited upside:</strong> doesn't participate much if the company succeeds big</li>
    </ul>
  </div>
</div>
<p>In short: preferred stock sits between bonds and common stock on the risk-reward spectrum, trading upside for a steadier payout and a better claim if things go wrong.</p>

<h2>How Stock Prices Are Set</h2>
<p>Stock prices are set by supply and demand among buyers and sellers on exchanges. There's no formula: the price is wherever a willing buyer and a willing seller agree to transact right now.</p>
<p>But prices aren't arbitrary. Over time, prices reflect expectations about future cash flows. A stock trading at $100 with earnings of $5/share has a Price-to-Earnings (P/E) ratio of 20, meaning investors are willing to pay 20 years' worth of current earnings today because they expect the company to keep growing. We'll go deep on valuation in Lesson 4.</p>

<h2>Market Capitalization</h2>
<p><strong>Market capitalization</strong> (market cap) is the total dollar value of all outstanding shares:</p>
<blockquote>Market Cap = Share Price × Shares Outstanding</blockquote>
<p>It's the market's current opinion of what the entire company is worth. Companies are categorized by market cap:</p>
<ul>
  <li><strong>Mega-cap:</strong> $200B+ (Apple, Microsoft, Nvidia)</li>
  <li><strong>Large-cap:</strong> $10B–$200B (Walmart, Nike)</li>
  <li><strong>Mid-cap:</strong> $2B–$10B</li>
  <li><strong>Small-cap:</strong> $300M–$2B</li>
  <li><strong>Micro-cap:</strong> below $300M</li>
</ul>
<p>Market cap differs from <em>enterprise value</em> (EV), which includes debt and subtracts cash: the real "acquisition price" of a company. We'll use EV in Lesson 4.</p>

<h2>Why Does the Stock Price Change?</h2>
<p>Prices change when new information arrives that shifts investors' expectations about future cash flows. Earnings beats, new products, management changes, macroeconomic data, interest rate changes: all of it moves prices by updating the market's collective forecast.</p>
<p>Markets are surprisingly quick at absorbing public information. Professional traders with supercomputers and satellite data are racing to be first. That's why it's hard to beat the market consistently: prices already reflect most of what's knowable.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "market-capitalization",
        title: "Market Cap",
        formula: "Market Cap = Share Price × Shares Outstanding",
        variables: [
          { key: "price", label: "Share price", unit: "$", defaultValue: 185, min: 1, max: 500, step: 1 },
          { key: "shares", label: "Shares outstanding", unit: "B", defaultValue: 15.4, min: 0.1, max: 20, step: 0.1 },
        ],
        computeId: "marketCap",
        resultLabel: "Market cap",
        resultPrefix: "$",
        decimals: 0,
      },
    ],
    exercise: {
      prompt: "Implement `market_cap(price, shares_outstanding)` and `pe_ratio(price, earnings_per_share)`.",
      starterCode: `def market_cap(price, shares_outstanding):
    """
    Calculate total market capitalization.
    market_cap = price * shares_outstanding
    """
    # YOUR CODE HERE
    pass

def pe_ratio(price, earnings_per_share):
    """
    Price-to-earnings ratio.
    pe = price / earnings_per_share
    Return None if eps <= 0 (negative or zero earnings make P/E meaningless).
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def market_cap(price, shares_outstanding):
    return price * shares_outstanding

def pe_ratio(price, earnings_per_share):
    if earnings_per_share <= 0:
        return None
    return price / earnings_per_share
`,
      testFn: `
# Apple: ~$185 price, 15.4B shares -> ~$2.85T market cap
apple_mc = market_cap(185, 15_400_000_000)
assert abs(apple_mc - 2_849_000_000_000) < 1e11, f"Apple market cap off: {apple_mc:,.0f}"

# Basic P/E
pe = pe_ratio(100, 5)
assert pe == 20.0, f"Expected P/E of 20, got {pe}"

# High-growth stock
pe2 = pe_ratio(200, 4)
assert pe2 == 50.0, f"Expected P/E of 50, got {pe2}"

# Negative earnings -> None
pe_neg = pe_ratio(50, -2)
assert pe_neg is None, "Negative EPS should return None"

# Zero earnings -> None
pe_zero = pe_ratio(50, 0)
assert pe_zero is None, "Zero EPS should return None"

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-2",
    title: "How Markets Work",
    subtitle: "Exchanges, order types, and the bid-ask spread",
    duration: "14 min",
    content: `
<h2>Exchanges and Brokers</h2>
<p>Stock exchanges are regulated marketplaces where buyers and sellers meet to trade securities. The two main U.S. equity exchanges are the <strong>NYSE</strong> (New York Stock Exchange, founded 1792) and <strong>NASDAQ</strong> (founded 1971 as the first electronic exchange).</p>
<p>Individual investors access exchanges through <strong>brokers</strong> (Fidelity, Charles Schwab, Robinhood, Interactive Brokers). When you submit an order through a broker app, your order routes to an exchange or market maker who finds a counterparty. The broker earns a commission (often $0 for retail, but earns "payment for order flow" from market makers for routing trades to them).</p>

<h2>The Bid-Ask Spread</h2>
<p>At any moment, a stock has two prices:</p>
<ul>
  <li><strong>Bid:</strong> the highest price any buyer is currently willing to pay</li>
  <li><strong>Ask (offer):</strong> the lowest price any seller is currently willing to accept</li>
</ul>
<p>The <strong>spread</strong> = Ask − Bid. This is the transaction cost for immediate execution. For large-cap stocks like Apple, the spread might be $0.01 (one cent). For illiquid small-caps, spreads can be $0.50 or more.</p>
<p>If you submit a <strong>market order</strong> to buy, you pay the ask. If you submit a market order to sell, you receive the bid. The market maker keeps the spread as payment for providing liquidity: standing ready to buy or sell on demand.</p>

<h2>Order Types</h2>
<p>Knowing your order types prevents costly mistakes:</p>
<ul>
  <li><strong>Market order:</strong> Execute immediately at whatever the current price is. Guarantees execution, not price. Never use market orders on illiquid stocks; you might pay far more than expected.</li>
  <li><strong>Limit order:</strong> Execute only at your specified price or better. Buy limit at $100 means you buy only if someone will sell at $100 or less. Guarantees price, not execution.</li>
  <li><strong>Stop order (stop-loss):</strong> Becomes a market order once the price hits your stop price. Used to limit losses: "sell if price falls to $90."</li>
  <li><strong>Stop-limit order:</strong> Becomes a limit order at your stop price. Avoids the gap-down problem of a pure stop order.</li>
</ul>
<p>For most investors making deliberate purchases, <strong>limit orders are almost always better than market orders</strong>.</p>
<div class="lesson-stat">
  <span class="lesson-stat-value">$10–50</span>
  <span class="lesson-stat-label">Difference in execution quality on a single $10,000 trade, just from choosing a limit order over a market order.</span>
</div>

<h2>The Order Book</h2>
<p>Every exchange maintains an <strong>order book</strong>, a real-time list of all outstanding limit orders. The best bid and best ask (the top of the book) form the National Best Bid and Offer (NBBO).</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Definition</span>
  <p><strong>NBBO (National Best Bid and Offer):</strong> the single best bid and best ask price across every U.S. exchange at once. Brokers are legally required to route your order at a price at least as good as the NBBO, no matter which exchange actually fills it.</p>
</div>
<p>Below the best bid are lower bids (buyers willing to pay less). Above the best ask are higher asks (sellers wanting more). The order book shows the depth of liquidity: how much you could buy or sell without moving the price.</p>
<p>High-frequency trading firms (HFTs) operate at microsecond timescales, continuously posting and canceling orders in the book to capture the spread and react to news faster than any human.</p>

<h2>Price Impact and Market Impact</h2>
<p>When a large order hits the market, it "walks up" (or down) the order book, consuming multiple price levels. This is called <strong>market impact</strong>. A retail investor buying $5,000 of Apple (a $3 trillion company) has essentially zero market impact. A hedge fund buying $500 million of Apple in a single day will move the price. Traders who handle those orders minimize the cost through algorithmic execution (VWAP, TWAP algorithms) instead of placing one giant market order.</p>

<h2>Indices: The Market's Report Card</h2>
<p>Stock market indices aggregate price movements across many companies into a single number:</p>
<ul>
  <li><strong>S&P 500:</strong> 500 large U.S. companies, weighted by market cap. The most important benchmark for U.S. equities.</li>
  <li><strong>Dow Jones Industrial Average (DJIA):</strong> 30 large U.S. companies, price-weighted (higher-priced stocks have more influence). Old-fashioned and less representative than S&P 500.</li>
  <li><strong>NASDAQ-100:</strong> 100 largest non-financial NASDAQ companies, heavily tilted toward tech.</li>
  <li><strong>Russell 2000:</strong> 2,000 small-cap U.S. companies. Measures the health of smaller businesses.</li>
</ul>
<p>Index funds and ETFs track these indices, giving investors instant diversification at extremely low cost.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-bid-ask-spread",
        title: "Bid-Ask Spread",
        formula: "Spread = Ask − Bid",
        variables: [
          { key: "bid", label: "Bid", unit: "$", defaultValue: 149.99, min: 1, max: 500, step: 0.01 },
          { key: "ask", label: "Ask", unit: "$", defaultValue: 150.00, min: 1, max: 500, step: 0.01 },
        ],
        computeId: "bidAskSpread",
        resultLabel: "Spread",
        resultPrefix: "$",
        decimals: 2,
      },
    ],
    exercise: {
      prompt: "Implement `bid_ask_spread(bid, ask)` and `effective_cost(shares, price, spread)`, the total transaction cost including the spread.",
      starterCode: `def bid_ask_spread(bid, ask):
    """
    Return the bid-ask spread: ask - bid.
    """
    # YOUR CODE HERE
    pass

def effective_cost(shares, price, spread):
    """
    Estimate the total cost (in dollars) of buying 'shares' shares
    at 'price', given the bid-ask spread.
    Cost of execution = shares * spread / 2
    (Half the spread per share — you're "crossing" the spread.)
    Total effective cost = shares * price + shares * spread / 2
    Return just the spread cost (not the principal): shares * spread / 2
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def bid_ask_spread(bid, ask):
    return ask - bid

def effective_cost(shares, price, spread):
    return shares * spread / 2
`,
      testFn: `
# Normal spread
spread = bid_ask_spread(149.99, 150.00)
assert abs(spread - 0.01) < 1e-9, f"Expected 0.01, got {spread}"

# Illiquid stock
spread2 = bid_ask_spread(5.00, 5.25)
assert abs(spread2 - 0.25) < 1e-9, f"Expected 0.25, got {spread2}"

# Transaction cost for 1000 shares with 1-cent spread
cost = effective_cost(1000, 150.00, 0.01)
assert cost == 5.0, f"Expected $5 spread cost, got {cost}"

# More illiquid
cost2 = effective_cost(100, 20.00, 0.50)
assert cost2 == 25.0, f"Expected $25, got {cost2}"

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-3",
    title: "Reading Financial Statements",
    subtitle: "How to understand a company's P&L, balance sheet, and cash flow",
    duration: "18 min",
    content: `
<h2>The Three Core Statements</h2>
<p>Every public company files quarterly (10-Q) and annual (10-K) reports with the SEC. Inside are three interconnected financial statements that together tell the complete story of a company's financial health. Learning to read them is the single most useful skill in fundamental investing.</p>

<h2>1. Income Statement (P&L)</h2>
<p>The income statement shows how much money a company made and spent over a period. Key line items:</p>
<ul>
  <li><strong>Revenue (Sales):</strong> Total money received from customers before any deductions</li>
  <li><strong>Cost of Goods Sold (COGS):</strong> Direct costs of producing what was sold</li>
  <li><strong>Gross Profit = Revenue − COGS</strong></li>
  <li><strong>Operating Expenses (OpEx):</strong> R&D, sales, marketing, G&A: the costs of running the business</li>
  <li><strong>EBIT (Operating Income) = Gross Profit − OpEx</strong></li>
  <li><strong>EBITDA</strong> = EBIT + Depreciation + Amortization. Widely used because it removes non-cash charges and shows "cash earnings" from operations.</li>
  <li><strong>Net Income = Revenue − all expenses − taxes − interest</strong></li>
</ul>
<p><strong>Gross margin</strong> = Gross Profit / Revenue. A software company might have 70%+ gross margins (near-zero COGS per additional user). A grocery chain might have 25% gross margins. Margins reveal business model quality.</p>

<h2>2. Balance Sheet</h2>
<p>The balance sheet is a snapshot of what a company owns (assets) and owes (liabilities) at a single point in time. The fundamental equation:</p>
<blockquote><strong>Assets = Liabilities + Shareholders' Equity</strong></blockquote>
<p><strong>Assets</strong> include:</p>
<ul>
  <li>Current assets: cash, accounts receivable, inventory (can be converted to cash within a year)</li>
  <li>Long-term assets: property, plant & equipment (PP&E), goodwill, intangibles</li>
</ul>
<p><strong>Liabilities</strong> include:</p>
<ul>
  <li>Current liabilities: accounts payable, short-term debt, accrued expenses</li>
  <li>Long-term liabilities: long-term debt, deferred revenue, pension obligations</li>
</ul>
<p><strong>Shareholders' equity</strong> is what's left for shareholders after subtracting all liabilities from assets. It includes retained earnings (cumulative profits kept in the business) and paid-in capital (from stock issuances).</p>

<h2>3. Cash Flow Statement</h2>
<p>Net income can be manipulated through accounting choices. Cash is harder to fake. The cash flow statement tracks actual cash in and out:</p>
<ul>
  <li><strong>Operating Cash Flow (OCF):</strong> Cash from core business operations. Start here; it's the most important section. Good businesses generate consistently positive OCF.</li>
  <li><strong>Investing Cash Flow:</strong> Cash spent on capital expenditures (buying equipment, buildings), acquisitions, or investments. Usually negative for growing companies.</li>
  <li><strong>Financing Cash Flow:</strong> Cash from issuing/repaying debt, issuing stock, or paying dividends/buybacks.</li>
</ul>
<div class="lesson-callout">
  <span class="lesson-callout-label">Key idea</span>
  <p><strong>Free Cash Flow (FCF) = Operating Cash Flow − Capital Expenditures.</strong> It's the cash actually available to return to shareholders or reinvest in the business, after paying for the equipment and buildings needed to keep operating. Many professional investors treat FCF as the single best measure of business quality, more than net income.</p>
</div>

<h2>How the Statements Connect</h2>
<p>The three statements are deeply interlinked. Net income flows into retained earnings on the balance sheet. Depreciation is added back in OCF (it's a non-cash expense). Capital expenditures appear in investing activities and reduce FCF. Changes in working capital (inventory, receivables) show up in operating cash flow. Understanding these connections prevents you from being fooled by companies that report profits but burn cash.</p>

<h2>Red Flags to Watch For</h2>
<ul>
  <li>Net income growing faster than operating cash flow (possible earnings manipulation)</li>
  <li>Accounts receivable growing faster than revenue (collecting money slower)</li>
  <li>Inventory growing faster than COGS (demand may be weaker than reported)</li>
  <li>Rising debt without corresponding revenue growth</li>
  <li>Goodwill that's large relative to total assets (often from overpriced acquisitions)</li>
</ul>
    `,
    sandboxes: [
      {
        afterSectionId: "1-income-statement-pl",
        title: "Gross Margin",
        formula: "Gross Margin = (Revenue − COGS) / Revenue",
        variables: [
          { key: "revenue", label: "Revenue", unit: "$M", defaultValue: 1000, min: 10, max: 5000, step: 10 },
          { key: "cogs", label: "COGS", unit: "$M", defaultValue: 400, min: 0, max: 5000, step: 10 },
        ],
        computeId: "grossMargin",
        resultLabel: "Gross margin",
        resultSuffix: "%",
        decimals: 1,
      },
    ],
    exercise: {
      prompt: "Implement key financial metrics: `gross_margin`, `operating_margin`, `free_cash_flow`, and `debt_to_equity`.",
      starterCode: `def gross_margin(revenue, cogs):
    """
    Gross margin = (Revenue - COGS) / Revenue
    Return as a decimal (0.35 = 35%).
    Return None if revenue is 0.
    """
    # YOUR CODE HERE
    pass

def operating_margin(revenue, ebit):
    """
    Operating margin = EBIT / Revenue
    Return as a decimal. Return None if revenue is 0.
    """
    # YOUR CODE HERE
    pass

def free_cash_flow(operating_cash_flow, capex):
    """
    FCF = Operating Cash Flow - Capital Expenditures
    capex is given as a positive number (it's a cash outflow).
    """
    # YOUR CODE HERE
    pass

def debt_to_equity(total_debt, shareholders_equity):
    """
    D/E ratio = Total Debt / Shareholders' Equity
    Return None if equity is 0 or negative.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def gross_margin(revenue, cogs):
    if revenue == 0:
        return None
    return (revenue - cogs) / revenue

def operating_margin(revenue, ebit):
    if revenue == 0:
        return None
    return ebit / revenue

def free_cash_flow(operating_cash_flow, capex):
    return operating_cash_flow - capex

def debt_to_equity(total_debt, shareholders_equity):
    if shareholders_equity <= 0:
        return None
    return total_debt / shareholders_equity
`,
      testFn: `
# Apple-like: ~$380B revenue, ~$170B COGS
gm = gross_margin(380e9, 170e9)
assert abs(gm - (210/380)) < 1e-6, f"Gross margin: {gm:.4f}"

# High-margin SaaS: $1B revenue, $100M COGS
gm2 = gross_margin(1e9, 1e8)
assert abs(gm2 - 0.9) < 1e-9, f"Expected 90% margin, got {gm2:.4f}"

# Operating margin
om = operating_margin(1000, 200)
assert abs(om - 0.20) < 1e-9, f"Expected 20% op margin, got {om}"

# FCF
fcf = free_cash_flow(50e9, 10e9)
assert fcf == 40e9, f"FCF should be 40B, got {fcf}"

# D/E ratio
de = debt_to_equity(50e9, 100e9)
assert abs(de - 0.5) < 1e-9, f"D/E: {de}"

# Edge cases
assert gross_margin(0, 0) is None
assert debt_to_equity(10, 0) is None
assert debt_to_equity(10, -5) is None

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-4",
    title: "Valuation: How Much Is a Company Worth?",
    subtitle: "P/E, EV/EBITDA, and discounted cash flow basics",
    duration: "18 min",
    content: `
<h2>Intrinsic Value vs. Market Price</h2>
<p>The central question in investing: is this stock cheap or expensive? To answer this, you need both the market price (easy, it's on your phone) and an estimate of <strong>intrinsic value</strong>: what the business is fundamentally worth based on its future cash flows. Valuation is the art and science of estimating that number.</p>
<p>Benjamin Graham put it simply: "Price is what you pay. Value is what you get." When market price is well below intrinsic value, you have a <strong>margin of safety</strong>, room to be wrong and still not lose money. That's the core idea of value investing.</p>

<h2>Relative Valuation: Multiples</h2>
<p>The fastest way to value a company is to compare it to similar companies using valuation multiples: ratios that normalize price relative to some fundamental measure.</p>

<p><strong>Price-to-Earnings (P/E):</strong></p>
<blockquote>P/E = Stock Price / Earnings Per Share (EPS)</blockquote>
<p>A P/E of 20 means investors are paying $20 for every $1 of current annual earnings. Higher P/E implies the market expects faster growth. S&P 500 historical average P/E is ~15–16; during tech booms it's reached 30+. Growth stocks (Amazon, NVIDIA) trade at 40–100× earnings; "value stocks" trade at 8–12×.</p>
<p>Limitations: EPS can be manipulated. Negative earnings make P/E meaningless. Compare P/E only within the same industry, since tech and utilities have very different structural growth rates.</p>

<p><strong>Enterprise Value to EBITDA (EV/EBITDA):</strong></p>
<blockquote>EV = Market Cap + Total Debt − Cash<br/>EV/EBITDA = Enterprise Value / EBITDA</blockquote>
<p>EV/EBITDA is preferred by professionals because it's capital-structure-neutral (works regardless of how much debt the company has) and pre-tax (comparable across tax jurisdictions). Typical ranges: 6–10× for mature industries, 15–25× for high-growth tech, 3–6× for capital-intensive businesses.</p>

<p><strong>Price-to-Sales (P/S):</strong> Used for companies with no profits yet. Tech startups are often valued at 5–20× revenue.</p>
<p><strong>Price-to-Book (P/B):</strong> Price relative to net assets (book value). Banks and financial companies are often analyzed this way. P/B below 1 means the stock is trading below its liquidation value, which often signals distress or, occasionally, a real bargain.</p>

<h2>Discounted Cash Flow (DCF): The Gold Standard</h2>
<p>Multiples tell you relative valuation. DCF tells you absolute value. A DCF values a company by projecting its future free cash flows and discounting them back to today at a rate that reflects risk.</p>
<p>The core formula:</p>
<blockquote>Intrinsic Value = Σ [FCF_t / (1 + r)^t] + Terminal Value</blockquote>
<p>Where:</p>
<ul>
  <li>FCF_t is free cash flow in year t</li>
  <li>r is the discount rate (typically the Weighted Average Cost of Capital, WACC)</li>
  <li>Terminal value captures all cash flows beyond your forecast horizon (usually 5–10 years)</li>
</ul>
<p><strong>Terminal value</strong> is typically estimated using the Gordon Growth Model:</p>
<blockquote>Terminal Value = FCF_final × (1 + g) / (r − g)</blockquote>
<p>where g is the long-term growth rate (usually 2–3%, roughly GDP growth).</p>
<div class="lesson-stat">
  <span class="lesson-stat-value">60–80%</span>
  <span class="lesson-stat-label">Share of a typical DCF's total value that comes from the terminal value alone, not the forecast years. That's why small changes in assumptions can swing a valuation dramatically.</span>
</div>

<h2>The Problem With DCF</h2>
<p>DCF sounds precise but is extremely sensitive to inputs. Changing the discount rate from 10% to 12%, or changing the terminal growth rate from 3% to 2%, can change the output by 30–50%. As the joke goes, "DCF stands for 'Don't Count on Figures.'" Wall Street analysts use DCF to justify conclusions they'd already reached at least as often as to discover new ones.</p>
<p>Good practice: use DCF alongside multiples, stress-test your assumptions, and focus on the <em>range</em> of possible values rather than a single point estimate.</p>

<h2>A Simple Valuation Framework</h2>
<ol>
  <li><strong>Understand the business:</strong> How does it make money? How durable are its competitive advantages (moat)?</li>
  <li><strong>Check growth trajectory:</strong> Is revenue growing? Are margins expanding or contracting?</li>
  <li><strong>Assess the balance sheet:</strong> Can the company survive a downturn? Is debt manageable?</li>
  <li><strong>Compare multiples to peers:</strong> Is it trading at a premium or discount? Why?</li>
  <li><strong>Sanity-check with DCF:</strong> Do the multiples imply reasonable long-term growth assumptions?</li>
</ol>
    `,
    sandboxes: [
      {
        afterSectionId: "relative-valuation-multiples",
        title: "P/E Ratio",
        formula: "P/E = Stock Price / EPS",
        variables: [
          { key: "price", label: "Stock price", unit: "$", defaultValue: 100, min: 1, max: 1000, step: 1 },
          { key: "eps", label: "Earnings per share", unit: "$", defaultValue: 5, min: 0.1, max: 50, step: 0.1 },
        ],
        computeId: "peRatio",
        resultLabel: "P/E ratio",
        resultSuffix: "×",
        decimals: 1,
      },
    ],
    exercise: {
      prompt: "Implement `enterprise_value`, `ev_ebitda`, and a simple `dcf_value` function.",
      starterCode: `def enterprise_value(market_cap, total_debt, cash):
    """
    EV = Market Cap + Total Debt - Cash
    """
    # YOUR CODE HERE
    pass

def ev_ebitda(ev, ebitda):
    """
    EV/EBITDA multiple. Return None if ebitda <= 0.
    """
    # YOUR CODE HERE
    pass

def dcf_value(fcf_list, discount_rate, terminal_growth_rate):
    """
    Simple DCF valuation.
    fcf_list: list of projected FCFs for years 1..n
    discount_rate: e.g. 0.10 for 10%
    terminal_growth_rate: e.g. 0.03 for 3%

    Steps:
    1. PV of each FCF: fcf_t / (1 + discount_rate)^t
    2. Terminal value (at end of final year):
         tv = fcf_list[-1] * (1 + terminal_growth_rate) / (discount_rate - terminal_growth_rate)
    3. PV of terminal value: tv / (1 + discount_rate)^n
    4. Return sum of all PVs + PV of terminal value
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def enterprise_value(market_cap, total_debt, cash):
    return market_cap + total_debt - cash

def ev_ebitda(ev, ebitda):
    if ebitda <= 0:
        return None
    return ev / ebitda

def dcf_value(fcf_list, discount_rate, terminal_growth_rate):
    n = len(fcf_list)
    pv_sum = 0
    for t, fcf in enumerate(fcf_list, start=1):
        pv_sum += fcf / (1 + discount_rate) ** t

    # Terminal value at the end of year n
    tv = fcf_list[-1] * (1 + terminal_growth_rate) / (discount_rate - terminal_growth_rate)
    pv_tv = tv / (1 + discount_rate) ** n

    return pv_sum + pv_tv
`,
      testFn: `
# EV
ev = enterprise_value(100e9, 20e9, 10e9)
assert ev == 110e9, f"EV: {ev}"

# EV/EBITDA
ratio = ev_ebitda(110e9, 10e9)
assert abs(ratio - 11.0) < 1e-9, f"EV/EBITDA: {ratio}"
assert ev_ebitda(100, -5) is None

# DCF: $100M FCF growing 5% for 5 years, 10% discount, 3% terminal growth
fcfs = [100e6 * (1.05 ** i) for i in range(5)]
val = dcf_value(fcfs, 0.10, 0.03)
# Terminal value should dominate; check the result is reasonable
assert 800e6 < val < 2000e6, f"DCF value {val/1e6:.1f}M seems off"

# Sensitivity: higher discount rate -> lower value
val_hi_r = dcf_value(fcfs, 0.15, 0.03)
assert val_hi_r < val, "Higher discount rate should reduce DCF value"

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-5",
    title: "Risk, Return, and Diversification",
    subtitle: "The math of building a portfolio that survives",
    duration: "16 min",
    content: `
<h2>The Risk-Return Tradeoff</h2>
<p>One of finance's most fundamental principles: in efficient markets, higher expected returns come with higher risk. There's no free lunch. Treasury bills (U.S. government 3-month debt) return ~5% with near-zero risk. The S&P 500 has returned ~10% historically, but with years like 2008 (−37%) and 2022 (−18%). Startup equity might return 50%+, or 0%.</p>
<p>Risk in finance is typically measured by <strong>volatility</strong>, the standard deviation of returns. A stock with annual return volatility of 25% will typically see its price fluctuate within a range of ±25% around its expected return in two-thirds of years (one standard deviation interval).</p>

<h2>Measuring Volatility</h2>
<p>For a stock with daily returns r₁, r₂, …, rₙ:</p>
<blockquote>
  Mean return: μ = (1/n) Σ rᵢ<br/>
  Variance: σ² = (1/(n−1)) Σ (rᵢ − μ)²<br/>
  Daily volatility: σ_daily = √(variance)<br/>
  Annualized volatility: σ_annual = σ_daily × √252
</blockquote>
<p>The √252 annualization uses 252 as the number of trading days per year. This is a standard convention across all of finance.</p>

<h2>The Magic of Diversification</h2>
<p>Here's one of finance's few true free lunches: diversification reduces risk <em>without</em> sacrificing expected return. When you hold multiple assets, their random fluctuations partially cancel out, as long as they don't move in perfect lockstep.</p>
<p>The correlation ρ between two assets ranges from −1 (perfectly opposite) to +1 (perfectly same). For a two-asset portfolio:</p>
<blockquote>σ²_portfolio = w₁²σ₁² + w₂²σ₂² + 2·w₁·w₂·σ₁·σ₂·ρ</blockquote>
<p>When ρ &lt; 1, the portfolio volatility is less than the weighted average of individual volatilities. When ρ = −1, you can theoretically build a zero-variance portfolio: a perfect hedge. In practice, correlations between stocks are positive (0.3–0.7) but not perfect, so diversification always helps.</p>
<p>Nobel Prize winner Harry Markowitz formalized this in 1952 as <strong>Modern Portfolio Theory</strong>. The key insight: risk that can be diversified away (idiosyncratic risk) doesn't require additional expected return. Only undiversifiable risk (market risk, or systematic risk) is compensated.</p>

<h2>The Sharpe Ratio: Risk-Adjusted Return</h2>
<p>Comparing raw returns is misleading. A fund returning 20%/year taking extreme risk is not necessarily better than one returning 12%/year with steady performance. The <strong>Sharpe ratio</strong> adjusts for risk:</p>
<blockquote>Sharpe = (Return_portfolio − Return_risk_free) / σ_portfolio</blockquote>
<p>A Sharpe ratio of 1.0 means you're earning 1 unit of excess return per unit of risk, considered good. Above 2.0 is excellent and rare. Below 0.5 is poor. Buffett's Berkshire Hathaway has maintained a Sharpe ratio of ~0.7 over decades. That sounds modest until you factor in the scale and how long it's held up.</p>

<h2>Systematic vs. Idiosyncratic Risk</h2>
<p>Total stock risk decomposes into two components:</p>
<ul>
  <li><strong>Systematic (market) risk:</strong> Driven by economy-wide factors like recessions, interest rate changes, and pandemics. All stocks are affected. Cannot be diversified away. Measured by <strong>beta</strong> (covered in the Quant track).</li>
  <li><strong>Idiosyncratic (specific) risk:</strong> Company-specific events like a product failure, a CEO scandal, accounting fraud. This is the free lunch: it can be diversified away almost entirely.</li>
</ul>
<div class="lesson-stat">
  <span class="lesson-stat-value">~90%</span>
  <span class="lesson-stat-label">Reduction in idiosyncratic risk from holding just 20–30 uncorrelated stocks instead of one. Academic research (Fama-French) found that 20–50 randomly chosen stocks captures most of the benefit; beyond 50, it's marginal.</span>
</div>
    `,
    sandboxes: [
      {
        afterSectionId: "the-sharpe-ratio-risk-adjusted-return",
        title: "Sharpe Ratio",
        formula: "Sharpe = (Return − Risk-Free Rate) / Volatility",
        variables: [
          { key: "ret", label: "Portfolio return", unit: "%", defaultValue: 12, min: -20, max: 40, step: 0.5 },
          { key: "rf", label: "Risk-free rate", unit: "%", defaultValue: 5, min: 0, max: 10, step: 0.25 },
          { key: "vol", label: "Volatility (σ)", unit: "%", defaultValue: 10, min: 1, max: 50, step: 0.5 },
        ],
        computeId: "sharpeRatio",
        resultLabel: "Sharpe ratio",
        decimals: 2,
      },
    ],
    exercise: {
      prompt: "Implement `annualized_volatility`, `portfolio_volatility` (two assets), and `sharpe_ratio`.",
      starterCode: `import math

def annualized_volatility(daily_returns):
    """
    Compute annualized volatility from a list of daily returns.
    1. Compute mean of daily_returns
    2. Compute sample variance (divide by n-1)
    3. Std dev = sqrt(variance)
    4. Annualize: multiply by sqrt(252)
    Returns annualized vol as a decimal (0.20 = 20%).
    """
    # YOUR CODE HERE
    pass

def portfolio_volatility(w1, sigma1, w2, sigma2, correlation):
    """
    Volatility of a 2-asset portfolio.
    sigma_p = sqrt(w1^2*sigma1^2 + w2^2*sigma2^2 + 2*w1*w2*sigma1*sigma2*rho)
    """
    # YOUR CODE HERE
    pass

def sharpe_ratio(portfolio_return, risk_free_rate, portfolio_volatility):
    """
    Sharpe ratio = (Rp - Rf) / sigma_p
    Return None if portfolio_volatility is 0.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `import math

def annualized_volatility(daily_returns):
    n = len(daily_returns)
    mean = sum(daily_returns) / n
    variance = sum((r - mean) ** 2 for r in daily_returns) / (n - 1)
    return math.sqrt(variance) * math.sqrt(252)

def portfolio_volatility(w1, sigma1, w2, sigma2, correlation):
    var = (w1**2 * sigma1**2 + w2**2 * sigma2**2 +
           2 * w1 * w2 * sigma1 * sigma2 * correlation)
    return math.sqrt(var)

def sharpe_ratio(portfolio_return, risk_free_rate, portfolio_volatility):
    if portfolio_volatility == 0:
        return None
    return (portfolio_return - risk_free_rate) / portfolio_volatility
`,
      testFn: `
import math

# Constant returns -> vol = 0 (approximately)
flat = [0.001] * 50
vol_flat = annualized_volatility(flat)
assert vol_flat < 1e-10, f"Constant returns should have zero vol: {vol_flat}"

# Known daily returns
returns = [0.01, -0.01, 0.02, -0.02, 0.01, -0.01, 0.03, -0.03]
vol = annualized_volatility(returns)
assert 0.15 < vol < 0.45, f"Vol out of range: {vol:.4f}"

# 50/50 portfolio of uncorrelated assets
pv = portfolio_volatility(0.5, 0.20, 0.5, 0.20, 0.0)
expected = math.sqrt(0.25 * 0.04 + 0.25 * 0.04)
assert abs(pv - expected) < 1e-9, f"Portfolio vol: {pv:.4f} vs {expected:.4f}"

# Perfectly correlated = weighted average
pv_corr1 = portfolio_volatility(0.6, 0.20, 0.4, 0.30, 1.0)
assert abs(pv_corr1 - (0.6*0.20 + 0.4*0.30)) < 1e-6

# Sharpe ratio
sr = sharpe_ratio(0.12, 0.05, 0.10)
assert abs(sr - 0.7) < 1e-9, f"Sharpe: {sr}"
assert sharpe_ratio(0.10, 0.05, 0) is None

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-6",
    title: "Building Your Portfolio",
    subtitle: "Asset allocation, index funds, and long-term wealth",
    duration: "14 min",
    content: `
<h2>Asset Allocation: The Most Important Decision</h2>
<p>A famous 1986 study by Brinson, Hood, and Beebower found that <strong>asset allocation</strong> (how you divide your portfolio among different asset classes) explains about 90% of long-term portfolio performance. Whether you pick Apple or Microsoft matters far less than whether you're 80% equities vs. 50% equities.</p>
<p>The main asset classes:</p>
<ul>
  <li><strong>Equities (stocks):</strong> Highest long-term return (~10%/year historically), highest volatility (~15–20%/year). Primary wealth-building engine.</li>
  <li><strong>Fixed income (bonds):</strong> Lower return (~4–6%), lower volatility. Provides stability and income. U.S. Treasuries are virtually risk-free. Corporate bonds offer more yield with credit risk.</li>
  <li><strong>Cash &amp; cash equivalents:</strong> Money market funds, T-bills. Virtually zero risk, low return. Store of value.</li>
  <li><strong>Alternatives:</strong> Real estate (REITs), commodities, private equity, hedge funds. Diversification and inflation hedging.</li>
</ul>
<p>A classic rule of thumb: hold your age in bonds (60-year-old → 60% bonds, 40% stocks). Modern advice skews more aggressive for young investors: a 20-year-old with a 40-year investment horizon can ride out volatility and should be mostly in equities.</p>

<h2>The Case for Index Funds</h2>
<p>Most professional fund managers underperform their benchmark index over 10+ years after fees. S&P Dow Jones data shows that over 15 years, 85–90% of actively managed large-cap funds underperform the S&P 500. Why?</p>
<ul>
  <li>Markets are semi-efficient: professional analysts already know most of what's in public filings</li>
  <li>Management fees (1–2%/year for active funds vs. 0.03–0.05% for index funds) compound dramatically over time</li>
  <li>Transaction costs from frequent trading erode returns</li>
</ul>
<p>Warren Buffett's 2007 bet: he wagered $1 million that a simple S&P 500 index fund would outperform any basket of hedge funds over 10 years. He won easily.</p>
<div class="lesson-compare">
  <div>
    <span class="lesson-compare-label">Basket of hedge funds</span>
    <p style="margin:0;font-family:var(--font-mono);font-size:1.6rem;font-weight:700;color:var(--ink);">22%</p>
    <p style="margin-top:0.3rem;font-size:0.85rem;color:var(--ink-3);">Cumulative return, 10 years</p>
  </div>
  <div>
    <span class="lesson-compare-label">S&amp;P 500 index fund</span>
    <p style="margin:0;font-family:var(--font-mono);font-size:1.6rem;font-weight:700;color:var(--grass);">85.4%</p>
    <p style="margin-top:0.3rem;font-size:0.85rem;color:var(--ink-3);">Cumulative return, 10 years</p>
  </div>
</div>
<p>For most investors, especially high schoolers just starting out, a simple portfolio of two or three low-cost index ETFs is likely to outperform everything more complicated.</p>

<h2>A Simple Three-Fund Portfolio</h2>
<p>The "Bogleheads three-fund portfolio" (popularized by Vanguard founder Jack Bogle) has decades of evidence behind it, and it's about as simple as investing gets:</p>
<ol>
  <li><strong>U.S. Total Stock Market:</strong> VTI (0.03% fee). Captures ~4,000 U.S. companies.</li>
  <li><strong>International Stock Market:</strong> VXUS (0.07% fee). Diversifies beyond U.S. stocks.</li>
  <li><strong>U.S. Bond Market:</strong> BND (0.03% fee). Reduces volatility.</li>
</ol>
<p>A 22-year-old might hold 80% VTI / 10% VXUS / 10% BND and rebalance annually. This three-fund portfolio provides broad diversification, minimal fees, and requires about 1 hour per year to maintain.</p>

<h2>The Power of Compounding</h2>
<p>Time is the most powerful variable in investing. $10,000 invested at 10%/year:</p>
<ul>
  <li>After 10 years: $25,937</li>
  <li>After 20 years: $67,275</li>
  <li>After 30 years: $174,494</li>
  <li>After 40 years: $452,593</li>
</ul>
<p>Albert Einstein allegedly called compound interest "the eighth wonder of the world" (he probably didn't, but the numbers above make a decent case for him). Starting at 18 instead of 28, just 10 extra years, roughly doubles your ending wealth.</p>

<h2>Rebalancing</h2>
<p>As assets grow at different rates, your allocation drifts. If equities surge, you might end up 90% stocks when you wanted 70%. Annual rebalancing, selling what grew and buying what lagged, keeps you at target and forces you to "buy low, sell high" mechanically, without emotional decisions.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "the-power-of-compounding",
        title: "Compound Growth",
        formula: "FV = Initial × (1 + Rate)^Years",
        variables: [
          { key: "initial", label: "Initial amount", unit: "$", defaultValue: 10000, min: 100, max: 100000, step: 100 },
          { key: "rate", label: "Annual return", unit: "%", defaultValue: 10, min: 0, max: 20, step: 0.5 },
          { key: "years", label: "Years", defaultValue: 20, min: 1, max: 50, step: 1 },
        ],
        computeId: "compoundGrowth",
        resultLabel: "Future value",
        resultPrefix: "$",
        decimals: 0,
      },
    ],
    exercise: {
      prompt: "Implement `compound_growth` and `rebalance_weights`.",
      starterCode: `def compound_growth(initial, annual_return, years):
    """
    Compute final value after compound growth.
    FV = initial * (1 + annual_return)^years
    """
    # YOUR CODE HERE
    pass

def rebalance_weights(current_values, target_weights):
    """
    Given current portfolio values and target weights (must sum to 1.0),
    return the dollar amount to buy (+) or sell (-) for each asset.

    current_values: list of current dollar values per asset
    target_weights: list of target weights (fractions, must sum to 1.0)

    Steps:
    1. Total portfolio value = sum(current_values)
    2. Target value per asset = total * target_weight
    3. Trade needed = target_value - current_value (positive = buy, negative = sell)
    Returns a list of trades.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def compound_growth(initial, annual_return, years):
    return initial * (1 + annual_return) ** years

def rebalance_weights(current_values, target_weights):
    total = sum(current_values)
    trades = []
    for current, weight in zip(current_values, target_weights):
        target_val = total * weight
        trades.append(target_val - current)
    return trades
`,
      testFn: `
# Compound growth
assert abs(compound_growth(10000, 0.10, 10) - 25937.42) < 1.0
assert abs(compound_growth(10000, 0.10, 20) - 67275.0) < 1.0
assert compound_growth(10000, 0.0, 10) == 10000.0

# Rebalance
current = [9000, 1000]   # drifted: 90% stocks, 10% bonds
targets = [0.70, 0.30]   # want: 70/30
trades = rebalance_weights(current, targets)
total = sum(current)  # $10,000
assert abs(trades[0] - (7000 - 9000)) < 1e-6  # sell $2000 of stocks
assert abs(trades[1] - (3000 - 1000)) < 1e-6  # buy $2000 of bonds
assert abs(sum(trades)) < 1e-6  # net zero (no external cash)

# Three-fund portfolio
c3 = [80000, 10000, 10000]
t3 = [0.80, 0.10, 0.10]
t3_trades = rebalance_weights(c3, t3)
assert all(abs(t) < 1e-6 for t in t3_trades), "Already at target, no trades needed"

print("Tests passed!")
`,
    },
  },
];
