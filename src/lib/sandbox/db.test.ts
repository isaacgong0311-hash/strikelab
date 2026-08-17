import { describe, expect, it, vi } from "vitest";
import { executeTrade, closePosition } from "./db";

// executeTrade/closePosition call Postgres RPCs (sandbox_open_position /
// sandbox_close_position — see supabase/migrations/0007_sandbox_atomic_trades.sql)
// that can't be exercised against a real database from this test run. This
// file locks in the JS-side half of that contract instead: the right RPC is
// called with the right shape of params, and RPC error responses map to the
// error messages the API routes / UI already expect (see
// src/app/api/sandbox/execute/route.ts and .../close/route.ts).

/** Minimal fake of the subset of SupabaseClient these functions use. */
function fakeSupabase(rpcImpl: (fn: string, args: unknown) => { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn((fn: string, args: unknown) => ({
      single: () => Promise.resolve(rpcImpl(fn, args)),
    })),
    from: vi.fn(() => {
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      builder.select = chain;
      builder.eq = chain;
      builder.is = chain;
      builder.maybeSingle = () =>
        Promise.resolve({
          data: {
            id: "pos-1",
            user_id: "user-1",
            symbol: "AAPL",
            asset_type: "stock",
            side: "long",
            qty: 10,
            avg_cost: 100,
            strike: null,
            expiry: null,
            opened_at: new Date().toISOString(),
            closed_at: null,
            close_price: null,
            realized_pnl: null,
          },
        });
      return builder;
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("executeTrade", () => {
  it("calls sandbox_open_position with the computed fill price and cost", async () => {
    let capturedArgs: Record<string, unknown> | undefined;
    const supabase = fakeSupabase((fn, args) => {
      capturedArgs = args as Record<string, unknown>;
      expect(fn).toBe("sandbox_open_position");
      return { data: { position_id: "pos-1", cash_balance: 99000 }, error: null };
    });

    const result = await executeTrade(supabase, "user-1", {
      symbol: "AAPL",
      assetType: "stock",
      side: "long",
      qty: 10,
    });

    expect(result).toEqual({ ok: true, cashBalance: 99000, positionId: "pos-1" });
    expect(capturedArgs?.p_user_id).toBe("user-1");
    expect(capturedArgs?.p_symbol).toBe("AAPL");
    expect(capturedArgs?.p_qty).toBe(10);
    // cost = fillPrice * qty * multiplier(stock=1) — just check it's a
    // positive number consistent with markPrice() having actually run.
    expect(capturedArgs?.p_cost).toBeGreaterThan(0);
  });

  it("maps an insufficient_funds RPC error to the user-facing message", async () => {
    const supabase = fakeSupabase(() => ({
      data: null,
      error: { message: "insufficient_funds" },
    }));

    const result = await executeTrade(supabase, "user-1", {
      symbol: "AAPL",
      assetType: "stock",
      side: "long",
      qty: 10,
    });

    expect(result).toEqual({ ok: false, error: "Insufficient cash balance for this trade" });
  });

  it("rejects a non-positive or non-integer qty before ever calling the RPC", async () => {
    const rpc = vi.fn();
    const supabase = { rpc, from: vi.fn() } as unknown as ReturnType<typeof fakeSupabase>;

    expect(
      await executeTrade(supabase, "user-1", { symbol: "AAPL", assetType: "stock", side: "long", qty: 0 }),
    ).toEqual({ ok: false, error: "Quantity must be a positive integer" });
    expect(
      await executeTrade(supabase, "user-1", { symbol: "AAPL", assetType: "stock", side: "long", qty: 1.5 }),
    ).toEqual({ ok: false, error: "Quantity must be a positive integer" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("requires strike and expiry for options", async () => {
    const rpc = vi.fn();
    const supabase = { rpc, from: vi.fn() } as unknown as ReturnType<typeof fakeSupabase>;

    const result = await executeTrade(supabase, "user-1", {
      symbol: "AAPL",
      assetType: "call",
      side: "long",
      qty: 1,
    });

    expect(result).toEqual({ ok: false, error: "Strike and expiry are required for options" });
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("closePosition", () => {
  it("calls sandbox_close_position with a computed realized P&L and cash delta", async () => {
    let capturedArgs: Record<string, unknown> | undefined;
    const supabase = fakeSupabase((fn, args) => {
      capturedArgs = args as Record<string, unknown>;
      expect(fn).toBe("sandbox_close_position");
      return { data: { cash_balance: 101000 }, error: null };
    });

    const result = await closePosition(supabase, "user-1", "pos-1");

    expect(result).toEqual({ ok: true, cashBalance: 101000, positionId: "pos-1" });
    expect(capturedArgs?.p_user_id).toBe("user-1");
    expect(capturedArgs?.p_position_id).toBe("pos-1");
    expect(typeof capturedArgs?.p_realized_pnl).toBe("number");
    expect(typeof capturedArgs?.p_cash_delta).toBe("number");
  });

  it("reports an RPC error (e.g. already closed by a concurrent request) as not-found", async () => {
    const supabase = fakeSupabase(() => ({ data: null, error: { message: "position_not_found" } }));

    const result = await closePosition(supabase, "user-1", "pos-1");

    expect(result).toEqual({ ok: false, error: "Position not found or already closed" });
  });
});
