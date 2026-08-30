import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Covers the race-condition fallback added alongside the money-paths audit
// (docs/money-paths-audit.md): the UNIQUE (user_id, track_id) constraint on
// public.certificates already guarantees only one row can exist, but a
// concurrent double-submit used to surface the losing request's unique
// violation as a bare 500 instead of the certificate id it should get.

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({
  requireUser: (...args: unknown[]) => requireUserMock(...args),
}));

const getSupabaseAdminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: (...args: unknown[]) => getSupabaseAdminMock(...args),
}));

vi.mock("@/lib/certificates", () => ({
  isTrackComplete: () => true,
}));

vi.mock("@/lib/tracks", () => ({
  TRACKS: [{ id: "options-101", lessons: [{ id: "l1" }] }],
}));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/certificates/issue", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function fakeAuth() {
  return {
    userId: "user-1",
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: { completed: ["l1"] } }) }),
            maybeSingle: () => Promise.resolve({ data: { completed: ["l1"] } }),
          }),
        }),
      }),
      auth: { getUser: () => Promise.resolve({ data: { user: { user_metadata: {}, email: "a@b.com" } } }) },
    },
  };
}

describe("POST /api/certificates/issue — concurrent-issue race", () => {
  it("returns the existing certificate id when insert loses a race (unique violation)", async () => {
    requireUserMock.mockResolvedValue(fakeAuth());

    const insertSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate key" } });
    const racedSingle = vi.fn().mockResolvedValue({ data: { id: "existing-cert-id" } });

    getSupabaseAdminMock.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }), // no pre-existing cert seen
              single: racedSingle,
            }),
          }),
        }),
        insert: () => ({ select: () => ({ single: insertSingle }) }),
      }),
    });

    const { POST } = await import("./route");
    const res = await POST(makeRequest({ trackId: "options-101" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: "existing-cert-id" });
  });

  it("still 500s when the insert fails for a reason other than a unique violation", async () => {
    requireUserMock.mockResolvedValue(fakeAuth());

    getSupabaseAdminMock.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { code: "500", message: "db down" } }),
          }),
        }),
      }),
    });

    const { POST } = await import("./route");
    const res = await POST(makeRequest({ trackId: "options-101" }));
    expect(res.status).toBe(500);
  });
});
