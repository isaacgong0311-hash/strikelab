/**
 * GET /api/stripe/status
 *
 * Returns the signed-in user's subscription status, read from
 * `public.subscriptions` (kept up to date by the webhook) rather than
 * querying Stripe live. Requires an authenticated Supabase session — there
 * is no way to look up another user's subscription by email/customer id.
 *
 * Response:
 *   { isPro: boolean; plan: "pro" | "school" | null; customerId: string | null;
 *     status: string | null }
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    // Not signed in — treat as no subscription rather than erroring, so the
    // client can render the free tier without a hard failure.
    return NextResponse.json({ isPro: false, plan: null, customerId: null, status: null });
  }

  const { data, error } = await auth.supabase
    .from("subscriptions")
    .select("stripe_customer_id, plan, status")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) {
    console.error("[stripe/status]", error.message);
    // Fail open — don't block the user on a transient DB error.
    return NextResponse.json({ isPro: false, plan: null, customerId: null, status: null });
  }

  if (!data || !data.status || !ACTIVE_STATUSES.has(data.status)) {
    return NextResponse.json({
      isPro: false,
      plan: null,
      customerId: data?.stripe_customer_id ?? null,
      status: data?.status ?? null,
    });
  }

  return NextResponse.json({
    isPro: true,
    plan: data.plan,
    customerId: data.stripe_customer_id,
    status: data.status,
  });
}
