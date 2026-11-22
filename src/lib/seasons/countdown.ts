/**
 * The "next challenge opens in …" line on /seasons. Client-safe: no hidden
 * tests or parameters here. The server renders the text at request time; the
 * browser may tick it forward (NextChallenge.tsx).
 */
import { SEASON_TIME_ZONE } from "./seasonDate";
import { secondsLeft } from "./window";

export interface ScheduledWeek {
  id: string;
  week: number;
  opens_at: string;
  closes_at: string;
}

export type NextChallenge =
  | { kind: "opens"; id: string | null; week: number; opensAt: string }
  | { kind: "open"; id: string; week: number; closesAt: string }
  | null;

/**
 * The week that opens next, or the one open right now if every remaining week
 * has opened. With no rows scheduled yet, week 1 opens at midnight Eastern on
 * the planned start day. Null once the last week has closed.
 */
export function nextChallenge(now: Date, weeks: readonly ScheduledWeek[], plannedStart: string | null): NextChallenge {
  const t = now.getTime();
  if (weeks.length === 0) {
    if (!plannedStart) return null;
    const opensAt = new Date(`${plannedStart}T00:00:00-05:00`).toISOString();
    return Date.parse(opensAt) > t ? { kind: "opens", id: null, week: 1, opensAt } : null;
  }
  const sorted = [...weeks].sort((a, b) => Date.parse(a.opens_at) - Date.parse(b.opens_at));
  const upcoming = sorted.find((w) => Date.parse(w.opens_at) > t);
  const open = sorted.find((w) => Date.parse(w.opens_at) <= t && t < Date.parse(w.closes_at));
  // While a week is open, that's what a student needs to know first.
  if (open) return { kind: "open", id: open.id, week: open.week, closesAt: open.closes_at };
  if (upcoming) return { kind: "opens", id: upcoming.id, week: upcoming.week, opensAt: upcoming.opens_at };
  return null;
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Time until `target`: a compact figure for the eye ("7d 14h 03m", "5h 09m",
 * "12m 30s") and the same in words for screen readers.
 */
export function countdown(now: Date, target: string): { compact: string; words: string } {
  const s = secondsLeft(now, target);
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3_600);
  const m = Math.floor((s % 3_600) / 60);
  const sec = s % 60;
  if (d > 0) return { compact: `${d}d ${h}h ${pad(m)}m`, words: `${plural(d, "day")}, ${plural(h, "hour")} and ${plural(m, "minute")}` };
  if (h > 0) return { compact: `${h}h ${pad(m)}m`, words: `${plural(h, "hour")} and ${plural(m, "minute")}` };
  return { compact: `${m}m ${pad(sec)}s`, words: `${plural(m, "minute")} and ${plural(sec, "second")}` };
}

const EASTERN_WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: SEASON_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Mon, Nov 30, 12:00 AM ET": the season's own clock, whatever the reader's. */
export function easternWhen(iso: string): string {
  return `${EASTERN_WHEN.format(new Date(iso))} ET`;
}
