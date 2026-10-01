import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PageSkeleton from "./PageSkeleton";

describe("PageSkeleton", () => {
  it("announces what is loading and never renders a heading", () => {
    const html = renderToStaticMarkup(createElement(PageSkeleton, { label: "Loading your classes…", blocks: 3 }));
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading your classes…");
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toMatch(/<h[1-6]/);
  });
});
