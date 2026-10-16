import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// The path every student takes at kickoff. Covers each outcome a student can
// hit: not signed in, empty/bad/unknown code, an outage, success, joining
// twice, and a failed insert.

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));

const rateLimitMock = vi.fn();
vi.mock("@/lib/rateLimit", () => ({ rateLimit: (...a: unknown[]) => rateLimitMock(...a) }));

const getSupabaseAdminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => getSupabaseAdminMock() }));

import { POST } from "./route";

const klass = { id: "class-1", name: "Quant Club", template_id: "quant-foundations-v1", starts_on: "2026-11-02" };

function adminReturning(result: { data: unknown; error: { message: string } | null } | "throw") {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (result === "throw") throw new Error("down");
            return result;
          },
        }),
      }),
    }),
  };
}

function signedIn(insertError: { code?: string; message: string } | null = null) {
  const insert = vi.fn(async () => ({ error: insertError }));
  requireUserMock.mockResolvedValue({ userId: "student-1", supabase: { from: () => ({ insert }) } });
  return insert;
}

const post = (body: unknown) =>
  POST(new NextRequest("http://localhost/api/classes/join", { method: "POST", body: JSON.stringify(body) }));

describe("POST /api/classes/join", () => {
  beforeEach(() => {
    requireUserMock.mockReset();
    rateLimitMock.mockReset().mockResolvedValue(null);
    getSupabaseAdminMock.mockReset().mockReturnValue(adminReturning({ data: klass, error: null }));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("rejects someone who isn't signed in", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    expect((await post({ code: "ABC234" })).status).toBe(401);
  });

  it("stops at the rate limit before touching the database", async () => {
    signedIn();
    const { NextResponse } = await import("next/server");
    rateLimitMock.mockResolvedValue(NextResponse.json({ error: "Too many attempts" }, { status: 429 }));
    expect((await post({ code: "ABC234" })).status).toBe(429);
    expect(getSupabaseAdminMock).not.toHaveBeenCalled();
  });

  it("asks for a code when none is given", async () => {
    signedIn();
    for (const body of [{}, { code: "" }, { code: "   " }]) expect((await post(body)).status).toBe(400);
  });

  it("says 404 for a code that matches no class, and for a malformed one", async () => {
    signedIn();
    getSupabaseAdminMock.mockReturnValue(adminReturning({ data: null, error: null }));
    expect((await post({ code: "ABC234" })).status).toBe(404);
    expect((await post({ code: "abc" })).status).toBe(404);
  });

  it("says 503, not 'wrong code', when the class database can't be reached", async () => {
    signedIn();
    getSupabaseAdminMock.mockReturnValue(adminReturning({ data: null, error: { message: "connection refused" } }));
    const res = await post({ code: "ABC234" });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/can't reach/);

    getSupabaseAdminMock.mockReturnValue(null); // not configured at all
    expect((await post({ code: "ABC234" })).status).toBe(503);
  });

  it("joins a cohort, normalising the code and inserting the caller's own row", async () => {
    const insert = signedIn();
    const res = await post({ code: "  abc234 " });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "class-1", name: "Quant Club", isCohort: true });
    expect(insert).toHaveBeenCalledWith({ class_id: "class-1", student_id: "student-1" });
  });

  it("reports a plain class (no cohort launched) as not a cohort", async () => {
    signedIn();
    getSupabaseAdminMock.mockReturnValue(adminReturning({ data: { ...klass, template_id: null, starts_on: null }, error: null }));
    expect((await (await post({ code: "ABC234" })).json()).isCohort).toBe(false);
  });

  it("treats joining twice as success", async () => {
    signedIn({ code: "23505", message: "duplicate key" });
    expect((await post({ code: "ABC234" })).status).toBe(200);
  });

  it("answers 500 when the membership insert fails for any other reason", async () => {
    signedIn({ code: "XX000", message: "boom" });
    expect((await post({ code: "ABC234" })).status).toBe(500);
  });
});
