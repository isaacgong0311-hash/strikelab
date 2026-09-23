import type { SupabaseClient } from "@supabase/supabase-js";

export interface SubscriptionFields {
  stripe_subscription_id: string;
  plan: string | null;
  status: string;
  current_period_end: string | null;
}

/**
 * Updates subscription status/plan for an existing row, keyed by
 * `stripe_customer_id`. Deliberately an UPDATE (not upsert) — this event
 * type never carries a Supabase user id, so it can't create the row itself.
 * The row is expected to already exist via `linkCustomerToUser`; if it
 * doesn't yet (out-of-order webhook delivery), this is a no-op and the
 * next subscription event reconciles it.
 *
 * Ordering: Stripe can deliver an older subscription event after a newer
 * one. The update only applies when this event is at least as new as the
 * last one written (`last_event_created`, migration 0020), checked in the
 * same UPDATE so it's atomic. Before that migration runs the column doesn't
 * exist, and the update falls back to the unguarded write.
 */
export async function applySubscriptionEvent(
  admin: SupabaseClient,
  customerId: string,
  fields: SubscriptionFields,
  eventCreated: number,
): Promise<"applied" | "stale" | "missing" | "error"> {
  const guarded = await admin
    .from("subscriptions")
    .update({ ...fields, last_event_created: eventCreated, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId)
    .or(`last_event_created.is.null,last_event_created.lte.${Math.floor(eventCreated)}`)
    .select("user_id");

  let result = guarded;
  // 42703 / PGRST204: last_event_created doesn't exist yet (0020 not applied).
  if (guarded.error && (guarded.error.code === "42703" || guarded.error.code === "PGRST204")) {
    result = await admin
      .from("subscriptions")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("stripe_customer_id", customerId)
      .select("user_id");
  }

  if (result.error) {
    console.error("[webhook] Failed to update subscription:", result.error.message);
    return "error";
  }
  if (result.data && result.data.length > 0) return "applied";

  // Nothing updated: either no row yet, or this event is older than the last one applied.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (existing) {
    console.warn(`[webhook] Ignored stale event for customer ${customerId} (created ${eventCreated})`);
    return "stale";
  }
  console.warn(`[webhook] No subscription row yet for customer ${customerId} — will reconcile on next event`);
  return "missing";
}
