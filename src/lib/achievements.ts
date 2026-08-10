export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  total: number;
  progress: (ids: Set<string>) => number;
}

const count = (ids: Set<string>, need: string[]) => need.filter((id) => ids.has(id)).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first",     icon: "⊗", name: "First Strike",   desc: "Complete your first lesson",       total: 1,  progress: (ids) => Math.min(ids.size, 1) },
  { id: "parity",    icon: "≡", name: "Parity Pro",     desc: "Master Put-Call Parity",            total: 1,  progress: (ids) => (ids.has("2") ? 1 : 0) },
  { id: "bsm",       icon: "∂", name: "BSM Builder",    desc: "Implement Black-Scholes",           total: 1,  progress: (ids) => (ids.has("3") ? 1 : 0) },
  { id: "greeks",    icon: "Δ", name: "Greek Scholar",  desc: "Complete all five Greek lessons",   total: 5,  progress: (ids) => count(ids, ["4", "5", "6", "7", "11"]) },
  { id: "iv",        icon: "σ", name: "Vol Wizard",     desc: "Solve for implied volatility",      total: 1,  progress: (ids) => (ids.has("8") ? 1 : 0) },
  { id: "strategy",  icon: "∑", name: "Strategist",     desc: "Learn option strategies",           total: 1,  progress: (ids) => (ids.has("9") ? 1 : 0) },
  { id: "investor",  icon: "↗", name: "Investor",       desc: "Start the Investing track",         total: 1,  progress: (ids) => (ids.has("inv-1") ? 1 : 0) },
  { id: "portfolio", icon: "⊞", name: "Portfolio Mgr",  desc: "Finish all 9 Investing lessons",    total: 9,  progress: (ids) => count(ids, ["inv-1", "inv-2", "inv-3", "inv-4", "inv-5", "inv-6", "inv-7", "inv-8", "inv-9"]) },
  { id: "capm",      icon: "β", name: "Quant Initiate", desc: "Understand CAPM and Beta",          total: 1,  progress: (ids) => (ids.has("q1") ? 1 : 0) },
  { id: "backtest",  icon: "⟲", name: "Backtester",     desc: "Build your first backtest",         total: 1,  progress: (ids) => (ids.has("q3") ? 1 : 0) },
  { id: "optimizer", icon: "⊕", name: "Optimizer",      desc: "Build the efficient frontier",      total: 1,  progress: (ids) => (ids.has("q4") ? 1 : 0) },
  { id: "allstar",   icon: "✶", name: "All-Star",       desc: "Complete all 23 lessons",           total: 23, progress: (ids) => Math.min(ids.size, 23) },
];

export function isUnlocked(a: Achievement, ids: Set<string>): boolean {
  return a.progress(ids) >= a.total;
}
