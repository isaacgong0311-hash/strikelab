// Runs ONE student's submission, in a child process started by score-core.mjs
// for that submission alone. Student code can reach JavaScript through
// Pyodide (`import js`), so this process is the security boundary: it is
// started with an empty environment and Node's permission model (it can read
// only Pyodide's own files: no .env.local, no other files, no writes, no
// child processes). It never grades anything. It only reports what the
// student's function returned for each argument list it was given.
//
// Messages: {ready: true} out once Python has loaded; {code, entry, cases} in;
// {ok: true, outputs} or {ok: false, kind: "student", error} out, where each
// output is {value: number} or {error: string}.
import { constants } from "node:fs";

const [pyodideUrl] = process.argv.slice(2);

// Pyodide's file system setup reads fs flag constants through process.binding,
// which the permission model blocks. Give it those constants and nothing else.
process.binding = (name) => {
  if (name === "constants") return { fs: constants };
  throw new Error("process.binding is not available to the scorer");
};

const { loadPyodide } = await import(pyodideUrl);
const py = await loadPyodide({ stdout: () => {}, stderr: () => {} });
process.send({ ready: true });

process.once("message", ({ code, entry, cases }) => {
  const ns = py.toPy({});
  try {
    py.runPython(code, { globals: ns });
  } catch (err) {
    process.send({ ok: false, kind: "student", error: String(err).slice(-500) });
    return;
  }
  const fn = ns.get(entry);
  const outputs = cases.map((args) => {
    if (typeof fn !== "function") return { error: `${entry} is not defined` };
    let value;
    try {
      value = fn(...args);
    } catch (err) {
      return { error: String(err).slice(-300) };
    }
    if (typeof value === "number") return { value };
    if (value && typeof value.destroy === "function") value.destroy();
    return { error: "did not return a number" };
  });
  process.send({ ok: true, outputs });
});
