import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const rateLimitMock = vi.fn().mockResolvedValue(null);
vi.mock("@/lib/rateLimit", () => ({ rateLimit: () => rateLimitMock() }));

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({
  requireUser: (...args: unknown[]) => requireUserMock(...args),
}));

const requireTeacherOwnsClassMock = vi.fn();
vi.mock("@/lib/classes", () => ({
  requireTeacherOwnsClass: (...args: unknown[]) => requireTeacherOwnsClassMock(...args),
}));

function request(body: unknown) {
  return new NextRequest("http://localhost/api/classes/class-1/launch", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ id: "class-1" }) };

describe("POST /api/classes/[id]/launch", () => {
  it("requires authentication", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    const { POST } = await import("./route");
    expect((await POST(request({}), context)).status).toBe(401);
  });

  it("returns 404 when the caller does not own the class", async () => {
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase: {} });
    requireTeacherOwnsClassMock.mockResolvedValue({ error: "Class not found", status: 404 });
    const { POST } = await import("./route");
    expect((await POST(request({ startsOn: "2026-09-14", timezone: "America/Chicago" }), context)).status).toBe(404);
  });

  it.each([
    [{ startsOn: "2026-02-30", timezone: "America/Chicago" }, "valid start date"],
    [{ startsOn: "2026-09-14", timezone: "Not/A_Zone" }, "valid timezone"],
    [{ startsOn: "2026-09-14", timezone: "America/Chicago", skipWeeks: ["2026-09-15"] }, "Break weeks"],
    [{ startsOn: "2026-09-14", timezone: "America/Chicago", skipWeeks: "2026-09-21" }, "Break weeks"],
  ])("rejects invalid launch metadata", async (body, message) => {
    const supabase = { rpc: vi.fn() };
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase });
    requireTeacherOwnsClassMock.mockResolvedValue({ class: { id: "class-1", name: "Quant Club" } });
    const { POST } = await import("./route");
    const response = await POST(request(body), context);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain(message);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("launches the fixed schedule transactionally", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const supabase = { rpc };
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase });
    requireTeacherOwnsClassMock.mockResolvedValue({ class: { id: "class-1", name: "Quant Club" } });
    const { POST } = await import("./route");

    const response = await POST(
      request({ startsOn: "2026-09-14", timezone: "America/Chicago" }),
      context,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.cohort).toMatchObject({
      templateId: "quant-foundations-v1",
      startsOn: "2026-09-14",
      timezone: "America/Chicago",
    });
    expect(json.cohort.schedule).toHaveLength(12);
    expect(rpc).toHaveBeenCalledWith("launch_cohort", expect.objectContaining({
      p_class_id: "class-1",
      p_template_id: "quant-foundations-v1",
      p_starts_on: "2026-09-14",
      p_timezone: "America/Chicago",
      p_schedule: expect.arrayContaining([
        { lesson_id: "inv-1", week_number: 1, position: 1, due_on: "2026-09-20" },
      ]),
    }));
  });

  it("passes break weeks through and shifts later due dates", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase: { rpc } });
    requireTeacherOwnsClassMock.mockResolvedValue({ class: { id: "class-1", name: "Quant Club" } });
    const { POST } = await import("./route");

    const response = await POST(
      request({ startsOn: "2026-10-26", timezone: "America/Chicago", skipWeeks: ["2026-11-23"] }),
      context,
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.cohort.skipWeeks).toEqual(["2026-11-23"]);
    expect(rpc).toHaveBeenCalledWith("launch_cohort", expect.objectContaining({
      p_skip_weeks: ["2026-11-23"],
      p_schedule: expect.arrayContaining([
        { lesson_id: "q4", week_number: 6, position: 1, due_on: "2026-12-13" },
      ]),
    }));
  });

  it("reports a failed transaction without claiming launch succeeded", async () => {
    const supabase = { rpc: vi.fn().mockResolvedValue({ error: { message: "db down" } }) };
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase });
    requireTeacherOwnsClassMock.mockResolvedValue({ class: { id: "class-1", name: "Quant Club" } });
    const { POST } = await import("./route");
    const response = await POST(
      request({ startsOn: "2026-09-14", timezone: "America/Chicago" }),
      context,
    );
    expect(response.status).toBe(500);
  });
});
