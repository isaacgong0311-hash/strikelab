import { describe, expect, it } from "vitest";
import { buildCohortSchedule } from "./template";
import { cohortCsvRows, computeCohortMetrics, type CohortCompletion, type CohortMember } from "./metrics";

// Cohort: Mon Oct 26 2026, Chicago, Thanksgiving (Nov 23) off.
// Weeks: 1 Oct 26–Nov 1 · 2 Nov 2–8 · 3 Nov 9–15 · 4 Nov 16–22 · break · 5 Nov 30–Dec 6 · 6 Dec 7–13
const START = "2026-10-26";
const SKIPS = ["2026-11-23"];
const TZ = "America/Chicago";
const assignments = buildCohortSchedule(START, SKIPS).map((r) => ({
  lessonId: r.lessonId,
  weekNumber: r.weekNumber,
  position: r.position,
  dueOn: r.dueOn,
}));

/** Noon Chicago time on a date, as an ISO timestamp. */
const at = (day: string, hour = 12) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00-05:00`).toISOString();

const member = (id: string, joined = "2026-10-26", extra: Partial<CohortMember> = {}): CohortMember => ({
  studentId: id,
  displayName: id,
  joinedAt: at(joined, 9),
  ...extra,
});
const done = (studentId: string, lessonId: string, day: string | null, hour = 12): CohortCompletion => ({
  studentId,
  lessonId,
  completedAt: day ? at(day, hour) : null,
});

function metrics(members: CohortMember[], completions: CohortCompletion[], today: string) {
  return computeCohortMetrics({
    startsOn: START,
    skipWeeks: SKIPS,
    timezone: TZ,
    assignments,
    members,
    completions,
    now: new Date(at(today, 15)),
  });
}

describe("activation", () => {
  it("counts the first lesson within 7 days of the later of joining and the start", () => {
    const m = metrics(
      [member("ontime"), member("late-joiner", "2026-11-05"), member("slow"), member("never")],
      [
        done("ontime", "inv-1", "2026-10-28"),
        done("late-joiner", "inv-1", "2026-11-10"), // 5 days after joining
        done("slow", "inv-1", "2026-11-04"), // 9 days after start
      ],
      "2026-11-20"
    );
    const byId = Object.fromEntries(m.students.map((s) => [s.studentId, s.activated]));
    expect(byId).toEqual({ ontime: true, "late-joiner": true, slow: false, never: false });
    expect(m.activated).toMatchObject({ count: 2, of: 4, pct: 50, pending: 0 });
  });

  it("is pending while the window is open", () => {
    const m = metrics([member("a")], [], "2026-10-29");
    expect(m.students[0].activated).toBeNull();
    expect(m.activated).toMatchObject({ count: 0, pending: 1 });
    expect(m.students[0].needsHelp).toBeNull();
  });

  it("uses the cohort's local day, not UTC", () => {
    // 10:30pm Chicago on Nov 2 is Nov 3 in UTC: still inside the Nov 2 deadline.
    const m = metrics([member("a")], [done("a", "inv-1", "2026-11-02", 22)], "2026-11-10");
    expect(m.students[0].activated).toBe(true);
  });

  it("never counts a completion with an unknown date", () => {
    const m = metrics([member("a")], [done("a", "inv-1", null)], "2026-11-10");
    expect(m.students[0].activated).toBe(false);
    expect(m.students[0].lessonsDone).toBe(1);
  });
});

describe("weekly activity and retention", () => {
  const members = [member("steady"), member("faded"), member("breakonly")];
  const completions = [
    done("steady", "inv-1", "2026-10-27"),
    done("steady", "3", "2026-11-18"),
    done("faded", "inv-1", "2026-10-27"),
    done("faded", "1", "2026-11-03"),
    done("breakonly", "inv-1", "2026-10-27"),
    done("breakonly", "4", "2026-11-25"), // Thanksgiving break
  ];

  it("counts activity per cohort week, skipping the break", () => {
    const m = metrics(members, completions, "2026-12-02");
    expect(m.status).toEqual({ kind: "week", week: 5 });
    expect(m.weeks.map((w) => w.active)).toEqual([3, 1, 0, 1, 0, null]);
    expect(m.activeThisWeek).toBe(0);
    expect(m.students.find((s) => s.studentId === "breakonly")?.activeByWeek).toEqual([true, false, false, false, false, null]);
  });

  it("retains only activated students active in week 4, final once week 4 ends", () => {
    const during = metrics(members, completions, "2026-11-18");
    expect(during.week4Retained).toMatchObject({ count: 1, of: 3, pct: 33, final: false });
    const after = metrics(members, completions, "2026-11-30");
    expect(after.week4Retained?.final).toBe(true);
    expect(metrics(members, completions, "2026-11-10").week4Retained).toBeNull();
  });
});

describe("students needing help", () => {
  it("flags overdue work with no activity for 7+ days, but not recent activity", () => {
    const m = metrics(
      [member("stalled"), member("busy", "2026-10-26", { lastActivityDate: "2026-11-12" })],
      [done("stalled", "inv-1", "2026-10-27"), done("busy", "inv-1", "2026-10-27")],
      "2026-11-14"
    );
    const stalled = m.students.find((s) => s.studentId === "stalled")!;
    expect(stalled.overdue).toBe(4); // inv-2, inv-5 (wk1) + 1, 2 (wk2)
    expect(stalled.needsHelp).toBe("4 overdue, inactive 7+ days");
    expect(m.students.find((s) => s.studentId === "busy")?.needsHelp).toBeNull();
  });

  it("flags a student who never activated", () => {
    const m = metrics([member("a")], [], "2026-11-10");
    expect(m.students[0].needsHelp).toBe("Hasn't finished the first lesson");
  });
});

describe("program completion", () => {
  it("requires every assigned lesson by 7 days after the last week", () => {
    const all = (id: string, day: string) => assignments.map((a) => done(id, a.lessonId, day));
    const m = metrics(
      [member("finisher"), member("late"), member("partial")],
      [...all("finisher", "2026-12-12"), ...all("late", "2026-12-25"), done("partial", "inv-1", "2026-10-27")],
      "2026-12-28"
    );
    expect(m.students.map((s) => s.programCompleted)).toEqual([true, false, false]);
    expect(m.programCompleted).toMatchObject({ count: 1, of: 3, final: true });
  });

  it("ignores completions of lessons that weren't assigned", () => {
    const m = metrics([member("a")], [done("a", "8", "2026-10-27")], "2026-11-10");
    expect(m.students[0].lessonsDone).toBe(0);
  });
});

describe("cohortCsvRows", () => {
  it("has a header and one row per student with every metric column", () => {
    const rows = cohortCsvRows(metrics([member("a")], [done("a", "inv-1", "2026-10-27")], "2026-11-10"));
    expect(rows[0]).toContain("Week 4 retained");
    expect(rows[0]).toHaveLength(rows[1].length);
    expect(rows[1].slice(0, 3)).toEqual(["a", "2026-10-26", "yes"]);
  });
});
