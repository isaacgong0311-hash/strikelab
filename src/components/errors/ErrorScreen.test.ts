import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ErrorScreen from "./ErrorScreen";

describe("ErrorScreen", () => {
  it("offers a retry and a way home, and shows the reference but never an error message", () => {
    const html = renderToStaticMarkup(createElement(ErrorScreen, { digest: "abc123", onRetry: () => {} }));
    expect(html).toContain("Try again");
    expect(html).toContain('href="/"');
    expect(html).toContain("Reference: abc123");
    expect(html).toContain('role="alert"');
  });

  it("omits the reference line when there is no digest", () => {
    const html = renderToStaticMarkup(createElement(ErrorScreen, { onRetry: () => {} }));
    expect(html).not.toContain("Reference:");
  });
});
