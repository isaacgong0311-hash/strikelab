import { describe, expect, it } from "vitest";
import { challengeStatus, formatClock, secondsLeft } from "./window";

describe("season windows", () => {
  const opens = "2026-11-30T14:00:00Z";
  const closes = "2026-12-06T23:59:00Z";
  it("classifies before, during and after", () => {
    expect(challengeStatus(new Date("2026-11-30T13:59:59Z"), opens, closes)).toBe("upcoming");
    expect(challengeStatus(new Date("2026-11-30T14:00:00Z"), opens, closes)).toBe("open");
    expect(challengeStatus(new Date("2026-12-06T23:59:00Z"), opens, closes)).toBe("closed");
  });
  it("counts down without going negative", () => {
    expect(secondsLeft(new Date("2026-12-01T00:00:00Z"), "2026-12-01T00:01:30Z")).toBe(90);
    expect(secondsLeft(new Date("2026-12-01T00:05:00Z"), "2026-12-01T00:01:30Z")).toBe(0);
  });
  it("formats clocks", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(245)).toBe("4:05");
    expect(formatClock(3729)).toBe("1:02:09");
  });
});
