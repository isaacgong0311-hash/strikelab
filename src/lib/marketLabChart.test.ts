import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MarketLabChart from "../components/lab/MarketLabChart";
import { DEFAULT_SCENARIO } from "./marketLab";

describe("server-rendered Market Lab chart", () => {
  it("renders a single text title without React hydration warnings", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const html = renderToString(createElement(MarketLabChart, { baseline: DEFAULT_SCENARIO, scenario: { ...DEFAULT_SCENARIO, volatility: 40 }, variable: "volatility" }));
      expect(html).toMatch(/<title[^>]*>Option model value against annual volatility<\/title>/);
      expect(error).not.toHaveBeenCalled();
    } finally { error.mockRestore(); }
  });
});
