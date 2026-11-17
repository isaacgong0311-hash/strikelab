import { describe, expect, it } from "vitest";
import { secondsLeftAt, serverOffsetMs, warningFor } from "./clock";

describe("serverOffsetMs", () => {
  it("measures how far the server is ahead of this device", () => {
    const device = Date.parse("2026-11-30T15:00:00Z");
    expect(serverOffsetMs("Mon, 30 Nov 2026 15:05:00 GMT", device)).toBe(5 * 60_000);
    expect(serverOffsetMs("Mon, 30 Nov 2026 14:55:00 GMT", device)).toBe(-5 * 60_000);
  });

  it("falls back to no correction when the header is missing or unreadable", () => {
    expect(serverOffsetMs(null, 1)).toBe(0);
    expect(serverOffsetMs("not a date", 1)).toBe(0);
  });
});

describe("secondsLeftAt", () => {
  const deadline = "2026-11-30T16:00:00Z";

  it("counts down to the server's deadline using the corrected clock", () => {
    const device = Date.parse("2026-11-30T15:00:00Z");
    expect(secondsLeftAt(deadline, device, 0)).toBe(3600);
    // A device clock 5 minutes slow must not give the student 5 extra minutes.
    expect(secondsLeftAt(deadline, device, 5 * 60_000)).toBe(3300);
  });

  it("never goes below zero", () => {
    expect(secondsLeftAt(deadline, Date.parse("2026-11-30T17:00:00Z"), 0)).toBe(0);
  });
});

describe("warningFor", () => {
  it("warns at 10, 5 and 1 minute on a 60-minute attempt", () => {
    expect(warningFor(3000, 3600)).toBeNull();
    expect(warningFor(600, 3600)).toBe("ten");
    expect(warningFor(301, 3600)).toBe("ten");
    expect(warningFor(300, 3600)).toBe("five");
    expect(warningFor(61, 3600)).toBe("five");
    expect(warningFor(60, 3600)).toBe("one");
    expect(warningFor(1, 3600)).toBe("one");
  });

  it("is quiet once time is up", () => {
    expect(warningFor(0, 3600)).toBeNull();
  });

  it("doesn't open a short attempt with a warning it already deserves", () => {
    // A 10-minute limit starts at 600 seconds left: no "10 minutes left" at the start.
    expect(warningFor(600, 600)).toBeNull();
    expect(warningFor(300, 600)).toBe("five");
  });
});
