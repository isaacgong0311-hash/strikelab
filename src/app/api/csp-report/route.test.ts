import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const post = (body: string) => POST(new Request("http://localhost/api/csp-report", { method: "POST", body }));

describe("POST /api/csp-report", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs the directive, blocked URL and page from a report-uri report", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await post(JSON.stringify({
      "csp-report": { "document-uri": "https://strikelab.dev/lesson/3", "effective-directive": "script-src", "blocked-uri": "https://evil.example/x.js", "original-policy": "x".repeat(5000) },
    }));
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledWith("[csp-report]", JSON.stringify({ directive: "script-src", blocked: "https://evil.example/x.js", page: "https://strikelab.dev/lesson/3" }));
  });

  it("accepts the Reporting API's array shape", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await post(JSON.stringify([{ type: "csp-violation", body: { effectiveDirective: "connect-src", blockedURL: "https://x.example", documentURL: "https://strikelab.dev/" } }]));
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("rejects a body that isn't JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });
});
