import { expect, test } from "@playwright/test";
import { getAllLessons } from "../src/lib/tracks";

const lessons = getAllLessons();

test.describe("all 23 published lessons", () => {
  for (const lesson of lessons) {
    test(`${lesson.id} opens with its lesson content`, async ({ page }) => {
      const response = await page.goto(`/lesson/${lesson.id}`, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText(lesson.title).first()).toBeVisible();
    });
  }
});
