"use client";
import { useState } from "react";
import { FAQ_GROUPS } from "@/lib/faq";

export default function FAQClient() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="v2-page-head mb-8" data-v2-head style={{ padding: 0, border: 0 }}>
        <div className="text-[10px] tracking-widest uppercase mb-2 opacity-50" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
          FAQ
        </div>
        <h1 className="text-4xl font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          Frequently asked questions
        </h1>
        <p className="text-sm" style={{ color: "var(--muted2)" }}>
          Can&rsquo;t find what you&rsquo;re looking for?{" "}
          <a href="mailto:hello@strikelab.app" className="underline underline-offset-2 hover:opacity-75 transition-opacity" style={{ color: "var(--grass)" }}>
            Email us
          </a>.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {FAQ_GROUPS.map((group) => (
          <div key={group.section}>
            <div className="v2-rise flex items-center gap-3 mb-3">
              <div className="text-[10px] tracking-widest uppercase opacity-40" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
                {group.section}
              </div>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>
            <div className="flex flex-col gap-1.5" data-v2-stagger>
              {group.items.map((item) => {
                const key = `${group.section}-${item.q}`;
                const isOpen = open === key;
                return (
                  <div key={key} className="v2-rise sl-glow-card rounded-lg border overflow-hidden" style={{ borderColor: "var(--border2)", background: "var(--card)" }}>
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
                    >
                      <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                        {item.q}
                      </span>
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-all"
                        style={{
                          borderColor: isOpen ? "rgba(34,197,94,0.4)" : "var(--border2)",
                          color: isOpen ? "var(--grass)" : "var(--muted)",
                          background: isOpen ? "rgba(34,197,94,0.08)" : "transparent",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                        }}
                      >
                        +
                      </span>
                    </button>
                    <div className={`sl-faq-answer${isOpen ? " open" : ""}`}>
                      <div>
                        <div className="px-4 pb-4 pt-1 text-sm leading-relaxed border-t" style={{ color: "var(--muted2)", borderColor: "var(--border)" }}>
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
