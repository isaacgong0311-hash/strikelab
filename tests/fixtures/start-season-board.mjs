// Local-only seeded Supabase HTTP stand-in for the chapter board browser test.
// PGlite tests cover the real SQL/RLS; this exercises the Next pages, auth
// cookie handling, and class selector without touching a hosted database.
import { createServer } from "node:http";
import { spawn } from "node:child_process";

const apiPort = 54399;
const appPort = 3113;
const studentId = "11111111-1111-4111-8111-111111111111";
const teacherId = "22222222-2222-4222-8222-222222222222";
const firstClub = { id: "33333333-3333-4333-8333-333333333333", name: "Options Club" };
const secondClub = { id: "44444444-4444-4444-8444-444444444444", name: "Quant Club" };
const season = { id: "s1", title: "Season 1", starts_on: "2026-10-01", ends_on: "2026-12-20" };

function json(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, prefer, accept-profile",
    "access-control-allow-methods": "GET, POST, OPTIONS",
  });
  response.end(JSON.stringify(value));
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
    case "/rest/v1/season_challenges": value = []; break;
    case "/rest/v1/profiles": value = token === "fixture-service-role-key" ? [{ id: studentId, display_name: "Example Student" }] : userId === studentId ? [{ handle: "student_one" }] : []; break;
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
  return json(response, 200, singular ? (value[0] ?? null) : value);
});

service.listen(apiPort, "127.0.0.1", () => {
  const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", String(appPort)], {
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${apiPort}`,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "fixture-service-role-key",
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
