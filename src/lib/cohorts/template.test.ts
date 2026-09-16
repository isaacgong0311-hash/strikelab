import { describe, expect, it } from "vitest";
import {
  QUANT_FOUNDATIONS_TEMPLATE,
  QUANT_FOUNDATIONS_TEMPLATE_ID,
  buildCohortSchedule,
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
});
