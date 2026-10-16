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

// The leader sees what they get before being asked for an account (build plan T5.2).
test("the pilot page previews the scorecard and the invite message, labelled as example data", async ({ page }) => {
  await page.goto("/pilot");
  const preview = page.getByRole("region", { name: /What you.ll see/ });
  await expect(preview.getByText(/Example data from a pretend club/)).toBeVisible();
  await expect(preview.getByText(/students joined/)).toBeVisible();
  await expect(preview.getByText(/strikelab\.dev\/join\/ABC234/)).toBeVisible();
  // Still no account needed to look.
  await expect(page).toHaveURL(/\/pilot$/);
});

test("the homepage gives leaders the same weight as students and doesn't promise zero prep", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Start a free pilot" }).first()).toBeVisible();
  await expect(page.getByText(/No prep\./)).toHaveCount(0);
  await expect(page.getByText(/Zero prep/)).toHaveCount(0);
  // The club section now comes before the Greeks tour.
  const clubs = await page.locator("#home-clubs").boundingBox();
  const greeks = await page.locator("#home-greeks").boundingBox();
  expect(clubs && greeks && clubs.y < greeks.y).toBe(true);
});
