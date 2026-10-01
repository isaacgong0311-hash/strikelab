/**
 * Who may open founder-only pages (/admin/*): the Supabase user ids listed in
 * FOUNDER_USER_IDS (comma- or space-separated). Ids, not emails: an id can't be
 * claimed by signing up, while an email can be if sign-up confirmation is ever
 * turned off. Unset or empty means nobody, so the pages 404 for everyone.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function parseFounderIds(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => UUID.test(s))
  );
}

export function isFounder(userId: string | null | undefined, raw: string | undefined = process.env.FOUNDER_USER_IDS): boolean {
  if (!userId) return false;
  return parseFounderIds(raw).has(userId.toLowerCase());
}
