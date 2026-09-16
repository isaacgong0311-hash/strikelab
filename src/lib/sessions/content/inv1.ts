import type { Session } from "../types";
import { QUIZZES } from "@/lib/quizzes";

// "What Is a Stock?" (inv-1) as three short sessions. Facts and numbers
// follow the long-form lesson in src/lib/investingLessons.ts; the existing
// quiz questions are reused rather than duplicated.
const [ownershipQuiz, marketCapQuiz, peQuiz] = QUIZZES["inv-1"];

export const INV1_SESSIONS: Session[] = [
  {
    id: "inv-1.1",
    lessonId: "inv-1",
    title: "Owning a piece of a business",
    steps: [
      {
        kind: "explain",
        id: "inv-1.1.money",
        title: "Companies need money",
        body: [
          "A company that wants to build a factory or hire a hundred engineers has two choices: **borrow** the money, or **sell small pieces of itself**.",
          "Each of those pieces is a **share of stock**: real, partial ownership of the business.",
        ],
      },
      { kind: "mcq", id: "inv-1.1.what", ...ownershipQuiz, options: [...ownershipQuiz.options] },
      {
        kind: "explain",
        id: "inv-1.1.proportional",
        title: "Ownership is proportional",
        body: [
          "Your slice of the company is your shares divided by all the shares that exist, called **shares outstanding**.",
        ],
        formula: "Ownership = your shares ÷ shares outstanding",
      },
      {
        kind: "numeric",
        id: "inv-1.1.percent",
        question: "A company has 2,000,000 shares outstanding and you own 10,000 of them. What percent of the company do you own?",
        answer: 0.5,
        tolerance: 0.001,
        unit: "%",
        explanation: "10,000 ÷ 2,000,000 = 0.005, which is 0.5% of the company.",
      },
      {
        kind: "explain",
        id: "inv-1.1.apple",
        title: "Tiny, but real",
        body: [
          "Apple has about 15.3 billion shares. Own 100 and you hold roughly 0.0000007% of Apple.",
          "That is still real ownership. When Apple earns money, your shares are entitled to their proportional cut, paid as a **dividend** or **reinvested** by the company to make your slice worth more.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-1.1.profit",
        question: "Apple has a hugely profitable year. How can that profit reach you as a shareholder?",
        options: [
          "Only as a fixed interest payment set when you bought",
          "As a dividend, or reinvested by the company to grow your slice's value",
          "It can't. Profits belong to the company's managers",
          "Every shareholder is mailed the same cash amount",
        ],
        correct: 1,
        explanation: "Shareholders own a proportional claim on earnings. The board can pay some out as dividends or keep them in the business, which should make each share worth more.",
      },
    ],
  },
  {
    id: "inv-1.2",
    lessonId: "inv-1",
    title: "Going public",
    steps: [
      {
        kind: "explain",
        id: "inv-1.2.private",
        title: "Every company starts private",
        body: [
          "At first a founder, some early employees, and a few investors own everything.",
          "When a company needs more money than a few investors can provide, it can sell shares to the public for the first time. That is an **IPO**, an Initial Public Offering.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-1.2.ipo",
        question: "What is an IPO?",
        options: [
          "A company's first sale of shares to the public",
          "A loan an investment bank makes to a company",
          "A company buying back all of its shares",
          "The yearly shareholder meeting",
        ],
        correct: 0,
        explanation: "An Initial Public Offering is the first time a private company sells shares to the public, usually listing them on an exchange like the NYSE or NASDAQ.",
      },
      {
        kind: "explain",
        id: "inv-1.2.secondary",
        title: "Where the money goes",
        body: [
          "Investment banks (the **underwriters**) help set the opening price and list the stock on an exchange.",
          "The company only receives cash from that first sale. Every trade after that is investors swapping shares with each other in the **secondary market**.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-1.2.who-gets-paid",
        question: "Years after its IPO, you buy 10 shares of Airbnb on your phone. Who receives your money?",
        options: [
          "Airbnb",
          "The investor who sold you those shares",
          "The investment bank that ran the IPO",
          "The stock exchange keeps it",
        ],
        correct: 1,
        explanation: "After the IPO, trading happens in the secondary market between investors. The seller gets your money; Airbnb doesn't see a cent of it.",
      },
      {
        kind: "explain",
        id: "inv-1.2.preferred",
        title: "Common vs. preferred stock",
        body: ["Almost everyone buys common stock. Preferred stock behaves more like a bond wearing a stock costume."],
        compare: [
          { label: "Common", points: ["One vote per share", "Dividends only if the board pays them", "Last in line if the company fails"] },
          { label: "Preferred", points: ["Usually no vote", "Fixed dividend, paid first", "Ahead of common, behind debt", "Capped upside"] },
        ],
      },
      {
        kind: "mcq",
        id: "inv-1.2.preferred-check",
        question: "Which is true of preferred stock compared with common stock?",
        options: [
          "It gets more votes per share",
          "It has unlimited upside if the company takes off",
          "Its fixed dividend is paid before common holders get anything",
          "It is paid before lenders if the company goes bankrupt",
        ],
        correct: 2,
        explanation: "Preferred holders give up votes and big upside in exchange for a fixed dividend paid ahead of common stock. They still rank behind debt.",
      },
    ],
  },
  {
    id: "inv-1.3",
    lessonId: "inv-1",
    title: "Price and size",
    steps: [
      {
        kind: "explain",
        id: "inv-1.3.price",
        title: "Who sets the price?",
        body: [
          "No formula sets a stock's price. It is whatever a willing buyer and a willing seller agree on, right now.",
          "Both sides are guessing the same thing: what the company's **future cash** is worth today.",
        ],
      },
      {
        kind: "explain",
        id: "inv-1.3.pe",
        title: "The P/E ratio",
        body: [
          "A quick way to compare price with profit: divide the share price by yearly **earnings per share** (EPS).",
          "A $100 stock earning $5 per share has a P/E of 20. Investors are paying 20 years of today's earnings up front.",
        ],
        formula: "P/E = share price ÷ earnings per share",
      },
      {
        kind: "numeric",
        id: "inv-1.3.pe-calc",
        question: "A stock trades at $150 and earns $6 per share each year. What is its P/E ratio?",
        answer: 25,
        explanation: "$150 ÷ $6 = 25. Buyers are paying 25 times one year of earnings.",
      },
      { kind: "mcq", id: "inv-1.3.pe-meaning", ...peQuiz, options: [...peQuiz.options] },
      {
        kind: "explain",
        id: "inv-1.3.market-cap",
        title: "How big is the company?",
        body: ["**Market capitalization** is the market's running estimate of what the whole business is worth."],
        formula: "Market cap = share price × shares outstanding",
      },
      {
        kind: "numeric",
        id: "inv-1.3.market-cap-calc",
        question: "A company's shares trade at $40 and it has 500 million shares outstanding. What is its market cap, in billions of dollars?",
        answer: 20,
        unit: "billion $",
        explanation: "$40 × 500,000,000 = $20,000,000,000, or $20 billion.",
      },
      {
        kind: "mcq",
        id: "inv-1.3.size",
        question: "Using the usual size buckets, a $20 billion company is:",
        options: ["Mega-cap ($200B+)", "Large-cap ($10B–$200B)", "Mid-cap ($2B–$10B)", "Small-cap ($300M–$2B)"],
        correct: 1,
        explanation: "$20B sits between $10B and $200B, so it is large-cap, alongside companies like Walmart and Nike.",
      },
      { kind: "mcq", id: "inv-1.3.market-cap-check", ...marketCapQuiz, options: [...marketCapQuiz.options] },
      {
        kind: "explain",
        id: "inv-1.3.moves",
        title: "Why prices move",
        body: [
          "Every price move is the market updating its guess about future cash. Earnings, new products, and interest-rate news change expectations, and the price follows.",
          "It happens fast. By the time you read a headline, the price has usually moved already.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-1.3.moves-check",
        question: "A company announces a surprise hit product. Its factories and cash haven't changed yet, but the stock jumps. Why?",
        options: [
          "The company created new shares",
          "Investors now expect more future cash from the business",
          "The exchange sets an official new price after big news",
          "Market cap is based on product count",
        ],
        correct: 1,
        explanation: "Price reflects expected future cash, not just what the company owns today. Better expectations mean buyers will pay more right away.",
      },
    ],
  },
];
