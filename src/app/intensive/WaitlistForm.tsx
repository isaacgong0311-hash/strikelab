"use client";

import { useState } from "react";
import styles from "@/components/marketing/marketing.module.css";

export default function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [note, setNote] = useState("");
  const [isGuardian, setIsGuardian] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/intensive/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: email, grade: grade ? Number(grade) : null, note, isGuardian, source, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't save that");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that");
      setState("idle");
    }
  }

  if (state === "done") {
    return <p role="status" className={styles.lede}>You&apos;re on the list. We&apos;ll email you when the January cohort has dates. Nothing has been charged.</p>;
  }

  const field = { width: "100%", minHeight: 44, padding: "0 0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)" } as const;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "0.875rem", maxWidth: "30rem" }}>
      <div>
        <label htmlFor="wl-email" style={{ fontWeight: 700 }}>Parent or guardian email</label>
        <input id="wl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={field} />
      </div>
      <div>
        <label htmlFor="wl-grade" style={{ fontWeight: 700 }}>Student&apos;s grade (optional)</label>
        <select id="wl-grade" value={grade} onChange={(e) => setGrade(e.target.value)} style={field}>
          <option value="">Choose</option>
          {[8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="wl-note" style={{ fontWeight: 700 }}>Anything we should know? (optional)</label>
        <textarea id="wl-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} style={{ ...field, padding: "0.75rem" }} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="wl-website">Website</label>
        <input id="wl-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <input type="checkbox" checked={isGuardian} onChange={(e) => setIsGuardian(e.target.checked)} required />
        <span>I&apos;m the student&apos;s parent or guardian.</span>
      </label>
      <button type="submit" className={styles.primary} disabled={state === "busy"}>
        {state === "busy" ? "Saving…" : "Join the waitlist"}
      </button>
      {error && <p role="alert" style={{ margin: 0, color: "var(--sl-danger)" }}>{error}</p>}
    </form>
  );
}
