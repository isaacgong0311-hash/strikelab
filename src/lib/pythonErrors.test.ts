import { describe, expect, it } from "vitest";
import { friendlyPythonError } from "./pythonErrors";

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
