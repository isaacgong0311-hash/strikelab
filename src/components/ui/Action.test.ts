import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActionLink, Button, buttonClassName, isExternalHref } from "./Action";

const classOf = (html: string) => html.match(/class="([^"]*)"/)?.[1] ?? "";

describe("Button", () => {
  it("defaults to a primary, md, type=button control", () => {
    const html = renderToStaticMarkup(createElement(Button, null, "Start"));
    expect(html).toMatch(/^<button type="button"/);
    expect(classOf(html)).toMatch(/action/);
    expect(classOf(html)).toMatch(/primary/);
    expect(classOf(html)).not.toMatch(/\bsm\b|_sm_/);
    expect(html).toContain(">Start</button>");
  });

  it("applies variant, size and a caller class, and keeps an explicit type", () => {
    const html = renderToStaticMarkup(createElement(Button, { variant: "ghost", size: "sm", type: "submit", className: "extra" }, "Go"));
    expect(html).toContain('type="submit"');
    const cls = classOf(html);
    expect(cls).toMatch(/ghost/);
    expect(cls).toMatch(/sm/);
    expect(cls).toMatch(/extra$/);
    expect(cls).not.toMatch(/primary/);
  });

  it("exposes the same classes for non-button elements", () => {
    expect(buttonClassName({ variant: "secondary" })).toMatch(/secondary/);
  });
});

describe("ActionLink", () => {
  it("renders internal hrefs through next/link as a plain anchor", () => {
    const html = renderToStaticMarkup(createElement(ActionLink, { href: "/seasons", variant: "secondary" }, "Seasons"));
    expect(html).toMatch(/^<a /);
    expect(html).toContain('href="/seasons"');
    expect(classOf(html)).toMatch(/secondary/);
  });

  it("renders external hrefs as an anchor, adding rel for new tabs and dropping Link-only props", () => {
    const html = renderToStaticMarkup(
      createElement(ActionLink, { href: "https://github.com/x", target: "_blank", prefetch: false }, "GitHub"),
    );
    expect(html).toContain('href="https://github.com/x"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("prefetch");
  });

  it("classifies hrefs", () => {
    expect(isExternalHref("mailto:hello@example.com")).toBe(true);
    expect(isExternalHref("//cdn.example.com")).toBe(true);
    expect(isExternalHref("/lesson/1")).toBe(false);
    expect(isExternalHref("#main-content")).toBe(false);
    expect(isExternalHref({ pathname: "/seasons" })).toBe(false);
  });
});
