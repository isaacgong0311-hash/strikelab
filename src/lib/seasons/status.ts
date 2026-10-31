import { challengeStatus, secondsLeft } from "./window";

export interface WeekWindow {
  opens_at: string;
  closes_at: string;
}

export interface OwnAttempt {
  status: "started" | "submitted" | "scored" | "pending_review";
  deadline: string;
  official_score: number | null;
}

export type WeekView =
  | { kind: "upcoming"; opensAt: string }
  | { kind: "open" }
  | { kind: "started"; deadline: string }
  | { kind: "submitted" }
  | { kind: "scored"; score: number | null; seasonRank: number | null }
  | { kind: "pending_review" }
  | { kind: "expired" }
  | { kind: "closed" };

/** The attempt wins over the calendar: scored work stays visible after close. */
export function statusForWeek(
  now: Date,
  challenge: WeekWindow,
  attempt: OwnAttempt | null,
  seasonRank: number | null,
): WeekView {
  if (attempt) {
    switch (attempt.status) {
      case "started":
        return secondsLeft(now, attempt.deadline) > 0
          ? { kind: "started", deadline: attempt.deadline }
          : { kind: "expired" };
      case "submitted": return { kind: "submitted" };
      case "scored": return { kind: "scored", score: attempt.official_score, seasonRank };
      case "pending_review": return { kind: "pending_review" };
    }
  }
  const window = challengeStatus(now, challenge.opens_at, challenge.closes_at);
  if (window === "upcoming") return { kind: "upcoming", opensAt: challenge.opens_at };
  return { kind: window };
}

/** Short text for a server-rendered countdown; the client may refresh it. */
export function remainingLabel(now: Date, target: string): string {
  const seconds = secondsLeft(now, target);
  if (seconds === 0) return "now";
  if (seconds >= 86_400) {
    const days = Math.ceil(seconds / 86_400);
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  if (seconds >= 3_600) {
    const hours = Math.ceil(seconds / 3_600);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
