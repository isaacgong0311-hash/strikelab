import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
vi.mock("@/lib/rateLimit", () => ({ rateLimit: async () => null }));

import { POST } from "./route";

const req = (body?: unknown) => new NextRequest("http://localhost/api/record/share", { method: "POST", body: JSON.stringify(body ?? {}) });

function signedIn(result: { data: unknown; error: { message: string } | null }) {
  const rpc = vi.fn(async () => result);
  requireUserMock.mockResolvedValue({ userId: "u1", supabase: { rpc } });
  return rpc;
}

describe("POST /api/record/share", () => {
  beforeEach(() => {
    requireUserMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("needs a signed-in student and a boolean", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    expect((await POST(req({ enabled: true }))).status).toBe(401);
    signedIn({ data: null, error: null });
    expect((await POST(req({ enabled: "yes" }))).status).toBe(400);
  });

  it("returns the token the database minted, and null when sharing is turned off", async () => {
    const rpc = signedIn({ data: "11111111-1111-4111-8111-111111111111", error: null });
    const on = await POST(req({ enabled: true }));
    expect(await on.json()).toEqual({ shareToken: "11111111-1111-4111-8111-111111111111" });
    expect(rpc).toHaveBeenCalledWith("set_record_sharing", { p_enabled: true });
    signedIn({ data: null, error: null });
    expect(await (await POST(req({ enabled: false }))).json()).toEqual({ shareToken: null });
  });

  it("explains that a handle comes first", async () => {
    signedIn({ data: null, error: { message: "handle_required" } });
    const res = await POST(req({ enabled: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/handle/);
  });
});
