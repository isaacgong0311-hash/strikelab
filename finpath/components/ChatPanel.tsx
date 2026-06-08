"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/types";

interface Props {
  context: string;
}

const STARTERS = [
  "How do I build credit from scratch?",
  "Should I pay off debt or save first?",
  "What is a HYSA and should I get one?",
  "How do I negotiate a lower interest rate?",
];

export default function ChatPanel({ context }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context }),
      });

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: acc };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="fp-chat-card">
      <div className="fp-chat-hd">
        <div className="fp-chat-icon">&#10022;</div>
        <span className="fp-chat-hd-title">Ask FinPath</span>
        <span className="fp-chat-hd-sub">{streaming ? "THINKING" : "READY"}</span>
      </div>

      {messages.length === 0 && (
        <div className="fp-starters">
          {STARTERS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} className="fp-starter" disabled={streaming}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="fp-msgs">
          {messages.map((m, i) => (
            <div key={i} className={`fp-msg ${m.role === "user" ? "user" : "ai"}`}>
              <div className="fp-msg-av">{m.role === "user" ? "I" : "FP"}</div>
              <div className="fp-msg-bub">
                {m.role === "assistant" ? (
                  <ReactMarkdown>{m.content || " "}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="fp-chat-input-row"
      >
        <textarea
          placeholder="Ask about budgeting, debt, investing, saving..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          disabled={streaming}
          rows={1}
          className="fp-chat-inp"
        />
        <button type="submit" disabled={streaming || !input.trim()} className="fp-send">
          &#8679;
        </button>
      </form>
    </div>
  );
}
