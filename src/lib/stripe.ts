/**
 * Stripe singleton — import this everywhere server-side instead of
 * constructing a new Stripe() instance per request.
 */
import Stripe from "stripe";

// NEXT_PHASE is "phase-production-build" during `next build`, when env vars
// that only exist at runtime (e.g. Vercel's Production env target) may not
// be available yet — only fail fast once we're actually serving traffic.
const isProductionRuntime =
  (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") &&
  process.env.NEXT_PHASE !== "phase-production-build";

if (!process.env.STRIPE_SECRET_KEY) {
  if (isProductionRuntime) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set in production. Refusing to start with a placeholder key.",
    );
  }
  console.warn("⚠️  STRIPE_SECRET_KEY is not set. Stripe calls will fail.");
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

/** Your production URL (used for redirect URLs) */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
