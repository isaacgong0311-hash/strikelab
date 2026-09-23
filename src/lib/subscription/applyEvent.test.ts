import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { applySubscriptionEvent } from "./applyEvent";

type Row = Record<string, unknown> & { user_id: string; stripe_customer_id: string; last_event_created?: number | null };

/**
 * In-memory stand-in for the two query shapes applySubscriptionEvent uses,
 * applying .eq() and the `last_event_created.is.null,...lte.N` .or() filter
 * the way PostgREST would. `hasColumn: false` mimics a database where
 * migration 0020 hasn't run.
 */
function fakeAdmin(rows: Row[], hasColumn = true) {
  const client = {
    from: () => {
      let patch: Record<string, unknown> | null = null;
      const filters: ((r: Row) => boolean)[] = [];
      const run = async () => {
        if (patch && !hasColumn && "last_event_created" in patch) {
          return { data: null, error: { code: "PGRST204", message: "column missing" } };
        }
        const hit = rows.filter((r) => filters.every((f) => f(r)));
        if (patch) hit.forEach((r) => Object.assign(r, patch));
        return { data: hit.map((r) => ({ user_id: r.user_id })), error: null };
      };
      const chain = {
        update(p: Record<string, unknown>) { patch = p; return chain; },
        select() { return chain; },
        eq(col: string, v: unknown) { filters.push((r) => r[col] === v); return chain; },
        or(expr: string) {
          const n = Number(expr.match(/lte\.(\d+)/)?.[1]);
          filters.push((r) => r.last_event_created == null || (r.last_event_created as number) <= n);
          return chain;
        },
        async maybeSingle() { const { data } = await run(); return { data: data?.[0] ?? null, error: null }; },
        then(resolve: (v: unknown) => void, reject: (e: unknown) => void) { return run().then(resolve, reject); },
      };
      return chain;
    },
  };
  return client as unknown as SupabaseClient;
}

const fields = (status: string) => ({ stripe_subscription_id: "sub_1", plan: "pro", status, current_period_end: null });

describe("applySubscriptionEvent", () => {
  it("applies events in order and ignores an older one that arrives late", async () => {
    const rows: Row[] = [{ user_id: "u1", stripe_customer_id: "cus_1", status: null, last_event_created: null }];
    const admin = fakeAdmin(rows);
    expect(await applySubscriptionEvent(admin, "cus_1", fields("active"), 1_000)).toBe("applied");
    expect(await applySubscriptionEvent(admin, "cus_1", fields("canceled"), 2_000)).toBe("applied");
    // The "active" update from t=1500 was delayed and arrives last.
    expect(await applySubscriptionEvent(admin, "cus_1", fields("active"), 1_500)).toBe("stale");
    expect(rows[0]).toMatchObject({ status: "canceled", last_event_created: 2_000 });
  });

  it("reports a customer with no row yet as missing", async () => {
    expect(await applySubscriptionEvent(fakeAdmin([]), "cus_x", fields("active"), 1)).toBe("missing");
  });

  it("falls back to the unguarded write before migration 0020", async () => {
    const rows: Row[] = [{ user_id: "u1", stripe_customer_id: "cus_1", status: null }];
    expect(await applySubscriptionEvent(fakeAdmin(rows, false), "cus_1", fields("active"), 5)).toBe("applied");
    expect(rows[0].status).toBe("active");
    expect(rows[0]).not.toHaveProperty("last_event_created");
  });
});
