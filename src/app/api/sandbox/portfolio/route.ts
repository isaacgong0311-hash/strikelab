/**
 * GET /api/sandbox/portfolio — cash balance, open positions (with live
 * simulated mark price + unrealized P&L), and recent trades for the signed-in
 * user. Backed by Supabase, RLS-scoped to auth.uid().
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getOrCreateAccount, listOpenPositions, listRecentTrades } from "@/lib/sandbox/db";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [{ cashBalance }, positions, trades] = await Promise.all([
    getOrCreateAccount(auth.supabase, auth.userId),
    listOpenPositions(auth.supabase, auth.userId),
    listRecentTrades(auth.supabase, auth.userId),
  ]);

  const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0);

  return NextResponse.json({
    cashBalance,
    totalValue: cashBalance + positionsValue,
    positions,
    trades,
  });
}
