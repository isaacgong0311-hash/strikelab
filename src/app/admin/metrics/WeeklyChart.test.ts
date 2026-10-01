import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WeeklyChart from "./WeeklyChart";

const points = [
  { week: "2026-10-26", value: 9 },
  { week: "2026-11-02", value: 14 },
  { week: "2026-11-09", value: 12 },
];

describe("WeeklyChart", () => {
  it("is a keyboard-focusable group that names itself and labels only the latest value", () => {
    const html = renderToStaticMarkup(createElement(WeeklyChart, { title: "Active students per week", unit: "active students", kind: "columns", points }));
    expect(html).toContain('role="group"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("Active students per week. Use the left and right arrow keys to read each week.");
    // One column per week, one endpoint label (12), never a number on every bar.
    expect(html.match(/<path/g)?.length).toBe(3);
    const labels = [...html.matchAll(/class="[^"]*endLabel[^"]*"[^>]*>(\d+)</g)].map((m) => m[1]);
    expect(labels).toEqual(["12"]);
  });

  it("draws a line chart with an end dot and no tooltip until hovered", () => {
    const html = renderToStaticMarkup(createElement(WeeklyChart, { title: "Capstones", unit: "capstones", kind: "line", points }));
    expect(html).toContain("<circle");
    expect(html).not.toContain("week of Nov");
  });

  it("renders an empty series without crashing", () => {
    expect(() => renderToStaticMarkup(createElement(WeeklyChart, { title: "Empty", unit: "x", kind: "line", points: [] }))).not.toThrow();
  });
});
