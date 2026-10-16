// Official scoring for season attempts (proving-ground spec §3).
//
// Points: correctness 70 (the official test's fraction of cases passed),
// speed 10 (only if something is correct: the unused share of the time
// limit), explanation 20 (scored later by a person, so not added here).
// The automatic part is what this writes to official_score.
import { Worker } from "node:worker_threads";

export const POINTS = { correctness: 70, speed: 10, explanation: 20 };
export const RUN_TIMEOUT_MS = 10_000;

export function autoScore({ fraction, usedSeconds, limitSeconds }) {
  const f = Math.min(1, Math.max(0, Number(fraction) || 0));
  const speedShare = f > 0 && limitSeconds > 0 ? Math.min(1, Math.max(0, 1 - usedSeconds / limitSeconds)) : 0;
  return Math.round((POINTS.correctness * f + POINTS.speed * speedShare) * 10) / 10;
}

/**
 * Runs submissions one at a time in a reusable worker. A run that takes longer
 * than timeoutMs kills the worker (the next run starts a fresh one) and comes
 * back as { kind: "timeout" }.
 */
export function createScorer({ timeoutMs = RUN_TIMEOUT_MS } = {}) {
  const url = new URL("./score-worker.mjs", import.meta.url);
  let worker = null;
  let loaded = false; // has the current worker loaded Python yet?
  let nextId = 1;

  const spawn = () => {
    worker = new Worker(url);
    worker.unref();
    loaded = false;
  };

  function run(code, test) {
    if (!worker) spawn();
    const w = worker;
    const id = nextId++;
    // A fresh worker (the first one, or one restarted after a timeout) also
    // waits for Python to load, so its first run gets extra time.
    const limit = loaded ? timeoutMs : timeoutMs + 60_000;
    return new Promise((resolve) => {
      const done = (result) => {
        clearTimeout(timer);
        w.off("message", onMessage);
        w.off("error", onError);
        resolve(result);
      };
      const onMessage = (msg) => {
        if (msg.id !== id) return;
        if (worker === w) loaded = true;
        done(msg.ok ? { kind: "scored", fraction: msg.fraction } : { kind: msg.kind, error: msg.error });
      };
      const onError = (err) => {
        worker = null;
        done({ kind: "test", error: String(err) });
      };
      const timer = setTimeout(() => {
        w.terminate();
        if (worker === w) worker = null;
        done({ kind: "timeout" });
      }, limit);
      w.on("message", onMessage);
      w.on("error", onError);
      w.postMessage({ id, code, test });
    });
  }

  return {
    run,
    async close() {
      if (worker) await worker.terminate();
      worker = null;
    },
  };
}

/** What to write for one attempt, from a run result. */
export function outcome(result, { usedSeconds, limitSeconds }) {
  if (result.kind === "scored") return { status: "scored", official_score: autoScore({ fraction: result.fraction, usedSeconds, limitSeconds }) };
  if (result.kind === "student") return { status: "scored", official_score: 0 }; // their code didn't run: a real score of 0
  return { status: "pending_review", official_score: null }; // timeout or a broken test: a person looks
}
