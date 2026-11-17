import { describe, expect, it } from "vitest";
import { seasonPhase } from "./planned";

describe("seasonPhase", () => {
  const phase = (iso: string) => seasonPhase(new Date(iso), "2026-11-30", "2026-12-20");

  it("counts whole days to the opening, rounding up", () => {
    expect(phase("2026-11-16T12:00:00-05:00")).toEqual({ kind: "upcoming", days: 14 });
    expect(phase("2026-11-29T23:00:00-05:00")).toEqual({ kind: "upcoming", days: 1 });
  });

  it("is live from the first midnight until the last evening", () => {
    expect(phase("2026-11-30T00:00:00-05:00")).toEqual({ kind: "live" });
    expect(phase("2026-12-20T23:00:00-05:00")).toEqual({ kind: "live" });
  });

  it("has ended after the last window closes", () => {
    expect(phase("2026-12-21T00:00:00-05:00")).toEqual({ kind: "ended" });
  });
});
