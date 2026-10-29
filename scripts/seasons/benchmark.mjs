// T4.3: run the production scorer on 150 deterministic synthetic attempts.
// Each attempt starts its own sandboxed Python (about 1 s), as in a real run.
// No database or secret is needed. Two infinite loops exercise worker recovery;
// syntax errors and a wrong answer must score zero without false zeroes for
// correct submissions.
import { performance } from "node:perf_hooks";
import { deriveParams } from "../../src/lib/seasons/params.ts";
import { getTemplate } from "../../src/lib/seasons/templates.ts";
import { createScorer, outcome } from "./score-core.mjs";

const SOLUTIONS = {
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

const slugs = Object.keys(SOLUTIONS);
const syntax = new Set([11, 67, 123]);
const loops = new Set([29, 89]);
const wrong = 140;
const scorer = createScorer();
const durations = [];
const failures = [];
const tally = { correct: 0, syntax: 0, timeout: 0, wrong: 0 };
const started = performance.now();

try {
  for (let index = 0; index < 150; index++) {
    const slug = slugs[index % slugs.length];
    const template = getTemplate(slug);
    const params = deriveParams(template.paramSpecs, {
      challengeId: `benchmark-${slug}`,
      userId: `synthetic-${index}`,
    }, "rehearsal-benchmark-secret");
    const code = loops.has(index)
      ? "while True:\n    pass\n"
      : syntax.has(index)
        ? "def broken(:\n"
        : index === wrong
          ? SOLUTIONS["put-call-parity"].replace("call - S +", "call + S +")
          : SOLUTIONS[slug];
    const caseStarted = performance.now();
    const result = await scorer.run(code, template.officialTest(params), template.entry);
    durations.push(performance.now() - caseStarted);
    const row = outcome(result, { usedSeconds: 300, limitSeconds: 3600 });
    const expected = loops.has(index) ? "timeout" : syntax.has(index) ? "syntax" : index === wrong ? "wrong" : "correct";
    tally[expected]++;
    const valid = expected === "correct"
      ? result.kind === "scored" && result.fraction === 1 && row.status === "scored" && row.official_score > 0
      : expected === "syntax"
        ? result.kind === "student" && row.status === "scored" && row.official_score === 0
        : expected === "timeout"
          ? result.kind === "timeout" && row.status === "pending_review" && row.official_score === null
          : result.kind === "scored" && result.fraction === 0 && row.status === "scored" && row.official_score === 0;
    if (!valid) failures.push({ index, slug, expected, result, row });
  }
} finally {
  await scorer.close();
}

const elapsedMs = performance.now() - started;
const sorted = [...durations].sort((a, b) => a - b);
console.log(JSON.stringify({
  attempts: durations.length,
  cases: tally,
  elapsedSeconds: Number((elapsedMs / 1000).toFixed(2)),
  meanMs: Number((durations.reduce((sum, ms) => sum + ms, 0) / durations.length).toFixed(1)),
  p95Ms: Number(sorted[Math.ceil(sorted.length * 0.95) - 1].toFixed(1)),
  maxMs: Number(sorted.at(-1).toFixed(1)),
  failures,
}, null, 2));
if (durations.length !== 150 || failures.length > 0) process.exitCode = 1;
