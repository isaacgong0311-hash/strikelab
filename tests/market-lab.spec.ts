import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("a student predicts, experiments, explains, and saves a mission", async ({ page }) => {
  await page.goto("/lab");
  await expect(page.getByRole("button", { name: "Make my prediction" })).toBeDisabled();
  await page.getByRole("radio", { name: "It rises" }).check();
  await page.getByRole("button", { name: "Make my prediction" }).click();
  const volatility = page.getByRole("slider", { name: "Annual volatility" });
  await volatility.fill("40");
  await expect(page.getByRole("slider", { name: "Stock price" })).toBeDisabled();
  await page.getByRole("button", { name: "Test my scenario" }).click();
  await expect(page.getByRole("heading", { name: /Why can more uncertainty/ })).toBeVisible();
  await page.getByRole("radio", { name: /A wider range of outcomes/ }).check();
  await page.getByRole("button", { name: "Finish mission" }).click();
  await expect(page.getByText("1 of 3 missions completed")).toBeVisible();
  await page.getByRole("button", { name: "Save experiment", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your lab notebook" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 of 3 missions completed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore", exact: true })).toBeVisible();
});

test("the learning hub searches, filters, and keeps the existing lesson destinations", async ({ page }) => {
  await page.goto("/lessons");
  await page.getByRole("searchbox", { name: "Search lessons" }).fill("Black-Scholes");
  await expect(page.getByRole("link", { name: /Black-Scholes Formula, available/ })).toHaveAttribute("href", "/lesson/3");
  await page.getByRole("searchbox", { name: "Search lessons" }).fill("no-such-concept");
  await expect(page.getByRole("heading", { name: "No matching lessons." })).toBeVisible();
  await page.getByRole("button", { name: "Show all lessons" }).click();
  await expect(page.getByRole("link", { name: /What Is a Stock\?, available/ })).toHaveAttribute("href", "/learn/inv-1.1");
});

test("the lab remains usable on mobile and exposes an accessible data alternative", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab?mission=free");
  await expect(page.getByRole("slider", { name: "Stock price" })).toBeEnabled();
  await page.getByRole("combobox", { name: "Option type" }).selectOption("put");
  await page.getByText("View chart data", { exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(result.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
