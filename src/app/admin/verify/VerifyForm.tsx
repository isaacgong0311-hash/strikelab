"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./verify.module.css";

export default function VerifyForm({ kind, userId, subjectId }: { kind: "capstone" | "placing"; userId: string; subjectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, userId, subjectId,
          notes: data.get("notes"), parentConsentRecorded: data.get("parentConsentRecorded") === "on" }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error ?? "Could not save verification.");
      } else {
        setMessage("Verification recorded.");
        router.refresh();
      }
    } catch {
      setMessage("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={`notes-${kind}-${subjectId}`}>Review notes <span>(optional, private)</span></label>
      <textarea id={`notes-${kind}-${subjectId}`} name="notes" maxLength={2000} rows={3} placeholder="What was checked in the defense?" />
      <label className={styles.consent}><input type="checkbox" name="parentConsentRecorded" required /> Parent consent for this call is recorded</label>
      <button type="submit" disabled={busy}>{busy ? "Recording…" : "Mark verified"}</button>
      {message && <p role="status" className={styles.message}>{message}</p>}
    </form>
  );
}
