/**
 * Sandbox pricing engine.
 *
 * Black-Scholes here is a TypeScript port of the reference implementation in
 * `src/app/playground/PlaygroundClient.tsx`'s Python `STARTER_CODE` (the same
 * _d1/_d2/_norm_cdf/black_scholes_call/put formulas taught in the Playground
 * lesson) — kept in sync deliberately so the sandbox prices options the exact
 * same way the lessons teach.
 *
 * There is no real market-data feed. `simulatePrice` generates a deterministic
 * geometric Brownian motion (GBM) path per symbol, reseeded at the start of
 * each UTC day, so refreshing the page mid-session shows a consistent "live"
 * price rather than a random one on every request.
 */

export type AssetType = "stock" | "call" | "put";

export interface WatchlistSymbol {
  symbol: string;
  name: string;
  basePrice: number;
  /** Annualized volatility — drives both the simulated walk and option IV. */
  vol: number;
}

export const WATCHLIST: WatchlistSymbol[] = [
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 195, vol: 0.28 },
  { symbol: "TSLA", name: "Tesla Inc.", basePrice: 220, vol: 0.55 },
  { symbol: "SPY", name: "S&P 500 ETF", basePrice: 560, vol: 0.15 },
  { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 130, vol: 0.45 },
  { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 430, vol: 0.22 },
  { symbol: "GOOGL", name: "Alphabet Inc.", basePrice: 175, vol: 0.3 },
];

export const RISK_FREE_RATE = 0.045;
const DRIFT = 0.08;
const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TICK_MS = 5000;

export function getWatchlistSymbol(symbol: string): WatchlistSymbol {
  const w = WATCHLIST.find((s) => s.symbol === symbol);
  if (!w) throw new Error(`Unknown symbol: ${symbol}`);
  return w;
}

// ─── Deterministic PRNG (mulberry32) + Box-Muller normal sampling ─────────────
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nextGaussian(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-12);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Deterministic seeded GBM path for `symbol`, ticking every `TICK_MS` and
 * resetting from `basePrice` at the start of each UTC day.
 */
export function simulatePrice(symbol: string, atMs: number = Date.now()): number {
  const w = getWatchlistSymbol(symbol);

  const dayStart = Math.floor(atMs / MS_PER_DAY) * MS_PER_DAY;
  const ticks = Math.max(0, Math.floor((atMs - dayStart) / TICK_MS));
  const dtYears = TICK_MS / MS_PER_YEAR;

  const rand = mulberry32(hashString(`${symbol}:${dayStart}`));
  const driftPerTick = (DRIFT - 0.5 * w.vol * w.vol) * dtYears;
  const volPerTick = w.vol * Math.sqrt(dtYears);

  let logReturn = 0;
  for (let i = 0; i < ticks; i++) {
    logReturn += driftPerTick + volPerTick * nextGaussian(rand);
  }

  return Math.max(0.01, w.basePrice * Math.exp(logReturn));
}

/** One price point per tick over the last `count` ticks, for charting. */
export function simulatePriceHistory(
  symbol: string,
  count = 60,
  atMs: number = Date.now()
): { t: number; price: number }[] {
  const points: { t: number; price: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = atMs - i * TICK_MS;
    points.push({ t, price: simulatePrice(symbol, t) });
  }
  return points;
}

// ─── Black-Scholes (TS port of the Playground's Python reference) ────────────
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-ax * ax);
  return sign * y;
}

function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function d1(S: number, K: number, T: number, r: number, sigma: number): number {
  return (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
}

function d2(S: number, K: number, T: number, r: number, sigma: number): number {
  return d1(S, K, T, r, sigma) - sigma * Math.sqrt(T);
}

export function blackScholesCall(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  const D1 = d1(S, K, T, r, sigma);
  const D2 = d2(S, K, T, r, sigma);
  return S * normCdf(D1) - K * Math.exp(-r * T) * normCdf(D2);
}

export function blackScholesPut(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  const D1 = d1(S, K, T, r, sigma);
  const D2 = d2(S, K, T, r, sigma);
  return K * Math.exp(-r * T) * normCdf(-D2) - S * normCdf(-D1);
}

// ─── Mark pricing for the sandbox (stocks + options) ──────────────────────────
export interface MarkParams {
  symbol: string;
  assetType: AssetType;
  strike?: number | null;
  expiry?: string | null; // ISO date
}

export function contractMultiplier(assetType: AssetType): number {
  return assetType === "stock" ? 1 : 100;
}

/** Current mark price for a stock or option leg, using the simulated underlying. */
export function markPrice(params: MarkParams, atMs: number = Date.now()): number {
  const w = getWatchlistSymbol(params.symbol);
  const S = simulatePrice(params.symbol, atMs);

  if (params.assetType === "stock") return S;

  if (!params.strike || !params.expiry) {
    throw new Error("strike and expiry are required for option legs");
  }

  const T = Math.max(0, (new Date(params.expiry).getTime() - atMs) / MS_PER_YEAR);
  if (T <= 0) {
    return params.assetType === "call"
      ? Math.max(0, S - params.strike)
      : Math.max(0, params.strike - S);
  }

  return params.assetType === "call"
    ? blackScholesCall(S, params.strike, T, RISK_FREE_RATE, w.vol)
    : blackScholesPut(S, params.strike, T, RISK_FREE_RATE, w.vol);
}
