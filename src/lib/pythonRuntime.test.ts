import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PYODIDE_VERSION, PYTHON_SOURCES } from "./pythonRuntime";

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
