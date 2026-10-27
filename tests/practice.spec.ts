import { expect, test } from "@playwright/test";
import { LESSONS } from "../src/lib/lessons";

// AI practice problems run in the same worker Python as the lesson. Every run
// is async; when they weren't awaited, a wrong answer still said "All tests
// passed!". The generator is stubbed so this needs no AI key.

test.setTimeout(120_000);

const PROBLEM = {
  title: "Double it",
  prompt: "Write double(x) that returns twice x.",
  starterCode: "def double(x):\n    return x\n",
  testCode: "assert double(2) == 4, 'double(2) should be 4'\nprint('Tests passed!')",
  solution: "def double(x):\n    return 2 * x\n",
};

test("a practice problem fails wrong code and passes right code", async ({ page }) => {
  await page.route("**/api/ai/practice", (route) => route.fulfill({ json: { problem: PROBLEM } }));
  await page.goto("/lesson/1", { waitUntil: "domcontentloaded" });

  // Practice is offered once the lesson's own exercise passes.
  const lessonEditor = page.locator(".cm-content").first();
  await lessonEditor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(LESSONS.find((l) => l.id === "1")!.exercise.solution);
  await page.getByRole("button", { name: /Run Tests/ }).click();
  await expect(page.getByText("Tests passed", { exact: true })).toBeVisible({ timeout: 60_000 });
  await page.keyboard.press("Escape"); // the first-completion celebration, if it opened

  await page.getByRole("button", { name: "New practice problem" }).click();
  await expect(page.getByText(PROBLEM.prompt)).toBeVisible();

  // Starter code is wrong: the assertion must surface.
  const practiceOutput = page.locator(".pr-output");
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(practiceOutput).toContainText(/double\(2\) should be 4/, { timeout: 30_000 });
  await expect(practiceOutput).not.toContainText("All tests passed!");

  const practiceEditor = page.getByRole("textbox", { name: `${PROBLEM.title} Python editor` });
  await practiceEditor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(PROBLEM.solution);
  await page.getByRole("button", { name: "Run tests", exact: true }).click();
  await expect(practiceOutput).toHaveText("All tests passed!", { timeout: 30_000 });
});
