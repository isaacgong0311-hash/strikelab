/**
 * Public leaderboard handles (proving-ground spec §6): never a real name.
 * The database enforces format and uniqueness (0024); this adds the rules a
 * regex can't: reserved words and an obvious-slur filter, checked after
 * undoing common digit swaps. Kept short on purpose: false positives on
 * ordinary words are worse than a rare miss, and the founder can rename.
 */
export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

const RESERVED = new Set([
  "admin", "administrator", "strikelab", "moderator", "mod", "support",
  "staff", "founder", "official", "system", "null", "undefined", "anonymous",
]);

const BLOCKED = ["fuck", "shit", "bitch", "cunt", "nigg", "faggot", "nazi", "porn", "slut", "whore", "pussy"];

export type HandleCheck = { ok: true; handle: string } | { ok: false; error: string };

export function checkHandle(raw: unknown): HandleCheck {
  if (typeof raw !== "string") return { ok: false, error: "Choose a handle" };
  const handle = raw.trim().toLowerCase();
  if (!HANDLE_PATTERN.test(handle)) {
    return { ok: false, error: "Use 3 to 20 characters: lowercase letters, numbers and underscores" };
  }
  if (RESERVED.has(handle)) return { ok: false, error: "That handle is reserved" };
  const squashed = handle
    .replace(/_/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");
  if (BLOCKED.some((w) => squashed.includes(w))) return { ok: false, error: "Pick a different handle" };
  return { ok: true, handle };
}
