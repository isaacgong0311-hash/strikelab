# Stripe go-live checklist

Code is ready — audited `src/lib/stripe.ts`, `checkout/route.ts`, `webhook/route.ts`,
`portal/route.ts`, `status/route.ts` on 2026-08-13. No bugs found: signature
verification is correct, subscription writes are idempotent (upsert by `user_id`,
update by `stripe_customer_id`), entitlement checks read from your DB not the
client, and every payment route fails clean (503) when unconfigured instead of
crashing. This is just the keys.

## Steps (you do this part — I can't create accounts or hold live API keys)

1. **Get keys**: [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) → copy
   `sk_live_...` (or `sk_test_...` to dry-run first).
2. **Create products**: [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
   - "StrikeLab Pro" — recurring, $9/mo → copy the Price ID (`price_...`)
   - "StrikeLab School" — recurring, $499/yr → copy the Price ID
3. **Add webhook endpoint**: [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → Add endpoint
   - URL: `https://strikelab.dev/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.payment_failed`
   - Copy the signing secret (`whsec_...`)
4. **Enable Customer Portal**: [dashboard.stripe.com/settings/billing/portal](https://dashboard.stripe.com/settings/billing/portal)
   — turn on "Cancel subscriptions" and "Update subscriptions"
5. **Set Vercel env vars** (Production): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `STRIPE_PRO_PRICE_ID`, `STRIPE_SCHOOL_PRICE_ID`. Redeploy.

## Verify after deploy

- `GET /api/stripe/status` while signed out → `{isPro: false, ...}`, not a 500
- Buy the Pro plan with a [Stripe test card](https://docs.stripe.com/testing) (`4242 4242 4242 4242`) in test mode first
- Confirm the `subscriptions` row appears in Supabase after checkout
- Confirm `/dashboard` shows Pro state, and the portal link works to cancel

## One thing worth deciding, not fixing

School tier is "Contact Sales" (mailto), fulfilled manually — no seat/invite
system exists. Fine for the first schools, but worth knowing you're the
provisioning system right now. Not urgent at your current volume.
