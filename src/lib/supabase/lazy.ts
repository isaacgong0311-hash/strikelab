"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";

/**
 * The browser Supabase client, loaded on demand (work plan 2026-09-29, AG4).
 * supabase-js is about 60 KB gzipped; importing it statically from the root
 * layout put it on every page, including for signed-out visitors, who are
 * most visitors. Code that runs on public pages goes through this instead
 * of importing ./client directly.
 */
let loading: Promise<SupabaseClient | null> | null = null;

export function loadSupabaseBrowser(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  loading ??= import("./client").then((m) => m.getSupabaseBrowser());
  return loading;
}

/**
 * Whether this browser holds a Supabase session cookie (`sb-<ref>-auth-token`,
 * possibly split into `.0`, `.1` chunks by @supabase/ssr). No cookie means
 * signed out, so there's nothing to load. A stale cookie just means loading
 * the client and finding no session, which is the old behavior.
 */
export function hasSupabaseSessionCookie(cookie: string = typeof document === "undefined" ? "" : document.cookie): boolean {
  return /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/.test(cookie);
}
