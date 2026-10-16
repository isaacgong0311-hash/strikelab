/**
 * Defense sign-off input (proving-ground spec §3, §6): a reviewer marks a
 * capstone or a top-10 season placing as verified after a short live
 * conversation. Consent is required before anything is saved: a minor's call
 * needs a recorded parent consent, and calls are never one-on-one and private.
 */
export interface DefenseInput {
  handle: string;
  kind: "capstone" | "placing";
  seasonId: string | null;
  outcome: "verified" | "not_verified";
  consentConfirmed: true;
  reviewerLabel: string;
  notes: string | null;
  defendedOn: string;
}

const HANDLE = /^[a-z0-9_]{3,20}$/;
const SEASON = /^[a-z0-9-]{2,40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDefenseInput(raw: unknown, today: string): { ok: true; value: DefenseInput } | { ok: false; error: string } {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const handle = typeof b.handle === "string" ? b.handle.trim().toLowerCase().replace(/^@/, "") : "";
  if (!HANDLE.test(handle)) return { ok: false, error: "Enter the student's handle (3 to 20 lowercase letters, numbers or underscores)." };

  if (b.kind !== "capstone" && b.kind !== "placing") return { ok: false, error: "Choose capstone or season placing." };
  const seasonId = typeof b.seasonId === "string" && b.seasonId.trim() ? b.seasonId.trim() : null;
  if (b.kind === "placing" && (!seasonId || !SEASON.test(seasonId))) return { ok: false, error: "Choose the season for this placing." };

  if (b.outcome !== "verified" && b.outcome !== "not_verified") return { ok: false, error: "Choose verified or not verified." };
  if (b.consentConfirmed !== true) {
    return { ok: false, error: "Confirm a parent's consent was recorded (or the student is 18 or older) before saving." };
  }

  const reviewerLabel = typeof b.reviewerLabel === "string" ? b.reviewerLabel.trim() : "";
  if (reviewerLabel.length < 1 || reviewerLabel.length > 60) return { ok: false, error: "Enter the reviewer's name as it should appear (up to 60 characters)." };

  const notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null;
  if (notes && notes.length > 1000) return { ok: false, error: "Keep notes under 1,000 characters." };

  const defendedOn = typeof b.defendedOn === "string" && b.defendedOn ? b.defendedOn : today;
  if (!DATE.test(defendedOn) || defendedOn > today) return { ok: false, error: "The defense date must be today or earlier." };

  return {
    ok: true,
    value: {
      handle,
      kind: b.kind,
      seasonId: b.kind === "placing" ? seasonId : null,
      outcome: b.outcome,
      consentConfirmed: true,
      reviewerLabel,
      notes,
      defendedOn,
    },
  };
}
