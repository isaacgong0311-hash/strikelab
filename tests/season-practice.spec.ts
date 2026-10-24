import { expect, test } from "@playwright/test";

test("a signed-out visitor can run a real practice challenge without earning an official score", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Try a coding challenge" }).click();
  await expect(page).toHaveURL(/\/seasons\/practice/);
  await expect(page.getByRole("heading", { name: "Can you price a put from a call?" })).toBeVisible();
  await expect(page.getByText(/no timer, official score, leaderboard rank, or saved submission/i)).toBeVisible();

  await page.getByRole("button", { name: "Run local checks" }).click();
  await expect(page.getByText("Not yet")).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("Your code ran")).toHaveCount(0);

  const editor = page.getByRole("textbox", { name: "Python solution for put-call parity" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("from math import exp\ndef put_from_parity(call, S, K, T, r):\n    return call - S + K * exp(-r * T)\n");
  await page.getByRole("button", { name: "Run local checks" }).click();
  await expect(page.getByText("Your code ran")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Local checks passed/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit|official score/i })).toHaveCount(0);
});
