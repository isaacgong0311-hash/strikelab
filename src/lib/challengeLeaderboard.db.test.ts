import { describe, expect, it } from "vitest";
import { applyMigration, createTestDb } from "../../supabase/testing/db";

type Row = { rank: number; elapsed_seconds: number; xp: number; is_you: boolean };

async function seed() {
  const t = await createTestDb();
  const users: string[] = [];
  for (let i = 0; i < 4; i++) users.push(await t.user());
  // Slowest to fastest: users[3] is rank 1, users[0] is rank 4.
  for (const [i, id] of users.entries()) {
    await t.db.query(
      "insert into challenge_completions (user_id, challenge_id, display_name, elapsed_seconds, xp) values ($1, 'wk-1', $2, $3, 50)",
      [id, `Student ${i}`, 400 - i * 100]
    );
  }
  return { t, users };
}

describe("challenge leaderboard privacy (0022)", () => {
  it("lets a student read only their own completions", async () => {
    const { t, users } = await seed();
    const seen = await t.as(users[0], async (tx) => (await tx.query<{ user_id: string }>("select user_id from challenge_completions")).rows);
    expect(seen.map((r) => r.user_id)).toEqual([users[0]]);
  });

  it("gives signed-out visitors nothing from the table", async () => {
    const { t } = await seed();
    const rows = await t.db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      return (await tx.query("select * from challenge_completions")).rows;
    });
    expect(rows).toEqual([]);
  });

  it("returns the top N plus the caller's own row, with no names or ids", async () => {
    const { t, users } = await seed();
    const rows = await t.as(users[0], async (tx) => (await tx.query<Row>("select * from challenge_leaderboard('wk-1', 2)")).rows);
    expect(rows).toEqual([
      { rank: 1, elapsed_seconds: 100, xp: 50, is_you: false },
      { rank: 2, elapsed_seconds: 200, xp: 50, is_you: false },
      { rank: 4, elapsed_seconds: 400, xp: 50, is_you: true },
    ]);
    expect(Object.keys(rows[0]).sort()).toEqual(["elapsed_seconds", "is_you", "rank", "xp"]);
  });

  it("works for signed-out visitors, with no row marked as theirs", async () => {
    const { t } = await seed();
    const rows = await t.db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      return (await tx.query<Row>("select * from challenge_leaderboard('wk-1', 10)")).rows;
    });
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
    expect(rows.some((r) => r.is_you)).toBe(false);
  });

  it("clears the names 0003 copied in when it's applied", async () => {
    const t = await createTestDb({ upTo: "0021_rate_limits.sql" });
    const id = await t.user();
    await t.db.query(
      "insert into challenge_completions (user_id, challenge_id, display_name, elapsed_seconds, xp) values ($1, 'wk-1', 'Jane Student', 90, 50)",
      [id]
    );
    await applyMigration(t.db, "0022_private_challenge_leaderboard.sql");
    const { rows } = await t.db.query<{ display_name: string | null }>("select display_name from challenge_completions");
    expect(rows).toEqual([{ display_name: null }]);
  });
});
