/**
 * The six weeks as marketing copy: what students BUILD each week, not just
 * the topic. Titles match QUANT_FOUNDATIONS_TEMPLATE (checked in lab.test.ts).
 */
export const LAB_WEEKS = [
  { week: 1, title: "Markets and risk", builds: "Price a share, read a bid-ask spread, and measure why two stocks are safer than one." },
  { week: 2, title: "Options and payoffs", builds: "Sketch call and put payoffs and spot a mispriced option with put-call parity." },
  { week: 3, title: "Pricing", builds: "Implement Black-Scholes in Python until it matches the reference price." },
  { week: 4, title: "Risk sensitivities", builds: "Compute the Greeks and explain one to the group with a real-world analogy." },
  { week: 5, title: "Research discipline", builds: "Backtest a strategy and find where look-ahead or survivorship bias could fool you." },
  { week: 6, title: "Portfolio capstone", builds: "Submit and present a capstone: a question, code that answers it, and an honest result." },
] as const;

/** Where "talk first" goes: the founder's booking link when set, else email. */
export function pilotCallHref(src?: string): string {
  const url = process.env.NEXT_PUBLIC_PILOT_CALL_URL;
  if (url) return src ? `${url}${url.includes("?") ? "&" : "?"}src=${encodeURIComponent(src)}` : url;
  return "mailto:hello@strikelab.app?subject=StrikeLab%20pilot%20for%20my%20club";
}

/** Stock games vs StrikeLab, used on the homepage and /clubs. Category, not competitors. */
export const COMPARE: readonly (readonly [string, string, string])[] = [
  ["What students do", "Pick stocks in a simulator or read about finance", "Write the models themselves: pricing, risk, backtests"],
  ["What they finish with", "A leaderboard rank or a quiz score", "A capstone: a question, working code and an honest result"],
  ["What the leader gets", "A class list", "A weekly plan, ready-to-send messages and a scorecard"],
];
