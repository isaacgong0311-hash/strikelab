import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SCENARIO } from "./marketLab";
import { LAB_NOTEBOOK_KEY, clearLabNotebook, notebookSnapshot, parseLabNotebook, recordMissionComplete, removeExperiment, saveExperiment } from "./marketLabNotebook";

const values = new Map<string, string>();
beforeEach(() => {
  values.clear();
  vi.stubGlobal("window", Object.assign(new EventTarget(), { localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } }));
});
afterEach(() => vi.unstubAllGlobals());

describe("Market Lab notebook", () => {
  it("recovers safely from corrupt, foreign-version, and invalid saved scenarios", () => {
    expect(parseLabNotebook("broken").experiments).toEqual([]);
    expect(parseLabNotebook('{"version":2,"completed":["time"]}').completed).toEqual([]);
    const raw = JSON.stringify({ version: 1, completed: ["time", "time", "fake"], experiments: [{ id: "valid-id", createdAt: "2026-10-21T12:00:00Z", mode: "free", scenario: { ...DEFAULT_SCENARIO, stock: 0 } }] });
    expect(parseLabNotebook(raw)).toEqual({ version: 1, completed: ["time"], experiments: [] });
  });
  it("retains only six experiments, keeps mission completion idempotent, and supports deletion", () => {
    for (let i = 0; i < 8; i++) expect(saveExperiment("free", { ...DEFAULT_SCENARIO, stock: 100 + i })).toBe(true);
    let notebook = parseLabNotebook(notebookSnapshot());
    expect(notebook.experiments).toHaveLength(6);
    expect(notebook.experiments[0].scenario.stock).toBe(107);
    recordMissionComplete("time"); recordMissionComplete("time");
    notebook = parseLabNotebook(notebookSnapshot());
    expect(notebook.completed).toEqual(["time"]);
    removeExperiment(notebook.experiments[0].id);
    expect(parseLabNotebook(notebookSnapshot()).experiments).toHaveLength(5);
    clearLabNotebook(); expect(values.has(LAB_NOTEBOOK_KEY)).toBe(false);
  });
  it("strips unknown fields so imported data cannot retain free-text personal notes", () => {
    const raw = JSON.stringify({ version: 1, completed: [], experiments: [{ id: "valid-id", createdAt: "2026-10-21T12:00:00Z", mode: "free", privateNote: "do not store this", scenario: { ...DEFAULT_SCENARIO, email: "private@example.com" } }] });
    expect(JSON.stringify(parseLabNotebook(raw))).not.toMatch(/private|email|Note/);
  });
  it("reports blocked storage without stopping the experiment", () => {
    vi.stubGlobal("window", { get localStorage() { throw new Error("Blocked"); } });
    expect(saveExperiment("free", DEFAULT_SCENARIO)).toBe(false);
    expect(recordMissionComplete("time")).toBe(false);
    expect(notebookSnapshot()).toBe("");
  });
});
