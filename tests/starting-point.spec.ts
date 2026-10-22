import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("starting-point feedback, recommendation and retry work without an account", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("button", { name: "Check answer" })).toBeDisabled();
  await page.getByRole("button", { name: "I'm not sure" }).click();
  await expect(page.getByText("Here's the idea.")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: /Two stocks/ })).toBeFocused();
  for (const option of ["No, shared risks can still affect both", "$15", "It uses information unavailable at the time"]) {
    await page.getByRole("radio", { name: option, exact: true }).check();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: /Next question|See my next step/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Your next step" })).toBeFocused();
  await expect(page.getByText("You answered 3 of 4 correctly.", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start with stock ownership/ })).toHaveAttribute("href", "/learn/inv-1.1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: /You own 10/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check answer" })).toBeDisabled();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("all correct answers recommend the existing model-building lesson", async ({ page }) => {
  await page.goto("/start");
  for (const option of ["1%", "No, shared risks can still affect both", "$15", "It uses information unavailable at the time"]) {
    await page.getByRole("radio", { name: option, exact: true }).check();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: /Next question|See my next step/ }).click();
  }
  await page.getByRole("link", { name: /Build a Black-Scholes/ }).click();
  await expect(page).toHaveURL(/\/lesson\/3$/);
});

test("a completed check persists only its destination and can be resumed or cleared", async ({ page }) => {
  await page.goto("/start");
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "I'm not sure" }).click();
    await page.getByRole("button", { name: /Next question|See my next step/ }).click();
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("strikelab:next-step:v1") ?? "null")))
    .toEqual({ version: 1, href: "/learn/inv-1.1" });
  await page.goto("/");
  const saved = page.getByRole("complementary", { name: "Your saved next step" });
  await expect(saved.getByRole("link", { name: "Continue learning" })).toHaveAttribute("href", "/learn/inv-1.1");
  await page.reload();
  await expect(saved).toBeVisible();
  await saved.getByRole("button", { name: "Clear saved step" }).click();
  await expect(saved).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("strikelab:next-step:v1"))).toBeNull();
});

test("the check still finishes if recommendation storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "strikelab:next-step:v1") throw new DOMException("Storage blocked", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.goto("/start");
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "I'm not sure" }).click();
    await page.getByRole("button", { name: /Next question|See my next step/ }).click();
  }
  await expect(page.getByRole("link", { name: /Start with stock ownership/ })).toHaveAttribute("href", "/learn/inv-1.1");
});

test("demo aggregate export is marked as sample data and omits the roster", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "Student progress" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Student progress table" })).toContainText("Maya R.");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export aggregate summary" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^sample-strikelab-pilot-summary-/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString("utf8");
  expect(csv).toContain("SAMPLE DATA");
  expect(csv).toContain("Week-4 retained");
  expect(csv).not.toContain("Maya R.");
  expect(csv).not.toContain("Jonah K.");
});
