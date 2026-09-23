import type { Session } from "../types";
import { QUIZZES } from "@/lib/quizzes";

// "Risk, Return, and Diversification" (inv-5) as three short sessions. Facts
// and numbers follow the long-form lesson in src/lib/investingLessons.ts; the
// existing quiz questions are reused rather than duplicated.
const [annualizeQuiz, sharpeQuiz, diversifyQuiz] = QUIZZES["inv-5"];

export const INV5_SESSIONS: Session[] = [
  {
    id: "inv-5.1",
    lessonId: "inv-5",
    title: "Risk and return",
    steps: [
      {
        kind: "explain",
        id: "inv-5.1.tradeoff",
        title: "No free returns",
        body: [
          "Markets don't hand out free returns. A higher expected payoff always comes bundled with **more risk**.",
          "Treasury bills pay around 5% and are close to risk-free. The S&P 500 has averaged about 10%, including years like 2008 (−37%) and 2022 (−18%).",
        ],
      },
      {
        kind: "mcq",
        id: "inv-5.1.tradeoff-check",
        question: "A startup investment promises a possible 50% return. What should you expect to come with it?",
        options: [
          "Nothing extra, since high returns are just luck",
          "A real chance of losing much or all of the money",
          "A government guarantee on the principal",
          "Lower volatility than Treasury bills",
        ],
        correct: 1,
        explanation: "Higher expected return is the market's compensation for bearing more risk. Early-stage equity can return 50%+ or go to zero.",
      },
      {
        kind: "explain",
        id: "inv-5.1.volatility",
        title: "Measuring risk: volatility",
        body: [
          "Risk is usually measured as **volatility**, the standard deviation of returns.",
          "A stock with 25% annual volatility typically lands within about ±25% of its expected return in roughly two years out of three.",
        ],
      },
      {
        kind: "explain",
        id: "inv-5.1.annualize",
        title: "From daily to yearly",
        body: [
          "Volatility grows with the **square root** of time. A year has about **252 trading days**, so daily volatility is scaled up by √252.",
        ],
        formula: "σ_annual = σ_daily × √252",
      },
      {
        kind: "numeric",
        id: "inv-5.1.annualize-calc",
        question: "A stock's daily returns have a standard deviation of 1%. What is its annualized volatility, in percent? (√252 ≈ 15.87)",
        answer: 15.87,
        tolerance: 0.05,
        unit: "%",
        explanation: "1% × √252 ≈ 1% × 15.87 = 15.87% per year.",
      },
      { kind: "mcq", id: "inv-5.1.annualize-check", ...annualizeQuiz, options: [...annualizeQuiz.options] },
    ],
  },
  {
    id: "inv-5.2",
    lessonId: "inv-5",
    title: "The free lunch: diversification",
    steps: [
      {
        kind: "explain",
        id: "inv-5.2.free-lunch",
        title: "Spreading out lowers risk",
        body: [
          "Owning several assets lowers your risk **without lowering expected return**, because their random swings partly cancel out.",
          "How much they cancel depends on **correlation** (ρ), from −1 (perfect opposites) to +1 (identical).",
        ],
      },
      {
        kind: "explain",
        id: "inv-5.2.formula",
        title: "Two-asset portfolio risk",
        body: [
          "With weights w₁, w₂ and volatilities σ₁, σ₂, the portfolio's variance is below.",
          "Whenever ρ is below 1, the portfolio is **less volatile** than the weighted average of its parts.",
        ],
        formula: "σ²ₚ = w₁²σ₁² + w₂²σ₂² + 2·w₁·w₂·σ₁·σ₂·ρ",
      },
      {
        kind: "numeric",
        id: "inv-5.2.portfolio-vol",
        question: "Split your money 50/50 between two stocks, each with 20% volatility and correlation 0. What is the portfolio's volatility, in percent?",
        answer: 14.14,
        tolerance: 0.05,
        unit: "%",
        explanation: "σ² = 0.25 × 0.04 + 0.25 × 0.04 + 0 = 0.02, so σ = √0.02 ≈ 14.14%, well below 20% for the same expected return.",
      },
      {
        kind: "mcq",
        id: "inv-5.2.correlation",
        question: "Which pair of stocks gives the biggest diversification benefit when combined?",
        options: ["Correlation +1.0", "Correlation +0.7", "Correlation +0.3", "They're all the same"],
        correct: 2,
        explanation: "Lower correlation means more of the swings cancel. At +1.0 there's no benefit at all; real stocks usually sit between 0.3 and 0.7.",
      },
      {
        kind: "explain",
        id: "inv-5.2.two-risks",
        title: "Two kinds of risk",
        body: [
          "**Systematic** risk (recessions, rate hikes, pandemics) hits every stock at once. You can't diversify it away.",
          "**Idiosyncratic** risk (one company's scandal or flop) mostly cancels out once you own 20–30 different companies.",
        ],
      },
      { kind: "mcq", id: "inv-5.2.diversify-check", ...diversifyQuiz, options: [...diversifyQuiz.options] },
    ],
  },
  {
    id: "inv-5.3",
    lessonId: "inv-5",
    title: "Risk-adjusted returns",
    steps: [
      {
        kind: "explain",
        id: "inv-5.3.trap",
        title: "Raw returns are a trap",
        body: [
          "A fund that made 20% by taking huge risks isn't obviously better than one that made a steady 12%.",
          "The **Sharpe ratio** compares funds fairly by asking how much extra return each unit of risk bought.",
        ],
        formula: "Sharpe = (Rₚ − R_risk-free) ÷ σₚ",
      },
      {
        kind: "numeric",
        id: "inv-5.3.sharpe-calc",
        question: "A portfolio returned 12% with 14% volatility while T-bills paid 5%. What is its Sharpe ratio?",
        answer: 0.5,
        tolerance: 0.005,
        explanation: "(12% − 5%) ÷ 14% = 7 ÷ 14 = 0.5.",
      },
      {
        kind: "explain",
        id: "inv-5.3.scale",
        title: "What's a good Sharpe?",
        body: [
          "Around **1.0** is solid, above **2.0** is rare and excellent, and below **0.5** is weak.",
          "Berkshire Hathaway has run near 0.7 for decades. That sounds modest until you remember the scale and how long it has lasted.",
        ],
      },
      {
        kind: "mcq",
        id: "inv-5.3.compare",
        question: "Fund A: 20% return, 30% volatility. Fund B: 12% return, 7% volatility. Risk-free rate 5%. Which has the better Sharpe ratio?",
        options: ["Fund A, because it earned more", "Fund B", "They're equal", "You can't compare them"],
        correct: 1,
        explanation: "A: (20 − 5) ÷ 30 = 0.5. B: (12 − 5) ÷ 7 = 1.0. B earned less but bought far more return per unit of risk.",
      },
      { kind: "mcq", id: "inv-5.3.sharpe-check", ...sharpeQuiz, options: [...sharpeQuiz.options] },
      {
        kind: "explain",
        id: "inv-5.3.markowitz",
        title: "Why this won a Nobel",
        body: [
          "Harry Markowitz formalized diversification as Modern Portfolio Theory in 1952.",
          "Its core idea: risk you could diversify away shouldn't earn extra. Only systematic risk, the kind you're stuck with, deserves to be paid.",
        ],
      },
    ],
  },
];
