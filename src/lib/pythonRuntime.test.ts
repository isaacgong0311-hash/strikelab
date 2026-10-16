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

import { afterEach, beforeEach, vi } from "vitest";
import { PYTHON_TIMEOUT_MESSAGE, PYTHON_UNAVAILABLE_MESSAGE, PythonTimeoutError, createWorkerRuntime, type WorkerLike } from "./pythonRuntime";

/** A worker we control: tests decide when (and whether) it answers. */
class FakeWorker implements WorkerLike {
  onmessage: WorkerLike["onmessage"] = null;
  onerror: WorkerLike["onerror"] = null;
  terminated = false;
  sent: Array<{ id: number; type: string; code?: string }> = [];
  autoReply: ((m: { id: number; type: string; code?: string }) => { ok: boolean; value?: unknown; error?: string } | null) | null = null;

  postMessage(message: unknown) {
    const m = message as { id: number; type: string; code?: string };
    this.sent.push(m);
    const reply = this.autoReply?.(m);
    if (reply) queueMicrotask(() => this.onmessage?.({ data: { id: m.id, ...reply } }));
  }
  terminate() {
    this.terminated = true;
  }
}

describe("worker runtime", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const okInit = (m: { type: string }) => (m.type === "init" ? { ok: true, value: null } : null);

  async function ready(worker: FakeWorker, onDead = () => {}, timing = { runMs: 1000, initMs: 5000 }) {
    worker.autoReply = okInit;
    const p = createWorkerRuntime(worker, ["/pyodide/"], onDead, timing);
    await vi.advanceTimersByTimeAsync(0);
    return p;
  }

  it("loads, runs code and returns the value", async () => {
    const worker = new FakeWorker();
    const rt = await ready(worker);
    worker.autoReply = (m) => (m.type === "run" ? { ok: true, value: m.code === "1 + 1" ? 2 : null } : null);
    const out = rt.runPython("1 + 1");
    await vi.advanceTimersByTimeAsync(0);
    expect(await out).toBe(2);
    expect(worker.sent[0]).toMatchObject({ type: "init" });
  });

  it("passes a Python error through as a rejection and keeps working afterwards", async () => {
    const worker = new FakeWorker();
    const rt = await ready(worker);
    worker.autoReply = (m) => (m.code === "boom" ? { ok: false, error: "NameError: boom" } : { ok: true, value: 7 });
    const bad = rt.runPython("boom");
    const bad2 = expect(bad).rejects.toThrow("NameError: boom");
    await vi.advanceTimersByTimeAsync(0);
    await bad2;
    const good = rt.runPython("7");
    await vi.advanceTimersByTimeAsync(0);
    expect(await good).toBe(7);
    expect(worker.terminated).toBe(false);
  });

  it("stops a runaway run: terminates the worker, explains why, and tells the page to start fresh next time", async () => {
    const worker = new FakeWorker();
    const onDead = vi.fn();
    const rt = await ready(worker, onDead);
    worker.autoReply = null; // `while True:` never answers
    const run = rt.runPython("while True: pass");
    const caught = run.catch((e) => e);
    await vi.advanceTimersByTimeAsync(1001);
    const err = await caught;
    expect(err).toBeInstanceOf(PythonTimeoutError);
    expect((err as Error).message).toBe(PYTHON_TIMEOUT_MESSAGE.replace("{seconds}", "1"));
    expect(worker.terminated).toBe(true);
    expect(onDead).toHaveBeenCalledTimes(1);
    // The dead runtime keeps saying why instead of hanging.
    await expect(rt.runPython("1")).rejects.toBeInstanceOf(PythonTimeoutError);
  });

  it("honours a per-run timeout", async () => {
    const worker = new FakeWorker();
    const rt = await ready(worker);
    worker.autoReply = null;
    const caught = rt.runPython("slow()", { timeoutMs: 3000 }).catch((e) => e);
    await vi.advanceTimersByTimeAsync(2999);
    expect(worker.terminated).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect(await caught).toBeInstanceOf(PythonTimeoutError);
  });

  it("runs one at a time, so time spent queued doesn't count against the next run", async () => {
    const worker = new FakeWorker();
    const rt = await ready(worker);
    worker.autoReply = null;
    const first = rt.runPython("a");
    const second = rt.runPython("b");
    await vi.advanceTimersByTimeAsync(0);
    expect(worker.sent.filter((m) => m.type === "run")).toHaveLength(1); // b waits
    await vi.advanceTimersByTimeAsync(800); // 800 ms into a, well under its 1000 ms
    const a = worker.sent.find((m) => m.code === "a")!;
    worker.onmessage?.({ data: { id: a.id, ok: true, value: 1 } });
    expect(await first).toBe(1);
    await vi.advanceTimersByTimeAsync(0);
    const b = worker.sent.find((m) => m.code === "b")!;
    await vi.advanceTimersByTimeAsync(800); // b has now waited 1.6 s overall, but only 800 ms running
    expect(worker.terminated).toBe(false);
    worker.onmessage?.({ data: { id: b.id, ok: true, value: 2 } });
    expect(await second).toBe(2);
  });

  it("reports an unreachable runtime with the school-network message and terminates", async () => {
    const worker = new FakeWorker();
    worker.autoReply = (m) => (m.type === "init" ? { ok: false, error: "importScripts failed" } : null);
    const onDead = vi.fn();
    const p = createWorkerRuntime(worker, ["/pyodide/"], onDead, { runMs: 1000, initMs: 5000 });
    const caught = p.catch((e) => e);
    await vi.advanceTimersByTimeAsync(0);
    expect((await caught as Error).message).toBe(PYTHON_UNAVAILABLE_MESSAGE);
    expect(worker.terminated).toBe(true);
    expect(onDead).toHaveBeenCalled();
  });

  it("gives up on a load that never finishes", async () => {
    const worker = new FakeWorker();
    const p = createWorkerRuntime(worker, ["/pyodide/"], () => {}, { runMs: 1000, initMs: 5000 });
    const caught = p.catch((e) => e);
    await vi.advanceTimersByTimeAsync(5001);
    expect((await caught as Error).message).toBe(PYTHON_UNAVAILABLE_MESSAGE);
    expect(worker.terminated).toBe(true);
  });

  it("treats a worker script that fails to start as unavailable", async () => {
    const worker = new FakeWorker();
    const p = createWorkerRuntime(worker, ["/pyodide/"], () => {}, { runMs: 1000, initMs: 5000 });
    const caught = p.catch((e) => e);
    worker.onerror?.({});
    expect((await caught as Error).message).toBe(PYTHON_UNAVAILABLE_MESSAGE);
  });
});
