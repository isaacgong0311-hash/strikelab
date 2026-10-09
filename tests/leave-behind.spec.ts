import { expect, test } from "@playwright/test";

// The handout a founder leaves after an in-person ask. It has to be one page, and
// its QR code has to be in the HTML (it is printed, so no JavaScript can be
// relied on), and it has to stay out of search results.
test("the leave-behind is a noindex page with a QR and the short link", async ({ page }) => {
  await page.goto("/pilot/leave-behind");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("six-week finance-and-code lab");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const qr = page.getByRole("img", { name: /QR code for strikelab\.dev\/pilot/ });
  await expect(qr.locator("svg")).toBeVisible();
  await expect(page.getByText("strikelab.dev/pilot", { exact: true }).first()).toBeVisible();
  // All six weeks, from the same data as /pilot, so the handout can't drift from the page it points at.
  await expect(page.locator("ol li")).toHaveCount(6);
});

test("it prints on exactly one Letter page, with its content visible", async ({ page }) => {
  // Letter at 96 dpi. The first version of the print rules produced one page that
  // was blank (a specificity slip hid the sheet), which a page count alone passes.
  await page.setViewportSize({ width: 816, height: 1056 });
  await page.goto("/pilot/leave-behind");
  await page.emulateMedia({ media: "print" });

  const visible = await page.evaluate(() => {
    const sheet = document.querySelector("article")!;
    const shown = (el: Element) => getComputedStyle(el).visibility === "visible";
    const box = sheet.getBoundingClientRect();
    return {
      sheet: shown(sheet),
      heading: shown(sheet.querySelector("h1")!),
      qr: shown(sheet.querySelector("svg")!),
      siteHeader: shown(document.querySelector("header.site-header") ?? document.body.firstElementChild!),
      bottom: Math.round(box.bottom),
      width: Math.round(box.width),
    };
  });
  expect(visible.sheet && visible.heading && visible.qr, "the sheet is hidden in print").toBe(true);
  expect(visible.bottom, "the sheet runs past the bottom of a Letter page").toBeLessThanOrEqual(1056);
  expect(visible.width).toBeLessThanOrEqual(816);

  const pdf = await page.pdf({ format: "Letter", printBackground: true });
  const pages = pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;
  expect(pages, "the handout spills onto a second page").toBe(1);
});

test("the QR code is in the server HTML, so it prints with JavaScript off", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/pilot/leave-behind");
  await expect(page.getByRole("img", { name: /QR code/ }).locator("svg")).toBeVisible();
  await context.close();
});

test("on a phone the sheet reads as a page, not a clipped letter", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/pilot/leave-behind");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0);
});
