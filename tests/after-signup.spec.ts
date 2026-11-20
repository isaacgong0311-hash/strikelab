import { expect, test } from "@playwright/test";

// What a visitor sees on the sign-up page depends on where they came from.
test("arriving from the season page, sign-up says it is for Season 1 and expects a student", async ({ page }) => {
  await page.goto("/sign-up?next=%2Fseasons");
  await expect(page.getByRole("heading", { level: 1, name: "Join Season 1" })).toBeVisible();
  await expect(page.getByText(/pick a leaderboard handle/)).toBeVisible();
  await expect(page.getByRole("radio", { name: "A student" })).toBeChecked();
  // Anyone can still change it.
  await page.getByRole("radio", { name: "A club leader or teacher" }).check();
  await expect(page.getByRole("radio", { name: "A club leader or teacher" })).toBeChecked();
});

test("a plain sign-up is unchanged and leaves the account type to the visitor", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.getByRole("heading", { level: 1, name: "Start learning free" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "A student" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "A club leader or teacher" })).not.toBeChecked();
});

test("the season page's sign-up button carries the visitor into the season flow", async ({ page }) => {
  await page.goto("/seasons");
  const join = page.getByRole("main").getByRole("link", { name: "Create a free account to play" });
  await expect(join).toHaveAttribute("href", "/sign-up?next=%2Fseasons");
});
