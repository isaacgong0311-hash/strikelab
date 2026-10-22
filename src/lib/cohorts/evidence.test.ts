import { describe, expect, it } from "vitest";
import { cohortEvidenceRows } from "./evidence";
import { computeCohortMetrics } from "./metrics";
import { buildCohortSchedule } from "./template";
import { buildDemoData } from "../demo/fixtures";

function cohort(today: string, populated = true) {
  return computeCohortMetrics({
    startsOn: "2026-10-26", skipWeeks: [], timezone: "UTC",
    assignments: buildCohortSchedule("2026-10-26").map((a) => ({ lessonId: a.lessonId, weekNumber: a.weekNumber, position: a.position, dueOn: a.dueOn })),
    members: populated ? [{ studentId: "secret-id", displayName: "Private Student Name", joinedAt: "2026-10-26T12:00:00Z" }] : [],
    completions: populated ? [{ studentId: "secret-id", lessonId: "inv-1", completedAt: "2026-10-27T12:00:00Z" }] : [],
    now: new Date(`${today}T12:00:00Z`), capstonesEnabled: true,
  });
}

const row = (rows: string[][], name: string) => rows.find((r) => r[0] === name)!;

describe("aggregate pilot evidence", () => {
  it("exports numerator, denominator, snapshot and windows without student identities", () => {
    const rows = cohortEvidenceRows(cohort("2026-11-18"), { sample: false });
    expect(row(rows, "Activated").slice(1, 4)).toEqual(["1", "1", "100%"]);
    expect(row(rows, "Week-4 retained").slice(1, 7)).toEqual(["0", "1", "0%", "Preliminary — week 4 in progress", "2026-11-16", "2026-11-22"]);
    expect(row(rows, "Snapshot date")[1]).toBe("2026-11-18");
    expect(JSON.stringify(rows)).not.toMatch(/Private Student Name|secret-id/);
    expect(row(rows, "Interpretation")[1]).toContain("do not establish mastery");
  });

  it("leaves unstarted weeks and unavailable rates blank rather than manufacturing zero", () => {
    const metrics = cohort("2026-10-28");
    metrics.capstones = null;
    const rows = cohortEvidenceRows(metrics, { sample: false });
    expect(row(rows, "Week-4 retained").slice(1, 4)).toEqual(["", "", ""]);
    expect(row(rows, "Week 6 active").slice(1, 4)).toEqual(["", "", ""]);
    expect(row(rows, "Capstone submitted")[4]).toContain("Unavailable");
    expect(row(rows, "Program completed")[4]).toContain("Preliminary");
  });

  it("keeps zero denominators as undefined percentages and pending windows as pending", () => {
    const empty = cohortEvidenceRows(cohort("2026-10-28", false), { sample: false });
    expect(row(empty, "Activated").slice(1, 5)).toEqual(["0", "0", "", "No enrolled students"]);
    const pending = cohort("2026-10-26");
    pending.activated = { count: 0, of: 1, pct: 0, pending: 1 };
    const rows = cohortEvidenceRows(pending, { sample: false });
    expect(row(rows, "Activation pending")[1]).toBe("1");
    expect(row(rows, "Activated")[4]).toContain("Preliminary");
  });

  it("labels ended windows separately and keeps late-joiner denominator uncertainty", () => {
    const metrics = cohort("2026-12-20");
    let rows = cohortEvidenceRows(metrics, { sample: false });
    expect(row(rows, "Program completed")[4]).toBe("Completion window closed");
    expect(row(rows, "Week-4 retained")[4]).toBe("Week 4 ended");
    metrics.activated.pending = 1;
    rows = cohortEvidenceRows(metrics, { sample: false });
    expect(row(rows, "Week-4 retained")[4]).toContain("denominator still pending");
  });

  it("makes a fictional demo export impossible to mistake for observed traction", () => {
    const demo = buildDemoData(new Date("2026-10-21T12:00:00Z"));
    const rows = cohortEvidenceRows(demo.metrics, { sample: true });
    expect(row(rows, "Data source")[1]).toContain("SAMPLE DATA");
    expect(row(rows, "Commercial evidence")[1]).toContain("does not verify payment");
    for (const student of demo.metrics.students) {
      expect(JSON.stringify(rows)).not.toContain(student.displayName);
    }
  });
});
