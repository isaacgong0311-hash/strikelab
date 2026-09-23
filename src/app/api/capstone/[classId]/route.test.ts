import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));

const ctx = { params: Promise.resolve({ classId: "class-1" }) };
const fields = {
  promptId: "backtest",
  title: "MA crossover",
  thesis: "Q",
  code: "print(1)",
  resultSummary: "R",
  reflection: "F",
};

/** Minimal chainable Supabase stub: `existing` answers the status lookup, `upsert` records writes. */
function supabaseStub(existing: { status: string } | null, upsertError: { code: string } | null = null) {
  const upsert = vi.fn().mockReturnValue({
    select: () => ({
      single: async () =>
        upsertError
          ? { data: null, error: upsertError }
          : { data: { id: "cap-1", class_id: "class-1", ...upsertArgs(upsert), updated_at: "2026-12-01T00:00:00Z" }, error: null },
    }),
  });
  const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: existing, error: null }), upsert };
  return { client: { from: () => chain }, upsert };
}
function upsertArgs(upsert: ReturnType<typeof vi.fn>) {
  const row = upsert.mock.calls.at(-1)?.[0] ?? {};
  return { ...row };
}

function put(body: unknown) {
  return new NextRequest("http://localhost/api/capstone/class-1", { method: "PUT", body: JSON.stringify(body) });
}

describe("PUT /api/capstone/[classId]", () => {
  beforeEach(() => vi.resetModules());

  it("rejects an incomplete submission but saves an incomplete draft", async () => {
    const { client } = supabaseStub(null);
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: client });
    const { PUT } = await import("./route");
    expect((await PUT(put({ ...fields, reflection: "", submit: true }), ctx)).status).toBe(400);
    expect((await PUT(put({ ...fields, reflection: "", submit: false }), ctx)).status).toBe(200);
  });

  it("never turns a submitted capstone back into a draft", async () => {
    const { client, upsert } = supabaseStub({ status: "submitted" });
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: client });
    const { PUT } = await import("./route");
    await PUT(put({ ...fields, submit: false }), ctx);
    expect(upsert.mock.calls[0][0]).toMatchObject({ status: "submitted", user_id: "u1", class_id: "class-1" });
  });

  it("answers 404 when RLS refuses (not a member of the class)", async () => {
    const { client } = supabaseStub(null, { code: "42501" });
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: client });
    const { PUT } = await import("./route");
    expect((await PUT(put({ ...fields, submit: false }), ctx)).status).toBe(404);
  });

  it("requires sign-in", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    const { PUT } = await import("./route");
    expect((await PUT(put(fields), ctx)).status).toBe(401);
  });
});

describe("POST /api/capstone/[classId]/share", () => {
  beforeEach(() => vi.resetModules());

  function shareStub(own: { id: string; status: string } | null) {
    const rpc = vi.fn().mockResolvedValue({ data: "tok-1", error: null });
    const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: own, error: null }) };
    return { client: { from: () => chain, rpc }, rpc };
  }
  const post = (body: unknown) =>
    new NextRequest("http://localhost/api/capstone/class-1/share", { method: "POST", body: JSON.stringify(body) });

  it("only shares a submitted capstone, through the token-minting RPC", async () => {
    const draft = shareStub({ id: "cap-1", status: "draft" });
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: draft.client });
    let { POST } = await import("./share/route");
    expect((await POST(post({ enabled: true }), ctx)).status).toBe(400);
    expect(draft.rpc).not.toHaveBeenCalled();

    vi.resetModules();
    const done = shareStub({ id: "cap-1", status: "submitted" });
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: done.client });
    ({ POST } = await import("./share/route"));
    const res = await POST(post({ enabled: true }), ctx);
    expect(await res.json()).toEqual({ shareToken: "tok-1" });
    expect(done.rpc).toHaveBeenCalledWith("set_capstone_sharing", { p_capstone_id: "cap-1", p_enabled: true });
  });

  it("validates the body", async () => {
    const s = shareStub({ id: "cap-1", status: "submitted" });
    requireUserMock.mockResolvedValue({ userId: "u1", supabase: s.client });
    const { POST } = await import("./share/route");
    expect((await POST(post({ enabled: "yes" }), ctx)).status).toBe(400);
  });
});
