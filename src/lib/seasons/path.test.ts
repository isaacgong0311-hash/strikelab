import { describe, expect, it } from "vitest";
import { buildSeasonPath, challengeState, seasonPoints, type PathChallengeInput } from "./path";
import type { WeekView } from "./status";

function week(n: number, view: WeekView, lessonId: string | null = String(n + 1)): PathChallengeInput {
  return {
    id: `c${n}`,
    week: n,
    templateSlug: `t${n}`,
    title: `Challenge ${n}`,
    concept: `Concept ${n}`,
    minutes: 60,
    view,
    train: lessonId ? { lessonId, title: `Lesson ${lessonId}`, duration: "15 min" } : null,
  };
}

const upcoming: WeekView = { kind: "upcoming", opensAt: "2026-12-07T05:00:00Z" };
const none = { practiceDone: false, completedLessons: new Set<string>(), signedIn: false };

describe("season path", () => {
  it("runs warm-up, then lesson and challenge per week, then the record", () => {
    const path = buildSeasonPath([week(2, upcoming), week(1, upcoming)], none);
    expect(path.units.map((u) => u.key)).toEqual(["warmup", "week-1", "week-2", "finish"]);
    expect(path.units[1].steps.map((s) => s.kind)).toEqual(["train", "challenge"]);
    expect(path.total).toBe(6);
    expect(path.done).toBe(0);
  });

  it("points at the warm-up before the season, then the first lesson", () => {
    expect(buildSeasonPath([week(1, upcoming)], none).currentKey).toBe("warmup");
    expect(buildSeasonPath([week(1, upcoming)], { ...none, practiceDone: true }).currentKey).toBe("train-1");
  });

  it("an open challenge beats any unfinished lesson", () => {
    const path = buildSeasonPath([week(1, { kind: "open" }), week(2, upcoming)], none);
    expect(path.currentKey).toBe("week-1");
    const started = buildSeasonPath([week(1, { kind: "started", deadline: "x" })], none);
    expect(started.currentKey).toBe("week-1");
  });

  it("skips lessons for weeks that are over and moves on", () => {
    const path = buildSeasonPath(
      [week(1, { kind: "scored", score: 70, seasonRank: 2 }), week(2, upcoming)],
      { ...none, practiceDone: true },
    );
    expect(path.currentKey).toBe("train-2");
    const missed = buildSeasonPath([week(1, { kind: "closed" }), week(2, upcoming)], { ...none, practiceDone: true });
    expect(missed.currentKey).toBe("train-2");
    expect(missed.units[1].steps[1].state).toBe("missed");
  });

  it("locks the record until something is scored and the student is signed in", () => {
    const scored = [week(1, { kind: "scored", score: 70, seasonRank: 1 })];
    expect(buildSeasonPath(scored, none).units.at(-1)!.steps[0].state).toBe("locked");
    const signed = buildSeasonPath(scored, { practiceDone: true, completedLessons: new Set(["2"]), signedIn: true });
    expect(signed.units.at(-1)!.steps[0]).toMatchObject({ state: "open", href: "/record" });
    expect(signed.currentKey).toBe("record");
    expect(signed.done).toBe(3);
  });

  it("gives a locked challenge no link", () => {
    const step = buildSeasonPath([week(1, upcoming)], none).units[1].steps[1];
    expect(step).toMatchObject({ state: "locked", href: null });
  });

  it("works without a training lesson", () => {
    const path = buildSeasonPath([week(1, upcoming, null)], { ...none, practiceDone: true });
    expect(path.units[1].steps.map((s) => s.kind)).toEqual(["challenge"]);
    expect(path.currentKey).toBeNull();
  });

  it("maps every week state", () => {
    expect(challengeState({ kind: "submitted" })).toBe("done");
    expect(challengeState({ kind: "pending_review" })).toBe("done");
    expect(challengeState({ kind: "expired" })).toBe("missed");
  });

  it("adds up scored weeks against the season's maximum", () => {
    expect(seasonPoints([{ kind: "scored", score: 72.5, seasonRank: 1 }, { kind: "submitted" }, upcoming], 80)).toEqual({ points: 72.5, max: 240 });
    expect(seasonPoints([{ kind: "scored", score: null, seasonRank: null }], 80)).toEqual({ points: 0, max: 80 });
  });
});
