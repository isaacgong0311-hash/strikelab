import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/** Limits per bucket: [max requests, window in seconds]. */
export const RATE_LIMITS = {
  "class-join": [10, 600],
  "class-create": [20, 3600],
  "class-launch": [30, 3600],
  "capstone-save": [600, 3600],
  "capstone-share": [20, 3600],
  "account-delete": [5, 3600],
} as const satisfies Record<string, readonly [number, number]>;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

/**
 * Count one request against the signed-in user's bucket (migration 0021).
 * Returns a 429 response when over the limit, else null. Fails open when
 * the limiter itself is unavailable (e.g. before the migration is applied),
 * so a missing table never locks students out.
 */
export async function rateLimit(supabase: SupabaseClient, bucket: RateLimitBucket): Promise<NextResponse | null> {
  const [limit, windowSeconds] = RATE_LIMITS[bucket];
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.warn(`[rate-limit] ${bucket} unavailable, allowing:`, error.message);
    return null;
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
