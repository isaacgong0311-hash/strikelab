/**
 * The in-browser Python runtime (Pyodide), loaded once per page and shared by
 * lessons, the playground and challenges.
 *
 * It's served from strikelab.dev (copied from the `pyodide` package at build
 * time by scripts/copy-pyodide.mjs), with the jsDelivr CDN as a fallback: a
 * school web filter that blocks third-party CDNs used to break every exercise
 * (mega plan Q1). If both sources fail, the promise rejects with a message a
 * student can act on (it used to never settle, leaving "Running…" forever),
 * and the next call tries again.
 */

// Keep in step with the `pyodide` devDependency (a test checks it).
export const PYODIDE_VERSION = "0.26.4";

export const PYTHON_SOURCES = [
  `/pyodide/v${PYODIDE_VERSION}/`,
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
] as const;

export const PYTHON_UNAVAILABLE_MESSAGE =
  "Python couldn't load. Check your connection and try again. On a school network, ask IT to allow strikelab.dev.";

interface ConnectionHints {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Whether a page should start downloading Python (about 13 MB, once per
 * version) before the student asks to run anything. Pages where reading comes
 * first skip the early download for visitors who turned on Data Saver or are
 * on a 2G-class connection; Python then loads on the first Run, exactly as
 * before. Browsers without the Network Information API get the early load.
 */
export function shouldPreloadPython(connection?: ConnectionHints | null): boolean {
  if (!connection) return true;
  if (connection.saveData) return false;
  return connection.effectiveType !== "slow-2g" && connection.effectiveType !== "2g";
}

/** Reads the browser's connection hints, if it exposes any. */
export function currentConnection(): ConnectionHints | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { connection?: ConnectionHints }).connection ?? null;
}

export interface PythonRuntime {
  runPython(code: string): unknown;
}

type PyodideWindow = Window & {
  __pyodideReady?: Promise<PythonRuntime>;
  loadPyodide?: (options: { indexURL: string }) => Promise<PythonRuntime>;
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

/** Loads Python (once per page) and resolves with the runtime. */
export function loadPythonRuntime(sources: readonly string[] = PYTHON_SOURCES): Promise<PythonRuntime> {
  const w = window as PyodideWindow;
  if (w.__pyodideReady) return w.__pyodideReady;

  const ready = (async () => {
    for (const base of sources) {
      try {
        await injectScript(`${base}pyodide.js`);
        if (!w.loadPyodide) throw new Error("pyodide.js loaded without loadPyodide");
        return await w.loadPyodide({ indexURL: base });
      } catch (err) {
        console.warn(`[python] ${base} failed, trying the next source:`, err);
      }
    }
    throw new Error(PYTHON_UNAVAILABLE_MESSAGE);
  })();

  w.__pyodideReady = ready;
  // A failed load shouldn't stick: the next Run tries again.
  ready.catch(() => {
    if (w.__pyodideReady === ready) w.__pyodideReady = undefined;
  });
  return ready;
}
