import { describe, expect, it } from "vitest";
import { FALLBACK_TIMEZONE, TIMEZONES, defaultTimezone, timezoneChoices } from "./launch";

describe("launch timezone defaults", () => {
  it("uses the leader's browser timezone when it is a real one", () => {
    expect(defaultTimezone("America/New_York")).toBe("America/New_York");
    expect(defaultTimezone("America/Detroit")).toBe("America/Detroit");
    expect(defaultTimezone("Pacific/Honolulu")).toBe("Pacific/Honolulu");
  });

  it("falls back to Central only when nothing usable is detected", () => {
    for (const bad of [undefined, null, "", "Not/AZone", "UTC+5"]) expect(defaultTimezone(bad)).toBe(FALLBACK_TIMEZONE);
  });

  it("adds the leader's own zone to the picker when it isn't one of the common ones", () => {
    expect(timezoneChoices("America/Detroit")).toEqual([...TIMEZONES, "America/Detroit"]);
    expect(timezoneChoices("America/Denver")).toEqual([...TIMEZONES]); // already there, not duplicated
    expect(timezoneChoices(undefined)).toEqual([...TIMEZONES]);
    expect(timezoneChoices("garbage")).toEqual([...TIMEZONES]);
  });

  it("always offers every US mainland zone plus Alaska and Hawaii", () => {
    for (const z of ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Anchorage", "Pacific/Honolulu"]) {
      expect(TIMEZONES).toContain(z);
    }
  });
});
