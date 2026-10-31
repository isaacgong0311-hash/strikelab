"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./record.module.css";

export default function ShareControls({ initialToken, hasHandle, ready }: { initialToken: string | null; hasHandle: boolean; ready: boolean }) {
  const [token, setToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function change(enabled: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/record/share", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Couldn't change sharing");
      setToken(result.shareToken ?? null);
      setMessage(enabled ? "Share link created." : "Share link revoked. The old link no longer works.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't change sharing");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${token}`);
      setMessage("Link copied.");
    } catch {
      setMessage("Copy failed. Select the link and copy it manually.");
    }
  }

  if (!ready) return <p className={styles.shareHelp}>Sharing is unavailable until record setup is complete.</p>;
  if (!hasHandle) return <p className={styles.shareHelp}>Choose a public handle on <Link href="/seasons">the season page</Link> before sharing.</p>;
  return (
    <div className={styles.shareControls}>
      {token ? (
        <>
          <label htmlFor="record-link">Your share link</label>
          <input id="record-link" readOnly value={`/r/${token}`} onFocus={(event) => event.currentTarget.select()} />
          <div className={styles.shareActions}>
            <button type="button" onClick={copy}>Copy link</button>
            <button type="button" onClick={() => change(false)} disabled={busy}>Revoke link</button>
          </div>
        </>
      ) : <button type="button" onClick={() => change(true)} disabled={busy}>Create share link</button>}
      {message && <p role="status" className={styles.shareMessage}>{message}</p>}
    </div>
  );
}
