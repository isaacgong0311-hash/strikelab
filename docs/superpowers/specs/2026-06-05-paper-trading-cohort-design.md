# Paper-Trading Sandbox + Weekly Cohort Challenges
**Date:** 2026-06-05  
**Status:** Approved for implementation

---

## Overview

Two new Pro features:

1. **Paper-Trading Sandbox** (`/sandbox`) — persistent paper portfolio with real Polygon.io data. Users buy/sell stocks, calls, puts, and multi-leg spreads. Portfolio carries over indefinitely.

2. **Weekly Cohort Challenge** (`/cohort`) — every Monday at 00:00 UTC all Pro users get a fresh $10,000 paper balance. They trade freely during the week. Sunday at 23:59 UTC the week closes and the leaderboard is finalized. Best P&L % wins.

---

## Identity model

No Clerk auth required. Each browser generates a stable UUID stored as `localStorage.sl_uuid`. This UUID is the `user_id` for all DB writes. Display name comes from the existing `sl_user` localStorage key (set during sign-up).

---

## External dependencies

| Dep | Purpose | Where |
|-----|---------|--------|
| `@supabase/supabase-js` | DB client | Client + server |
| `POLYGON_API_KEY` | Real-time quotes + option chains | Server only (env var) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (writes) | Server only |

---

## Database schema (Supabase)

### `paper_positions`
```sql
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
```

### `paper_trades`
```sql
CREATE TABLE paper_trades (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  symbol      TEXT NOT NULL,
  asset_type  TEXT NOT NULL,
  direction   TEXT NOT NULL CHECK (direction IN ('buy','sell')),
  qty         INTEGER NOT NULL,
  fill_price  NUMERIC(12,4) NOT NULL,
  strike      NUMERIC(10,2),
  expiry      DATE,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON paper_trades(user_id);
```

### `cohort_weeks`
```sql
CREATE TABLE cohort_weeks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  week_end   DATE NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE
);
```

### `cohort_entries`
```sql
CREATE TABLE cohort_entries (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  week_id      UUID REFERENCES cohort_weeks(id),
  display_name TEXT NOT NULL DEFAULT 'Trader',
  cash_balance NUMERIC(12,2) NOT NULL DEFAULT 10000,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_id)
);
CREATE INDEX ON cohort_entries(week_id, cash_balance DESC);
```

### `sandbox_balances`
```sql
CREATE TABLE sandbox_balances (
  user_id      TEXT PRIMARY KEY,
  cash_balance NUMERIC(12,2) NOT NULL DEFAULT 100000,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```
Sandbox starts with $100,000 (unlimited time horizon). Cohort starts with $10,000 per week.

---

## API routes

### Market data (Polygon.io proxy)
- `GET /api/market/quote?symbols=SPY,AAPL` → latest trade price per symbol
- `GET /api/market/options?symbol=SPY` → snapshot of option chain (nearest 3 expiries, strikes within ±15% of spot)

### Trading
- `GET /api/trading/portfolio?userId=` → open positions + sandbox cash balance
- `POST /api/trading/execute` → body: `{userId, symbol, assetType, side, qty, strike?, expiry?, mode: 'sandbox'|'cohort'}` — validates balance, writes position + trade, returns updated balance
- `POST /api/trading/close` → body: `{positionId, userId, qty?}` — fetches current price, marks position closed, books P&L, credits cash

### Cohort
- `GET /api/cohort/week` → current active `cohort_weeks` row (or null if between weeks)
- `GET /api/cohort/leaderboard?weekId=` → top 50 entries sorted by effective P&L %
- `POST /api/cohort/join` → body: `{userId, displayName}` — upserts `cohort_entries` row for current week with $10,000 starting balance

---

## P&L calculation

**Sandbox unrealized P&L per position:**
```
long stock/call/put:  (current_price - avg_cost) * qty * multiplier
short stock/call/put: (avg_cost - current_price) * qty * multiplier
```
`multiplier = 100` for options, `1` for stock.

**Cohort leaderboard rank:**
The `leaderboard` API joins `cohort_entries.cash_balance` with a live Polygon.io batch quote of all open position symbols, computes total portfolio value, then:
```
pnl_pct = (total_portfolio_value - 10000) / 10000 * 100
```

---

## Frontend pages

### `/sandbox` — Paper Trading Sandbox
Layout: two-column (editor left, portfolio right).

**Left panel:**
1. Symbol search input (type ticker → fetch quote + option chain)
2. Asset type toggle: Stock | Call | Put
3. For options: strike selector + expiry selector (from chain snapshot)
4. Side: Buy | Sell  
5. Quantity input
6. Live price display + estimated total cost
7. "Execute Trade" button → calls `/api/trading/execute`

**Right panel:**
1. Balance chip (cash + estimated total value)
2. Open positions list: symbol, type, qty, avg cost, current price, unrealized P&L (color-coded)
3. "Close" button per position
4. Recent trades tab (last 20 fills)

**Nav integration:** Add "Sandbox" link to primary nav.

### `/cohort` — Weekly Cohort Challenge
Layout: hero banner + leaderboard + sidebar.

**Hero:** Current week dates, time until close (countdown), "Join this week" CTA.

**Leaderboard table:** Rank | Name | P&L % | P&L $ | Trades | Last active.

**Your position:** Highlighted row even if off the top 50. Shows current rank, P&L, and "Go to Sandbox" link to make trades.

**Nav integration:** Update "Challenges PRO" link to point to `/cohort` (or add separately).

---

## Commission model

- Options: $0.65 per contract (deducted from cash on execute, credited on close — same as most retail brokers)
- Stock: $0 commission
- No margin — cash-only account. Cannot short more than cash balance supports.

---

## Weekly reset logic

A Vercel Cron job runs every Monday at 00:05 UTC:
1. Sets all `cohort_weeks` rows with `week_end < today` to `is_active = false`
2. Inserts a new `cohort_weeks` row for the upcoming Mon–Sun
3. Does NOT reset sandbox balances (sandbox is persistent)

Cron expression: `5 0 * * 1` (minute 5, hour 0, any day, any month, Monday).

---

## File structure (new files)

```
src/
  app/
    sandbox/
      page.tsx          (server wrapper)
      SandboxClient.tsx (main trading UI)
    cohort/
      page.tsx
      CohortClient.tsx
    api/
      market/
        quote/route.ts
        options/route.ts
      trading/
        portfolio/route.ts
        execute/route.ts
        close/route.ts
      cohort/
        week/route.ts
        leaderboard/route.ts
        join/route.ts
  lib/
    supabase.ts         (client + server-side Supabase instances)
    polygon.ts          (typed wrappers for Polygon.io endpoints)
    trading.ts          (P&L helpers, balance logic)
  components/
    OptionChain.tsx     (strike/expiry selector grid)
    PositionRow.tsx     (open position display with live price)
    Leaderboard.tsx     (cohort leaderboard table)
```

---

## Constraints & non-goals

- No real auth — UUID from localStorage only (add Clerk later without schema changes)
- No WebSocket real-time — prices refresh on user action or manual refresh (Polygon.io REST, not WebSocket, for MVP)
- No options Greeks display in trading UI (covered by existing Playground)
- No short-selling validation beyond cash check (no borrow fees, no margin calls)
- Week reset is a Vercel Cron, not a user-facing action
