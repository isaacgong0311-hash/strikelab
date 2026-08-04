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

/** Open a new position: validates cash, writes the position + trade rows, debits cash. */
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

  const { cashBalance } = await getOrCreateAccount(supabase, userId);
  if (cost > cashBalance) {
    return { ok: false, error: "Insufficient cash balance for this trade" };
  }

  const newBalance = cashBalance - cost;

  const { data: position, error: posError } = await supabase
    .from("sandbox_positions")
    .insert({
      user_id: userId,
      symbol: params.symbol,
      asset_type: params.assetType,
      side: params.side,
      qty: params.qty,
      avg_cost: fillPrice,
      strike: params.strike ?? null,
      expiry: params.expiry ?? null,
    })
    .select("id")
    .single();

  if (posError || !position) {
    return { ok: false, error: "Failed to open position" };
  }

  await supabase.from("sandbox_trades").insert({
    user_id: userId,
    symbol: params.symbol,
    asset_type: params.assetType,
    direction: params.side === "long" ? "buy" : "sell",
    qty: params.qty,
    fill_price: fillPrice,
    strike: params.strike ?? null,
    expiry: params.expiry ?? null,
  });

  await supabase
    .from("sandbox_accounts")
    .upsert(
      { user_id: userId, cash_balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  return { ok: true, cashBalance: newBalance, positionId: position.id };
}

/** Close an open position at the current mark price, booking realized P&L and crediting cash. */
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

  const { cashBalance } = await getOrCreateAccount(supabase, userId);
  const newBalance = cashBalance + cashDelta;

  await supabase
    .from("sandbox_positions")
    .update({
      closed_at: new Date().toISOString(),
      close_price: closePrice,
      realized_pnl: realizedPnl,
    })
    .eq("id", positionId);

  await supabase.from("sandbox_trades").insert({
    user_id: userId,
    symbol: position.symbol,
    asset_type: position.asset_type,
    direction: position.side === "long" ? "sell" : "buy",
    qty: position.qty,
    fill_price: closePrice,
    strike: position.strike,
    expiry: position.expiry,
  });

  await supabase
    .from("sandbox_accounts")
    .upsert(
      { user_id: userId, cash_balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  return { ok: true, cashBalance: newBalance, positionId };
}
