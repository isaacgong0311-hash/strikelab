import { describe, expect, it } from "vitest";
import { countdown, easternWhen, nextChallenge } from "./countdown";

// Midnight to 23:59 Eastern, as in supabase/seed/season-1.sql.
const weeks = [
  { id: "s1-w1", week: 1, opens_at: "2026-11-30T05:00:00Z", closes_at: "2026-12-07T04:59:00Z" },
  { id: "s1-w2", week: 2, opens_at: "2026-12-07T05:00:00Z", closes_at: "2026-12-14T04:59:00Z" },
  { id: "s1-w3", week: 3, opens_at: "2026-12-14T05:00:00Z", closes_at: "2026-12-21T04:59:00Z" },
];

describe("nextChallenge", () => {
  it("counts down to week 1 before the season starts", () => {
    expect(nextChallenge(new Date("2026-11-22T12:00:00Z"), weeks, "2026-11-30"))
      .toEqual({ kind: "opens", id: "s1-w1", week: 1, opensAt: "2026-11-30T05:00:00Z" });
  });

  it("shows the open week while one is open", () => {
    expect(nextChallenge(new Date("2026-12-08T12:00:00Z"), weeks, null))
      .toEqual({ kind: "open", id: "s1-w2", week: 2, closesAt: "2026-12-14T04:59:00Z" });
  });

  it("falls back to the planned start, at midnight Eastern, before rows exist", () => {
    expect(nextChallenge(new Date("2026-11-22T12:00:00Z"), [], "2026-11-30"))
      .toEqual({ kind: "opens", id: null, week: 1, opensAt: "2026-11-30T05:00:00.000Z" });
  });

  it("is null after the last week closes", () => {
    expect(nextChallenge(new Date("2026-12-21T05:00:00Z"), weeks, "2026-11-30")).toBeNull();
    expect(nextChallenge(new Date("2026-12-01T00:00:00Z"), [], "2026-11-30")).toBeNull();
  });
});

describe("countdown", () => {
  const at = new Date("2026-11-22T12:00:00Z");
  it("reads days, then hours, then minutes and seconds", () => {
    expect(countdown(at, "2026-11-30T05:00:00Z")).toEqual({ compact: "7d 17h 00m", words: "7 days, 17 hours and 0 minutes" });
    expect(countdown(at, "2026-11-22T17:09:00Z")).toEqual({ compact: "5h 09m", words: "5 hours and 9 minutes" });
    expect(countdown(at, "2026-11-22T12:01:01Z")).toEqual({ compact: "1m 01s", words: "1 minute and 1 second" });
    expect(countdown(at, "2026-11-22T11:00:00Z").compact).toBe("0m 00s");
  });
});

describe("easternWhen", () => {
  it("prints the opening on the season's clock", () => {
    expect(easternWhen("2026-11-30T05:00:00Z")).toBe("Mon, Nov 30, 12:00 AM ET");
  });
});
