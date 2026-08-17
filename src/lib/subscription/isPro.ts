import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Single source of truth for "does this user have an active paid plan,"
 * server-side. Previously only /api/stripe/status computed this (for the
 * useSubscription() hook that drives UI gating like the Challenges page's
 * Run-button lock) — Pro-only API routes like /api/challenges/complete had
 * no equivalent check of their own, so the paywall on that feature was
 * enforced only by the client choosing not to call the endpoint. A signed-in
 * free user could always POST to it directly and land on the paid
 * leaderboard for free. Routes that gate a Pro feature should call this.
 */
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export async function isProUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[isProUser]", error.message);
    return false; // fail closed — unlike AI quota, a Pro check should default to "not entitled"
  }

  return Boolean(data?.status && ACTIVE_SUBSCRIPTION_STATUSES.has(data.status));
}
