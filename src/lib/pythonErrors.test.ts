import { describe, expect, it } from "vitest";
import { friendlyPythonError, plainParseError } from "./pythonErrors";

const PYODIDE_FRAMES = [
  "Traceback (most recent call last):",
  '  File "/lib/python312.zip/_pyodide/_base.py", line 523, in eval_code',
  "    .run(globals, locals)",
  "     ^^^^^^^^^^^^^^^^^^^^",
  '  File "/lib/python312.zip/_pyodide/_base.py", line 357, in run',
  "    coroutine = eval(self.code, globals, locals)",
  "                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
];

describe("friendlyPythonError", () => {
  it("explains a function that still returns None from `pass`", () => {
    const raw = [...PYODIDE_FRAMES, '  File "<exec>", line 4, in <module>', "TypeError: '>' not supported between instances of 'NoneType' and 'int'"].join("\n");
    expect(friendlyPythonError(raw, "tests")).toBe(
      "Your function returned None. Make sure it ends with a return statement in place of `pass`.\n\n" +
      "TypeError: '>' not supported between instances of 'NoneType' and 'int'",
    );
  });

  it("keeps the student's own function frames during the tests", () => {
    const raw = [
      ...PYODIDE_FRAMES,
      '  File "<exec>", line 3, in <module>',
      '  File "<exec>", line 15, in compute_vega',
      "ZeroDivisionError: float division by zero",
    ].join("\n");
    expect(friendlyPythonError(raw, "tests")).toBe(
      'Traceback (most recent call last):\n  File "<exec>", line 15, in compute_vega\nZeroDivisionError: float division by zero',
    );
  });

  it("shows a test assertion message on its own", () => {
    const raw = [...PYODIDE_FRAMES, '  File "<exec>", line 4, in <module>', "AssertionError: Vega must be positive: -1.0"].join("\n");
    expect(friendlyPythonError(raw, "tests")).toBe("AssertionError: Vega must be positive: -1.0");
  });

  it("keeps the line in the student's code for a syntax or runtime error", () => {
    const raw = [...PYODIDE_FRAMES, '  File "<exec>", line 9, in <module>', "NameError: name 'sigam' is not defined"].join("\n");
    expect(friendlyPythonError(raw, "code")).toBe(
      'Traceback (most recent call last):\n  File "<exec>", line 9, in <module>\nNameError: name \'sigam\' is not defined',
    );
  });

  it("passes non-traceback messages through unchanged", () => {
    expect(friendlyPythonError("Python took longer than 10 seconds.", "tests")).toBe("Python took longer than 10 seconds.");
  });
});

// Pyodide 0.26 (Python 3.12) reports parse errors through its compile frames,
// then a frame for the student's code with no ", in <scope>" part.
const COMPILE_FRAMES = [
  "Traceback (most recent call last):",
  '  File "/lib/python312.zip/_pyodide/_base.py", line 596, in eval_code_async',
  "    await CodeRunner(",
  '  File "/lib/python312.zip/_pyodide/_base.py", line 149, in _parse_and_compile_gen',
  "    mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)",
];
const parseError = (line: number, code: string, error: string) =>
  [...COMPILE_FRAMES, `  File "<exec>", line ${line}`, `    ${code}`, "    ^", error].join("\n");

describe("plainParseError", () => {
  it("explains an unclosed bracket on the line Python names, through friendlyPythonError", () => {
    const shown = friendlyPythonError(parseError(3, "return S * exp(r * T", "SyntaxError: '(' was never closed"), "code");
    expect(shown).toContain("SyntaxError: '(' was never closed");
    expect(plainParseError(shown)).toBe("A bracket opened on line 3 is never closed. Add the matching ) ] or }.");
  });

  it("explains indentation errors in words", () => {
    expect(plainParseError(parseError(3, "return S", "IndentationError: expected an indented block after function definition on line 2")))
      .toBe("Line 2 needs to be indented: the lines inside a def, if or for go 4 spaces in.");
    expect(plainParseError(parseError(4, "  x = 1", "IndentationError: unexpected indent")))
      .toBe("Line 4 is indented when Python didn't expect it. Line it up with the line above.");
    expect(plainParseError(parseError(5, "x", "IndentationError: unindent does not match any outer indentation level")))
      .toBe("Line 5 doesn't line up with the lines above it. Use 4 spaces for each level.");
    expect(plainParseError(parseError(2, "x", "TabError: inconsistent use of tabs and spaces in indentation")))
      .toBe("Line 2 mixes tabs and spaces. Indent with spaces only.");
  });

  it("covers a missing colon, an open quote and anything else Python can't parse", () => {
    expect(plainParseError(parseError(2, "def f(x)", "SyntaxError: expected ':'")))
      .toBe("Line 2 is missing a colon. Lines starting with def, if, for or else end with :.");
    expect(plainParseError(parseError(6, "print('hi)", "SyntaxError: unterminated string literal (detected at line 6)")))
      .toBe("A quote on line 6 is never closed. Strings need a matching ' or \".");
    expect(plainParseError(parseError(7, "x = = 1", "SyntaxError: invalid syntax")))
      .toBe("Python couldn't read your code at line 7. Look for a typo, a missing bracket or a missing colon there.");
  });

  it("stays quiet for runtime errors and plain messages", () => {
    expect(plainParseError("NameError: name 'sigam' is not defined")).toBeNull();
    expect(plainParseError("Python took longer than 10 seconds.")).toBeNull();
  });
});
