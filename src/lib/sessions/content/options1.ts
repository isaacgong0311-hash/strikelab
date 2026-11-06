import type { Session } from "../types";
import { QUIZZES } from "@/lib/quizzes";

// Lesson 1 as short desk decisions. All prices are fictional examples, not
// market quotes. The final coding exercise stays in the full lesson.
const [buyerLossQuiz, callValueQuiz, exerciseStyleQuiz] = QUIZZES["1"];

export const OPTIONS1_SESSIONS: Session[] = [
  {
    id: "1.1",
    lessonId: "1",
    title: "A right, not a requirement",
    steps: [
      {
        kind: "explain",
        id: "1.1.assignment",
        title: "Your first desk decision",
        body: [
          "A client wants exposure to a stock but does not want to buy 100 shares today. An **option** lets the buyer pay for a choice about a later trade.",
          "The buyer gets a **right**, not an obligation. The seller receives a **premium** and must honor the contract if the buyer exercises it.",
        ],
      },
      {
        kind: "mcq",
        id: "1.1.right",
        question: "The stock falls and exercising a call would be a bad deal. What can the call buyer do?",
        options: [
          "Decline to exercise; the premium is still lost",
          "Force the seller to refund the premium",
          "Exercise anyway because the contract requires it",
          "Change the strike after buying",
        ],
        correct: 0,
        explanation: "An option gives the buyer a choice. If exercising is unattractive, they can let it expire, but they do not get the premium back.",
      },
      {
        kind: "explain",
        id: "1.1.calls-puts",
        title: "Two choices",
        body: [
          "A **call** gives its buyer the right to buy at the **strike price**. A **put** gives its buyer the right to sell at that price.",
          "Both rights end at **expiration**. The price paid for either right is the premium.",
        ],
        compare: [
          { label: "Call", points: ["Right to buy", "Useful when a higher stock price would help"] },
          { label: "Put", points: ["Right to sell", "Can protect against a lower stock price"] },
        ],
      },
      {
        kind: "mcq",
        id: "1.1.insurance",
        question: "A fund owns shares and wants the right to sell them for at least $80. Which option would it buy?",
        options: ["A $80 call", "A $80 put", "A $100 call", "No option can set a sale price"],
        correct: 1,
        explanation: "A put gives the holder the right to sell at its strike. An $80 put acts like a floor on the sale price, before its premium is counted.",
      },
      {
        kind: "explain",
        id: "1.1.premium",
        title: "Price the choice",
        body: [
          "A standard equity option contract usually covers **100 shares**. If its quoted premium is $4.50 per share, the buyer pays $450 for one contract.",
          "The premium is the most this option buyer can lose on that contract, assuming they do not take on another position.",
        ],
        formula: "Contract cost = premium per share × 100",
      },
      {
        kind: "numeric",
        id: "1.1.contract-cost",
        question: "A standard 100-share option contract costs $2.75 per share. How many dollars does its buyer pay?",
        answer: 275,
        unit: "$",
        explanation: "$2.75 per share × 100 shares = $275 for one contract.",
      },
      { kind: "mcq", id: "1.1.buyer-loss", ...buyerLossQuiz, options: [...buyerLossQuiz.options] },
    ],
  },
  {
    id: "1.2",
    lessonId: "1",
    title: "Run the payoff",
    steps: [
      {
        kind: "explain",
        id: "1.2.ticket",
        title: "A fictional trade ticket",
        body: [
          "A stock trades at $190. Your client buys a call with a **$195 strike** and pays a **$4.50 premium** per share. It covers 100 shares.",
          "At expiration, the call is worth what buying at $195 and immediately selling at the market price would gain, never less than zero.",
        ],
        formula: "Call value at expiration = max(stock price − strike, 0)",
      },
      {
        kind: "numeric",
        id: "1.2.value-up",
        question: "At expiration the stock is $210. What is this call worth per share before subtracting the premium?",
        answer: 15,
        unit: "$",
        explanation: "The right to buy at $195 is worth $210 − $195 = $15 per share.",
      },
      {
        kind: "explain",
        id: "1.2.net",
        title: "Value is not profit",
        body: [
          "The client paid $4.50 per share for the call. Subtract that cost from the $15 payoff, then multiply by 100 shares to find the contract's net profit.",
        ],
        formula: "Net profit = (payoff per share − premium per share) × 100",
      },
      {
        kind: "numeric",
        id: "1.2.net-profit",
        question: "With the stock at $210 at expiration, what is the net profit on the $195 call bought for $4.50 per share? Give dollars for one 100-share contract.",
        answer: 1050,
        unit: "$",
        explanation: "($210 − $195 − $4.50) × 100 = $1,050 net profit. The $450 premium has already been deducted.",
      },
      {
        kind: "mcq",
        id: "1.2.flat",
        question: "At expiration the stock is still $190. What happens to the call buyer?",
        options: [
          "They exercise and make $500",
          "They let it expire and lose the $450 premium",
          "They get their $450 back",
          "They owe the seller the full stock price",
        ],
        correct: 1,
        explanation: "Buying at the $195 strike is worse than buying the stock for $190. The call expires worthless, so the buyer loses the $4.50 × 100 premium.",
      },
      {
        kind: "numeric",
        id: "1.2.break-even",
        question: "For the $195 call bought at $4.50 per share, what stock price at expiration makes net profit exactly $0?",
        answer: 199.5,
        unit: "$",
        explanation: "$195 strike + $4.50 premium = $199.50. At that stock price, the payoff just repays the premium.",
      },
      { kind: "mcq", id: "1.2.intrinsic-check", ...callValueQuiz, options: [...callValueQuiz.options] },
    ],
  },
  {
    id: "1.3",
    lessonId: "1",
    title: "Decide what the premium buys",
    steps: [
      {
        kind: "explain",
        id: "1.3.now-later",
        title: "What remains before expiration?",
        body: [
          "A call with a $185 strike is quoted at $9 while the stock is $190. Exercising now would produce **$5 intrinsic value** per share.",
          "The other $4 is **extrinsic value**: the market's price for the time and uncertainty still left in the contract.",
        ],
        formula: "Premium = intrinsic value + extrinsic value",
      },
      {
        kind: "numeric",
        id: "1.3.extrinsic",
        question: "A $185-strike call costs $9 per share while the stock is $190. How much of the premium is extrinsic value per share?",
        answer: 4,
        unit: "$",
        explanation: "Intrinsic value is $190 − $185 = $5. The remaining $9 − $5 = $4 is extrinsic value.",
      },
      {
        kind: "explain",
        id: "1.3.moneyness",
        title: "Read the position",
        body: [
          "An **in-the-money** option has positive intrinsic value. A call is in the money when the stock is above its strike; a put is in the money when the stock is below its strike.",
          "An **out-of-the-money** option has no intrinsic value. It can still have a premium before expiration because the price might move.",
        ],
      },
      {
        kind: "mcq",
        id: "1.3.put-money",
        question: "The stock is $72. Which contract is in the money?",
        options: ["A $70 put", "A $75 put", "A $75 call", "A $72 call with zero intrinsic value"],
        correct: 1,
        explanation: "A $75 put gives the right to sell for $75 when the stock is worth $72, so it has $3 of intrinsic value per share.",
      },
      {
        kind: "explain",
        id: "1.3.exercise-style",
        title: "When can the buyer act?",
        body: [
          "An **American-style** option can be exercised any time through expiration. A **European-style** option can be exercised only at expiration.",
          "The names describe exercise rules, not where the option trades.",
        ],
      },
      { kind: "mcq", id: "1.3.exercise-check", ...exerciseStyleQuiz, options: [...exerciseStyleQuiz.options] },
    ],
  },
];
