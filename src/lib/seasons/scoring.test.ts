import { afterAll, describe, expect, it } from "vitest";
import { autoScore, createScorer, outcome, POINTS } from "../../../scripts/seasons/score-core.mjs";
import { deriveParams } from "./params";
import { getTemplate } from "./templates";

const parity = getTemplate("put-call-parity")!;
const params = deriveParams(parity.paramSpecs, { challengeId: "s1-2026-w1", userId: "u1" }, "test-secret");
const test = parity.officialTest(params);
const CORRECT = "from math import exp\ndef put_from_parity(call, S, K, T, r):\n    return call - S + K * exp(-r * T)\n";

const scorer = createScorer({ timeoutMs: 3000 });
afterAll(() => scorer.close());

describe("official scoring", () => {
  it("adds correctness and speed, and gives no speed points for a wrong answer", () => {
    expect(POINTS).toEqual({ correctness: 70, speed: 10, explanation: 20 });
    expect(autoScore({ fraction: 1, usedSeconds: 0, limitSeconds: 3600 })).toBe(80);
    expect(autoScore({ fraction: 1, usedSeconds: 1800, limitSeconds: 3600 })).toBe(75);
    expect(autoScore({ fraction: 1, usedSeconds: 9999, limitSeconds: 3600 })).toBe(70);
    expect(autoScore({ fraction: 2 / 3, usedSeconds: 3600, limitSeconds: 3600 })).toBe(46.7);
    expect(autoScore({ fraction: 0, usedSeconds: 0, limitSeconds: 3600 })).toBe(0);
  });

  it("scores a correct submission 1 and a wrong one 0, in a real Python", async () => {
    expect(await scorer.run(CORRECT, test)).toEqual({ kind: "scored", fraction: 1 });
    const wrong = await scorer.run("def put_from_parity(call, S, K, T, r):\n    return call\n", test);
    expect(wrong).toEqual({ kind: "scored", fraction: 0 });
  }, 90_000);

  it("gives 0 (not a review) when the student's code doesn't even run", async () => {
    const r = await scorer.run("def broken(:\n", test);
    expect(r.kind).toBe("student");
    expect(outcome(r, { usedSeconds: 60, limitSeconds: 3600 })).toEqual({ status: "scored", official_score: 0 });
  }, 90_000);

  it("stops an infinite loop, sends it to review, and keeps scoring the next submission", async () => {
    const stuck = await scorer.run("while True:\n    pass\n", test);
    expect(stuck).toEqual({ kind: "timeout" });
    expect(outcome(stuck, { usedSeconds: 60, limitSeconds: 3600 })).toEqual({ status: "pending_review", official_score: null });
    expect(await scorer.run(CORRECT, test)).toEqual({ kind: "scored", fraction: 1 });
  }, 120_000);
});
