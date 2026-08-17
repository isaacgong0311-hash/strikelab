import { describe, expect, it, vi } from "vitest";
import { consumeHintQuota } from "./route";

// Same reasoning as src/lib/ai/quota.test.ts — consumeHintQuota calls the
// consume_hint_quota() RPC (supabase/migrations/0008_separate_ai_quota_from_hints.sql)
// which can't be exercised against a real database here. This locks in the
// JS-side contract, and specifically that this cap is now independent from
// consumeAiQuota's (the bug this migration fixed: both used to read/write
// the same hint_usage row).

function fakeSupabase(rpcImpl: (args: unknown) => { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn((_fn: string, args: unknown) => ({
      single: () => Promise.resolve(rpcImpl(args)),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("consumeHintQuota", () => {
  it("passes the user id and the hint-specific cap (20, not the AI-action cap of 25)", async () => {
    let captured: Record<string, unknown> | undefined;
    const supabase = fakeSupabase((args) => {
      captured = args as Record<string, unknown>;
      return { data: { new_count: 1, allowed: true }, error: null };
    });

    await consumeHintQuota(supabase, "user-1");

    expect(captured?.p_user_id).toBe("user-1");
    expect(captured?.p_cap).toBe(20);
  });

  it("returns true when the RPC reports allowed:true", async () => {
    const supabase = fakeSupabase(() => ({ data: { new_count: 3, allowed: true }, error: null }));
    expect(await consumeHintQuota(supabase, "user-1")).toBe(true);
  });

  it("returns false when the RPC reports allowed:false (cap reached)", async () => {
    const supabase = fakeSupabase(() => ({ data: { new_count: 20, allowed: false }, error: null }));
    expect(await consumeHintQuota(supabase, "user-1")).toBe(false);
  });

  it("fails open (returns true) on an RPC error", async () => {
    const supabase = fakeSupabase(() => ({ data: null, error: { message: "timeout" } }));
    expect(await consumeHintQuota(supabase, "user-1")).toBe(true);
  });
});
