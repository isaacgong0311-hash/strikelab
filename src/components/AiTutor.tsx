"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { renderAiMarkdown, streamInto } from "./AiMarkdown";

/**
 * Conversational AI tutor panel.
 *
 * The previous hint panel was single-shot: asking a follow-up discarded the
 * previous answer and re-asked from scratch, so the tutor could never build on
 * what it had already told you. This keeps a thread and sends it back each
 * turn, which is what makes "no, I meant the other d1" work.
 */

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

/** Prompts that get a stuck student moving without a blank input box. */
const STARTERS = [
  "I'm stuck — what's the next step?",
  "Explain the intuition, not the formula",
  "What's wrong with my code?",
];

export default function AiTutor({
  lessonId,
  code,
  error,
  onClose,
}: {
  lessonId: string;
  code: string;
  error: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest reply in view as it streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const nextMessages: TutorMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      await streamInto(
        "/api/ai/chat",
        { lessonId, messages: nextMessages, code, error },
        (chunk) =>
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: copy[copy.length - 1].content + chunk,
            };
            return copy;
          }),
      );
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Couldn't reach the tutor. Check your connection and try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, lessonId, code, error]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter newlines — the convention everywhere else.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="ai-tutor">
      <div className="ai-tutor-head">
        <span className="ai-tutor-title">
          <span className="ai-dot" aria-hidden="true" />
          AI tutor
        </span>
        <button type="button" onClick={onClose} className="ai-close" aria-label="Close tutor">
          ✕
        </button>
      </div>

      <div className="ai-thread" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="ai-empty">
            <p className="ai-empty-lead">
              Ask about this lesson. I can see your code and the error — I&apos;ll give you the
              next step, not the answer.
            </p>
            <div className="ai-starters">
              {STARTERS.map((s) => (
                <button key={s} type="button" className="ai-starter" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              {m.role === "assistant" && m.content === "" ? (
                <span className="ai-thinking" aria-label="Thinking">
                  <i /><i /><i />
                </span>
              ) : m.role === "user" ? (
                <p className="ai-p">{m.content}</p>
              ) : (
                renderAiMarkdown(m.content)
              )}
            </div>
          ))
        )}
      </div>

      <form className="ai-composer" onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={streaming ? "Replying…" : "Ask a question…"}
          className="ai-input"
          disabled={streaming}
          aria-label="Ask the AI tutor a question"
        />
        <button type="submit" className="ai-send" disabled={streaming || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
