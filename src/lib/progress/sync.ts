import type { SupabaseClient } from "@supabase/supabase-js";

/** Canonical progress shape, shared by the hook, the API route, and Supabase. */
export interface ProgressPayload {
  completed: string[]; // lesson IDs
  xp: number;
  streak: number;
  lastActivityDate: string | null;
  activityByDate: Record<string, number>; // "YYYY-MM-DD" -> count
}

export const EMPTY_PROGRESS: ProgressPayload = {
  completed: [],
  xp: 0,
  streak: 0,
  lastActivityDate: null,
  activityByDate: {},
};

/** Supabase `progress` table row shape. */
interface ProgressRow {
  user_id: string;
  completed: string[];
  xp: number;
  streak: number;
  last_activity_date: string | null;
  activity_by_date: Record<string, number>;
  updated_at?: string;
}

function rowToPayload(row: ProgressRow): ProgressPayload {
  return {
    completed: Array.isArray(row.completed) ? row.completed : [],
    xp: row.xp ?? 0,
    streak: row.streak ?? 0,
    lastActivityDate: row.last_activity_date ?? null,
    activityByDate: row.activity_by_date ?? {},
  };
}

function payloadToRow(userId: string, p: ProgressPayload): ProgressRow {
  return {
    user_id: userId,
    completed: p.completed,
    xp: p.xp,
    streak: p.streak,
    last_activity_date: p.lastActivityDate,
    activity_by_date: p.activityByDate,
  };
}

/**
 * Merge two progress states without ever losing completions. Used when a
 * signed-in user has local progress that should be reconciled with the cloud.
 */
export function mergeProgress(
  a: ProgressPayload,
  b: ProgressPayload
): ProgressPayload {
  const completed = Array.from(new Set([...a.completed, ...b.completed]));
  const xp = Math.max(a.xp, b.xp);

  const useB =
    !a.lastActivityDate || (b.lastActivityDate ?? "") >= a.lastActivityDate;
  const streak = useB ? b.streak : a.streak;
  const lastActivityDate = useB ? b.lastActivityDate : a.lastActivityDate;

  const activityByDate: Record<string, number> = { ...a.activityByDate };
  for (const [date, count] of Object.entries(b.activityByDate)) {
    activityByDate[date] = Math.max(activityByDate[date] ?? 0, count);
  }

  return { completed, xp, streak, lastActivityDate, activityByDate };
}

/** Read a user's saved progress, or null if none exists. */
export async function fetchRemoteProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgressPayload | null> {
  const { data, error } = await supabase
    .from("progress")
    .select("completed, xp, streak, last_activity_date, activity_by_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToPayload(data as ProgressRow);
}

/** Upsert a user's progress row. */
export async function upsertRemoteProgress(
  supabase: SupabaseClient,
  userId: string,
  payload: ProgressPayload
): Promise<void> {
  await supabase
    .from("progress")
    .upsert(
      { ...payloadToRow(userId, payload), updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
}
