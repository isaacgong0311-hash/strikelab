/**
 * Stripe singleton — import this everywhere server-side instead of
 * constructing a new Stripe() instance per request.
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️  STRIPE_SECRET_KEY is not set. Stripe calls will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
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
