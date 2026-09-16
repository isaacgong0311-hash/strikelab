import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../../styles/tokens.css", import.meta.url), "utf8");

function token(name: string): string {
  const value = css.match(new RegExp(`--sl-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!value) throw new Error(`Missing color token --sl-${name}`);
  return value;
}

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((part) => parseInt(part, 16) / 255) ?? [];
  const [red, green, blue] = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("UI color tokens", () => {
  it.each([
    ["text", "surface"],
    ["text-muted", "surface"],
    ["text-subtle", "canvas-subtle"],
    ["brand", "brand-soft"],
    ["info", "info-soft"],
    ["warning", "warning-soft"],
    ["danger", "danger-soft"],
  ])("keeps --sl-%s readable on --sl-%s", (foreground, background) => {
    expect(contrast(token(foreground), token(background))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["brand", "info", "warning", "danger"])(
    "keeps white action text readable on --sl-%s",
    (background) => {
      expect(contrast("#ffffff", token(background))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("keeps strong component boundaries visible on white", () => {
    expect(contrast(token("border-strong"), token("surface"))).toBeGreaterThanOrEqual(3);
  });
});
