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
  // ── Big tech / growth ──
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 195, vol: 0.28 },
  { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 430, vol: 0.22 },
  { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", basePrice: 175, vol: 0.3 },
  { symbol: "GOOG", name: "Alphabet Inc. (Class C)", basePrice: 178, vol: 0.3 },
  { symbol: "AMZN", name: "Amazon.com Inc.", basePrice: 195, vol: 0.32 },
  { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 130, vol: 0.45 },
  { symbol: "META", name: "Meta Platforms Inc.", basePrice: 560, vol: 0.36 },
  { symbol: "TSLA", name: "Tesla Inc.", basePrice: 220, vol: 0.55 },
  { symbol: "AVGO", name: "Broadcom Inc.", basePrice: 170, vol: 0.34 },
  { symbol: "ORCL", name: "Oracle Corp.", basePrice: 155, vol: 0.3 },
  { symbol: "CRM", name: "Salesforce Inc.", basePrice: 280, vol: 0.32 },
  { symbol: "ADBE", name: "Adobe Inc.", basePrice: 480, vol: 0.3 },
  { symbol: "INTC", name: "Intel Corp.", basePrice: 30, vol: 0.4 },
  { symbol: "AMD", name: "Advanced Micro Devices", basePrice: 145, vol: 0.48 },
  { symbol: "CSCO", name: "Cisco Systems Inc.", basePrice: 55, vol: 0.24 },
  { symbol: "IBM", name: "IBM Corp.", basePrice: 190, vol: 0.22 },
  { symbol: "QCOM", name: "Qualcomm Inc.", basePrice: 165, vol: 0.32 },
  { symbol: "TXN", name: "Texas Instruments Inc.", basePrice: 195, vol: 0.26 },
  { symbol: "NOW", name: "ServiceNow Inc.", basePrice: 800, vol: 0.34 },
  { symbol: "INTU", name: "Intuit Inc.", basePrice: 650, vol: 0.28 },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", basePrice: 75, vol: 0.38 },
  { symbol: "UBER", name: "Uber Technologies Inc.", basePrice: 75, vol: 0.4 },
  { symbol: "SHOP", name: "Shopify Inc.", basePrice: 75, vol: 0.5 },
  { symbol: "SNOW", name: "Snowflake Inc.", basePrice: 130, vol: 0.5 },
  { symbol: "PLTR", name: "Palantir Technologies", basePrice: 40, vol: 0.6 },
  { symbol: "NFLX", name: "Netflix Inc.", basePrice: 680, vol: 0.35 },
  { symbol: "DIS", name: "Walt Disney Co.", basePrice: 110, vol: 0.3 },
  { symbol: "SONY", name: "Sony Group Corp.", basePrice: 90, vol: 0.28 },

  // ── Financials ──
  { symbol: "JPM", name: "JPMorgan Chase & Co.", basePrice: 210, vol: 0.24 },
  { symbol: "BAC", name: "Bank of America Corp.", basePrice: 40, vol: 0.28 },
  { symbol: "WFC", name: "Wells Fargo & Co.", basePrice: 60, vol: 0.28 },
  { symbol: "GS", name: "Goldman Sachs Group", basePrice: 480, vol: 0.3 },
  { symbol: "MS", name: "Morgan Stanley", basePrice: 100, vol: 0.28 },
  { symbol: "C", name: "Citigroup Inc.", basePrice: 65, vol: 0.3 },
  { symbol: "AXP", name: "American Express Co.", basePrice: 250, vol: 0.26 },
  { symbol: "V", name: "Visa Inc.", basePrice: 280, vol: 0.22 },
  { symbol: "MA", name: "Mastercard Inc.", basePrice: 470, vol: 0.22 },
  { symbol: "SCHW", name: "Charles Schwab Corp.", basePrice: 75, vol: 0.28 },
  { symbol: "BLK", name: "BlackRock Inc.", basePrice: 900, vol: 0.24 },
  { symbol: "SPGI", name: "S&P Global Inc.", basePrice: 450, vol: 0.22 },
  { symbol: "BRK.B", name: "Berkshire Hathaway (Class B)", basePrice: 460, vol: 0.18 },

  // ── Healthcare ──
  { symbol: "UNH", name: "UnitedHealth Group", basePrice: 500, vol: 0.26 },
  { symbol: "JNJ", name: "Johnson & Johnson", basePrice: 155, vol: 0.16 },
  { symbol: "PFE", name: "Pfizer Inc.", basePrice: 28, vol: 0.26 },
  { symbol: "ABBV", name: "AbbVie Inc.", basePrice: 185, vol: 0.22 },
  { symbol: "MRK", name: "Merck & Co.", basePrice: 95, vol: 0.22 },
  { symbol: "LLY", name: "Eli Lilly & Co.", basePrice: 850, vol: 0.3 },
  { symbol: "TMO", name: "Thermo Fisher Scientific", basePrice: 550, vol: 0.24 },
  { symbol: "ABT", name: "Abbott Laboratories", basePrice: 115, vol: 0.18 },
  { symbol: "DHR", name: "Danaher Corp.", basePrice: 250, vol: 0.22 },
  { symbol: "BMY", name: "Bristol-Myers Squibb", basePrice: 55, vol: 0.24 },
  { symbol: "CVS", name: "CVS Health Corp.", basePrice: 65, vol: 0.3 },

  // ── Consumer ──
  { symbol: "WMT", name: "Walmart Inc.", basePrice: 90, vol: 0.18 },
  { symbol: "COST", name: "Costco Wholesale Corp.", basePrice: 900, vol: 0.2 },
  { symbol: "HD", name: "Home Depot Inc.", basePrice: 400, vol: 0.22 },
  { symbol: "MCD", name: "McDonald's Corp.", basePrice: 290, vol: 0.18 },
  { symbol: "NKE", name: "Nike Inc.", basePrice: 75, vol: 0.3 },
  { symbol: "SBUX", name: "Starbucks Corp.", basePrice: 95, vol: 0.26 },
  { symbol: "TGT", name: "Target Corp.", basePrice: 145, vol: 0.28 },
  { symbol: "LOW", name: "Lowe's Companies Inc.", basePrice: 250, vol: 0.22 },
  { symbol: "PG", name: "Procter & Gamble Co.", basePrice: 170, vol: 0.15 },
  { symbol: "KO", name: "Coca-Cola Co.", basePrice: 65, vol: 0.14 },
  { symbol: "PEP", name: "PepsiCo Inc.", basePrice: 170, vol: 0.16 },
  { symbol: "PM", name: "Philip Morris International", basePrice: 120, vol: 0.2 },

  // ── Energy / Industrials ──
  { symbol: "XOM", name: "Exxon Mobil Corp.", basePrice: 115, vol: 0.24 },
  { symbol: "CVX", name: "Chevron Corp.", basePrice: 160, vol: 0.22 },
  { symbol: "COP", name: "ConocoPhillips", basePrice: 105, vol: 0.28 },
  { symbol: "BA", name: "Boeing Co.", basePrice: 180, vol: 0.36 },
  { symbol: "CAT", name: "Caterpillar Inc.", basePrice: 350, vol: 0.26 },
  { symbol: "GE", name: "GE Aerospace", basePrice: 165, vol: 0.26 },
  { symbol: "HON", name: "Honeywell International", basePrice: 210, vol: 0.2 },
  { symbol: "LMT", name: "Lockheed Martin Corp.", basePrice: 470, vol: 0.2 },
  { symbol: "RTX", name: "RTX Corp.", basePrice: 120, vol: 0.22 },
  { symbol: "UPS", name: "United Parcel Service", basePrice: 130, vol: 0.24 },
  { symbol: "FDX", name: "FedEx Corp.", basePrice: 270, vol: 0.28 },
  { symbol: "DE", name: "Deere & Co.", basePrice: 400, vol: 0.26 },

  // ── Communication / telecom ──
  { symbol: "T", name: "AT&T Inc.", basePrice: 20, vol: 0.22 },
  { symbol: "VZ", name: "Verizon Communications", basePrice: 40, vol: 0.2 },
  { symbol: "TMUS", name: "T-Mobile US Inc.", basePrice: 190, vol: 0.24 },
  { symbol: "CMCSA", name: "Comcast Corp.", basePrice: 40, vol: 0.24 },

  // ── ETFs / indices ──
  { symbol: "SPY", name: "S&P 500 ETF Trust", basePrice: 560, vol: 0.15 },
  { symbol: "QQQ", name: "Invesco QQQ Trust (Nasdaq-100)", basePrice: 480, vol: 0.2 },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial ETF", basePrice: 400, vol: 0.14 },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", basePrice: 210, vol: 0.22 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", basePrice: 270, vol: 0.16 },
  { symbol: "GLD", name: "SPDR Gold Shares", basePrice: 240, vol: 0.14 },
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
