/**
 * GET /api/challenges/leaderboard — the current weekly challenge's top times,
 * plus the caller's own solved/xp/rank if they're signed in.
 *
 * No names: students are 13–18, so rows are ranks, times and XP, with the
 * caller's own row labelled "You" (src/lib/challengeLeaderboard.ts). Works
 * for signed-out visitors too (they just get `you: null`).
 */
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getCurrentChallenge } from "@/lib/challenges";
import { loadLeaderboardRows, toLeaderboard } from "@/lib/challengeLeaderboard";

const TOP_N = 10;

export async function GET() {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const challenge = getCurrentChallenge();
  const auth = await requireUser();
  const signedIn = !("error" in auth);

  const rows = await loadLeaderboardRows(signedIn ? auth.supabase : supabase, challenge.id, signedIn ? auth.userId : null, TOP_N);
  if (!rows) {
    return NextResponse.json({ error: "Could not load leaderboard" }, { status: 500 });
  }
  const { leaderboard, yourRank } = toLeaderboard(rows, TOP_N);

  let you: { solved: number; bonusXp: number; rank: number | null } | null = null;
  if (signedIn) {
    const { data: mine } = await auth.supabase
      .from("challenge_completions")
      .select("xp")
      .eq("user_id", auth.userId);

    you = {
      solved: mine?.length ?? 0,
      bonusXp: (mine ?? []).reduce((sum, r) => sum + r.xp, 0),
      rank: yourRank,
    };
  }

  return NextResponse.json({ challengeId: challenge.id, leaderboard, you });
}
