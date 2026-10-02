# Type Foundation Implementation Plan (BV-T1, T2, T3, T8)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every glyph on StrikeLab's core screens is drawn by a font we ship, the code editor uses the code font, beginners see `<=` rather than a ligature, and pages carry fewer font bytes than today, with no layout change.

**Architecture:**
- **Fonts.** A pinned, reproducible Python script (fontTools) cuts Inter 4.1 and JetBrains Mono 2.304 to the weights, characters and OpenType features StrikeLab uses. `next/font/local` serves the results; Plus Jakarta Sans stays on `next/font/google`.
- **Stacks.** Font stacks get generic families through next/font's `fallback` option and the `--sl-font-*` tokens.
- **Guard.** A Playwright test asks DevTools which fonts actually painted each piece of text, so a regression fails CI.

**Tech Stack:** Next.js 16 (`next/font/local`, Turbopack), Python 3.9+ with fontTools 4.66.1, Playwright 1.63 with the Chrome DevTools Protocol, CodeMirror 6.

**Context:**
- Roadmap: `docs/superpowers/plans/2026-10-02-best-version-roadmap.md`, items BV-T1, T2, T3, T8.
- Window: before the code freeze (Fri Oct 23).
- Assumes PR #40 (the `--font-mono` cycle fix) is merged. If not, branch from `claude/lucid-allen-n4y95p`.

**What was already proven** (a trial build on 2026-10-02, then reverted):
- 38/38 Playwright tests passed.
- Fonts on `/` fell from 117,588 to 93,468 bytes.
- Elements with any glyph painted by a system font fell from 481 to 0 on the audit routes.
- 98.9% of 10,280 measured elements kept their size within 2px.

**Plan validated:** this plan's code blocks were applied verbatim to the 2026-10-02 tree; `tsc` and `eslint` were clean, and the whole Playwright suite (57 tests, including the 8 below) passed on a dev server, as CI runs it. Then everything was reverted.

**Two traps found during the trial** (don't repeat them):
1. **Don't pass `fallback` to `Plus_Jakarta_Sans`.** With Turbopack, a manual `fallback` on a Google font drops the metric-matched "Plus Jakarta Sans Fallback" face, which risks layout shift. Local fonts keep both.
2. **Local fonts are named after the JavaScript constant.** `const inter = localFont(...)` becomes `font-family: inter`, and DevTools reports the file's internal name ("Inter Variable"). Tests match on those names.

---

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `scripts/audit/type-audit.mjs` | Create | Prints the roadmap §1 type metrics for a running build |
| `tests/fonts.spec.ts` | Create | CI guard: designed fonts only, editor font, font-byte budget |
| `scripts/fonts/build_fonts.py` | Create | Builds the two woff2 files from pinned upstream releases |
| `scripts/fonts/requirements.txt` | Create | Pins fontTools |
| `.gitignore` | Modify | Ignores `/.font-cache/` (downloaded release zips) |
| `src/app/fonts/inter-text.woff2`, `src/app/fonts/jetbrains-mono-code.woff2` | Create (generated, committed) | The font files |
| `src/app/fonts/LICENSE-inter.txt`, `src/app/fonts/LICENSE-jetbrains-mono.txt` | Create (generated, committed) | OFL licences, required when redistributing |
| `src/app/layout.tsx` | Modify | Loads Inter and JetBrains Mono with `next/font/local` |
| `src/styles/tokens.css` | Modify | `--sl-font-*` stacks; display falls back to Inter |
| 24 files using `var(--font-display)` | Modify (codemod) | Use `var(--sl-font-display)` |
| `src/components/editorTheme.ts` | Modify | Editor uses `--sl-font-code` |
| `src/app/globals.css` | Modify (NUMERALS block) | Slashed zero for code only; no `calt` |
| `src/app/HomeView.tsx`, `src/components/marketing/marketing.module.css` | Modify | Kerns the hero's final period |
| `docs/ui-system.md` | Modify | Documents type roles, tokens and the font pipeline |

---

### Task 1: Commit the type audit and record the baseline

**Files:**
- Create: `scripts/audit/type-audit.mjs`

- [ ] **Step 1: Create the audit script**

```js
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
```

- [ ] **Step 2: Build and record the baseline**

Run:
```bash
npm run build
npx next start -p 3100 &
node scripts/audit/type-audit.mjs http://localhost:3100 | tee /tmp/type-audit-before.txt
```
Expected (Oct 2 numbers; small drift is fine):
```
Text elements measured:          2616 on 18 routes at 1366px
Distinct font sizes:             45  (bar: <= 10)
Text under 12px:                 441 (17%)  (bar: 0)
Painted with a system fallback:  481  (bar: 0)
Lesson body characters per line: median 86  (bar: 60-75)
Pages scrolling sideways:        none
```
If Playwright can't find its browser, set `CHROMIUM_PATH` to a Chromium binary.

- [ ] **Step 3: Commit**

```bash
git add scripts/audit/type-audit.mjs
git commit -m "chore: type audit script for the roadmap's typography bar"
```

---

### Task 2: Write the failing font guard

**Files:**
- Create: `tests/fonts.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { expect, test, type Page } from "@playwright/test";

// Every glyph on StrikeLab's core screens should be drawn by a font we ship.
// When one isn't, the browser silently borrows a system font: σ and → in
// Times, the code editor in whatever monospace the device has. This asks
// DevTools which fonts actually painted each piece of text.

// Self-hosted files report their internal names ("Inter Variable",
// "JetBrains Mono"), Google's copy of Inter reports "Inter", Jakarta comes
// from Google Fonts, and KaTeX's fonts join once maths typesetting lands.
const DESIGNED = /^(Inter( Variable)?|JetBrains Mono|Plus Jakarta Sans|KaTeX_.*)$/;
// Symbols none of our fonts carry, so the system drawing them is expected.
const NO_FONT_HAS = /[✕◌✦◉∓≡ᵀ⊞⟲✶⏱∄⚠]|\p{Emoji_Presentation}/u;
const ROUTES = ["/", "/lessons", "/lesson/3", "/learn/inv-1.1", "/playground", "/demo"];

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await page.evaluate(() => document.fonts.ready);
}

/** Each element that directly holds text, with the fonts that painted it. */
async function paintedText(page: Page): Promise<{ text: string; fonts: string[] }[]> {
  const texts = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("script, style, noscript, svg")) continue;
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim();
      if (!own) continue;
      el.setAttribute("data-font-check", String(out.length));
      out.push(own);
    }
    return out;
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-font-check]" });
  const painted: { text: string; fonts: string[] }[] = [];
  for (const nodeId of nodeIds) {
    const { attributes } = await cdp.send("DOM.getAttributes", { nodeId });
    const index = Number(attributes[attributes.indexOf("data-font-check") + 1]);
    const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    painted.push({ text: texts[index], fonts: fonts.map((f) => f.familyName) });
  }
  await cdp.detach();
  return painted;
}

for (const route of ROUTES) {
  test(`${route} draws its text with StrikeLab's fonts`, async ({ page }) => {
    await open(page, route);
    const strays = (await paintedText(page))
      .filter(({ text, fonts }) => fonts.some((f) => !DESIGNED.test(f)) && !NO_FONT_HAS.test(text))
      .map(({ text, fonts }) => `"${text.slice(0, 40)}" -> ${fonts.join(", ")}`);
    expect(strays, strays.join("\n")).toEqual([]);
  });
}

test("the code editor is set in the code font", async ({ page }) => {
  await open(page, "/playground");
  await expect(page.locator(".cm-scroller").first()).toHaveCSS("font-family", /jetbrains/i);
});

test("the homepage loads at most three font files, 100 KB in all", async ({ page }) => {
  const sizes: Promise<number>[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") sizes.push(response.body().then((b) => b.length));
  });
  await open(page, "/");
  const bytes = await Promise.all(sizes);
  expect(bytes.length).toBeLessThanOrEqual(3);
  expect(bytes.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(100_000);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx playwright test tests/fonts.spec.ts --reporter=list`

Expected: **7 of 8 fail.** `/`, `/lessons`, `/lesson/3`, `/playground` and `/demo` list strays such as:
```
"Clubs & teachers: free pilots this fall " -> Liberation Serif, JetBrains Mono
"→" -> Liberation Serif
"∑" -> Liberation Serif
"✓ Tests passed" -> DejaVu Sans, Inter
```
The other two failures:
- the editor test, whose `font-family` has no `jetbrains`;
- the budget test, at 117 KB over three files.

`/learn/inv-1.1` already passes. (Font names depend on the OS; any non-StrikeLab family counts.)

- [ ] **Step 3: Commit the failing test on the branch**

```bash
git add tests/fonts.spec.ts
git commit -m "test: fail when text is painted by a font StrikeLab doesn't ship"
```

---

### Task 3: Build the self-hosted fonts

**Files:**
- Create: `scripts/fonts/build_fonts.py`, `scripts/fonts/requirements.txt`
- Modify: `.gitignore`
- Generated: `src/app/fonts/*`

- [ ] **Step 1: Create the build script**

```python
#!/usr/bin/env python3
"""Builds StrikeLab's self-hosted Inter and JetBrains Mono files.

Google Fonts serves both without the OpenType features our CSS asks for
(slashed zero, I/l/1 disambiguation), and its latin files carry no Greek, no
arrows and no maths symbols, so σ, Δ, →, ✓ and √ fall back to whatever the
device has. This script pins the upstream releases, cuts each font to the
weights and characters StrikeLab renders, keeps the features we use, and drops
JetBrains Mono's coding ligatures: a beginner has to see `<=`, not `≤`.

Run it only when a font version or the character list changes:

    python3 -m pip install -r scripts/fonts/requirements.txt
    python3 scripts/fonts/build_fonts.py

Outputs (committed): src/app/fonts/inter-text.woff2,
src/app/fonts/jetbrains-mono-code.woff2 and the two OFL licence files.
"""

import hashlib
import io
import os
import pathlib
import shutil
import urllib.request
import zipfile

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / ".font-cache"
OUT = pathlib.Path(os.environ.get("FONT_OUT_DIR", ROOT / "src" / "app" / "fonts"))

SOURCES = {
    "inter": {
        "url": "https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip",
        "sha256": "9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e",
        "font": "InterVariable.ttf",
        "license": "LICENSE.txt",
    },
    "jetbrains-mono": {
        "url": "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip",
        "sha256": "6f6376c6ed2960ea8a963cd7387ec9d76e3f629125bc33d1fdcd7eb7012f7bbf",
        "font": "fonts/variable/JetBrainsMono[wght].ttf",
        "license": "OFL.txt",
    },
}

# Every character StrikeLab renders, from a scan of src/ and content/ on
# 2026-10-02: Latin-1, typographic punctuation, Greek (the Greeks, σ, μ, β),
# sub- and superscripts, arrows, maths operators and the UI symbols ▶ ▲ ▼ ✓ ✗ ⌘.
# Neither font has ✕ ◌ ✦ ◉ ∓ ≡ ᵀ; those few stay with the system.
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02B3,U+02C6,U+02DA,U+02DC,"
    "U+0391-03A9,U+03B1-03C9,U+1D62,U+2010-2027,U+2030-203A,U+2044,U+2070-209C,"
    "U+20AC,U+2122,U+2190-2199,U+21B5,U+21BB,U+2202,U+2206,U+2211-2212,U+2215,"
    "U+221A,U+221E,U+2248,U+2260,U+2264-2265,U+2295,U+2297,U+2318,U+25B2-25B3,"
    "U+25B6,U+25BC,U+25C6,U+25CB,U+25CF,U+2713,U+2717,U+2C7C"
)

BUILDS = [
    {
        "source": "inter",
        "output": "inter-text.woff2",
        # Text optical size; 400-700 are the weights the CSS gets today.
        "axes": {"opsz": 14, "wght": (400, 700)},
        "features": "kern,mark,mkmk,ccmp,locl,calt,liga,tnum,pnum,zero,ss02,case,frac,numr,dnom,sups,subs",
    },
    {
        "source": "jetbrains-mono",
        "output": "jetbrains-mono-code.woff2",
        "axes": {"wght": (400, 700)},
        # No calt: that feature holds every coding ligature.
        "features": "ccmp,locl,zero",
        # Box drawing, for the "# ── Helpers ──" dividers in starter code.
        "extra_unicodes": "U+2500-257F",
    },
]


def fetch(name: str) -> zipfile.ZipFile:
    spec = SOURCES[name]
    CACHE.mkdir(exist_ok=True)
    archive = CACHE / f"{name}.zip"
    if not archive.exists():
        with urllib.request.urlopen(spec["url"]) as response, open(archive, "wb") as fh:
            shutil.copyfileobj(response, fh)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != spec["sha256"]:
        archive.unlink()
        raise SystemExit(f"{name}: checksum mismatch ({digest}); refusing to build")
    return zipfile.ZipFile(archive)


def build(spec: dict) -> pathlib.Path:
    source = SOURCES[spec["source"]]
    with fetch(spec["source"]) as archive:
        font = TTFont(io.BytesIO(archive.read(source["font"])), lazy=False)
        licence = archive.read(source["license"])
    # Round-trip the instanced font so the subsetter sees fully compiled tables.
    # Timestamps stay as the source has them, so rebuilding unchanged inputs
    # gives byte-identical files (no noise in git).
    instanced_font = instancer.instantiateVariableFont(font, spec["axes"])
    instanced_font.recalcTimestamp = False
    instanced = io.BytesIO()
    instanced_font.save(instanced)
    instanced.seek(0)
    font = TTFont(instanced, lazy=False, recalcTimestamp=False)

    options = subset.Options()
    options.layout_features = spec["features"].split(",")
    subsetter = subset.Subsetter(options=options)
    unicodes = UNICODES + ("," + spec["extra_unicodes"] if "extra_unicodes" in spec else "")
    subsetter.populate(unicodes=subset.parse_unicodes(unicodes))
    subsetter.subset(font)

    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / spec["output"]
    font.flavor = "woff2"
    font.save(target)
    (OUT / f"LICENSE-{spec['source']}.txt").write_bytes(licence)
    return target


if __name__ == "__main__":
    for spec in BUILDS:
        path = build(spec)
        print(f"{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}: {path.stat().st_size} bytes")
```

- [ ] **Step 2: Pin the tool**

`scripts/fonts/requirements.txt`:
```
fonttools[woff]==4.66.1
```

- [ ] **Step 3: Ignore the download cache**

Append to `.gitignore`:
```
# release zips downloaded by scripts/fonts/build_fonts.py
/.font-cache/
```

- [ ] **Step 4: Run it**

```bash
python3 -m pip install -r scripts/fonts/requirements.txt
python3 scripts/fonts/build_fonts.py
```
Expected:
```
src/app/fonts/inter-text.woff2: 43844 bytes
src/app/fonts/jetbrains-mono-code.woff2: 20948 bytes
```
Run it a second time and check `git status` shows no change to the `.woff2` files: the build is byte-reproducible.

- [ ] **Step 5: Commit**

```bash
git add scripts/fonts .gitignore src/app/fonts
git commit -m "feat: build Inter and JetBrains Mono subsets with Greek, maths and our OpenType features"
```

---

### Task 4: Load the fonts from `src/app/fonts`

**Files:**
- Modify: `src/app/layout.tsx` (imports, and the `jakarta`, `inter` and `jetbrains` constants)

- [ ] **Step 1: Change the import**

Replace:
```tsx
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
```
with:
```tsx
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
```

- [ ] **Step 2: Leave Jakarta's options alone, and say why**

Directly above `const jakarta = Plus_Jakarta_Sans({`, after the existing comment, add:
```tsx
// No `fallback` option here: with Turbopack, a manual fallback on a Google
// font replaces the metric-matched "Plus Jakarta Sans Fallback" face and
// headings would shift when the font arrives. Stacks that need a generic
// family use --sl-font-display (tokens.css), which falls back to Inter.
```

- [ ] **Step 3: Replace the Inter and JetBrains Mono loaders**

Replace everything from `const inter = Inter({` through the closing `});` of `const jetbrains = JetBrains_Mono({` with:
```tsx
const inter = localFont({
  // Self-hosted (scripts/fonts/build_fonts.py) rather than Google's file:
  // Google's latin subset has no Greek, arrows or maths symbols and strips
  // the slashed-zero and I/l/1 features, so σ, Δ and → fell back to the
  // device's fonts. This file carries all of them and is still smaller.
  src: "./fonts/inter-text.woff2",
  variable: "--font-ui",
  weight: "400 700",
  // Appended to --font-ui, so even a bare var(--font-ui) ends in a generic family.
  fallback: ["system-ui", "sans-serif"],
});

// JetBrains Mono — code, formulas written as code, and data. The ligatures
// are cut out of the file: a beginner has to see `<=` and `!=` as typed.
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-code.woff2",
  variable: "--font-mono",
  weight: "400 700",
  // Code and small labels only: not worth competing with the page's own
  // content for bandwidth on a slow school network (work plan AG4). It
  // still loads, with a fallback font until it arrives.
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});
```
Keep the existing `// Inter — UI and body.` comment block above `const inter`.

- [ ] **Step 4: Build and check the variables**

Run:
```bash
npm run build
grep -Eho -- "--font-(ui|mono|display):[^;}]*" .next/static/chunks/*.css | grep -Ev "ui-sans|SFMono"
```
Expected:
```
--font-display:"Plus Jakarta Sans", "Plus Jakarta Sans Fallback"
--font-ui:"inter", "inter Fallback", system-ui, sans-serif
--font-mono:"jetbrains", "jetbrains Fallback", ui-monospace, monospace
```

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: serve Inter and JetBrains Mono from our own subsets"
```

---

### Task 5: Stacks that end well

**Files:**
- Modify: `src/styles/tokens.css` (the three `--sl-font-*` lines under `/* Type */`)
- Modify: the 24 files that use `var(--font-display)`

- [ ] **Step 1: Update the tokens**

In `src/styles/tokens.css` replace:
```css
  /* Type */
  --sl-font-display: var(--font-display), "Plus Jakarta Sans", system-ui, sans-serif;
  --sl-font-body: var(--font-ui), Inter, system-ui, sans-serif;
  --sl-font-code: var(--font-mono), "JetBrains Mono", ui-monospace, monospace;
```
with:
```css
  /* Type. --font-ui and --font-mono already end in generic families (the
     `fallback` options in layout.tsx). Display falls back to Inter: Jakarta
     has no Greek, so a Δ or σ in a heading comes from Inter instead of the
     device's serif. */
  --sl-font-display: var(--font-display), var(--font-ui);
  --sl-font-body: var(--font-ui);
  --sl-font-code: var(--font-mono);
```

- [ ] **Step 2: Point every display usage at the token**

Run from the repo root (works on Windows, macOS and Linux):
```bash
node -e '
const fs = require("fs");
const { execSync } = require("child_process");
const files = execSync("git grep -l \"var(--font-display)\" -- src").toString().trim().split("\n");
for (const f of files) {
  if (f === "src/styles/tokens.css") continue;
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replaceAll("var(--font-display)", "var(--sl-font-display)"));
  console.log(f);
}'
```
Expected: 24 files printed, including `src/app/pg-ch.css`, `src/app/globals.css` and `src/app/roadmap/page.tsx`.

Then run `git grep -c "var(--font-display)" -- src`.
Expected: `src/styles/tokens.css:1` only.

- [ ] **Step 3: Commit**

```bash
git add -A src
git commit -m "fix: display stacks fall back to Inter, so Greek and maths symbols stop landing in a serif"
```

---

### Task 6: The code font where code is

**Files:**
- Modify: `src/components/editorTheme.ts` (`accessibleGutters`)
- Modify: `src/app/globals.css` (NUMERALS block, near the end of the file)

- [ ] **Step 1: Set the editor's font**

In `src/components/editorTheme.ts` replace:
```ts
const accessibleGutters = EditorView.theme(
  {
    // Set on the elements themselves: a ".cm-gutters" rule here ties on
    // specificity with One Dark's and loses on stylesheet order.
    ".cm-gutters .cm-gutterElement": { color: stone },
  },
  { dark: true }
);
```
with:
```ts
const accessibleGutters = EditorView.theme(
  {
    // Set on the elements themselves: a ".cm-gutters" rule here ties on
    // specificity with One Dark's and loses on stylesheet order.
    ".cm-gutters .cm-gutterElement": { color: stone },
    // CodeMirror's base theme sets `monospace`, which is a different font on
    // every OS (Cousine on ChromeOS, Consolas on Windows). Use ours.
    ".cm-scroller": { fontFamily: "var(--sl-font-code)" },
  },
  { dark: true }
);
```

- [ ] **Step 2: Fix the numeral features**

In `src/app/globals.css`, in the NUMERALS block, replace:
```css
.sl-quiz-score, .db-ring-pct {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "zero" 1;
}

/* Code and anything mono gets a slashed zero, which is the whole point of a
   coding face — 0 and O are indistinguishable otherwise. */
code, pre, .sk-code, .ai-code, .ai-inline, .pr-output,
[class*="font-mono"], .cm-editor {
  font-feature-settings: "zero" 1, "calt" 1;
}
```
with:
```css
.sl-quiz-score, .db-ring-pct {
  font-variant-numeric: tabular-nums;
  /* No "zero" here. Google's Inter never had the feature, so these stats
     have always shown a plain 0; our Inter does have it, and a slashed zero
     in a big stat isn't the look. */
  font-feature-settings: "tnum" 1;
}

/* Code and anything mono gets a slashed zero, which is the whole point of a
   coding face — 0 and O are indistinguishable otherwise. No "calt": the
   coding ligatures are cut out of the font file itself. */
code, pre, .sk-code, .ai-code, .ai-inline, .pr-output,
[class*="font-mono"], .cm-editor {
  font-feature-settings: "zero" 1;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/editorTheme.ts src/app/globals.css
git commit -m "fix: the code editor uses the code font; slashed zero for code only"
```

---

### Task 7: Kern the hero's period

**Files:**
- Modify: `src/app/HomeView.tsx:47`
- Modify: `src/components/marketing/marketing.module.css` (after `.h1`)

- [ ] **Step 1: Wrap the period**

In `src/app/HomeView.tsx` replace:
```tsx
            <h1 className={styles.h1}>Learn quant finance by building it.</h1>
```
with:
```tsx
            <h1 className={styles.h1}>Learn quant finance by building it<span className={styles.stop}>.</span></h1>
```

- [ ] **Step 2: Pull it in**

In `src/components/marketing/marketing.module.css`, after the `.h1` rule, add:
```css
/* Jakarta's period sits loose at display size and weight 800; set it like a
   kerning pair. -0.06em closes the gap without touching the t's hooked foot
   (-0.1em touches, -0.14em hides the period under it). */
.stop { margin-inline-start: -0.06em; }
```

- [ ] **Step 3: Check it**

With a dev server running, open `/` at 1366px and zoom on "it.". The period should sit as close to the "t" as the "t" sits to the "i". The heading's text content is unchanged ("Learn quant finance by building it."), so tests and screen readers read the same sentence.

- [ ] **Step 4: Commit**

```bash
git add src/app/HomeView.tsx src/components/marketing/marketing.module.css
git commit -m "fix: kern the hero headline's period"
```

---

### Task 8: Prove it, document it, ship it

**Files:**
- Modify: `docs/ui-system.md` (new "Type" section after "Foundation")
- Modify: `docs/superpowers/plans/2026-10-02-best-version-roadmap.md` (§12 change log)

- [ ] **Step 1: Run the guard**

Run: `npx playwright test tests/fonts.spec.ts --reporter=list`

Expected: **8 passed.**

- [ ] **Step 2: Run everything CI runs**

```bash
npm run lint
npx tsc --noEmit -p .
npm test
npm run test:e2e
npm run build
npm run lhci
```
Expected:
- all pass;
- Lighthouse total bytes on `/` about 24 KB lower than before (fonts 93–94 KB, down from 117.6 KB);
- CLS 0.000–0.001;
- no new assertion failures (the LCP and script-size warnings were already there).

- [ ] **Step 3: Run the audit again**

```bash
npx next start -p 3100 &
node scripts/audit/type-audit.mjs http://localhost:3100 | tee /tmp/type-audit-after.txt
```
Expected: `Painted with a system fallback: 0`.

The size counts stay where they were (45 sizes, 17% under 12px). Those are BV-T5 and BV-T7, in the winter build.

- [ ] **Step 4: Screenshot check**

Take 375px and 1366px screenshots of `/`, `/lessons`, `/lesson/3`, `/learn/inv-1.1` and `/playground`, before and after. Expected differences:
- Greek letters, arrows and ✓ now in Inter instead of a serif;
- the editor in JetBrains Mono;
- the hero period closer.

Nothing else moves.

- [ ] **Step 5: Document the type system**

In `docs/ui-system.md`, after the "Foundation" section, add:
```markdown
## Type

| Face | Token | Job |
|---|---|---|
| Plus Jakarta Sans | `--sl-font-display` | Headings and big display numbers |
| Inter | `--sl-font-body` | Everything people read or press |
| JetBrains Mono | `--sl-font-code` | Code, formulas written as code, data, the eyebrow label |

- Use the `--sl-font-*` tokens, never the raw `--font-*` variables: the tokens end in generic families and send Greek in headings to Inter.
- Inter and JetBrains Mono are self-hosted subsets built by `scripts/fonts/build_fonts.py` from pinned upstream releases. To add a character, add it to `UNICODES` there, re-run the script and commit the woff2 files. Jakarta comes from `next/font/google`; don't give it a `fallback` option (see `layout.tsx`).
- JetBrains Mono ships without ligatures. Slashed zero is on for code only.
- `tests/fonts.spec.ts` fails if text on a core route is painted by a font we don't ship. `scripts/audit/type-audit.mjs` prints the typography numbers for any build.
```

- [ ] **Step 6: Log it in the roadmap**

Add a row to §12 of `docs/superpowers/plans/2026-10-02-best-version-roadmap.md` with the merge date and the font bytes Lighthouse reported for `/` in Step 2. For example, with the trial's numbers:
```markdown
| 2026-10-16 | Batch 1 shipped (BV-T1, T2, T3, T8): fonts on `/` 117.6 → 93.5 KB; system-painted elements 481 → 0 on the audit routes. |
```

- [ ] **Step 7: Commit and open the PR**

```bash
git add docs/ui-system.md docs/superpowers/plans/2026-10-02-best-version-roadmap.md
git commit -m "docs: type roles, tokens and the font pipeline"
```
Open a PR. In the description, include:
- the audit before and after (Task 1 and Task 8);
- the Lighthouse table;
- the 375 and 1366px screenshots;
- a note that the weights stay at 400–700 (roadmap decision 2).
