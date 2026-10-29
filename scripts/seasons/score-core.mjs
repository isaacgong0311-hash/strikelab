// Official scoring for season attempts (proving-ground spec §3).
//
// Points: correctness 70 (the official test's fraction of cases passed),
// speed 10 (only if something is correct: the unused share of the time
// limit), explanation 20 (scored later by a person, so not added here).
// The automatic part is what this writes to official_score.
//
// Student code never runs in the same Python as the grader. Each submission
// runs alone in a fresh, locked-down child process (score-student.mjs), which
// only reports what the student's function returned. The official test then
// runs here, in a Python that has never seen student code, against those
// returned numbers. So a submission can't patch the grader (abs, math, ...),
// can't affect the next student's score, and can't read secrets or files.
import { fork } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadPyodide } from "pyodide";

export const POINTS = { correctness: 70, speed: 10, explanation: 20 };
export const RUN_TIMEOUT_MS = 10_000;
const LOAD_TIMEOUT_MS = 60_000;

const STUDENT_SCRIPT = realpathSync(fileURLToPath(new URL("./score-student.mjs", import.meta.url)));
const PYODIDE_DIR = realpathSync(dirname(createRequire(import.meta.url).resolve("pyodide/package.json")));
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function autoScore({ fraction, usedSeconds, limitSeconds }) {
  const f = Math.min(1, Math.max(0, Number(fraction) || 0));
  const speedShare = f > 0 && limitSeconds > 0 ? Math.min(1, Math.max(0, 1 - usedSeconds / limitSeconds)) : 0;
  return Math.round((POINTS.correctness * f + POINTS.speed * speedShare) * 10) / 10;
}

/**
 * Runs `code` in its own sandboxed process and calls `entry` with each argument
 * list in `cases`. Resolves to { kind: "ran", outputs } (one {value} or {error}
 * per case), { kind: "student", error } if the code doesn't run, { kind:
 * "timeout" } after timeoutMs, or { kind: "test", error } if the process fails
 * in a way that needs a person to look.
 */
export function runStudent(code, entry, cases, { timeoutMs = RUN_TIMEOUT_MS } = {}) {
  const child = fork(STUDENT_SCRIPT, [pathToFileURL(join(PYODIDE_DIR, "pyodide.mjs")).href], {
    // Explicit, so nothing is inherited from this process (e.g. --env-file).
    execArgv: ["--permission", `--allow-fs-read=${PYODIDE_DIR}/`, `--allow-fs-read=${STUDENT_SCRIPT}`],
    env: {},
    stdio: ["ignore", "ignore", "ignore", "ipc"],
    serialization: "advanced",
  });
  return new Promise((resolve) => {
    let timer = setTimeout(() => finish({ kind: "test", error: "Python didn't load in the scoring process" }), LOAD_TIMEOUT_MS);
    let settled = false;
    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill("SIGKILL");
      resolve(result);
    }
    child.on("message", (msg) => {
      if (msg?.ready === true) {
        clearTimeout(timer);
        timer = setTimeout(() => finish({ kind: "timeout" }), timeoutMs);
        child.send({ code, entry, cases });
        return;
      }
      if (msg?.ok === false && msg.kind === "student") return finish({ kind: "student", error: String(msg.error ?? "") });
      if (msg?.ok === true && Array.isArray(msg.outputs) && msg.outputs.length === cases.length) {
        const outputs = msg.outputs.map((o) =>
          typeof o?.value === "number" ? { value: o.value } : { error: String(o?.error ?? "no result") },
        );
        return finish({ kind: "ran", outputs });
      }
      finish({ kind: "test", error: "unexpected message from the scoring process" });
    });
    child.on("error", (err) => finish({ kind: "test", error: String(err) }));
    child.on("exit", (code, signal) => finish({ kind: "test", error: `scoring process exited (${signal ?? code})` }));
  });
}

/**
 * Scores submissions one at a time. The grader's Python loads once and only
 * ever runs official tests. A run that takes longer than timeoutMs comes back
 * as { kind: "timeout" }.
 */
export function createScorer({ timeoutMs = RUN_TIMEOUT_MS } = {}) {
  let judge = null;

  /** Runs the official test with `entry` replaced by `stub` (Python source). */
  function runTest(py, test, entry, stub, globals = {}) {
    const ns = py.toPy(globals);
    try {
      py.runPython(stub, { globals: ns });
      py.runPython(test, { globals: ns });
      return ns.get("_score");
    } finally {
      ns.destroy();
    }
  }

  async function run(code, test, entry) {
    if (!IDENTIFIER.test(entry ?? "")) return { kind: "test", error: `bad entry point ${entry}` };
    judge ??= loadPyodide({ stdout: () => {}, stderr: () => {} });
    const py = await judge;

    // 1. Learn which calls the official test makes (with a stand-in function).
    let cases;
    try {
      const ns = py.toPy({});
      try {
        py.runPython(`_calls = []\ndef ${entry}(*args):\n    _calls.append(list(args))\n    return float("nan")\n`, { globals: ns });
        py.runPython(test, { globals: ns });
        const calls = ns.get("_calls");
        cases = calls.toJs();
        calls.destroy();
      } finally {
        ns.destroy();
      }
    } catch (err) {
      return { kind: "test", error: String(err).slice(-500) };
    }
    if (!cases.length || !cases.every((args) => args.every((a) => typeof a === "number"))) {
      return { kind: "test", error: "official test made no calls, or non-numeric ones" };
    }

    // 2. Run the student's function on those calls, in its own sandbox.
    const student = await runStudent(code, entry, cases, { timeoutMs });
    if (student.kind !== "ran") return student;

    // 3. Grade: the same official test, replaying what the student returned.
    const replay = `_next = 0
def ${entry}(*args):
    global _next
    i = _next
    _next += 1
    if i >= len(_expected) or list(args) != _expected[i]:
        raise RuntimeError("the official test made an unexpected call")
    if _outputs[i] is None:
        raise RuntimeError("the student's function failed on this case")
    return _outputs[i]
`;
    try {
      const fraction = runTest(py, test, entry, replay, {
        _expected: cases,
        _outputs: student.outputs.map((o) => ("value" in o ? o.value : null)),
      });
      if (typeof fraction !== "number") throw new Error("official test did not set _score");
      return { kind: "scored", fraction };
    } catch (err) {
      return { kind: "test", error: String(err).slice(-500) };
    }
  }

  return {
    run,
    async close() {
      judge = null;
    },
  };
}

/** What to write for one attempt, from a run result. */
export function outcome(result, { usedSeconds, limitSeconds }) {
  if (result.kind === "scored") return { status: "scored", official_score: autoScore({ fraction: result.fraction, usedSeconds, limitSeconds }) };
  if (result.kind === "student") return { status: "scored", official_score: 0 }; // their code didn't run: a real score of 0
  return { status: "pending_review", official_score: null }; // timeout or a broken test: a person looks
}
