/**
 * Pyodide throws the whole Python traceback as the error message, including
 * its own frames (`/lib/python312.zip/_pyodide/_base.py`, caret rows). Handed
 * to a beginner that is ten lines of noise around the one line that matters.
 * This reduces it to a sentence; the full trace goes to the console for
 * whoever needs it.
 *
 * `phase` says which run threw. Test code runs in the same `<exec>` frame as
 * the student's, but the student can't see it, so a line number from a test
 * would point at nothing.
 */
export type PythonPhase = "code" | "tests";

export function explainPythonError(err: unknown, phase: PythonPhase): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (!/Traceback \(most recent call last\)|File "<exec>"/.test(raw)) return raw;

  console.debug(raw);

  // The exception itself is the last line that isn't indented.
  const last = raw.split("\n").reverse().find((line) => line.trim() && !/^\s/.test(line)) ?? raw.trim();
  const colon = last.indexOf(":");
  const type = (colon === -1 ? last : last.slice(0, colon)).trim();
  const message = colon === -1 ? "" : last.slice(colon + 1).trim();

  if (type === "AssertionError" && phase === "tests") {
    return message ? `A test didn't pass: ${message}` : "A test didn't pass.";
  }

  const lines = [...raw.matchAll(/File "<exec>", line (\d+)/g)];
  const where = phase === "code" && lines.length ? ` on line ${lines[lines.length - 1][1]}` : "";
  return message ? `${type}${where}: ${message}` : `${type}${where}`;
}
