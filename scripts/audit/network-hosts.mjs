// Records every host the browser contacts while a student or leader uses the
// pilot pages, so the IT allowlist in docs/gtm/kickoff-kit.md §1 can be checked
// against what the app really does.
//
//   npm run build && npx next start -p 3100 &   (or point at a deployment)
//   node scripts/audit/network-hosts.mjs http://localhost:3100
//
// Use a production build or a deployment: in development the analytics script
// comes from va.vercel-scripts.com, in production from our own origin.
//
// Prints one line per host with the routes that contacted it and the resource
// types, then flags hosts that are not on the allowlist below. Exits 1 if one
// is not, so it can gate a change. Run it signed out: with no Supabase keys the
// Supabase host won't appear locally, so check NEXT_PUBLIC_SUPABASE_URL by hand.
import { chromium } from "@playwright/test";

const [, , base = "http://localhost:3000"] = process.argv;
const own = new URL(base).host;

// What kickoff-kit.md §1 tells a school to allow. Keep the two in step.
const ALLOWED = [
  { match: (h) => h === own || h === "strikelab.dev", why: "the site itself" },
  { match: (h) => h.endsWith(".supabase.co"), why: "sign-in and progress (Supabase)" },
  { match: (h) => h === "cdn.jsdelivr.net", why: "backup Python runtime (optional)" },
  { match: (h) => h === "accounts.google.com", why: "Continue with Google (optional)" },
  { match: (h) => h.endsWith(".ingest.sentry.io"), why: "error reports (optional)" },
];

const ROUTES = [
  "/", "/pilot", "/clubs", "/demo", "/demo?view=tour", "/trust", "/join/ZZZZZZ", "/sign-up", "/sign-in",
  "/pricing", "/lessons", "/learn/inv-1.1", "/lesson/3", "/challenges", "/playground", "/dashboard",
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const hosts = new Map(); // host -> { routes:Set, types:Set }
let pyodideRequests = 0; // proves the lesson's Run really loaded the runtime

for (const route of ROUTES) {
  const page = await (await browser.newContext()).newPage();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.pathname.startsWith("/pyodide/")) pyodideRequests += 1;
    const entry = hosts.get(url.host) ?? { routes: new Set(), types: new Set() };
    entry.routes.add(route);
    entry.types.add(request.resourceType());
    hosts.set(url.host, entry);
  });
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForSelector("html[data-client-ready=true]", { timeout: 10_000 }).catch(() => {});
  if (route === "/lesson/3") {
    // The exercise is where the Python runtime loads; run it so we see that too.
    await page.getByRole("button", { name: /^run/i }).first().click({ timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(15_000);
  } else {
    await page.waitForTimeout(1_000);
  }
  await page.context().close();
}
await browser.close();

let unknown = 0;
for (const [host, { routes, types }] of [...hosts].sort()) {
  const rule = ALLOWED.find((r) => r.match(host));
  if (!rule) unknown += 1;
  console.log(
    `${rule ? "ok     " : "UNKNOWN"} ${host.padEnd(34)} ${[...types].sort().join(",").padEnd(40)} ${rule ? rule.why : `${routes.size} route(s): ${[...routes].slice(0, 4).join(" ")}`}`,
  );
}
console.log(`\n${hosts.size} hosts contacted; ${unknown} not on the allowlist; ${pyodideRequests} Python runtime requests (0 means Run never loaded it, so the check proved nothing about Python)`);
process.exit(unknown ? 1 : 0);
