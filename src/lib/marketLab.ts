import { blackScholesCall, blackScholesPut } from "./pricing";

export interface LabScenario {
  stock: number;
  strike: number;
  days: number;
  volatility: number;
  rate: number;
  option: "call" | "put";
}

export type LabVariable = "stock" | "days" | "volatility";
export type MissionId = "volatility" | "time" | "direction";
export type LabMode = MissionId | "free";

export const LAB_CONTROLS = {
  stock: { label: "Stock price", min: 50, max: 150, step: 1, unit: "$" },
  days: { label: "Days to expiration", min: 0, max: 180, step: 1, unit: "days" },
  volatility: { label: "Annual volatility", min: 10, max: 80, step: 1, unit: "%" },
} as const;

export const DEFAULT_SCENARIO: LabScenario = { stock: 100, strike: 100, days: 30, volatility: 20, rate: 0.045, option: "call" };

export interface LabMission {
  id: MissionId;
  number: string;
  title: string;
  description: string;
  variable: LabVariable;
  baseline: LabScenario;
  target: string;
  question: string;
  prediction: "up" | "down";
  reflection: string;
  answers: readonly string[];
  correct: number;
  explanation: string;
  lessonHref: string;
  lessonTitle: string;
}

export const LAB_MISSIONS: readonly LabMission[] = [
  {
    id: "volatility", number: "01", title: "The price of uncertainty",
    description: "Can an option become more valuable without the stock moving?",
    variable: "volatility", baseline: { ...DEFAULT_SCENARIO },
    target: "Raise volatility to 40% or more. Leave the stock and time unchanged.",
    question: "If volatility doubles and everything else stays fixed, will this call's model value rise or fall?",
    prediction: "up", reflection: "Why can more uncertainty make this call worth more?",
    answers: ["A wider range of outcomes gives more upside while the holder can decline to exercise", "Higher volatility guarantees the stock will rise", "The strike price automatically gets lower"],
    correct: 0, explanation: "A call's payoff is asymmetric: the holder can let it expire, while larger favorable moves increase its payoff. Under Black-Scholes, higher volatility increases this option's value; it does not guarantee a profit.",
    lessonHref: "/lesson/7", lessonTitle: "Code Vega",
  },
  {
    id: "time", number: "02", title: "A clock with a price tag",
    description: "Watch time value disappear while the stock stands still.",
    variable: "days", baseline: { ...DEFAULT_SCENARIO, days: 90 },
    target: "Reduce the time remaining to 14 days or fewer. Keep all other inputs fixed.",
    question: "For this at-the-money call, what happens to model value when time falls from 90 days to 14 days?",
    prediction: "down", reflection: "Why does this call lose value as its expiration approaches?",
    answers: ["Every option must lose exactly the same number of dollars each day", "Less time remains for a favorable stock-price move", "The company has fewer shares outstanding"],
    correct: 1, explanation: "With the stock at the strike, this call's value comes from the possibility of a favorable move before expiration. Less time reduces that value in this scenario. Time decay is not a constant dollar amount per day.",
    lessonHref: "/lesson/5", lessonTitle: "Code Theta",
  },
  {
    id: "direction", number: "03", title: "One move, different exposure",
    description: "Move the stock, then inspect how a call responds.",
    variable: "stock", baseline: { ...DEFAULT_SCENARIO },
    target: "Raise the stock price to $110 or more. Keep volatility and time fixed.",
    question: "If the stock rises from $100 to $110, will this call's model value rise or fall?",
    prediction: "up", reflection: "Why is buying this call different from buying a share?",
    answers: ["The option holder receives every dividend automatically", "The call always changes by exactly $1 for a $1 stock move", "The call gives a right to buy at the strike and its sensitivity changes with the stock price"],
    correct: 2, explanation: "A call is a right to buy at the strike, not ownership of a share. Delta describes its sensitivity to the stock, and gamma describes how that sensitivity changes. The premium can be lost even though the payoff cannot be negative.",
    lessonHref: "/lesson/4", lessonTitle: "Code Delta",
  },
];

export function getLabMission(mode: LabMode): LabMission | undefined {
  return LAB_MISSIONS.find((mission) => mission.id === mode);
}

export function isLabMode(value: unknown): value is LabMode {
  return value === "free" || LAB_MISSIONS.some((mission) => mission.id === value);
}

export function isLabScenario(value: unknown): value is LabScenario {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (s.option === "call" || s.option === "put") &&
    typeof s.stock === "number" && Number.isFinite(s.stock) && s.stock >= 50 && s.stock <= 150 &&
    typeof s.strike === "number" && s.strike === 100 &&
    typeof s.days === "number" && Number.isInteger(s.days) && s.days >= 0 && s.days <= 180 &&
    typeof s.volatility === "number" && Number.isFinite(s.volatility) && s.volatility >= 10 && s.volatility <= 80 &&
    typeof s.rate === "number" && s.rate === 0.045;
}

/** Model dollars per share. The zero-time boundary is the exact payoff. */
export function labPrice(scenario: LabScenario): number {
  if (!isLabScenario(scenario)) throw new Error("Invalid lab assumptions");
  if (scenario.days === 0) return scenario.option === "call"
    ? Math.max(0, scenario.stock - scenario.strike)
    : Math.max(0, scenario.strike - scenario.stock);
  const price = scenario.option === "call" ? blackScholesCall : blackScholesPut;
  return Math.max(0, price(scenario.stock, scenario.strike, scenario.days / 365, scenario.rate, scenario.volatility / 100));
}

/** A checkpoint is valid only when the instructed single variable changed. */
export function meetsMissionTarget(mission: LabMission, scenario: LabScenario): boolean {
  if (!isLabScenario(scenario)) return false;
  const unchanged = (Object.keys(mission.baseline) as (keyof LabScenario)[])
    .filter((key) => key !== mission.variable)
    .every((key) => scenario[key] === mission.baseline[key]);
  if (!unchanged) return false;
  if (mission.id === "volatility") return scenario.volatility >= 40;
  if (mission.id === "time") return scenario.days <= 14;
  return scenario.stock >= 110;
}

export function labCurve(scenario: LabScenario, variable: LabVariable): { x: number; value: number }[] {
  const { min, max } = LAB_CONTROLS[variable];
  return Array.from({ length: 51 }, (_, i) => {
    const raw = min + (max - min) * i / 50;
    const x = variable === "days" ? Math.round(raw) : raw;
    return { x, value: labPrice({ ...scenario, [variable]: x }) };
  });
}

/** Price-axis ticks on a round step (1, 2, 2.5 or 5 × 10ⁿ), so every label matches its gridline. */
export function priceAxisTicks(peak: number): number[] {
  const top = Math.max(peak, 0.01);
  const magnitude = 10 ** Math.floor(Math.log10(top / 5));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => top / s <= 5) ?? 10 * magnitude;
  const count = Math.ceil(top / step - 1e-9);
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6);
}

export function experimentCsvRows(baseline: LabScenario, scenario: LabScenario): string[][] {
  const before = labPrice(baseline);
  const after = labPrice(scenario);
  return [
    ["StrikeLab Market Lab", "Educational model experiment; not market quotes or investment advice"],
    ["Model", "Black-Scholes; European exercise; no dividends; constant volatility and rate"],
    ["Units", "Option values and differences are dollars per share, not profit. One standard contract generally represents 100 shares."],
    ["Input", "Baseline", "Experiment"],
    ["Option", baseline.option, scenario.option],
    ["Stock price ($)", String(baseline.stock), String(scenario.stock)],
    ["Strike ($)", String(baseline.strike), String(scenario.strike)],
    ["Days to expiration", String(baseline.days), String(scenario.days)],
    ["Annual volatility (%)", String(baseline.volatility), String(scenario.volatility)],
    ["Annual risk-free rate (%)", String(baseline.rate * 100), String(scenario.rate * 100)],
    ["Model value ($ per share)", before.toFixed(6), after.toFixed(6)],
    ["Model value difference ($ per share)", "", (after - before).toFixed(6)],
  ];
}
