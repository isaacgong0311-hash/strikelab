/**
 * Shown on /seasons only while no season exists in the database yet. These are
 * the dates in the proving-ground spec; change them here if the plan moves.
 */
export const PLANNED_SEASON = {
  title: "Season 1",
  startsOn: "2026-11-30",
  endsOn: "2026-12-20",
} as const;

/** "Nov 30", read in UTC so the date never slips a day by timezone. */
export function shortSeasonDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export type SeasonPhase = { kind: "upcoming"; days: number } | { kind: "live" } | { kind: "ended" };

/**
 * Where a season is right now, for the page's headline. Weeks open at midnight
 * Eastern and the last one closes at 11:59pm, so dates are read at -05:00 (the
 * season runs in winter; the hour of error in another season doesn't matter at
 * a granularity of days).
 */
export function seasonPhase(now: Date, startsOn: string, endsOn: string): SeasonPhase {
  const start = Date.parse(`${startsOn}T00:00:00-05:00`);
  const end = Date.parse(`${endsOn}T23:59:00-05:00`);
  const t = now.getTime();
  if (t < start) return { kind: "upcoming", days: Math.ceil((start - t) / 86_400_000) };
  return t < end ? { kind: "live" } : { kind: "ended" };
}
