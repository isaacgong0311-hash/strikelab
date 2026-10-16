import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { getTemplate } from "./templates";

const SQL = readFileSync(join(__dirname, "..", "..", "..", "supabase", "seed", "season-1.sql"), "utf8");

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
