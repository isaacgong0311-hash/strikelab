/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for the Pro plan.
 * Body: { plan: "pro" | "school", email?: string }
 * Returns: { url: string }
 *
 * ── Setup checklist ────────────────────────────────────────────────────────
 * 1. Go to https://dashboard.stripe.com/products
 * 2. Create a "StrikeLab Pro" product → Recurring · $9 / month
 * 3. Copy the Price ID (price_xxx) → set as STRIPE_PRO_PRICE_ID in .env.local
 * 4. Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...) in .env.local
 * 5. Set NEXT_PUBLIC_BASE_URL=https://strikelabco.vercel.app in .env.local
 * ──────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES, BASE_URL } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { plan?: string; email?: string };
    const plan = body.plan ?? "pro";
    const email = body.email;

    const priceId = plan === "school" ? PRICES.school : PRICES.pro;

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for "${plan}" not configured. Set STRIPE_PRO_PRICE_ID in .env.local` },
        { status: 500 },
      );
    }

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/pricing?cancelled=1`,
      // 7-day free trial for the Pro plan
      subscription_data: plan === "pro" ? { trial_period_days: 7 } : undefined,
      // Pre-fill email if we have it (reduces friction)
      ...(email ? { customer_email: email } : {}),
      // Collect billing address for tax purposes
      billing_address_collection: "auto",
      // Allow promo codes
      allow_promotion_codes: true,
      metadata: { plan, source: "strikelab_web" },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
