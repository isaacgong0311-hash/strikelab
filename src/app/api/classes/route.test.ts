import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Creating a class makes you the adult responsible for the minors who join
// it, so the setup wizard's confirmation is required here too (T3.6).

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
vi.mock("@/lib/rateLimit", () => ({ rateLimit: async () => null }));

import { POST } from "./route";

function signedIn() {
  const insert = vi.fn(() => ({
    select: () => ({ single: async () => ({ data: { id: "class-1", name: "Quant Club", join_code: "ABC234" }, error: null }) }),
  }));
  requireUserMock.mockResolvedValue({ userId: "leader-1", supabase: { from: () => ({ insert }) } });
  return insert;
}

const post = (body: unknown) =>
  POST(new NextRequest("http://localhost/api/classes", { method: "POST", body: JSON.stringify(body) }));

describe("POST /api/classes", () => {
  beforeEach(() => requireUserMock.mockReset());

  it("refuses to create a class without the leader's confirmation", async () => {
    const insert = signedIn();
    const res = await post({ name: "Quant Club" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/responsible/);
    expect(insert).not.toHaveBeenCalled();
  });

  it("creates the class once the leader confirms", async () => {
    const insert = signedIn();
    const res = await post({ name: "Quant Club", leaderConfirmed: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "class-1", name: "Quant Club", joinCode: "ABC234" });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ teacher_id: "leader-1", name: "Quant Club" }));
  });

  it("still asks for a name first", async () => {
    signedIn();
    expect((await post({ leaderConfirmed: true })).status).toBe(400);
  });
});
