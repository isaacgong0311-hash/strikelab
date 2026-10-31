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
