import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { consumeAiQuota } from "@/lib/ai/quota";
import { streamGroqChat } from "@/lib/ai/groq";
import { POST } from "./route";

vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: vi.fn() }));
vi.mock("@/lib/ai/quota", () => ({
  AI_CLASS_OFF_REPLY: "AI off for class or attempt.",
  AI_UNAVAILABLE_REPLY: "AI budget unavailable.",
  consumeAiQuota: vi.fn(),
}));
vi.mock("@/lib/ai/groq", () => ({
  isAiConfigured: true,
  streamGroqChat: vi.fn(),
  streamHeaders: (mode: string) => ({ "X-AI-Mode": mode }),
  textStream: (value: string) => new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode(value)); controller.close(); },
  }),
}));

function request(answer: unknown) {
  return new NextRequest("http://localhost/api/ai/mistake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: "1.1", stepId: "1.1.insurance", answer }),
  });
}

describe("POST /api/ai/mistake", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a correct or forged answer before auth or quota", async () => {
    const response = await POST(request(1));
    expect(response.status).toBe(400);
    expect(requireUser).not.toHaveBeenCalled();
    expect(consumeAiQuota).not.toHaveBeenCalled();
  });

  it("respects the existing class and active-attempt AI policy", async () => {
    vi.mocked(requireUser).mockResolvedValue({ userId: "student", supabase: {} as never });
    vi.mocked(consumeAiQuota).mockResolvedValue({ allowed: false, used: 0, limit: 25, reason: "class" });
    const response = await POST(request(0));
    expect(response.headers.get("X-AI-Mode")).toBe("fallback");
    expect(await response.text()).toContain("AI off for class or attempt");
    expect(streamGroqChat).not.toHaveBeenCalled();
  });

  it("grounds the model in the known exercise after charging one explain action", async () => {
    vi.mocked(requireUser).mockResolvedValue({ userId: "student", supabase: {} as never });
    vi.mocked(consumeAiQuota).mockResolvedValue({ allowed: true, used: 1, limit: 25 });
    vi.mocked(streamGroqChat).mockResolvedValue(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode("A put lets you sell.")); controller.close(); },
    }));
    const response = await POST(request(0));
    expect(consumeAiQuota).toHaveBeenCalledWith({}, "student", "explain");
    expect(vi.mocked(streamGroqChat).mock.calls[0][0].system).toContain("Student's incorrect answer: A $80 call");
    expect(vi.mocked(streamGroqChat).mock.calls[0][0].system).toContain("Author-written explanation:");
    expect(response.headers.get("X-AI-Mode")).toBe("live");
    expect(await response.text()).toBe("A put lets you sell.");
  });
});
