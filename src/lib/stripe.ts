/**
 * Stripe singleton — import this everywhere server-side instead of
 * constructing a new Stripe() instance per request.
 */
import Stripe from "stripe";
import { SITE_URL } from "./site";

/**
 * Whether payments are configured at all.
 *
 * This used to `throw` at module load when STRIPE_SECRET_KEY was missing in
 * production. That turns an unconfigured optional integration into a hard 500
 * on every route that imports this module — including /api/stripe/status,
 * which every page calls on load via useSubscription(). Callers should check
 * this flag and return a clean 503 instead.
 */
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

if (!isStripeConfigured) {
  console.warn("⚠️  STRIPE_SECRET_KEY is not set — payment routes will report 503.");
}

// `||`, not `??` — an unset-but-present env var (e.g. `STRIPE_SECRET_KEY=`
// in .env.local) is an empty string, which `??` would pass straight through
// to the Stripe SDK and crash the build/server on construction.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  typescript: true,
});

/** Price IDs from your Stripe dashboard */
export const PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
  school: process.env.STRIPE_SCHOOL_PRICE_ID ?? "",
} as const;

/**
 * Origin used for Stripe redirect URLs.
 *
 * Production resolves to the canonical domain rather than VERCEL_URL, which is
 * the per-deployment hostname (strikelab-<hash>.vercel.app) — buyers should
 * land back on strikelab.dev. Previews still use their own deployment URL so
 * a test checkout returns to the build under test.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_ENV === "production"
    ? SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
