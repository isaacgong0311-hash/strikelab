import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OPERATIONAL_TABLES, STORED_DATA } from "./dataMap";

const MIGRATIONS = join(__dirname, "..", "..", "..", "supabase", "migrations");

function migrationTables(): string[] {
  const tables = new Set<string>();
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql"))) {
    const sql = readFileSync(join(MIGRATIONS, file), "utf8");
    for (const m of sql.matchAll(/create table (?:if not exists )?public\.([a-z_]+)/gi)) tables.add(m[1].toLowerCase());
  }
  return [...tables].sort();
}

describe("/trust data map", () => {
  it("accounts for every table the migrations create, so a new table can't go unlisted", () => {
    const listed = new Set([...STORED_DATA.flatMap((d) => d.tables), ...Object.keys(OPERATIONAL_TABLES)]);
    expect(migrationTables().filter((t) => !listed.has(t))).toEqual([]);
  });

  it("only names tables that exist", () => {
    const real = new Set(migrationTables());
    const named = [...STORED_DATA.flatMap((d) => d.tables), ...Object.keys(OPERATIONAL_TABLES)];
    expect(named.filter((t) => !real.has(t))).toEqual([]);
  });
});
