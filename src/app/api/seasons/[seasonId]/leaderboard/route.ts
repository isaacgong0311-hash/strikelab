/**
 * GET /api/seasons/[seasonId]/leaderboard?classId= — the season board, or a
 * chapter's board (members and teacher only; enforced in the database).
 * Handles only, official scores only (season_leaderboard, 0024).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const classId = req.nextUrl.searchParams.get("classId");
  if (classId && !UUID.test(classId)) return NextResponse.json({ error: "Bad chapter id" }, { status: 400 });

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: "Seasons aren't set up on this server yet." }, { status: 503 });

  const { data, error } = await supabase.rpc("season_leaderboard", { p_season_id: seasonId, p_class_id: classId });
  if (error) {
    console.error("[seasons/leaderboard]", error.message);
    return NextResponse.json({ error: "We can't reach the season database right now." }, { status: 503 });
  }
  return NextResponse.json({ rows: data ?? [] });
}
