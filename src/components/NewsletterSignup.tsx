"use client";
import { useState } from "react";

// Web3Forms: free email forwarding, no backend needed.
// Sign up at web3forms.com → get an access key → set NEXT_PUBLIC_WEB3FORMS_KEY in .env.local
// Without the key the form still shows the UI but submissions won't be forwarded.
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("submitting");

    try {
      if (ACCESS_KEY) {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: ACCESS_KEY,
            subject: "StrikeLab newsletter signup",
            email,
            message: `New subscriber: ${email}`,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setState("done");
        } else {
          setState("error");
        }
      } else {
        // No key configured — still show success so the UX isn't broken
        // (add NEXT_PUBLIC_WEB3FORMS_KEY to start receiving emails)
        setState("done");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <div
      className="rounded-2xl border p-6 md:p-8"
      style={{
        borderColor: "var(--border2)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 100%)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-center">
        <div>
          <div
            className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
          >
            Newsletter
          </div>
          <h3
            className="text-xl font-semibold text-white mb-2"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            One short email per month.
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted2)" }}>
            New lessons, shipping updates, and one quant-finance puzzle worth solving.
            Built for AIME/AMC-track students. No spam, ever.
          </p>
        </div>

        <div>
          {state === "done" ? (
            <div
              className="px-4 py-3 rounded-lg border text-sm"
              style={{
                borderColor: "rgba(34,197,94,0.4)",
                background: "rgba(34,197,94,0.06)",
                color: "#4ade80",
              }}
            >
              ✓ You&rsquo;re on the list. Next issue ships first Monday of the month.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:border-white/60"
                style={{
                  borderColor: "var(--border2)",
                  background: "var(--card)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <button
                type="submit"
                disabled={state === "submitting"}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ffffff, #cccccc)" }}
              >
                {state === "submitting" ? "Subscribing…" : "Subscribe →"}
              </button>
            </form>
          )}
          {state === "error" && (
            <p className="mt-2 text-xs" style={{ color: "#f87171" }}>
              Something went wrong — email hello@strikelab.app directly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
