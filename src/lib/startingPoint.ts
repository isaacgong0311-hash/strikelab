/** A lightweight recommendation, not a validated assessment or course credit. */
export const STARTING_QUESTIONS = [
  { id: "ownership", skill: "Stock ownership", question: "You own 10 of a company's 1,000 shares. What fraction of the company do you own?", options: ["1%", "10%", "100%"], correct: 0, explanation: "10 ÷ 1,000 = 0.01, or 1%. A share represents a slice of ownership.", href: "/learn/inv-1.1", lesson: "Start with stock ownership" },
  { id: "risk", skill: "Diversification", question: "Two stocks always move together. Does splitting your money between them remove market risk?", options: ["Yes, two stocks are always safe", "No, shared risks can still affect both", "Yes, if you invest equal amounts"], correct: 1, explanation: "Diversification depends on how investments move together. It cannot eliminate risks that affect the whole market.", href: "/learn/inv-5.1", lesson: "Explore risk and diversification" },
  { id: "payoff", skill: "Option payoffs", question: "At expiration, a call lets you buy a share for $100. The share is worth $115. What is the payoff before subtracting the premium?", options: ["$0", "$115", "$15"], correct: 2, explanation: "The payoff is max(115 − 100, 0) = $15 per share. Profit also subtracts the premium paid.", href: "/lesson/1", lesson: "Build your options foundation" },
  { id: "research", skill: "Research discipline", question: "A backtest picks stocks using financial results published after the simulated purchase. What is the problem?", options: ["It uses information unavailable at the time", "It needs more decimal places", "Nothing, historical data is always fair to use"], correct: 0, explanation: "This is look-ahead bias. A realistic backtest only uses information available when each simulated decision was made.", href: "/lesson/q3", lesson: "Learn to test a strategy honestly" },
] as const;

export function recommendStartingPoint(answers: readonly number[]) {
  const gap = STARTING_QUESTIONS.find((q, index) => answers[index] !== q.correct);
  return gap ?? { href: "/lesson/3", lesson: "Build a Black-Scholes pricing model" };
}
