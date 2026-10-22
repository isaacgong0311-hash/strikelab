import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isMissingSchemaError } from "@/lib/supabase/missingSchema";

/** Limits per bucket: [max requests, window in seconds]. */
export const RATE_LIMITS = {
  "class-join": [10, 600],
  "class-create": [20, 3600],
  "class-launch": [30, 3600],
  "class-settings": [60, 3600],
  "season-attempt": [60, 3600],
  "season-handle": [10, 3600],
  "capstone-save": [600, 3600],
  "capstone-share": [20, 3600],
  "account-delete": [5, 3600],
} as const satisfies Record<string, readonly [number, number]>;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

/**
 * Buckets that refuse the request when the limiter itself errors. Joining by
 * invite code is the one an attacker would hammer to guess codes, so it must
 * not lose its limit during a database hiccup. Everything else fails open: a
 * student saving work shouldn't be blocked because the counter is down.
 */
const FAIL_CLOSED: ReadonlySet<RateLimitBucket> = new Set<RateLimitBucket>(["class-join"]);

/**
 * Count one request against the signed-in user's bucket (migration 0021).
 * Returns a 429 response when over the limit, else null. When the limiter
 * itself errors: before migration 0021 is applied it always allows (a missing
 * table never locks students out); after that, FAIL_CLOSED buckets answer 503
 * and the rest allow.
 */
export async function rateLimit(supabase: SupabaseClient, bucket: RateLimitBucket): Promise<NextResponse | null> {
  const [limit, windowSeconds] = RATE_LIMITS[bucket];
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    if (isMissingSchemaError(error) || !FAIL_CLOSED.has(bucket)) {
      console.warn(`[rate-limit] ${bucket} unavailable, allowing:`, error.message);
      return null;
    }
    console.error(`[rate-limit] ${bucket} unavailable, refusing:`, error.message);
    return NextResponse.json(
      { error: "We couldn't check this request just now. Try again in a minute." },
      { status: 503, headers: { "Retry-After": "60" } }
    );
  }
  if (data === false) {
    const minutes = Math.ceil(windowSeconds / 60);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      { status: 429, headers: { "Retry-After": String(windowSeconds) } }
    );
  }
  return null;
}
