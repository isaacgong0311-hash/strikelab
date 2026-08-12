"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 20px", fontFamily: "var(--font-ui), system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--paper-2)", border: "1.5px solid var(--line)",
        borderRadius: 24, padding: "48px 40px", textAlign: "center",
        boxShadow: "0 24px 48px -20px rgba(40,30,10,0.28)",
      }}>
        {loading ? (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "var(--bg2)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 32, color: "var(--ink-2)",
              margin: "0 auto 24px",
            }} className="ch-spin">◌</div>
            <p style={{ color: "var(--ink-2)" }}>Confirming your subscription…</p>
          </>
        ) : error ? (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "var(--coral)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 36, fontWeight: 700, color: "#fff",
              boxShadow: "0 6px 0 #bf4830",
              margin: "0 auto 24px",
            }}>!</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--ink)", marginBottom: 10 }}>
              Something went wrong
            </h1>
            <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>{error}</p>
            <Link href="/dashboard" style={{
              display: "inline-block", padding: "13px 24px",
              background: "var(--grass)", color: "#fff", borderRadius: 14,
              fontWeight: 700, boxShadow: "0 4px 0 var(--grass-d)",
            }}>Go to Dashboard</Link>
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "var(--grass)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 36, color: "#fff",
              boxShadow: "0 6px 0 var(--grass-d)",
              margin: "0 auto 24px",
            }}>✓</div>

            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30,
              color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 10,
            }}>
              You&apos;re on Pro!
            </h1>
            <p style={{ color: "var(--ink-2)", fontSize: 16, marginBottom: 8 }}>
              Your 7-day free trial has started. You now have access to:
            </p>

            <ul style={{
              listStyle: "none", textAlign: "left", padding: 0, margin: "20px 0 28px",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {[
                "Weekly coding challenges with a live leaderboard",
                "Weekly office hours with the founder",
                "Priority email support",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--ink-2)" }}>
                  <span style={{ color: "var(--grass)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/challenges" style={{
                display: "block", padding: "14px 20px",
                background: "var(--grass)", color: "#fff",
                borderRadius: 14, fontWeight: 700, fontSize: 15,
                boxShadow: "0 4px 0 var(--grass-d)", textDecoration: "none",
              }}>
                Try a Challenge →
              </Link>
              <Link href="/dashboard" style={{
                display: "block", padding: "12px 20px",
                background: "var(--paper-2)", color: "var(--ink-2)",
                border: "1.5px solid var(--line-2)", borderRadius: 12,
                fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>
                Go to Dashboard
              </Link>
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
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>Loading…</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
