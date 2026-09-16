import type { ProgressPayload } from "./sync";

/**
 * Streak and activity-day math, kept pure so it can be tested across time
 * zones. Every "day" is the learner's LOCAL calendar day: a student in Texas
 * finishing a lesson at 7:30pm must get credit for today, not for tomorrow's
 * UTC date (which is what `toISOString()` produced before).
 */

const dayKeyFormatters = new Map<string, Intl.DateTimeFormat>();

/** "YYYY-MM-DD" for `date` in `timeZone` (IANA), or the device zone when omitted. */
export function localDateKey(date: Date, timeZone?: string): string {
  const cacheKey = timeZone ?? "";
  let fmt = dayKeyFormatters.get(cacheKey);
  if (!fmt) {
    // en-CA formats as YYYY-MM-DD.
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dayKeyFormatters.set(cacheKey, fmt);
  }
  return fmt.format(date);
}

/** Shift a "YYYY-MM-DD" key by whole calendar days (DST-safe: pure date math). */
export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}

/** The last `count` local day keys, oldest first, ending today. */
export function recentDayKeys(count: number, now: Date, timeZone?: string): string[] {
  const today = localDateKey(now, timeZone);
  return Array.from({ length: count }, (_, i) => addDaysToKey(today, i - (count - 1)));
}

/** The streak as of `now`: kept if the last activity was today or yesterday, else 0. */
export function resolveStreak(
  state: Pick<ProgressPayload, "streak" | "lastActivityDate">,
  now: Date,
  timeZone?: string
): number {
  if (!state.lastActivityDate) return 0;
  const today = localDateKey(now, timeZone);
  if (state.lastActivityDate === today || state.lastActivityDate === addDaysToKey(today, -1)) {
    return state.streak;
  }
  return 0;
}

/**
 * Apply one activity (a lesson completion) at `now` to the streak fields.
 * `lastActivityDate` can sit in the "future" relative to `now` when a learner
 * travels west after being active; that counts as already active today.
 */
export function applyActivity(
  prev: ProgressPayload,
  now: Date,
  timeZone?: string
): Pick<ProgressPayload, "streak" | "lastActivityDate" | "activityByDate"> {
  const today = localDateKey(now, timeZone);
  const last = prev.lastActivityDate;

  let streak: number;
  let lastActivityDate: string;
  if (last && last >= today) {
    streak = Math.max(prev.streak, 1);
    lastActivityDate = last;
  } else if (last === addDaysToKey(today, -1)) {
    streak = prev.streak + 1;
    lastActivityDate = today;
  } else {
    streak = 1;
    lastActivityDate = today;
  }

  return {
    streak,
    lastActivityDate,
    activityByDate: {
      ...prev.activityByDate,
      [today]: (prev.activityByDate[today] ?? 0) + 1,
    },
  };
}
