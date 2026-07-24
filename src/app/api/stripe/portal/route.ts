/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session so users can manage/cancel their
 * subscription without contacting support. Requires an authenticated
 * Supabase session — the Stripe customer id is looked up server-side from
 * that user's `subscriptions` row, never trusted from the request body.
 *
 * Returns: { url: string }
 *
 * ── Setup ────────────────────────────────────────────────────────────────
 * Enable the Customer Portal at:
 *   https://dashboard.stripe.com/settings/billing/portal
 * Turn on "Cancel subscriptions" and "Update subscriptions".
 * ─────────────────────────────────────────────────────────────────────────
 */
import { NextResponse } from "next/server";
import { stripe, BASE_URL } from "@/lib/stripe";
import { requireUser } from "@/lib/supabase/requireUser";

export async function POST() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: "Sign in required" }, { status: auth.status });
  }

  const { data, error: dbError } = await auth.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (dbError || !data?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found for this account" }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${BASE_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
