import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { getTemplate } from "./templates";

const SQL = readFileSync(join(__dirname, "..", "..", "..", "supabase", "seed", "season-1.sql"), "utf8");
const CHECK = readFileSync(join(__dirname, "..", "..", "..", "scripts", "metrics", "season-1-check.sql"), "utf8");

describe("supabase/seed/season-1.sql", () => {
  it("schedules three weekly challenges inside the season, each with real content, and can run twice", async () => {
    const t = await createTestDb();
    await t.db.exec(SQL);
    await t.db.exec(SQL);
    const { rows } = await t.db.query<{ id: string; week: number; template_slug: string; opens: string; closes: string }>(
      `select id, week, template_slug,
              to_char(opens_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as opens,
              to_char(closes_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as closes
       from season_challenges where season_id = 's1-2026' order by week`
    );
    expect(rows.map((r) => [r.week, r.opens, r.closes])).toEqual([
      [1, "2026-11-30 00:00", "2026-12-06 23:59"],
      [2, "2026-12-07 00:00", "2026-12-13 23:59"],
      [3, "2026-12-14 00:00", "2026-12-20 23:59"],
    ]);
    for (const r of rows) expect(getTemplate(r.template_slug), r.template_slug).not.toBeNull();
  });
});

describe("scripts/metrics/season-1-check.sql", () => {
  type Row = { challenge: string; week: number; opens_at_eastern: string | null; closes_at_eastern: string | null; state: string };

  it("says MISSING before the seed, ok after it, and WRONG when a row drifts", async () => {
    const t = await createTestDb();
    const before = (await t.db.query<Row>(CHECK)).rows;
    expect(before.map((r) => [r.challenge, r.state])).toEqual([
      ["s1-2026-w1", "MISSING: no season row s1-2026"],
      ["s1-2026-w2", "MISSING: no season row s1-2026"],
      ["s1-2026-w3", "MISSING: no season row s1-2026"],
    ]);

    await t.db.exec(SQL);
    await t.db.query("delete from season_challenges where id = 's1-2026-w3'");
    expect((await t.db.query<Row>(CHECK)).rows.map((r) => r.state)).toEqual(["ok", "ok", "MISSING"]);

    await t.db.exec(SQL);
    const after = (await t.db.query<Row>(CHECK)).rows;
    expect(after.map((r) => [r.week, r.opens_at_eastern, r.closes_at_eastern, r.state])).toEqual([
      [1, "2026-11-30 00:00", "2026-12-06 23:59", "ok"],
      [2, "2026-12-07 00:00", "2026-12-13 23:59", "ok"],
      [3, "2026-12-14 00:00", "2026-12-20 23:59", "ok"],
    ]);

    await t.db.query("update season_challenges set closes_at = closes_at + interval '1 day' where id = 's1-2026-w3'");
    expect((await t.db.query<Row>(CHECK)).rows[2].state).toBe("WRONG: differs from the seed");
  });
});
