import { describe, expect, it } from "vitest";
import { isProUser } from "./isPro";

// The actual server-side gate behind Pro-only routes (see
// src/app/api/challenges/complete/route.ts) — previously that route had no
// equivalent check at all, so this is worth pinning down precisely: which
// subscription statuses count as "entitled," and that a DB error fails
// CLOSED (not entitled), the opposite default from the AI-quota checks,
// since this gates a paid feature rather than a spend cap.

function fakeSupabase(row: { status: string | null } | null, error: { message: string } | null = null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: row, error }),
        }),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("isProUser", () => {
  it("is true for an active subscription", async () => {
    expect(await isProUser(fakeSupabase({ status: "active" }), "user-1")).toBe(true);
  });

  it("is true during a trial", async () => {
    expect(await isProUser(fakeSupabase({ status: "trialing" }), "user-1")).toBe(true);
  });

  it("is false for a canceled subscription", async () => {
    expect(await isProUser(fakeSupabase({ status: "canceled" }), "user-1")).toBe(false);
  });

  it("is false when no subscription row exists", async () => {
    expect(await isProUser(fakeSupabase(null), "user-1")).toBe(false);
  });

  it("fails CLOSED (not entitled) on a database error", async () => {
    expect(await isProUser(fakeSupabase(null, { message: "connection reset" }), "user-1")).toBe(false);
  });
});
