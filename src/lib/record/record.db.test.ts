import { describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../../../supabase/testing/db";

/** The record page (0025) against the real schema with RLS on. */
async function setup(t: TestDb) {
  await t.db.query("insert into seasons (id, title, starts_on, ends_on) values ('s1', 'Season 1', current_date, current_date + 21)");
  await t.db.query(
    `insert into season_challenges (id, season_id, week, template_slug, opens_at, closes_at, time_limit_minutes)
     values ('s1-w1', 's1', 1, 'put-call-parity', now() - interval '1 hour', now() + interval '1 hour', 30)`
  );
}

describe("record (0025)", () => {
  it("shows nothing for a student with no attempts and no capstone", async () => {
    const t = await createTestDb();
    await setup(t);
    const u = await t.user();
    await t.db.query("update profiles set handle = 'quant_kid' where id = $1", [u]);
    const rows = await t.as(u, async (tx) => (await tx.query("select * from my_record()")).rows);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ handle: "quant_kid", season_id: null, capstone_submitted: false });
  });

  it("totals a scored season and ranks against the public leaderboard", async () => {
    const t = await createTestDb();
    await setup(t);
    const [a, b] = [await t.user(), await t.user()];
    await t.db.query("update profiles set handle = 'alpha' where id = $1", [a]);
    await t.db.query("update profiles set handle = 'bravo' where id = $1", [b]);
    await t.as(a, (tx) => tx.query("select start_attempt('s1-w1')"));
    await t.as(b, (tx) => tx.query("select start_attempt('s1-w1')"));
    await t.db.query("update season_attempts set status = 'scored', official_score = 80 where user_id = $1", [a]);
    await t.db.query("update season_attempts set status = 'scored', official_score = 95 where user_id = $1", [b]);

    const row = await t.as(a, async (tx) => (await tx.query("select * from my_record()")).rows[0]);
    expect(row).toMatchObject({ season_id: "s1", solved: 1, total_score: "80", rank: 2 });
  });

  it("keeps the record private until the student shares it, and the old link stops working once they stop", async () => {
    const t = await createTestDb();
    await setup(t);
    const [u, other] = [await t.user(), await t.user()];
    await t.db.query("update profiles set handle = 'quant_kid' where id = $1", [u]);

    // Nobody else can read the token, and a direct update can't set one.
    const seenByOther = await t.as(other, async (tx) => (await tx.query("select record_share_token from profiles where id = $1", [u])).rows);
    expect(seenByOther).toHaveLength(0);
    await t.as(u, (tx) => tx.query("update profiles set record_share_token = gen_random_uuid() where id = $1", [u]));
    const stillNull = await t.as(u, async (tx) =>
      (await tx.query<{ record_share_token: string | null }>("select record_share_token from profiles where id = $1", [u])).rows[0].record_share_token
    );
    expect(stillNull).toBeNull();

    const token = await t.as(u, async (tx) => (await tx.query<{ set_record_sharing: string }>("select set_record_sharing(true)")).rows[0].set_record_sharing);
    expect(token).toBeTruthy();

    const shared = await t.as(other, async (tx) => (await tx.query("select * from get_shared_record($1)", [token])).rows);
    expect(shared).toHaveLength(1);
    expect(shared[0]).toMatchObject({ handle: "quant_kid" });

    await t.as(u, (tx) => tx.query("select set_record_sharing(false)"));
    const afterOff = await t.as(other, async (tx) => (await tx.query("select * from get_shared_record($1)", [token])).rows);
    expect(afterOff).toHaveLength(0);
  });

  it("returns nothing for an unknown token", async () => {
    const t = await createTestDb();
    const rows = await t.db.query("select * from get_shared_record(gen_random_uuid())");
    expect(rows.rows).toHaveLength(0);
  });

  it("shows a submitted capstone as submitted, never verified", async () => {
    const t = await createTestDb();
    await setup(t);
    const u = await t.user();
    await t.db.query("update profiles set handle = 'quant_kid' where id = $1", [u]);
    const klass = await t.as(u, async (tx) =>
      (await tx.query<{ id: string }>("insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABCD23') returning id", [u])).rows[0].id
    );
    await t.db.query("insert into class_members (class_id, student_id) values ($1, $2)", [klass, u]);
    await t.as(u, (tx) =>
      tx.query(
        "insert into capstone_submissions (user_id, class_id, prompt_id, status) values ($1, $2, 'open', 'submitted')",
        [u, klass]
      )
    );
    const row = await t.as(u, async (tx) =>
      (await tx.query<{ capstone_submitted: boolean; capstone_submitted_at: string | null }>("select * from my_record()")).rows[0]
    );
    expect(row.capstone_submitted).toBe(true);
    expect(row.capstone_submitted_at).not.toBeNull();
  });
});
