import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const founder = "22222222-2222-4222-8222-222222222222";
const student = "11111111-1111-4111-8111-111111111111";
const capstone = "55555555-5555-4555-8555-555555555555";
const requireUserMock = vi.fn();
const adminMock = vi.fn();
const queueMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => adminMock() }));
vi.mock("@/lib/admin/loadVerificationQueue", () => ({ loadVerificationQueue: (...args: unknown[]) => queueMock(...args) }));

const request = (body: unknown) => new NextRequest("http://localhost/api/admin/verify", { method: "POST", body: JSON.stringify(body) });
const claim = { kind: "capstone", userId: student, subjectId: capstone, notes: "Defense passed", parentConsentRecorded: true };

describe("POST /api/admin/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FOUNDER_USER_IDS = founder;
    requireUserMock.mockResolvedValue({ userId: founder, supabase: {} });
    queueMock.mockResolvedValue({ capstones: [{ kind: "capstone", userId: student, subjectId: capstone }], placings: [] });
  });

  it("returns a plain 404 to non-founders without using the admin client", async () => {
    requireUserMock.mockResolvedValue({ userId: student, supabase: {} });
    const { POST } = await import("./route");
    const result = await POST(request(claim));
    expect(result.status).toBe(404);
    expect(adminMock).not.toHaveBeenCalled();
  });

  it("rejects missing parent consent before any write", async () => {
    const insert = vi.fn();
    adminMock.mockReturnValue({ from: () => ({ insert }) });
    const { POST } = await import("./route");
    for (const consent of [false, undefined]) {
      const result = await POST(request({ ...claim, parentConsentRecorded: consent }));
      expect(result.status).toBe(400);
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it("writes only an eligible claim with the reviewer and recorded consent", async () => {
    const insert = vi.fn().mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "verified-id" }, error: null }) }) });
    adminMock.mockReturnValue({ from: () => ({ insert }) });
    const { POST } = await import("./route");
    const result = await POST(request(claim));
    expect(result.status).toBe(200);
    expect(insert).toHaveBeenCalledWith({
      user_id: student, kind: "capstone", subject_id: capstone,
      reviewer_id: founder, parent_consent_recorded: true, notes: "Defense passed",
    });
  });

  it("rejects a claim outside the current queue", async () => {
    adminMock.mockReturnValue({ from: vi.fn() });
    const { POST } = await import("./route");
    const result = await POST(request({ ...claim, subjectId: "66666666-6666-4666-8666-666666666666" }));
    expect(result.status).toBe(400);
  });
});
