/**
 * POST /api/stripe/webhook
 *
 * Receives and verifies Stripe webhook events.
 *
 * ── Setup checklist ────────────────────────────────────────────────────────
 * 1. Go to https://dashboard.stripe.com/webhooks
 * 2. Click "Add endpoint"
 * 3. URL: https://strikelabco.vercel.app/api/stripe/webhook
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
import type Stripe from "stripe";

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
        console.log(`[webhook] ✓ Checkout completed: ${session.customer_email} (${session.id})`);
        // TODO: if you add a database, upsert the user's subscription status here.
        // For now the client reads subscription status from the Stripe API via /api/stripe/status.
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[webhook] Subscription ${event.type}: ${sub.id} → ${sub.status}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[webhook] Subscription cancelled: ${sub.id}`);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[webhook] Payment failed for customer: ${invoice.customer}`);
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
