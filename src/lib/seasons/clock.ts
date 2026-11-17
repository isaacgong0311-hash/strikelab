/**
 * Timer helpers for a timed attempt. The deadline is set by the server, so the
 * countdown follows the server's clock, not the student's: a laptop clock that
 * is five minutes slow must not show five minutes the student doesn't have.
 */

/** How far the server's clock is ahead of this device's, from an HTTP `Date` header. 0 if unknown. */
export function serverOffsetMs(dateHeader: string | null, receivedAtMs: number): number {
  if (!dateHeader) return 0;
  const server = Date.parse(dateHeader);
  return Number.isFinite(server) ? server - receivedAtMs : 0;
}

export function secondsLeftAt(deadlineIso: string, nowMs: number, offsetMs: number): number {
  return Math.max(0, Math.floor((Date.parse(deadlineIso) - (nowMs + offsetMs)) / 1000));
}

export type Warning = "ten" | "five" | "one";

export const WARNING_TEXT: Record<Warning, string> = {
  ten: "10 minutes left",
  five: "5 minutes left",
  one: "1 minute left",
};

const LEVELS: readonly [Warning, number][] = [["one", 60], ["five", 300], ["ten", 600]];

/**
 * The warning that applies with `secondsLeft` to go, or null. A level is
 * skipped when it would already be showing at the start (a 10-minute limit
 * shouldn't open with "10 minutes left").
 */
export function warningFor(secondsLeft: number, limitSeconds: number): Warning | null {
  if (secondsLeft <= 0) return null;
  for (const [level, threshold] of LEVELS) {
    if (threshold < limitSeconds && secondsLeft <= threshold) return level;
  }
  return null;
}
