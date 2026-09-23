/**
 * Capstone prompts. Two fixed prompts give first-time students a clear
 * target; "open" is for students who already have their own question.
 * `lessonId` is where the prompt's starting code comes from.
 */
export type CapstonePromptId = "option-pricing" | "backtest" | "open";

export interface CapstonePrompt {
  id: CapstonePromptId;
  title: string;
  brief: string;
  checklist: string[];
  lessonId: string | null;
}

export const CAPSTONE_PROMPTS: readonly CapstonePrompt[] = [
  {
    id: "option-pricing",
    title: "Price an option and defend your volatility",
    brief: "Pick a real stock, price a call option on it with your Black-Scholes code, and argue for the volatility you chose.",
    checklist: [
      "Your Black-Scholes price for one real option (stock, strike, expiry, rate)",
      "The volatility you used, and why you believe it",
      "How the price changes if your volatility is wrong by 5 points",
    ],
    lessonId: "3",
  },
  {
    id: "backtest",
    title: "Backtest a strategy honestly",
    brief: "Test a simple trading rule on historical data, report its Sharpe ratio, and show how you avoided fooling yourself.",
    checklist: [
      "The rule, stated precisely enough that someone else could code it",
      "Return, volatility and Sharpe ratio versus buying and holding",
      "How you avoided look-ahead and survivorship bias",
    ],
    lessonId: "q3",
  },
  {
    id: "open",
    title: "Your own question",
    brief: "Answer a question you care about with code and data from the program.",
    checklist: ["A clear question", "Code that answers it", "What the result means, and what could make it wrong"],
    lessonId: null,
  },
];

export function getCapstonePrompt(id: string): CapstonePrompt | undefined {
  return CAPSTONE_PROMPTS.find((p) => p.id === id);
}

export const CAPSTONE_LIMITS = {
  title: 120,
  thesis: 2000,
  code: 50000,
  resultSummary: 4000,
  reflection: 4000,
} as const;

export interface CapstoneFields {
  promptId: CapstonePromptId;
  title: string;
  thesis: string;
  code: string;
  resultSummary: string;
  reflection: string;
}

export type CapstoneValidation =
  | { ok: true; value: CapstoneFields }
  | { ok: false; error: string };

/**
 * Validate a save from the editor. Drafts may be incomplete; submitting
 * needs every part, because the capstone is the work a student shows.
 */
export function validateCapstone(input: unknown, submit: boolean): CapstoneValidation {
  if (!input || typeof input !== "object") return { ok: false, error: "Nothing to save" };
  const raw = input as Record<string, unknown>;
  const text = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");
  const promptId = text("promptId");
  if (!getCapstonePrompt(promptId)) return { ok: false, error: "Choose a prompt" };

  const value: CapstoneFields = {
    promptId: promptId as CapstonePromptId,
    title: text("title").trim(),
    thesis: text("thesis"),
    code: text("code"),
    resultSummary: text("resultSummary"),
    reflection: text("reflection"),
  };

  const limits: [keyof typeof CAPSTONE_LIMITS, string][] = [
    ["title", "Title"],
    ["thesis", "Question"],
    ["code", "Code"],
    ["resultSummary", "Results"],
    ["reflection", "Reflection"],
  ];
  for (const [key, label] of limits) {
    if (value[key].length > CAPSTONE_LIMITS[key]) {
      return { ok: false, error: `${label} is too long (max ${CAPSTONE_LIMITS[key].toLocaleString()} characters)` };
    }
  }

  if (submit) {
    for (const [key, label] of limits) {
      if (!value[key].trim()) return { ok: false, error: `${label} is needed before you submit` };
    }
  }
  return { ok: true, value };
}
