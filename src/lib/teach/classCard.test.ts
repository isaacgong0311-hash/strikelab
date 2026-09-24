import { describe, expect, it } from "vitest";
import { buildTeacherClassCard, type TeacherClassInput } from "./classCard";
import { buildDemoData, DEMO_TZ } from "@/lib/demo/fixtures";
import { addDaysToKey, localDateKey } from "@/lib/progress/streak";

const NOW = new Date("2026-10-14T17:00:00Z"); // a Wednesday

function input(overrides: Partial<TeacherClassInput> = {}): TeacherClassInput {
  return {
    id: "c1",
    name: "Math Club",
    templateId: "quant-foundations-v1",
    startsOn: "2026-10-26",
    timezone: "America/Chicago",
    skipWeeks: [],
    memberCount: 0,
    metrics: null,
    ...overrides,
  };
}

describe("buildTeacherClassCard", () => {
  it("sends an unscheduled class to the launch panel", () => {
    const card = buildTeacherClassCard(input({ templateId: null, startsOn: null }), NOW);
    expect(card.state).toBe("not-scheduled");
    expect(card.next.href).toBe("/dashboard/class/c1");
  });

  it("asks for invites before anyone has joined", () => {
    const card = buildTeacherClassCard(input(), NOW);
    expect(card.state).toBe("no-students");
    expect(card.status).toBe("Starts October 26, 2026");
    expect(card.next).toEqual({ label: "Invite your students", href: "/teach/c1/invite" });
  });

  it("points to kickoff prep once students have joined early", () => {
    const card = buildTeacherClassCard(input({ memberCount: 12 }), NOW);
    expect(card.state).toBe("before");
    expect(card.next.href).toBe("/teach/c1/invite");
  });

  it("nudges the students who need help in a running week", () => {
    const now = new Date("2026-09-23T15:00:00Z");
    const demo = buildDemoData(now);
    const startsOn = addDaysToKey(localDateKey(now, DEMO_TZ), -16);
    const card = buildTeacherClassCard(
      input({ startsOn, timezone: DEMO_TZ, memberCount: demo.metrics.enrolled, metrics: demo.metrics }),
      now
    );
    const needsHelp = demo.metrics.students.filter((s) => s.needsHelp).length;
    expect(card.state).toBe("week");
    expect(card.status).toMatch(/^Week 3 of 6: /);
    expect(card.next.label).toBe(`Nudge ${needsHelp} student${needsHelp === 1 ? "" : "s"}`);
    expect(card.stats.map((s) => s.label)).toEqual(["Students", "Activated", "Active this week", "Need a nudge"]);
  });

  it("treats a skipped week as a break and a past cohort as finished", () => {
    const onBreak = buildTeacherClassCard(input({ startsOn: "2026-10-05", skipWeeks: ["2026-10-12"], memberCount: 5 }), NOW);
    expect(onBreak.state).toBe("break");
    const done = buildTeacherClassCard(input({ startsOn: "2026-06-01", memberCount: 5 }), NOW);
    expect(done.state).toBe("finished");
    expect(done.secondary).toEqual({ label: "Run it again", href: "/teach/new" });
  });
});
