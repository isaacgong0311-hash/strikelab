/**
 * POST /api/sandbox/close — close an open sandbox position at the current
 * simulated mark price, booking realized P&L and crediting cash.
 * Body: { positionId }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { closePosition } from "@/lib/sandbox/db";

async function requireUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "Supabase not configured", status: 503 as const };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Not authenticated", status: 401 as const };
  return { supabase, userId: data.user.id };
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { positionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.positionId) {
    return NextResponse.json({ error: "positionId is required" }, { status: 400 });
  }

  const result = await closePosition(auth.supabase, auth.userId, body.positionId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
