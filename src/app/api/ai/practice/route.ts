/**
 * POST /api/ai/practice — generates a fresh exercise on the lesson's concept.
 *
 * The curriculum is 22 fixed exercises. A student who finishes one and hasn't
 * yet internalised it has nowhere to drill; this gives them another variant on
 * the same idea, as many times as their daily budget allows.
 *
 * Returns JSON rather than a stream: a half-arrived exercise is useless, so
 * there's nothing to show until the whole object exists.
 *
 * Safety: the generated Python is executed by Pyodide in the student's own
 * browser, inside the same WASM sandbox that already runs every lesson
 * exercise. It has no filesystem, no network, and no access to the page's
 * session. Generated code is therefore no more privileged than the code the
 * student types themselves.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getLessonContext } from "@/lib/tracks";
import { completeGroqJson, isAiConfigured } from "@/lib/ai/groq";
import { consumeAiQuota } from "@/lib/ai/quota";

export interface PracticeProblem {
  title: string;
  prompt: string;
  starterCode: string;
  testCode: string;
  solution: string;
}

function buildSystemPrompt(lessonId: string): string {
  const ctx = getLessonContext(lessonId);
  const topic = ctx
    ? `"${ctx.lesson.title}" — ${ctx.lesson.subtitle} (${ctx.track.title} track)`
    : "options pricing fundamentals";

  return `You write practice exercises for StrikeLab, a Python-based options pricing and quant finance curriculum for high schoolers.

Generate ONE new exercise on this topic: ${topic}

It must be a genuine variant — same underlying concept, different function, different framing. Not a reworded copy.

Respond with a JSON object with exactly these string fields:

- "title": short exercise name, under 60 characters.
- "prompt": one or two sentences stating what to implement. Name the function and its parameters explicitly.
- "starterCode": Python with the imports, the function signature, a docstring stating what to return, and a body of exactly "    pass". Never include the working implementation.
- "solution": the complete correct implementation.
- "testCode": Python that calls the student's function and asserts correctness, then prints "All tests passed!".

HARD REQUIREMENTS for testCode — an exercise that fails a correct answer is worse than no exercise:
- Use only the Python standard library (math, statistics). NEVER numpy, scipy, or pandas — they are not guaranteed present.
- Compare floats with a tolerance: abs(got - want) < 1e-6. Never ==.
- Assert at least three distinct cases, including one edge case.
- Every expected value must be one you computed from the solution, not invented.
- Each assert needs a message naming what failed.
- The whole exercise must be solvable in under 15 lines.

Return only the JSON object.`;
}

/** Rejects a generated problem that would fail a correct student answer. */
function isUsable(p: PracticeProblem | null): p is PracticeProblem {
  if (!p) return false;
  const required = ["title", "prompt", "starterCode", "testCode", "solution"] as const;
  if (!required.every((k) => typeof p[k] === "string" && p[k].trim())) return false;

  // The model is told not to reach for these; if it did anyway, the exercise
  // would blow up in Pyodide with a confusing ImportError.
  const banned = /\b(import|from)\s+(numpy|scipy|pandas)\b/;
  if (banned.test(p.testCode) || banned.test(p.starterCode) || banned.test(p.solution)) return false;

  // Starter code containing a return is usually the answer leaking through.
  if (!/\bpass\b/.test(p.starterCode)) return false;

  if (!p.testCode.includes("assert")) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { lessonId = "" } = body as { lessonId?: string };

  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json(
      { error: "Sign in to generate practice problems." },
      { status: 401 },
    );
  }

  if (!isAiConfigured) {
    return NextResponse.json({ error: "Practice generation isn't available right now." }, { status: 503 });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "practice");
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "You've used today's AI budget — it resets at midnight UTC." },
      { status: 429 },
    );
  }

  const problem = await completeGroqJson<PracticeProblem>({
    system: buildSystemPrompt(lessonId),
    user: "Generate the exercise.",
    maxTokens: 1400,
    temperature: 0.8,
  });

  if (!isUsable(problem)) {
    return NextResponse.json(
      { error: "Couldn't generate a usable problem this time. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ problem });
}
