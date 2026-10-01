import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProofStrip from "./ProofStrip";

const entry = { id: "a", value: "62%", label: "finished the first lesson", sourceLabel: "Fall 2026 pilot", sourcePath: "x", asOf: "2026-12-20", consent: true };

describe("ProofStrip", () => {
  it("renders nothing when there is no proof (the site never shows a placeholder)", () => {
    expect(renderToStaticMarkup(createElement(ProofStrip, { entries: [] }))).toBe("");
    expect(renderToStaticMarkup(createElement(ProofStrip))).toBe("");
  });

  it("shows value, label and source line", () => {
    const html = renderToStaticMarkup(createElement(ProofStrip, { entries: [entry] }));
    expect(html).toContain("62%");
    expect(html).toContain("Fall 2026 pilot, as of 2026-12-20");
  });

  it("never shows an entry without consent", () => {
    expect(renderToStaticMarkup(createElement(ProofStrip, { entries: [{ ...entry, consent: false }] }))).toBe("");
  });
});
