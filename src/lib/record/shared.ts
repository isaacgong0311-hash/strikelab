type SharedItem = { kind?: unknown; subject_id?: unknown; verified_at?: unknown };

export interface SharedRecord {
  handle: string;
  verifiedCount: number;
  bestPlacing: number | null;
  /** The most recent verification, or null when nothing on the record is verified yet. */
  lastVerifiedAt: string | null;
  /** seasonId is a public schedule id (0024 seasons are public rows), never a user or review id. */
  placings: { seasonId: string; rank: number; verifiedAt: string }[];
  capstones: { verifiedAt: string }[];
}

/** Build a public view without carrying private subject IDs or review data into JSX. */
export function buildSharedRecord(row: { handle?: unknown; items?: unknown } | null): SharedRecord | null {
  if (!row || typeof row.handle !== "string" || !row.handle.trim()) return null;
  const placings: SharedRecord["placings"] = [];
  const capstones: SharedRecord["capstones"] = [];
  for (const item of Array.isArray(row.items) ? row.items as SharedItem[] : []) {
    if (!item || typeof item.verified_at !== "string" || !Number.isFinite(Date.parse(item.verified_at))) continue;
    if (item.kind === "capstone") {
      capstones.push({ verifiedAt: item.verified_at });
    } else if (item.kind === "placing" && typeof item.subject_id === "string") {
      // Placing subjects are `<season id>:<rank>` (src/app/api/admin/verify/route.ts).
      const match = /^([a-z0-9-]{2,40}):([1-9][0-9]*)$/.exec(item.subject_id);
      if (match) {
        const rank = Number(match[2]);
        if (Number.isSafeInteger(rank) && rank <= 10) placings.push({ seasonId: match[1], rank, verifiedAt: item.verified_at });
      }
    }
  }
  placings.sort((a, b) => a.rank - b.rank || b.verifiedAt.localeCompare(a.verifiedAt));
  capstones.sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
  const dates = [...placings, ...capstones].map((item) => item.verifiedAt).sort((a, b) => Date.parse(b) - Date.parse(a));
  return {
    handle: row.handle,
    verifiedCount: placings.length + capstones.length,
    bestPlacing: placings[0]?.rank ?? null,
    lastVerifiedAt: dates[0] ?? null,
    placings,
    capstones,
  };
}
