import type { SupabaseClient } from "@supabase/supabase-js";

const DAILY_HINT_CAP = 20;

/**
 * Checks and increments today's hint count. This lives outside the route module
 * because Next.js route modules may only export supported route fields.
 */
export async function consumeHintQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc("consume_hint_quota", { p_user_id: userId, p_cap: DAILY_HINT_CAP })
    .single();

  if (error || !data) {
    console.error("[ai/hint] consume_hint_quota failed:", error?.message);
    return true;
  }

  return (data as { new_count: number; allowed: boolean }).allowed;
}
