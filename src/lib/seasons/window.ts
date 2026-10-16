export type ChallengeStatus = "upcoming" | "open" | "closed";

export function challengeStatus(now: Date, opensAt: string, closesAt: string): ChallengeStatus {
  const t = now.getTime();
  if (t < Date.parse(opensAt)) return "upcoming";
  if (t >= Date.parse(closesAt)) return "closed";
  return "open";
}

export function secondsLeft(now: Date, deadline: string): number {
  return Math.max(0, Math.floor((Date.parse(deadline) - now.getTime()) / 1000));
}

/** "4:05", or "1:02:09" past an hour. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const ss = String(r).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
