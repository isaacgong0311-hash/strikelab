// Is the Supabase project wired up? Run after following SUPABASE_SETUP.md:
//
//   node scripts/supabase/check.mjs            (reads .env.local if present)
//
// It reads the three Supabase env vars and, without printing any key, checks
// that they are the right kind of key, that the project answers, how auth is
// configured, and that every table the migrations create exists. Exits 1 if
// anything that would break the app fails.
//
// It cannot tell you that Row Level Security is correct (the unit tests replay
// the migrations and check that), or that the auth redirect URLs are right (send
// yourself a sign-up email and follow the link).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkEnv, describeAuth, expectedTables, missingTables } from "./check-core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
for (const file of [".env.local", ".env"]) {
  if (existsSync(join(root, file))) {
    try { process.loadEnvFile(join(root, file)); } catch { /* an unreadable env file is reported by the checks below */ }
  }
}

let failed = 0;
const show = ({ level, message }) => {
  if (level === "fail") failed += 1;
  console.log(`${level === "fail" ? "✗" : "✓"} ${message}`);
};

const env = checkEnv(process.env);
env.forEach(show);
if (env.some((r) => r.level === "fail")) {
  console.log("\nFix the variables above first (see SUPABASE_SETUP.md, steps 3 and 4).");
  process.exit(1);
}

const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function get(path, key) {
  const res = await fetch(`${base}${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15_000) });
  return { status: res.status, body: await res.json().catch(() => null) };
}

try {
  const auth = await get("/auth/v1/settings", anon);
  if (auth.status !== 200 || !auth.body) {
    show({ level: "fail", message: `Auth did not answer (HTTP ${auth.status}). Is the project paused, or the URL or anon key from another project?` });
  } else {
    describeAuth(auth.body).forEach(show);
  }

  const rest = await get("/rest/v1/", service);
  if (rest.status !== 200 || !rest.body) {
    show({ level: "fail", message: `The database API did not answer (HTTP ${rest.status}). Check the service-role key belongs to this project.` });
  } else {
    const dir = join(root, "supabase", "migrations");
    const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => readFileSync(join(dir, f), "utf8"));
    const expected = expectedTables(sql);
    const missing = missingTables(rest.body, expected);
    if (missing.length) {
      show({ level: "fail", message: `${missing.length} of ${expected.length} tables ${missing.length === 1 ? "is" : "are"} missing (${missing.join(", ")}). Apply the migrations: npx supabase db push, then run scripts/metrics/check-migrations.sql in the SQL editor to see which one didn't run.` });
    } else {
      show({ level: "ok", message: `All ${expected.length} tables from supabase/migrations/ exist` });
    }
  }
} catch (error) {
  show({ level: "fail", message: `Could not reach ${base}: ${error instanceof Error ? error.message : String(error)}` });
}

console.log(failed ? `\n${failed} problem${failed === 1 ? "" : "s"} found.` : "\nSupabase looks wired up. Next: sign up in the app and follow the confirmation email.");
process.exit(failed ? 1 : 0);
