/**
 * POST /api/stripe/webhook
 *
 * Receives and verifies Stripe webhook events, and persists subscription
 * state to Supabase (`public.subscriptions`) via the service-role client.
 *
 * ── Setup checklist ────────────────────────────────────────────────────────
 * 1. Go to https://dashboard.stripe.com/webhooks
 * 2. Click "Add endpoint"
 * 3. URL: https://strikelab.dev/api/stripe/webhook
 * 4. Events to listen for:
 *      checkout.session.completed
 *      customer.subscription.created
 *      customer.subscription.updated
 *      customer.subscription.deleted
 *      invoice.payment_failed
 * 5. Copy the "Signing secret" (whsec_...) → set as STRIPE_WEBHOOK_SECRET
 * ──────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

function planFromPriceId(priceId: string | undefined): "pro" | "school" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_SCHOOL_PRICE_ID) return "school";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return null;
}

/** Reads current_period_end off a subscription, handling both old (top-level) and new (item-level) Stripe API shapes. */
function currentPeriodEnd(sub: Stripe.Subscription): string | null {
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const itemLevel = sub.items.data[0]?.current_period_end;
  const seconds = legacy ?? itemLevel;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/**
 * Links a freshly-created Stripe customer to the Supabase user who checked
 * out (from `client_reference_id`). Upserts by `user_id` (the primary key),
 * so this is safe to run first.
 */
async function linkCustomerToUser(userId: string, customerId: string) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[webhook] Supabase admin client not configured — subscription not persisted");
    return;
  }
  const { error } = await admin
    .from("subscriptions")
    .upsert(
      { user_id: userId, stripe_customer_id: customerId, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) console.error("[webhook] Failed to link customer to user:", error.message);
}

/**
 * Updates subscription status/plan for an existing row, keyed by
 * `stripe_customer_id`. Deliberately an UPDATE (not upsert) — this event
 * type never carries a Supabase user id, so it can't create the row itself.
 * The row is expected to already exist via `linkCustomerToUser`; if it
 * doesn't yet (out-of-order webhook delivery), this is a no-op and the
 * next subscription event reconciles it.
 */
async function updateByCustomerId(
  customerId: string,
  fields: {
    stripe_subscription_id: string;
    plan: string | null;
    status: string;
    current_period_end: string | null;
  },
) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[webhook] Supabase admin client not configured — subscription not persisted");
    return;
  }
  const { data, error } = await admin
    .from("subscriptions")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId)
    .select("user_id");
  if (error) {
    console.error("[webhook] Failed to update subscription:", error.message);
  } else if (!data || data.length === 0) {
    console.warn(`[webhook] No subscription row yet for customer ${customerId} — will reconcile on next event`);
  }
}

// Webhooks must read the raw body — Next.js App Router gives us Request.text()
export const runtime = "nodejs"; // ensure Buffer is available

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // ── Handle events ─────────────────────────────────────────────────────────

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        console.log(`[webhook] ✓ Checkout completed: ${session.customer_email} (${session.id})`);
        if (userId && customerId) {
          await linkCustomerToUser(userId, customerId);
        } else {
          console.error(`[webhook] Missing client_reference_id or customer on session ${session.id} — cannot link subscription`);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        console.log(`[webhook] Subscription ${event.type}: ${sub.id} → ${sub.status}`);
        await updateByCustomerId(customerId, {
          stripe_subscription_id: sub.id,
          plan: planFromPriceId(sub.items.data[0]?.price.id),
          status: sub.status,
          current_period_end: currentPeriodEnd(sub),
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        console.log(`[webhook] Subscription cancelled: ${sub.id}`);
        await updateByCustomerId(customerId, {
          stripe_subscription_id: sub.id,
          plan: planFromPriceId(sub.items.data[0]?.price.id),
          status: "canceled",
          current_period_end: currentPeriodEnd(sub),
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[webhook] Payment failed for customer: ${invoice.customer}`);
        // No state change here — the subsequent customer.subscription.updated
        // event (status → "past_due"/"unpaid") is the source of truth.
        break;
      }
      default:
        // Unhandled event — ignore
        break;
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
