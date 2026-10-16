import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { combinedMigrations } from "../../../scripts/supabase/combine-migrations.mjs";

describe("supabase/apply-all-migrations.sql", () => {
  it("is up to date with supabase/migrations (run `npm run db:combine` if this fails)", () => {
    const onDisk = readFileSync(join(__dirname, "..", "..", "..", "supabase", "apply-all-migrations.sql"), "utf8");
    expect(onDisk).toBe(combinedMigrations());
  });

  it("can be run again on a database that already has every migration, without error or data loss", async () => {
    const t = await createTestDb();
    const owner = await t.user();
    await t.db.query("update profiles set display_name = 'Keep me' where id = $1", [owner]);
    await t.db.exec(combinedMigrations());
    await t.db.exec(combinedMigrations());
    const { rows } = await t.db.query<{ display_name: string }>("select display_name from profiles where id = $1", [owner]);
    expect(rows[0].display_name).toBe("Keep me");
  });
});
