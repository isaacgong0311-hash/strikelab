// Pure planner for the rehearsal cohort (Q16): a launched cohort in week 4
// with 10 clearly fake students in varied states, so the founder can rehearse
// the kickoff and the Monday scorecard on realistic data.
//
// Everything here returns plain row operations; seed.mjs applies them through
// the Supabase admin API and the DB test applies them to PGlite. Nothing here
// touches a database, and nothing is ever written under a real person's name.

export const FAKE_EMAIL_DOMAIN = "rehearsal.invalid";
export const REHEARSAL_JOIN_CODE = "RHSL42";
export const REHEARSAL_CLASS_NAME = "REHEARSAL: Quant Club (fake data)";
export const REHEARSAL_SEASON_ID = "rehearsal";
export const REHEARSAL_CHALLENGE_ID = "rehearsal-w1";
export const TEMPLATE_ID = "quant-foundations-v1";
export const TIMEZONE = "America/Chicago";

/** Lessons per week, in cohort order (mirrors src/lib/cohorts/template.ts). */
const WEEKS = [
  ["inv-1", "inv-2", "inv-5"],
  ["1", "2"],
  ["3"],
  ["4", "5", "6", "7"],
  ["q3"],
  ["q4"],
];
const ALL_LESSONS = WEEKS.flat();
const lessonsThroughWeek = (n) => WEEKS.slice(0, n).flat();

export function addDays(dateKey, days) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * The ten students. `done` is the lessons completed; `lastSeenDaysAgo` is the
 * last activity; `joinedDaysAgo` is relative to today; `capstone` is
 * "submitted" | "draft" | null. The story each one tells is in `note`.
 */
export const STUDENTS = [
  { n: 1, done: ALL_LESSONS.slice(0, 11), lastSeenDaysAgo: 1, joinedDaysAgo: 21, capstone: "submitted", note: "Ahead of schedule, capstone in" },
  { n: 2, done: [...lessonsThroughWeek(3), "4", "5"], lastSeenDaysAgo: 0, joinedDaysAgo: 21, capstone: "draft", note: "On track, mid week 4, capstone started" },
  { n: 3, done: lessonsThroughWeek(3), lastSeenDaysAgo: 2, joinedDaysAgo: 20, capstone: null, note: "On track, steady" },
  { n: 4, done: [...lessonsThroughWeek(1), "1"], lastSeenDaysAgo: 3, joinedDaysAgo: 19, capstone: null, note: "Behind: one lesson short of week 2" },
  { n: 5, done: ["inv-1"], lastSeenDaysAgo: 12, joinedDaysAgo: 21, capstone: null, note: "Stuck on week 1, quiet for 12 days" },
  { n: 6, done: [], lastSeenDaysAgo: null, joinedDaysAgo: 21, capstone: null, note: "Joined at kickoff, never finished a lesson" },
  { n: 7, done: [], lastSeenDaysAgo: null, joinedDaysAgo: 14, capstone: null, note: "Joined late, never started" },
  { n: 8, done: lessonsThroughWeek(1), lastSeenDaysAgo: 15, joinedDaysAgo: 21, capstone: null, note: "Did week 1, then dropped off" },
  { n: 9, done: lessonsThroughWeek(1), lastSeenDaysAgo: 1, joinedDaysAgo: 8, capstone: null, note: "Joined in week 2, caught up on week 1" },
  { n: 10, done: [], lastSeenDaysAgo: null, joinedDaysAgo: 0, capstone: null, note: "Joined today" },
];

export function studentName(n) {
  return `Rehearsal Student ${String(n).padStart(2, "0")} (fake)`;
}
export function studentEmail(n) {
  return `rehearsal-${String(n).padStart(2, "0")}@${FAKE_EMAIL_DOMAIN}`;
}
export function studentHandle(n) {
  return `rehearsal_${String(n).padStart(2, "0")}`;
}

/** One open challenge, all four attempt states, and a scored chapter board. */
export function buildRehearsalSeasonPlan({ today, studentIds, now = new Date() }) {
  if (studentIds.length !== STUDENTS.length) throw new Error(`need ${STUDENTS.length} student ids`);
  const started = new Date(now.getTime() - 20 * 60_000).toISOString();
  const deadline = new Date(now.getTime() + 40 * 60_000).toISOString();
  const submitted = new Date(now.getTime() - 10 * 60_000).toISOString();
  const statuses = ["scored", "scored", "scored", "submitted", "submitted", "submitted", "pending_review", "pending_review", "started", "started"];
  const scores = [82.5, 69, 55];
  const code = "from math import exp\ndef put_from_parity(call, S, K, T, r):\n    return call - S + K * exp(-r * T)\n";
  return [
    {
      op: "insert", table: "seasons", rows: [{
        id: REHEARSAL_SEASON_ID,
        title: "REHEARSAL: Season (fake data)",
        starts_on: addDays(today, -1), ends_on: addDays(today, 3),
      }],
    },
    {
      op: "insert", table: "season_challenges", rows: [{
        id: REHEARSAL_CHALLENGE_ID, season_id: REHEARSAL_SEASON_ID,
        week: 1, template_slug: "put-call-parity",
        opens_at: new Date(now.getTime() - 60 * 60_000).toISOString(),
        closes_at: new Date(now.getTime() + 2 * 24 * 60 * 60_000).toISOString(),
        time_limit_minutes: 60,
      }],
    },
    {
      op: "insert", table: "season_attempts", rows: studentIds.map((user_id, index) => ({
        user_id,
        challenge_id: REHEARSAL_CHALLENGE_ID,
        started_at: started,
        deadline,
        submitted_at: statuses[index] === "started" ? null : submitted,
        code: statuses[index] === "started" ? null : code,
        explanation: statuses[index] === "started" ? null : "Parity rules out a free-money trade between matching calls, puts, stock, and cash. Rehearsal data only.",
        preview_passed: statuses[index] === "started" ? null : true,
        official_score: statuses[index] === "scored" ? scores[index] : null,
        status: statuses[index],
      })),
    },
  ];
}

/**
 * @param {object} p
 * @param {string} p.today        YYYY-MM-DD in the cohort's timezone
 * @param {string} p.teacherId
 * @param {string[]} p.studentIds ten ids, in STUDENTS order
 * @param {{lessonId:string,weekNumber:number,position:number,dueOn:string}[]} p.schedule
 * @param {string} [p.classId]
 * @param {Date} [p.now]          timestamps are clamped to an hour before this
 * @returns {{op:"insert",table:string,rows:object[]}[]} in dependency order
 */
export function buildRehearsalPlan({ today, teacherId, studentIds, schedule, classId = "00000000-0000-4000-8000-000000000042", now = new Date() }) {
  if (studentIds.length !== STUDENTS.length) throw new Error(`need ${STUDENTS.length} student ids`);
  // A timestamp on a given day, but never in the future.
  const latest = now.getTime() - 60 * 60 * 1000;
  const at = (dateKey, hour = 16) =>
    new Date(Math.min(Date.parse(`${dateKey}T${String(hour).padStart(2, "0")}:00:00.000Z`), latest)).toISOString();
  const startsOn = addDays(today, -21); // today falls in week 4
  const ops = [];

  ops.push({
    op: "insert",
    table: "classes",
    rows: [
      {
        id: classId,
        teacher_id: teacherId,
        name: REHEARSAL_CLASS_NAME,
        join_code: REHEARSAL_JOIN_CODE,
        template_id: TEMPLATE_ID,
        starts_on: startsOn,
        timezone: TIMEZONE,
        launched_at: at(startsOn, 15),
      },
    ],
  });
  ops.push({
    op: "insert",
    table: "assignments",
    rows: schedule.map((r) => ({
      class_id: classId,
      lesson_id: r.lessonId,
      week_number: r.weekNumber,
      position: r.position,
      due_on: r.dueOn,
    })),
  });

  const members = [];
  const completions = [];
  const progress = [];
  const submissions = [];
  const capstones = [];

  STUDENTS.forEach((s, i) => {
    const id = studentIds[i];
    const joined = addDays(today, -s.joinedDaysAgo);
    members.push({ class_id: classId, student_id: id, joined_at: at(joined, 15) });

    // Spread this student's completions between joining and last activity so
    // the weekly activity chart has some shape.
    const last = s.lastSeenDaysAgo === null ? null : addDays(today, -s.lastSeenDaysAgo);
    s.done.forEach((lessonId, k) => {
      const spanDays = Math.max(0, s.joinedDaysAgo - (s.lastSeenDaysAgo ?? 0));
      const offset = s.done.length > 1 ? Math.round((spanDays * k) / (s.done.length - 1)) : spanDays;
      const day = last ? addDays(joined, Math.min(offset, spanDays)) : joined;
      completions.push({ user_id: id, lesson_id: lessonId, completed_at: at(day, 17) });
    });

    progress.push({
      user_id: id,
      completed: s.done,
      last_activity_date: last,
    });

    if (s.done.includes("3")) {
      submissions.push({
        user_id: id,
        lesson_id: "3",
        code: "# fake rehearsal submission\ndef black_scholes_call(S, K, T, r, sigma):\n    ...\n",
        updated_at: at(last ?? joined, 18),
        last_passed_at: at(last ?? joined, 18),
      });
    }
    if (s.capstone) {
      capstones.push({
        user_id: id,
        class_id: classId,
        prompt_id: "backtest",
        title: "Example: moving-average crossover (fake)",
        thesis: "Example text for rehearsal only.",
        code: "print('example')",
        result_summary: "Example result.",
        reflection: "Example reflection.",
        status: s.capstone,
        submitted_at: s.capstone === "submitted" ? at(last ?? today, 19) : null,
      });
    }
  });

  // Students need a display name on their profile for the scorecard.
  ops.push({
    op: "update-profiles",
    table: "profiles",
    rows: studentIds.map((id, i) => ({ id, display_name: studentName(STUDENTS[i].n), handle: studentHandle(STUDENTS[i].n) })),
  });
  ops.push({ op: "insert", table: "class_members", rows: members });
  // Completions first with real dates; the progress trigger then skips them.
  ops.push({ op: "insert", table: "lesson_completions", rows: completions });
  ops.push({ op: "insert", table: "progress", rows: progress });
  if (submissions.length) ops.push({ op: "insert", table: "lesson_submissions", rows: submissions });
  if (capstones.length) ops.push({ op: "insert", table: "capstone_submissions", rows: capstones });
  ops.push(...buildRehearsalSeasonPlan({ today, studentIds, now }));
  return ops;
}

/**
 * Returns a reason string if applying the seed to `url` should be refused,
 * else null. The seed is only for a staging or local project: the caller must
 * name the host explicitly, and a host listed in REHEARSAL_PROTECTED_HOSTS
 * (put your production host there) is always refused.
 * @param {{url?: string, hostFlag?: string, protectedHosts?: string, nodeEnv?: string}} p
 * @returns {string | null}
 */
export function refuseReason({ url, hostFlag = "", protectedHosts = "", nodeEnv = "" }) {
  if (!url) return "NEXT_PUBLIC_SUPABASE_URL is not set";
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL is not a valid URL";
  }
  if (nodeEnv === "production") return "NODE_ENV is production";
  if (!hostFlag) return `pass --host ${host} to confirm which project this writes to`;
  if (hostFlag !== host) return `--host ${hostFlag} does not match the configured project ${host}`;
  const protectedList = protectedHosts.split(",").map((h) => h.trim()).filter(Boolean);
  if (protectedList.includes(host)) return `${host} is listed in REHEARSAL_PROTECTED_HOSTS`;
  return null;
}
