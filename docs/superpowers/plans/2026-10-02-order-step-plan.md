# Order Step Implementation Plan (BV-P1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the session player its first interactive step kind, `order`, where the learner puts shuffled steps (or code lines) in order. It must be fully operable by keyboard and graded by the existing engine, and the first one goes into the Sharpe ratio session.

**Architecture:**
- **Engine** (`src/lib/sessions/engine.ts`): `order` joins the `Step` union. Three pure functions: grade, a deterministic shuffle seeded by the step id (so the server render and the client agree, and it never starts solved), and move.
- **Player:** renders the items as an ordered list with "Move up" / "Move down" buttons. Missed order steps come back through the existing retry queue, like any question.
- **Content lint:** enforces item counts and lengths.

**Tech Stack:** TypeScript, React 19 client component, CSS modules on `--sl-*` tokens, Vitest, Playwright with axe.

**Context:**
- Roadmap: `docs/superpowers/plans/2026-10-02-best-version-roadmap.md`, BV-P1 (decision 4).
- Trigger: the mega plan's W10 check says sessions beat long-form (B2). Otherwise, the winter build.
- Research:
  - Ordering problems (Parsons problems) teach as well as writing code, in less time.
  - Distractors hurt young novices, so this first version has none ([Ericson et al.](https://www.semanticscholar.org/paper/Solving-parsons-problems-versus-fixing-and-writing-Ericson-Margulieux/2f1b7c75a3cc2f33fc34575bbe77eeb1f336debc)).

**Validated before writing** (applied to the 2026-10-02 tree, then reverted):
- `npx tsc --noEmit` and `eslint` clean;
- 97 session unit tests pass;
- all 8 session Playwright tests pass, including the new keyboard journey with an axe scan;
- the step fits a 390px phone with 44px buttons.

---

## File structure

| Path | Change | Responsibility |
|---|---|---|
| `src/lib/sessions/types.ts` | Modify | `OrderStep`, added to `Step` and `QuestionStep` |
| `src/lib/sessions/engine.ts` | Modify | `gradeOrder`, `initialOrder`, `moveItem` |
| `src/lib/sessions/engine.test.ts` | Modify | Unit tests for the three functions and the retry |
| `src/lib/sessions/content.test.ts` | Modify | Content lint for order steps |
| `src/lib/sessions/content/inv5.ts` | Modify | `inv-5.3.sharpe-steps` |
| `src/app/learn/[sessionId]/SessionPlayer.tsx` | Modify | Renders, moves, grades and gives feedback |
| `src/app/learn/[sessionId]/session.module.css` | Modify | List, item, move buttons, right/wrong states |
| `tests/session.spec.ts` | Modify | Keyboard journey with axe |

---

### Task 1: The type

**Files:**
- Modify: `src/lib/sessions/types.ts` (the `Step` and `QuestionStep` aliases at the end)

- [ ] **Step 1: Add `OrderStep`**

Replace:
```ts
export type Step = ExplainStep | McqStep | NumericStep;
export type QuestionStep = McqStep | NumericStep;
```
with:
```ts
export interface OrderStep {
  kind: "order";
  id: string;
  question: string;
  /** In the correct order. The player shows them shuffled. */
  items: string[];
  explanation: string;
  /** Set the items in the code font, for ordering the lines of a program. */
  code?: boolean;
}

export type Step = ExplainStep | McqStep | NumericStep | OrderStep;
export type QuestionStep = McqStep | NumericStep | OrderStep;
```

- [ ] **Step 2: See what breaks**

Run: `npx tsc --noEmit -p .`
Expected: errors in `src/app/learn/[sessionId]/SessionPlayer.tsx`, where `step.unit` doesn't exist on `OrderStep`. Task 4 fixes them; don't commit yet.

---

### Task 2: Engine functions, test first

**Files:**
- Modify: `src/lib/sessions/engine.test.ts`
- Modify: `src/lib/sessions/engine.ts`

- [ ] **Step 1: Write the failing tests**

In `src/lib/sessions/engine.test.ts`, replace the import block:
```ts
import {
  advance,
  firstTryAccuracy,
  gradeMcq,
  gradeNumeric,
  isFinished,
  parseNumberInput,
  progressFraction,
  startRun,
} from "./engine";
import type { Step } from "./types";
```
with:
```ts
import {
  advance,
  firstTryAccuracy,
  gradeMcq,
  gradeNumeric,
  gradeOrder,
  initialOrder,
  isFinished,
  moveItem,
  parseNumberInput,
  progressFraction,
  startRun,
} from "./engine";
import type { OrderStep, Step } from "./types";
```
and append at the end of the file:
```ts
describe("order steps", () => {
  const step: OrderStep = { kind: "order", id: "o", question: "?", items: ["a", "b", "c", "d"], explanation: "a, b, c, d" };

  it("is right only in the authored order", () => {
    expect(gradeOrder(step, [0, 1, 2, 3])).toBe(true);
    expect(gradeOrder(step, [1, 0, 2, 3])).toBe(false);
    expect(gradeOrder(step, [0, 1, 2])).toBe(false);
  });

  it("starts shuffled, the same way every time, and never already solved", () => {
    const first = initialOrder(step);
    expect(initialOrder(step)).toEqual(first);
    expect([...first].sort()).toEqual([0, 1, 2, 3]);
    for (const id of ["o", "a", "b", "c", "inv-5.3.sharpe-steps", "x".repeat(40)]) {
      const s = { ...step, id };
      expect(gradeOrder(s, initialOrder(s)), id).toBe(false);
    }
    const two: OrderStep = { ...step, items: ["first", "second"] };
    expect(initialOrder(two)).toEqual([1, 0]);
  });

  it("moves one item and shifts the rest", () => {
    expect(moveItem([2, 0, 1, 3], 2, 0)).toEqual([1, 2, 0, 3]);
    expect(moveItem([2, 0, 1, 3], 0, 1)).toEqual([0, 2, 1, 3]);
    expect(moveItem([2, 0, 1, 3], 0, -1)).toEqual([2, 0, 1, 3]);
    expect(moveItem([2, 0, 1, 3], 3, 4)).toEqual([2, 0, 1, 3]);
  });

  it("counts as a question in a run, so a miss comes back", () => {
    const run = advance(startRun([step]), [step], false);
    expect(run.queue).toEqual([0, 0]);
    expect(firstTryAccuracy(run, [step])).toBe(0);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/lib/sessions/engine.test.ts`
Expected: FAIL. `gradeOrder`, `initialOrder` and `moveItem` are not exported.

- [ ] **Step 3: Implement**

In `src/lib/sessions/engine.ts`, change the import to:
```ts
import type { NumericStep, McqStep, OrderStep, Step } from "./types";
```
and after `gradeMcq`, add:
```ts
/** `order` is the learner's arrangement: indexes into `step.items`, top to bottom. */
export function gradeOrder(step: OrderStep, order: readonly number[]): boolean {
  return order.length === step.items.length && order.every((item, position) => item === position);
}

/** FNV-1a: a small, stable string hash, so a shuffle is the same on server and client. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The arrangement an order step starts in: shuffled, identical every time for
 * a given step (the server render and the client agree), and never solved.
 */
export function initialOrder(step: OrderStep): number[] {
  const order = step.items.map((_, i) => i);
  let seed = hash(step.id) || 1;
  for (let i = order.length - 1; i > 0; i--) {
    // xorshift32
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (gradeOrder(step, order)) order.push(order.shift()!);
  return order;
}

/** Move the item at `from` to `to`, shifting the rest. Out-of-range moves change nothing. */
export function moveItem(order: readonly number[], from: number, to: number): number[] {
  if (from < 0 || from >= order.length || to < 0 || to >= order.length) return [...order];
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
```
`advance`, `progressFraction` and `firstTryAccuracy` need no change: they already treat every non-`explain` step as a question.

- [ ] **Step 4: Run them**

Run: `npx vitest run src/lib/sessions/engine.test.ts`
Expected: PASS.

---

### Task 3: Content lint and the first order step

**Files:**
- Modify: `src/lib/sessions/content.test.ts` (the "is well-formed" branches)
- Modify: `src/lib/sessions/content/inv5.ts` (after `inv-5.3.sharpe-calc`)

- [ ] **Step 1: Lint order steps**

In `src/lib/sessions/content.test.ts`, replace:
```ts
          } else {
            for (const text of [step.question, step.explanation]) expect(text).not.toContain("**");
            expect(Number.isFinite(step.answer)).toBe(true);
```
with:
```ts
          } else if (step.kind === "order") {
            for (const text of [step.question, step.explanation, ...step.items]) expect(text).not.toContain("**");
            expect(step.items.length).toBeGreaterThanOrEqual(3);
            expect(step.items.length).toBeLessThanOrEqual(6);
            expect(new Set(step.items).size).toBe(step.items.length);
            if (!step.code) for (const item of step.items) expect(wordCount(item)).toBeLessThanOrEqual(14);
            expect(step.explanation.length).toBeGreaterThan(20);
          } else {
            for (const text of [step.question, step.explanation]) expect(text).not.toContain("**");
            expect(Number.isFinite(step.answer)).toBe(true);
```

- [ ] **Step 2: Author the step**

In `src/lib/sessions/content/inv5.ts`, directly after the `inv-5.3.sharpe-calc` step (the one whose explanation is `"(12% − 5%) ÷ 14% = 7 ÷ 14 = 0.5."`), insert:
```ts
      {
        kind: "order",
        id: "inv-5.3.sharpe-steps",
        question: "Put the steps for that Sharpe ratio in order.",
        items: [
          "Start with the portfolio's return: 12%",
          "Subtract the risk-free rate: 12% − 5% = 7%",
          "Divide by volatility: 7% ÷ 14% = 0.5",
          "Compare with the scale: 0.5 is at the weak end",
        ],
        explanation: "Excess return comes first, then you divide by risk. Dividing before subtracting would credit the fund for the 5% any T-bill pays.",
      },
```
The numbers match the step before it (12% return, 5% risk-free, 14% volatility, Sharpe 0.5) and the scale in `inv-5.3.scale` (below 0.5 is weak). The session grows from 7 to 8 steps, within the 15-step limit.

- [ ] **Step 3: Run the content lint**

Run: `npx vitest run src/lib/sessions`
Expected: PASS (97 tests at the time of writing).

---

### Task 4: The player

**Files:**
- Modify: `src/app/learn/[sessionId]/SessionPlayer.tsx`
- Modify: `src/app/learn/[sessionId]/session.module.css`

- [ ] **Step 1: Import the engine functions**

In the engine import, add `gradeOrder`, `initialOrder` and `moveItem`:
```ts
import {
  advance,
  firstTryAccuracy,
  gradeMcq,
  gradeNumeric,
  gradeOrder,
  initialOrder,
  isFinished,
  moveItem,
  progressFraction,
  startRun,
} from "@/lib/sessions/engine";
```

- [ ] **Step 2: Hold the arrangement**

After `const [typed, setTyped] = useState("");`, add:
```ts
  // The learner's arrangement for an order step; null until they move something.
  const [arranged, setArranged] = useState<number[] | null>(null);
  const [moveNote, setMoveNote] = useState("");
```
After `const progress = progressFraction(run, steps);`, add:
```ts
  const order = step?.kind === "order" ? (arranged ?? initialOrder(step)) : null;
```

- [ ] **Step 3: Reset between steps, and move**

Replace `goNext`:
```ts
  function goNext(correct: boolean) {
    setRun((r) => advance(r, steps, correct));
    setPhase("answer");
    setChoice(null);
    setTyped("");
  }
```
with:
```ts
  function goNext(correct: boolean) {
    setRun((r) => advance(r, steps, correct));
    setPhase("answer");
    setChoice(null);
    setTyped("");
    setArranged(null);
    setMoveNote("");
  }

  function moveTo(from: number, to: number) {
    if (step?.kind !== "order" || !order) return;
    const label = step.items[order[from]];
    if (to < 0 || to >= order.length) {
      setMoveNote(`${label} is already ${to < 0 ? "first" : "last"}.`);
      return;
    }
    setArranged(moveItem(order, from, to));
    setMoveNote(`${label}: now ${to + 1} of ${order.length}.`);
  }
```

- [ ] **Step 4: Grade it**

In `onSubmit`, replace:
```ts
    if (step.kind === "mcq") {
      if (choice === null) return;
      correct = gradeMcq(step, choice);
    } else {
```
with:
```ts
    if (step.kind === "mcq") {
      if (choice === null) return;
      correct = gradeMcq(step, choice);
    } else if (step.kind === "order") {
      correct = gradeOrder(step, order ?? []);
    } else {
```
`canCheck` needs no change: an order step can always be checked.

- [ ] **Step 5: Render it**

Between the multiple-choice branch's closing `</fieldset>` and the numeric branch, replace:
```tsx
            </fieldset>
          ) : (
            <div className={styles.numeric}>
```
with:
```tsx
            </fieldset>
          ) : step.kind === "order" ? (
            <div>
              <h1 id={headingId} ref={headingRef} tabIndex={-1} className={styles.question}>
                {step.question}
              </h1>
              <ol className={styles.orderList}>
                {(order ?? []).map((item, position) => {
                  const label = step.items[item];
                  const state = answered ? (item === position ? styles.orderRight : styles.orderWrong) : "";
                  return (
                    <li key={item} className={`${styles.orderItem} ${state}`}>
                      <span className={step.code ? styles.orderCode : styles.orderText}>{label}</span>
                      {/* aria-disabled, not disabled, at the ends: a disabled button drops
                          keyboard focus the moment an item reaches the top. */}
                      <span className={styles.orderMoves}>
                        <button
                          type="button"
                          className={styles.move}
                          onClick={() => moveTo(position, position - 1)}
                          disabled={answered}
                          aria-disabled={position === 0 || undefined}
                          aria-label={`Move up: ${label}`}
                        >
                          <span aria-hidden="true">↑</span>
                        </button>
                        <button
                          type="button"
                          className={styles.move}
                          onClick={() => moveTo(position, position + 1)}
                          disabled={answered}
                          aria-disabled={position === step.items.length - 1 || undefined}
                          aria-label={`Move down: ${label}`}
                        >
                          <span aria-hidden="true">↓</span>
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="sl-visually-hidden" aria-live="polite">
                {moveNote}
              </p>
            </div>
          ) : (
            <div className={styles.numeric}>
```
Branch on `step.kind === "order"` alone, not `step.kind === "order" && order`: the extra condition stops TypeScript narrowing the numeric branch, and `step.unit` errors return.

Items are keyed by item index, so React moves the same button element and keyboard focus follows the item.

The live region is `aria-live` without `role="status"`, so the footer feedback stays the page's only `status`. The existing tests rely on that.

- [ ] **Step 6: Say the right order on a miss**

In the feedback title, replace:
```tsx
                    : step.kind === "mcq"
                      ? `Correct answer: ${step.options[step.correct]}`
                      : `Correct answer: ${step.answer}${step.unit ? ` ${step.unit}` : ""}`}
```
with:
```tsx
                    : step.kind === "mcq"
                      ? `Correct answer: ${step.options[step.correct]}`
                      : step.kind === "order"
                        ? `Correct order: ${step.items.join(" → ")}`
                        : `Correct answer: ${step.answer}${step.unit ? ` ${step.unit}` : ""}`}
```

- [ ] **Step 7: Style it**

Append to `src/app/learn/[sessionId]/session.module.css`:
```css
/* Order steps: a list the learner rearranges with the arrow buttons. */
.orderList { display: grid; gap: 0.625rem; margin: 0; padding: 0; list-style: none; counter-reset: order; }
.orderItem { display: flex; align-items: center; gap: 0.75rem; min-height: var(--sl-tap); padding: 0.5rem 0.5rem 0.5rem 0.75rem; border: 2px solid var(--sl-border); border-radius: var(--sl-radius-md); background: var(--sl-surface); box-shadow: 0 3px 0 var(--sl-border); counter-increment: order; }
.orderItem::before { content: counter(order); flex: none; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border: 2px solid var(--sl-border); border-radius: var(--sl-radius-sm); color: var(--sl-text-muted); font: 700 0.8125rem/1 var(--sl-font-code); }
.orderText { flex: 1; min-width: 0; }
.orderCode { flex: 1; min-width: 0; font: 0.9375rem/1.4 var(--sl-font-code); white-space: pre-wrap; }
.orderMoves { display: flex; gap: 0.375rem; }
.move { display: grid; place-items: center; width: var(--sl-tap); height: var(--sl-tap); border: 1px solid var(--sl-border-strong); border-radius: var(--sl-radius-sm); background: var(--sl-surface-raised); color: var(--sl-text); font-size: 1.125rem; cursor: pointer; }
.move[aria-disabled="true"] { opacity: 0.4; cursor: default; }
.move:disabled { opacity: 0.4; cursor: default; }
.orderRight { border-color: var(--sl-success); background: var(--sl-brand-soft); }
.orderWrong { border-color: var(--sl-danger); background: var(--sl-danger-soft); }
```

- [ ] **Step 8: Typecheck and lint**

```bash
npx tsc --noEmit -p .
npx eslint "src/app/learn/[sessionId]/SessionPlayer.tsx" src/lib/sessions
```
Expected: no output from either.

- [ ] **Step 9: Commit**

```bash
git add src/lib/sessions "src/app/learn/[sessionId]"
git commit -m "feat: order steps in the session player, first one in the Sharpe ratio session"
```

---

### Task 5: Keyboard journey

**Files:**
- Modify: `tests/session.spec.ts` (append)

- [ ] **Step 1: Write the test**

Append:
```ts
test("an order step can be solved with the keyboard", async ({ page }) => {
  await open(page, "/learn/inv-5.3");
  await page.keyboard.press("Enter"); // explain
  await page.getByRole("textbox", { name: /Your answer/ }).fill("0.5");
  await page.keyboard.press("Enter"); // check
  await page.keyboard.press("Enter"); // continue
  await expect(page.getByRole("heading", { level: 1, name: /Sharpe ratio in order/ })).toBeFocused();

  const correct = [
    "Start with the portfolio's return: 12%",
    "Subtract the risk-free rate: 12% − 5% = 7%",
    "Divide by volatility: 7% ÷ 14% = 0.5",
    "Compare with the scale: 0.5 is at the weak end",
  ];
  const items = page.getByRole("list").getByRole("listitem");
  // Walk each item up to its slot with "Move up", one key press at a time.
  for (let target = 0; target < correct.length; target++) {
    for (let guard = 0; guard < correct.length; guard++) {
      const texts = await items.allInnerTexts();
      if (texts.findIndex((t) => t.includes(correct[target])) === target) break;
      await page.getByRole("button", { name: `Move up: ${correct[target]}` }).press("Enter");
    }
  }
  await shot(page, "5-order");
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);

  await page.getByRole("button", { name: "Check" }).press("Enter");
  await expect(page.getByRole("status")).toContainText("Nice!");
});
```
`open`, `shot` and `AxeBuilder` are already defined or imported at the top of this file.

- [ ] **Step 2: Run the session suite**

Run: `npx playwright test tests/session.spec.ts --reporter=list`
Expected: 8 passed.

To see the step, run with `SESSION_SHOTS_DIR=/tmp/shots` and open `/tmp/shots/5-order.png`: four numbered cards with ↑ and ↓ buttons, Check at the bottom.

- [ ] **Step 3: Run everything CI runs**

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```
Expected: all pass.

- [ ] **Step 4: Commit and open the PR**

```bash
git add tests/session.spec.ts
git commit -m "test: solve an order step by keyboard, with axe"
```
In the PR description, include:
- the 390px screenshot;
- a note that `step_answered` analytics now report `kind: "order"`, so the weekly scorecard can compare first-try accuracy by step kind.

---

## After this ships

- **Code lines:** set `code: true` on an order step whose items are lines of a Python function (a Parsons problem). Each line stays under 60 characters, because there's no word limit for code.
- **Next interactive kinds:** BV-P2 (predict, then see) and BV-P3 (manipulate) follow this pattern. Add a union member, pure grading in `engine.ts` with tests, a lint rule, then a player branch with keyboard controls first.
