import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rateLimit } from "./rateLimit";

// The counting itself runs in Postgres (rateLimit.db.test.ts). This covers
// what the route answers when the limiter can't be reached (build plan T3.8).

const withRpc = (result: { data: unknown; error: unknown }) =>
  ({ rpc: vi.fn(async () => result) }) as unknown as SupabaseClient;
const failing = withRpc({ data: null, error: { code: "08006", message: "connection failure" } });
const missing = withRpc({ data: null, error: { code: "PGRST202", message: "function not found" } });

describe("rateLimit", () => {
  it("allows under the limit and answers 429 with Retry-After over it", async () => {
    expect(await rateLimit(withRpc({ data: true, error: null }), "class-join")).toBeNull();
    const res = await rateLimit(withRpc({ data: false, error: null }), "class-join");
    expect(res?.status).toBe(429);
    expect(res?.headers.get("Retry-After")).toBe("600");
  });

  it("refuses an invite-code join when the limiter is down, so codes can't be guessed during an outage", async () => {
    const res = await rateLimit(failing, "class-join");
    expect(res?.status).toBe(503);
    expect((await res?.json()).error).toMatch(/Try again in a minute/);
  });

  it("lets everyday writes through when the limiter is down", async () => {
    expect(await rateLimit(failing, "capstone-save")).toBeNull();
    expect(await rateLimit(failing, "season-attempt")).toBeNull();
  });

  it("allows even a join before migration 0021 exists", async () => {
    expect(await rateLimit(missing, "class-join")).toBeNull();
  });
});
