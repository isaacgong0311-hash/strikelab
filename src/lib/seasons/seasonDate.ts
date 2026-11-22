/**
 * Season dates (`seasons.starts_on` / `ends_on`) are calendar days in US
 * Eastern: weeks open at midnight and the last one closes at 11:59pm New York
 * time (supabase/seed/season-1.sql). Comparing them with today's UTC date ends
 * a season at 7pm Eastern on its last day, so every "is this season over?"
 * check goes through here instead.
 */
export const SEASON_TIME_ZONE = "America/New_York";

const EASTERN_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: SEASON_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's date in New York as YYYY-MM-DD, comparable with `ends_on`. */
export function seasonDate(now: Date): string {
  const parts = Object.fromEntries(EASTERN_DAY.formatToParts(now).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * A season is over once its last challenge has closed. With the challenges'
 * `closes_at` to hand, that is the test; without them, it is over once its
 * last day (`ends_on`) has passed in New York.
 */
export function seasonIsOver(now: Date, endsOn: string, closesAt: readonly string[] = []): boolean {
  const closes = closesAt.map((iso) => Date.parse(iso)).filter((ms) => Number.isFinite(ms));
  if (closes.length > 0) return now.getTime() >= Math.max(...closes);
  return endsOn < seasonDate(now);
}
