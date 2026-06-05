/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session so users can manage/cancel their
 * subscription without contacting support.
 *
 * Body: { customerId: string }
 * Returns: { url: string }
 *
 * ── Setup ────────────────────────────────────────────────────────────────
 * Enable the Customer Portal at:
 *   https://dashboard.stripe.com/settings/billing/portal
 * Turn on "Cancel subscriptions" and "Update subscriptions".
 * ─────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe, BASE_URL } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json() as { customerId: string };

    if (!customerId) {
      return NextResponse.json({ error: "customerId required" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${BASE_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
