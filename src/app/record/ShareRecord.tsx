"use client";

import { useState } from "react";
import { useOrigin } from "@/lib/useOrigin";
import styles from "./record.module.css";

export default function ShareRecord({ initialToken }: { initialToken: string | null }) {
  const origin = useOrigin();
  const [token, setToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setShare(enabled: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/record/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't change sharing");
      setToken((data.shareToken as string | null) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change sharing");
    } finally {
      setBusy(false);
    }
  }

  const shareUrl = token ? `${origin}/record/${token}` : null;

  return (
    <div className={styles.share}>
      {token ? (
        <>
          <p>Anyone with this link can see your record (not your name). Turn it off any time and the link stops working.</p>
          <div className={styles.shareRow}>
            <input className={styles.shareInput} readOnly value={shareUrl ?? ""} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              className="v2-btn"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl ?? "");
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  // Clipboard blocked: the link is selectable above.
                }
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button type="button" className={styles.danger} disabled={busy} onClick={() => void setShare(false)}>
            Stop sharing
          </button>
        </>
      ) : (
        <>
          <p>
            Private: only you can see this. A share link shows your seasons and capstone status without your name,
            for a college application or a portfolio. If you&apos;re under 18, check with a parent or guardian first.
          </p>
          <button type="button" className="v2-btn" disabled={busy} onClick={() => void setShare(true)}>
            Create a share link
          </button>
        </>
      )}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
  );
}
