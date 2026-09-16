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

/** True for IANA zone names the runtime recognises, e.g. "America/Chicago". */
export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== "string" || timeZone.length === 0 || timeZone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Record the learner's timezone on their progress row. Deliberately separate
 * from upsertRemoteProgress and best-effort: if migration 0013 hasn't run yet
 * the unknown column errors here instead of breaking progress sync.
 */
export async function saveProgressTimeZone(
  supabase: SupabaseClient,
  userId: string,
  timeZone: string
): Promise<void> {
  if (!isValidTimeZone(timeZone)) return;
  const { error } = await supabase.from("progress").update({ timezone: timeZone }).eq("user_id", userId);
  if (error) console.warn("[progress] timezone not saved:", error.message);
}

/** The learner's stored timezone, or null if unknown or unavailable. */
export async function fetchProgressTimeZone(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("progress")
    .select("timezone")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const tz = (data as { timezone?: unknown }).timezone;
  return isValidTimeZone(tz) ? tz : null;
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
