import type { SupabaseClient } from "@supabase/supabase-js";
import { aiAllowedForUser } from "@/lib/ai/classPolicy";
import { isMissingSchemaError } from "@/lib/supabase/missingSchema";

const DAILY_HINT_CAP = 20;

/**
 * Checks and increments today's hint count. This lives outside the route module
 * because Next.js route modules may only export supported route fields.
 */
export async function consumeHintQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  // A class leader's "tutor off" also covers hints (migration 0023).
  if (!(await aiAllowedForUser(supabase))) return false;

  const { data, error } = await supabase
    .rpc("consume_hint_quota", { p_user_id: userId, p_cap: DAILY_HINT_CAP })
    .single();

  // Same rule as the AI budget (src/lib/ai/quota.ts): a missing function
  // allows, any other failure refuses. Refused hints fall back to the canned
  // hint, so the student still gets help.
  if (error && isMissingSchemaError(error)) return true;
  if (error || !data) {
    console.error("[ai/hint] consume_hint_quota failed, using canned hint:", error?.message);
    return false;
  }

  return (data as { new_count: number; allowed: boolean }).allowed;
}
