import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkEnv, describeAuth, expectedTables, keyRole, missingTables } from "../../../scripts/supabase/check-core.mjs";
import { createTestDb } from "../../../supabase/testing/db";

const jwt = (role: string) => `h.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.s`;
const GOOD = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("anon"),
  SUPABASE_SERVICE_ROLE_KEY: jwt("service_role"),
};
const failures = (env: Record<string, string | undefined>) => checkEnv(env).filter((r) => r.level === "fail").map((r) => r.message);

describe("keyRole", () => {
  it("reads the role from a JWT key and from the newer prefixed keys", () => {
    expect(keyRole(jwt("anon"))).toBe("anon");
    expect(keyRole(jwt("service_role"))).toBe("service_role");
    expect(keyRole("sb_publishable_abc")).toBe("anon");
    expect(keyRole("sb_secret_abc")).toBe("service_role");
  });

  it("returns null for anything else", () => {
    for (const bad of ["", "nope", "a.b", "a.%%%.c", undefined]) expect(keyRole(bad as string)).toBeNull();
  });
});

describe("checkEnv", () => {
  it("passes a correct set", () => {
    expect(failures(GOOD)).toEqual([]);
  });

  it("names every missing variable", () => {
    expect(failures({})).toHaveLength(3);
  });

  it("catches the two mix-ups that matter: swapped keys, and a service-role key in the browser var", () => {
    const swapped = failures({ ...GOOD, NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("service_role"), SUPABASE_SERVICE_ROLE_KEY: jwt("anon") });
    expect(swapped.join("\n")).toMatch(/SERVICE-ROLE key.*every browser/);
    expect(swapped.join("\n")).toMatch(/SUPABASE_SERVICE_ROLE_KEY is not a service-role key/);
  });

  it("rejects a URL that is http, has a path, or isn't a URL; allows localhost for the local stack", () => {
    expect(failures({ ...GOOD, NEXT_PUBLIC_SUPABASE_URL: "http://abcdefgh.supabase.co" })[0]).toMatch(/https/);
    expect(failures({ ...GOOD, NEXT_PUBLIC_SUPABASE_URL: "https://abcdefgh.supabase.co/rest/v1" })[0]).toMatch(/no path/);
    expect(failures({ ...GOOD, NEXT_PUBLIC_SUPABASE_URL: "abcdefgh" })[0]).toMatch(/not a URL/);
    expect(failures({ ...GOOD, NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321" })).toEqual([]);
  });

  it("never echoes a key", () => {
    const text = JSON.stringify(checkEnv({ ...GOOD, SUPABASE_SERVICE_ROLE_KEY: "super-secret-value" }));
    expect(text).not.toContain("super-secret-value");
  });
});

describe("tables", () => {
  const dir = join(__dirname, "..", "..", "..", "supabase", "migrations");
  const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => readFileSync(join(dir, f), "utf8"));

  it("finds exactly the tables the migrations really create", async () => {
    const { db } = await createTestDb();
    const { rows } = await db.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name",
    );
    expect(expectedTables(sql)).toEqual(rows.map((r) => r.table_name));
  });

  it("reports which expected tables a project lacks", () => {
    const openapi = { definitions: { profiles: {}, progress: {} } };
    expect(missingTables(openapi, ["profiles", "progress", "subscriptions"])).toEqual(["subscriptions"]);
    expect(missingTables(null, ["profiles"])).toEqual(["profiles"]);
  });

  it("ignores tables that only appear in comments", () => {
    expect(expectedTables(["-- create table public.ghost (id int);\ncreate table if not exists public.real (id int);"])).toEqual(["real"]);
  });
});

describe("describeAuth", () => {
  const states = (settings: object) => describeAuth(settings).map((l) => `${l.level}:${l.message}`).join("\n");

  it("flags disabled sign-ups and a disabled email provider as failures", () => {
    expect(states({ disable_signup: true, external: { email: false } })).toMatch(/fail:New sign-ups are disabled[\s\S]*fail:The email provider is off/);
  });

  it("explains email confirmation and Google either way", () => {
    expect(states({ mailer_autoconfirm: false, external: { email: true, google: true } })).toMatch(/Email confirmation is on[\s\S]*Google sign-in is on/);
    expect(states({ mailer_autoconfirm: true, external: { email: true } })).toMatch(/confirmation is OFF[\s\S]*Google sign-in is off/);
  });
});
