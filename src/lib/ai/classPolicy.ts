import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Whether a class leader allows this student to use the AI tutor
 * (migration 0023). The tutor sends a student's question and code to an
 * outside model, so for anyone in a class the answer is "no" until their
 * leader turns it on. Independent students (in no class) are allowed.
 *
 * Fails CLOSED on an unexpected error: for a minor in a class, "I couldn't
 * check" must not mean "yes". The one exception is the function not existing
 * yet (code 42883 / PGRST202, i.e. 0023 not applied): that is the behavior
 * from before this switch, so deploying code ahead of the migration doesn't
 * switch the tutor off for everyone.
 */
export async function aiAllowedForUser(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("ai_tutor_allowed");
  if (error) {
    if (error.code === "42883" || error.code === "PGRST202") return true;
    console.error("[ai/classPolicy] ai_tutor_allowed failed:", error.message);
    return false;
  }
  return data === true;
}
