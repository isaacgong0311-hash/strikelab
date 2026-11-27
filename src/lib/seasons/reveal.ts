/**
 * The score reveal: the first time a student sees a newly posted official
 * score, the season path celebrates it once. "Seen" lives on this device only
 * (localStorage); the score itself always shows on the path regardless.
 */
import type { StorageLike } from "./draft";
import type { WeekView } from "./status";

export const SEEN_KEY = "strikelab:scores-seen:v1";

export interface ScoredWeek {
  challengeId: string;
  week: number;
  title: string;
  score: number;
  max: number;
  rank: number | null;
}

/** Entries are `${handle}:${challengeId}`, so two students on one laptop each get their own reveal. */
export function seenKey(handle: string | null, challengeId: string): string {
  return `${handle ?? "-"}:${challengeId}`;
}

export function parseSeen(raw: string | null | undefined): Set<string> {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

export function scoredWeeks(
  challenges: { id: string; week: number; title: string; view: WeekView }[],
  max: number,
): ScoredWeek[] {
  return challenges.flatMap((c) =>
    c.view.kind === "scored" && c.view.score !== null
      ? [{ challengeId: c.id, week: c.week, title: c.title, score: Number(c.view.score), max, rank: c.view.seasonRank }]
      : []);
}

/** The latest unseen score, and how many unseen ones there are in all. */
export function pickReveal(scored: ScoredWeek[], seen: ReadonlySet<string>, handle: string | null): { week: ScoredWeek; unseen: number } | null {
  const unseen = scored.filter((s) => !seen.has(seenKey(handle, s.challengeId)));
  if (unseen.length === 0) return null;
  const latest = unseen.reduce((a, b) => (b.week > a.week ? b : a));
  return { week: latest, unseen: unseen.length };
}

/** Mark every currently scored week seen. Never throws. */
export function markSeen(storage: StorageLike | null, handle: string | null, scored: ScoredWeek[]): void {
  if (!storage) return;
  try {
    const seen = parseSeen(storage.getItem(SEEN_KEY));
    for (const s of scored) seen.add(seenKey(handle, s.challengeId));
    // Keep the list short: a few seasons of weeks is plenty.
    storage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-200)));
  } catch {
    // Storage blocked: the reveal may show again next visit, which is harmless.
  }
}

/** One honest line for the score, out of the official maximum. */
export function revealLine(score: number, max: number): string {
  if (score >= max) return "A perfect score.";
  if (score >= max * 0.7) return "A strong week.";
  if (score > 0) return "You're on the board.";
  return "No checks passed this time. Read the feedback, then train for next week.";
}
