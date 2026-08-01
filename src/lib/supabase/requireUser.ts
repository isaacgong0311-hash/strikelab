import { getSupabaseServer } from "./server";
import type { SupabaseClient } from "@supabase/supabase-js";

type RequireUserResult =
  | { supabase: SupabaseClient; userId: string }
  | { error: string; status: 401 | 503 };

/**
 * Resolves the authenticated Supabase user from the request's session
 * cookie. Used by any API route that must act on behalf of a specific user
 * (progress sync, subscription status/portal, AI hints).
 */
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "Supabase not configured", status: 503 };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Not authenticated", status: 401 };
  return { supabase, userId: data.user.id };
}
