import { afterAll, describe, expect, it } from "vitest";
import { autoScore, createScorer, outcome, POINTS, runStudent } from "../../../scripts/seasons/score-core.mjs";
import { deriveParams } from "./params";
import { TEMPLATES, getTemplate } from "./templates";

const parity = getTemplate("put-call-parity")!;
const params = deriveParams(parity.paramSpecs, { challengeId: "s1-2026-w1", userId: "u1" }, "test-secret");
const test = parity.officialTest(params);
const entry = parity.entry;
const CORRECT = "from math import exp\ndef put_from_parity(call, S, K, T, r):\n    return call - S + K * exp(-r * T)\n";
const WRONG = "def put_from_parity(call, S, K, T, r):\n    return call\n";

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
    expect(await scorer.run(CORRECT, test, entry)).toEqual({ kind: "scored", fraction: 1 });
    expect(await scorer.run(WRONG, test, entry)).toEqual({ kind: "scored", fraction: 0 });
  }, 90_000);

  it("scores a correct solution 1 for every season template", async () => {
    const solutions: Record<string, string> = {
      "put-call-parity": CORRECT,
      "black-scholes-call": `from math import log, sqrt, exp, erf
def norm_cdf(x):
    return 0.5 * (1 + erf(x / sqrt(2)))
def black_scholes_call(S, K, T, r, sigma):
    d1 = (log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt(T))
    d2 = d1 - sigma * sqrt(T)
    return S * norm_cdf(d1) - K * exp(-r * T) * norm_cdf(d2)
`,
      "call-delta": `from statistics import NormalDist
from math import log, sqrt
def call_delta(S, K, T, r, sigma):
    return NormalDist().cdf((log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt(T)))
`,
    };
    expect(Object.keys(solutions).sort()).toEqual(Object.keys(TEMPLATES).sort());
    for (const [slug, template] of Object.entries(TEMPLATES)) {
      const p = deriveParams(template.paramSpecs, { challengeId: `s1-${slug}`, userId: "u7" }, "test-secret");
      expect(await scorer.run(solutions[slug], template.officialTest(p), template.entry), slug).toEqual({ kind: "scored", fraction: 1 });
    }
  }, 120_000);

  it("gives 0 (not a review) when the student's code doesn't even run", async () => {
    const r = await scorer.run("def broken(:\n", test, entry);
    expect(r.kind).toBe("student");
    expect(outcome(r, { usedSeconds: 60, limitSeconds: 3600 })).toEqual({ status: "scored", official_score: 0 });
  }, 90_000);

  it("gives 0 for a function with the wrong name or a non-number result", async () => {
    expect(await scorer.run("def put_from_parit(call, S, K, T, r):\n    return 1.0\n", test, entry)).toEqual({ kind: "scored", fraction: 0 });
    expect(await scorer.run("def put_from_parity(call, S, K, T, r):\n    return 'ten'\n", test, entry)).toEqual({ kind: "scored", fraction: 0 });
  }, 90_000);

  it("stops an infinite loop, sends it to review, and keeps scoring the next submission", async () => {
    const stuck = await scorer.run("while True:\n    pass\n", test, entry);
    expect(stuck).toEqual({ kind: "timeout" });
    expect(outcome(stuck, { usedSeconds: 60, limitSeconds: 3600 })).toEqual({ status: "pending_review", official_score: null });
    expect(await scorer.run(CORRECT, test, entry)).toEqual({ kind: "scored", fraction: 1 });
  }, 120_000);
});

describe("a submission can't tamper with scoring", () => {
  it("can't make a wrong answer pass by patching Python's builtins or math", async () => {
    const patchAbs = "import builtins\nbuiltins.abs = lambda x: 0\n" + WRONG;
    expect(await scorer.run(patchAbs, test, entry)).toEqual({ kind: "scored", fraction: 0 });
    const patchAtCallTime = `import builtins, math
def put_from_parity(call, S, K, T, r):
    builtins.abs = lambda x: 0
    builtins.max = lambda *a: 1e300
    math.exp = lambda x: 0.0
    return 0.0
`;
    expect(await scorer.run(patchAtCallTime, test, entry)).toEqual({ kind: "scored", fraction: 0 });
  }, 90_000);

  it("doesn't carry anything over to the next student", async () => {
    await scorer.run("import builtins, math\nbuiltins.abs = lambda x: 0\nmath.exp = lambda x: 0.0\n" + WRONG, test, entry);
    expect(await scorer.run(WRONG, test, entry)).toEqual({ kind: "scored", fraction: 0 });
    expect(await scorer.run(CORRECT, test, entry)).toEqual({ kind: "scored", fraction: 1 });
  }, 90_000);

  it("can't read the scorer's environment or files, or start processes", async () => {
    process.env.SCORER_CANARY = "visible";
    const probe = `import js
def probe(which):
    try:
        if which == 0:
            return 1.0 if str(js.process.env.SCORER_CANARY) == "visible" else 0.0
        if which == 1:
            js.process.getBuiltinModule("fs").readFileSync("package.json", "utf8")
            return 1.0
        if which == 2:
            js.process.getBuiltinModule("child_process").execSync("true")
            return 1.0
        if which == 3:
            js.process.getBuiltinModule("fs").writeFileSync("scorer-probe.txt", "x")
            return 1.0
    except Exception:
        return 0.0
`;
    try {
      const r = await runStudent(probe, "probe", [[0], [1], [2], [3]]);
      expect(r).toEqual({ kind: "ran", outputs: [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }] });
    } finally {
      delete process.env.SCORER_CANARY;
    }
  }, 90_000);
});
