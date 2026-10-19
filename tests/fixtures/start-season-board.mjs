// Local-only seeded Supabase HTTP stand-in for the chapter board browser test.
// PGlite tests cover the real SQL/RLS; this exercises the Next pages, auth
// cookie handling, and class selector without touching a hosted database.
import { createServer } from "node:http";
import { spawn } from "node:child_process";

const apiPort = 54399;
const appPort = 3113;
const studentId = "11111111-1111-4111-8111-111111111111";
const teacherId = "22222222-2222-4222-8222-222222222222";
const adminFixture = Boolean(process.env.SEASON_ADMIN_E2E);
const statusFixture = Boolean(process.env.SEASON_STATUS_E2E || adminFixture);
const firstClub = { id: "33333333-3333-4333-8333-333333333333", name: "Options Club" };
const secondClub = { id: "44444444-4444-4444-8444-444444444444", name: "Quant Club" };
const isoDay = (offset) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const isoTime = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();
const season = { id: "s1", title: "Season 1", starts_on: isoDay(-7), ends_on: isoDay(30) };
const challenge = (week, opens, closes) => ({
  id: `s1-w${week}`, season_id: "s1", week, template_slug: "put-call-parity",
  opens_at: isoTime(opens), closes_at: isoTime(closes), time_limit_minutes: 60,
});
const statusChallenges = [
  challenge(1, 2_880, 4_320), // upcoming
  challenge(2, -1_440, 2_880), // open
  challenge(3, -1_440, 2_880), // started
  challenge(4, -1_440, 2_880), // submitted
  challenge(5, -1_440, 2_880), // scored
  challenge(6, -1_440, 2_880), // pending review
  challenge(7, -4_320, -1_440), // closed
  challenge(8, -1_440, 2_880), // expired attempt
];
const statusAttempts = [
  { challenge_id: "s1-w3", status: "started", deadline: isoTime(20), official_score: null },
  { challenge_id: "s1-w4", status: "submitted", deadline: isoTime(-20), official_score: null },
  { challenge_id: "s1-w5", status: "scored", deadline: isoTime(-20), official_score: 88 },
  { challenge_id: "s1-w6", status: "pending_review", deadline: isoTime(-20), official_score: null },
  { challenge_id: "s1-w8", status: "started", deadline: isoTime(-1), official_score: null },
];

function json(response, status, value, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, prefer, accept-profile",
    "access-control-allow-methods": "GET, HEAD, POST, OPTIONS",
    ...extraHeaders,
  });
  response.end(response.req.method === "HEAD" ? undefined : JSON.stringify(value));
}

const service = createServer(async (request, response) => {
  if (request.method === "OPTIONS") return json(response, 200, {});
  const url = new URL(request.url, `http://127.0.0.1:${apiPort}`);
  const token = (request.headers.authorization ?? "").replace(/^Bearer /i, "");
  const userId = token === "student-token" ? studentId : token === "teacher-token" ? teacherId : null;
  if (url.pathname === "/auth/v1/user") {
    return userId
      ? json(response, 200, { id: userId, aud: "authenticated", role: "authenticated", email: `${token}@example.test`, app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" })
      : json(response, 401, { message: "No session" });
  }

  let value;
  switch (url.pathname) {
    case "/rest/v1/seasons": value = [season]; break;
    case "/rest/v1/season_challenges": value = statusFixture ? statusChallenges : []; break;
    case "/rest/v1/season_attempts": {
      if (adminFixture && token === "fixture-service-role-key") {
        value = statusAttempts.map((row) => ({
          ...row, user_id: studentId, submitted_at: isoTime(-15),
          code: "print('Example review')", explanation: "Example reasoning for this submission.",
        }));
        const challengeFilter = url.searchParams.get("challenge_id");
        if (challengeFilter?.startsWith("eq.")) value = value.filter((row) => row.challenge_id === challengeFilter.slice(3));
        if (challengeFilter?.startsWith("in.")) value = value.filter((row) => challengeFilter.slice(4).includes(row.challenge_id));
        const statusFilter = url.searchParams.get("status");
        if (statusFilter?.startsWith("eq.")) value = value.filter((row) => row.status === statusFilter.slice(3));
        const userFilter = url.searchParams.get("user_id");
        if (userFilter?.startsWith("eq.")) value = value.filter((row) => row.user_id === userFilter.slice(3));
      } else value = statusFixture && userId === studentId ? statusAttempts : [];
      break;
    }
    case "/rest/v1/profiles": value = token === "fixture-service-role-key" ? [{ id: studentId, handle: "student_one", display_name: "Example Student" }] : userId === studentId ? [{ handle: "student_one" }] : []; break;
    case "/rest/v1/class_members": value = token === "fixture-service-role-key" ? [{ student_id: studentId }] : userId === studentId ? [{ class_id: firstClub.id }, { class_id: secondClub.id }] : []; break;
    case "/rest/v1/classes": value = userId === studentId ? [firstClub, secondClub] : userId === teacherId ? [firstClub] : []; break;
    case "/rest/v1/progress": value = []; break;
    case "/rest/v1/assignments": value = []; break;
    case "/rest/v1/rpc/season_leaderboard": {
      let body = "";
      for await (const chunk of request) body += chunk;
      const clubId = JSON.parse(body).p_class_id;
      value = clubId === firstClub.id
        ? [{ rank: 1, handle: "student_one", total_score: 90, solved: 1, is_you: userId === studentId }]
        : clubId === secondClub.id
          ? [{ rank: 1, handle: "quant_friend", total_score: 75, solved: 1, is_you: false }]
          : [{ rank: 1, handle: "student_one", total_score: 90, solved: 1, is_you: userId === studentId }, { rank: 2, handle: "quant_friend", total_score: 75, solved: 1, is_you: false }];
      break;
    }
    default: return json(response, 404, { message: `Unseeded route: ${url.pathname}` });
  }
  const singular = request.headers.accept?.includes("application/vnd.pgrst.object+json");
  const countHeader = request.headers.prefer?.includes("count=exact")
    ? { "content-range": value.length ? `0-${value.length - 1}/${value.length}` : "*/0" }
    : {};
  return json(response, 200, singular ? (value[0] ?? null) : value, countHeader);
});

service.listen(apiPort, "127.0.0.1", () => {
  const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(appPort)], {
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${apiPort}`,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "fixture-service-role-key",
      ...(adminFixture ? { FOUNDER_USER_IDS: teacherId } : {}),
    },
    stdio: "inherit",
  });
  app.on("exit", (code) => {
    service.close();
    process.exit(code ?? 0);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      app.kill(signal);
      service.close();
    });
  }
});
