import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Exercise code synced across devices (migration 0018). localStorage stays
 * the first copy: it works signed-out, offline and before the migration
 * runs. The account copy lets a student switch devices.
 */

export const MAX_CODE_LENGTH = 50_000;

export interface CodeCopy {
  code: string;
  /** ISO timestamp of the last edit, or null for legacy drafts saved before timestamps. */
  updatedAt: string | null;
}

export interface RemoteSubmission extends CodeCopy {
  lastPassedAt: string | null;
}

/**
 * Which copy to open with. The newer edit wins; a legacy local draft (no
 * timestamp) only beats the account copy when there is no account copy.
 * Identical code is never a conflict.
 */
export function chooseInitialCode(
  local: CodeCopy | null,
  remote: CodeCopy | null,
  starter: string
): { code: string; source: "local" | "remote" | "starter" } {
  if (!local && !remote) return { code: starter, source: "starter" };
  if (!remote) return { code: local!.code, source: "local" };
  if (!local) return { code: remote.code, source: "remote" };
  if (local.code === remote.code) return { code: local.code, source: "local" };
  const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
  const remoteTime = remote.updatedAt ? Date.parse(remote.updatedAt) : 0;
  return localTime > remoteTime ? { code: local.code, source: "local" } : { code: remote.code, source: "remote" };
}

const CODE_KEY_PREFIX = "strikelab_code_";
const CODE_AT_PREFIX = "strikelab_code_at_";

export function readLocalCode(lessonId: string): CodeCopy | null {
  try {
    const code = localStorage.getItem(CODE_KEY_PREFIX + lessonId);
    if (code === null) return null;
    return { code, updatedAt: localStorage.getItem(CODE_AT_PREFIX + lessonId) };
  } catch {
    return null;
  }
}

export function writeLocalCode(lessonId: string, copy: CodeCopy): void {
  try {
    localStorage.setItem(CODE_KEY_PREFIX + lessonId, copy.code);
    if (copy.updatedAt) localStorage.setItem(CODE_AT_PREFIX + lessonId, copy.updatedAt);
  } catch {
    // Private mode or quota: the editor still holds the code in memory.
  }
}

/** The account copy, `null` when there is none, or `undefined` when the cloud is unavailable. */
export async function fetchSubmission(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string
): Promise<RemoteSubmission | null | undefined> {
  const { data, error } = await supabase
    .from("lesson_submissions")
    .select("code, updated_at, last_passed_at")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) return undefined;
  if (!data) return null;
  return {
    code: data.code as string,
    updatedAt: (data.updated_at as string | null) ?? null,
    lastPassedAt: (data.last_passed_at as string | null) ?? null,
  };
}

export type SaveResult = "saved" | "unavailable" | "failed";

/**
 * Upsert the account copy. "unavailable" means the table isn't there yet
 * (migration 0018 not applied), which the UI treats as device-only rather
 * than an error worth alarming a student about.
 */
export async function saveSubmission(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string,
  copy: CodeCopy,
  passed = false
): Promise<SaveResult> {
  const row: Record<string, unknown> = {
    user_id: userId,
    lesson_id: lessonId,
    code: copy.code.slice(0, MAX_CODE_LENGTH),
    updated_at: copy.updatedAt ?? new Date().toISOString(),
  };
  if (passed) row.last_passed_at = new Date().toISOString();
  const { error } = await supabase.from("lesson_submissions").upsert(row, { onConflict: "user_id,lesson_id" });
  if (!error) return "saved";
  // 42P01: undefined table; PGRST205: table not in the schema cache.
  if (error.code === "42P01" || error.code === "PGRST205") return "unavailable";
  return "failed";
}
