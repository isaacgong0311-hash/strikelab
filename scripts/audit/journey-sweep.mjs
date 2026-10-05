// Per-page user's-eye sweep: the numbers behind
// docs/superpowers/plans/2026-10-05-user-pov-review.md.
//
//   npm run build && npx next start -p 3100 &
//   node scripts/audit/journey-sweep.mjs http://localhost:3100
//
// Visits each route at 375px (phone, touch) and 1366px (Chromebook) and prints
// one line per page: sideways scroll, controls under 24px and under 44px, text
// under 12px, the H1's size and weight, and every axe violation. Exits 1 if any
// page scrolls sideways or has a serious or critical axe violation, so it can
// gate a change. Pass a second argument to write the raw rows as JSON.
//
// Needs no Supabase: signed-in views are seen as a signed-out visitor sees them.
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [, , base = "http://localhost:3100", jsonOut] = process.argv;
const ROUTES = [
  "/", "/lessons", "/lesson/1", "/lesson/3", "/learn/inv-1.1", "/learn/inv-5.3", "/playground",
  "/sandbox", "/challenges", "/pricing", "/clubs", "/pilot", "/demo", "/about", "/faq",
  "/for-teachers", "/blog", "/roadmap", "/sign-in", "/sign-up", "/dashboard", "/achievements",
];
const VIEWS = {
  phone: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
  chromebook: { viewport: { width: 1366, height: 768 } },
};

function measure() {
  const shown = (el) => {
    const box = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return box.width > 0 && box.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
  };
  const controls = [...document.querySelectorAll("a[href], button, input, select, textarea, [role=button]")].filter(shown);
  const under = (px) => controls.filter((el) => {
    const box = el.getBoundingClientRect();
    return box.width < px || box.height < px;
  }).length;
  const small = [...document.body.querySelectorAll("*")].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    && !el.closest("svg, script, style, .katex-mathml") && shown(el) && parseFloat(getComputedStyle(el).fontSize) < 12).length;
  const h1 = document.querySelector("h1");
  const cs = h1 && getComputedStyle(h1);
  return {
    sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    under24: under(24),
    under44: under(44),
    small,
    h1: h1 ? `${Math.round(parseFloat(cs.fontSize))}px/${cs.fontWeight}` : "none",
  };
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const rows = [];
for (const [view, options] of Object.entries(VIEWS)) {
  const context = await browser.newContext(options);
  for (const route of ROUTES) {
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForSelector("html[data-client-ready=true]", { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(measure);
    const axe = (await new AxeBuilder({ page }).analyze()).violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    rows.push({ view, route, ...metrics, axe });
    await page.close();
  }
  await context.close();
}
await browser.close();

for (const r of rows) {
  const axe = r.axe.map((v) => `${v.impact}:${v.id}(${v.nodes})`).join(" ");
  console.log(
    `${r.view.padEnd(10)} ${r.route.padEnd(15)} sideways ${String(r.sideways).padStart(2)}  <24px ${String(r.under24).padStart(2)}  <44px ${String(r.under44).padStart(2)}  <12px text ${String(r.small).padStart(3)}  h1 ${r.h1.padEnd(9)} ${axe}`,
  );
}
const blocking = rows.filter((r) => r.sideways > 0 || r.axe.some((v) => v.impact === "serious" || v.impact === "critical"));
console.log(`\n${rows.length} page views; ${blocking.length} with sideways scroll or a serious axe violation`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 2));
process.exit(blocking.length ? 1 : 0);
