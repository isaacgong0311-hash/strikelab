/**
 * The in-browser Python runtime (Pyodide), loaded once per page and shared by
 * lessons, the playground and challenges.
 *
 * It runs in a Web Worker (public/python-worker.js), not on the page's main
 * thread, with a time limit on every run. Before this, one `while True:` froze
 * the student's whole tab, which at a live kickoff with 25 teenagers is not an
 * edge case. When a run goes over its limit the worker is terminated, the
 * student gets a plain explanation, and the next Run starts a fresh Python.
 *
 * It's served from strikelab.dev (copied from the `pyodide` package at build
 * time by scripts/copy-pyodide.mjs), with the jsDelivr CDN as a fallback: a
 * school web filter that blocks third-party CDNs used to break every exercise
 * (mega plan Q1). If both sources fail, the promise rejects with a message a
 * student can act on (it used to never settle, leaving "Running…" forever),
 * and the next call tries again. Browsers without Web Workers fall back to
 * running on the main thread, without the time limit.
 */

// Keep in step with the `pyodide` devDependency (a test checks it).
export const PYODIDE_VERSION = "0.26.4";

export const PYTHON_SOURCES = [
  `/pyodide/v${PYODIDE_VERSION}/`,
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
] as const;

export const PYTHON_WORKER_URL = "/python-worker.js";

/** How long one run may take before it is stopped. Generous: exercises are small. */
export const RUN_TIMEOUT_MS = 10_000;
/** Loading the runtime on a slow school network can take a while. */
export const INIT_TIMEOUT_MS = 90_000;

export const PYTHON_UNAVAILABLE_MESSAGE =
  "Python couldn't load. Check your connection and try again. On a school network, ask IT to allow strikelab.dev.";

export const PYTHON_TIMEOUT_MESSAGE =
  "Your code ran for more than {seconds} seconds, so it was stopped. Look for a loop that never ends (like `while True:`) or a very slow calculation. Run again when you've fixed it.";

/** A run went over its time limit and Python was restarted. Variables from earlier runs are gone. */
export class PythonTimeoutError extends Error {
  constructor(seconds: number) {
    super(PYTHON_TIMEOUT_MESSAGE.replace("{seconds}", String(seconds)));
    this.name = "PythonTimeoutError";
  }
}

export interface RunOptions {
  /** Overrides RUN_TIMEOUT_MS for this run. */
  timeoutMs?: number;
}

export interface PythonRuntime {
  /** Runs code in the shared Python namespace; resolves with the value of the last expression. */
  runPython(code: string, options?: RunOptions): Promise<unknown>;
}

/** The slice of the browser Worker we use, so tests can supply a fake. */
export interface WorkerLike {
  postMessage(message: unknown): void;
  terminate(): void;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

type Reply = { id: number; ok: boolean; value?: unknown; error?: string };
interface Pending {
  resolve(value: unknown): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Wraps a worker. Runs are serialized (the worker is single-threaded, and the
 * clock for a run must not include time spent queued behind another run).
 * `onDead` fires once when the worker is terminated, so the page-level cache
 * can drop it and the next Run starts a fresh one.
 */
export function createWorkerRuntime(
  worker: WorkerLike,
  sources: readonly string[],
  onDead: () => void,
  timing: { runMs?: number; initMs?: number } = {},
): Promise<PythonRuntime> {
  const runMs = timing.runMs ?? RUN_TIMEOUT_MS;
  const initMs = timing.initMs ?? INIT_TIMEOUT_MS;
  const pending = new Map<number, Pending>();
  let nextId = 1;
  let dead = false;
  let deadError: Error | null = null;
  let chain: Promise<unknown> = Promise.resolve();

  function die(error: Error) {
    if (dead) return;
    dead = true;
    deadError = error;
    worker.terminate();
    for (const p of pending.values()) {
      clearTimeout(p.timer);
      p.reject(error);
    }
    pending.clear();
    onDead();
  }

  worker.onmessage = (event) => {
    const reply = event.data as Reply;
    const p = pending.get(reply.id);
    if (!p) return;
    pending.delete(reply.id);
    clearTimeout(p.timer);
    if (reply.ok) p.resolve(reply.value ?? undefined);
    else p.reject(new Error(reply.error ?? "Python failed"));
  };
  worker.onerror = () => die(new Error(PYTHON_UNAVAILABLE_MESSAGE));

  function send(message: Record<string, unknown>, limitMs: number, onTimeout: () => Error): Promise<unknown> {
    if (dead) return Promise.reject(deadError ?? new Error(PYTHON_UNAVAILABLE_MESSAGE));
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const timer = setTimeout(() => die(onTimeout()), limitMs);
      pending.set(id, { resolve, reject, timer });
      worker.postMessage({ id, ...message });
    });
  }

  const runtime: PythonRuntime = {
    runPython(code, options) {
      const limit = options?.timeoutMs ?? runMs;
      const run = chain.then(() => send({ type: "run", code }, limit, () => new PythonTimeoutError(Math.round(limit / 1000))));
      // Keep the chain alive after a failed run (a Python error is not fatal).
      chain = run.catch(() => undefined);
      return run;
    },
  };

  return send({ type: "init", sources }, initMs, () => new Error(PYTHON_UNAVAILABLE_MESSAGE)).then(
    () => runtime,
    () => {
      die(new Error(PYTHON_UNAVAILABLE_MESSAGE));
      throw new Error(PYTHON_UNAVAILABLE_MESSAGE);
    },
  );
}

// ---------------------------------------------------------------------------
// Fallback: no Web Workers. Runs on the main thread, without a time limit.

type PyodideWindow = Window & {
  __pyodideReady?: Promise<PythonRuntime>;
  loadPyodide?: (options: { indexURL: string }) => Promise<{ runPython(code: string): unknown }>;
};

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Couldn't load ${src}`));
    };
    document.head.appendChild(script);
  });
}

async function loadMainThreadRuntime(sources: readonly string[]): Promise<PythonRuntime> {
  const w = window as PyodideWindow;
  for (const base of sources) {
    try {
      await injectScript(`${base}pyodide.js`);
      if (!w.loadPyodide) throw new Error("pyodide.js loaded without loadPyodide");
      const py = await w.loadPyodide({ indexURL: base });
      return { runPython: async (code) => py.runPython(code) };
    } catch (err) {
      console.warn(`[python] ${base} failed, trying the next source:`, err);
    }
  }
  throw new Error(PYTHON_UNAVAILABLE_MESSAGE);
}

/** Loads Python (once per page) and resolves with the runtime. */
export function loadPythonRuntime(sources: readonly string[] = PYTHON_SOURCES): Promise<PythonRuntime> {
  const w = window as PyodideWindow;
  if (w.__pyodideReady) return w.__pyodideReady;

  const ready: Promise<PythonRuntime> =
    typeof Worker === "undefined"
      ? loadMainThreadRuntime(sources)
      : createWorkerRuntime(new Worker(PYTHON_WORKER_URL) as unknown as WorkerLike, sources, () => {
          // The worker was stopped (a runaway run): the next Run starts a fresh one.
          if (w.__pyodideReady === ready) w.__pyodideReady = undefined;
        });

  w.__pyodideReady = ready;
  // A failed load shouldn't stick: the next Run tries again.
  ready.catch(() => {
    if (w.__pyodideReady === ready) w.__pyodideReady = undefined;
  });
  return ready;
}
