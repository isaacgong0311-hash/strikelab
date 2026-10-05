import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The browser's validation bubble is unstyled, covers the field it points at
// and shows one problem at a time (on a phone it sat on top of the first radio
// button). The forms now show every problem beside its field, announced, and
// move focus to the first one.
test.use({ viewport: { width: 375, height: 812 } });

async function open(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
}

test("sign-up shows every problem at once, beside its field, and focuses the first", async ({ page }) => {
  await open(page, "/sign-up");
  await page.getByRole("button", { name: /Create free account/ }).click();

  await expect(page.getByText("Choose whether you're a student or a club leader or teacher.")).toBeVisible();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Enter your email address.")).toBeVisible();
  await expect(page.getByText("Use at least 8 characters.").nth(1)).toBeVisible(); // the hint is the first
  await expect(page.getByRole("radio", { name: "A student" })).toBeFocused();
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");

  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking, blocking.map((v) => v.id).join(", ")).toEqual([]);
});

test("a problem clears as soon as the student starts fixing it", async ({ page }) => {
  await open(page, "/sign-up");
  await page.getByRole("button", { name: /Create free account/ }).click();
  await page.getByRole("radio", { name: "A student" }).check();
  await expect(page.getByText("Choose whether you're a student")).toHaveCount(0);
  await page.getByLabel("Your name").fill("Alex P.");
  await expect(page.getByText("Enter your name.")).toHaveCount(0);
  await page.getByLabel("Email").fill("nope");
  await page.getByLabel("Password").fill("12345678");
  await page.getByRole("button", { name: /Create free account/ }).click();
  await expect(page.getByText(/doesn't look like an email address/)).toBeVisible();
  await expect(page.getByLabel("Email")).toBeFocused();
});

test("sign-in explains a missing email or password inline", async ({ page }) => {
  await open(page, "/sign-in");
  await page.getByRole("button", { name: /^Sign in/ }).click();
  await expect(page.getByText("Enter your email address.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeFocused();
});
