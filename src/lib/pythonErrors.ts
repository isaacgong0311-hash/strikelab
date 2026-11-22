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

const PARSE_ERROR = /^(SyntaxError|IndentationError|TabError): (.*)$/m;

/**
 * One plain-language line for an error Python raised before running anything
 * (a syntax, indentation or tab error), to show above the traceback. Null for
 * anything else: a runtime error's own message is already specific. Reads the
 * text friendlyPythonError returns or the raw traceback.
 */
export function plainParseError(text: string): string | null {
  const match = PARSE_ERROR.exec(text);
  if (!match) return null;
  const [, kind, detail] = match;
  // The last "line N" before the error names the line Python stopped on.
  const lines = [...text.slice(0, match.index).matchAll(/line (\d+)/g)];
  const lineNo = /\(detected at line (\d+)\)|on line (\d+)/.exec(detail);
  const n = lineNo?.[1] ?? lineNo?.[2] ?? lines.at(-1)?.[1];
  const at = n ? `line ${n}` : "one line";
  const At = n ? `Line ${n}` : "One line";

  if (kind === "TabError") return `${At} mixes tabs and spaces. Indent with spaces only.`;
  if (kind === "IndentationError") {
    if (/expected an indented block/.test(detail)) return `${At} needs to be indented: the lines inside a def, if or for go 4 spaces in.`;
    if (/unexpected indent/.test(detail)) return `${At} is indented when Python didn't expect it. Line it up with the line above.`;
    if (/unindent does not match/.test(detail)) return `${At} doesn't line up with the lines above it. Use 4 spaces for each level.`;
    return `Python couldn't follow the indentation on ${at}. Use 4 spaces for each level.`;
  }
  if (/was never closed/.test(detail)) return `A bracket opened on ${at} is never closed. Add the matching ) ] or }.`;
  if (/unterminated (triple-quoted )?string/.test(detail)) return `A quote on ${at} is never closed. Strings need a matching ' or ".`;
  if (/expected ':'/.test(detail)) return `${At} is missing a colon. Lines starting with def, if, for or else end with :.`;
  if (/unmatched '[)\]}]'/.test(detail)) return `${At} has a closing bracket with no opening one.`;
  return `Python couldn't read your code at ${at}. Look for a typo, a missing bracket or a missing colon there.`;
}
