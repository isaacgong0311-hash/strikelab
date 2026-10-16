import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
vi.mock("@/lib/rateLimit", () => ({ rateLimit: async () => null }));

import { POST as start } from "./start/route";
import { POST as submit } from "./submit/route";

type RpcResult = { data: unknown; error: { message: string } | null };

function signedIn(opts: { challenge?: unknown; readError?: boolean; rpc?: RpcResult }) {
  const rpc = vi.fn(async () => opts.rpc ?? { data: [{ started_at: "2026-11-30T15:00:00Z", deadline: "2026-11-30T16:00:00Z", status: "started" }], error: null });
  requireUserMock.mockResolvedValue({
    userId: "user-1",
    supabase: {
      rpc,
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => (opts.readError ? { data: null, error: { message: "down" } } : { data: opts.challenge ?? null, error: null }),
          }),
        }),
      }),
    },
  });
  return rpc;
}

const ctx = { params: Promise.resolve({ id: "s1-w1" }) };
const req = (body?: unknown) => new NextRequest("http://localhost/x", { method: "POST", body: JSON.stringify(body ?? {}) });

describe("season attempt routes", () => {
  beforeEach(() => {
    requireUserMock.mockReset();
    process.env.SEASON_PARAM_SECRET = "test-secret";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("start: returns the student's own numbers and the preview test, never the official test", async () => {
    signedIn({ challenge: { id: "s1-w1", template_slug: "put-call-parity" } });
    const res = await start(req(), ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "started", title: "Price a put from a call", deadline: "2026-11-30T16:00:00Z" });
    expect(Object.keys(body.params).sort()).toEqual(["C", "K", "S", "T", "r"]);
    expect(body.prompt).toContain(String(body.params.S));
    expect(JSON.stringify(body)).not.toMatch(/_ref|_score|officialTest/);
  });

  it("start: maps database refusals to plain answers", async () => {
    signedIn({ challenge: null });
    expect((await start(req(), ctx)).status).toBe(404);
    signedIn({ readError: true });
    expect((await start(req(), ctx)).status).toBe(503);
    signedIn({ challenge: { id: "s1-w1", template_slug: "put-call-parity" }, rpc: { data: null, error: { message: "not_open" } } });
    const closed = await start(req(), ctx);
    expect(closed.status).toBe(409);
    expect((await closed.json()).error).toMatch(/isn't open/);
  });

  it("start: refuses without the server secret", async () => {
    process.env.SEASON_PARAM_SECRET = "";
    signedIn({ challenge: { id: "s1-w1", template_slug: "put-call-parity" } });
    expect((await start(req(), ctx)).status).toBe(503);
  });

  it("submit: validates code and explanation before touching the database", async () => {
    const rpc = signedIn({});
    expect((await submit(req({ code: "", explanation: "x".repeat(30) }), ctx)).status).toBe(400);
    expect((await submit(req({ code: "x = 1", explanation: "too short" }), ctx)).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("submit: sends one submission and maps late and repeat submissions", async () => {
    const rpc = signedIn({ rpc: { data: "2026-11-30T15:30:00Z", error: null } });
    const ok = await submit(req({ code: "x = 1", explanation: "Because parity links calls and puts.", previewPassed: true }), ctx);
    expect(ok.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("submit_attempt", {
      p_challenge_id: "s1-w1",
      p_code: "x = 1",
      p_explanation: "Because parity links calls and puts.",
      p_preview_passed: true,
    });
    signedIn({ rpc: { data: null, error: { message: "too_late" } } });
    expect((await submit(req({ code: "x = 1", explanation: "Because parity links calls and puts." }), ctx)).status).toBe(409);
  });

  it("both routes reject someone who isn't signed in", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    expect((await start(req(), ctx)).status).toBe(401);
    expect((await submit(req(), ctx)).status).toBe(401);
  });
});
