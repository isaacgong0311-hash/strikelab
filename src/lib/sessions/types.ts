/**
 * Bite-sized lesson sessions: a lesson split into 3–5 short sessions of
 * 6–12 steps, one idea per screen. See
 * docs/superpowers/plans/2026-09-16-duolingo-grade-product-plan.md (Phase 1).
 *
 * Copy supports **bold** only — content is plain data, never raw HTML.
 */

export interface ExplainStep {
  kind: "explain";
  id: string;
  title: string;
  /** Paragraphs, each at most ~50 words. */
  body: string[];
  /** Optional formula shown in a highlighted block. */
  formula?: string;
  /** Optional side-by-side comparison. */
  compare?: { label: string; points: string[] }[];
}

export interface McqStep {
  kind: "mcq";
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface NumericStep {
  kind: "numeric";
  id: string;
  question: string;
  answer: number;
  /** Absolute tolerance. Defaults to an exact match (within float noise). */
  tolerance?: number;
  /** Shown next to the input, e.g. "%" or "billion $". */
  unit?: string;
  explanation: string;
}

export type Step = ExplainStep | McqStep | NumericStep;
export type QuestionStep = McqStep | NumericStep;

export interface Session {
  /** "<lessonId>.<n>", e.g. "inv-1.2". */
  id: string;
  lessonId: string;
  title: string;
  steps: Step[];
}
