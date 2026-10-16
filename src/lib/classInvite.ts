import type { SupabaseClient } from "@supabase/supabase-js";

// Mirrors CODE_ALPHABET in classes.ts: no I, O, 0 or 1.
export const INVITE_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

export interface InvitedClass {
  id: string;
  name: string;
  template_id: string | null;
  starts_on: string | null;
}

/**
 * What the invite page can truthfully say. "unavailable" matters at a live
 * kickoff: a missing env var or a database outage used to render as "that
 * invite link doesn't match a class", which sends 25 students to their
 * teacher with a perfectly good link.
 */
export type InviteLookup =
  | { kind: "found"; klass: InvitedClass }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export async function lookupInvite(admin: SupabaseClient | null, code: string): Promise<InviteLookup> {
  if (!INVITE_CODE_PATTERN.test(code)) return { kind: "not-found" };
  if (!admin) return { kind: "unavailable" };
  try {
    const { data, error } = await admin
      .from("classes")
      .select("id, name, template_id, starts_on")
      .eq("join_code", code)
      .maybeSingle();
    if (error) return { kind: "unavailable" };
    return data ? { kind: "found", klass: data as InvitedClass } : { kind: "not-found" };
  } catch {
    return { kind: "unavailable" };
  }
}
