import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PYODIDE_VERSION, PYTHON_SOURCES, shouldPreloadPython } from "./pythonRuntime";

describe("python runtime sources", () => {
  it("matches the pyodide version copied into public/ at build time", () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
    expect(pkg.devDependencies.pyodide).toBe(PYODIDE_VERSION);
  });

  it("tries strikelab.dev before the CDN", () => {
    expect(PYTHON_SOURCES[0]).toBe(`/pyodide/v${PYODIDE_VERSION}/`);
    expect(PYTHON_SOURCES[1]).toContain("cdn.jsdelivr.net");
  });
});

describe("shouldPreloadPython", () => {
  it("preloads when the browser gives no connection hints", () => {
    expect(shouldPreloadPython(null)).toBe(true);
    expect(shouldPreloadPython(undefined)).toBe(true);
    expect(shouldPreloadPython({})).toBe(true);
  });

  it("preloads on ordinary connections", () => {
    expect(shouldPreloadPython({ effectiveType: "4g" })).toBe(true);
    expect(shouldPreloadPython({ effectiveType: "3g" })).toBe(true);
  });

  it("waits for the first Run on Data Saver or 2G-class connections", () => {
    expect(shouldPreloadPython({ saveData: true, effectiveType: "4g" })).toBe(false);
    expect(shouldPreloadPython({ effectiveType: "2g" })).toBe(false);
    expect(shouldPreloadPython({ effectiveType: "slow-2g" })).toBe(false);
  });
});
