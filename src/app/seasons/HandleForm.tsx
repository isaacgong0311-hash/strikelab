"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Action";
import styles from "./handle.module.css";

/** Pick the public name shown on leaderboards. Shown only to signed-in students without one. */
export default function HandleForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/seasons/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { handle?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't save your handle");
      setSaved(data.handle ?? value);
      // Re-render the page so the invite card for the new handle appears.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your handle");
    } finally {
      setBusy(false);
    }
  }

  if (saved) return <p role="status">You&apos;ll appear on leaderboards as <strong>{saved}</strong>.</p>;

  return (
    <form onSubmit={save} className={styles.form}>
      <label htmlFor="handle" className={styles.label}>Choose your leaderboard handle</label>
      <p id="handle-help" className={styles.help}>
        3 to 20 lowercase letters, numbers or underscores. Not your real name: this is what everyone sees.
      </p>
      <div className={styles.row}>
        <input
          id="handle"
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby="handle-help"
          autoComplete="off"
          maxLength={20}
          required
        />
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </form>
  );
}
