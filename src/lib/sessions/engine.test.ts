import { describe, expect, it } from "vitest";
import {
  advance,
  firstTryAccuracy,
  gradeMcq,
  gradeNumeric,
  isFinished,
  parseNumberInput,
  progressFraction,
  startRun,
} from "./engine";
import type { Step } from "./types";

const steps: Step[] = [
  { kind: "explain", id: "e", title: "Idea", body: ["Text"] },
  { kind: "mcq", id: "q1", question: "?", options: ["a", "b"], correct: 1, explanation: "b" },
  { kind: "numeric", id: "q2", question: "?", answer: 0.5, unit: "%", explanation: "0.5" },
];

describe("parseNumberInput", () => {
  it("accepts the ways people write numbers", () => {
    expect(parseNumberInput("0.5")).toBe(0.5);
    expect(parseNumberInput(" 0.5 % ")).toBe(0.5);
    expect(parseNumberInput("$1,250")).toBe(1250);
    expect(parseNumberInput(".5")).toBe(0.5);
    expect(parseNumberInput("25x")).toBe(25);
    expect(parseNumberInput("-3")).toBe(-3);
  });

  it("rejects non-numbers", () => {
    expect(parseNumberInput("")).toBeNull();
    expect(parseNumberInput("abc")).toBeNull();
    expect(parseNumberInput("1.2.3")).toBeNull();
    expect(parseNumberInput("12abc")).toBeNull();
  });
});

describe("grading", () => {
  it("grades numeric answers exactly by default and within a tolerance when set", () => {
    const step = steps[2] as Extract<Step, { kind: "numeric" }>;
    expect(gradeNumeric(step, "0.5")).toBe(true);
    expect(gradeNumeric(step, "0.51")).toBe(false);
    expect(gradeNumeric({ ...step, tolerance: 0.05 }, "0.54")).toBe(true);
    expect(gradeNumeric(step, "half")).toBe(false);
  });

  it("grades multiple choice by index", () => {
    const step = steps[1] as Extract<Step, { kind: "mcq" }>;
    expect(gradeMcq(step, 1)).toBe(true);
    expect(gradeMcq(step, 0)).toBe(false);
  });
});

describe("session run", () => {
  it("finishes after every step when all answers are right", () => {
    let run = startRun(steps);
    run = advance(run, steps, true);
    run = advance(run, steps, true);
    expect(progressFraction(run, steps)).toBeCloseTo(2 / 3);
    run = advance(run, steps, true);
    expect(isFinished(run)).toBe(true);
    expect(progressFraction(run, steps)).toBe(1);
    expect(firstTryAccuracy(run, steps)).toBe(1);
  });

  it("re-queues a missed question until it is answered correctly", () => {
    let run = startRun(steps);
    run = advance(run, steps, true); // explain
    run = advance(run, steps, false); // miss q1
    expect(run.queue).toEqual([0, 1, 2, 1]);
    run = advance(run, steps, true); // q2
    expect(isFinished(run)).toBe(false);
    expect(progressFraction(run, steps)).toBeCloseTo(2 / 3); // q1 still owed
    run = advance(run, steps, false); // miss q1 again
    run = advance(run, steps, true); // q1 finally
    expect(isFinished(run)).toBe(true);
    expect(run.missed).toEqual([1]);
    expect(run.attempts).toBe(4);
    expect(firstTryAccuracy(run, steps)).toBe(0.5);
  });
});
