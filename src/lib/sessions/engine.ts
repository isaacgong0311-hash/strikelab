import type { NumericStep, McqStep, Step } from "./types";

/**
 * Pure session-run logic, kept out of the React component so it can be
 * tested. A run walks the steps in order; a missed question goes back on the
 * end of the queue for one more try (Duolingo-style retry, without hearts or
 * lives that block learning). Each miss shows the answer, so after
 * MAX_ATTEMPTS the run moves on rather than looping a stuck learner forever.
 */

/** Tries a question gets in one run: the first, and one retry after the answer is shown. */
export const MAX_ATTEMPTS = 2;

/** Parse what a learner typed: tolerates $, %, commas, spaces, and a trailing ×/x. */
export function parseNumberInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,%\s]/g, "").replace(/[x×]$/i, "");
  if (cleaned === "" || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function gradeNumeric(step: NumericStep, raw: string): boolean {
  const value = parseNumberInput(raw);
  if (value === null) return false;
  const tolerance = step.tolerance ?? 1e-9 * Math.max(1, Math.abs(step.answer));
  return Math.abs(value - step.answer) <= tolerance;
}

export function gradeMcq(step: McqStep, choice: number): boolean {
  return choice === step.correct;
}

export interface RunState {
  /** Indexes into the session's steps, in the order they will be shown. */
  queue: number[];
  /** Position in `queue` of the step on screen. */
  position: number;
  /** Question steps answered wrong at least once. */
  missed: number[];
  /** Total question attempts, including retries. */
  attempts: number;
  /** Question attempts that were correct. */
  correctAttempts: number;
}

export function startRun(steps: Step[]): RunState {
  return {
    queue: steps.map((_, i) => i),
    position: 0,
    missed: [],
    attempts: 0,
    correctAttempts: 0,
  };
}

/** Record the outcome of the current step and move to the next one. */
export function advance(run: RunState, steps: Step[], correct: boolean): RunState {
  const stepIndex = run.queue[run.position];
  const step = steps[stepIndex];
  if (step === undefined) return run;

  if (step.kind === "explain") {
    return { ...run, position: run.position + 1 };
  }

  const retry = !correct && attemptsAt(run, stepIndex) < MAX_ATTEMPTS;
  return {
    queue: retry ? [...run.queue, stepIndex] : run.queue,
    position: run.position + 1,
    missed: correct || run.missed.includes(stepIndex) ? run.missed : [...run.missed, stepIndex],
    attempts: run.attempts + 1,
    correctAttempts: run.correctAttempts + (correct ? 1 : 0),
  };
}

/** How many times this step is already in the queue: its tries so far, plus any still owed. */
function attemptsAt(run: RunState, stepIndex: number): number {
  return run.queue.filter((i) => i === stepIndex).length;
}

/** Whether missing the step on screen now would put it back for another try. */
export function willRetry(run: RunState, steps: Step[]): boolean {
  const stepIndex = run.queue[run.position];
  const step = steps[stepIndex];
  return step !== undefined && step.kind !== "explain" && attemptsAt(run, stepIndex) < MAX_ATTEMPTS;
}

const isIndexList = (value: unknown, stepCount: number): value is number[] =>
  Array.isArray(value) && value.every((i) => Number.isInteger(i) && i >= 0 && i < stepCount);

/**
 * Reads a run saved in sessionStorage, so a reload mid-session resumes where
 * the learner was. Returns null for anything that isn't a run for a session
 * with `stepCount` steps, and for a finished run, so a replay starts fresh.
 */
export function parseSavedRun(value: unknown, stepCount: number): RunState | null {
  if (typeof value !== "object" || value === null) return null;
  const run = value as Record<string, unknown>;
  if (!isIndexList(run.queue, stepCount) || !isIndexList(run.missed, stepCount)) return null;
  const { position, attempts, correctAttempts } = run;
  if (!Number.isInteger(position) || !Number.isInteger(attempts) || !Number.isInteger(correctAttempts)) return null;
  if ((position as number) < 0 || (position as number) >= run.queue.length) return null;
  return {
    queue: run.queue,
    position: position as number,
    missed: run.missed,
    attempts: attempts as number,
    correctAttempts: correctAttempts as number,
  };
}

export function isFinished(run: RunState): boolean {
  return run.position >= run.queue.length;
}

/** Share of distinct steps completed, 0–1, for the progress bar. Retries don't move it backwards. */
export function progressFraction(run: RunState, steps: Step[]): number {
  if (steps.length === 0) return 1;
  const done = new Set<number>();
  const pendingRetries = new Set(run.queue.slice(run.position));
  for (const index of run.queue.slice(0, run.position)) {
    if (!pendingRetries.has(index)) done.add(index);
  }
  return done.size / steps.length;
}

/** First-try accuracy, 0–1: questions answered right without a retry. */
export function firstTryAccuracy(run: RunState, steps: Step[]): number {
  const questions = steps.filter((s) => s.kind !== "explain").length;
  if (questions === 0) return 1;
  return (questions - run.missed.length) / questions;
}
