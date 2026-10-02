# Maths Typesetting Implementation Plan (BV-T4, BV-P4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formulas in lessons and session steps render as real typeset maths (fractions, radicals, sub- and superscripts), with MathML for screen readers and no maths JavaScript in the browser, starting with the Black-Scholes lesson.

**Architecture:**
- **Markup.** Lesson HTML marks maths as `<span class="tex">…</span>` (inline) or `<div class="tex-block">…</div>` (display).
- **Render.** A server-only module renders those spans with KaTeX at build time (both lesson and session pages are prerendered), emitting HTML plus MathML. The KaTeX library never reaches the client bundle; only its CSS and the 3–4 font files a page actually uses do.
- **Guard.** Malformed TeX throws, so a typo fails the build instead of shipping.

**Tech Stack:** KaTeX 0.16.47 (ships its own types), Next.js 16 server components, Vitest, Playwright with axe.

**Context:**
- Roadmap: `docs/superpowers/plans/2026-10-02-best-version-roadmap.md` (BV-T4, BV-P4; founder decision 3).
- Window: Phase B weeks 1–2 (Oct 26 – Nov 8), lesson 3 only, if approved; otherwise the winter build.
- Lesson 3 is the formula lesson cohort A reaches in week 3.

**Why KaTeX at build time, not native MathML:**
- Chrome 109+ renders MathML, but it needs a maths font, and Latin Modern Math is 379 KiB, more than every other font on the site together.
- KaTeX's output for a page like lesson 3 needs `katex.min.css` (23.8 KB, 3.6 KB gzipped) plus Main-Regular (26.3 KB), Math-Italic (16.4 KB) and two or three of the small Size fonts (3.6–5.5 KB each) for big brackets and radicals.
- Those fonts load only on pages that show maths.

**Validated** (this plan's code blocks applied verbatim to the 2026-10-02 tree, then reverted):
- `tsc` and `eslint` clean;
- 99 unit tests;
- 10 Playwright tests on a dev server (3 maths, 7 session);
- no client chunk contains KaTeX;
- the 320px test fails without the overflow fix (49px) and passes with it.

**Checked before writing this plan** (KaTeX 0.16.47, `strict: "error"`):
- every formula in Task 4 renders;
- `\frac` emits `<mfrac>`;
- `>` emits `<mo>&gt;</mo>`;
- `\frac{1}{` and an accented `é` both throw; Unicode Greek such as `σ` is accepted and renders like `\sigma`.

---

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `src/lib/math/renderMath.ts` | Create | `renderTex` and `renderMathInHtml`, server-only |
| `src/lib/math/renderMath.test.ts` | Create | Unit tests, plus a content lint over every lesson |
| `src/app/lesson/[id]/page.tsx` | Modify | Typesets lesson HTML before the table of contents splits it; imports the KaTeX CSS |
| `src/app/lesson/[id]/lessonMath.module.css` | Create | Long display formulas scroll inside their block on phones |
| `src/app/lesson/[id]/LessonClient.tsx` | Modify | Applies that class to the lesson content wrapper |
| `src/lib/lessons.ts` (lesson `"3"` only) | Modify | Black-Scholes formulas as TeX; content becomes `String.raw` |
| `src/lib/sessions/types.ts` | Modify | `ExplainStep.formulaTex` |
| `src/app/learn/[sessionId]/page.tsx` | Modify | Pre-renders step formulas; imports the KaTeX CSS |
| `src/app/learn/[sessionId]/SessionPlayer.tsx` | Modify | Shows the pre-rendered formula |
| `src/lib/sessions/content/inv5.ts` | Modify | Sharpe ratio as TeX |
| `src/lib/sessions/content.test.ts` | Modify | Lints `formulaTex` |
| `tests/math.spec.ts` | Create | Browser check, with axe |

---

### Task 1: The renderer, test first

**Files:**
- Create: `src/lib/math/renderMath.test.ts`
- Create: `src/lib/math/renderMath.ts`

- [ ] **Step 1: Install KaTeX**

Run: `npm install katex@0.16.47`
Expected: `package.json` gains `"katex": "^0.16.47"`. No `@types` package is needed; KaTeX ships `types/katex.d.ts`.

- [ ] **Step 2: Write the failing tests**

`src/lib/math/renderMath.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getAllLessons } from "@/lib/tracks";
import { renderMathInHtml, renderTex } from "./renderMath";

describe("renderMathInHtml", () => {
  it("leaves HTML without maths untouched", () => {
    const html = "<p>No maths here, just S/K and 5%.</p>";
    expect(renderMathInHtml(html)).toBe(html);
  });

  it("typesets inline maths with a MathML twin for screen readers", () => {
    const out = renderMathInHtml('<p>where <span class="tex">d_1</span> is</p>');
    expect(out).toContain('class="katex"');
    expect(out).toContain("<math");
    expect(out).not.toContain('class="tex"');
  });

  it("typesets display maths as a block with a real fraction", () => {
    const out = renderMathInHtml(String.raw`<div class="tex-block">d_1 = \frac{\ln(S/K)}{\sigma\sqrt{T}}</div>`);
    expect(out).toContain('class="katex-display"');
    expect(out).toContain("<mfrac>");
  });

  it("decodes the HTML entities authors need around < and >", () => {
    expect(renderMathInHtml('<span class="tex">S_T &gt; K</span>')).toContain("<mo>&gt;</mo>");
  });

  it("fails loudly on malformed TeX and on input LaTeX can't typeset", () => {
    expect(() => renderTex(String.raw`\frac{1}{`, false)).toThrow();
    expect(() => renderTex("é", false)).toThrow();
  });
});

describe("lesson maths", () => {
  it("typesets in every lesson", () => {
    for (const lesson of getAllLessons()) expect(() => renderMathInHtml(lesson.content), lesson.id).not.toThrow();
  });

  it("stays out of section headings, which the table of contents shows as plain text", () => {
    for (const lesson of getAllLessons()) expect(lesson.content, lesson.id).not.toMatch(/<h2[^>]*>[^<]*<(span|div) class="tex/);
  });
});
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx vitest run src/lib/math/renderMath.test.ts`
Expected: FAIL with `Failed to resolve import "./renderMath"`.

- [ ] **Step 4: Write the renderer**

`src/lib/math/renderMath.ts`:
```ts
import katex from "katex";

/**
 * Typesets maths in our authored lesson HTML at build time, so students get
 * real fractions, radicals and scripts with no maths JavaScript on the page.
 *
 *   <span class="tex">d_1</span>                       inline
 *   <div class="tex-block">C = S\,N(d_1) - ...</div>   display
 *
 * Output is KaTeX's HTML plus MathML, so screen readers read the formula.
 * Malformed TeX throws, which fails the build instead of shipping a broken
 * formula. `strict: "error"` also rejects input LaTeX itself wouldn't
 * accept, such as accented letters in maths mode. (Greek typed as σ is
 * fine; KaTeX treats it as \sigma.)
 *
 * Import only from server components (page.tsx files). Nothing here should
 * reach the client bundle.
 */

const INLINE = /<span class="tex">([\s\S]*?)<\/span>/g;
const DISPLAY = /<div class="tex-block">([\s\S]*?)<\/div>/g;

/** Authors write &lt; &gt; &amp; inside HTML; KaTeX wants the characters. */
function decodeEntities(tex: string): string {
  return tex.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

export function renderTex(tex: string, displayMode: boolean): string {
  return katex.renderToString(decodeEntities(tex.trim()), {
    displayMode,
    output: "htmlAndMathml",
    throwOnError: true,
    strict: "error",
  });
}

export function renderMathInHtml(html: string): string {
  return html
    .replace(DISPLAY, (_, tex: string) => renderTex(tex, true))
    .replace(INLINE, (_, tex: string) => renderTex(tex, false));
}
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/lib/math/renderMath.test.ts`
Expected: PASS (7 tests). The lesson tests pass trivially until Task 4 adds maths.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/math
git commit -m "feat: build-time maths typesetting (KaTeX, HTML + MathML)"
```

---

### Task 2: Typeset lesson pages

**Files:**
- Modify: `src/app/lesson/[id]/page.tsx` (imports; the `buildLessonToc` call at line 91)

- [ ] **Step 1: Import the CSS and the renderer**

At the top of `src/app/lesson/[id]/page.tsx`, after `import { buildLessonToc } from "@/lib/lessonToc";`, add:
```tsx
import "katex/dist/katex.min.css";
import { renderMathInHtml } from "@/lib/math/renderMath";
```

- [ ] **Step 2: Render before splitting into sections**

Replace:
```tsx
  const toc = buildLessonToc(ctx.lesson.content);
```
with:
```tsx
  // Maths is typeset here, on the server, so KaTeX never ships to the client
  // and the formulas are in the prerendered HTML.
  const toc = buildLessonToc(renderMathInHtml(ctx.lesson.content));
```

- [ ] **Step 3: Keep long formulas inside the column**

KaTeX sets display maths on one line (`white-space: nowrap`). At 320px (the WCAG reflow width), lesson 3's d₂ formula is 345px wide in a 272px column and pushes the whole page 49px sideways. (It happens to fit at 375px.)

Create `src/app/lesson/[id]/lessonMath.module.css`:
```css
/* KaTeX sets display maths on one line. On a phone a long formula would push
   the whole page sideways; let it scroll inside its own block instead.
   :global because the markup comes from KaTeX, not from us. */
.content :global(.katex-display) { overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; }
```
In `src/app/lesson/[id]/LessonClient.tsx`, add the import after the `@/lib/pythonRuntime` import (and the `PythonWarmup` import, if BV-X6 has landed):
```tsx
import mathStyles from "./lessonMath.module.css";
```
and replace:
```tsx
          className="v2-rise lesson-content mb-8 pb-8"
```
with:
```tsx
          className={`v2-rise lesson-content mb-8 pb-8 ${mathStyles.content}`}
```

- [ ] **Step 4: Build and check KaTeX stayed on the server**

Run:
```bash
npm run build
grep -l "KaTeX parse error" .next/static/chunks/*.js
```
Expected: the build succeeds and `grep` prints nothing (that string is inside the KaTeX library, so no client chunk contains it).

- [ ] **Step 5: Commit**

```bash
git add "src/app/lesson/[id]"
git commit -m "feat: typeset maths in lesson pages at build time"
```

---

### Task 3: A browser test for the typeset lesson

**Files:**
- Create: `tests/math.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Lesson 3 is where the pilot meets Black-Scholes. Its formulas must be real
// typeset maths (a fraction for d1, not a slash on one line) with a MathML
// twin for screen readers, and the lesson must stay axe-clean.

test("lesson 3 typesets Black-Scholes", async ({ page }) => {
  await page.goto("/lesson/3", { waitUntil: "networkidle" });
  const blocks = page.locator(".lesson-content .katex-display");
  await expect(blocks.first()).toBeVisible();
  expect(await blocks.count()).toBeGreaterThanOrEqual(4);
  await expect(page.locator(".lesson-content .katex-display .mfrac").first()).toBeVisible();
  await expect(page.locator(".lesson-content .katex-mathml math").first()).toBeAttached();

  const results = await new AxeBuilder({ page }).include(".lesson-content").analyze();
  const blocking = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
});

// 320px is the WCAG reflow width the accessibility suite already uses. Before
// the fix, d2's display formula (345px) pushed the page 49px sideways there.
test("long formulas scroll inside their block on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/lesson/3", { waitUntil: "networkidle" });
  await expect(page.locator(".lesson-content .katex-display").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0);
});

test("a session step shows its formula typeset", async ({ page }) => {
  await page.goto("/learn/inv-5.3", { waitUntil: "networkidle" });
  await expect(page.locator(".katex-display")).toBeVisible();
  await expect(page.locator(".katex-display .mfrac")).toBeVisible();
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx playwright test tests/math.spec.ts --reporter=list`
Expected: all three FAIL. No `.katex-display` exists yet, because lesson 3 and session inv-5.3 don't use TeX until Tasks 4 and 5.

- [ ] **Step 3: Commit**

```bash
git add tests/math.spec.ts
git commit -m "test: lesson 3 and session formulas are typeset"
```

---

### Task 4: Convert lesson 3

**Files:**
- Modify: `src/lib/lessons.ts` (lesson `id: "3"`; its `content:` starts near line 327)

- [ ] **Step 1: Make the content a raw string**

In the lesson with `id: "3"`, change its `content: \`` to `content: String.raw\``.

This keeps TeX backslashes verbatim (in a normal template literal, `\f` in `\frac` is a form feed). It's safe for this lesson: `grep -c '\\' src/lib/lessons.ts` is 1 for the whole file, in lesson 7's exercise prompt, and lesson 3 has no `${`.

- [ ] **Step 2: Replace the formula block**

Replace:
```html
<p>Take the expected value of max(S<sub>T</sub> − K, 0) under that log-normal distribution, discount it, and out comes the formula everyone knows:</p>
<blockquote>
  <strong>C = S · N(d₁) − K · e<sup>−rT</sup> · N(d₂)</strong><br/>
  <strong>P = K · e<sup>−rT</sup> · N(−d₂) − S · N(−d₁)</strong>
</blockquote>
<p>where:</p>
<ul>
  <li>d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)</li>
  <li>d₂ = d₁ − σ·√T = [ln(S/K) + (r − σ²/2)·T] / (σ·√T)</li>
  <li>N(·) is the standard normal CDF — the probability a standard normal variable falls below a given value</li>
</ul>
```
with:
```html
<p>Take the expected value of <span class="tex">\max(S_T - K,\, 0)</span> under that log-normal distribution, discount it, and out comes the formula everyone knows:</p>
<div class="tex-block">C = S\,N(d_1) - K e^{-rT} N(d_2)</div>
<div class="tex-block">P = K e^{-rT} N(-d_2) - S\,N(-d_1)</div>
<p>where:</p>
<div class="tex-block">d_1 = \frac{\ln(S/K) + \left(r + \tfrac{\sigma^2}{2}\right)T}{\sigma\sqrt{T}}</div>
<div class="tex-block">d_2 = d_1 - \sigma\sqrt{T} = \frac{\ln(S/K) + \left(r - \tfrac{\sigma^2}{2}\right)T}{\sigma\sqrt{T}}</div>
<p><span class="tex">N(\cdot)</span> is the standard normal CDF — the probability a standard normal variable falls below a given value.</p>
```

- [ ] **Step 3: Run the unit tests**

Run: `npx vitest run src/lib/math/renderMath.test.ts`
Expected: PASS. Lesson 3's TeX typesets, and no heading contains maths.

- [ ] **Step 4: Check the page**

Run: `npx playwright test tests/math.spec.ts -g "lesson 3|phone" --reporter=list`
Expected: 2 passed.

Then open `/lesson/3` at 320px, 375px and 1366px:
- d₁ shows as a fraction;
- the display formulas sit centred in the reading column;
- nothing scrolls sideways at 320px or 375px (a display formula wider than the column scrolls inside its own block).

- [ ] **Step 5: Commit**

```bash
git add src/lib/lessons.ts
git commit -m "feat: lesson 3 formulas as typeset maths"
```

---

### Task 5: Typeset formulas in session steps (BV-P4)

**Files:**
- Modify: `src/lib/sessions/types.ts` (`ExplainStep`)
- Modify: `src/app/learn/[sessionId]/page.tsx`
- Modify: `src/app/learn/[sessionId]/SessionPlayer.tsx` (`Props`, the `formula` paragraph)
- Modify: `src/lib/sessions/content/inv5.ts` (`inv-5.3.trap`)
- Modify: `src/lib/sessions/content.test.ts`

- [ ] **Step 1: Add the field**

In `src/lib/sessions/types.ts`, inside `ExplainStep`, after `formula?: string;`, add:
```ts
  /** The same formula as TeX, typeset on the server. Use this or `formula`, not both. */
  formulaTex?: string;
```

- [ ] **Step 2: Lint it (failing first)**

In `src/lib/sessions/content.test.ts`, add the import at the top:
```ts
import { renderTex } from "@/lib/math/renderMath";
```
In the explain branch of the "is well-formed" test, replace:
```ts
          if (step.kind === "explain") {
            for (const paragraph of step.body) expect(wordCount(paragraph)).toBeLessThanOrEqual(50);
```
with:
```ts
          if (step.kind === "explain") {
            for (const paragraph of step.body) expect(wordCount(paragraph)).toBeLessThanOrEqual(50);
            expect(step.formula && step.formulaTex, "use formula or formulaTex, not both").toBeFalsy();
            if (step.formulaTex) expect(() => renderTex(step.formulaTex!, true)).not.toThrow();
```
Run: `npx vitest run src/lib/sessions/content.test.ts`
Expected: PASS (no step uses `formulaTex` yet).

- [ ] **Step 3: Convert the Sharpe ratio**

In `src/lib/sessions/content/inv5.ts`, in step `inv-5.3.trap`, replace:
```ts
        formula: "Sharpe = (Rₚ − R_risk-free) ÷ σₚ",
```
with:
```ts
        formulaTex: String.raw`\text{Sharpe} = \frac{R_p - R_f}{\sigma_p}`,
```
Then extend the second paragraph of that step's `body` so the symbols are named. Replace:
```ts
          "The **Sharpe ratio** compares funds fairly by asking how much extra return each unit of risk bought.",
```
with:
```ts
          "The **Sharpe ratio** compares funds fairly by asking how much extra return each unit of risk bought: return minus the risk-free rate, divided by volatility.",
```
Run: `npx vitest run src/lib/sessions/content.test.ts`
Expected: PASS. The paragraph stays under the 50-word limit, and the TeX renders.

- [ ] **Step 4: Pre-render on the server**

In `src/app/learn/[sessionId]/page.tsx`, add the imports:
```tsx
import "katex/dist/katex.min.css";
import { renderTex } from "@/lib/math/renderMath";
```
Before the `return`, add:
```tsx
  // Formulas are typeset here, on the server, so KaTeX stays out of the
  // client bundle; the player just places the HTML.
  const formulaHtml = Object.fromEntries(
    session.steps.flatMap((step) =>
      step.kind === "explain" && step.formulaTex ? [[step.id, renderTex(step.formulaTex, true)] as const] : []
    )
  );
```
and pass it to the player:
```tsx
    <SessionPlayer
      key={session.id}
      session={session}
      lessonTitle={ctx.lesson.title}
      sessionIds={lessonSessions.map((s) => s.id)}
      nextSessionId={getNextSession(session.id)?.id ?? null}
      formulaHtml={formulaHtml}
    />
```

- [ ] **Step 5: Show it in the player**

In `src/app/learn/[sessionId]/SessionPlayer.tsx`, add the prop to `Props`:
```ts
  /** Server-typeset formulas, keyed by step id. */
  formulaHtml: Record<string, string>;
```
Destructure it in the component signature:
```tsx
export default function SessionPlayer({ session, lessonTitle, sessionIds, nextSessionId, formulaHtml }: Props) {
```
Replace:
```tsx
              {step.formula ? <p className={styles.formula}>{step.formula}</p> : null}
```
with:
```tsx
              {formulaHtml[step.id] ? (
                <div className={styles.formulaMath} dangerouslySetInnerHTML={{ __html: formulaHtml[step.id] }} />
              ) : step.formula ? (
                <p className={styles.formula}>{step.formula}</p>
              ) : null}
```
In `src/app/learn/[sessionId]/session.module.css`, after the `.formula` rule, add:
```css
/* Typeset maths: same panel as .formula, but KaTeX sets its own font. */
.formulaMath { margin: 1rem 0 0; padding: 0.75rem 1rem; overflow-x: auto; border: 1px solid color-mix(in srgb, var(--sl-brand) 30%, transparent); border-radius: var(--sl-radius-md); background: var(--sl-brand-soft); color: var(--sl-brand-strong); }
.formulaMath :global(.katex-display) { margin: 0; }
```

- [ ] **Step 6: Run the tests**

```bash
npx tsc --noEmit -p .
npx vitest run src/lib/sessions src/lib/math
npx playwright test tests/math.spec.ts tests/session.spec.ts --reporter=list
```
Expected: all PASS. The existing session journey still passes because inv-1.1 has no `formulaTex`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sessions src/app/learn
git commit -m "feat: typeset formulas in session steps; Sharpe ratio first"
```

---

### Task 6: Measure, then the PR

Don't add `/lesson/3` to `lighthouserc.json` in this plan. The page downloads the Python runtime (5.8 MB) as soon as it opens, which alone breaks the 900 KB budget. Roadmap item BV-X6 fixes that and adds the URL.

- [ ] **Step 1: Measure the maths cost**

With a production build running on port 3100:
```bash
npx lighthouse http://localhost:3100/lesson/3 --only-categories=performance --output=json --output-path=/tmp/lesson3.json --quiet --chrome-flags="--headless=new"
node -e 'const r=require("/tmp/lesson3.json"); for (const i of r.audits["network-requests"].details.items.filter(i=>/KaTeX/.test(i.url))) console.log(i.transferSize, i.url.split("/").pop())'
```
Expected (measured on a trial build, 2026-10-02), about 49 KB of maths fonts:
```
26740 KaTeX_Main-Regular....woff2
16908 KaTeX_Math-Italic....woff2
5675 KaTeX_Size2-Regular....woff2
```
Also expected: CLS 0.

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
- the KaTeX fonts appear only on `/lesson/3` and `/learn/inv-5.3`, not on `/`.

If `tests/fonts.spec.ts` (from the type-foundation plan) exists, it already allows `KaTeX_*`.

- [ ] **Step 3: Open the PR**

In the PR description, include:
- before and after screenshots of `/lesson/3` at 375px and 1366px, showing the formula block;
- the maths font bytes from Step 1;
- the convention for the next lessons: TeX in `<span class="tex">` and `<div class="tex-block">`, content as `String.raw`, no maths in `<h2>`.
