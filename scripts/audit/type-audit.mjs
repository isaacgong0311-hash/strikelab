// Typography audit: the numbers behind the bar in
// docs/superpowers/plans/2026-10-02-best-version-roadmap.md §1.
//
//   npm run build && npx next start -p 3100 &
//   node scripts/audit/type-audit.mjs http://localhost:3100
//
// For each route at 1366px it records every element that holds text, the size
// and family the CSS asks for, and the fonts Chrome actually painted with
// (DevTools' CSS.getPlatformFontsForNode). Prints a summary; pass a second
// argument to also write the raw rows as JSON.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const [, , base = "http://localhost:3100", jsonOut] = process.argv;
const ROUTES = [
  "/", "/lessons", "/lesson/3", "/lesson/inv-1", "/learn/inv-1.1", "/playground", "/challenges",
  "/demo", "/demo?view=student", "/dashboard", "/clubs", "/pilot", "/pricing", "/about",
  "/roadmap", "/achievements", "/sign-up", "/sandbox",
];
// Families StrikeLab ships. Self-hosted files report their internal names.
const DESIGNED = /^(Inter( Variable)?|JetBrains Mono|Plus Jakarta Sans|KaTeX_.*)$/;
// Glyphs none of our fonts carry; the system drawing them is expected.
const NO_FONT_HAS = /[✕◌✦◉∓≡ᵀ⊞⟲✶⏱∄⚠]|\p{Emoji_Presentation}/u;

function collect() {
  const rows = [];
  let i = 0;
  for (const el of document.body.querySelectorAll("*")) {
    if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName) || el.closest("svg")) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    if (cs.display === "none" || cs.visibility === "hidden" || box.width === 0) continue;
    el.setAttribute("data-type-audit", String(i));
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    rows.push({ i: i++, text: own.slice(0, 60), size: parseFloat(cs.fontSize), family: cs.fontFamily, weight: cs.fontWeight });
  }
  const lesson = [...document.querySelectorAll(".lesson-content p")].filter((p) => p.textContent.length > 300);
  const cpl = lesson.map((p) => {
    const lines = Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight));
    return Math.round(p.textContent.length / Math.max(lines, 1));
  });
  return { rows, cpl, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
const cdp = await page.context().newCDPSession(page);
await cdp.send("DOM.enable");
await cdp.send("CSS.enable");

const all = [];
const cpl = [];
const overflowing = [];
for (const route of ROUTES) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(collect);
  if (data.overflow > 0) overflowing.push(`${route} (+${data.overflow}px)`);
  cpl.push(...data.cpl);
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-type-audit]" });
  for (const nodeId of nodeIds) {
    try {
      const { attributes } = await cdp.send("DOM.getAttributes", { nodeId });
      const row = data.rows[Number(attributes[attributes.indexOf("data-type-audit") + 1])];
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      row.painted = fonts.map((f) => f.familyName);
    } catch {
      // The node re-rendered (a countdown, say) between the two reads; skip it.
    }
  }
  all.push(...data.rows.map((r) => ({ route, ...r })));
}
await browser.close();

const measured = all.filter((r) => r.painted);
const sizes = new Set(measured.map((r) => r.size));
const small = measured.filter((r) => r.size < 12);
const fallback = measured.filter((r) => r.painted.some((f) => !DESIGNED.test(f)) && !NO_FONT_HAS.test(r.text));
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

console.log(`Text elements measured:          ${measured.length} on ${ROUTES.length} routes at 1366px`);
console.log(`Distinct font sizes:             ${sizes.size}  (bar: <= 10)`);
console.log(`Text under 12px:                 ${small.length} (${Math.round((100 * small.length) / measured.length)}%)  (bar: 0)`);
console.log(`Painted with a system fallback:  ${fallback.length}  (bar: 0)`);
console.log(`Lesson body characters per line: median ${cpl.length ? median(cpl) : "n/a"}  (bar: 60-75)`);
console.log(`Pages scrolling sideways:        ${overflowing.length ? overflowing.join(", ") : "none"}`);
for (const r of fallback.slice(0, 10)) console.log(`  fallback: ${r.route} "${r.text}" -> ${r.painted.join(", ")}`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(all, null, 2));
