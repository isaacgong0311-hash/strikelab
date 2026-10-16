// One Python interpreter for scoring, run in a worker thread so the caller can
// kill it when a submission never finishes. Messages: {id, code, test} in,
// {id, ok: true, fraction} or {id, ok: false, kind: "student" | "test", error} out.
import { parentPort } from "node:worker_threads";
import { loadPyodide } from "pyodide";

const ready = loadPyodide();

parentPort.on("message", async ({ id, code, test }) => {
  const py = await ready;
  const ns = py.toPy({});
  try {
    try {
      py.runPython(code, { globals: ns });
    } catch (err) {
      parentPort.postMessage({ id, ok: false, kind: "student", error: String(err).slice(-500) });
      return;
    }
    py.runPython(test, { globals: ns });
    const fraction = ns.get("_score");
    if (typeof fraction !== "number") throw new Error("official test did not set _score");
    parentPort.postMessage({ id, ok: true, fraction });
  } catch (err) {
    parentPort.postMessage({ id, ok: false, kind: "test", error: String(err).slice(-500) });
  } finally {
    ns.destroy();
  }
});
