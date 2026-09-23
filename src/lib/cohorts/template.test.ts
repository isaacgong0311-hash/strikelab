import { describe, expect, it } from "vitest";
import {
  QUANT_FOUNDATIONS_TEMPLATE,
  QUANT_FOUNDATIONS_TEMPLATE_ID,
  buildCohortSchedule,
  cohortDayStatus,
  cohortWeekWindows,
  pruneSkipWeeks,
  skipWeekOptions,
} from "./template";

describe("Quant Foundations cohort template", () => {
  it("has one stable id and six ordered weeks", () => {
    expect(QUANT_FOUNDATIONS_TEMPLATE_ID).toBe("quant-foundations-v1");
    expect(QUANT_FOUNDATIONS_TEMPLATE.weeks.map((week) => week.week)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(QUANT_FOUNDATIONS_TEMPLATE.weeks.at(-1)).toMatchObject({
      title: "Portfolio capstone",
      lessonIds: ["q4"],
    });
  });

  it("builds stable positions and end-of-week due dates", () => {
    const schedule = buildCohortSchedule("2026-09-14");

    expect(schedule[0]).toEqual({ lessonId: "inv-1", weekNumber: 1, position: 1, dueOn: "2026-09-20" });
    expect(schedule[1]).toEqual({ lessonId: "inv-2", weekNumber: 1, position: 2, dueOn: "2026-09-20" });
    expect(schedule.find((row) => row.lessonId === "3")).toEqual({
      lessonId: "3",
      weekNumber: 3,
      position: 1,
      dueOn: "2026-10-04",
    });
    expect(schedule.at(-1)).toEqual({ lessonId: "q4", weekNumber: 6, position: 1, dueOn: "2026-10-25" });
  });

  it("contains only real StrikeLab lessons", async () => {
    const { getLessonById } = await import("@/lib/tracks");
    for (const row of buildCohortSchedule("2026-09-14")) {
      expect(getLessonById(row.lessonId), row.lessonId).not.toBeNull();
    }
  });

  it.each(["", "09/14/2026", "2026-02-30", "2026-9-14"])("rejects invalid start date %j", (date) => {
    expect(() => buildCohortSchedule(date)).toThrow("startsOn must be a real YYYY-MM-DD date");
  });

  it("skips a holiday week and pushes later due dates back", () => {
    // Starts Mon Oct 26, Thanksgiving week (Nov 23) off: six meetings end Dec 7–13.
    const windows = cohortWeekWindows("2026-10-26", ["2026-11-23"]);
    expect(windows.map((w) => w.startsOn)).toEqual([
      "2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16", "2026-11-30", "2026-12-07",
    ]);
    const schedule = buildCohortSchedule("2026-10-26", ["2026-11-23"]);
    expect(schedule.find((row) => row.lessonId === "4")?.dueOn).toBe("2026-11-22");
    expect(schedule.find((row) => row.lessonId === "q3")?.dueOn).toBe("2026-12-06");
    expect(schedule.at(-1)?.dueOn).toBe("2026-12-13");
  });

  it.each([
    [["2026-10-26"], "week 1 can't be skipped"],
    [["2026-11-24"], "not a week start"],
    [["2027-03-01"], "after the program ends"],
    [["2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23"], "too many"],
  ])("rejects bad skip weeks %j (%s)", (skips) => {
    expect(() => buildCohortSchedule("2026-10-26", skips)).toThrow(/skipWeeks/);
  });

  it("offers every block start after week 1 that could be a break", () => {
    const options = skipWeekOptions("2026-10-26");
    expect(options[0]).toBe("2026-11-02");
    expect(options).toContain("2026-11-23");
    expect(options).toHaveLength(8);
  });

  it("places a day before, inside, between or after the program weeks", () => {
    const windows = cohortWeekWindows("2026-10-26", ["2026-11-23"]);
    expect(cohortDayStatus("2026-10-25", windows)).toEqual({ kind: "before" });
    expect(cohortDayStatus("2026-10-26", windows)).toEqual({ kind: "week", week: 1 });
    expect(cohortDayStatus("2026-11-22", windows)).toEqual({ kind: "week", week: 4 });
    expect(cohortDayStatus("2026-11-26", windows)).toEqual({ kind: "break" });
    expect(cohortDayStatus("2026-11-30", windows)).toEqual({ kind: "week", week: 5 });
    expect(cohortDayStatus("2026-12-13", windows)).toEqual({ kind: "week", week: 6 });
    expect(cohortDayStatus("2026-12-14", windows)).toEqual({ kind: "after" });
  });

  it("prunes break weeks that fall outside the program", () => {
    // Without the Nov 23 break, a Dec 7 break would be after the last week.
    expect(pruneSkipWeeks("2026-10-26", ["2026-12-07"])).toEqual([]);
    expect(pruneSkipWeeks("2026-10-26", ["2026-12-07", "2026-11-23"])).toEqual(["2026-11-23", "2026-12-07"]);
    expect(pruneSkipWeeks("2026-10-26", ["2026-10-26", "2026-11-24", "2026-11-23"])).toEqual(["2026-11-23"]);
    // A malformed early date doesn't knock out a valid later break.
    expect(pruneSkipWeeks("2026-10-26", ["2026-11-03", "2026-11-23"])).toEqual(["2026-11-23"]);
  });
});
