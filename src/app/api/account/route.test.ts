import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
const adminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => adminMock() }));

function admin({ sub = null, classes = [] as { id: string; class_members: { count: number }[] }[] } = {}) {
  const deleteUser = vi.fn().mockResolvedValue({ error: null });
  const from = (table: string) => {
    const chain = {
      select: () => chain,
      eq: () => (table === "classes" ? Promise.resolve({ data: classes }) : chain),
      maybeSingle: async () => ({ data: sub }),
    };
    return chain;
  };
  return { client: { from, auth: { admin: { deleteUser } } }, deleteUser };
}

const del = (body: unknown) => new NextRequest("http://localhost/api/account", { method: "DELETE", body: JSON.stringify(body) });

describe("DELETE /api/account", () => {
  beforeEach(() => {
    vi.resetModules();
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: {} });
  });

  it("requires typing DELETE", async () => {
    const a = admin();
    adminMock.mockReturnValue(a.client);
    const { DELETE } = await import("./route");
    expect((await DELETE(del({ confirm: "delete" }))).status).toBe(400);
    expect(a.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes the auth user, which cascades to all their data", async () => {
    const a = admin();
    adminMock.mockReturnValue(a.client);
    const { DELETE } = await import("./route");
    expect((await DELETE(del({ confirm: "DELETE" }))).status).toBe(200);
    expect(a.deleteUser).toHaveBeenCalledWith("u1");
  });

  it("refuses while a subscription is active", async () => {
    const a = admin({ sub: { status: "active" } as never });
    adminMock.mockReturnValue(a.client);
    const { DELETE } = await import("./route");
    expect((await DELETE(del({ confirm: "DELETE" }))).status).toBe(409);
    expect(a.deleteUser).not.toHaveBeenCalled();
  });

  it("refuses for a teacher whose class has students, but not for an empty class", async () => {
    const busy = admin({ classes: [{ id: "c1", class_members: [{ count: 3 }] }] });
    adminMock.mockReturnValue(busy.client);
    let { DELETE } = await import("./route");
    expect((await DELETE(del({ confirm: "DELETE" }))).status).toBe(409);

    vi.resetModules();
    const empty = admin({ classes: [{ id: "c2", class_members: [{ count: 0 }] }] });
    adminMock.mockReturnValue(empty.client);
    ({ DELETE } = await import("./route"));
    expect((await DELETE(del({ confirm: "DELETE" }))).status).toBe(200);
  });

  it("requires sign-in", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    const { DELETE } = await import("./route");
    expect((await DELETE(del({ confirm: "DELETE" }))).status).toBe(401);
  });
});
