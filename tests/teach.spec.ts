import { expect, test } from "@playwright/test";

test("the pilot page's setup button starts class setup", async ({ page }) => {
  await page.goto("/pilot");
  await expect(page.getByRole("link", { name: "Set it up now" }).first()).toHaveAttribute("href", "/teach/new?src=pilot");
});

test("leaders arriving from setup get the leader sign-up with their role preselected", async ({ page }) => {
  await page.goto("/sign-up?next=%2Fteach%2Fnew");
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await expect(page.getByRole("heading", { level: 1, name: "Create your leader account" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "A club leader or teacher" })).toBeChecked();
  await expect(page.locator("#main-content").getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/sign-in?next=%2Fteach%2Fnew");
});

test("a plain sign-up asks which kind of account it is", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await expect(page.getByRole("radio", { name: "A student" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "A club leader or teacher" })).not.toBeChecked();
  await page.getByRole("radio", { name: "A club leader or teacher" }).check();
  // A new leader with no destination lands in class setup after signing up.
  await expect(page.locator("#main-content").getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute("href", "/sign-in?next=%2Fteach%2Fnew");
});
