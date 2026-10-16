import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import { deriveParams } from "./params";
import { TEMPLATES, getTemplate } from "./templates";

// Proves each template is gradeable: a correct solution passes the preview and
// scores 1 officially, with many students' numbers; the starter scores 0.
const SOLUTIONS: Record<string, string> = {
  "put-call-parity": `from math import exp
def put_from_parity(call, S, K, T, r):
    return call - S + K * exp(-r * T)
`,
  "black-scholes-call": `from math import log, sqrt, exp, erf
def norm_cdf(x):
    return 0.5 * (1 + erf(x / sqrt(2)))
def black_scholes_call(S, K, T, r, sigma):
    d1 = (log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt(T))
    d2 = d1 - sigma * sqrt(T)
    return S * norm_cdf(d1) - K * exp(-r * T) * norm_cdf(d2)
`,
  "call-delta": `from math import log, sqrt, erf
def norm_cdf(x):
    return 0.5 * (1 + erf(x / sqrt(2)))
def call_delta(S, K, T, r, sigma):
    return norm_cdf((log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt(T)))
`,
};

let py: PyodideInterface;
beforeAll(async () => {
  py = await loadPyodide();
}, 60_000);

/** Runs code then a test in a fresh namespace; returns `_score` (or null if the test raised). */
function run(code: string, test: string): { score: number | null; error: string | null } {
  const ns = py.toPy({});
  try {
    py.runPython(code, { globals: ns });
    py.runPython(test, { globals: ns });
    const score = ns.get("_score");
    return { score: typeof score === "number" ? score : null, error: null };
  } catch (e) {
    return { score: null, error: String(e) };
  } finally {
    ns.destroy();
  }
}

describe("season challenge templates", () => {
  it("has a solution for every template", () => {
    expect(Object.keys(SOLUTIONS).sort()).toEqual(Object.keys(TEMPLATES).sort());
    expect(getTemplate("nope")).toBeNull();
    expect(getTemplate("__proto__")).toBeNull();
  });

  for (const [slug, template] of Object.entries(TEMPLATES)) {
    it(`${slug}: a correct solution passes the preview and scores 1 with 20 students' numbers`, () => {
      expect(run(SOLUTIONS[slug], template.previewTest).error).toBeNull();
      for (let i = 0; i < 20; i++) {
        const p = deriveParams(template.paramSpecs, { challengeId: `s1-${slug}`, userId: `u${i}` }, "test-secret");
        expect(run(SOLUTIONS[slug], template.officialTest(p)).score, JSON.stringify(p)).toBe(1);
        expect(template.prompt(p)).not.toMatch(/undefined|NaN/);
      }
    }, 60_000);

    it(`${slug}: the starter fails the preview and scores 0`, () => {
      expect(run(template.starterCode, template.previewTest).error).not.toBeNull();
      const p = deriveParams(template.paramSpecs, { challengeId: `s1-${slug}`, userId: "u0" }, "test-secret");
      expect(run(template.starterCode, template.officialTest(p)).score).toBe(0);
    });

    it(`${slug}: the preview test (sent to the browser) contains no reference answer`, () => {
      expect(template.previewTest).not.toMatch(/_ref|_score|_cases/);
    });
  }
});
