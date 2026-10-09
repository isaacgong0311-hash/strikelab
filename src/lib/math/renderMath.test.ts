import { describe, expect, it } from "vitest";
import { getAllLessons } from "@/lib/tracks";
import { renderMathInHtml, renderTex } from "./renderMath";

describe("renderMathInHtml", () => {
  it("leaves HTML without maths untouched", () => {
    const html = "<p>No maths here, just S/K and 5%.</p>";
    expect(renderMathInHtml(html)).toBe(html);
  });

  it("typesets inline maths with a MathML twin for screen readers", () => {
    const out = renderMathInHtml('<p>where <span class="tex">d_1</span> is</p>');
    expect(out).toContain('class="katex"');
    expect(out).toContain("<math");
    expect(out).not.toContain('class="tex"');
  });

  it("typesets display maths as a block with a real fraction", () => {
    const out = renderMathInHtml(String.raw`<div class="tex-block">d_1 = \frac{\ln(S/K)}{\sigma\sqrt{T}}</div>`);
    expect(out).toContain('class="katex-display"');
    expect(out).toContain("<mfrac>");
  });

  it("makes display maths a labelled, keyboard-focusable region, since long formulas scroll on a phone", () => {
    const out = renderTex(String.raw`d_1 = \frac{1}{2}`, true);
    expect(out).toMatch(/<span class="katex-display" tabindex="0" role="group" aria-label="[^"]+">/);
  });

  it("leaves inline maths out of the tab order", () => {
    expect(renderTex("d_1", false)).not.toContain("tabindex");
  });

  it("decodes the HTML entities authors need around < and >", () => {
    expect(renderMathInHtml('<span class="tex">S_T &gt; K</span>')).toContain("<mo>&gt;</mo>");
  });

  it("fails loudly on malformed TeX and on input LaTeX can't typeset", () => {
    expect(() => renderTex(String.raw`\frac{1}{`, false)).toThrow();
    expect(() => renderTex("é", false)).toThrow();
  });
});

describe("lesson maths", () => {
  it("typesets in every lesson", () => {
    for (const lesson of getAllLessons()) expect(() => renderMathInHtml(lesson.content), lesson.id).not.toThrow();
  });

  it("stays out of section headings, which the table of contents shows as plain text", () => {
    for (const lesson of getAllLessons()) expect(lesson.content, lesson.id).not.toMatch(/<h2[^>]*>[^<]*<(span|div) class="tex/);
  });
});
