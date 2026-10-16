import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OwnedClass } from "@/lib/classes";

// loadCohortScorecard is what a leader's class page runs on every load. The
// metric math is covered in metrics.test.ts; this covers the loading around
// it: what it reads, and what it says when part of the database isn't there.

const getSupabaseAdminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => getSupabaseAdminMock() }));

import { loadCohortScorecard } from "./loadScorecard";

type Result = { data: unknown[] | null; error: { message: string } | null };
type Tables = Record<string, Result>;

/** A query builder that ignores filters and resolves to the table's canned result. */
function fakeAdmin(tables: Tables) {
  return {
    from: (table: string) => {
      const result = tables[table] ?? { data: [], error: null };
      const chain: Record<string, unknown> = {};
      for (const m of ["select", "eq", "in"]) chain[m] = () => chain;
      chain.then = (resolve: (r: Result) => unknown) => resolve(result);
      return chain;
    },
  };
}

const launched: OwnedClass = {
  id: "c1",
  name: "Quant Club",
  templateId: "quant-foundations-v1",
  startsOn: "2026-10-05",
  timezone: "America/Chicago",
  launchedAt: "2026-10-01T00:00:00Z",
  skipWeeks: [],
  joinCode: "ABC234",
};

const ok = (data: unknown[]): Result => ({ data, error: null });
const goodTables = (): Tables => ({
  class_members: ok([
    { student_id: "s1", joined_at: "2026-10-05T15:00:00Z" },
    { student_id: "s2", joined_at: "2026-10-05T15:00:00Z" },
  ]),
  assignments: ok([
    { lesson_id: "inv-1", week_number: 1, position: 1, due_on: "2026-10-11" },
    { lesson_id: "inv-2", week_number: 1, position: 2, due_on: "2026-10-11" },
  ]),
  profiles: ok([{ id: "s1", display_name: "Ava C." }]), // s2 has no profile row
  progress: ok([{ user_id: "s1", last_activity_date: "2026-10-06" }]),
  lesson_completions: ok([{ user_id: "s1", lesson_id: "inv-1", completed_at: "2026-10-06T16:00:00Z" }]),
  capstone_submissions: ok([]),
});

describe("loadCohortScorecard", () => {
  beforeEach(() => {
    getSupabaseAdminMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-08T18:00:00Z"));
  });

  it("returns null for a class that was never launched as a cohort", async () => {
    getSupabaseAdminMock.mockReturnValue(fakeAdmin(goodTables()));
    expect(await loadCohortScorecard({ ...launched, templateId: null })).toBeNull();
    expect(await loadCohortScorecard({ ...launched, startsOn: null })).toBeNull();
  });

  it("says so, instead of showing numbers, when the server has no database connection", async () => {
    getSupabaseAdminMock.mockReturnValue(null);
    expect(await loadCohortScorecard(launched)).toEqual({ measurable: false, reason: "The server isn't connected to the database." });
  });

  it("builds the scorecard from the rows, and names a student whose profile row is missing", async () => {
    getSupabaseAdminMock.mockReturnValue(fakeAdmin(goodTables()));
    const result = await loadCohortScorecard(launched);
    expect(result?.measurable).toBe(true);
    if (!result?.measurable) return;
    const { metrics, csv } = result;
    expect(metrics.enrolled).toBe(2);
    expect(metrics.activated.count).toBe(1); // only s1 finished the first lesson
    const byId = new Map(metrics.students.map((s) => [s.studentId, s]));
    expect(byId.get("s1")?.displayName).toBe("Ava C.");
    expect(byId.get("s2")?.displayName).toBe("StrikeLab student");
    expect(byId.get("s1")?.lessonsDone).toBe(1);
    expect(csv.length).toBe(3); // header + two students
  });

  it("refuses to show made-up numbers when the completions table (migration 0016) is missing", async () => {
    getSupabaseAdminMock.mockReturnValue(fakeAdmin({ ...goodTables(), lesson_completions: { data: null, error: { message: "relation does not exist" } } }));
    const result = await loadCohortScorecard(launched);
    expect(result).toMatchObject({ measurable: false });
    expect((result as { reason: string }).reason).toMatch(/0016/);
  });

  it("still works before capstones exist (migration 0019): program completion just ignores them", async () => {
    getSupabaseAdminMock.mockReturnValue(fakeAdmin({ ...goodTables(), capstone_submissions: { data: null, error: { message: "relation does not exist" } } }));
    const result = await loadCohortScorecard(launched);
    expect(result?.measurable).toBe(true);
    if (result?.measurable) expect(result.metrics.capstones).toBeNull();
  });

  it("reads a class with no students without touching the per-student tables", async () => {
    getSupabaseAdminMock.mockReturnValue(fakeAdmin({ ...goodTables(), class_members: ok([]) }));
    const result = await loadCohortScorecard(launched);
    expect(result?.measurable).toBe(true);
    if (result?.measurable) expect(result.metrics.enrolled).toBe(0);
  });
});
