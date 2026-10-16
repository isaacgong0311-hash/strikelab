import { cohortWeekWindows } from "./template";

/**
 * Shared by the class page's launch panel and the /teach/new setup: the
 * timezones a leader can pick, date formatting, and the launch call itself.
 */
export const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

export const FALLBACK_TIMEZONE = "America/Chicago";

function isRealTimezone(zone: string | undefined | null): zone is string {
  if (!zone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(0);
    return true;
  } catch {
    return false;
  }
}

/** The leader's own timezone (from their browser) if it is real, else Central. */
export function defaultTimezone(detected: string | undefined | null): string {
  return isRealTimezone(detected) ? detected : FALLBACK_TIMEZONE;
}

/** The picker's options: the common US zones, plus the leader's own if it isn't one of them. */
export function timezoneChoices(detected: string | undefined | null): string[] {
  return isRealTimezone(detected) && !TIMEZONES.includes(detected) ? [...TIMEZONES, detected] : [...TIMEZONES];
}

/** "October 26, 2026", or "Oct 26" without the year. */
export function readableDate(value: string, withYear = true): string {
  return new Intl.DateTimeFormat("en-US", {
    month: withYear ? "long" : "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

/** Last day of the program for a start date and break list, or null if either is invalid. */
export function endDate(startsOn: string, skipWeeks: readonly string[]): string | null {
  try {
    return cohortWeekWindows(startsOn, skipWeeks).at(-1)?.endsOn ?? null;
  } catch {
    return null;
  }
}

export async function postLaunch(classId: string, body: { startsOn: string; timezone: string; skipWeeks: string[] }) {
  const response = await fetch(`/api/classes/${classId}/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Failed to launch cohort");
}
