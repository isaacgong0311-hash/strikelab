// Pyodide tracebacks start with its own eval frames, and errors raised while
// the hidden tests run point at the test script's top-level lines. Neither
// means anything to a student, so drop them and keep frames from their code.

const FRAME = /^ {2}File "([^"]+)", line \d+, in (.+)$/;

export type PythonPhase = "code" | "tests";

export function friendlyPythonError(raw: string, phase: PythonPhase): string {
  const lines = raw.replace(/\s+$/, "").split("\n");
  const start = lines.findIndex((line) => line.startsWith("Traceback (most recent call last):"));
  if (start === -1) return raw;

  const kept: string[] = [];
  let i = start + 1;
  while (i < lines.length && FRAME.test(lines[i])) {
    const [, file, scope] = lines[i].match(FRAME)!;
    let end = i + 1;
    while (end < lines.length && lines[end].startsWith("    ")) end++;
    const internal = file.startsWith("/lib/python");
    const testScript = phase === "tests" && file === "<exec>" && scope === "<module>";
    if (!internal && !testScript) kept.push(...lines.slice(i, end));
    i = end;
  }
  const error = lines.slice(i).join("\n");

  const hint = phase === "tests" && /'NoneType'|NoneType object|got None/.test(error)
    ? "Your function returned None. Make sure it ends with a return statement in place of `pass`.\n\n"
    : "";
  const trace = kept.length ? ["Traceback (most recent call last):", ...kept, error].join("\n") : error;
  return hint + trace;
}
