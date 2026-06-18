"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Browser-side Supabase client (singleton). Returns null when Supabase isn't
 * configured, so callers can fall back to local-only behavior.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
