import { describe, expect, it, vi } from "vitest";
import { checkPracticeCode } from "./practiceCode";

describe("practice code checks", () => {
  it("waits for student code before running the test and propagates a failed test", async () => {
    let finishCode!: () => void;
    const first = new Promise<void>((resolve) => { finishCode = resolve; });
    const runPython = vi.fn().mockReturnValueOnce(first).mockRejectedValueOnce(new Error("assertion failed"));
    const pending = checkPracticeCode({ runPython }, "student code", "test code");
    expect(runPython).toHaveBeenCalledTimes(1);
    finishCode();
    await expect(pending).rejects.toThrow("assertion failed");
    expect(runPython).toHaveBeenNthCalledWith(2, "test code");
  });
});
