"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionLink, Button } from "@/components/ui/Action";
import { linkedInAddUrl } from "@/lib/record/linkedin";
import { SITE_URL } from "@/lib/site";
import styles from "./record.module.css";

export default function ShareControls({
  initialToken,
  hasHandle,
  ready,
  credential,
}: {
  initialToken: string | null;
  hasHandle: boolean;
  ready: boolean;
  /** The best verified item, named as LinkedIn will show it. Null when nothing is verified yet. */
  credential: { name: string; issuedAt: string } | null;
}) {
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

  if (!ready) return <p className={styles.help}>Sharing is unavailable until record setup is complete.</p>;
  if (!hasHandle) return <p className={styles.help}>Choose a public handle on <Link href="/seasons">the season page</Link> before sharing.</p>;
  return (
    <div className={styles.controls}>
      {token ? (
        <>
          <label htmlFor="record-link">Your share link</label>
          <div className={styles.linkRow}>
            <input id="record-link" readOnly value={`/r/${token}`} onFocus={(event) => event.currentTarget.select()} />
            <ActionLink href={`/r/${token}`} variant="secondary">View</ActionLink>
          </div>
          <div className={styles.buttons}>
            <Button onClick={copy}>Copy link</Button>
            {credential && (
              <ActionLink
                href={linkedInAddUrl({ ...credential, certUrl: `${SITE_URL}/r/${token}` })}
                variant="secondary"
                target="_blank"
              >
                Add to LinkedIn<span className="sl-visually-hidden"> (opens in a new tab)</span>
              </ActionLink>
            )}
            <Button variant="ghost" onClick={() => change(false)} disabled={busy}>Revoke link</Button>
          </div>
        </>
      ) : <div className={styles.buttons}><Button onClick={() => change(true)} disabled={busy}>Create share link</Button></div>}
      {message && <p role="status" className={styles.message}>{message}</p>}
    </div>
  );
}
