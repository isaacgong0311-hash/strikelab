"use client";

import { useState } from "react";
import styles from "@/components/record/record.module.css";

/** Turn the public, unlisted record link on or off. Off deletes the old link. */
export default function ShareRecord({ initialToken }: { initialToken: string | null }) {
  const [token, setToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const link = token && typeof window !== "undefined" ? `${window.location.origin}/record/${token}` : token ? `/record/${token}` : "";

  async function change(enabled: boolean) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/record/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = (await res.json().catch(() => ({}))) as { shareToken?: string | null; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't change sharing");
      setToken(data.shareToken ?? null);
      setMessage(enabled ? "Sharing is on. Anyone with this link can see your record." : "Sharing is off. The old link no longer works.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change sharing");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Link copied.");
    } catch {
      setMessage("Select the link and copy it.");
    }
  }

  return (
    <div>
      <p>
        Your record is private. Sharing makes an unlisted link that shows your handle, seasons, official scores and
        anything verified. Never your name. A top-10 placing appears on it only after a short live defense.
      </p>
      {token ? (
        <div className={styles.shareRow}>
          <label htmlFor="record-link" className="sl-visually-hidden">Your record link</label>
          <input id="record-link" className={styles.link} readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="v2-btn" onClick={copy}>Copy link</button>
          <button type="button" className="v2-btn" disabled={busy} onClick={() => change(false)}>
            {busy ? "Working…" : "Stop sharing"}
          </button>
        </div>
      ) : (
        <button type="button" className="v2-btn" disabled={busy} onClick={() => change(true)}>
          {busy ? "Working…" : "Create a share link"}
        </button>
      )}
      <p role="status" aria-live="polite" style={{ minHeight: "1.5rem", marginTop: "0.5rem" }}>{message}</p>
      {error && <p role="alert" style={{ color: "var(--sl-danger)" }}>{error}</p>}
    </div>
  );
}
