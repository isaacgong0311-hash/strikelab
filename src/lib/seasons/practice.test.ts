import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import {
  describeResult, forgetFunctionProgram, loadPracticeState, parsePracticeResult, PRACTICE_ENTRY, PRACTICE_STARTER,
  practiceChecks, practiceParams, practicePrompt, savePracticeState, type PracticeResult,
} from "./practice";
import { TEMPLATES } from "./templates";
import type { StorageLike } from "./draft";

const SOLUTION = "from math import exp\ndef forward_price(S, r, T):\n    return S * exp(r * T)\n";
const WRONG = "def forward_price(S, r, T):\n    return S\n";

let py: PyodideInterface;
beforeAll(async () => {
  py = await loadPyodide({ stdout: () => {}, stderr: () => {} });
}, 120_000);

function check(student: string, seed = 7): PracticeResult {
  const ns = py.toPy({});
  try {
    py.runPython(student, { globals: ns });
    const out = py.runPython(practiceChecks(practiceParams(seed)), { globals: ns });
    return parsePracticeResult(out)!;
  } finally {
    ns.destroy();
  }
}

describe("practice problem", () => {
  it("gives the same numbers for the same seed and different numbers for another", () => {
    expect(practiceParams(42)).toEqual(practiceParams(42));
    const seen = new Set(Array.from({ length: 30 }, (_, i) => JSON.stringify(practiceParams(i + 1))));
    expect(seen.size).toBeGreaterThan(20);
  });

  it("keeps numbers in the ranges the prompt expects", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { S, r, T } = practiceParams(seed);
      expect(S).toBeGreaterThanOrEqual(50);
      expect(S).toBeLessThanOrEqual(150);
      expect(r).toBeGreaterThanOrEqual(0.01);
      expect(r).toBeLessThanOrEqual(0.06);
      expect([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]).toContain(T);
    }
    expect(practicePrompt(practiceParams(3))).toContain("forward_price(S, r, T)");
  });

  it("passes the model answer, fails a wrong one, and fails the starter with a note", () => {
    expect(check(SOLUTION)).toMatchObject({ passed: 4, total: 4, notes: [] });
    const wrong = check(WRONG);
    expect(wrong.passed).toBeLessThan(wrong.total);
    expect(wrong.notes[0]).toContain("expected about");
    const starter = check(PRACTICE_STARTER);
    expect(starter.passed).toBe(0);
    expect(starter.notes[0]).toContain("NotImplementedError");
    expect(describeResult(starter)).toMatch(/^0 of 4 checks passed\./);
  }, 60_000);

  it("can't be passed by a function the student has since deleted", () => {
    const ns = py.toPy({});
    try {
      py.runPython(SOLUTION, { globals: ns });
      // Returns nothing even when it removes a function: the worker can't send a function back.
      expect(py.runPython(forgetFunctionProgram(PRACTICE_ENTRY)!, { globals: ns })).toBeUndefined();
      expect(py.runPython(forgetFunctionProgram(PRACTICE_ENTRY)!, { globals: ns })).toBeUndefined();
      const result = parsePracticeResult(py.runPython(practiceChecks(practiceParams(7)), { globals: ns }))!;
      expect(result.passed).toBe(0);
      expect(result.notes[0]).toContain("NameError");
    } finally {
      ns.destroy();
    }
    expect(forgetFunctionProgram("not valid!")).toBeNull();
  });

  it("is a different problem from every real season challenge", () => {
    for (const template of Object.values(TEMPLATES)) expect(template.entry).not.toBe(PRACTICE_ENTRY);
  });

  it("saves and restores the round on this device", () => {
    const data = new Map<string, string>();
    const store: StorageLike = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
    expect(loadPracticeState(store)).toBeNull();
    savePracticeState(store, { seed: 9, startedAt: 123 });
    expect(loadPracticeState(store)).toEqual({ seed: 9, startedAt: 123 });
    store.setItem("strikelab:practice:v1", "garbage");
    expect(loadPracticeState(store)).toBeNull();
  });
});

describe("client code never imports the hidden official tests", () => {
  const roots = ["src/app/seasons", "src/components/seasons", "src/lib/seasons/practice.ts", "src/lib/seasons/clock.ts", "src/lib/seasons/draft.ts", "src/lib/seasons/train.ts"];
  const FORBIDDEN = /seasons\/templates|from "\.\/templates"|seasons\/params|from "\.\/params"|node:crypto/;

  function files(path: string): string[] {
    const full = join(process.cwd(), path);
    if (statSync(full).isFile()) return [full];
    return readdirSync(full).flatMap((name) => files(join(path, name)));
  }

  it("for any browser-side seasons file", () => {
    const clientFiles = roots.flatMap(files)
      .filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\./.test(file))
      .filter((file) => /^\s*["']use client["']/.test(readFileSync(file, "utf8")) || /lib\/seasons\/(practice|clock|draft|train)\.ts$/.test(file));
    expect(clientFiles.length).toBeGreaterThan(3);
    for (const file of clientFiles) {
      const imports = readFileSync(file, "utf8").split("\n").filter((line) => /^\s*(import|export)\b.*\bfrom\b/.test(line));
      expect(imports.filter((line) => FORBIDDEN.test(line)), file).toEqual([]);
    }
  });
});
