"use client";

import { useState } from "react";

/** Pick the public name shown on leaderboards. Shown only to signed-in students without one. */
export default function HandleForm() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your handle");
    } finally {
      setBusy(false);
    }
  }

  if (saved) return <p role="status">You&apos;ll appear on leaderboards as <strong>{saved}</strong>.</p>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: "0.5rem", maxWidth: "26rem" }}>
      <label htmlFor="handle" style={{ fontWeight: 700 }}>Choose your leaderboard handle</label>
      <p id="handle-help" style={{ margin: 0, fontSize: "0.875rem" }}>
        3 to 20 lowercase letters, numbers or underscores. Not your real name: this is what everyone sees.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          id="handle"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby="handle-help"
          autoComplete="off"
          maxLength={20}
          required
          style={{ flex: 1, minHeight: 44, padding: "0 0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)" }}
        />
        <button type="submit" className="v2-btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
      {error && <p role="alert" style={{ margin: 0, color: "var(--sl-danger)" }}>{error}</p>}
    </form>
  );
}
