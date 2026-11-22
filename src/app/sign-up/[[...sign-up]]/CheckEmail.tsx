"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthCard, { authStyles as styles } from "@/components/AuthCard";
import { Button } from "@/components/ui/Action";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Supabase refuses a second confirmation email to the same address within about a minute. */
export const RESEND_COOLDOWN_SECONDS = 60;

/**
 * After sign-up, while the confirmation email is on its way. At a club
 * kickoff a whole room signs up at once, so this has to answer "it didn't
 * arrive" without the student leaving the page (work plan 2026-09-29, AG5).
 */
export default function CheckEmail({ email, redirectTo, signInHref, onStartAgain }: {
  email: string;
  redirectTo: string;
  signInHref: string;
  /** Back to the form. Navigating to /sign-up alone would keep this screen mounted. */
  onStartAgain?: () => void;
}) {
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
    <AuthCard
      title="Check your email"
      subtitle={<>We sent a link to <strong>{email}</strong>. Open it on this device to finish signing up.</>}
      footer={<>Wrong address? <Link href="/sign-up" onClick={onStartAgain}>Start again</Link> · <Link href={signInHref}>Back to sign in</Link></>}
    >
      <ul className={styles.list}>
        <li>It comes from StrikeLab and can take a minute to arrive.</li>
        <li>Not there? Check your spam or junk folder, and check the address above for typos.</li>
        <li>At a club meeting? Tell your club leader if it hasn&apos;t arrived after two minutes.</li>
      </ul>

      <Button
        variant="secondary"
        onClick={resend}
        disabled={waiting || status === "sending"}
        className={styles.full}
      >
        {status === "sending" ? "Sending…" : waiting ? <>Resend email (<span className="sl-num">{secondsLeft}s</span>)</> : "Resend email"}
      </Button>
      <p role="status" aria-live="polite" className={styles.status}>
        {status === "sent" ? "Sent again. Check your inbox and spam folder." : status === "error" ? `Couldn't resend: ${error}` : ""}
      </p>
    </AuthCard>
  );
}
