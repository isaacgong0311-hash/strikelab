import { describe, expect, it } from "vitest";
import { formatSupport, summarizeSupport } from "../../../scripts/metrics/support-core.mjs";

const cohorts = [
  { cohort: "A", run_by: "founder" },
  { cohort: "B", run_by: "leader" },
];

describe("summarizeSupport", () => {
  it("sums minutes per cohort into hours", () => {
    const { rows, problems } = summarizeSupport(cohorts, [
      { date: "2026-10-26", cohort: "A", minutes: "90", reason: "kickoff" },
      { date: "2026-10-28", cohort: "A", minutes: "45", reason: "sign-in help" },
      { date: "2026-11-02", cohort: "B", minutes: "20", reason: "question" },
    ]);
    expect(problems).toEqual([]);
    expect(rows.map((r: { cohort: string; hours: number; entries: number }) => [r.cohort, r.hours, r.entries])).toEqual([
      ["A", 2.3, 2],
      ["B", 0.3, 1],
    ]);
  });

  it("reports bad rows instead of guessing", () => {
    const { rows, problems } = summarizeSupport(
      [{ cohort: "A", run_by: "me" }],
      [
        { date: "d", cohort: "A", minutes: "lots", reason: "" },
        { date: "d", cohort: "Z", minutes: "10", reason: "" },
      ]
    );
    expect(rows[0].minutes).toBe(0);
    expect(problems).toHaveLength(3);
  });

  it("formats an empty log without crashing", () => {
    expect(formatSupport(summarizeSupport([], []))).toContain("no cohorts yet");
  });
});
