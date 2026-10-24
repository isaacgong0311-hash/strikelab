export interface SeasonRecordRow {
  seasonId: string;
  seasonTitle: string;
  solved: number;
  totalScore: number | null;
  rank: number | null;
}

export interface StudentRecord {
  handle: string | null;
  seasons: SeasonRecordRow[];
  capstoneSubmitted: boolean;
  capstoneSubmittedAt: string | null;
}

/** Shapes the flat rows `my_record()`/`get_shared_record()` return into one record. */
export function rowsToRecord(rows: Record<string, unknown>[]): StudentRecord {
  const first = rows[0];
  const seasons = rows
    .filter((r) => r.season_id != null)
    .map((r) => ({
      seasonId: r.season_id as string,
      seasonTitle: r.season_title as string,
      solved: (r.solved as number) ?? 0,
      totalScore: (r.total_score as number | null) ?? null,
      rank: (r.rank as number | null) ?? null,
    }));
  return {
    handle: (first?.handle as string | null) ?? null,
    seasons,
    capstoneSubmitted: Boolean(first?.capstone_submitted),
    capstoneSubmittedAt: (first?.capstone_submitted_at as string | null) ?? null,
  };
}
