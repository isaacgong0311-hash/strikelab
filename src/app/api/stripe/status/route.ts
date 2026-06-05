/**
 * GET /api/stripe/status?email=you@example.com
 *     OR
 * GET /api/stripe/status?customerId=cus_xxx
 *
 * Returns the user's current subscription status so the client can
 * gate Pro features without a database.
 *
 * Response:
 *   { isPro: boolean; plan: "pro" | "school" | null; customerId: string | null;
 *     status: Stripe.Subscription.Status | null }
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const customerId = searchParams.get("customerId");

  if (!email && !customerId) {
    return NextResponse.json({ isPro: false, plan: null, customerId: null, status: null });
  }

  try {
    let cid = customerId;

    // Look up customer by email if we don't have a customer ID
    if (!cid && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      cid = customers.data[0]?.id ?? null;
    }

    if (!cid) {
      return NextResponse.json({ isPro: false, plan: null, customerId: null, status: null });
    }

    // Fetch active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: cid,
      status: "all",
      limit: 5,
    });

    const active = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing",
    );

    if (!active) {
      return NextResponse.json({ isPro: false, plan: null, customerId: cid, status: null });
    }

    // Determine plan from price ID
    const priceId = active.items.data[0]?.price.id;
    const plan =
      priceId === process.env.STRIPE_SCHOOL_PRICE_ID ? "school"
      : priceId === process.env.STRIPE_PRO_PRICE_ID ? "pro"
      : "pro"; // default to pro if price ID matches anything active

    return NextResponse.json({
      isPro: true,
      plan,
      customerId: cid,
      status: active.status,
      trialEnd: active.trial_end,
    });
  } catch (err) {
    console.error("[stripe/status]", err);
    // Fail open — don't block the user on a Stripe error
    return NextResponse.json({ isPro: false, plan: null, customerId: null, status: null });
  }
}
