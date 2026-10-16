import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const insert = vi.fn();
const getSupabaseAdminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => getSupabaseAdminMock() }));

import { POST } from "./route";

const post = (body: unknown) => POST(new NextRequest("http://localhost/api/intensive/waitlist", { method: "POST", body: JSON.stringify(body) }));
const valid = { parentEmail: "parent@example.com", grade: 10, isGuardian: true, source: "intensive-page" };

describe("POST /api/intensive/waitlist", () => {
  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
    getSupabaseAdminMock.mockReset().mockReturnValue({ from: () => ({ insert }) });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("stores a parent's entry", async () => {
    expect((await post(valid)).status).toBe(200);
    expect(insert).toHaveBeenCalledWith({ parent_email: "parent@example.com", student_grade: 10, note: null, source: "intensive-page" });
  });

  it("requires a real email and the guardian confirmation", async () => {
    expect((await post({ ...valid, parentEmail: "nope" })).status).toBe(400);
    expect((await post({ ...valid, isGuardian: false })).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("drops a bad grade instead of failing", async () => {
    await post({ ...valid, grade: 15 });
    expect(insert.mock.calls[0][0]).toMatchObject({ student_grade: null });
  });

  it("quietly ignores bots that fill the hidden field", async () => {
    expect((await post({ ...valid, website: "spam.example" })).status).toBe(200);
    expect(insert).not.toHaveBeenCalled();
  });

  it("treats signing up twice as success, and reports an unconfigured server", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate" } });
    expect((await post(valid)).status).toBe(200);
    getSupabaseAdminMock.mockReturnValue(null);
    expect((await post(valid)).status).toBe(503);
  });
});
