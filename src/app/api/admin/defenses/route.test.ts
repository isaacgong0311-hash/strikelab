import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireUserMock = vi.fn();
const adminMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => adminMock() }));

import { POST } from "./route";

const FOUNDER = "00000000-0000-4000-8000-000000000001";
const body = { handle: "alpha", kind: "placing", seasonId: "s1-2026", outcome: "verified", consentConfirmed: true, reviewerLabel: "Isaac G." };
const req = (b: unknown) => new NextRequest("http://localhost/api/admin/defenses", { method: "POST", body: JSON.stringify(b) });

function fakeAdmin(student: { id: string } | null) {
  const insert = vi.fn(async () => ({ error: null }));
  const chain = {
    select: () => chain,
    ilike: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: async () => ({ data: student, error: null }),
    insert,
  };
  adminMock.mockReturnValue({ from: () => chain });
  return insert;
}

describe("POST /api/admin/defenses", () => {
  beforeEach(() => {
    requireUserMock.mockReset();
    adminMock.mockReset();
    process.env.FOUNDER_USER_IDS = FOUNDER;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("is a 404 for anyone who isn't the founder", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    expect((await POST(req(body))).status).toBe(404);
    requireUserMock.mockResolvedValue({ userId: "00000000-0000-4000-8000-000000000002", supabase: {} });
    expect((await POST(req(body))).status).toBe(404);
  });

  it("refuses to save without consent", async () => {
    requireUserMock.mockResolvedValue({ userId: FOUNDER, supabase: {} });
    const insert = fakeAdmin({ id: "student-1" });
    const res = await POST(req({ ...body, consentConfirmed: false }));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("saves a sign-off for a known handle, with the founder as reviewer", async () => {
    requireUserMock.mockResolvedValue({ userId: FOUNDER, supabase: {} });
    const insert = fakeAdmin({ id: "student-1" });
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "student-1", kind: "placing", season_id: "s1-2026", outcome: "verified", consent_confirmed: true, reviewer_id: FOUNDER,
    }));
  });

  it("says when no student has the handle", async () => {
    requireUserMock.mockResolvedValue({ userId: FOUNDER, supabase: {} });
    fakeAdmin(null);
    const res = await POST(req(body));
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/No student has the handle alpha/);
  });
});
