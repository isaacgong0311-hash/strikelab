import type { ParamSpec, Params } from "./params";

/**
 * Season challenge content lives in code, keyed by the `template_slug` of a
 * `season_challenges` row (0024). Two tests per challenge:
 * - previewTest: public sanity checks with fixed textbook numbers. It goes to
 *   the browser, so it must never contain the answer.
 * - officialTest: hidden; the server runs it with the student's own numbers
 *   and it sets `_score` (0..1). It may contain a reference implementation.
 * templates.test.ts runs both in Pyodide to prove a correct solution scores
 * 1 and the starter code scores 0.
 */
export interface ChallengeTemplate {
  slug: string;
  title: string;
  concept: string;
  paramSpecs: readonly ParamSpec[];
  prompt(p: Params): string;
  starterCode: string;
  previewTest: string;
  officialTest(p: Params): string;
}

const NORM_CDF = `from math import log, sqrt, exp, erf

def norm_cdf(x):
    return 0.5 * (1 + erf(x / sqrt(2)))
`;

const putCallParity: ChallengeTemplate = {
  slug: "put-call-parity",
  title: "Price a put from a call",
  concept: "Put-call parity",
  paramSpecs: [
    { name: "C", min: 2, max: 20, step: 0.5 },
    { name: "S", min: 80, max: 120, step: 1 },
    { name: "K", min: 80, max: 120, step: 1 },
    { name: "T", min: 0.25, max: 2, step: 0.25 },
    { name: "r", min: 0.01, max: 0.06, step: 0.005 },
  ],
  prompt: (p) =>
    `A European call on a stock trading at ${p.S} with strike ${p.K} and ${p.T} years to expiry costs ${p.C}. ` +
    `The risk-free rate is ${p.r} (continuously compounded). Write put_from_parity(call, S, K, T, r) that returns ` +
    `the price of the matching European put, using put-call parity. Then explain, in two or three sentences, why ` +
    `parity has to hold (what trade would make free money if it didn't).`,
  starterCode: `from math import exp

def put_from_parity(call, S, K, T, r):
    # Your code here
    raise NotImplementedError
`,
  previewTest: `_v = put_from_parity(10, 100, 100, 1, 0)
assert isinstance(_v, (int, float)), "Return a number"
assert abs(_v - 10) < 1e-9, "With r = 0 and S = K, the put should cost the same as the call"
assert put_from_parity(10, 100, 100, 1, 0.05) < 10, "A positive rate makes the put cheaper than the call here"
print("Preview checks passed. Your official score is computed with your own numbers after you submit.")
`,
  officialTest: (p) => `from math import exp as _exp
def _ref(call, S, K, T, r):
    return call - S + K * _exp(-r * T)
_cases = [(${p.C}, ${p.S}, ${p.K}, ${p.T}, ${p.r}), (${p.C} + 1, ${p.S}, ${p.K}, ${p.T}, ${p.r}), (${p.C}, ${p.S}, ${p.K}, ${p.T} * 2, ${p.r})]
_passed = 0
for _c in _cases:
    try:
        if abs(put_from_parity(*_c) - _ref(*_c)) <= 1e-6 * max(1.0, abs(_ref(*_c))):
            _passed += 1
    except Exception:
        pass
_score = _passed / len(_cases)
`,
};

const blackScholesCall: ChallengeTemplate = {
  slug: "black-scholes-call",
  title: "Price a call with Black-Scholes",
  concept: "Black-Scholes",
  paramSpecs: [
    { name: "S", min: 80, max: 120, step: 1 },
    { name: "K", min: 80, max: 120, step: 1 },
    { name: "T", min: 0.25, max: 2, step: 0.25 },
    { name: "r", min: 0.01, max: 0.06, step: 0.005 },
    { name: "sigma", min: 0.1, max: 0.5, step: 0.01 },
  ],
  prompt: (p) =>
    `Write black_scholes_call(S, K, T, r, sigma) returning the Black-Scholes price of a European call. ` +
    `Your numbers: S = ${p.S}, K = ${p.K}, T = ${p.T} years, r = ${p.r}, sigma = ${p.sigma}. ` +
    `Then explain, in two or three sentences, why the price goes up when sigma goes up.`,
  starterCode: `${NORM_CDF}
def black_scholes_call(S, K, T, r, sigma):
    # Your code here
    raise NotImplementedError
`,
  previewTest: `_v = black_scholes_call(100, 100, 1, 0.05, 0.2)
assert isinstance(_v, (int, float)), "Return a number"
assert 0 < _v < 100, "A call is worth more than 0 and less than the stock"
assert black_scholes_call(100, 100, 1, 0.05, 0.3) > _v, "More volatility should make the call worth more"
assert black_scholes_call(110, 100, 1, 0.05, 0.2) > _v, "A higher stock price should make the call worth more"
print("Preview checks passed. Your official score is computed with your own numbers after you submit.")
`,
  officialTest: (p) => `from math import log as _log, sqrt as _sqrt, exp as _exp, erf as _erf
def _ncdf(x):
    return 0.5 * (1 + _erf(x / _sqrt(2)))
def _ref(S, K, T, r, sigma):
    d1 = (_log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * _sqrt(T))
    d2 = d1 - sigma * _sqrt(T)
    return S * _ncdf(d1) - K * _exp(-r * T) * _ncdf(d2)
_cases = [(${p.S}, ${p.K}, ${p.T}, ${p.r}, ${p.sigma}), (${p.S} * 1.1, ${p.K}, ${p.T}, ${p.r}, ${p.sigma}), (${p.S}, ${p.K}, ${p.T} * 2, ${p.r}, ${p.sigma})]
_passed = 0
for _c in _cases:
    try:
        if abs(black_scholes_call(*_c) - _ref(*_c)) <= 1e-6 * max(1.0, abs(_ref(*_c))):
            _passed += 1
    except Exception:
        pass
_score = _passed / len(_cases)
`,
};

const callDelta: ChallengeTemplate = {
  slug: "call-delta",
  title: "Measure a call's delta",
  concept: "Delta",
  paramSpecs: [
    { name: "S", min: 80, max: 120, step: 1 },
    { name: "K", min: 80, max: 120, step: 1 },
    { name: "T", min: 0.25, max: 2, step: 0.25 },
    { name: "r", min: 0.01, max: 0.06, step: 0.005 },
    { name: "sigma", min: 0.1, max: 0.5, step: 0.01 },
  ],
  prompt: (p) =>
    `Write call_delta(S, K, T, r, sigma) returning the Black-Scholes delta of a European call: how much its price ` +
    `moves per $1 move in the stock. Your numbers: S = ${p.S}, K = ${p.K}, T = ${p.T} years, r = ${p.r}, ` +
    `sigma = ${p.sigma}. Then explain, in two or three sentences, what your delta means for someone hedging 100 calls.`,
  starterCode: `${NORM_CDF}
def call_delta(S, K, T, r, sigma):
    # Your code here
    raise NotImplementedError
`,
  previewTest: `_v = call_delta(100, 100, 1, 0.05, 0.2)
assert isinstance(_v, (int, float)), "Return a number"
assert 0 < _v < 1, "A call's delta is between 0 and 1"
assert call_delta(120, 100, 1, 0.05, 0.2) > _v, "Deeper in the money means a higher delta"
assert call_delta(80, 100, 1, 0.05, 0.2) < _v, "Further out of the money means a lower delta"
print("Preview checks passed. Your official score is computed with your own numbers after you submit.")
`,
  officialTest: (p) => `from math import log as _log, sqrt as _sqrt, erf as _erf
def _ncdf(x):
    return 0.5 * (1 + _erf(x / _sqrt(2)))
def _ref(S, K, T, r, sigma):
    return _ncdf((_log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * _sqrt(T)))
_cases = [(${p.S}, ${p.K}, ${p.T}, ${p.r}, ${p.sigma}), (${p.S} * 1.1, ${p.K}, ${p.T}, ${p.r}, ${p.sigma}), (${p.S}, ${p.K}, ${p.T} * 2, ${p.r}, ${p.sigma})]
_passed = 0
for _c in _cases:
    try:
        if abs(call_delta(*_c) - _ref(*_c)) <= 1e-6:
            _passed += 1
    except Exception:
        pass
_score = _passed / len(_cases)
`,
};

export const TEMPLATES: Readonly<Record<string, ChallengeTemplate>> = {
  [putCallParity.slug]: putCallParity,
  [blackScholesCall.slug]: blackScholesCall,
  [callDelta.slug]: callDelta,
};

export function getTemplate(slug: string): ChallengeTemplate | null {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, slug) ? TEMPLATES[slug] : null;
}
