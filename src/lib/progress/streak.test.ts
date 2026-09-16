import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, type ProgressPayload } from "./sync";
import {
  addDaysToKey,
  applyActivity,
  localDateKey,
  recentDayKeys,
  resolveStreak,
} from "./streak";

const CHICAGO = "America/Chicago";
const TOKYO = "Asia/Tokyo";

function state(overrides: Partial<ProgressPayload>): ProgressPayload {
  return { ...EMPTY_PROGRESS, ...overrides };
}

describe("localDateKey", () => {
  it("uses the learner's local day, not the UTC day", () => {
    // 7:30pm CDT on Sep 16 is already Sep 17 in UTC.
    const evening = new Date("2026-09-17T00:30:00Z");
    expect(localDateKey(evening, CHICAGO)).toBe("2026-09-16");
    expect(localDateKey(evening, "UTC")).toBe("2026-09-17");
  });

  it("handles the far side of the date line", () => {
    expect(localDateKey(new Date("2026-09-16T20:00:00Z"), TOKYO)).toBe("2026-09-17");
  });
});

describe("addDaysToKey", () => {
  it("crosses month, year, and leap-day boundaries", () => {
    expect(addDaysToKey("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDaysToKey("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDaysToKey("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("is unaffected by DST transitions", () => {
    // US DST ends 2026-11-01.
    expect(addDaysToKey("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDaysToKey("2026-11-02", -1)).toBe("2026-11-01");
  });
});

describe("recentDayKeys", () => {
  it("returns oldest-first keys ending on the local today", () => {
    const now = new Date("2026-09-17T02:00:00Z"); // 9pm Sep 16 in Chicago
    expect(recentDayKeys(3, now, CHICAGO)).toEqual(["2026-09-14", "2026-09-15", "2026-09-16"]);
  });
});

describe("resolveStreak", () => {
  const now = new Date("2026-09-16T15:00:00Z");

  it("keeps a streak active today or yesterday", () => {
    expect(resolveStreak(state({ streak: 4, lastActivityDate: "2026-09-16" }), now, CHICAGO)).toBe(4);
    expect(resolveStreak(state({ streak: 4, lastActivityDate: "2026-09-15" }), now, CHICAGO)).toBe(4);
  });

  it("expires a streak after a missed day", () => {
    expect(resolveStreak(state({ streak: 4, lastActivityDate: "2026-09-14" }), now, CHICAGO)).toBe(0);
    expect(resolveStreak(state({ streak: 0, lastActivityDate: null }), now, CHICAGO)).toBe(0);
  });

  it("does not expire at UTC midnight for an evening learner", () => {
    // Active Sep 15 local; at 11:30pm CDT Sep 16 (04:30Z Sep 17) the streak is still alive.
    const lateNight = new Date("2026-09-17T04:30:00Z");
    expect(resolveStreak(state({ streak: 2, lastActivityDate: "2026-09-15" }), lateNight, CHICAGO)).toBe(2);
  });
});

describe("applyActivity", () => {
  it("starts a streak on first activity", () => {
    const next = applyActivity(EMPTY_PROGRESS, new Date("2026-09-16T15:00:00Z"), CHICAGO);
    expect(next).toEqual({
      streak: 1,
      lastActivityDate: "2026-09-16",
      activityByDate: { "2026-09-16": 1 },
    });
  });

  it("does not double-count two lessons on the same local evening", () => {
    const first = new Date("2026-09-16T23:00:00Z"); // 6pm CDT
    const second = new Date("2026-09-17T03:00:00Z"); // 10pm CDT, next day in UTC
    const afterFirst = { ...state({ streak: 3, lastActivityDate: "2026-09-15" }), ...applyActivity(state({ streak: 3, lastActivityDate: "2026-09-15" }), first, CHICAGO) };
    const afterSecond = applyActivity(afterFirst, second, CHICAGO);
    expect(afterFirst.streak).toBe(4);
    expect(afterSecond.streak).toBe(4);
    expect(afterSecond.activityByDate).toEqual({ "2026-09-16": 2 });
  });

  it("extends from yesterday and resets after a gap", () => {
    const now = new Date("2026-09-16T15:00:00Z");
    expect(applyActivity(state({ streak: 6, lastActivityDate: "2026-09-15" }), now, CHICAGO).streak).toBe(7);
    expect(applyActivity(state({ streak: 6, lastActivityDate: "2026-09-13" }), now, CHICAGO).streak).toBe(1);
  });

  it("treats a later last-activity day (after travelling west) as already active", () => {
    const now = new Date("2026-09-16T15:00:00Z"); // Sep 16 in Chicago
    const next = applyActivity(state({ streak: 5, lastActivityDate: "2026-09-17" }), now, CHICAGO);
    expect(next.streak).toBe(5);
    expect(next.lastActivityDate).toBe("2026-09-17");
  });
});
