import { describe, expect, it } from "vitest";
import { createTestDb } from "../../supabase/testing/db";

describe("consume_rate_limit", () => {
  it("allows up to the limit per user per bucket, then refuses until the window passes", async () => {
    const t = await createTestDb();
    const [a, b] = [await t.user(), await t.user()];
    const hit = (who: string, bucket = "class-join", limit = 3) =>
      t.as(who, async (tx) => (await tx.query<{ ok: boolean }>("select consume_rate_limit($1, $2, 600) as ok", [bucket, limit])).rows[0].ok);

    expect([await hit(a), await hit(a), await hit(a), await hit(a)]).toEqual([true, true, true, false]);
    // Separate users and buckets don't share a count.
    expect(await hit(b)).toBe(true);
    expect(await hit(a, "capstone-share")).toBe(true);

    // Age the window: the next request starts a fresh one.
    await t.db.query("update rate_limits set window_start = now() - interval '11 minutes' where user_id = $1 and bucket = 'class-join'", [a]);
    expect(await hit(a)).toBe(true);
  });

  it("can't be read or reset by users directly", async () => {
    const t = await createTestDb();
    const a = await t.user();
    await t.as(a, (tx) => tx.query("select consume_rate_limit('class-join', 1, 600)"));
    expect(await t.as(a, async (tx) => (await tx.query("select 1 from rate_limits")).rows.length)).toBe(0);
    const deleted = await t.as(a, async (tx) => (await tx.query("delete from rate_limits returning 1")).rows.length);
    expect(deleted).toBe(0);
  });
});
