/**
 * Runs the real migrations in PGlite (in-process Postgres) with a minimal
 * stand-in for Supabase's auth schema and roles, so migration SQL, triggers
 * and RLS policies can be tested without a hosted project.
 *
 * `as(userId, fn)` runs `fn` as the `authenticated` role with auth.uid()
 * returning `userId`, which is how RLS sees a signed-in browser client.
 */
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

const SUPABASE_STUBS = `
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create role anon;
create role authenticated;
create role service_role bypassrls;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export interface TestDb {
  db: PGlite;
  /** Create an auth user and return its id. */
  user(): Promise<string>;
  /** Run `fn` as a signed-in user (role `authenticated`, auth.uid() = userId). */
  as<T>(userId: string, fn: (tx: Transaction) => Promise<T>): Promise<T>;
}

export async function createTestDb(options: { upTo?: string } = {}): Promise<TestDb> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (options.upTo && file > options.upTo) break;
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }

  return {
    db,
    async user() {
      const { rows } = await db.query<{ id: string }>("insert into auth.users (id) values (gen_random_uuid()) returning id");
      return rows[0].id;
    },
    async as(userId, fn) {
      return db.transaction(async (tx) => {
        await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
        await tx.exec("set local role authenticated");
        return fn(tx);
      });
    },
  };
}

/** Apply one migration file to an existing test database. */
export async function applyMigration(db: PGlite, file: string): Promise<void> {
  await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
}
