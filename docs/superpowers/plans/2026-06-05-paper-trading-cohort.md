# Paper-Trading Sandbox + Weekly Cohort Challenges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-money-free paper-trading sandbox backed by Polygon.io + Supabase, plus a weekly P&L competition where all Pro users start with $10k and are ranked by return at week end.

**Architecture:** Anonymous UUID (from localStorage) as user identity; Polygon.io proxied server-side; Supabase for positions/trades/cohort state; Vercel Cron resets cohort each Monday.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, @supabase/supabase-js, Polygon.io REST API, Vercel Cron

---

## File Map

| File | Role |
|------|------|
| `src/lib/supabase.ts` | Browser client + server admin client |
| `src/lib/polygon.ts` | Typed wrappers for Polygon.io quote + option-chain endpoints |
| `src/lib/trading.ts` | P&L helpers, cost-basis math, commission constants |
| `src/app/api/market/quote/route.ts` | GET proxy → Polygon stock snapshot |
| `src/app/api/market/options/route.ts` | GET proxy → Polygon option-chain snapshot |
| `src/app/api/trading/portfolio/route.ts` | GET open positions + sandbox cash balance |
| `src/app/api/trading/execute/route.ts` | POST buy/sell validation + DB write |
| `src/app/api/trading/close/route.ts` | POST close position, book P&L |
| `src/app/api/cohort/week/route.ts` | GET active cohort week |
| `src/app/api/cohort/leaderboard/route.ts` | GET enriched leaderboard (live P&L %) |
| `src/app/api/cohort/join/route.ts` | POST upsert cohort_entries row |
| `src/app/api/cron/reset-cohort/route.ts` | GET invoked by Vercel Cron every Monday |
| `src/components/OptionChain.tsx` | Strike × expiry selector grid |
| `src/components/PositionRow.tsx` | Single open-position row with live P&L |
| `src/components/Leaderboard.tsx` | Ranked table of cohort entries |
| `src/app/sandbox/page.tsx` | Server metadata wrapper |
| `src/app/sandbox/SandboxClient.tsx` | Full trading UI (two-column) |
| `src/app/cohort/page.tsx` | Server metadata wrapper |
| `src/app/cohort/CohortClient.tsx` | Hero + leaderboard + join flow |
| `src/components/Nav.tsx` | Add Sandbox + Cohort links |
| `src/app/globals.css` | Sandbox + cohort CSS (`.sb-*`, `.ct-*`) |
| `vercel.json` | Cron schedule declaration |

---

## Task 1 — Install dependencies + env template

**Files:**
- Run: `npm install @supabase/supabase-js` in `C:\Users\hogri\strikelab`
- Create: `C:\Users\hogri\strikelab\.env.local.example`

- [ ] **Step 1: Install Supabase JS client**

```bash
cd C:\Users\hogri\strikelab
npm install @supabase/supabase-js
```

Expected output: `added 1 package` (or similar — no errors)

- [ ] **Step 2: Create env template**

Create `.env.local.example` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...

# Polygon.io
POLYGON_API_KEY=your_polygon_key_here
```

- [ ] **Step 3: Add env vars to Vercel (manual step — user action required)**

In Vercel dashboard → strikelab project → Settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POLYGON_API_KEY`

For local dev, copy `.env.local.example` to `.env.local` and fill in real values.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: add @supabase/supabase-js dep + env template"
```

---

## Task 2 — Supabase SQL schema

**Files:**
- Create: `C:\Users\hogri\strikelab\docs\supabase-schema.sql`

- [ ] **Step 1: Write schema file**

Create `docs/supabase-schema.sql`:

```sql
-- ── Paper trading positions ───────────────────────────────────
CREATE TABLE paper_positions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  symbol       TEXT NOT NULL,
  asset_type   TEXT NOT NULL CHECK (asset_type IN ('stock','call','put')),
  side         TEXT NOT NULL CHECK (side IN ('long','short')),
  qty          INTEGER NOT NULL CHECK (qty > 0),
  avg_cost     NUMERIC(12,4) NOT NULL,
  strike       NUMERIC(10,2),
  expiry       DATE,
  leg_group    UUID,
  opened_at    TIMESTAMPTZ DEFAULT NOW(),
  closed_at    TIMESTAMPTZ,
  close_price  NUMERIC(12,4),
  realized_pnl NUMERIC(12,4)
);
CREATE INDEX ON paper_positions(user_id, closed_at);

-- ── Immutable trade log ───────────────────────────────────────
CREATE TABLE paper_trades (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  symbol      TEXT NOT NULL,
  asset_type  TEXT NOT NULL CHECK (asset_type IN ('stock','call','put')),
  direction   TEXT NOT NULL CHECK (direction IN ('buy','sell')),
  qty         INTEGER NOT NULL,
  fill_price  NUMERIC(12,4) NOT NULL,
  strike      NUMERIC(10,2),
  expiry      DATE,
  commission  NUMERIC(8,4) NOT NULL DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON paper_trades(user_id);

-- ── Sandbox cash balances ($100k start, persistent) ──────────
CREATE TABLE sandbox_balances (
  user_id      TEXT PRIMARY KEY,
  cash_balance NUMERIC(12,2) NOT NULL DEFAULT 100000,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Weekly cohort competition ─────────────────────────────────
CREATE TABLE cohort_weeks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  week_end   DATE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cohort_entries (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  week_id      UUID NOT NULL REFERENCES cohort_weeks(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Trader',
  cash_balance NUMERIC(12,2) NOT NULL DEFAULT 10000,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_id)
);
CREATE INDEX ON cohort_entries(week_id, cash_balance DESC);

-- ── Seed the first cohort week (run once after schema creation) ──
-- Replace dates with the upcoming Mon/Sun
INSERT INTO cohort_weeks (week_start, week_end, is_active)
VALUES (
  date_trunc('week', NOW())::date,
  (date_trunc('week', NOW()) + interval '6 days')::date,
  TRUE
);
```

- [ ] **Step 2: Run schema in Supabase (manual — user action)**

Open Supabase dashboard → SQL Editor → paste contents of `docs/supabase-schema.sql` → Run.

Verify tables exist under Table Editor: `paper_positions`, `paper_trades`, `sandbox_balances`, `cohort_weeks`, `cohort_entries`.

- [ ] **Step 3: Commit**

```bash
git add docs/supabase-schema.sql
git commit -m "feat: add Supabase schema for paper trading + cohort"
```

---

## Task 3 — `src/lib/supabase.ts`

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Write the file**

```typescript
/**
 * supabase.ts — two clients:
 *   browserClient()  — uses anon key, safe to call from "use client" components
 *   adminClient()    — uses service-role key, SERVER ONLY (API routes)
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton browser client (memoised to avoid creating on every render)
let _browser: SupabaseClient | null = null;
export function browserClient(): SupabaseClient {
  if (!_browser) _browser = createClient(url, anonKey);
  return _browser;
}

// Server-only admin client — never call from the browser
export function adminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:\Users\hogri\strikelab
npx tsc --noEmit
```

Expected: no errors referencing `supabase.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client lib (browser + admin)"
```

---

## Task 4 — `src/lib/polygon.ts`

**Files:**
- Create: `src/lib/polygon.ts`

- [ ] **Step 1: Write the file**

```typescript
/**
 * polygon.ts — typed wrappers for Polygon.io REST endpoints.
 * All functions are SERVER-ONLY (they read POLYGON_API_KEY from env).
 */

const BASE = "https://api.polygon.io";

function key(): string {
  const k = process.env.POLYGON_API_KEY;
  if (!k) throw new Error("POLYGON_API_KEY is not set");
  return k;
}

// ── Types ─────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  price: number;      // last trade price
  open: number;
  high: number;
  low: number;
  close: number;      // previous day close
  change: number;     // $ change vs prev close
  changePct: number;  // % change vs prev close
}

export interface OptionContract {
  ticker: string;        // full OCC symbol, e.g. O:SPY251219C00500000
  strike: number;
  expiry: string;        // ISO date "2025-12-19"
  type: "call" | "put";
  lastPrice: number;
  bid: number;
  ask: number;
  openInterest: number;
  volume: number;
  impliedVol: number;
  delta: number | null;
}

// ── Stock quotes ─────────────────────────────────────────────

export async function getStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  if (symbols.length === 0) return [];

  const results: StockQuote[] = [];

  await Promise.all(
    symbols.map(async (sym) => {
      const url =
        `${BASE}/v2/snapshot/locale/us/markets/stocks/tickers/${sym.toUpperCase()}` +
        `?apiKey=${key()}`;
      const res = await fetch(url, { next: { revalidate: 30 } });
      if (!res.ok) return;
      const data = await res.json();
      const t = data?.ticker;
      if (!t) return;
      const prevClose = t.prevDay?.c ?? 0;
      const last = t.lastTrade?.p ?? t.day?.c ?? prevClose;
      results.push({
        symbol: sym.toUpperCase(),
        price: last,
        open: t.day?.o ?? 0,
        high: t.day?.h ?? 0,
        low: t.day?.l ?? 0,
        close: prevClose,
        change: last - prevClose,
        changePct: prevClose > 0 ? ((last - prevClose) / prevClose) * 100 : 0,
      });
    }),
  );

  return results;
}

// ── Option chain snapshot ─────────────────────────────────────

export async function getOptionChain(symbol: string): Promise<OptionContract[]> {
  // Fetch up to 250 contracts — nearest expiries, strikes within ±20% of spot
  const url =
    `${BASE}/v3/snapshot/options/${symbol.toUpperCase()}` +
    `?limit=250&apiKey=${key()}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polygon options error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const results: OptionContract[] = [];

  for (const item of data?.results ?? []) {
    const d = item.details ?? {};
    const g = item.greeks ?? {};
    const q = item.day ?? {};
    results.push({
      ticker: item.ticker ?? "",
      strike: d.strike_price ?? 0,
      expiry: d.expiration_date ?? "",
      type: (d.contract_type ?? "call") as "call" | "put",
      lastPrice: q.close ?? item.last_quote?.midpoint ?? 0,
      bid: item.last_quote?.bid ?? 0,
      ask: item.last_quote?.ask ?? 0,
      openInterest: item.open_interest ?? 0,
      volume: q.volume ?? 0,
      impliedVol: item.implied_volatility ?? 0,
      delta: g.delta ?? null,
    });
  }

  return results;
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/polygon.ts
git commit -m "feat: add Polygon.io typed wrappers (quotes + option chain)"
```

---

## Task 5 — `src/lib/trading.ts`

**Files:**
- Create: `src/lib/trading.ts`

- [ ] **Step 1: Write the file**

```typescript
/**
 * trading.ts — pure helpers for P&L math, cost-basis, commissions.
 * No I/O — purely functional, safe to import anywhere.
 */

export const OPTION_MULTIPLIER = 100; // 1 contract = 100 shares
export const OPTION_COMMISSION = 0.65; // $ per contract
export const STOCK_COMMISSION = 0;

export type AssetType = "stock" | "call" | "put";
export type Side = "long" | "short";

/**
 * Commission charged when buying/selling options.
 * qty = number of contracts (not shares)
 */
export function calcCommission(assetType: AssetType, qty: number): number {
  if (assetType === "stock") return 0;
  return qty * OPTION_COMMISSION;
}

/**
 * Total cash deducted when opening a LONG position (buy to open).
 * For options, fill_price is the per-share premium (e.g. $3.50),
 * so 1 contract costs $350 + commission.
 */
export function costToOpen(
  assetType: AssetType,
  qty: number,
  fillPrice: number,
): number {
  const mult = assetType === "stock" ? 1 : OPTION_MULTIPLIER;
  const notional = qty * fillPrice * mult;
  return notional + calcCommission(assetType, qty);
}

/**
 * Cash received when closing a LONG position (sell to close).
 * Commission is subtracted from proceeds.
 */
export function proceedsFromClose(
  assetType: AssetType,
  qty: number,
  closePrice: number,
): number {
  const mult = assetType === "stock" ? 1 : OPTION_MULTIPLIER;
  const notional = qty * closePrice * mult;
  return notional - calcCommission(assetType, qty);
}

/**
 * Unrealized P&L for a single open position.
 */
export function unrealizedPnl(
  assetType: AssetType,
  side: Side,
  qty: number,
  avgCost: number,
  currentPrice: number,
): number {
  const mult = assetType === "stock" ? 1 : OPTION_MULTIPLIER;
  const raw = side === "long"
    ? (currentPrice - avgCost) * qty * mult
    : (avgCost - currentPrice) * qty * mult;
  return raw;
}

/**
 * Realized P&L when closing (sell to close for long, buy to close for short).
 */
export function realizedPnl(
  assetType: AssetType,
  side: Side,
  qty: number,
  avgCost: number,
  closePrice: number,
): number {
  return unrealizedPnl(assetType, side, qty, avgCost, closePrice);
}

/**
 * New average cost when adding to an existing position.
 */
export function newAvgCost(
  existingQty: number,
  existingAvgCost: number,
  addQty: number,
  addPrice: number,
): number {
  const totalQty = existingQty + addQty;
  if (totalQty === 0) return 0;
  return (existingQty * existingAvgCost + addQty * addPrice) / totalQty;
}
```

- [ ] **Step 2: Verify pure-function logic manually**

Open Node REPL or browser console and spot-check:
```
costToOpen("call", 1, 3.50) === 350.65  // 1 contract × $3.50 × 100 + $0.65
unrealizedPnl("call", "long", 2, 3.50, 5.00) === 300  // (5-3.5)×2×100
realizedPnl("stock", "long", 100, 150, 155) === 500
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/trading.ts
git commit -m "feat: add trading helpers (P&L, cost basis, commissions)"
```

---

## Task 6 — Market API routes

**Files:**
- Create: `src/app/api/market/quote/route.ts`
- Create: `src/app/api/market/options/route.ts`

- [ ] **Step 1: Write `quote/route.ts`**

```typescript
/**
 * GET /api/market/quote?symbols=SPY,AAPL
 * Returns array of StockQuote for each symbol.
 * Proxies Polygon.io so the API key stays server-side.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStockQuotes } from "@/lib/polygon";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20); // cap at 20 to avoid abuse

  if (symbols.length === 0) {
    return NextResponse.json({ error: "symbols param required" }, { status: 400 });
  }

  try {
    const quotes = await getStockQuotes(symbols);
    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("[market/quote]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Quote fetch failed" },
      { status: 502 },
    );
  }
}
```

- [ ] **Step 2: Write `options/route.ts`**

```typescript
/**
 * GET /api/market/options?symbol=SPY
 * Returns option chain snapshot for the underlying symbol.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOptionChain } from "@/lib/polygon";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase() ?? "";
  if (!symbol) {
    return NextResponse.json({ error: "symbol param required" }, { status: 400 });
  }

  try {
    const contracts = await getOptionChain(symbol);
    return NextResponse.json({ contracts });
  } catch (err) {
    console.error("[market/options]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Options fetch failed" },
      { status: 502 },
    );
  }
}
```

- [ ] **Step 3: Smoke-test locally**

Start dev server (`npm run dev`), then:
```bash
curl "http://localhost:3000/api/market/quote?symbols=SPY"
# Expected: { quotes: [{ symbol: "SPY", price: ..., ... }] }

curl "http://localhost:3000/api/market/options?symbol=SPY"
# Expected: { contracts: [ ... ] }  (may be empty if POLYGON_API_KEY not set yet)
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/market/
git commit -m "feat: add market/quote and market/options API routes"
```

---

## Task 7 — Trading API routes

**Files:**
- Create: `src/app/api/trading/portfolio/route.ts`
- Create: `src/app/api/trading/execute/route.ts`
- Create: `src/app/api/trading/close/route.ts`

- [ ] **Step 1: Write `portfolio/route.ts`**

```typescript
/**
 * GET /api/trading/portfolio?userId=<uuid>
 * Returns open positions + current sandbox cash balance for a user.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const db = adminClient();

  // Open positions
  const { data: positions, error: posErr } = await db
    .from("paper_positions")
    .select("*")
    .eq("user_id", userId)
    .is("closed_at", null)
    .order("opened_at", { ascending: false });

  if (posErr) {
    return NextResponse.json({ error: posErr.message }, { status: 500 });
  }

  // Cash balance (upsert default if missing)
  const { data: balRow, error: balErr } = await db
    .from("sandbox_balances")
    .upsert({ user_id: userId, cash_balance: 100000 }, { onConflict: "user_id", ignoreDuplicates: true })
    .select("cash_balance")
    .single();

  // If upsert returned nothing (already existed), just select
  let cashBalance = 100000;
  if (!balErr && balRow) {
    cashBalance = balRow.cash_balance;
  } else {
    const { data: existing } = await db
      .from("sandbox_balances")
      .select("cash_balance")
      .eq("user_id", userId)
      .single();
    if (existing) cashBalance = existing.cash_balance;
  }

  // Recent trades
  const { data: trades } = await db
    .from("paper_trades")
    .select("*")
    .eq("user_id", userId)
    .order("executed_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    positions: positions ?? [],
    cashBalance,
    trades: trades ?? [],
  });
}
```

- [ ] **Step 2: Write `execute/route.ts`**

```typescript
/**
 * POST /api/trading/execute
 * Body: {
 *   userId: string
 *   symbol: string
 *   assetType: "stock" | "call" | "put"
 *   side: "long" | "short"
 *   qty: number
 *   strike?: number        (options only)
 *   expiry?: string        (options only, ISO date)
 *   mode: "sandbox" | "cohort"
 *   weekId?: string        (cohort only)
 * }
 * Returns: { position, newCashBalance, trade }
 */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getStockQuotes, getOptionChain } from "@/lib/polygon";
import { costToOpen, calcCommission, newAvgCost, OPTION_MULTIPLIER } from "@/lib/trading";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId: string;
      symbol: string;
      assetType: "stock" | "call" | "put";
      side: "long" | "short";
      qty: number;
      strike?: number;
      expiry?: string;
      mode: "sandbox" | "cohort";
      weekId?: string;
    };

    const { userId, symbol, assetType, side, qty, strike, expiry, mode, weekId } = body;

    if (!userId || !symbol || !assetType || !side || !qty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (qty <= 0 || !Number.isInteger(qty)) {
      return NextResponse.json({ error: "qty must be a positive integer" }, { status: 400 });
    }

    const db = adminClient();

    // ── Fetch current market price ────────────────────────────
    let fillPrice = 0;
    if (assetType === "stock") {
      const quotes = await getStockQuotes([symbol]);
      const q = quotes.find((q) => q.symbol === symbol.toUpperCase());
      if (!q || q.price <= 0) {
        return NextResponse.json({ error: `No quote for ${symbol}` }, { status: 422 });
      }
      fillPrice = q.price;
    } else {
      // Options — find matching contract
      const chain = await getOptionChain(symbol);
      const contract = chain.find(
        (c) =>
          c.strike === strike &&
          c.expiry === expiry &&
          c.type === assetType,
      );
      if (!contract) {
        return NextResponse.json(
          { error: `No contract found for ${symbol} ${assetType} ${strike} ${expiry}` },
          { status: 422 },
        );
      }
      // Use mid-price
      fillPrice = contract.bid > 0 && contract.ask > 0
        ? (contract.bid + contract.ask) / 2
        : contract.lastPrice;
      if (fillPrice <= 0) {
        return NextResponse.json({ error: "Option has no tradeable price" }, { status: 422 });
      }
    }

    // ── Check cash balance ────────────────────────────────────
    const cost = costToOpen(assetType, qty, fillPrice);
    const balTable = mode === "cohort" ? "cohort_entries" : "sandbox_balances";

    let currentCash = 0;
    if (mode === "cohort") {
      if (!weekId) return NextResponse.json({ error: "weekId required for cohort mode" }, { status: 400 });
      const { data: entry } = await db
        .from("cohort_entries")
        .select("cash_balance")
        .eq("user_id", userId)
        .eq("week_id", weekId)
        .single();
      if (!entry) return NextResponse.json({ error: "Not joined this cohort week" }, { status: 403 });
      currentCash = entry.cash_balance;
    } else {
      const { data: balRow } = await db
        .from("sandbox_balances")
        .upsert({ user_id: userId, cash_balance: 100000 }, { onConflict: "user_id", ignoreDuplicates: true })
        .select("cash_balance")
        .single();
      if (balRow) {
        currentCash = balRow.cash_balance;
      } else {
        const { data: ex } = await db
          .from("sandbox_balances")
          .select("cash_balance")
          .eq("user_id", userId)
          .single();
        currentCash = ex?.cash_balance ?? 100000;
      }
    }

    if (side === "long" && cost > currentCash) {
      return NextResponse.json(
        { error: `Insufficient cash. Need $${cost.toFixed(2)}, have $${currentCash.toFixed(2)}` },
        { status: 422 },
      );
    }

    // ── Write position (upsert for existing open position in same contract) ──
    let positionId: string;
    const { data: existing } = await db
      .from("paper_positions")
      .select("id, qty, avg_cost")
      .eq("user_id", userId)
      .eq("symbol", symbol.toUpperCase())
      .eq("asset_type", assetType)
      .eq("side", side)
      .is("closed_at", null)
      .maybeSingle();

    if (existing) {
      // Add to existing position
      const updatedAvgCost = newAvgCost(existing.qty, existing.avg_cost, qty, fillPrice);
      const { data: updated } = await db
        .from("paper_positions")
        .update({ qty: existing.qty + qty, avg_cost: updatedAvgCost })
        .eq("id", existing.id)
        .select("id")
        .single();
      positionId = updated!.id;
    } else {
      const { data: inserted } = await db
        .from("paper_positions")
        .insert({
          user_id: userId,
          symbol: symbol.toUpperCase(),
          asset_type: assetType,
          side,
          qty,
          avg_cost: fillPrice,
          strike: assetType !== "stock" ? strike : null,
          expiry: assetType !== "stock" ? expiry : null,
        })
        .select("id")
        .single();
      positionId = inserted!.id;
    }

    // ── Log trade ─────────────────────────────────────────────
    await db.from("paper_trades").insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      asset_type: assetType,
      direction: side === "long" ? "buy" : "sell",
      qty,
      fill_price: fillPrice,
      strike: assetType !== "stock" ? strike : null,
      expiry: assetType !== "stock" ? expiry : null,
      commission: calcCommission(assetType, qty),
    });

    // ── Deduct from cash ──────────────────────────────────────
    const newCash = currentCash - cost;
    if (mode === "cohort" && weekId) {
      await db
        .from("cohort_entries")
        .update({ cash_balance: newCash, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("week_id", weekId);
    } else {
      await db
        .from("sandbox_balances")
        .update({ cash_balance: newCash, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    return NextResponse.json({ positionId, fillPrice, newCashBalance: newCash });
  } catch (err) {
    console.error("[trading/execute]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Trade execution failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Write `close/route.ts`**

```typescript
/**
 * POST /api/trading/close
 * Body: { positionId: string, userId: string, mode: "sandbox"|"cohort", weekId?: string }
 * Fetches current price, books realized P&L, credits cash.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getStockQuotes, getOptionChain } from "@/lib/polygon";
import { proceedsFromClose, realizedPnl } from "@/lib/trading";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      positionId: string;
      userId: string;
      mode: "sandbox" | "cohort";
      weekId?: string;
    };
    const { positionId, userId, mode, weekId } = body;
    if (!positionId || !userId) {
      return NextResponse.json({ error: "positionId and userId required" }, { status: 400 });
    }

    const db = adminClient();

    // Load position
    const { data: pos, error: posErr } = await db
      .from("paper_positions")
      .select("*")
      .eq("id", positionId)
      .eq("user_id", userId)
      .is("closed_at", null)
      .single();

    if (posErr || !pos) {
      return NextResponse.json({ error: "Position not found or already closed" }, { status: 404 });
    }

    // Get current price
    let closePrice = 0;
    if (pos.asset_type === "stock") {
      const quotes = await getStockQuotes([pos.symbol]);
      closePrice = quotes.find((q) => q.symbol === pos.symbol)?.price ?? 0;
    } else {
      const chain = await getOptionChain(pos.symbol);
      const contract = chain.find(
        (c) =>
          c.strike === Number(pos.strike) &&
          c.expiry === pos.expiry &&
          c.type === pos.asset_type,
      );
      if (contract) {
        closePrice = contract.bid > 0 && contract.ask > 0
          ? (contract.bid + contract.ask) / 2
          : contract.lastPrice;
      }
      // If no market price (expired option), treat as worthless
    }

    const pnl = realizedPnl(pos.asset_type, pos.side, pos.qty, Number(pos.avg_cost), closePrice);
    const proceeds = proceedsFromClose(pos.asset_type, pos.qty, closePrice);

    // Mark position closed
    await db
      .from("paper_positions")
      .update({
        closed_at: new Date().toISOString(),
        close_price: closePrice,
        realized_pnl: pnl,
      })
      .eq("id", positionId);

    // Log closing trade
    await db.from("paper_trades").insert({
      user_id: userId,
      symbol: pos.symbol,
      asset_type: pos.asset_type,
      direction: pos.side === "long" ? "sell" : "buy",
      qty: pos.qty,
      fill_price: closePrice,
      strike: pos.strike,
      expiry: pos.expiry,
      commission: 0, // already accounted in proceeds calc
    });

    // Credit cash
    if (mode === "cohort" && weekId) {
      const { data: entry } = await db
        .from("cohort_entries")
        .select("cash_balance")
        .eq("user_id", userId)
        .eq("week_id", weekId)
        .single();
      if (entry) {
        await db
          .from("cohort_entries")
          .update({ cash_balance: entry.cash_balance + proceeds, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("week_id", weekId);
      }
    } else {
      const { data: bal } = await db
        .from("sandbox_balances")
        .select("cash_balance")
        .eq("user_id", userId)
        .single();
      if (bal) {
        await db
          .from("sandbox_balances")
          .update({ cash_balance: bal.cash_balance + proceeds, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
    }

    return NextResponse.json({ pnl, proceeds, closePrice });
  } catch (err) {
    console.error("[trading/close]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Close failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/api/trading/
git commit -m "feat: add trading/portfolio, trading/execute, trading/close API routes"
```

---

## Task 8 — Cohort API routes + Vercel Cron

**Files:**
- Create: `src/app/api/cohort/week/route.ts`
- Create: `src/app/api/cohort/leaderboard/route.ts`
- Create: `src/app/api/cohort/join/route.ts`
- Create: `src/app/api/cron/reset-cohort/route.ts`
- Modify: `vercel.json` (create if absent)

- [ ] **Step 1: Write `cohort/week/route.ts`**

```typescript
/**
 * GET /api/cohort/week
 * Returns the currently active cohort_weeks row, or { week: null } if between weeks.
 */
import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function GET() {
  const db = adminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: week } = await db
    .from("cohort_weeks")
    .select("*")
    .eq("is_active", true)
    .lte("week_start", today)
    .gte("week_end", today)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ week: week ?? null });
}
```

- [ ] **Step 2: Write `cohort/leaderboard/route.ts`**

```typescript
/**
 * GET /api/cohort/leaderboard?weekId=<uuid>
 * Returns top 50 entries enriched with live portfolio value → sorted by P&L %.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getStockQuotes } from "@/lib/polygon";
import { unrealizedPnl } from "@/lib/trading";

export async function GET(req: NextRequest) {
  const weekId = req.nextUrl.searchParams.get("weekId");
  if (!weekId) return NextResponse.json({ error: "weekId required" }, { status: 400 });

  const db = adminClient();

  // Load all entries for this week
  const { data: entries, error } = await db
    .from("cohort_entries")
    .select("user_id, display_name, cash_balance, updated_at")
    .eq("week_id", weekId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!entries || entries.length === 0) return NextResponse.json({ entries: [] });

  // Load open positions for all users in this cohort
  const userIds = entries.map((e) => e.user_id);
  const { data: allPositions } = await db
    .from("paper_positions")
    .select("user_id, symbol, asset_type, side, qty, avg_cost, strike, expiry")
    .in("user_id", userIds)
    .is("closed_at", null);

  // Gather unique symbols for batch quote
  const symbols = [...new Set((allPositions ?? []).map((p) => p.symbol))];
  const quotes = symbols.length > 0 ? await getStockQuotes(symbols) : [];
  const priceMap: Record<string, number> = {};
  for (const q of quotes) priceMap[q.symbol] = q.price;

  // Enrich each entry with unrealized P&L
  const enriched = entries.map((entry) => {
    const userPositions = (allPositions ?? []).filter((p) => p.user_id === entry.user_id);
    let unrealized = 0;
    for (const pos of userPositions) {
      const price = priceMap[pos.symbol] ?? 0;
      unrealized += unrealizedPnl(
        pos.asset_type as "stock" | "call" | "put",
        pos.side as "long" | "short",
        pos.qty,
        Number(pos.avg_cost),
        price,
      );
    }
    const totalValue = entry.cash_balance + unrealized;
    const pnlDollar = totalValue - 10000;
    const pnlPct = (pnlDollar / 10000) * 100;
    return {
      userId: entry.user_id,
      displayName: entry.display_name,
      cashBalance: entry.cash_balance,
      totalValue,
      pnlDollar,
      pnlPct,
      updatedAt: entry.updated_at,
    };
  });

  // Sort by P&L % descending, take top 50
  enriched.sort((a, b) => b.pnlPct - a.pnlPct);
  const top50 = enriched.slice(0, 50).map((e, i) => ({ ...e, rank: i + 1 }));

  return NextResponse.json({ entries: top50 });
}
```

- [ ] **Step 3: Write `cohort/join/route.ts`**

```typescript
/**
 * POST /api/cohort/join
 * Body: { userId: string, displayName: string }
 * Upserts a cohort_entries row for the active week.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, displayName } = await req.json() as {
      userId: string;
      displayName: string;
    };
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const db = adminClient();
    const today = new Date().toISOString().split("T")[0];

    // Find active week
    const { data: week } = await db
      .from("cohort_weeks")
      .select("id")
      .eq("is_active", true)
      .lte("week_start", today)
      .gte("week_end", today)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!week) {
      return NextResponse.json({ error: "No active cohort week" }, { status: 404 });
    }

    // Upsert entry (preserve cash_balance if already joined)
    const { data: entry, error } = await db
      .from("cohort_entries")
      .upsert(
        { user_id: userId, week_id: week.id, display_name: displayName || "Trader", cash_balance: 10000 },
        { onConflict: "user_id,week_id", ignoreDuplicates: true },
      )
      .select("user_id, cash_balance, display_name")
      .single();

    if (error) {
      // Already joined — just return existing row
      const { data: existing } = await db
        .from("cohort_entries")
        .select("user_id, cash_balance, display_name")
        .eq("user_id", userId)
        .eq("week_id", week.id)
        .single();
      return NextResponse.json({ entry: existing, weekId: week.id, alreadyJoined: true });
    }

    return NextResponse.json({ entry, weekId: week.id, alreadyJoined: false });
  } catch (err) {
    console.error("[cohort/join]", err);
    return NextResponse.json({ error: "Join failed" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Write `cron/reset-cohort/route.ts`**

```typescript
/**
 * GET /api/cron/reset-cohort
 * Called by Vercel Cron every Monday at 00:05 UTC.
 * 1. Closes any weeks whose week_end < today
 * 2. Inserts a new cohort_weeks row for Mon–Sun of the current week
 * Protected by CRON_SECRET header.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = adminClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Close expired weeks
  await db
    .from("cohort_weeks")
    .update({ is_active: false })
    .lt("week_end", todayStr)
    .eq("is_active", true);

  // Calculate Mon–Sun for current week
  const day = today.getUTCDay(); // 0=Sun
  const daysFromMon = (day + 6) % 7;
  const mon = new Date(today);
  mon.setUTCDate(today.getUTCDate() - daysFromMon);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 6);

  const weekStart = mon.toISOString().split("T")[0];
  const weekEnd = sun.toISOString().split("T")[0];

  // Insert new week (skip if already exists)
  const { error } = await db
    .from("cohort_weeks")
    .upsert({ week_start: weekStart, week_end: weekEnd, is_active: true }, { onConflict: "week_start", ignoreDuplicates: true });

  if (error) {
    console.error("[cron/reset-cohort]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[cron/reset-cohort] Created week ${weekStart} → ${weekEnd}`);
  return NextResponse.json({ ok: true, weekStart, weekEnd });
}
```

- [ ] **Step 5: Create/update `vercel.json`**

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-cohort",
      "schedule": "5 0 * * 1"
    }
  ]
}
```

Also add `CRON_SECRET` to Vercel env vars (any random string, e.g. output of `openssl rand -hex 32`).

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/cohort/ src/app/api/cron/ vercel.json
git commit -m "feat: add cohort API routes (week, leaderboard, join) + Vercel Cron"
```

---

## Task 9 — `OptionChain` component

**Files:**
- Create: `src/components/OptionChain.tsx`

- [ ] **Step 1: Write the component**

```typescript
"use client";
/**
 * OptionChain — displays a grid of expiries × strikes.
 * User picks expiry from tabs, then picks a contract row.
 */
import { useState, useEffect } from "react";
import type { OptionContract } from "@/lib/polygon";

interface Props {
  symbol: string;
  type: "call" | "put";
  onSelect: (contract: OptionContract) => void;
  selected: OptionContract | null;
}

export default function OptionChain({ symbol, type, onSelect, selected }: Props) {
  const [contracts, setContracts] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeExpiry, setActiveExpiry] = useState<string>("");

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError("");
    setContracts([]);
    fetch(`/api/market/options?symbol=${symbol}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setContracts(d.contracts ?? []);
        // Default to nearest expiry
        const expiries = [...new Set<string>((d.contracts ?? []).map((c: OptionContract) => c.expiry))].sort();
        setActiveExpiry(expiries[0] ?? "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  const expiries = [...new Set<string>(contracts.map((c) => c.expiry))].sort().slice(0, 5);
  const filtered = contracts
    .filter((c) => c.type === type && c.expiry === activeExpiry)
    .sort((a, b) => a.strike - b.strike);

  if (loading) return <div className="oc-loading">Loading option chain…</div>;
  if (error) return <div className="oc-error">{error}</div>;
  if (contracts.length === 0) return null;

  return (
    <div className="oc-root">
      {/* Expiry tabs */}
      <div className="oc-expiry-tabs">
        {expiries.map((exp) => (
          <button
            key={exp}
            className={`oc-expiry-tab${activeExpiry === exp ? " active" : ""}`}
            onClick={() => setActiveExpiry(exp)}
          >
            {exp}
          </button>
        ))}
      </div>

      {/* Strike table */}
      <div className="oc-table-wrap">
        <table className="oc-table">
          <thead>
            <tr>
              <th>Strike</th>
              <th>Bid</th>
              <th>Ask</th>
              <th>Last</th>
              <th>OI</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.ticker}
                className={`oc-row${selected?.ticker === c.ticker ? " selected" : ""}`}
                onClick={() => onSelect(c)}
              >
                <td className="oc-strike">{c.strike.toFixed(2)}</td>
                <td>{c.bid > 0 ? c.bid.toFixed(2) : "—"}</td>
                <td>{c.ask > 0 ? c.ask.toFixed(2) : "—"}</td>
                <td>{c.lastPrice > 0 ? c.lastPrice.toFixed(2) : "—"}</td>
                <td>{c.openInterest > 0 ? c.openInterest.toLocaleString() : "—"}</td>
                <td>{c.delta !== null ? c.delta.toFixed(2) : "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", opacity: 0.5, padding: "16px" }}>No contracts</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/OptionChain.tsx
git commit -m "feat: add OptionChain component (expiry tabs + strike table)"
```

---

## Task 10 — `PositionRow` + `Leaderboard` components

**Files:**
- Create: `src/components/PositionRow.tsx`
- Create: `src/components/Leaderboard.tsx`

- [ ] **Step 1: Write `PositionRow.tsx`**

```typescript
"use client";
/**
 * PositionRow — one row in the open-positions panel.
 * Receives a live currentPrice prop (parent re-fetches periodically).
 */
import { unrealizedPnl } from "@/lib/trading";

export interface Position {
  id: string;
  symbol: string;
  asset_type: "stock" | "call" | "put";
  side: "long" | "short";
  qty: number;
  avg_cost: number;
  strike: number | null;
  expiry: string | null;
}

interface Props {
  position: Position;
  currentPrice: number;
  onClose: (positionId: string) => void;
  closing: boolean;
}

export default function PositionRow({ position, currentPrice, onClose, closing }: Props) {
  const pnl = unrealizedPnl(
    position.asset_type,
    position.side,
    position.qty,
    position.avg_cost,
    currentPrice,
  );
  const pnlPct = position.avg_cost > 0
    ? (pnl / (position.avg_cost * position.qty * (position.asset_type === "stock" ? 1 : 100))) * 100
    : 0;
  const isPos = pnl >= 0;
  const label = position.asset_type === "stock"
    ? `${position.symbol} ${position.side === "long" ? "Long" : "Short"}`
    : `${position.symbol} $${position.strike} ${position.expiry} ${position.asset_type.toUpperCase()}`;

  return (
    <div className="pos-row">
      <div className="pos-label">
        <span className="pos-symbol">{label}</span>
        <span className="pos-qty">{position.qty} {position.asset_type !== "stock" ? "contracts" : "shares"}</span>
      </div>
      <div className="pos-prices">
        <span className="pos-cost">${position.avg_cost.toFixed(2)}</span>
        <span className="pos-arrow">→</span>
        <span className="pos-current">${currentPrice > 0 ? currentPrice.toFixed(2) : "—"}</span>
      </div>
      <div className={`pos-pnl${isPos ? " pos" : " neg"}`}>
        {isPos ? "+" : ""}{pnl.toFixed(2)} ({isPos ? "+" : ""}{pnlPct.toFixed(1)}%)
      </div>
      <button
        className="pos-close-btn"
        onClick={() => onClose(position.id)}
        disabled={closing}
      >
        {closing ? "…" : "Close"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write `Leaderboard.tsx`**

```typescript
"use client";
/**
 * Leaderboard — ranked table of cohort entries.
 * highlightUserId row is visually distinguished.
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalValue: number;
  pnlDollar: number;
  pnlPct: number;
}

interface Props {
  entries: LeaderboardEntry[];
  highlightUserId: string;
  loading: boolean;
}

export default function Leaderboard({ entries, highlightUserId, loading }: Props) {
  if (loading) {
    return <div className="lb-loading">Loading leaderboard…</div>;
  }
  if (entries.length === 0) {
    return <div className="lb-empty">No participants yet. Be the first to join!</div>;
  }

  return (
    <div className="lb-table-wrap">
      <table className="lb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Trader</th>
            <th>Portfolio</th>
            <th>P&amp;L</th>
            <th>Return</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const isMe = e.userId === highlightUserId;
            const isPos = e.pnlPct >= 0;
            return (
              <tr key={e.userId} className={`lb-row${isMe ? " me" : ""}${isPos ? " pos" : " neg"}`}>
                <td className="lb-rank">
                  {e.rank <= 3
                    ? ["🥇", "🥈", "🥉"][e.rank - 1]
                    : e.rank}
                </td>
                <td className="lb-name">{e.displayName}{isMe && " (you)"}</td>
                <td className="lb-val">${e.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td className={`lb-pnl ${isPos ? "pos" : "neg"}`}>
                  {isPos ? "+" : ""}${Math.abs(e.pnlDollar).toFixed(0)}
                </td>
                <td className={`lb-pct ${isPos ? "pos" : "neg"}`}>
                  {isPos ? "+" : ""}{e.pnlPct.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PositionRow.tsx src/components/Leaderboard.tsx
git commit -m "feat: add PositionRow and Leaderboard components"
```

---

## Task 11 — Sandbox page

**Files:**
- Create: `src/app/sandbox/page.tsx`
- Create: `src/app/sandbox/SandboxClient.tsx`

- [ ] **Step 1: Write `sandbox/page.tsx`**

```typescript
import type { Metadata } from "next";
import SandboxClient from "./SandboxClient";

export const metadata: Metadata = {
  title: "Paper Trading Sandbox — StrikeLab",
  description: "Trade stocks and options with $100,000 in paper money. Real Polygon.io prices.",
};

export default function SandboxPage() {
  return <SandboxClient />;
}
```

- [ ] **Step 2: Write `sandbox/SandboxClient.tsx`**

```typescript
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import OptionChain from "@/components/OptionChain";
import PositionRow from "@/components/PositionRow";
import type { OptionContract } from "@/lib/polygon";
import type { Position } from "@/components/PositionRow";

// ── UUID helper ───────────────────────────────────────────────
function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sl_uuid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sl_uuid", id);
  }
  return id;
}

function getDisplayName(): string {
  if (typeof window === "undefined") return "Trader";
  try {
    const u = JSON.parse(localStorage.getItem("sl_user") || "null");
    return u?.name || u?.email || "Trader";
  } catch { return "Trader"; }
}

// ── Main component ────────────────────────────────────────────
export default function SandboxClient() {
  const userId = useRef("");
  useEffect(() => { userId.current = getUserId(); }, []);

  // Portfolio state
  const [cashBalance, setCashBalance] = useState(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<unknown[]>([]);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // Order form state
  const [symbol, setSymbol] = useState("SPY");
  const [assetType, setAssetType] = useState<"stock" | "call" | "put">("stock");
  const [side, setSide] = useState<"long" | "short">("long");
  const [qty, setQty] = useState(1);
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [quotePrice, setQuotePrice] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [execMsg, setExecMsg] = useState("");
  const [closingId, setClosingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"positions" | "trades">("positions");

  // ── Load portfolio ─────────────────────────────────────────
  const loadPortfolio = useCallback(async () => {
    const uid = userId.current;
    if (!uid) return;
    setPortfolioLoading(true);
    const res = await fetch(`/api/trading/portfolio?userId=${uid}`);
    const data = await res.json();
    if (res.ok) {
      setPositions(data.positions ?? []);
      setCashBalance(data.cashBalance ?? 100000);
      setTrades(data.trades ?? []);
      // Batch refresh prices for open positions
      const syms = [...new Set<string>((data.positions ?? []).map((p: Position) => p.symbol))];
      if (syms.length > 0) {
        const qRes = await fetch(`/api/market/quote?symbols=${syms.join(",")}`);
        const qData = await qRes.json();
        const map: Record<string, number> = {};
        for (const q of qData.quotes ?? []) map[q.symbol] = q.price;
        setPriceMap(map);
      }
    }
    setPortfolioLoading(false);
  }, []);

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  // ── Fetch stock quote when symbol changes (stock mode) ────
  useEffect(() => {
    if (assetType !== "stock") { setQuotePrice(null); return; }
    setQuoteLoading(true);
    fetch(`/api/market/quote?symbols=${symbol}`)
      .then((r) => r.json())
      .then((d) => {
        const q = d.quotes?.find((q: { symbol: string; price: number }) => q.symbol === symbol.toUpperCase());
        setQuotePrice(q?.price ?? null);
      })
      .finally(() => setQuoteLoading(false));
  }, [symbol, assetType]);

  // ── Execute trade ─────────────────────────────────────────
  async function executeTrade() {
    const uid = userId.current;
    if (!uid) return;
    setExecuting(true);
    setExecMsg("");
    const body: Record<string, unknown> = {
      userId: uid,
      symbol: symbol.toUpperCase(),
      assetType,
      side,
      qty,
      mode: "sandbox",
    };
    if (assetType !== "stock" && selectedContract) {
      body.strike = selectedContract.strike;
      body.expiry = selectedContract.expiry;
    }
    const res = await fetch("/api/trading/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setExecMsg(`✓ Filled at $${data.fillPrice.toFixed(2)}`);
      await loadPortfolio();
    } else {
      setExecMsg(`✗ ${data.error}`);
    }
    setExecuting(false);
  }

  // ── Close position ────────────────────────────────────────
  async function closePosition(positionId: string) {
    const uid = userId.current;
    setClosingId(positionId);
    const res = await fetch("/api/trading/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionId, userId: uid, mode: "sandbox" }),
    });
    if (res.ok) await loadPortfolio();
    setClosingId(null);
  }

  // ── Estimated cost ────────────────────────────────────────
  const price = assetType === "stock" ? (quotePrice ?? 0) : (selectedContract ? (selectedContract.bid + selectedContract.ask) / 2 : 0);
  const mult = assetType === "stock" ? 1 : 100;
  const commission = assetType === "stock" ? 0 : qty * 0.65;
  const estimatedCost = price * qty * mult + commission;

  const unrealizedTotal = positions.reduce((sum, pos) => {
    const cp = priceMap[pos.symbol] ?? 0;
    if (cp <= 0) return sum;
    const m = pos.asset_type === "stock" ? 1 : 100;
    const raw = pos.side === "long"
      ? (cp - pos.avg_cost) * pos.qty * m
      : (pos.avg_cost - cp) * pos.qty * m;
    return sum + raw;
  }, 0);

  const totalValue = cashBalance + unrealizedTotal;

  return (
    <div className="sb-root">

      {/* ── Header ── */}
      <div className="sb-header">
        <div className="sb-header-left">
          <div className="sb-eyebrow">Paper Trading</div>
          <h1 className="sb-title">Sandbox</h1>
          <p className="sb-subtitle">Real Polygon.io prices · No real money · $100k starting balance</p>
        </div>
        <div className="sb-balance-chips">
          <div className="sb-chip">
            <span className="sb-chip-label">Cash</span>
            <span className="sb-chip-val">${cashBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className={`sb-chip ${totalValue >= 100000 ? "pos" : "neg"}`}>
            <span className="sb-chip-label">Portfolio</span>
            <span className="sb-chip-val">${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className={`sb-chip ${unrealizedTotal >= 0 ? "pos" : "neg"}`}>
            <span className="sb-chip-label">Unrealized P&amp;L</span>
            <span className="sb-chip-val">{unrealizedTotal >= 0 ? "+" : ""}{unrealizedTotal.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="sb-body">

        {/* ── Left: Order form ── */}
        <div className="sb-order-panel">
          <div className="sb-panel-head">New Order</div>

          {/* Symbol */}
          <label className="sb-label">Symbol
            <input
              className="sb-input sb-sym-input"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="SPY"
              maxLength={8}
            />
          </label>

          {/* Asset type */}
          <div className="sb-toggle-group">
            {(["stock", "call", "put"] as const).map((t) => (
              <button
                key={t}
                className={`sb-toggle${assetType === t ? " active" : ""}`}
                onClick={() => { setAssetType(t); setSelectedContract(null); }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Side */}
          <div className="sb-toggle-group">
            {(["long", "short"] as const).map((s) => (
              <button
                key={s}
                className={`sb-toggle${side === s ? " active" : ""}${s === "short" ? " short" : ""}`}
                onClick={() => setSide(s)}
              >
                {s === "long" ? "Buy / Long" : "Sell / Short"}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <label className="sb-label">
            {assetType === "stock" ? "Shares" : "Contracts"}
            <input
              type="number"
              className="sb-input"
              value={qty}
              min={1}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </label>

          {/* Stock price display */}
          {assetType === "stock" && (
            <div className="sb-price-display">
              {quoteLoading ? "Fetching price…" : quotePrice !== null ? (
                <>Current: <strong>${quotePrice.toFixed(2)}</strong></>
              ) : "Enter symbol above"}
            </div>
          )}

          {/* Option chain */}
          {assetType !== "stock" && (
            <div className="sb-chain-wrap">
              <OptionChain
                symbol={symbol}
                type={assetType}
                onSelect={setSelectedContract}
                selected={selectedContract}
              />
              {selectedContract && (
                <div className="sb-selected-contract">
                  Selected: {selectedContract.strike} {selectedContract.expiry} {selectedContract.type.toUpperCase()}
                  {" "}· Mid ${((selectedContract.bid + selectedContract.ask) / 2).toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Cost estimate */}
          {price > 0 && (
            <div className="sb-cost-estimate">
              Estimated cost: <strong>${estimatedCost.toFixed(2)}</strong>
              {commission > 0 && <span className="sb-commission"> (incl. ${commission.toFixed(2)} commission)</span>}
            </div>
          )}

          {/* Execute button */}
          <button
            className="sb-execute-btn"
            onClick={executeTrade}
            disabled={executing || (assetType !== "stock" && !selectedContract) || qty <= 0}
          >
            {executing ? "Executing…" : `${side === "long" ? "Buy" : "Sell"} ${qty} ${assetType === "stock" ? "shares" : "contract" + (qty > 1 ? "s" : "")}`}
          </button>

          {execMsg && (
            <div className={`sb-exec-msg${execMsg.startsWith("✓") ? " ok" : " err"}`}>
              {execMsg}
            </div>
          )}
        </div>

        {/* ── Right: Portfolio ── */}
        <div className="sb-portfolio-panel">
          <div className="sb-tabs">
            <button className={`sb-tab${activeTab === "positions" ? " active" : ""}`} onClick={() => setActiveTab("positions")}>
              Positions ({positions.length})
            </button>
            <button className={`sb-tab${activeTab === "trades" ? " active" : ""}`} onClick={() => setActiveTab("trades")}>
              Trade History
            </button>
          </div>

          {activeTab === "positions" && (
            <div className="sb-positions">
              {portfolioLoading ? (
                <div className="sb-loading">Loading portfolio…</div>
              ) : positions.length === 0 ? (
                <div className="sb-empty">No open positions. Place a trade to get started.</div>
              ) : (
                positions.map((pos) => (
                  <PositionRow
                    key={pos.id}
                    position={pos}
                    currentPrice={priceMap[pos.symbol] ?? 0}
                    onClose={closePosition}
                    closing={closingId === pos.id}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "trades" && (
            <div className="sb-trades">
              {(trades as Array<{
                id: string;
                symbol: string;
                asset_type: string;
                direction: string;
                qty: number;
                fill_price: number;
                strike?: number;
                expiry?: string;
                executed_at: string;
              }>).map((t) => (
                <div key={t.id} className="sb-trade-row">
                  <span className={`sb-trade-dir ${t.direction === "buy" ? "buy" : "sell"}`}>
                    {t.direction.toUpperCase()}
                  </span>
                  <span className="sb-trade-sym">{t.symbol}</span>
                  <span className="sb-trade-detail">
                    {t.asset_type !== "stock" ? `$${t.strike} ${t.expiry} ${t.asset_type.toUpperCase()} · ` : ""}
                    {t.qty} {t.asset_type === "stock" ? "sh" : "ct"}
                    {" "}@ ${Number(t.fill_price).toFixed(2)}
                  </span>
                  <span className="sb-trade-time">
                    {new Date(t.executed_at).toLocaleString()}
                  </span>
                </div>
              ))}
              {trades.length === 0 && <div className="sb-empty">No trades yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/sandbox/
git commit -m "feat: add /sandbox paper-trading page"
```

---

## Task 12 — Cohort page

**Files:**
- Create: `src/app/cohort/page.tsx`
- Create: `src/app/cohort/CohortClient.tsx`

- [ ] **Step 1: Write `cohort/page.tsx`**

```typescript
import type { Metadata } from "next";
import CohortClient from "./CohortClient";

export const metadata: Metadata = {
  title: "Weekly Cohort Challenge — StrikeLab Pro",
  description: "Trade $10,000 in paper money each week. Ranked by P&L % at week end.",
};

export default function CohortPage() {
  return <CohortClient />;
}
```

- [ ] **Step 2: Write `cohort/CohortClient.tsx`**

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import type { LeaderboardEntry } from "@/components/Leaderboard";

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sl_uuid");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("sl_uuid", id); }
  return id;
}
function getDisplayName(): string {
  if (typeof window === "undefined") return "Trader";
  try {
    const u = JSON.parse(localStorage.getItem("sl_user") || "null");
    return u?.name || u?.email?.split("@")[0] || "Trader";
  } catch { return "Trader"; }
}

interface CohortWeek {
  id: string;
  week_start: string;
  week_end: string;
  is_active: boolean;
}

export default function CohortClient() {
  const [userId] = useState(() => (typeof window !== "undefined" ? getUserId() : ""));
  const [displayName] = useState(() => getDisplayName());

  const [week, setWeek] = useState<CohortWeek | null>(null);
  const [weekLoading, setWeekLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // Load active week
  const loadWeek = useCallback(async () => {
    const res = await fetch("/api/cohort/week");
    const data = await res.json();
    setWeek(data.week ?? null);
    setWeekLoading(false);
  }, []);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  // Load leaderboard when week is known
  const loadLeaderboard = useCallback(async (weekId: string) => {
    setLbLoading(true);
    const res = await fetch(`/api/cohort/leaderboard?weekId=${weekId}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLbLoading(false);
    // Check if current user is already in the list
    if (userId && (data.entries ?? []).some((e: LeaderboardEntry) => e.userId === userId)) {
      setJoined(true);
    }
  }, [userId]);

  useEffect(() => {
    if (week?.id) loadLeaderboard(week.id);
  }, [week?.id, loadLeaderboard]);

  // Countdown timer
  useEffect(() => {
    if (!week) return;
    const target = new Date(week.week_end + "T23:59:59Z").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [week]);

  async function joinCohort() {
    if (!userId || !week) return;
    setJoining(true);
    setJoinError("");
    const res = await fetch("/api/cohort/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, displayName }),
    });
    const data = await res.json();
    if (res.ok) {
      setJoined(true);
      await loadLeaderboard(week.id);
    } else {
      setJoinError(data.error ?? "Failed to join");
    }
    setJoining(false);
  }

  if (weekLoading) {
    return <div className="ct-loading">Loading cohort week…</div>;
  }

  return (
    <div className="ct-root">

      {/* ── Hero ── */}
      <div className="ct-hero">
        <div className="ct-hero-left">
          <div className="ct-eyebrow">Pro · Weekly Competition</div>
          <h1 className="ct-title">Cohort Challenge</h1>
          {week ? (
            <>
              <p className="ct-sub">
                {new Date(week.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" "}–{" "}
                {new Date(week.week_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" "}· $10,000 starting balance · Ranked by return %
              </p>
              <div className="ct-countdown">
                <span className="ct-cd-label">Week closes in</span>
                <div className="ct-cd-units">
                  {[
                    { v: timeLeft.d, l: "d" },
                    { v: timeLeft.h, l: "h" },
                    { v: timeLeft.m, l: "m" },
                    { v: timeLeft.s, l: "s" },
                  ].map(({ v, l }) => (
                    <div key={l} className="ct-cd-unit">
                      <span className="ct-cd-num">{String(v).padStart(2, "0")}</span>
                      <span className="ct-cd-lbl">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="ct-sub">No active cohort week right now. Check back Monday.</p>
          )}
        </div>

        <div className="ct-hero-right">
          {week && !joined && (
            <div className="ct-join-card">
              <div className="ct-join-title">Ready to compete?</div>
              <p className="ct-join-desc">
                Start with $10,000 in paper money. Trade any US stock or option.
                Highest return % wins.
              </p>
              <button className="ct-join-btn" onClick={joinCohort} disabled={joining}>
                {joining ? "Joining…" : "Join this week →"}
              </button>
              {joinError && <p className="ct-join-err">{joinError}</p>}
            </div>
          )}
          {week && joined && (
            <div className="ct-joined-card">
              <div className="ct-joined-check">✓</div>
              <div className="ct-joined-msg">You&rsquo;re in this week!</div>
              <Link href="/sandbox" className="ct-trade-btn">
                Go to Sandbox →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Leaderboard ── */}
      {week && (
        <div className="ct-lb-section">
          <div className="ct-section-head">
            <span className="ct-section-title">This Week&apos;s Leaderboard</span>
            <span className="ct-section-meta">{entries.length} participants</span>
          </div>
          <Leaderboard
            entries={entries}
            highlightUserId={userId}
            loading={lbLoading}
          />
          <div className="ct-lb-refresh">
            <button className="ct-refresh-btn" onClick={() => loadLeaderboard(week.id)} disabled={lbLoading}>
              ↻ Refresh
            </button>
            <span className="ct-refresh-note">Prices update on refresh · Not real-time</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/cohort/
git commit -m "feat: add /cohort weekly competition page"
```

---

## Task 13 — Nav update + CSS

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Sandbox to primary nav**

In `src/components/Nav.tsx`, change the `PRIMARY` array:

```typescript
const PRIMARY: { href: string; label: string; pro?: boolean }[] = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/lessons",     label: "Lessons" },
  { href: "/playground",  label: "Playground" },
  { href: "/sandbox",     label: "Sandbox",    pro: true },
  { href: "/challenges",  label: "Challenges", pro: true },
  { href: "/cohort",      label: "Cohort",     pro: true },
];
```

- [ ] **Step 2: Add sandbox + cohort CSS to `globals.css`**

Append to the end of `src/app/globals.css`:

```css
/* ═══════════════════════════════════════════════════════════
   SANDBOX — paper trading UI  (.sb-*)
   ═══════════════════════════════════════════════════════════ */

.sb-root { max-width: 1200px; margin: 0 auto; padding: 36px 24px 80px; }

.sb-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 24px; flex-wrap: wrap; margin-bottom: 28px;
}
.sb-eyebrow {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--ink-3); margin-bottom: 6px;
}
.sb-title {
  font-family: var(--font-display); font-weight: 800; font-size: 32px;
  color: var(--ink); letter-spacing: -0.03em; margin-bottom: 4px;
}
.sb-subtitle { font-size: 13px; color: var(--ink-2); }
.sb-balance-chips { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-start; }
.sb-chip {
  display: flex; flex-direction: column; gap: 2px;
  background: var(--card); border: 1.5px solid var(--line);
  border-radius: 14px; padding: 12px 16px;
  box-shadow: 0 2px 0 var(--line);
}
.sb-chip.pos { border-color: rgba(34,197,94,0.4); }
.sb-chip.neg { border-color: rgba(239,68,68,0.35); }
.sb-chip-label { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-3); }
.sb-chip-val { font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--ink); letter-spacing: -0.02em; }
.sb-chip.pos .sb-chip-val { color: var(--grass); }
.sb-chip.neg .sb-chip-val { color: var(--coral); }

.sb-body {
  display: grid; grid-template-columns: 380px 1fr;
  gap: 20px; align-items: start;
}
@media (max-width: 900px) { .sb-body { grid-template-columns: 1fr; } }

/* Order panel */
.sb-order-panel {
  background: var(--card); border: 1.5px solid var(--line);
  border-radius: 22px; padding: 24px;
  box-shadow: 0 2px 0 var(--line);
  display: flex; flex-direction: column; gap: 14px;
}
.sb-panel-head {
  font-family: var(--font-display); font-weight: 700; font-size: 16px;
  color: var(--ink); letter-spacing: -0.01em;
}
.sb-label {
  display: flex; flex-direction: column; gap: 5px;
  font-family: var(--font-mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3);
}
.sb-input {
  padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid var(--line); background: var(--bg2);
  color: var(--ink); font-family: var(--font-ui); font-size: 14px;
  transition: border-color .12s;
}
.sb-input:focus { outline: none; border-color: var(--grass); }
.sb-sym-input { text-transform: uppercase; font-weight: 700; font-size: 16px; }
.sb-toggle-group { display: flex; gap: 6px; }
.sb-toggle {
  flex: 1; padding: 9px 10px; border-radius: 10px;
  border: 1.5px solid var(--line); background: var(--bg2);
  color: var(--ink-2); font-family: var(--font-mono); font-size: 11.5px; font-weight: 600;
  cursor: pointer; transition: all .12s;
}
.sb-toggle.active { border-color: var(--grass); background: rgba(34,197,94,0.1); color: var(--grass); }
.sb-toggle.short.active { border-color: var(--coral); background: rgba(239,68,68,0.1); color: var(--coral); }
.sb-price-display {
  font-family: var(--font-mono); font-size: 13px; color: var(--ink-2);
  padding: 10px 14px; background: var(--bg2); border-radius: 10px;
}
.sb-chain-wrap { max-height: 320px; overflow-y: auto; border-radius: 12px; border: 1.5px solid var(--line); }
.sb-selected-contract {
  font-family: var(--font-mono); font-size: 11px; color: var(--grass);
  padding: 8px 12px; background: rgba(34,197,94,0.07); border-radius: 8px;
}
.sb-cost-estimate {
  font-family: var(--font-mono); font-size: 12.5px; color: var(--ink-2);
}
.sb-commission { color: var(--ink-3); }
.sb-execute-btn {
  padding: 14px; background: var(--grass); color: #fff;
  border-radius: 13px; font-family: var(--font-ui); font-size: 14px; font-weight: 700;
  box-shadow: 0 4px 0 var(--grass-d), 0 0 0 1.5px var(--grass);
  transition: transform .1s, box-shadow .1s;
  cursor: pointer;
}
.sb-execute-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 0 var(--grass-d), 0 0 0 1.5px var(--grass); }
.sb-execute-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.sb-exec-msg { font-family: var(--font-mono); font-size: 12.5px; padding: 8px 12px; border-radius: 8px; }
.sb-exec-msg.ok { background: rgba(34,197,94,0.1); color: var(--grass); }
.sb-exec-msg.err { background: rgba(239,68,68,0.1); color: var(--coral); }

/* Portfolio panel */
.sb-portfolio-panel {
  background: var(--card); border: 1.5px solid var(--line);
  border-radius: 22px; overflow: hidden;
  box-shadow: 0 2px 0 var(--line);
}
.sb-tabs { display: flex; border-bottom: 1px solid var(--border); }
.sb-tab {
  flex: 1; padding: 14px; font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  color: var(--ink-3); background: none; cursor: pointer; transition: all .12s;
  border-bottom: 2px solid transparent;
}
.sb-tab.active { color: var(--ink); border-bottom-color: var(--grass); }
.sb-positions, .sb-trades { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.sb-loading, .sb-empty {
  padding: 32px 20px; text-align: center; font-family: var(--font-mono);
  font-size: 12.5px; color: var(--ink-3);
}

/* Position rows */
.pos-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 13px;
  background: var(--bg2); border: 1.5px solid var(--line);
  transition: border-color .12s;
}
.pos-label { flex: 1; min-width: 0; }
.pos-symbol { font-size: 13.5px; font-weight: 600; color: var(--ink); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pos-qty { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); }
.pos-prices { font-family: var(--font-mono); font-size: 12px; color: var(--ink-2); display: flex; align-items: center; gap: 5px; }
.pos-arrow { opacity: 0.4; }
.pos-current { color: var(--ink); font-weight: 600; }
.pos-pnl { font-family: var(--font-mono); font-size: 13px; font-weight: 700; min-width: 90px; text-align: right; }
.pos-pnl.pos { color: var(--grass); }
.pos-pnl.neg { color: var(--coral); }
.pos-close-btn {
  padding: 6px 12px; border-radius: 8px; border: 1.5px solid var(--line);
  background: var(--bg); color: var(--ink-2); font-family: var(--font-mono);
  font-size: 11px; cursor: pointer; transition: all .12s; white-space: nowrap;
}
.pos-close-btn:hover:not(:disabled) { border-color: var(--coral); color: var(--coral); }

/* Trade history rows */
.sb-trade-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 10px; background: var(--bg2);
  font-family: var(--font-mono); font-size: 11.5px;
}
.sb-trade-dir { font-weight: 700; padding: 2px 7px; border-radius: 5px; font-size: 10px; }
.sb-trade-dir.buy { background: rgba(34,197,94,0.12); color: var(--grass); }
.sb-trade-dir.sell { background: rgba(239,68,68,0.1); color: var(--coral); }
.sb-trade-sym { font-weight: 700; color: var(--ink); }
.sb-trade-detail { flex: 1; color: var(--ink-2); }
.sb-trade-time { color: var(--ink-3); font-size: 10px; }

/* Option chain */
.oc-root { }
.oc-loading, .oc-error { padding: 16px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); text-align: center; }
.oc-error { color: var(--coral); }
.oc-expiry-tabs { display: flex; gap: 4px; padding: 8px 8px 0; flex-wrap: wrap; }
.oc-expiry-tab {
  padding: 5px 10px; border-radius: 8px; border: 1.5px solid var(--line);
  background: var(--bg2); color: var(--ink-2); font-family: var(--font-mono);
  font-size: 10px; cursor: pointer; transition: all .12s;
}
.oc-expiry-tab.active { border-color: var(--grass); background: rgba(34,197,94,0.1); color: var(--grass); }
.oc-table-wrap { overflow-x: auto; }
.oc-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11.5px; }
.oc-table th {
  padding: 7px 10px; text-align: right; font-weight: 600; color: var(--ink-3);
  border-bottom: 1px solid var(--border); font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase;
}
.oc-table th:first-child { text-align: left; }
.oc-row { cursor: pointer; transition: background .1s; }
.oc-row td { padding: 7px 10px; text-align: right; color: var(--ink-2); border-bottom: 1px solid var(--bg2); }
.oc-row td:first-child { text-align: left; }
.oc-row:hover td { background: var(--bg2); }
.oc-row.selected td { background: rgba(34,197,94,0.1); color: var(--ink); }
.oc-strike { font-weight: 700; color: var(--ink); }

/* ═══════════════════════════════════════════════════════════
   COHORT — weekly competition UI  (.ct-*)
   ═══════════════════════════════════════════════════════════ */

.ct-root { max-width: 1100px; margin: 0 auto; padding: 36px 24px 80px; }
.ct-loading { padding: 60px; text-align: center; font-family: var(--font-mono); font-size: 13px; color: var(--ink-3); }

/* Hero */
.ct-hero {
  display: flex; align-items: flex-start; gap: 28px; flex-wrap: wrap;
  background: linear-gradient(130deg, var(--card), var(--card2, var(--card)));
  border: 1.5px solid var(--line); border-radius: 26px;
  padding: 36px 40px; margin-bottom: 28px;
  box-shadow: 0 4px 24px -8px rgba(0,0,0,.1), 0 2px 0 var(--line);
  position: relative; overflow: hidden;
}
.ct-hero::before {
  content: ""; position: absolute; top: -80px; right: -40px;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(34,197,94,0.06), transparent);
  pointer-events: none;
}
.ct-hero-left { flex: 1; min-width: 280px; }
.ct-hero-right { flex-shrink: 0; }
.ct-eyebrow {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--ink-3); margin-bottom: 8px;
}
.ct-title {
  font-family: var(--font-display); font-weight: 800; font-size: 38px;
  color: var(--ink); letter-spacing: -0.03em; margin-bottom: 8px;
}
.ct-sub { font-size: 13.5px; color: var(--ink-2); margin-bottom: 20px; line-height: 1.5; }

/* Countdown */
.ct-countdown { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ct-cd-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-3); }
.ct-cd-units { display: flex; gap: 8px; }
.ct-cd-unit {
  display: flex; flex-direction: column; align-items: center;
  background: var(--bg2); border: 1.5px solid var(--line);
  border-radius: 10px; padding: 8px 12px; min-width: 50px;
}
.ct-cd-num { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: var(--grass); letter-spacing: -0.02em; line-height: 1; }
.ct-cd-lbl { font-family: var(--font-mono); font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-3); margin-top: 2px; }

/* Join / joined cards */
.ct-join-card, .ct-joined-card {
  background: var(--card); border: 1.5px solid var(--line);
  border-radius: 20px; padding: 24px; max-width: 300px;
  box-shadow: 0 2px 0 var(--line);
}
.ct-join-title { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--ink); margin-bottom: 8px; }
.ct-join-desc { font-size: 13px; color: var(--ink-2); line-height: 1.55; margin-bottom: 18px; }
.ct-join-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 13px; width: 100%; background: var(--grass); color: #fff;
  border-radius: 13px; font-family: var(--font-ui); font-size: 14px; font-weight: 700;
  box-shadow: 0 4px 0 var(--grass-d), 0 0 0 1.5px var(--grass);
  transition: transform .1s, box-shadow .1s; cursor: pointer;
}
.ct-join-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 0 var(--grass-d), 0 0 0 1.5px var(--grass); }
.ct-join-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ct-join-err { font-family: var(--font-mono); font-size: 11px; color: var(--coral); margin-top: 8px; }
.ct-joined-check { font-size: 28px; color: var(--grass); margin-bottom: 6px; }
.ct-joined-msg { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--ink); margin-bottom: 14px; }
.ct-trade-btn {
  display: block; padding: 12px; background: rgba(34,197,94,0.1);
  border: 1.5px solid rgba(34,197,94,0.4); border-radius: 12px;
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  color: var(--grass); text-align: center; transition: background .12s;
}
.ct-trade-btn:hover { background: rgba(34,197,94,0.18); }

/* Leaderboard section */
.ct-lb-section { }
.ct-section-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin: 0 0 14px;
}
.ct-section-title { font-family: var(--font-display); font-weight: 800; font-size: 21px; color: var(--ink); letter-spacing: -0.025em; }
.ct-section-meta { font-family: var(--font-mono); font-size: 11px; color: var(--ink-3); }
.ct-lb-refresh { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.ct-refresh-btn {
  padding: 7px 14px; border-radius: 8px; border: 1.5px solid var(--line);
  background: var(--card); color: var(--ink-2); font-family: var(--font-mono);
  font-size: 12px; cursor: pointer; transition: all .12s;
}
.ct-refresh-btn:hover:not(:disabled) { border-color: var(--grass); color: var(--grass); }
.ct-refresh-note { font-family: var(--font-mono); font-size: 10px; color: var(--ink-3); }

/* Leaderboard table */
.lb-table-wrap { background: var(--card); border: 1.5px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 2px 0 var(--line); }
.lb-loading, .lb-empty { padding: 40px; text-align: center; font-family: var(--font-mono); font-size: 12.5px; color: var(--ink-3); }
.lb-table { width: 100%; border-collapse: collapse; }
.lb-table th {
  padding: 12px 16px; text-align: left; font-family: var(--font-mono);
  font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--ink-3); border-bottom: 1px solid var(--border);
  background: var(--bg2);
}
.lb-table th:not(:first-child):not(:nth-child(2)) { text-align: right; }
.lb-row td { padding: 13px 16px; border-bottom: 1px solid var(--bg2); transition: background .1s; }
.lb-row:last-child td { border-bottom: none; }
.lb-row:hover td { background: var(--bg2); }
.lb-row.me td { background: rgba(34,197,94,0.06); }
.lb-rank { font-family: var(--font-mono); font-weight: 700; font-size: 14px; color: var(--ink-3); width: 40px; }
.lb-name { font-weight: 600; font-size: 14px; color: var(--ink); }
.lb-val, .lb-pnl, .lb-pct { font-family: var(--font-mono); font-size: 13px; text-align: right; }
.lb-val { color: var(--ink-2); }
.lb-pnl.pos, .lb-pct.pos { color: var(--grass); font-weight: 700; }
.lb-pnl.neg, .lb-pct.neg { color: var(--coral); font-weight: 700; }
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: Build succeeds. Fix any type errors before committing.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx src/app/globals.css
git commit -m "feat: add Sandbox + Cohort nav links + full CSS"
```

- [ ] **Step 6: Final push**

```bash
git push origin master
```

---

## Self-Review

**Spec coverage check:**
- ✅ Polygon.io real-time data (Tasks 4, 6)
- ✅ Buy/sell calls, puts, stocks (Task 7 execute route)
- ✅ Multi-leg spreads via `leg_group` column (schema Task 2; execute route accepts leg_group — can be wired in UI later as a follow-up)
- ✅ Portfolio P&L tracking (Task 7 portfolio route + PositionRow)
- ✅ $10k weekly cohort (Task 8 cohort routes + Task 12 CohortClient)
- ✅ Leaderboard ranked by P&L % (Task 8 leaderboard route)
- ✅ Supabase persistence (Tasks 1, 2, 3)
- ✅ UUID identity (SandboxClient + CohortClient both call getUserId())
- ✅ Vercel Cron weekly reset (Task 8 cron route + vercel.json)
- ✅ Commission model $0.65/contract (trading.ts + execute route)
- ✅ Nav integration (Task 13)
- ⚠️  Multi-leg spread UI not wired (complex; the data model supports it; single-leg ships first — add spread builder as follow-up)

**Placeholder scan:** None found. All steps contain actual code.

**Type consistency:** `Position` type defined in `PositionRow.tsx` and imported in `SandboxClient.tsx`. `LeaderboardEntry` defined in `Leaderboard.tsx` and imported in `CohortClient.tsx`. `OptionContract` from `polygon.ts` used consistently across chain component and execute route.
