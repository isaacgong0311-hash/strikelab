/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for the Pro plan. Requires an
 * authenticated Supabase session — the resulting Stripe customer is linked
 * back to the account via `client_reference_id` so the webhook can persist
 * subscription state against the right user.
 *
 * Body: { plan: "pro" | "school" }
 * Returns: { url: string }
 *
 * ── Setup checklist ────────────────────────────────────────────────────────
 * 1. Go to https://dashboard.stripe.com/products
 * 2. Create a "StrikeLab Pro" product → Recurring · $9 / month
 * 3. Copy the Price ID (price_xxx) → set as STRIPE_PRO_PRICE_ID in .env.local
 * 4. Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...) in .env.local
 * 5. Set NEXT_PUBLIC_BASE_URL=https://strikelab.dev in .env.local
 * ──────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES, BASE_URL, isStripeConfigured } from "@/lib/stripe";
import { requireUser } from "@/lib/supabase/requireUser";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: "Sign in required to start checkout" }, { status: auth.status });
  }

  try {
    const body = await req.json() as { plan?: string };
    const plan = body.plan ?? "pro";

    const priceId = plan === "school" ? PRICES.school : PRICES.pro;

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for "${plan}" not configured. Set STRIPE_PRO_PRICE_ID in .env.local` },
        { status: 500 },
      );
    }

    const { data: userData } = await auth.supabase.auth.getUser();
    const email = userData.user?.email;

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/pricing?cancelled=1`,
      // Links the Stripe customer back to the Supabase user for the webhook.
      client_reference_id: auth.userId,
      // 7-day free trial for the Pro plan
      subscription_data: plan === "pro" ? { trial_period_days: 7 } : undefined,
      // Pre-fill email if we have it (reduces friction)
      ...(email ? { customer_email: email } : {}),
      // Collect billing address for tax purposes
      billing_address_collection: "auto",
      // Allow promo codes
      allow_promotion_codes: true,
      metadata: { plan, source: "strikelab_web", supabase_user_id: auth.userId },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
