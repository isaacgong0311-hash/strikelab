import { describe, expect, it } from "vitest";
import { mergeSessionResults, missingRows } from "./sync";

const early = { completedAt: "2026-09-15T20:00:00.000Z", accuracy: 0.5, durationMs: 200_000 };
const late = { completedAt: "2026-09-16T20:00:00.000Z", accuracy: 1, durationMs: 150_000 };

describe("mergeSessionResults", () => {
  it("keeps sessions finished on either device", () => {
    expect(mergeSessionResults({ "inv-1.1": early }, { "inv-1.2": late })).toEqual({
      "inv-1.1": early,
      "inv-1.2": late,
    });
  });

  it("keeps the first completion when both devices finished a session", () => {
    expect(mergeSessionResults({ "inv-1.1": late }, { "inv-1.1": early })["inv-1.1"]).toBe(early);
    expect(mergeSessionResults({ "inv-1.1": early }, { "inv-1.1": late })["inv-1.1"]).toBe(early);
  });

  it("drops malformed entries from old or tampered storage", () => {
    const junk = { "inv-1.1": { completedAt: "yesterday", accuracy: 2, durationMs: -1 } } as never;
    expect(mergeSessionResults(junk, {})).toEqual({});
  });
});

describe("missingRows", () => {
  it("returns only results the cloud lacks, as table rows", () => {
    expect(missingRows({ "inv-1.1": early, "inv-1.2": late }, { "inv-1.1": early })).toEqual([
      { session_id: "inv-1.2", completed_at: late.completedAt, accuracy: 1, duration_ms: 150_000 },
    ]);
  });

  it("rounds fractional durations for the integer column", () => {
    expect(missingRows({ "inv-1.1": { ...early, durationMs: 1234.6 } }, {})[0].duration_ms).toBe(1235);
  });
});
