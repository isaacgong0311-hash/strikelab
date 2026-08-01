import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import type { SupabaseClient } from "@supabase/supabase-js";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * Server-only. Never import this into client components. Used exclusively by
 * the Stripe webhook to write subscription state, since that request has no
 * user session to authenticate as.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
