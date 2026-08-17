import type { SupabaseClient } from "@supabase/supabase-js";
import {
  contractMultiplier,
  markPrice,
  type AssetType,
} from "@/lib/pricing";

const STARTING_CASH = 100000;

export interface PositionRow {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: AssetType;
  side: "long" | "short";
  qty: number;
  avg_cost: number;
  strike: number | null;
  expiry: string | null;
  opened_at: string;
  closed_at: string | null;
  close_price: number | null;
  realized_pnl: number | null;
}

export interface TradeRow {
  id: string;
  symbol: string;
  asset_type: AssetType;
  direction: "buy" | "sell";
  qty: number;
  fill_price: number;
  strike: number | null;
  expiry: string | null;
  executed_at: string;
}

export interface PositionWithMark extends PositionRow {
  markPrice: number;
  marketValue: number;
  unrealizedPnl: number;
}

/** Fetch (or lazily create) a user's sandbox account row. */
export async function getOrCreateAccount(
  supabase: SupabaseClient,
  userId: string
): Promise<{ cashBalance: number }> {
  const { data } = await supabase
    .from("sandbox_accounts")
    .select("cash_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return { cashBalance: Number(data.cash_balance) };

  await supabase
    .from("sandbox_accounts")
    .upsert({ user_id: userId, cash_balance: STARTING_CASH }, { onConflict: "user_id" });

  return { cashBalance: STARTING_CASH };
}

export async function listOpenPositions(
  supabase: SupabaseClient,
  userId: string
): Promise<PositionWithMark[]> {
  const { data } = await supabase
    .from("sandbox_positions")
    .select("*")
    .eq("user_id", userId)
    .is("closed_at", null)
    .order("opened_at", { ascending: false });

  const rows = (data ?? []) as PositionRow[];
  const now = Date.now();

  return rows.map((row) => {
    const mark = markPrice(
      { symbol: row.symbol, assetType: row.asset_type, strike: row.strike, expiry: row.expiry },
      now
    );
    const multiplier = contractMultiplier(row.asset_type);
    const direction = row.side === "long" ? 1 : -1;
    const unrealizedPnl = direction * (mark - row.avg_cost) * row.qty * multiplier;
    const marketValue = mark * row.qty * multiplier;
    return { ...row, markPrice: mark, marketValue, unrealizedPnl };
  });
}

export async function listRecentTrades(
  supabase: SupabaseClient,
  userId: string,
  limit = 20
): Promise<TradeRow[]> {
  const { data } = await supabase
    .from("sandbox_trades")
    .select("*")
    .eq("user_id", userId)
    .order("executed_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as TradeRow[];
}

export interface ExecuteParams {
  symbol: string;
  assetType: AssetType;
  side: "long" | "short";
  qty: number;
  strike?: number | null;
  expiry?: string | null;
}

export interface ExecuteResult {
  ok: true;
  cashBalance: number;
  positionId: string;
}

export interface ExecuteError {
  ok: false;
  error: string;
}

/**
 * Open a new position: validates cash, writes the position + trade rows,
 * debits cash — all atomically via the sandbox_open_position() Postgres
 * function (supabase/migrations/0007_sandbox_atomic_trades.sql). Cash is
 * checked and debited in the same statement inside that function, so two
 * concurrent trades can't both read the same stale balance and both
 * succeed (see the migration's header comment for the full race-condition
 * writeup this replaced).
 */
export async function executeTrade(
  supabase: SupabaseClient,
  userId: string,
  params: ExecuteParams
): Promise<ExecuteResult | ExecuteError> {
  if (!Number.isInteger(params.qty) || params.qty <= 0) {
    return { ok: false, error: "Quantity must be a positive integer" };
  }
  if (params.assetType !== "stock" && (!params.strike || !params.expiry)) {
    return { ok: false, error: "Strike and expiry are required for options" };
  }

  const fillPrice = markPrice(
    { symbol: params.symbol, assetType: params.assetType, strike: params.strike, expiry: params.expiry },
    Date.now()
  );
  const multiplier = contractMultiplier(params.assetType);
  const cost = fillPrice * params.qty * multiplier;

  const { data, error } = await supabase
    .rpc("sandbox_open_position", {
      p_user_id: userId,
      p_symbol: params.symbol,
      p_asset_type: params.assetType,
      p_side: params.side,
      p_qty: params.qty,
      p_fill_price: fillPrice,
      p_cost: cost,
      p_strike: params.strike ?? null,
      p_expiry: params.expiry ?? null,
    })
    .single();

  if (error) {
    if (error.message?.includes("insufficient_funds")) {
      return { ok: false, error: "Insufficient cash balance for this trade" };
    }
    return { ok: false, error: "Failed to open position" };
  }

  const row = data as { position_id: string; cash_balance: number };
  return { ok: true, cashBalance: Number(row.cash_balance), positionId: row.position_id };
}

/**
 * Close an open position at the current mark price, booking realized P&L
 * and crediting cash — atomically via sandbox_close_position() (see
 * supabase/migrations/0007_sandbox_atomic_trades.sql). The P&L/cash-delta
 * math stays here in TypeScript (same formulas as before); the RPC's job is
 * only to apply those already-computed numbers in one transaction, guarded
 * by `closed_at IS NULL` so two concurrent close requests on the same
 * position can't both succeed and double-credit cash.
 */
export async function closePosition(
  supabase: SupabaseClient,
  userId: string,
  positionId: string
): Promise<ExecuteResult | ExecuteError> {
  const { data: row } = await supabase
    .from("sandbox_positions")
    .select("*")
    .eq("id", positionId)
    .eq("user_id", userId)
    .is("closed_at", null)
    .maybeSingle();

  if (!row) return { ok: false, error: "Position not found or already closed" };
  const position = row as PositionRow;

  const closePrice = markPrice(
    { symbol: position.symbol, assetType: position.asset_type, strike: position.strike, expiry: position.expiry },
    Date.now()
  );
  const multiplier = contractMultiplier(position.asset_type);
  const direction = position.side === "long" ? 1 : -1;
  const realizedPnl = direction * (closePrice - position.avg_cost) * position.qty * multiplier;
  const proceeds = closePrice * position.qty * multiplier;
  const returnedCapital = position.avg_cost * position.qty * multiplier;
  // Long: cash gets back the sale proceeds. Short: cash gets back the original margin plus/minus P&L.
  const cashDelta = position.side === "long" ? proceeds : returnedCapital + realizedPnl;

  const { data, error } = await supabase
    .rpc("sandbox_close_position", {
      p_user_id: userId,
      p_position_id: positionId,
      p_close_price: closePrice,
      p_realized_pnl: realizedPnl,
      p_cash_delta: cashDelta,
    })
    .single();

  if (error) {
    // Covers the position having been closed by a concurrent request
    // between our read above and this call — same message as the
    // "already gone" case the initial SELECT above already returns.
    return { ok: false, error: "Position not found or already closed" };
  }

  const newRow = data as { cash_balance: number };
  return { ok: true, cashBalance: Number(newRow.cash_balance), positionId };
}
