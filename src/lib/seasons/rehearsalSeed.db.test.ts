import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";

const SQL = readFileSync(join(__dirname, "..", "..", "..", "supabase", "seed", "season-rehearsal.sql"), "utf8");

describe("supabase/seed/season-rehearsal.sql", () => {
  it("opens all three challenges now, is marked rehearsal, can run twice, and never reaches a record", async () => {
    const t = await createTestDb();
    await t.db.exec(SQL);
    await t.db.exec(SQL);
    const season = (await t.db.query<{ is_rehearsal: boolean }>("select is_rehearsal from seasons where id = 'rehearsal-2026'")).rows[0];
    expect(season.is_rehearsal).toBe(true);

    const u = await t.user();
    await t.db.query("update profiles set handle = 'tester' where id = $1", [u]);
    for (const week of [1, 2, 3]) {
      await t.as(u, (tx) => tx.query(`select * from start_attempt('rehearsal-2026-w${week}')`)); // open right now
    }
    await t.db.query("update season_attempts set status = 'scored', official_score = 80 where user_id = $1", [u]);
    const board = await t.as(u, async (tx) => (await tx.query("select * from season_leaderboard('rehearsal-2026')")).rows);
    expect(board).toHaveLength(1); // the rehearsal board works
    const record = await t.as(u, async (tx) => (await tx.query<{ r: { seasons: unknown[] } }>("select my_record() as r")).rows[0].r);
    expect(record.seasons).toEqual([]); // but it never counts on a record
  });
});
