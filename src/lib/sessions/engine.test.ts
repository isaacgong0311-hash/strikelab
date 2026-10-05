import { describe, expect, it } from "vitest";
import {
  advance,
  firstTryAccuracy,
  gradeMcq,
  gradeNumeric,
  isFinished,
  parseNumberInput,
  parseSavedRun,
  progressFraction,
  startRun,
  willRetry,
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

  it("re-queues a missed question once, then moves on", () => {
    let run = startRun(steps);
    run = advance(run, steps, true); // explain
    expect(willRetry(run, steps)).toBe(true); // q1, first try
    run = advance(run, steps, false); // miss q1
    expect(run.queue).toEqual([0, 1, 2, 1]);
    run = advance(run, steps, true); // q2
    expect(isFinished(run)).toBe(false);
    expect(progressFraction(run, steps)).toBeCloseTo(2 / 3); // q1 still owed
    expect(willRetry(run, steps)).toBe(false); // q1's retry is the last attempt
    run = advance(run, steps, false); // miss q1 again: the answer has been shown twice
    expect(run.queue).toEqual([0, 1, 2, 1]);
    expect(isFinished(run)).toBe(true);
    expect(progressFraction(run, steps)).toBe(1);
    expect(run.missed).toEqual([1]);
    expect(run.attempts).toBe(3);
    expect(firstTryAccuracy(run, steps)).toBe(0.5);
  });

  it("lets a retry that is answered correctly finish normally", () => {
    let run = startRun(steps);
    run = advance(run, steps, true);
    run = advance(run, steps, false); // miss q1
    run = advance(run, steps, true); // q2
    run = advance(run, steps, true); // q1 retry right
    expect(isFinished(run)).toBe(true);
    expect(run.attempts).toBe(3); // miss, q2, retry
    expect(run.correctAttempts).toBe(2);
  });

  it("never offers a retry on an explanation", () => {
    expect(willRetry(startRun(steps), steps)).toBe(false);
  });
});

describe("saved runs", () => {
  const mid = () => advance(advance(startRun(steps), steps, true), steps, false);

  it("round-trips a run through JSON", () => {
    const run = mid();
    expect(parseSavedRun(JSON.parse(JSON.stringify(run)), steps.length)).toEqual(run);
  });

  it("rejects anything that is not a run for this session", () => {
    expect(parseSavedRun(null, 3)).toBeNull();
    expect(parseSavedRun("nope", 3)).toBeNull();
    expect(parseSavedRun({}, 3)).toBeNull();
    expect(parseSavedRun({ ...mid(), queue: [0, 1, 7] }, 3)).toBeNull(); // step 7 doesn't exist
    expect(parseSavedRun({ ...mid(), queue: [0, 1, "2"] }, 3)).toBeNull();
    expect(parseSavedRun({ ...mid(), position: -1 }, 3)).toBeNull();
    expect(parseSavedRun({ ...mid(), attempts: "many" }, 3)).toBeNull();
  });

  it("does not bring a finished run back, so a replay starts fresh", () => {
    const done = { ...mid(), position: 4 };
    expect(parseSavedRun(done, 3)).toBeNull();
  });
});
