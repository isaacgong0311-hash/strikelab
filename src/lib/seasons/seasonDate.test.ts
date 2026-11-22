import { describe, expect, it } from "vitest";
import { pickDisplaySeason, seasonDate, seasonIsOver } from "./seasonDate";

// Season 1 as seeded in supabase/seed/season-1.sql.
const ENDS_ON = "2026-12-20";
const CLOSES_AT = ["2026-12-07T04:59:00Z", "2026-12-14T04:59:00Z", "2026-12-21T04:59:00Z"];
const at = (iso: string) => new Date(iso);

describe("seasonDate", () => {
  it("reads the calendar day in New York, not UTC", () => {
    // 7pm Eastern on the last day is already Dec 21 in UTC.
    expect(seasonDate(at("2026-12-20T19:00:00-05:00"))).toBe("2026-12-20");
    expect(seasonDate(at("2026-12-20T23:58:00-05:00"))).toBe("2026-12-20");
    expect(seasonDate(at("2026-12-21T00:01:00-05:00"))).toBe("2026-12-21");
  });

  it("turns to Nov 30 at the 05:00 UTC opening", () => {
    expect(seasonDate(at("2026-11-30T04:59:59Z"))).toBe("2026-11-29");
    expect(seasonDate(at("2026-11-30T05:00:00Z"))).toBe("2026-11-30");
  });

  it("follows daylight saving time", () => {
    expect(seasonDate(at("2026-07-01T03:30:00Z"))).toBe("2026-06-30");
    expect(seasonDate(at("2026-07-01T04:30:00Z"))).toBe("2026-07-01");
  });
});

describe("pickDisplaySeason", () => {
  const s0 = { id: "s0", starts_on: "2026-09-01", ends_on: "2026-09-20" };
  const s1 = { id: "s1-2026", starts_on: "2026-11-30", ends_on: ENDS_ON };
  const s2 = { id: "s2-2027", starts_on: "2027-02-01", ends_on: "2027-02-21" };
  const pick = (iso: string, rows = [s2, s0, s1]) => pickDisplaySeason(rows, seasonDate(at(iso)))?.id ?? null;

  it("shows Season 1 from before it opens until 11:59pm Eastern on Dec 20", () => {
    expect(pick("2026-11-21T12:00:00-05:00")).toBe("s1-2026");
    expect(pick("2026-11-30T05:00:00Z")).toBe("s1-2026");
    expect(pick("2026-12-20T19:00:00-05:00")).toBe("s1-2026");
  });

  it("moves on to the next season once Season 1 has ended", () => {
    expect(pick("2026-12-21T00:01:00-05:00")).toBe("s2-2027");
  });

  it("keeps the most recently ended season up when nothing is scheduled", () => {
    expect(pick("2026-12-21T00:01:00-05:00", [s0, s1])).toBe("s1-2026");
    expect(pick("2027-06-01T12:00:00-05:00", [s1, s0, s2])).toBe("s2-2027");
    expect(pick("2026-12-21T00:01:00-05:00", [])).toBeNull();
  });
});

describe("seasonIsOver", () => {
  it("is still live at 7pm Eastern on Dec 20", () => {
    const now = at("2026-12-20T19:00:00-05:00");
    expect(seasonIsOver(now, ENDS_ON)).toBe(false);
    expect(seasonIsOver(now, ENDS_ON, CLOSES_AT)).toBe(false);
    // Still a current season for the `ends_on >= today` queries.
    expect(ENDS_ON >= seasonDate(now)).toBe(true);
  });

  it("has ended at 12:01am Eastern on Dec 21", () => {
    const now = at("2026-12-21T00:01:00-05:00");
    expect(seasonIsOver(now, ENDS_ON)).toBe(true);
    expect(seasonIsOver(now, ENDS_ON, CLOSES_AT)).toBe(true);
    expect(ENDS_ON >= seasonDate(now)).toBe(false);
  });

  it("is not over at the Nov 30 opening", () => {
    const now = at("2026-11-30T05:00:00Z");
    expect(seasonIsOver(now, ENDS_ON)).toBe(false);
    expect(seasonIsOver(now, ENDS_ON, CLOSES_AT)).toBe(false);
  });

  it("waits for the last challenge to close when closes_at is known", () => {
    expect(seasonIsOver(at("2026-12-21T04:58:59Z"), ENDS_ON, CLOSES_AT)).toBe(false);
    expect(seasonIsOver(at("2026-12-21T04:59:00Z"), ENDS_ON, CLOSES_AT)).toBe(true);
    // A challenge that closes after ends_on keeps the season open.
    expect(seasonIsOver(at("2026-12-22T12:00:00Z"), ENDS_ON, [...CLOSES_AT, "2026-12-23T04:59:00Z"])).toBe(false);
  });
});
