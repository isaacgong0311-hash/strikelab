import { describe, expect, it } from "vitest";
import { statusForWeek, remainingLabel } from "./status";

const now = new Date("2026-12-01T12:00:00Z");
const challenge = {
  opens_at: "2026-12-02T12:00:00Z",
  closes_at: "2026-12-08T12:00:00Z",
};

describe("season week status", () => {
  it("shows when an unopened challenge begins", () => {
    expect(statusForWeek(now, challenge, null, null)).toEqual({ kind: "upcoming", opensAt: challenge.opens_at });
    expect(remainingLabel(now, challenge.opens_at)).toBe("1 day");
    expect(remainingLabel(now, "2026-12-04T12:00:00Z")).toBe("3 days");
    expect(remainingLabel(now, "2026-12-01T14:00:00Z")).toBe("2 hours");
  });

  it("offers Start during the open window, then closes if untouched", () => {
    const open = { ...challenge, opens_at: "2026-11-30T12:00:00Z" };
    expect(statusForWeek(now, open, null, null)).toEqual({ kind: "open" });
    expect(statusForWeek(new Date("2026-12-08T12:00:00Z"), open, null, null)).toEqual({ kind: "closed" });
  });

  it("resumes a live attempt with its original deadline", () => {
    const attempt = { status: "started", deadline: "2026-12-01T12:05:00Z", official_score: null } as const;
    expect(statusForWeek(now, challenge, attempt, null)).toEqual({ kind: "started", deadline: attempt.deadline });
    expect(statusForWeek(new Date("2026-12-01T12:05:00Z"), challenge, attempt, null)).toEqual({ kind: "expired" });
  });

  it("shows submitted work as scoring", () => {
    const attempt = { status: "submitted", deadline: "2026-12-01T12:05:00Z", official_score: null } as const;
    expect(statusForWeek(now, challenge, attempt, null)).toEqual({ kind: "submitted" });
  });

  it("shows an official score and season rank only when available", () => {
    const attempt = { status: "scored", deadline: "2026-12-01T12:05:00Z", official_score: 88 } as const;
    expect(statusForWeek(now, challenge, attempt, 4)).toEqual({ kind: "scored", score: 88, seasonRank: 4 });
    expect(statusForWeek(now, challenge, attempt, null)).toEqual({ kind: "scored", score: 88, seasonRank: null });
  });

  it("marks unresolved scoring as pending review", () => {
    const attempt = { status: "pending_review", deadline: "2026-12-01T12:05:00Z", official_score: null } as const;
    expect(statusForWeek(now, challenge, attempt, null)).toEqual({ kind: "pending_review" });
  });
});
