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
    prereqs: {
      summary: "None — this is the starting point of the curriculum. Just curiosity and comfort with basic arithmetic.",
    },
    content: `
<h2>Owning a Piece of a Business</h2>
<p>Say a company needs money. Maybe it wants to build a factory, hire a hundred engineers, or open stores in a new country. It has two options: borrow the money, or sell off little pieces of itself to people willing to fund it. A <strong>stock</strong> is one of those pieces — a share of ownership in the company, no different in principle from owning a slice of a pizza you split with friends, except the pizza is a business and the slices can be bought and sold to strangers on the internet at 9:31am every weekday.</p>
<p>Apple has about 15.3 billion shares outstanding. Own 100 of them and you own roughly 0.0000007% of Apple — a number so small it's almost a joke, except it isn't. It's real ownership. When Apple earns $100 billion in a year, your 100 shares are legally entitled to their proportional cut, whether that shows up as a dividend check or as the company reinvesting it on your behalf and (hopefully) making your slice worth more.</p>

<h2>Going Public</h2>
<p>Every company starts private. A founder owns it, maybe some early employees and investors get a piece too, and that's the whole cap table. At some point, if the company wants a lot more money than a few investors can provide, it can sell shares to the entire public for the first time — an <strong>IPO</strong>, or Initial Public Offering.</p>
<p>Getting there involves investment banks (the underwriters), who help set the opening price, pitch the offering to big institutional investors, and get the stock listed on an exchange like the NYSE or NASDAQ. The company only actually receives cash from that first sale. Everything after — every trade you see on your phone — is investors buying and selling shares to each other in what's called the secondary market. The company doesn't see a cent of it.</p>
<p>A few IPOs worth knowing: Google went public in 2004 at $85 a share. Facebook in 2012 at $38. Airbnb in 2020 at $68. Each one was the moment a company's ownership stopped being a private arrangement and became something anyone with a brokerage account could buy.</p>

<h2>Common vs. Preferred Stock</h2>
<p>Not all shares are the same shape. What almost everyone buys is <strong>common stock</strong>. There's a second, less-talked-about kind called <strong>preferred stock</strong> that behaves more like a bond wearing a stock costume.</p>
<div class="lesson-compare">
  <div>
    <span class="lesson-compare-label">Common stock</span>
    <ul>
      <li>One vote per share on things like electing the board or approving a merger</li>
      <li>Dividends if — and only if — the board decides to pay them</li>
      <li>Last in line if the company goes under, after creditors and preferred holders. Often nothing left at all</li>
    </ul>
  </div>
  <div>
    <span class="lesson-compare-label">Preferred stock</span>
    <ul>
      <li>Usually no vote at all</li>
      <li>A fixed dividend, paid before common holders see anything</li>
      <li>Ahead of common stock in a liquidation — but still behind debt</li>
      <li>Capped upside: doesn't get much richer even if the company takes off</li>
    </ul>
  </div>
</div>
<p>Think of it as a spectrum with bonds on one end and common stock on the other. Preferred sits in the middle: you give up the chance at a big win in exchange for getting paid first and more reliably.</p>

<h2>How Stock Prices Are Set</h2>
<p>There's no formula that spits out "the" price of a stock. It's whatever a willing buyer and a willing seller agree on, right now, on an exchange. That's it. That's the whole mechanism.</p>
<p>What keeps that from being totally random is that both sides are trying to guess the same thing: what the company's future cash is worth today. A stock at $100 with $5 of annual earnings per share has a P/E ratio of 20 — investors are effectively paying 20 years of today's earnings up front, betting the company grows into that price. We'll spend a full lesson on valuation later (Lesson 4), but it's worth planting now: price and value are not the same question.</p>

<h2>Market Capitalization</h2>
<p>The simplest number for "how big is this company" is <strong>market capitalization</strong>, or market cap — just share price times shares outstanding.</p>
<blockquote>Market Cap = Share Price × Shares Outstanding</blockquote>
<p>It's the market's current, collective, constantly-changing opinion of what the whole business is worth. Companies get bucketed by size:</p>
<ul>
  <li><strong>Mega-cap:</strong> $200B+ — Apple, Microsoft, Nvidia</li>
  <li><strong>Large-cap:</strong> $10B–$200B — Walmart, Nike</li>
  <li><strong>Mid-cap:</strong> $2B–$10B</li>
  <li><strong>Small-cap:</strong> $300M–$2B</li>
  <li><strong>Micro-cap:</strong> under $300M</li>
</ul>
<p>One thing market cap doesn't capture: debt. For that you want <em>enterprise value</em>, which adds debt back in and subtracts cash — closer to what it'd actually cost to buy the whole company outright. More on that in Lesson 4 too.</p>

<h2>Why Does the Stock Price Change?</h2>
<p>Every price move is the market updating its guess about future cash flows. An earnings beat, a new product, a CEO stepping down, an inflation report, a surprise rate hike — none of these change what the company owns today, but all of them change what people expect it to earn tomorrow, and the price moves to match.</p>
<p>What's genuinely surprising is how fast this happens. Professional trading firms run supercomputers and, in some cases, literally rent satellite time to count cars in Walmart parking lots before earnings season. By the time you read a headline, the price has usually already moved. That's the honest reason beating the market consistently is so hard: the price you're looking at already has almost everything knowable baked into it.</p>
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
    prereqs: {
      summary: "Builds on Lesson 1's idea of stock ownership — no new math.",
    },
    content: `
<h2>Exchanges and Brokers</h2>
<p>An exchange is just a regulated place for buyers and sellers to meet. In the U.S. that mostly means the <strong>NYSE</strong> (founded 1792 — older than the country's currency) and the <strong>NASDAQ</strong> (1971, the first fully electronic one).</p>
<p>You don't trade on an exchange directly. You go through a broker — Fidelity, Schwab, Robinhood, whoever's app is on your phone. Submit an order there and it gets routed to an exchange or a market maker who finds someone to take the other side. Most retail brokers charge $0 commission now, which sounds generous until you learn they're often paid instead by the market makers they route your order to — a practice called payment for order flow. Nobody's doing this for free; you're just not the one paying directly.</p>

<h2>The Bid-Ask Spread</h2>
<p>A stock never has just one price. At any instant it has two:</p>
<ul>
  <li><strong>Bid</strong> — the highest price any buyer is currently offering</li>
  <li><strong>Ask</strong> (or offer) — the lowest price any seller will accept</li>
</ul>
<p>The gap between them is the <strong>spread</strong>, and it's effectively the toll you pay for trading right now instead of waiting. On something liquid like Apple, that toll might be a single cent. On a thinly-traded small-cap, it can run fifty cents or more.</p>
<p>Buy with a market order and you pay the ask. Sell with one and you get the bid. Whoever's on the other side — usually a market maker — pockets the difference as payment for standing ready to trade with you at any moment.</p>

<h2>Order Types</h2>
<p>Most costly beginner mistakes come down to using the wrong order type:</p>
<ul>
  <li><strong>Market order</strong> — fill it now, at whatever the going price is. Guarantees you get filled, not what you pay. Dangerous on anything illiquid.</li>
  <li><strong>Limit order</strong> — fill it only at your price or better. A buy limit at $100 fills only if someone's selling at $100 or less. Guarantees your price, not that you'll get filled at all.</li>
  <li><strong>Stop order</strong> — sits dormant until the price hits your trigger, then converts to a market order. "Sell if it drops to $90" is a stop order.</li>
  <li><strong>Stop-limit order</strong> — same trigger, but converts to a limit order instead, so you don't get blindsided by a price that gapped straight through your stop overnight.</li>
</ul>
<p>For anything you're not in a screaming hurry to trade, a limit order is almost always the better call.</p>
<div class="lesson-stat">
  <span class="lesson-stat-value">$10–50</span>
  <span class="lesson-stat-label">What a limit order can save you over a market order on a single $10,000 trade — just from not paying whatever price the market happens to throw at you.</span>
</div>

<h2>The Order Book</h2>
<p>Every exchange keeps a running list of every outstanding limit order — the <strong>order book</strong>. Whatever sits at the very top, the best bid and best ask across every exchange at once, is called the NBBO.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Definition</span>
  <p><strong>NBBO</strong> — National Best Bid and Offer. Brokers are legally required to fill your order at a price at least as good as this, no matter which exchange actually executes the trade.</p>
</div>
<p>Below the best bid sit lower bids from buyers willing to pay less; above the best ask sit higher asks from sellers wanting more. Stack it all up and you get a picture of liquidity — how much you could actually buy or sell before you started moving the price yourself.</p>
<p>High-frequency trading firms live in this order book at microsecond timescales, constantly posting and pulling orders to catch the spread and react to news faster than any person possibly could.</p>

<h2>Price Impact</h2>
<p>A big enough order doesn't just fill at the current price — it eats through the book, level by level, pushing the price as it goes. That's called market impact. Your $5,000 Apple purchase is a rounding error against a $3 trillion company; a hedge fund buying $500 million in a day will absolutely move it. That's why big desks break large orders into thousands of small ones (algorithms with names like VWAP and TWAP) instead of just slamming one giant market order through.</p>

<h2>Indices</h2>
<p>An index takes hundreds or thousands of individual stock prices and boils them down to a single number you can watch:</p>
<ul>
  <li><strong>S&P 500</strong> — 500 large U.S. companies, weighted by market cap. The default benchmark for "the market."</li>
  <li><strong>Dow Jones (DJIA)</strong> — just 30 companies, and oddly weighted by raw share price rather than size. Famous, but a weaker read on the actual economy than the S&P 500.</li>
  <li><strong>NASDAQ-100</strong> — the 100 biggest non-financial NASDAQ names, tilted hard toward tech.</li>
  <li><strong>Russell 2000</strong> — 2,000 small-cap companies, a better gauge of how smaller businesses are actually doing.</li>
</ul>
<p>Index funds and ETFs simply hold everything in a given index, which is how you end up owning a slice of 500 companies for a few dollars instead of picking one and hoping.</p>
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
    prereqs: {
      summary: "Comfortable with basic arithmetic and percentages. No accounting background assumed — every term is defined here.",
      resources: [
        { label: "Investopedia — How to Read a Balance Sheet", url: "https://www.investopedia.com/terms/b/balancesheet.asp" },
      ],
    },
    content: `
<h2>The Three Core Statements</h2>
<p>Every public company is legally required to file a report with the SEC every quarter (the 10-Q) and every year (the 10-K). Buried inside are three documents that, read together, tell you almost everything about whether a business is actually healthy. This is the single most useful skill in this whole track — more useful than any formula later on — because every valuation model in Lesson 4 is just an opinion built on top of these three statements.</p>

<h2>1. Income Statement (P&L)</h2>
<p>This one answers the question everyone actually cares about first: did the company make money? It's a ladder, and each rung subtracts a different bucket of costs.</p>
<ul>
  <li><strong>Revenue</strong> — everything customers paid, before any costs are subtracted</li>
  <li><strong>Cost of Goods Sold (COGS)</strong> — the direct cost of producing what got sold</li>
  <li>Gross Profit = Revenue − COGS</li>
  <li><strong>Operating Expenses</strong> — R&D, sales, marketing, the overhead of just running the place</li>
  <li>EBIT (Operating Income) = Gross Profit − Operating Expenses</li>
  <li><strong>EBITDA</strong> = EBIT + Depreciation + Amortization — a rough stand-in for "cash earnings," since D&A is an accounting charge, not money actually leaving the building</li>
  <li>Net Income = Revenue − everything: costs, taxes, interest, all of it</li>
</ul>
<p>One ratio worth memorizing here is gross margin — Gross Profit divided by Revenue. A software company can clear 70%+ because serving one more user costs almost nothing. A grocery chain might live at 25%. That gap isn't an accident; it's telling you something structural about how each business actually makes money.</p>

<h2>2. Balance Sheet</h2>
<p>Where the income statement covers a period of time, the balance sheet is a photograph — what the company owns and owes at one specific moment. Everything on it has to balance around one equation:</p>
<blockquote>Assets = Liabilities + Shareholders' Equity</blockquote>
<p>Assets split into current (cash, receivables, inventory — things that turn into cash within a year) and long-term (buildings, equipment, goodwill, patents). Liabilities split the same way: current (bills coming due soon, short-term debt) and long-term (debt that's years out, pension obligations, deferred revenue).</p>
<p>Whatever's left after subtracting liabilities from assets belongs to shareholders — retained profits the company chose to keep rather than pay out, plus whatever cash came in from selling stock in the first place.</p>

<h2>3. Cash Flow Statement</h2>
<p>Net income is an opinion. It depends on accounting choices — when revenue gets recognized, how depreciation gets scheduled — that a company has real discretion over. Cash is much harder to fake, which is exactly why this third statement exists: it tracks money that actually moved.</p>
<ul>
  <li><strong>Operating cash flow</strong> — cash generated by the actual business. This is the section to read first. A healthy company produces this consistently, quarter after quarter.</li>
  <li><strong>Investing cash flow</strong> — money spent on equipment, buildings, acquisitions. Usually negative for a company that's still growing, which is normal, not alarming.</li>
  <li><strong>Financing cash flow</strong> — debt issued or repaid, stock issued, dividends and buybacks paid out.</li>
</ul>
<div class="lesson-callout">
  <span class="lesson-callout-label">Key idea</span>
  <p><strong>Free cash flow</strong> = Operating Cash Flow − Capital Expenditures. It's what's actually left over to hand back to shareholders or reinvest, after paying for the equipment the business needs just to keep running. A lot of professional investors trust this number more than net income, and for good reason — it's much harder to dress up.</p>
</div>

<h2>How the Statements Connect</h2>
<p>These three aren't independent — they're the same business described three different ways, and they check each other. Net income flows into retained earnings on the balance sheet. Depreciation gets subtracted on the income statement but added back on the cash flow statement, because it never actually left the bank account. Capex shows up as an outflow in investing activities and directly reduces free cash flow. A company reporting a healthy profit while its cash flow statement tells a completely different story is exactly the kind of thing these connections are built to expose.</p>

<h2>Red Flags</h2>
<ul>
  <li>Net income rising faster than operating cash flow — a classic tell for earnings that were massaged rather than earned</li>
  <li>Receivables growing faster than revenue — customers are paying slower than they used to</li>
  <li>Inventory piling up faster than COGS — maybe demand isn't what the headline numbers claim</li>
  <li>Debt climbing with no matching growth in revenue</li>
  <li>Goodwill that dwarfs the rest of the balance sheet — often the fingerprint of an overpriced acquisition</li>
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
    prereqs: {
      summary: "Builds directly on Lesson 3 — know what revenue, earnings, and free cash flow mean before this one.",
    },
    content: `
<h2>Intrinsic Value vs. Market Price</h2>
<p>Every investing decision eventually comes down to one question: is this stock cheap, expensive, or about right? The market price is trivial to find — it's on your phone. The hard half is estimating <strong>intrinsic value</strong>: what the business is actually worth based on the cash it'll generate over its lifetime. Valuation is just the name for the process of guessing that second number as carefully as you can.</p>
<p>Benjamin Graham's line on this has survived nearly a century for a reason: "Price is what you pay. Value is what you get." When the price sits well below your estimate of value, you've got what Graham called a margin of safety — room for your estimate to be wrong and still come out fine. That single idea is basically the whole philosophy of value investing.</p>

<h2>Relative Valuation: Multiples</h2>
<p>The fast way to value something is to compare it to its peers using multiples — ratios that scale price against some measure of the underlying business, so companies of wildly different sizes become comparable.</p>
<p><strong>Price-to-Earnings (P/E)</strong> is the one you'll see most:</p>
<blockquote>P/E = Stock Price / Earnings Per Share</blockquote>
<p>A P/E of 20 means you're paying $20 today for every $1 the company earned this year. The higher the number, the more growth the market expects. The S&P 500 has historically averaged around 15–16×; during genuine tech booms it's pushed past 30×. A hot growth name like NVIDIA might trade at 60–100× earnings, while a slow, mature "value" stock sits at 8–12×. It's not that one is right and one is wrong — they're pricing in different futures.</p>
<p>The catch: EPS is an accounting number, and accounting numbers can be nudged. Negative earnings make P/E meaningless outright. And comparing a tech company's P/E to a utility's tells you almost nothing, since the two industries have completely different structural growth rates baked in.</p>
<p><strong>EV/EBITDA</strong> is the multiple professionals reach for more often:</p>
<blockquote>EV = Market Cap + Total Debt − Cash<br/>EV/EBITDA = Enterprise Value / EBITDA</blockquote>
<p>It doesn't care how a company is financed (debt-heavy or debt-free, the comparison still works) and it's measured before taxes, which makes it usable across countries with different tax codes. Typical ranges run 6–10× for mature industries, 3–6× for capital-heavy businesses like manufacturing, and 15–25× for high-growth tech.</p>
<p>Two more worth knowing: <strong>Price-to-Sales</strong>, used for companies that don't have profits yet (tech startups routinely trade at 5–20× revenue), and <strong>Price-to-Book</strong>, which compares price to net assets. A P/B under 1 means the stock trades below its own liquidation value — sometimes a real bargain, sometimes a warning sign that the market knows something you don't.</p>

<h2>Discounted Cash Flow</h2>
<p>Multiples only tell you relative value — cheap or expensive compared to something else. A DCF tries to answer the harder question directly: project the company's future free cash flows, then discount each one back to what it's worth in today's dollars.</p>
<blockquote>Intrinsic Value = Σ [FCF_t / (1 + r)^t] + Terminal Value</blockquote>
<p>FCF_t is the free cash flow expected in year t, r is your discount rate (usually the weighted average cost of capital), and terminal value stands in for every dollar of cash flow beyond your forecast window — typically 5 to 10 years out. It's usually estimated with the Gordon Growth Model:</p>
<blockquote>Terminal Value = FCF_final × (1 + g) / (r − g)</blockquote>
<p>where g is a conservative long-run growth rate, often pegged around 2–3% — roughly GDP growth, since no company can outgrow the economy forever.</p>
<div class="lesson-stat">
  <span class="lesson-stat-value">60–80%</span>
  <span class="lesson-stat-label">How much of a typical DCF's total value comes from the terminal value alone, not the years you actually forecast in detail. Which is exactly why a tiny tweak to your assumptions can swing the answer wildly.</span>
</div>
<p>That sensitivity is the honest weakness of the whole method. Nudge the discount rate from 10% to 12%, or the terminal growth rate from 3% down to 2%, and your output can move 30–50%. There's an old Wall Street joke that DCF really stands for "Don't Count on Figures" — analysts are at least as likely to use it to justify a number they already believed as to actually discover one. The right way to use it is alongside multiples, not instead of them: stress-test your assumptions and think in ranges, not a single confident point estimate.</p>

<h2>A Simple Framework</h2>
<ol>
  <li>Understand the business — how does it actually make money, and how defensible is that?</li>
  <li>Check the trajectory — is revenue growing, and are margins expanding or shrinking?</li>
  <li>Look at the balance sheet — could this company survive a bad year? Is the debt load manageable?</li>
  <li>Compare multiples to peers — trading at a premium or a discount, and can you explain why?</li>
  <li>Sanity-check with DCF — do those multiples imply a growth rate you'd actually bet on?</li>
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
    prereqs: {
      summary: "Comfortable with averages; standard deviation is explained from scratch, so no statistics background is required.",
      resources: [
        { label: "Khan Academy — Standard deviation", url: "https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data/variance-standard-deviation-population/v/statistics-standard-deviation" },
      ],
    },
    content: `
<h2>The Risk-Return Tradeoff</h2>
<p>Markets don't hand out free returns. If something offers a higher expected payoff, it comes bundled with more risk — that trade is basically the whole discipline of finance in one sentence. Three-month U.S. Treasury bills pay around 5% and are about as close to risk-free as money gets. The S&P 500 has averaged closer to 10% historically, but "historically" is doing a lot of work in that sentence — it includes 2008 (−37%) and 2022 (−18%). Put money into early-stage startup equity and you might see 50%+ returns, or you might see zero. All of it, forever.</p>
<p>The standard way to measure risk is <strong>volatility</strong> — the standard deviation of returns. A stock with 25% annual volatility will typically wander within about ±25% of its expected return in roughly two years out of three. That's not a guarantee, just what "one standard deviation" means in practice.</p>

<h2>Measuring Volatility</h2>
<p>Given a series of daily returns r₁, r₂, …, rₙ, here's the actual recipe:</p>
<blockquote>
  Mean return: μ = (1/n) Σ rᵢ<br/>
  Variance: σ² = (1/(n−1)) Σ (rᵢ − μ)²<br/>
  Daily volatility: σ_daily = √(variance)<br/>
  Annualized volatility: σ_annual = σ_daily × √252
</blockquote>
<p>That 252 is the number of trading days in a typical year, and the square-root scaling is a convention you'll see used everywhere in finance, not something specific to this lesson.</p>

<h2>Diversification</h2>
<p>Here's one of the only genuinely free lunches finance has to offer: spreading money across multiple assets lowers your risk without lowering your expected return. It works because each asset's random ups and downs partially cancel each other out, as long as they're not moving in perfect lockstep.</p>
<p>The correlation between two assets, ρ, runs from −1 (perfectly opposite) to +1 (perfectly identical). For a two-asset portfolio:</p>
<blockquote>σ²_portfolio = w₁²σ₁² + w₂²σ₂² + 2·w₁·w₂·σ₁·σ₂·ρ</blockquote>
<p>Any time ρ is less than 1, the combined portfolio ends up less volatile than a simple weighted average of its two pieces would suggest. Push ρ all the way to −1 and you could, in theory, build a portfolio with zero variance — a perfect hedge. Real stocks don't cooperate that well; correlations usually sit somewhere between 0.3 and 0.7. Still positive, but far from 1, which is exactly why diversifying always helps at least a little.</p>
<p>Harry Markowitz turned this into a Nobel Prize in 1952 by formalizing it as Modern Portfolio Theory. His core claim: risk you can diversify away shouldn't earn you anything extra for holding it. Only the risk you're stuck with no matter how many stocks you own — systematic, market-wide risk — actually deserves to be compensated.</p>

<h2>The Sharpe Ratio</h2>
<p>Raw return numbers alone are a trap. A fund that returned 20% last year by taking on huge risk isn't obviously better than one that returned a steadier 12%. The Sharpe ratio fixes that by dividing out the risk:</p>
<blockquote>Sharpe = (Return_portfolio − Return_risk_free) / σ_portfolio</blockquote>
<p>A Sharpe of 1.0 is generally considered solid — one unit of extra return per unit of risk taken. Above 2.0 is rare and excellent. Below 0.5 is weak. Warren Buffett's Berkshire Hathaway has run around a 0.7 Sharpe ratio across decades — which sounds unremarkable until you remember it's been sustained at enormous scale for longer than most investors have been alive.</p>

<h2>Systematic vs. Idiosyncratic Risk</h2>
<p>All of a stock's risk splits into two buckets:</p>
<ul>
  <li><strong>Systematic risk</strong> — recessions, rate hikes, pandemics. Economy-wide forces that touch every stock at once. You can't diversify your way out of this one; it's measured by beta, which the Quant track covers.</li>
  <li><strong>Idiosyncratic risk</strong> — a bad product launch, a CEO scandal, one company's specific accounting fraud. This is the free-lunch part: own enough different companies and this risk mostly cancels itself out.</li>
</ul>
<div class="lesson-stat">
  <span class="lesson-stat-value">~90%</span>
  <span class="lesson-stat-label">How much idiosyncratic risk disappears just by holding 20–30 uncorrelated stocks instead of one. Fama and French found most of that benefit shows up by around 20–50 stocks — past that, adding more barely moves the needle.</span>
</div>
    `,
    sandboxes: [
      {
        afterSectionId: "the-sharpe-ratio",
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
    prereqs: {
      summary: "Builds directly on Lesson 5's diversification concept — this is where it becomes an actual portfolio.",
    },
    content: `
<h2>The Decision That Matters Most</h2>
<p>In 1986, three researchers named Brinson, Hood, and Beebower dug into what actually drives portfolio performance over time, and the answer surprised a lot of people: roughly 90% of it comes down to <strong>asset allocation</strong> — how you split your money across stocks, bonds, cash, and everything else. Not stock picking. Not timing the market. Just the split. Whether you happened to buy Apple or Microsoft matters far less than whether you were 80% in stocks or 50%.</p>
<p>The main buckets you're splitting between:</p>
<ul>
  <li><strong>Equities (stocks):</strong> The engine. Highest long-term return, historically around 10%/year, but also the most volatile — expect swings of 15–20% in a given year.</li>
  <li><strong>Fixed income (bonds):</strong> Lower return, usually 4–6%, and a lot calmer. U.S. Treasuries are about as close to risk-free as investing gets; corporate bonds pay more but carry the risk the company doesn't pay you back.</li>
  <li><strong>Cash and cash equivalents:</strong> Money market funds, T-bills. Barely any risk, barely any return. This is where money goes to sit still.</li>
  <li><strong>Alternatives:</strong> Real estate, commodities, private equity, hedge funds. Mostly useful for diversification and as a hedge against inflation, less so as a core holding.</li>
</ul>
<p>The old rule of thumb was to hold your age in bonds — a 60-year-old at 60% bonds, 40% stocks. Modern advice has drifted more aggressive for anyone young: a 20-year-old with 40 years ahead of them can afford to ride out a bad decade or two, so the advice now skews toward staying mostly in equities for a lot longer than your grandparents did.</p>

<h2>Why Index Funds Keep Winning</h2>
<p>Here's an uncomfortable fact for anyone who dreams of picking stocks for a living: most professional fund managers lose to their own benchmark. S&P Dow Jones tracks this every year, and over 15-year stretches, somewhere between 85% and 90% of actively managed large-cap funds underperform the S&P 500 itself. A few reasons that keeps happening:</p>
<ul>
  <li>Markets are semi-efficient — the professional analysts trying to find an edge are mostly reading the same public filings you could read</li>
  <li>Active funds charge 1–2% a year in fees versus 0.03–0.05% for an index fund, and that gap compounds into real money over decades</li>
  <li>Frequent trading racks up transaction costs that quietly eat into returns</li>
</ul>
<p>In 2007, Warren Buffett put a number on this. He bet $1 million that a plain S&P 500 index fund would beat a hand-picked basket of hedge funds over the following 10 years. It wasn't close.</p>
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
<p>For most people — especially a high schooler just getting started — two or three low-cost index ETFs will quietly outperform almost anything more complicated you could build instead.</p>

<h2>A Portfolio in Three Funds</h2>
<p>The "Bogleheads three-fund portfolio," named for the community that grew up around Vanguard founder Jack Bogle's ideas, has decades of evidence behind it and is about as simple as investing gets:</p>
<ol>
  <li><strong>U.S. Total Stock Market:</strong> VTI, a 0.03% fee, roughly 4,000 U.S. companies in one ticker.</li>
  <li><strong>International Stock Market:</strong> VXUS, 0.07% fee, everything outside the U.S.</li>
  <li><strong>U.S. Bond Market:</strong> BND, 0.03% fee, the ballast that smooths out the ride.</li>
</ol>
<p>A 22-year-old might run 80% VTI / 10% VXUS / 10% BND and check in once a year to rebalance. That's it — broad diversification, fees so low they barely register, and about an hour of upkeep annually.</p>

<h2>Why Time Beats Almost Everything</h2>
<p>Nothing in investing does more work for you than time. Take $10,000 growing at 10% a year and just let it sit:</p>
<ul>
  <li>After 10 years: $25,937</li>
  <li>After 20 years: $67,275</li>
  <li>After 30 years: $174,494</li>
  <li>After 40 years: $452,593</li>
</ul>
<p>Einstein is often credited with calling compound interest "the eighth wonder of the world." He almost certainly never said it, but look at those numbers again and it's easy to see why people keep attributing it to him anyway. Start at 18 instead of 28 — just ten extra years — and your ending balance roughly doubles. Nothing else in this lesson moves the needle that much for that little effort.</p>

<h2>Rebalancing</h2>
<p>Your target allocation doesn't hold still on its own. If stocks have a great run, you might look up and find yourself at 90% equities when you meant to be at 70%. Rebalancing once a year — selling a bit of whatever grew, buying a bit of whatever lagged — pulls you back to target. It also does something psychologically useful: it forces "buy low, sell high" as a mechanical habit, instead of a decision you have to make in the moment with your emotions involved.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "why-time-beats-almost-everything",
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
  {
    id: "inv-7",
    title: "Bonds and Fixed Income",
    subtitle: "Why bond prices fall when rates rise, and how to read a yield",
    duration: "15 min",
    prereqs: {
      summary: "Comfortable with percentages and the compound-growth idea from Lesson 6 — no new math beyond that.",
      resources: [
        { label: "Investopedia — Bond Basics", url: "https://www.investopedia.com/terms/b/bond.asp" },
        { label: "Khan Academy — Bonds", url: "https://www.khanacademy.org/economics-finance-domain/core-finance/stock-and-bonds" },
      ],
    },
    content: `
<h2>You're the Bank Now</h2>
<p>Buy a stock and you own a sliver of a company. Buy a <strong>bond</strong> and you've done something different — you've lent someone money. Governments and corporations both need to borrow, and instead of walking into a bank, they issue bonds directly to investors: you hand over cash today, and in exchange they promise to pay you back later, with interest along the way. The U.S. government has leaned on this exact tool since before it was the U.S. government — the Continental Congress sold bonds to finance the Revolutionary War, and "war bonds" funded both World Wars a century and a half later.</p>
<p>Bonds don't get talked about nearly as much as stocks, but the bond market is actually larger — more money sits in fixed income globally than in equities. Every pension fund, every insurance company, every "safe" portion of a target-date retirement fund leans on bonds to do a job stocks can't: pay a predictable amount, on a predictable schedule.</p>

<h2>The Anatomy of a Bond</h2>
<p>Every bond, no matter who issued it, is described by the same four numbers:</p>
<ul>
  <li><strong>Face value (par value):</strong> what the bond pays back at maturity — usually $1,000 for an individual bond.</li>
  <li><strong>Coupon rate:</strong> the fixed interest rate paid on the face value, almost always annually or semi-annually. A $1,000 bond with a 5% coupon pays $50 a year.</li>
  <li><strong>Maturity:</strong> the date the issuer pays back the face value and the loan ends. Bonds range from a few months (T-bills) to 30 years (long bonds).</li>
  <li><strong>Yield:</strong> the return you'd actually get buying the bond today — which is <em>not</em> the same as the coupon rate the moment the bond trades for anything other than its face value.</li>
</ul>

<h2>Why Bond Prices Move Opposite Rates</h2>
<p>This is the one idea that makes the rest of fixed income click: <strong>when interest rates rise, existing bond prices fall — and when rates fall, existing bond prices rise.</strong> The mechanism is simpler than it sounds. Say you own a bond paying a fixed 3% coupon, and then rates in the broader market jump to 5%. Nobody wants to pay full price for your 3% bond anymore when brand-new bonds are paying 5% — so the price of your bond has to drop until its yield (what a buyer would actually earn from here) catches up to what's available elsewhere.</p>
<blockquote>Bond price = PV(all future coupon payments) + PV(face value at maturity)</blockquote>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>Push the market yield above the coupon rate and watch the bond's price fall below its $1,000 face value — that's a bond trading "at a discount." Pull yield below the coupon and it trades "at a premium," above face value.</p>
</div>
<p>This is exactly why 2022 was one of the worst years on record for bond funds: the Fed raised rates aggressively to fight inflation, and every existing lower-coupon bond in the market got repriced downward all at once.</p>

<h2>Types of Bonds, Ranked by Risk</h2>
<ul>
  <li><strong>U.S. Treasuries:</strong> issued by the federal government, backed by its ability to tax and print money. About as close to "risk-free" as investing gets — which is exactly why the risk-free rate in CAPM (Lesson 1 of Quant Investing) is a Treasury rate.</li>
  <li><strong>Municipal bonds ("munis"):</strong> issued by states and cities to fund roads, schools, hospitals. Often exempt from federal (and sometimes state) income tax, which matters more the higher your tax bracket.</li>
  <li><strong>Investment-grade corporate bonds:</strong> issued by financially healthy companies. Higher yield than Treasuries to compensate for the (small) chance the company doesn't pay you back.</li>
  <li><strong>High-yield ("junk") bonds:</strong> issued by companies with weaker credit. Meaningfully higher yield, meaningfully higher default risk. Credit rating agencies — Moody's, S&amp;P, Fitch — grade every bond from AAA down to junk so investors can gauge that risk at a glance.</li>
</ul>

<h2>Duration: How Sensitive Is Your Bond?</h2>
<p><strong>Duration</strong> is a rough measure of how much a bond's price moves for a 1% change in rates — and the single biggest driver of it is time to maturity. A 30-year Treasury swings far more violently on a rate move than a 6-month T-bill does, because there are decades of future coupon payments getting repriced instead of just a few months' worth. If you're worried about rates rising, shorter-duration bonds are the more conservative place to hide; if you think rates are about to fall, longer duration is where the bigger gains sit.</p>

<h2>Where Bonds Fit In Your Portfolio</h2>
<p>Back in Lesson 6, the three-fund portfolio held a slice of BND — the U.S. bond market fund. Bonds aren't there to make you rich; stocks do that job better over the long run. They're there because bonds and stocks don't usually crash at the same time for the same reason, so holding both smooths out the ride. That's also exactly why the "hold your age in bonds" heuristic exists — the closer you are to needing the money, the less you can afford a stock-market gut punch right before you need to spend it.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "why-bond-prices-move-opposite-rates",
        title: "Bond Price",
        formula: "Price = PV(coupons) + PV(face value)",
        variables: [
          { key: "face", label: "Face value", unit: "$", defaultValue: 1000, min: 100, max: 10000, step: 100 },
          { key: "coupon", label: "Coupon rate", unit: "%", defaultValue: 4, min: 0, max: 10, step: 0.25 },
          { key: "years", label: "Years to maturity", defaultValue: 10, min: 1, max: 30, step: 1 },
          { key: "yield", label: "Market yield", unit: "%", defaultValue: 5, min: 0, max: 12, step: 0.25 },
        ],
        computeId: "bondPrice",
        resultLabel: "Bond price",
        resultPrefix: "$",
        decimals: 2,
      },
    ],
    exercise: {
      prompt: "Implement `bond_price` (present value of an annual-pay bond) and `current_yield`.",
      starterCode: `def bond_price(face_value, coupon_rate, years, market_yield):
    """
    Price of an annual-pay bond:
    Price = coupon * (1 - (1+y)^-n) / y + face_value / (1+y)^n
    where coupon = face_value * coupon_rate, y = market_yield, n = years.

    If market_yield == 0, price = coupon * years + face_value.
    """
    # YOUR CODE HERE
    pass

def current_yield(annual_coupon, price):
    """
    Current yield = annual coupon payment / current price.
    Returns a fraction (e.g. 0.05 = 5%), not a percentage.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def bond_price(face_value, coupon_rate, years, market_yield):
    coupon = face_value * coupon_rate
    if market_yield == 0:
        return coupon * years + face_value
    pv_coupons = coupon * (1 - (1 + market_yield) ** -years) / market_yield
    pv_face = face_value / (1 + market_yield) ** years
    return pv_coupons + pv_face

def current_yield(annual_coupon, price):
    return annual_coupon / price
`,
      testFn: `
# At par: coupon rate == market yield -> price == face value
p = bond_price(1000, 0.05, 10, 0.05)
assert abs(p - 1000) < 0.5, f"Should price near par: {p}"

# Yield above coupon -> discount (price below face value)
p_discount = bond_price(1000, 0.03, 10, 0.05)
assert p_discount < 1000, f"Should be a discount bond: {p_discount}"

# Yield below coupon -> premium (price above face value)
p_premium = bond_price(1000, 0.06, 10, 0.04)
assert p_premium > 1000, f"Should be a premium bond: {p_premium}"

# Current yield
cy = current_yield(50, 1000)
assert abs(cy - 0.05) < 1e-9, f"Current yield: {cy}"

cy2 = current_yield(50, 900)
assert cy2 > 0.05, "Lower price -> higher current yield"

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-8",
    title: "Retirement Accounts and Tax Drag",
    subtitle: "401(k)s, IRAs, and why the account you use matters as much as what's in it",
    duration: "14 min",
    prereqs: {
      summary: "Builds directly on the compound-growth math from Lesson 6 — same formula, applied to a tax question instead.",
      resources: [
        { label: "Investopedia — Roth vs. Traditional IRA", url: "https://www.investopedia.com/roth-vs-traditional-ira-4770920" },
        { label: "IRS — Retirement Topics: IRA Contribution Limits", url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-ira-contribution-limits" },
      ],
    },
    content: `
<h2>The Wrapper Matters as Much as What's Inside It</h2>
<p>Two students each invest $6,000 a year in the exact same index fund for 40 years, earning the exact same return. One of them ends up with meaningfully more money — not because they picked better investments, but because of the <em>account</em> they used. That's the part of investing nobody teaches until it's almost too late to fully use: the tax treatment of the account you invest through can matter as much as what you put in it.</p>
<p>Most brokerage accounts are <strong>taxable</strong> by default — you owe capital gains tax when you sell, and tax on dividends every year even if you never sell anything. Retirement accounts exist specifically to change that deal.</p>

<h2>Traditional vs. Roth: Pay Taxes Now or Later</h2>
<p>The two main flavors of retirement account differ in exactly one place: <em>when</em> the IRS gets paid.</p>
<ul>
  <li><strong>Traditional (401(k) or IRA):</strong> contributions go in <em>before</em> tax — they lower your taxable income the year you make them. The money then grows completely untaxed, and you pay ordinary income tax only when you withdraw it in retirement.</li>
  <li><strong>Roth (401(k) or IRA):</strong> contributions go in <em>after</em> tax — no deduction today. But the money then grows completely untaxed, and withdrawals in retirement are entirely tax-free, growth included.</li>
</ul>
<p>The rule of thumb: Roth tends to win if you expect to be in a <em>higher</em> tax bracket later than you are today — which describes almost every high schooler with a summer job. You're very likely in the lowest tax bracket you'll ever be in right now, which makes paying tax today, while it's cheap, and never again, the better trade for a lot of young investors. A custodial Roth IRA can be opened for a minor with earned income (a job, not allowance) well before you'd ever open a normal brokerage account.</p>

<h2>Tax Drag: The Cost of the Wrong Wrapper</h2>
<p>"Tax drag" is what happens to a taxable account's return every year the IRS takes a cut of dividends and realized gains — money that, in a retirement account, would have kept compounding instead. It doesn't feel dramatic in any single year. Over 40 years, it adds up to a real gap.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Try the sandbox below</span>
  <p>Reuse the compound-growth formula from Lesson 6 with two different rates: the full return in a tax-advantaged account, and a slightly lower "after-drag" return in a taxable one. Even a 1-point-a-year difference compounds into a large gap by year 40.</p>
</div>

<h2>Employer Matching: The Only Guaranteed Return in Investing</h2>
<p>If a job offers a 401(k) match — say, the employer adds 50 cents for every dollar you contribute, up to 6% of your salary — that match is an instant, guaranteed 50% return the moment it lands, before the money has even been invested in anything. No stock, no strategy, nothing else in this entire curriculum offers a guaranteed return like that. Contributing at least enough to capture the full match, before optimizing anything else, is close to universal advice among people who study this for a living.</p>

<h2>Contribution Limits Exist for a Reason</h2>
<p>Because these accounts are so tax-advantaged, the IRS caps how much can go in each year — the limits change periodically and are worth checking directly rather than memorizing, since this lesson would go stale the moment they update. The caps matter less at your first job than the habit does: contributing consistently, even in small amounts, for the extra decade a high schooler has over someone starting at 28 is worth more than almost any later catch-up contribution could recover.</p>
    `,
    sandboxes: [
      {
        afterSectionId: "tax-drag-the-cost-of-the-wrong-wrapper",
        title: "Compound Growth",
        formula: "FV = Contribution × (1 + Rate)^Years",
        variables: [
          { key: "initial", label: "Amount invested", unit: "$", defaultValue: 6000, min: 500, max: 50000, step: 500 },
          { key: "rate", label: "Annual return", unit: "%", defaultValue: 9, min: 0, max: 15, step: 0.5 },
          { key: "years", label: "Years", defaultValue: 40, min: 1, max: 50, step: 1 },
        ],
        computeId: "compoundGrowth",
        resultLabel: "Future value",
        resultPrefix: "$",
        decimals: 0,
      },
    ],
    exercise: {
      prompt: "Implement `tax_drag_gap` — the long-run cost of investing the same amount in a taxable account instead of a tax-advantaged one.",
      starterCode: `def future_value(amount, annual_return, years):
    """
    FV = amount * (1 + annual_return)^years
    """
    # YOUR CODE HERE
    pass

def tax_drag_gap(amount, pretax_return, tax_drag, years):
    """
    Compare a tax-advantaged account (full pretax_return) to a taxable
    account (pretax_return - tax_drag, since taxes on dividends/gains
    are paid along the way).

    Returns the dollar gap: FV(tax-advantaged) - FV(taxable).
    Both start with the same 'amount' and compound for 'years'.
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def future_value(amount, annual_return, years):
    return amount * (1 + annual_return) ** years

def tax_drag_gap(amount, pretax_return, tax_drag, years):
    fv_advantaged = future_value(amount, pretax_return, years)
    fv_taxable = future_value(amount, pretax_return - tax_drag, years)
    return fv_advantaged - fv_taxable
`,
      testFn: `
# No tax drag -> no gap
gap_zero = tax_drag_gap(6000, 0.09, 0.0, 40)
assert abs(gap_zero) < 1e-6, f"Zero drag should mean zero gap: {gap_zero}"

# Positive drag -> tax-advantaged account wins
gap = tax_drag_gap(6000, 0.09, 0.01, 40)
assert gap > 0, f"Tax-advantaged should end up ahead: {gap}"

# More years -> bigger gap (compounding effect grows)
gap_20 = tax_drag_gap(6000, 0.09, 0.01, 20)
gap_40 = tax_drag_gap(6000, 0.09, 0.01, 40)
assert gap_40 > gap_20, "Longer horizon should widen the gap"

# Future value sanity check
fv = future_value(1000, 0.10, 10)
assert abs(fv - 2593.74) < 1.0, f"FV: {fv}"

print("Tests passed!")
`,
    },
  },
  {
    id: "inv-9",
    title: "Common Investing Mistakes",
    subtitle: "The behavioral traps that cost more than picking the wrong stock",
    duration: "13 min",
    prereqs: {
      summary: "No new math here — just the concepts from Lessons 1–6, especially diversification and index funds.",
      resources: [
        { label: "Investopedia — Behavioral Finance", url: "https://www.investopedia.com/terms/b/behavioralfinance.asp" },
      ],
    },
    content: `
<h2>The Biggest Risk Is Often You</h2>
<p>Dalbar, a research firm, has tracked the gap between what the S&amp;P 500 actually returns and what the <em>average investor</em> in stock funds actually earns, for decades. The average investor consistently underperforms the index they're invested in — not because their funds are bad, but because of when they buy and sell. This lesson isn't about a formula. It's about the handful of predictable, well-documented mistakes that quietly cost investors more than almost anything covered so far.</p>

<h2>Mistake 1: Trying to Time the Market</h2>
<p>The instinct feels obvious: sell before it drops, buy back in before it rises. The problem is that the market's best days cluster right around its worst ones — a huge share of the S&amp;P 500's long-run return has historically come from just a handful of days a year, and they tend to arrive in the middle of the volatility that scares people into selling in the first place. Miss even a few of those days trying to dodge a downturn, and you can permanently damage a multi-decade return, even if you were right that a crash was coming.</p>

<h2>Mistake 2: Chasing Last Year's Winner</h2>
<p>Whatever sector or stock had the best headlines last year attracts the most new money this year — and that money often arrives right as the trend is running out of room. This is performance-chasing, and it's the mirror image of the buy-low-sell-high goal: buying after a big run-up and selling after a big drop is buying high and selling low, done unintentionally, one emotional decision at a time.</p>

<h2>Mistake 3: Under-Diversifying</h2>
<p>Lesson 5 covered why diversification is close to a free lunch — company-specific risk can be diversified away at close to zero cost. Plenty of investors skip it anyway, loading up on a favorite stock, their own employer's stock, or whatever's trending, because concentration feels more exciting than a boring index fund. It also means a single company's bad quarter can undo years of otherwise-solid decisions.</p>

<h2>Mistake 4: Letting Fees Quietly Compound Against You</h2>
<p>A 1% annual fee sounds trivial. Compounded against you for 40 years, it isn't — Lesson 6's math runs the same direction whether the extra return is working for you or a fee is working against you. Two funds tracking the same index, one charging 0.03% and the other 1%, can end up tens of thousands of dollars apart on a moderate long-term portfolio, for identical underlying investments.</p>
<div class="lesson-callout">
  <span class="lesson-callout-label">Worth checking</span>
  <p>Every fund publishes an expense ratio. It's one number, and it's the single easiest "mistake" on this list to simply avoid — compare it before you buy, not after.</p>
</div>

<h2>Mistake 5: Confusing a Good Company with a Good Investment</h2>
<p>A company can be genuinely excellent — great product, great management, growing fast — and still be a bad investment if the price already assumes all of that. Valuation (Lesson 4) exists precisely because "this is a great company" and "this is a good price to buy it at" are two separate questions, and conflating them is one of the most common ways enthusiasm turns into a loss.</p>

<h2>The Actual Fix: A Plan You Don't Have to Feel Good About</h2>
<p>Every mistake on this list has the same root cause: a decision made in the moment, under emotion, instead of ahead of time by a rule. The three-fund portfolio and annual rebalancing from Lesson 6 exist for exactly this reason — a plan set in advance takes the in-the-moment decision out of your hands on the days you're least equipped to make it well.</p>
    `,
    exercise: {
      prompt: "Implement `fee_drag_cost` — how much a higher expense ratio costs over time, using the same compounding idea as Lesson 6.",
      starterCode: `def future_value(amount, annual_return, years):
    """
    FV = amount * (1 + annual_return)^years
    """
    # YOUR CODE HERE
    pass

def fee_drag_cost(amount, gross_return, expense_ratio, years):
    """
    Cost of a fund's expense ratio over time: the difference between
    growing at gross_return and growing at (gross_return - expense_ratio).

    Returns the dollar cost (a positive number).
    """
    # YOUR CODE HERE
    pass
`,
      solution: `def future_value(amount, annual_return, years):
    return amount * (1 + annual_return) ** years

def fee_drag_cost(amount, gross_return, expense_ratio, years):
    fv_no_fee = future_value(amount, gross_return, years)
    fv_with_fee = future_value(amount, gross_return - expense_ratio, years)
    return fv_no_fee - fv_with_fee
`,
      testFn: `
# Zero fee -> zero cost
cost_zero = fee_drag_cost(10000, 0.08, 0.0, 30)
assert abs(cost_zero) < 1e-6, f"No fee should mean no cost: {cost_zero}"

# A 1% fee over 30 years should cost real money
cost = fee_drag_cost(10000, 0.08, 0.01, 30)
assert cost > 1000, f"1% fee over 30 years should be a meaningful cost: {cost}"

# Higher fee -> higher cost
cost_low = fee_drag_cost(10000, 0.08, 0.005, 30)
cost_high = fee_drag_cost(10000, 0.08, 0.015, 30)
assert cost_high > cost_low, "Higher expense ratio should cost more"

print("Tests passed!")
`,
    },
  },
];
