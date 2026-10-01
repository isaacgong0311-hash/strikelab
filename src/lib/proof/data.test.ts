import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROOF, validateProof, type ProofEntry } from "./data";

const root = join(__dirname, "..", "..", "..");
const exists = (p: string) => existsSync(join(root, p));

const good: ProofEntry = {
  id: "activation",
  value: "62%",
  label: "of enrolled students finished the first lesson",
  sourceLabel: "Fall 2026 pilot",
  sourcePath: "docs/gtm/weekly-scorecard.md",
  asOf: "2026-12-20",
  consent: true,
};

describe("proof data", () => {
  it("the real proof file passes every rule (it is empty until cohorts exist)", () => {
    expect(validateProof(PROOF, exists)).toEqual([]);
  });

  it("accepts a fully sourced entry", () => {
    expect(validateProof([good], exists)).toEqual([]);
  });

  it("rejects a missing source file, a bad date, no consent and duplicates", () => {
    const bad = [
      { ...good, id: "a", sourcePath: "docs/does-not-exist.md" },
      { ...good, id: "b", asOf: "last month" },
      { ...good, id: "c", consent: false },
      { ...good, id: "c" },
    ];
    const problems = validateProof(bad, exists);
    expect(problems.some((p) => p.includes("does not exist"))).toBe(true);
    expect(problems.some((p) => p.includes("asOf"))).toBe(true);
    expect(problems.some((p) => p.includes("consent"))).toBe(true);
    expect(problems.some((p) => p.includes("duplicated"))).toBe(true);
  });
});
