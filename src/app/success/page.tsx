"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ActionLink } from "@/components/ui/Action";
import styles from "./success.module.css";

const Check = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
    <path d="M3.5 8.4 6.5 11.3 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    // The webhook persists subscription state asynchronously — poll status
    // briefly so this page reflects Pro as soon as it lands.
    let attempts = 0;
    let cancelled = false;

    async function poll(): Promise<boolean> {
      while (!cancelled && attempts < 5) {
        attempts++;
        try {
          const res = await fetch("/api/stripe/status");
          const data = await res.json();
          if (data.isPro) return true;
        } catch {
          // keep trying
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      return false;
    }

    poll()
      .then((confirmed) => {
        if (!confirmed && !cancelled) {
          setError(
            "Your payment went through, but we couldn't confirm your subscription yet. Give it a minute and refresh — contact hello@strikelab.app if it still doesn't show up.",
          );
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not verify subscription — contact hello@strikelab.app");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {loading ? (
          <div role="status">
            <div className={styles.mark} data-tone="pending">
              <svg className={styles.spin} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="42 100" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles.text}>Confirming your subscription…</p>
          </div>
        ) : error ? (
          <>
            <div className={styles.mark} data-tone="error" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
                <path d="M12 7v6M12 16.5v.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.text} role="alert">{error}</p>
            <div className={styles.actions}>
              <ActionLink href="/dashboard">Go to Dashboard</ActionLink>
            </div>
          </>
        ) : (
          <>
            <div className={styles.mark} aria-hidden="true"><Check size={24} /></div>
            <h1 className={styles.title}>You&apos;re on Pro!</h1>
            <p className={styles.text}>Your 7-day free trial has started. You now have access to:</p>
            <ul className={styles.list}>
              {[
                "Weekly office hours with the founder",
                "Priority email support",
              ].map((item) => (
                <li key={item}><Check />{item}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <ActionLink href="/lessons">Start a lesson</ActionLink>
              <ActionLink href="/dashboard" variant="secondary">Go to Dashboard</ActionLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <p className={styles.text}>Loading…</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
