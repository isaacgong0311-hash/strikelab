/**
 * POST /api/sandbox/execute — open a new sandbox position.
 * Body: { symbol, assetType, side, qty, strike?, expiry? }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { executeTrade, type ExecuteParams } from "@/lib/sandbox/db";
import { WATCHLIST, type AssetType } from "@/lib/pricing";

async function requireUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "Supabase not configured", status: 503 as const };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Not authenticated", status: 401 as const };
  return { supabase, userId: data.user.id };
}

const VALID_ASSET_TYPES: AssetType[] = ["stock", "call", "put"];

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Partial<ExecuteParams>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.symbol || !WATCHLIST.some((w) => w.symbol === body.symbol)) {
    return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  }
  if (!body.assetType || !VALID_ASSET_TYPES.includes(body.assetType)) {
    return NextResponse.json({ error: "Invalid assetType" }, { status: 400 });
  }
  if (body.side !== "long" && body.side !== "short") {
    return NextResponse.json({ error: "side must be 'long' or 'short'" }, { status: 400 });
  }
  if (!body.qty) {
    return NextResponse.json({ error: "qty is required" }, { status: 400 });
  }

  const result = await executeTrade(auth.supabase, auth.userId, {
    symbol: body.symbol,
    assetType: body.assetType,
    side: body.side,
    qty: body.qty,
    strike: body.strike ?? null,
    expiry: body.expiry ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
