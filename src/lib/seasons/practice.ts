/**
 * The practice round at /seasons/practice: one short problem, in the same
 * workspace and with the same rules as a season challenge, but not scored,
 * ranked or saved on the server.
 *
 * This module runs in the browser, and its check program contains the model
 * answer. That is fine for practice and is exactly why it must stay apart from
 * `templates.ts` (the real challenges' hidden official tests, server only):
 * practice.test.ts fails if this file imports anything from there.
 */
import type { StorageLike } from "./draft";

export const PRACTICE_MINUTES = 15;
export const PRACTICE_ENTRY = "forward_price";
export const PRACTICE_TITLE = "Price a forward";
export const PRACTICE_CONCEPT = "No-arbitrage forward price";

export interface PracticeParams {
  S: number;
  r: number;
  T: number;
}

/** Small seeded generator, so a reload keeps the same numbers. Not for security. */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function practiceParams(seed: number): PracticeParams {
  const rand = mulberry32(seed);
  const pick = (min: number, max: number, step: number, decimals: number) => {
    const steps = Math.floor((max - min) / step + 1e-9);
    const k = Math.min(steps, Math.floor(rand() * (steps + 1)));
    return Number((min + k * step).toFixed(decimals));
  };
  return { S: pick(50, 150, 1, 0), r: pick(0.01, 0.06, 0.005, 3), T: pick(0.25, 2, 0.25, 2) };
}

export function newPracticeSeed(random: () => number = Math.random): number {
  return Math.floor(random() * 2_147_483_647);
}

export function practicePrompt(p: PracticeParams): string {
  return (
    `A stock trades at ${p.S} and pays no dividends. The risk-free rate is ${p.r} (continuously compounded). ` +
    `Write forward_price(S, r, T) that returns the no-arbitrage price today for delivering one share in T years. ` +
    `Your numbers: S = ${p.S}, r = ${p.r}, T = ${p.T}. Then explain, in two or three sentences, what trade would earn ` +
    `risk-free money if the forward were priced any other way.`
  );
}

export const PRACTICE_STARTER = `from math import exp

def forward_price(S, r, T):
    # Your code here
    raise NotImplementedError
`;

/** Python that checks the student's forward_price on this round's numbers and returns a JSON string. */
export function practiceChecks(p: PracticeParams): string {
  return `import json as _json
from math import exp as _exp
def _ref(S, r, T):
    return S * _exp(r * T)
_cases = [(${p.S}, ${p.r}, ${p.T}), (${p.S} + 10, ${p.r}, ${p.T}), (${p.S}, ${p.r}, ${p.T} * 2), (${p.S}, 0, ${p.T})]
_ok = 0
_notes = []
for _c in _cases:
    try:
        _got = forward_price(*_c)
        _want = _ref(*_c)
        if isinstance(_got, (int, float)) and abs(_got - _want) <= 1e-6 * max(1.0, abs(_want)):
            _ok += 1
        else:
            _notes.append("forward_price%s returned %r, expected about %.4f" % (_c, _got, _want))
    except Exception as _e:
        if isinstance(_e, NotImplementedError):
            _notes.append("forward_price isn't written yet: replace the raise NotImplementedError line with your code.")
            break
        _msg = str(_e)
        _notes.append("forward_price%s raised %s%s" % (_c, type(_e).__name__, (": " + _msg) if _msg else ""))
_json.dumps({"passed": _ok, "total": len(_cases), "notes": _notes[:2]})
`;
}

export interface PracticeResult {
  passed: number;
  total: number;
  notes: string[];
}

export function parsePracticeResult(value: unknown): PracticeResult | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value) as Partial<PracticeResult>;
    if (typeof parsed.passed !== "number" || typeof parsed.total !== "number" || !Array.isArray(parsed.notes)) return null;
    return { passed: parsed.passed, total: parsed.total, notes: parsed.notes.map(String) };
  } catch {
    return null;
  }
}

/** A short line for the checks panel. */
export function describeResult(result: PracticeResult): string {
  const head = result.passed === result.total
    ? `All ${result.total} checks passed.`
    : `${result.passed} of ${result.total} checks passed.`;
  return result.notes.length ? `${head}\n${result.notes.join("\n")}` : head;
}

// ── Saved practice round (this device only) ───────────────────────────────────

export interface PracticeState {
  seed: number;
  /** Epoch ms when the student pressed Start; null before. */
  startedAt: number | null;
}

export const PRACTICE_STATE_KEY = "strikelab:practice:v1";

export function loadPracticeState(storage: StorageLike | null): PracticeState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(PRACTICE_STATE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<PracticeState>;
    if (typeof value.seed !== "number" || !Number.isFinite(value.seed)) return null;
    return { seed: value.seed, startedAt: typeof value.startedAt === "number" ? value.startedAt : null };
  } catch {
    return null;
  }
}

export function savePracticeState(storage: StorageLike | null, state: PracticeState): void {
  try {
    storage?.setItem(PRACTICE_STATE_KEY, JSON.stringify(state));
  } catch {
    // Practice still works without saving.
  }
}

export function clearPracticeState(storage: StorageLike | null): void {
  try {
    storage?.removeItem(PRACTICE_STATE_KEY);
  } catch {
    // Nothing to clean up.
  }
}

/**
 * Python that removes the student's function before each run, so a function
 * they have since deleted or renamed can't keep passing from an earlier run.
 */
export function forgetFunctionProgram(name: string): string | null {
  // Evaluates to None: a popped function can't be sent back from the Python worker.
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? `(globals().pop(${JSON.stringify(name)}, None), None)[1]` : null;
}
