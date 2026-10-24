import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../supabase/testing/db";

const sql = readFileSync(join(__dirname, "..", "..", "scripts", "metrics", "yc-evidence.sql"), "utf8");

describe("YC evidence snapshot", () => {
  it("returns only aggregate counts and excludes undated lesson completions", async () => {
    const { db, user } = await createTestDb();
    try {
      const learner = await user();
      await db.query(
        "insert into public.lesson_completions (user_id, lesson_id, completed_at) values ($1, 'inv-1', null), ($1, 'inv-2', now())",
        [learner],
      );
      const { rows } = await db.query<{ metric: string; value: number }>(sql);
      const values = Object.fromEntries(rows.map((row) => [row.metric, Number(row.value)]));
      expect(values.registered_accounts).toBe(1);
      expect(values.accounts_with_any_lesson_completion).toBe(1);
      expect(values.accounts_with_dated_lesson_completion).toBe(1);
      expect(values.dated_lesson_completions).toBe(1);
      expect(values.accounts_that_started_season_challenge).toBe(0);
      expect(rows.every((row) => Object.keys(row).sort().join() === "as_of_utc,metric,value")).toBe(true);
    } finally {
      await db.close();
    }
  });
});
