import { expect, test, type Page } from "@playwright/test";

// Frontend master plan, Phase A: what students and visitors see in their
// first minutes (FW-3, FW-4, FW-24, FW-25).

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
}

test.describe("focused lesson player", () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test("hides the site header and footer and keeps its own bar", async ({ page }) => {
    await open(page, "/learn/inv-1.1");
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);

    const exit = page.getByRole("link", { name: "Exit session and return to your path" });
    await expect(exit).toHaveAttribute("href", "/lessons");
    await expect(page.getByRole("progressbar", { name: "Session progress" })).toBeVisible();

    // The task starts right under the player's bar, not under 110px of site chrome.
    const bar = await exit.boundingBox();
    expect(bar && bar.y + bar.height).toBeLessThanOrEqual(64);
  });

  test("keeps the accessibility menu reachable by keyboard", async ({ page }) => {
    await open(page, "/learn/inv-1.1");
    const menu = page.locator(".a11y-menu button").first();
    await expect(menu).toBeVisible();
    await menu.focus();
    await expect(menu).toBeFocused();
  });
});

test.describe("dashboard greeting", () => {
  test("a first-time visitor is told where to start, not welcomed back", async ({ page }) => {
    await open(page, "/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: "Start here" })).toBeVisible();
    await expect(page.getByText(/Welcome back/)).toHaveCount(0);
    await expect(page.locator(".db-cta-btn")).toHaveText(/Start lesson 1/);
    await expect(page.locator(".db-cta-btn")).toHaveAttribute("href", "/learn/inv-1.1");
    await expect(page.getByRole("link", { name: "Sign in to sync" })).toBeVisible();
  });

  test("a returning student is welcomed back and resumes the next session", async ({ page }) => {
    const done = { completedAt: "2026-09-30T12:00:00Z", accuracy: 1, durationMs: 60_000 };
    await page.addInitScript((results) => {
      localStorage.setItem("strikelab_sessions_v1", JSON.stringify(results));
    }, { "inv-1.1": done });
    await open(page, "/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: /Welcome back/ })).toBeVisible();
    await expect(page.locator(".db-cta-btn")).toHaveAttribute("href", "/learn/inv-1.2");
  });
});

test.describe("no dead Pro offer", () => {
  test("challenges are free to run and list the real rotation", async ({ page }) => {
    await open(page, "/challenges");
    await expect(page.getByRole("button", { name: /Run Tests/ })).toBeEnabled();
    await expect(page.getByText(/Unlock with Pro|free trial|Upgrade to compete|Pro members/)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sign in to record your time →" })).toBeVisible();
    await expect(page.locator(".ch-archive li")).toHaveCount(4);
    await expect(page.locator(".ch-archive li[aria-current]")).toHaveCount(1);
  });

  for (const route of ["/", "/lessons", "/pricing", "/dashboard"]) {
    test(`${route} sells nothing students can't buy`, async ({ page }) => {
      await open(page, route);
      await expect(page.getByText(/Unlock with Pro|Start free trial|Upgrade to compete/)).toHaveCount(0);
      await expect(page.locator(".nav-pro-badge")).toHaveCount(0);
    });
  }

  test("the retired roadmap redirects to About", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page).toHaveURL(/\/about$/);
  });
});
