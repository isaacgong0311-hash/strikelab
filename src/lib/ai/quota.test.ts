import { describe, expect, it, vi } from "vitest";
import { consumeAiQuota, DAILY_AI_ACTIONS, AI_COST } from "./quota";

// consumeAiQuota calls the consume_ai_quota() Postgres RPC (see
// supabase/migrations/0008_separate_ai_quota_from_hints.sql), which can't be
// exercised against a real database from this test run. This file locks in
// the JS-side half of that contract: the right RPC is called with the right
// cost/cap, and the response shape maps to QuotaResult correctly — including
// the fail-open behavior on an RPC error, which is a real production
// requirement (a DB hiccup must not block a student mid-lesson), not just an
// edge case.

function fakeSupabase(rpcImpl: (args: unknown) => { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn((_fn: string, args: unknown) => ({
      single: () => Promise.resolve(rpcImpl(args)),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("consumeAiQuota", () => {
  it("passes the feature's cost and the shared daily cap to the RPC", async () => {
    let captured: Record<string, unknown> | undefined;
    const supabase = fakeSupabase((args) => {
      captured = args as Record<string, unknown>;
      return { data: { new_count: 2, allowed: true }, error: null };
    });

    await consumeAiQuota(supabase, "user-1", "review");

    expect(captured?.p_user_id).toBe("user-1");
    expect(captured?.p_cost).toBe(AI_COST.review);
    expect(captured?.p_cap).toBe(DAILY_AI_ACTIONS);
  });

  it("returns allowed:true with the post-increment count on success", async () => {
    const supabase = fakeSupabase(() => ({ data: { new_count: 5, allowed: true }, error: null }));
    const result = await consumeAiQuota(supabase, "user-1", "chat");
    expect(result).toEqual({ allowed: true, used: 5, limit: DAILY_AI_ACTIONS });
  });

  it("returns allowed:false with the current (unincremented) count when over cap", async () => {
    const supabase = fakeSupabase(() => ({
      data: { new_count: DAILY_AI_ACTIONS, allowed: false },
      error: null,
    }));
    const result = await consumeAiQuota(supabase, "user-1", "practice");
    expect(result).toEqual({ allowed: false, used: DAILY_AI_ACTIONS, limit: DAILY_AI_ACTIONS });
  });

  it("fails open (allows the request) on an RPC error, per the documented tradeoff", async () => {
    const supabase = fakeSupabase(() => ({ data: null, error: { message: "connection reset" } }));
    const result = await consumeAiQuota(supabase, "user-1", "chat");
    expect(result.allowed).toBe(true);
  });
});
