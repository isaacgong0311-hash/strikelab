// Runs Python (Pyodide) off the main thread, so a student's `while True:`
// can't freeze their tab. src/lib/pythonRuntime.ts owns this worker: it sends
// {id, type: "init", sources} once, then {id, type: "run", code} per run, and
// terminates the worker if a run takes too long. Plain JS on purpose (no
// bundler step, served as-is from strikelab.dev).
/* global importScripts, loadPyodide */
let pyodide = null;

// Only plain data can cross back to the page. Python objects become JS values;
// anything that can't be converted is described as text.
function toCloneable(value) {
  if (value === undefined || value === null) return null;
  const type = typeof value;
  if (type === "number" || type === "string" || type === "boolean" || type === "bigint") return value;
  try {
    if (typeof value.toJs === "function") {
      const js = value.toJs({ dict_converter: Object.fromEntries });
      if (typeof value.destroy === "function") value.destroy();
      return js;
    }
  } catch {
    // fall through to text
  }
  try {
    return String(value);
  } catch {
    return null;
  }
}

self.onmessage = async (event) => {
  const { id, type } = event.data;
  try {
    if (type === "init") {
      let lastError = null;
      for (const base of event.data.sources) {
        try {
          importScripts(base + "pyodide.js");
          pyodide = await loadPyodide({ indexURL: base });
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!pyodide) throw lastError || new Error("Python could not be loaded");
      self.postMessage({ id, ok: true, value: null });
    } else if (type === "run") {
      if (!pyodide) throw new Error("Python is not loaded yet");
      const value = toCloneable(pyodide.runPython(event.data.code));
      self.postMessage({ id, ok: true, value });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
