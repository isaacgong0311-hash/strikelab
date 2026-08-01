import type { ReactNode } from "react";

/**
 * Minimal markdown renderer shared by every AI surface (tutor, review,
 * explain).
 *
 * Deliberately not a markdown library: the system prompts constrain the model
 * to four constructs — fenced code, inline code, bold and bullets — and a full
 * parser is a dependency and a bundle cost for output we already control the
 * shape of. Unterminated fences render anyway, because replies stream in and a
 * half-arrived code block should still be visible.
 */
export function renderAiMarkdown(text: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let codeBuffer: string[] = [];
  let inCode = false;

  const flushCode = (key: string) => {
    if (codeBuffer.length === 0) return;
    blocks.push(
      <pre key={key} className="ai-code">
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
    codeBuffer = [];
  };

  lines.forEach((line, i) => {
    if (line.trim().startsWith("```")) {
      if (inCode) { flushCode(`code-${i}`); inCode = false; }
      else inCode = true;
      return;
    }
    if (inCode) { codeBuffer.push(line); return; }
    if (!line.trim()) { blocks.push(<div key={`gap-${i}`} className="ai-gap" />); return; }

    const isBullet = /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
    const body = line.replace(/^\s*[-*]\s+/, "").replace(/^\s*(\d+)\.\s+/, "$1. ");

    const parts = body.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    const rendered = parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`")) return <code key={j} className="ai-inline">{p.slice(1, -1)}</code>;
      return <span key={j}>{p}</span>;
    });

    blocks.push(<p key={`l-${i}`} className={isBullet ? "ai-li" : "ai-p"}>{rendered}</p>);
  });

  if (codeBuffer.length > 0) flushCode("code-tail");
  return blocks;
}

/**
 * Shared streaming reader for the AI text endpoints. They all return plain
 * UTF-8 rather than SSE, so consuming one is the same three lines everywhere.
 */
export async function streamInto(
  url: string,
  payload: unknown,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.body) throw new Error("no response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
