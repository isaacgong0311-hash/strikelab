import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// A paid subscription must never be dropped with a 200. If
// customer.subscription.created arrives before checkout.session.completed has
// created the row, the route has to answer 500 so Stripe redelivers it.
// (docs/money-paths-audit.md, "Correction, 2026-10-15".)

const constructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({ stripe: { webhooks: { constructEvent: (...a: unknown[]) => constructEvent(...a) } } }));

const getSupabaseAdminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => getSupabaseAdminMock() }));

import { POST } from "./route";

type Row = { user_id: string; stripe_customer_id: string; status?: string };

/** Just enough of the query builder for the two writes the route makes. */
function fakeAdmin(rows: Row[]) {
  return {
    from: () => ({
      upsert: async (row: Row) => {
        if (!rows.some((r) => r.user_id === row.user_id)) rows.push({ ...row });
        return { error: null };
      },
      update: (patch: Partial<Row>) => ({
        eq: (_col: string, customerId: string) => ({
          or: () => ({
            select: async () => {
              const hit = rows.filter((r) => r.stripe_customer_id === customerId);
              hit.forEach((r) => Object.assign(r, patch));
              return { data: hit.map((r) => ({ user_id: r.user_id })), error: null };
            },
          }),
        }),
      }),
      select: () => ({
        eq: (_col: string, customerId: string) => ({
          maybeSingle: async () => ({ data: rows.find((r) => r.stripe_customer_id === customerId) ?? null }),
        }),
      }),
    }),
  };
}

const subscriptionEvent = {
  type: "customer.subscription.created",
  created: 1_000,
  data: { object: { id: "sub_1", customer: "cus_1", status: "active", items: { data: [{ price: { id: "price_x" }, current_period_end: 2_000 }] } } },
};
const checkoutEvent = {
  type: "checkout.session.completed",
  created: 999,
  data: { object: { id: "cs_1", client_reference_id: "user-1", customer: "cus_1", customer_email: "a@b.co" } },
};

function request() {
  return new NextRequest("http://localhost/api/stripe/webhook", { method: "POST", body: "{}", headers: { "stripe-signature": "sig" } });
}

describe("stripe webhook delivery", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    constructEvent.mockReset();
    getSupabaseAdminMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("answers 500 when the subscription event arrives before the customer row exists, then applies it on redelivery", async () => {
    const rows: Row[] = [];
    getSupabaseAdminMock.mockReturnValue(fakeAdmin(rows));

    constructEvent.mockReturnValue(subscriptionEvent);
    expect((await POST(request())).status).toBe(500); // Stripe will retry
    expect(rows).toHaveLength(0);

    constructEvent.mockReturnValue(checkoutEvent);
    expect((await POST(request())).status).toBe(200); // row created
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ user_id: "user-1", stripe_customer_id: "cus_1" });

    constructEvent.mockReturnValue(subscriptionEvent); // the retry
    expect((await POST(request())).status).toBe(200);
    expect(rows[0]).toMatchObject({ status: "active" });
  });

  it("answers 500 when the database is not configured, so a paid checkout is retried", async () => {
    getSupabaseAdminMock.mockReturnValue(null);
    constructEvent.mockReturnValue(checkoutEvent);
    expect((await POST(request())).status).toBe(500);
  });

  it("still answers 200 for a stale event (a newer one already won)", async () => {
    const rows: Row[] = [{ user_id: "user-1", stripe_customer_id: "cus_1", status: "canceled" }];
    const admin = fakeAdmin(rows);
    // Make the guarded update match nothing, as the real one does for an older event.
    const stale = { ...admin, from: () => ({ ...admin.from(), update: () => ({ eq: () => ({ or: () => ({ select: async () => ({ data: [], error: null }) }) }) }) }) };
    getSupabaseAdminMock.mockReturnValue(stale);
    constructEvent.mockReturnValue(subscriptionEvent);
    expect((await POST(request())).status).toBe(200);
  });
});
