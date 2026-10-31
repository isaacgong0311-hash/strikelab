import { TRACKS } from "@/lib/tracks";

export interface RecordSeasonRow { id: string; title: string; ends_on: string }
export interface RecordChallengeRow { id: string; season_id: string; week: number }
export interface RecordAttemptRow { challenge_id: string; status: string; official_score: number | null }
export interface RecordVerificationRow { kind: string; subject_id: string; verified_at: string }
export interface RecordCapstoneRow { id: string; title: string; status: string; submitted_at: string | null }
export interface RecordCertificateRow { id: string; track_id: string; issued_at: string }

export interface RecordView {
  seasons: {
    id: string; title: string; finished: boolean; scoredCount: number;
    scores: { week: number; score: number }[]; rank: number | null; placingVerified: boolean;
  }[];
  capstones: { id: string; title: string; submittedAt: string | null; verifiedAt: string | null }[];
  certificates: { id: string; title: string; issuedAt: string; href: string }[];
}

/** A placing is verified only for the final top-10 rank that was reviewed. */
export function buildRecordView(
  today: string,
  seasons: RecordSeasonRow[],
  challenges: RecordChallengeRow[],
  attempts: RecordAttemptRow[],
  ranks: Record<string, number | null>,
  verifications: RecordVerificationRow[],
  capstones: RecordCapstoneRow[],
  certificates: RecordCertificateRow[],
): RecordView {
  const attemptByChallenge = new Map(attempts.map((attempt) => [attempt.challenge_id, attempt]));
  const verified = new Map(verifications.map((row) => [`${row.kind}:${row.subject_id}`, row.verified_at]));
  const playedSeasonIds = new Set(challenges.filter((challenge) => attemptByChallenge.has(challenge.id)).map((challenge) => challenge.season_id));
  return {
    seasons: seasons.filter((season) => playedSeasonIds.has(season.id)).map((season) => {
      const scores = challenges
        .filter((challenge) => challenge.season_id === season.id)
        .flatMap((challenge) => {
          const attempt = attemptByChallenge.get(challenge.id);
          return attempt?.status === "scored" && attempt.official_score !== null
            ? [{ week: challenge.week, score: attempt.official_score }]
            : [];
        }).sort((a, b) => a.week - b.week);
      const rank = ranks[season.id] ?? null;
      const finished = season.ends_on < today;
      return {
        id: season.id, title: season.title, finished, scoredCount: scores.length, scores, rank,
        placingVerified: finished && rank !== null && rank >= 1 && rank <= 10
          && verified.has(`placing:${season.id}:${rank}`),
      };
    }),
    capstones: capstones.filter((row) => row.status === "submitted").map((row) => ({
      id: row.id, title: row.title || "Untitled capstone", submittedAt: row.submitted_at,
      verifiedAt: verified.get(`capstone:${row.id}`) ?? null,
    })),
    certificates: certificates.map((row) => ({
      id: row.id,
      title: TRACKS.find((track) => track.id === row.track_id)?.title ?? row.track_id,
      issuedAt: row.issued_at,
      href: `/certificate/${encodeURIComponent(row.id)}`,
    })),
  };
}
