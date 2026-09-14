import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Covers auth/ownership gating and the batch-assign idempotency guarantee:
// re-assigning a lesson that's already assigned (alongside new ones) must
// not fail the whole request, which is why POST uses upsert+ignoreDuplicates
// instead of insert()+catch(23505) (a multi-row insert() fails atomically on
// any one collision — see the route file's docstring).

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({
  requireUser: (...args: unknown[]) => requireUserMock(...args),
}));

const requireTeacherOwnsClassMock = vi.fn();
vi.mock("@/lib/classes", () => ({
  requireTeacherOwnsClass: (...args: unknown[]) => requireTeacherOwnsClassMock(...args),
}));

vi.mock("@/lib/tracks", () => ({
  TRACKS: [{ id: "options", title: "Options", lessons: [{ id: "opt-1", title: "Calls & Puts" }] }],
  getLessonById: (id: string) =>
    id === "opt-1" ? { id: "opt-1", title: "Calls & Puts", trackId: "options" } : null,
}));

function makeGetRequest() {
  return new NextRequest("http://localhost/api/classes/class-1/assignments");
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/classes/class-1/assignments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function params(id = "class-1") {
  return { params: Promise.resolve({ id }) };
}

describe("GET/POST /api/classes/[id]/assignments", () => {
  it("GET returns 401 when there is no session", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    const { GET } = await import("./route");
    const res = await GET(makeGetRequest(), params());
    expect(res.status).toBe(401);
  });

  it("returns 404 when the caller doesn't own the class", async () => {
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase: {} });
    requireTeacherOwnsClassMock.mockResolvedValue({ error: "Class not found", status: 404 });

    const { GET, POST } = await import("./route");
    const getRes = await GET(makeGetRequest(), params());
    expect(getRes.status).toBe(404);

    const postRes = await POST(makePostRequest({ lessonIds: ["opt-1"] }), params());
    expect(postRes.status).toBe(404);
  });

  it("POST rejects the whole batch with 400 when any lesson id is unknown", async () => {
    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase: {} });
    requireTeacherOwnsClassMock.mockResolvedValue({ class: { id: "class-1", name: "3rd period" } });

    const { POST } = await import("./route");
    const res = await POST(makePostRequest({ lessonIds: ["opt-1", "not-a-real-lesson"] }), params());
    expect(res.status).toBe(400);
  });

  it("POST upserts with ignoreDuplicates so re-assigning an existing lesson doesn't fail the batch", async () => {
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: () => ({
        upsert: upsertSpy,
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: [{ id: "a1", lesson_id: "opt-1", created_at: "2026-01-01" }],
              }),
          }),
        }),
      }),
    };

    requireUserMock.mockResolvedValue({ userId: "teacher-1", supabase });
    requireTeacherOwnsClassMock.mockResolvedValue({ class: { id: "class-1", name: "3rd period" } });

    const { POST } = await import("./route");
    const res = await POST(makePostRequest({ lessonIds: ["opt-1"] }), params());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.assignments).toEqual([
      {
        id: "a1",
        lessonId: "opt-1",
        lessonTitle: "Calls & Puts",
        trackTitle: "Options",
        createdAt: "2026-01-01",
        weekNumber: null,
        position: null,
        dueOn: null,
      },
    ]);
    expect(upsertSpy).toHaveBeenCalledWith(
      [{ class_id: "class-1", lesson_id: "opt-1" }],
      { onConflict: "class_id,lesson_id", ignoreDuplicates: true }
    );
  });
});
