import { describe, expect, it } from "vitest";
import { LEAVE_BEHIND_SHORT_URL, LEAVE_BEHIND_SRC, LEAVE_BEHIND_URL } from "./leaveBehind";

describe("leave-behind link", () => {
  it("always points at production /pilot, tagged so sign-ups can be attributed", () => {
    expect(LEAVE_BEHIND_URL).toBe("https://strikelab.dev/pilot?src=leave_behind");
    expect(LEAVE_BEHIND_SHORT_URL).toBe("strikelab.dev/pilot");
  });

  it("uses a source tag the attribution store accepts (it truncates at 64 characters)", () => {
    expect(LEAVE_BEHIND_SRC.length).toBeLessThanOrEqual(64);
    expect(LEAVE_BEHIND_SRC).toMatch(/^[a-z_]+$/);
  });
});
