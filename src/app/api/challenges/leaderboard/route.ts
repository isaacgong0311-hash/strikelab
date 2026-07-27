/**
 * GET /api/challenges/leaderboard — the current weekly challenge's top times,
 * plus the caller's own solved/xp/rank if they're signed in.
 *
 * challenge_completions has a public SELECT policy, so this works for
 * signed-out visitors too (they just get `you: null`).
 */
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getCurrentChallenge } from "@/lib/challenges";

const TOP_N = 10;

export async function GET() {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const challenge = getCurrentChallenge();

  const { data: rows, error } = await supabase
    .from("challenge_completions")
    .select("user_id, display_name, elapsed_seconds, xp")
    .eq("challenge_id", challenge.id)
    .order("elapsed_seconds", { ascending: true })
    .limit(TOP_N);

  if (error) {
    console.error("[challenges/leaderboard] read failed:", error.message);
    return NextResponse.json({ error: "Could not load leaderboard" }, { status: 500 });
  }

  const leaderboard = (rows ?? []).map((row, i) => ({
    rank: i + 1,
    name: row.display_name?.trim() || "Anonymous",
    elapsedSeconds: row.elapsed_seconds,
    xp: row.xp,
  }));

  const auth = await requireUser();
  let you: { solved: number; bonusXp: number; rank: number | null } | null = null;

  if (!("error" in auth)) {
    const { data: mine } = await auth.supabase
      .from("challenge_completions")
      .select("xp")
      .eq("user_id", auth.userId);

    const solved = mine?.length ?? 0;
    const bonusXp = (mine ?? []).reduce((sum, r) => sum + r.xp, 0);

    let rank: number | null = null;
    const inTop = rows?.findIndex((r) => r.user_id === auth.userId) ?? -1;
    if (inTop >= 0) {
      rank = inTop + 1;
    } else {
      const { data: allForChallenge } = await supabase
        .from("challenge_completions")
        .select("user_id")
        .eq("challenge_id", challenge.id)
        .order("elapsed_seconds", { ascending: true });
      const idx = allForChallenge?.findIndex((r) => r.user_id === auth.userId) ?? -1;
      rank = idx >= 0 ? idx + 1 : null;
    }

    you = { solved, bonusXp, rank };
  }

  return NextResponse.json({ challengeId: challenge.id, leaderboard, you });
}
