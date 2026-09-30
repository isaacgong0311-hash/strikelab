import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The weekly challenge leaderboard, without names (work plan 2026-09-29,
 * AG8). Students are 13–18 and the site promises no public leaderboards
 * with names, so a row says only its rank, time and XP, plus whether it's
 * the viewer's own.
 */
export interface LeaderboardRow {
  rank: number;
  elapsedSeconds: number;
  xp: number;
  isYou: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  elapsedSeconds: number;
  xp: number;
}

/** What /challenges shows: the top N, the viewer's row labelled "You", no one else named. */
export function toLeaderboard(rows: LeaderboardRow[], topN: number): { leaderboard: LeaderboardEntry[]; yourRank: number | null } {
  const sorted = [...rows].sort((a, b) => a.rank - b.rank);
  return {
    leaderboard: sorted
      .filter((r) => r.rank <= topN)
      .map((r) => ({ rank: r.rank, name: r.isYou ? "You" : "Anonymous", elapsedSeconds: r.elapsedSeconds, xp: r.xp })),
    yourRank: sorted.find((r) => r.isYou)?.rank ?? null,
  };
}

// PGRST202: function not in the schema cache; 42883: undefined function.
const MISSING_FUNCTION = new Set(["PGRST202", "42883"]);

/**
 * Loads leaderboard rows through challenge_leaderboard() (migration 0022),
 * which returns no names or ids. Until 0022 is applied, falls back to the
 * old public table read, still dropping names and ids before they leave
 * this function. Returns null when neither works.
 */
export async function loadLeaderboardRows(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string | null,
  topN: number
): Promise<LeaderboardRow[] | null> {
  const { data, error } = await supabase.rpc("challenge_leaderboard", { p_challenge_id: challengeId, p_limit: topN });
  if (!error) {
    return ((data ?? []) as { rank: number; elapsed_seconds: number; xp: number; is_you: boolean }[]).map((r) => ({
      rank: r.rank,
      elapsedSeconds: r.elapsed_seconds,
      xp: r.xp,
      isYou: r.is_you,
    }));
  }
  if (!MISSING_FUNCTION.has(error.code ?? "")) {
    console.error("[challenges/leaderboard] rpc failed:", error.message);
    return null;
  }

  const { data: rows, error: readError } = await supabase
    .from("challenge_completions")
    .select("user_id, elapsed_seconds, xp")
    .eq("challenge_id", challengeId)
    .order("elapsed_seconds", { ascending: true });
  if (readError) {
    console.error("[challenges/leaderboard] read failed:", readError.message);
    return null;
  }
  return (rows ?? [])
    .map((r, i) => ({ rank: i + 1, elapsedSeconds: r.elapsed_seconds, xp: r.xp, isYou: userId !== null && r.user_id === userId }))
    .filter((r) => r.rank <= topN || r.isYou);
}
