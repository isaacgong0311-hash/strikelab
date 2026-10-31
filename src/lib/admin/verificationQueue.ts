export interface CapstoneCandidateRow {
  id: string; user_id: string; title: string; status: string; submitted_at: string | null;
  thesis: string; code: string; result_summary: string; reflection: string;
}
export interface SeasonCandidateRow { id: string; title: string; ends_on: string }
export interface BoardCandidateRow { rank: number; handle: string }
export interface ProfileCandidateRow { id: string; handle: string | null }
export interface VerificationCandidateRow { user_id: string; kind: string; subject_id: string }

export interface VerificationCandidate {
  kind: "capstone" | "placing";
  userId: string;
  subjectId: string;
  handle: string;
  title: string;
  submittedAt?: string | null;
  rank?: number;
  thesis?: string;
  code?: string;
  resultSummary?: string;
  reflection?: string;
}

export function buildVerificationQueue(
  today: string,
  capstones: CapstoneCandidateRow[],
  seasons: SeasonCandidateRow[],
  boards: Record<string, BoardCandidateRow[]>,
  profiles: ProfileCandidateRow[],
  verifications: VerificationCandidateRow[],
): { capstones: VerificationCandidate[]; placings: VerificationCandidate[] } {
  const handles = new Map(profiles.map((profile) => [profile.id, profile.handle ?? "No handle"]));
  const idsByHandle = new Map(profiles.filter((profile) => profile.handle).map((profile) => [profile.handle, profile.id]));
  const verified = new Set(verifications.map((row) => `${row.user_id}:${row.kind}:${row.subject_id}`));
  return {
    // Migration 0019 scopes capstones to classes, not seasons. Include every
    // submitted capstone rather than inventing a season association.
    capstones: capstones.filter((row) => row.status === "submitted" && !verified.has(`${row.user_id}:capstone:${row.id}`))
      .map((row) => ({ kind: "capstone", userId: row.user_id, subjectId: row.id,
        handle: handles.get(row.user_id) ?? "No handle", title: row.title || "Untitled capstone",
        submittedAt: row.submitted_at, thesis: row.thesis, code: row.code,
        resultSummary: row.result_summary, reflection: row.reflection,
      })),
    placings: seasons.filter((season) => season.ends_on < today).flatMap((season) =>
      (boards[season.id] ?? []).filter((row) => Number.isInteger(row.rank) && row.rank >= 1 && row.rank <= 10)
        .flatMap((row) => {
          const userId = idsByHandle.get(row.handle);
          const subjectId = `${season.id}:${row.rank}`;
          return userId && !verified.has(`${userId}:placing:${subjectId}`)
            ? [{ kind: "placing" as const, userId, subjectId, handle: row.handle, title: season.title, rank: row.rank }]
            : [];
        })
    ),
  };
}
