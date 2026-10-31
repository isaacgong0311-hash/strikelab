type SharedItem = { kind?: unknown; subject_id?: unknown; verified_at?: unknown };

export interface SharedRecord {
  handle: string;
  verifiedCount: number;
  bestPlacing: number | null;
  placings: { rank: number; verifiedAt: string }[];
  capstones: { verifiedAt: string }[];
}

/** Build a public view without carrying subject IDs or private review data into JSX. */
export function buildSharedRecord(row: { handle?: unknown; items?: unknown } | null): SharedRecord | null {
  if (!row || typeof row.handle !== "string" || !row.handle.trim()) return null;
  const placings: SharedRecord["placings"] = [];
  const capstones: SharedRecord["capstones"] = [];
  for (const item of Array.isArray(row.items) ? row.items as SharedItem[] : []) {
    if (!item || typeof item.verified_at !== "string" || !Number.isFinite(Date.parse(item.verified_at))) continue;
    if (item.kind === "capstone") {
      capstones.push({ verifiedAt: item.verified_at });
    } else if (item.kind === "placing" && typeof item.subject_id === "string") {
      const match = /^.+:([1-9][0-9]*)$/.exec(item.subject_id);
      if (match) {
        const rank = Number(match[1]);
        if (Number.isSafeInteger(rank) && rank <= 10) placings.push({ rank, verifiedAt: item.verified_at });
      }
    }
  }
  placings.sort((a, b) => a.rank - b.rank);
  capstones.sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
  return {
    handle: row.handle,
    verifiedCount: placings.length + capstones.length,
    bestPlacing: placings[0]?.rank ?? null,
    placings,
    capstones,
  };
}
