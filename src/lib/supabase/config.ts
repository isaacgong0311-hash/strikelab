/**
 * Supabase environment configuration.
 *
 * Everything in the app degrades gracefully when these aren't set: auth is
 * simply disabled and progress falls back to localStorage (the pre-Supabase
 * behavior). This means the site keeps working before you've added the keys
 * to .env.local / Vercel.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when both public Supabase env vars are present. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
