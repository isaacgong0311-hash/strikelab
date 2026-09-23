import type { Session } from "../types";
import { QUIZZES } from "@/lib/quizzes";

// "How Markets Work" (inv-2) as three short sessions. Facts and numbers
// follow the long-form lesson in src/lib/investingLessons.ts; the existing
// quiz questions are reused rather than duplicated.
const [spreadQuiz, limitQuiz, sp500Quiz] = QUIZZES["inv-2"];

export const INV2_SESSIONS: Session[] = [
  {
    id: "inv-2.1",
    lessonId: "inv-2",
    title: "Two prices, not one",
    steps: [
      {
        kind: "explain",
        id: "inv-2.1.exchanges",
        title: "Where trades happen",
        body: [
          "An **exchange** is a regulated place for buyers and sellers to meet. In the U.S. that mostly means the NYSE (1792) and the NASDAQ (1971, the first fully electronic one).",
          "You never trade there directly. You go through a **broker**, the app on your phone, which routes your order for you.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-2.1.pfof",
        question: "Most brokers charge $0 commission. How do many of them still get paid for your trade?",
        options: [
          "The exchange pays them a flat fee per customer",
          "Market makers pay them to receive your orders",
          "They keep the dividends from your shares",
          "They don't. Trading apps run at a loss",
        ],
        correct: 1,
        explanation: "It's called payment for order flow: market makers pay the broker to route your orders to them. You aren't paying directly, but someone is paying.",
      },
      {
        kind: "explain",
        id: "inv-2.1.bid-ask",
        title: "The bid and the ask",
        body: [
          "At any instant a stock has two prices. The **bid** is the highest price a buyer is offering. The **ask** is the lowest price a seller will accept.",
          "The gap between them is the **spread**: the toll you pay for trading right now instead of waiting.",
        ],
        formula: "Spread = Ask − Bid",
      },
      {
        kind: "numeric",
        id: "inv-2.1.spread-calc",
        question: "A thinly traded small-cap shows a bid of $5.00 and an ask of $5.25. What is the spread, in dollars?",
        answer: 0.25,
        tolerance: 0.001,
        unit: "$",
        explanation: "$5.25 − $5.00 = $0.25. On a heavily traded stock like Apple the same gap is often a single cent.",
      },
      {
        kind: "mcq",
        id: "inv-2.1.market-buy",
        question: "Bid $149.99, ask $150.00. You place a market order to buy. What price do you pay?",
        options: ["$149.99, the bid", "$150.00, the ask", "$149.995, the midpoint", "Whatever you type in"],
        correct: 1,
        explanation: "A market buy takes the best seller's price, the ask. A market sell gets the bid. The market maker on the other side keeps the difference.",
      },
      { kind: "mcq", id: "inv-2.1.spread-check", ...spreadQuiz, options: [...spreadQuiz.options] },
    ],
  },
  {
    id: "inv-2.2",
    lessonId: "inv-2",
    title: "Order types",
    steps: [
      {
        kind: "explain",
        id: "inv-2.2.market-limit",
        title: "Market vs. limit",
        body: [
          "Most costly beginner mistakes come down to picking the wrong order type.",
          "A **market order** fills now, at whatever the going price is. A **limit order** fills only at your price or better, and might not fill at all.",
        ],
        compare: [
          { label: "Market", points: ["Guarantees you get filled", "Doesn't guarantee the price", "Risky on illiquid stocks"] },
          { label: "Limit", points: ["Guarantees your price", "Doesn't guarantee a fill", "Usually the better default"] },
        ],
      },
      { kind: "mcq", id: "inv-2.2.limit-check", ...limitQuiz, options: [...limitQuiz.options] },
      {
        kind: "mcq",
        id: "inv-2.2.limit-fill",
        question: "You place a buy limit at $100. The stock trades between $102 and $105 all day. What happens?",
        options: [
          "It fills at $102, the closest price",
          "It fills at $100 anyway, because limits are guaranteed",
          "It doesn't fill. No one sold at $100 or less",
          "It turns into a market order at the close",
        ],
        correct: 2,
        explanation: "A buy limit fills only at your price or lower. The stock never came down to $100, so the order just waits (or expires).",
      },
      {
        kind: "explain",
        id: "inv-2.2.stops",
        title: "Stop and stop-limit",
        body: [
          "A **stop order** sits dormant until the price hits your trigger, then becomes a market order. \"Sell if it drops to $90\" is a stop.",
          "A **stop-limit** uses the same trigger but becomes a limit order, so a price that gaps straight past your stop overnight can't fill you somewhere awful.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-2.2.stop-gap",
        question: "You hold a stock at $100 with a plain stop to sell at $90. Bad news hits overnight and it opens at $80. Roughly where do you sell?",
        options: ["$90, your stop price", "Around $80, wherever the market is", "$100, your purchase price", "You don't sell at all"],
        correct: 1,
        explanation: "The stop triggers and becomes a market order, which fills at the going price, about $80. A stop-limit at $90 would have refused to sell that low.",
      },
      {
        kind: "explain",
        id: "inv-2.2.half-spread",
        title: "What crossing the spread costs",
        body: [
          "Measured from the midpoint, a market order pays **half the spread** on every share. It looks tiny per share, but it adds up quickly on a big order.",
        ],
        formula: "Spread cost = shares × spread ÷ 2",
      },
      {
        kind: "numeric",
        id: "inv-2.2.spread-cost",
        question: "You buy 100 shares of a stock with a $0.50 spread using a market order. What is your spread cost, in dollars?",
        answer: 25,
        unit: "$",
        explanation: "100 × $0.50 ÷ 2 = $25. The same 100 shares of a one-cent-spread stock would cost 50 cents.",
      },
    ],
  },
  {
    id: "inv-2.3",
    lessonId: "inv-2",
    title: "The order book and indices",
    steps: [
      {
        kind: "explain",
        id: "inv-2.3.book",
        title: "The order book",
        body: [
          "Every exchange keeps a running list of outstanding limit orders: the **order book**. Lower bids stack below the best bid, higher asks above the best ask.",
          "The best bid and ask across every exchange at once is the **NBBO**, the National Best Bid and Offer.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-2.3.nbbo",
        question: "Why does the NBBO matter to you as a retail trader?",
        options: [
          "It's the price the government sets each morning",
          "Brokers must fill you at a price at least as good as it",
          "It's only used for IPOs",
          "It's the average price over the last trading day",
        ],
        correct: 1,
        explanation: "Brokers are legally required to fill your order at the NBBO or better, no matter which exchange actually executes the trade.",
      },
      {
        kind: "explain",
        id: "inv-2.3.impact",
        title: "Big orders move prices",
        body: [
          "A large enough order eats through the book level by level, pushing the price as it goes. That's **market impact**.",
          "Your $5,000 Apple buy is a rounding error. A fund buying $500 million in a day moves the price, so big desks slice orders into thousands of small ones.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-2.3.impact-check",
        question: "A hedge fund needs to buy $500 million of one stock today. What's the smartest way to do it?",
        options: [
          "One giant market order at the open",
          "Split it into many small orders over the day, with an algorithm like VWAP",
          "Wait for the NBBO to reach zero",
          "Ask the exchange for a fixed price",
        ],
        correct: 1,
        explanation: "One giant order would chew through the book and push the price up against the fund. Algorithms like VWAP and TWAP spread the buying out to limit impact.",
      },
      {
        kind: "explain",
        id: "inv-2.3.indices",
        title: "Indices",
        body: [
          "An **index** boils hundreds of stock prices down to one number. The **S&P 500** tracks 500 large U.S. companies weighted by market cap. The **Dow** tracks just 30, weighted by share price.",
          "Index funds and ETFs hold everything in an index, so a few dollars buys a slice of all 500 companies.",
        ],
      },
      { kind: "mcq", id: "inv-2.3.sp500-check", ...sp500Quiz, options: [...sp500Quiz.options] },
      {
        kind: "mcq",
        id: "inv-2.3.small-caps",
        question: "You want to know how small U.S. businesses are doing. Which index is the best gauge?",
        options: ["Dow Jones (DJIA)", "NASDAQ-100", "Russell 2000", "S&P 500"],
        correct: 2,
        explanation: "The Russell 2000 tracks 2,000 small-cap companies. The other three are dominated by the largest firms.",
      },
    ],
  },
];
