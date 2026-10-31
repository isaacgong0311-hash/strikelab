// Seeds a rehearsal cohort and season of clearly fake students into a STAGING
// or local Supabase project. Dry run by default.
//
//   node --env-file=.env.local scripts/rehearsal/seed.mjs --teacher you@example.com --host <project>.supabase.co
//   ...add --apply to write, or --reset --apply to remove the old rehearsal data first
//   node --env-file=.env.local scripts/rehearsal/seed.mjs --host <host> --clean --apply   (remove only)
//
// Safety: it refuses unless --host matches the configured project, refuses any
// host in REHEARSAL_PROTECTED_HOSTS (put production there), and only ever
// touches the rehearsal season (id "rehearsal"), class (join code RHSL42),
// and users @rehearsal.invalid. One SQL delete removes season/challenge/attempts:
//   delete from public.seasons where id = 'rehearsal';
// Use --clean --apply to remove the class and fake users too.
// Requires schema migrations through 0025 and an existing teacher account.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { buildCohortSchedule } from "../../src/lib/cohorts/template.ts";
import {
  FAKE_EMAIL_DOMAIN, REHEARSAL_JOIN_CODE, REHEARSAL_SEASON_ID, REHEARSAL_CHALLENGE_ID,
  STUDENTS, TIMEZONE, TEMPLATE_ID,
  buildRehearsalPlan, refuseReason, addDays, studentEmail,
} from "./seed-core.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = flag("apply");

const refusal = refuseReason({
  url,
  hostFlag: value("host"),
  protectedHosts: process.env.REHEARSAL_PROTECTED_HOSTS,
  nodeEnv: process.env.NODE_ENV,
});
if (refusal) fail(`Refusing to run: ${refusal}.`);
if (!key) fail("Refusing to run: SUPABASE_SERVICE_ROLE_KEY is not set.");

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());

function fail(message) {
  console.error(message);
  process.exit(1);
}
const must = (label, { error }) => {
  if (error) fail(`${label} failed: ${error.message}`);
};

async function listAllUsers() {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail(`listUsers failed: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 200) return users;
  }
}

async function clean() {
  must("remove rehearsal season", await admin.from("seasons").delete().eq("id", REHEARSAL_SEASON_ID));
  must("remove rehearsal class", await admin.from("classes").delete().eq("join_code", REHEARSAL_JOIN_CODE));
  const fakes = (await listAllUsers()).filter((u) => u.email?.endsWith(`@${FAKE_EMAIL_DOMAIN}`));
  for (const u of fakes) must(`delete ${u.email}`, await admin.auth.admin.deleteUser(u.id));
  console.log(`Removed the rehearsal season, class, and ${fakes.length} fake users.`);
}

if (flag("clean") || flag("reset")) {
  if (!apply) console.log("[dry run] would remove the rehearsal season, class, and all @" + FAKE_EMAIL_DOMAIN + " users.");
  else await clean();
  if (flag("clean")) process.exit(0);
}

const teacherEmail = value("teacher");
if (!teacherEmail) fail("Pass --teacher <email of an existing account that will own the cohort>.");

const existing = await admin.from("classes").select("id").eq("join_code", REHEARSAL_JOIN_CODE).maybeSingle();
must("check for an existing rehearsal class", existing);
const existingSeason = await admin.from("seasons").select("id").eq("id", REHEARSAL_SEASON_ID).maybeSingle();
must("check for an existing rehearsal season", existingSeason);
if ((existing.data || existingSeason.data) && apply) fail("A rehearsal cohort or season already exists. Re-run with --reset --apply to replace it.");

const teacher = (await listAllUsers()).find((u) => u.email?.toLowerCase() === teacherEmail.toLowerCase());
if (!teacher) fail(`No account with email ${teacherEmail} in this project. Sign up there first.`);

const schedule = buildCohortSchedule(addDays(today, -21));

if (!apply) {
  console.log(`[dry run] ${new URL(url).hostname}: would create the rehearsal cohort for ${teacherEmail}`);
  console.log(`  template ${TEMPLATE_ID}, starts ${addDays(today, -21)} (today is week 4), join code ${REHEARSAL_JOIN_CODE}`);
  console.log(`  season ${REHEARSAL_SEASON_ID}, challenge ${REHEARSAL_CHALLENGE_ID} (open now), ten handles and all four attempt states`);
  for (const s of STUDENTS) console.log(`  ${String(s.n).padStart(2)}. ${studentEmail(s.n)}  ${s.done.length} lessons  ${s.note}`);
  console.log("Add --apply to write.");
  process.exit(0);
}

const studentIds = [];
let firstStudentPassword;
for (const s of STUDENTS) {
  const password = randomBytes(24).toString("base64url");
  const { data, error } = await admin.auth.admin.createUser({
    email: studentEmail(s.n),
    password,
    email_confirm: true,
    user_metadata: { display_name: `Rehearsal Student ${String(s.n).padStart(2, "0")} (fake)` },
  });
  if (error) fail(`create ${studentEmail(s.n)} failed: ${error.message}`);
  studentIds.push(data.user.id);
  if (s.n === 1) firstStudentPassword = password;
}

for (const op of buildRehearsalPlan({ today, teacherId: teacher.id, studentIds, schedule })) {
  if (op.op === "update-profiles") {
    for (const row of op.rows) must("profile", await admin.from("profiles").update({ display_name: row.display_name, handle: row.handle }).eq("id", row.id));
  } else {
    must(op.table, await admin.from(op.table).insert(op.rows));
  }
  console.log(`  ${op.table}: ${op.rows.length}`);
}
console.log(`Done. Open /teach as ${teacherEmail}; join code ${REHEARSAL_JOIN_CODE}. Visit /seasons and /record as a fake student, then /admin/seasons?season=${REHEARSAL_SEASON_ID} and /admin/verify as a configured founder. Remove with --clean --apply.`);
console.log(`Fake student sign-in for /seasons and /record: ${studentEmail(1)} / ${firstStudentPassword}. This is local or staging rehearsal data only; remove it with --clean --apply.`);
