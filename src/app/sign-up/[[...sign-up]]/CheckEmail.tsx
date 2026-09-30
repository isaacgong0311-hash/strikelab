"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Supabase refuses a second confirmation email to the same address within about a minute. */
export const RESEND_COOLDOWN_SECONDS = 60;

/**
 * After sign-up, while the confirmation email is on its way. At a club
 * kickoff a whole room signs up at once, so this has to answer "it didn't
 * arrive" without the student leaving the page (work plan 2026-09-29, AG5).
 */
export default function CheckEmail({ email, redirectTo, signInHref }: { email: string; redirectTo: string; signInHref: string }) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  async function resend() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setStatus("sending");
    setError(null);
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo } });
    if (resendError) {
      setStatus("error");
      setError(resendError.message);
    } else {
      setStatus("sent");
    }
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  }

  const waiting = secondsLeft > 0;

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand"><span className="auth-logo"><BrandMark size={34} /></span></div>
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-sub">
          We sent a link to <strong>{email}</strong>. Open it on this device to finish signing up.
        </p>
        <ul className="auth-help" style={{ margin: "0 0 12px", paddingLeft: "1.1rem", display: "grid", gap: 4 }}>
          <li>It comes from StrikeLab and can take a minute to arrive.</li>
          <li>Not there? Check your spam or junk folder, and check the address above for typos.</li>
          <li>At a club meeting? Tell your club leader if it hasn&apos;t arrived after two minutes.</li>
        </ul>

        <button
          type="button"
          onClick={resend}
          disabled={waiting || status === "sending"}
          className="v2-btn ghost"
          style={{ width: "100%" }}
        >
          {status === "sending" ? "Sending…" : waiting ? `Resend email (${secondsLeft}s)` : "Resend email"}
        </button>
        <p role="status" aria-live="polite" className="auth-help" style={{ minHeight: "1.5em", marginTop: 8 }}>
          {status === "sent" ? "Sent again. Check your inbox and spam folder." : status === "error" ? `Couldn't resend: ${error}` : ""}
        </p>

        <p className="auth-alt">
          Wrong address? <Link href="/sign-up">Start again</Link> · <Link href={signInHref}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
