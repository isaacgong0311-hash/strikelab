import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";

/** my_invite_count (0026) against the real schema with RLS on. */
describe("my_invite_count (0026)", () => {
  it("counts sign-ups tagged with the caller's handle, and nothing else", async () => {
    const t = await createTestDb();
    const inviter = await t.user();
    const friendA = await t.user();
    const friendB = await t.user();
    const stranger = await t.user();
    await t.db.query("update profiles set handle = 'quant_kid' where id = $1", [inviter]);
    await t.db.query("update profiles set signup_source = 'friend-quant_kid' where id = any($1)", [[friendA, friendB]]);
    await t.db.query("update profiles set signup_source = 'friend-someone_else' where id = $1", [stranger]);

    const count = (user: string) =>
      t.as(user, async (tx) => (await tx.query<{ n: number }>("select my_invite_count() as n")).rows[0].n);

    expect(await count(inviter)).toBe(2);
    // No handle yet: nothing to count.
    expect(await count(stranger)).toBe(0);
  });

  it("doesn't count the inviter's own account", async () => {
    const t = await createTestDb();
    const me = await t.user();
    await t.db.query("update profiles set handle = 'loop', signup_source = 'friend-loop' where id = $1", [me]);
    const n = await t.as(me, async (tx) => (await tx.query<{ n: number }>("select my_invite_count() as n")).rows[0].n);
    expect(n).toBe(0);
  });
});
