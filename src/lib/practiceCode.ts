import type { PythonRuntime } from "./pythonRuntime";

/** Both runs must finish successfully before the UI reports a pass. */
export async function checkPracticeCode(runtime: PythonRuntime, code: string, testCode: string): Promise<void> {
  await runtime.runPython(code);
  await runtime.runPython(testCode);
}
