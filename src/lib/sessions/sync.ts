import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionResult, SessionResults } from "./index";

/** Supabase `session_completions` row shape (migration 0014). */
interface SessionCompletionRow {
  session_id: string;
  completed_at: string;
  accuracy: number;
  duration_ms: number;
}

function isResult(value: unknown): value is SessionResult {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.completedAt === "string" &&
    !Number.isNaN(Date.parse(r.completedAt)) &&
    typeof r.accuracy === "number" &&
    r.accuracy >= 0 &&
    r.accuracy <= 1 &&
    typeof r.durationMs === "number" &&
    r.durationMs >= 0
  );
}

/**
 * Merge two result sets without losing any session. When both sides finished
 * the same session, the earlier completion wins: the table records a
 * learner's first pass, and so does this merge.
 */
export function mergeSessionResults(a: SessionResults, b: SessionResults): SessionResults {
  const merged: SessionResults = {};
  for (const [id, result] of [...Object.entries(a), ...Object.entries(b)]) {
    if (!isResult(result)) continue;
    const existing = merged[id];
    if (!existing || Date.parse(result.completedAt) < Date.parse(existing.completedAt)) {
      merged[id] = result;
    }
  }
  return merged;
}

/** Results present in `local` but missing from `remote`, ready to insert. */
export function missingRows(local: SessionResults, remote: SessionResults): SessionCompletionRow[] {
  return Object.entries(local)
    .filter(([id, result]) => !remote[id] && isResult(result))
    .map(([id, r]) => ({
      session_id: id,
      completed_at: r.completedAt,
      accuracy: r.accuracy,
      duration_ms: Math.round(r.durationMs),
    }));
}

/** The learner's saved session results, or null if unavailable. */
export async function fetchRemoteSessionResults(
  supabase: SupabaseClient,
  userId: string
): Promise<SessionResults | null> {
  const { data, error } = await supabase
    .from("session_completions")
    .select("session_id, completed_at, accuracy, duration_ms")
    .eq("user_id", userId);
  if (error || !data) return null;
  const results: SessionResults = {};
  for (const row of data as SessionCompletionRow[]) {
    results[row.session_id] = {
      completedAt: row.completed_at,
      accuracy: row.accuracy,
      durationMs: row.duration_ms,
    };
  }
  return results;
}

/**
 * Insert completions the cloud doesn't have yet. Existing rows are left
 * alone (first pass wins), and failures only warn: if migration 0014 hasn't
 * run, sessions keep working from localStorage.
 */
export async function pushSessionResults(
  supabase: SupabaseClient,
  userId: string,
  local: SessionResults,
  remote: SessionResults = {}
): Promise<void> {
  const rows = missingRows(local, remote).map((row) => ({ ...row, user_id: userId }));
  if (rows.length === 0) return;
  const { error } = await supabase
    .from("session_completions")
    .upsert(rows, { onConflict: "user_id,session_id", ignoreDuplicates: true });
  if (error) console.warn("[sessions] results not synced:", error.message);
}

/**
 * Reconcile local and cloud results on sign-in: pull the cloud copy, merge
 * it into localStorage, and push anything only this device knows about.
 * Returns the merged results, or null when the cloud is unreachable.
 */
export async function syncSessionResults(
  supabase: SupabaseClient,
  userId: string,
  local: SessionResults
): Promise<SessionResults | null> {
  const remote = await fetchRemoteSessionResults(supabase, userId);
  if (!remote) {
    await pushSessionResults(supabase, userId, local);
    return null;
  }
  await pushSessionResults(supabase, userId, local, remote);
  return mergeSessionResults(remote, local);
}
