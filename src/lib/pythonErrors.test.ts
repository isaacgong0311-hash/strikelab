import { describe, expect, it } from "vitest";
import { explainPythonError } from "./pythonErrors";

// What Pyodide throws when a student presses Run on the untouched starter code
// of lesson 1: every frame but the last belongs to Pyodide, not to the student.
const STARTER_TRACE = `Traceback (most recent call last):
  File "/lib/python312.zip/_pyodide/_base.py", line 523, in eval_code
    .run(globals, locals)
     ^^^^^^^^^^^^^^^^^^^^
  File "/lib/python312.zip/_pyodide/_base.py", line 357, in run
    coroutine = eval(self.code, globals, locals)
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<exec>", line 2, in <module>
AssertionError: ITM call
`;

describe("explainPythonError", () => {
  it("turns a failed test into one plain sentence with no Pyodide frames", () => {
    const out = explainPythonError(new Error(STARTER_TRACE), "tests");
    expect(out).toBe("A test didn't pass: ITM call");
    expect(out).not.toMatch(/pyodide|\.py|Traceback|\^/i);
  });

  it("copes with an assertion that has no message", () => {
    expect(explainPythonError(new Error("Traceback (most recent call last):\n  File \"<exec>\", line 3, in <module>\nAssertionError\n"), "tests")).toBe("A test didn't pass.");
  });

  it("names the error and its line when the student's own code fails", () => {
    const trace = `Traceback (most recent call last):
  File "/lib/python312.zip/_pyodide/_base.py", line 523, in eval_code
    .run(globals, locals)
  File "<exec>", line 7, in <module>
  File "<exec>", line 4, in price
NameError: name 'sigma' is not defined
`;
    expect(explainPythonError(new Error(trace), "code")).toBe("NameError on line 4: name 'sigma' is not defined");
  });

  it("reads a syntax error, which has no Traceback header", () => {
    const trace = `  File "<exec>", line 3
    def f(:
          ^
SyntaxError: invalid syntax
`;
    expect(explainPythonError(new Error(trace), "code")).toBe("SyntaxError on line 3: invalid syntax");
  });

  it("does not quote a line number for a test, which the student can't see", () => {
    const trace = `Traceback (most recent call last):
  File "<exec>", line 2, in <module>
NameError: name 'intrinsic_value' is not defined
`;
    expect(explainPythonError(new Error(trace), "tests")).toBe("NameError: name 'intrinsic_value' is not defined");
  });

  it("passes anything that is not a Python traceback through unchanged", () => {
    expect(explainPythonError(new Error("Failed to fetch"), "code")).toBe("Failed to fetch");
    expect(explainPythonError("plain string", "code")).toBe("plain string");
  });
});
