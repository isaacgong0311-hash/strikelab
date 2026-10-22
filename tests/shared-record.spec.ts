import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const token = "77777777-7777-4777-8777-777777777777";
const fixture = Boolean(process.env.RECORD_E2E);

test("the OG image renders a generic card without a database", async ({ request }) => {
  const response = await request.get(`/r/${token}/opengraph-image`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).length).toBeGreaterThan(1000);
});

test.describe("shared record with seeded HTTP data", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 RECORD_E2E=1");

  test("a student can share, view, and revoke a handle-only record", async ({ browser }) => {
    const owner = await browser.newContext();
    const ownerPage = await owner.newPage();
    const session = {
      access_token: "student-token", refresh_token: "student-token-refresh", token_type: "bearer",
      expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "student@example.test", app_metadata: {}, user_metadata: {} },
    };
    await owner.addCookies([{ name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: "http://localhost:3113" }]);
    await ownerPage.goto("/record");
    await ownerPage.getByRole("button", { name: "Create share link" }).click();
    await expect(ownerPage.getByLabel("Your share link")).toHaveValue(`/r/${token}`);

    const visitor = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await visitor.newPage();
    const response = await page.goto(`/r/${token}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "@student_one" })).toBeVisible();
    await expect(page.getByText("#1", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Verified capstone", { exact: true })).toBeVisible();
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("nofollow");
    expect(await page.locator("body").innerText()).not.toMatch(/student@example\.test|Example Student|55555555-5555/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
    if (process.env.RECORD_SCREENSHOTS) {
      mkdirSync("docs/pr-screenshots/T2.3", { recursive: true });
      await page.addStyleTag({ content: "nextjs-portal, .sl-skip-link { display: none !important; }" });
      for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.screenshot({ path: `docs/pr-screenshots/T2.3/shared-example-${width}.png`, fullPage: true });
      }
      const image = await page.request.get(`/r/${token}/opengraph-image`);
      expect(image.status()).toBe(200);
      writeFileSync("docs/pr-screenshots/T2.3/shared-og-example.png", await image.body());
    }
    const noScript = await browser.newContext({ javaScriptEnabled: false });
    const noScriptPage = await noScript.newPage();
    await noScriptPage.goto(`/r/${token}`);
    await expect(noScriptPage.getByRole("heading", { level: 1, name: "@student_one" })).toBeVisible();
    await noScript.close();

    await ownerPage.getByRole("button", { name: "Revoke link" }).click();
    await expect(ownerPage.getByRole("button", { name: "Create share link" })).toBeVisible();
    const revoked = await page.goto(`/r/${token}`);
    expect(revoked?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "@student_one" })).toHaveCount(0);
    const unknown = await page.goto("/r/88888888-8888-4888-8888-888888888888");
    expect(unknown?.status()).toBe(404);
    await visitor.close();
    await owner.close();
  });
});
