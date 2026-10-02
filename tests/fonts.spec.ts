import { expect, test, type Page } from "@playwright/test";

// Every glyph on StrikeLab's core screens should be drawn by a font we ship.
// When one isn't, the browser silently borrows a system font: σ and → in
// Times, the code editor in whatever monospace the device has. This asks
// DevTools which fonts actually painted each piece of text.

// Self-hosted files report their internal names ("Inter Variable",
// "JetBrains Mono"), Google's copy of Inter reports "Inter", Jakarta comes
// from Google Fonts, and KaTeX's fonts join once maths typesetting lands.
const DESIGNED = /^(Inter( Variable)?|JetBrains Mono|Plus Jakarta Sans|KaTeX_.*)$/;
// Symbols none of our fonts carry, so the system drawing them is expected.
const NO_FONT_HAS = /[✕◌✦◉∓≡ᵀ⊞⟲✶⏱∄⚠]|\p{Emoji_Presentation}/u;
const ROUTES = ["/", "/lessons", "/lesson/3", "/learn/inv-1.1", "/playground", "/demo"];

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await page.evaluate(() => document.fonts.ready);
}

/** Each element that directly holds text, with the fonts that painted it. */
async function paintedText(page: Page): Promise<{ text: string; fonts: string[] }[]> {
  const texts = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("script, style, noscript, svg")) continue;
      const own = [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim();
      if (!own) continue;
      el.setAttribute("data-font-check", String(out.length));
      out.push(own);
    }
    return out;
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-font-check]" });
  const painted: { text: string; fonts: string[] }[] = [];
  for (const nodeId of nodeIds) {
    const { attributes } = await cdp.send("DOM.getAttributes", { nodeId });
    const index = Number(attributes[attributes.indexOf("data-font-check") + 1]);
    const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    painted.push({ text: texts[index], fonts: fonts.map((f) => f.familyName) });
  }
  await cdp.detach();
  return painted;
}

for (const route of ROUTES) {
  test(`${route} draws its text with StrikeLab's fonts`, async ({ page }) => {
    await open(page, route);
    const strays = (await paintedText(page))
      .filter(({ text, fonts }) => fonts.some((f) => !DESIGNED.test(f)) && !NO_FONT_HAS.test(text))
      .map(({ text, fonts }) => `"${text.slice(0, 40)}" -> ${fonts.join(", ")}`);
    expect(strays, strays.join("\n")).toEqual([]);
  });
}

test("the code editor is set in the code font", async ({ page }) => {
  await open(page, "/playground");
  await expect(page.locator(".cm-scroller").first()).toHaveCSS("font-family", /jetbrains/i);
});

test("the homepage loads at most three font files, 100 KB in all", async ({ page }) => {
  const sizes: Promise<number>[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") sizes.push(response.body().then((b) => b.length));
  });
  await open(page, "/");
  const bytes = await Promise.all(sizes);
  expect(bytes.length).toBeLessThanOrEqual(3);
  expect(bytes.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(100_000);
});
