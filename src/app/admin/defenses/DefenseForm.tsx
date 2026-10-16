"use client";

import { useState } from "react";

const field: React.CSSProperties = { display: "grid", gap: "0.25rem" };
const input: React.CSSProperties = { minHeight: 44, padding: "0 0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)", font: "inherit" };

/** Record one defense sign-off. Nothing saves until consent is confirmed. */
export default function DefenseForm({ seasons }: { seasons: Array<{ id: string; title: string }> }) {
  const [kind, setKind] = useState<"placing" | "capstone">("placing");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/defenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: form.get("handle"),
          kind,
          seasonId: kind === "placing" ? form.get("seasonId") : null,
          outcome: form.get("outcome"),
          consentConfirmed: form.get("consent") === "on",
          reviewerLabel: form.get("reviewerLabel"),
          notes: form.get("notes"),
          defendedOn: form.get("defendedOn"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; handle?: string; linkedCapstone?: boolean };
      if (!res.ok) throw new Error(data.error ?? "Couldn't save the sign-off");
      setStatus(
        kind === "capstone" && !data.linkedCapstone
          ? `Saved for ${data.handle}. They have no submitted capstone yet, so the record shows the defense without a title.`
          : `Saved for ${data.handle}. Reload to see it in the list.`
      );
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the sign-off");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "0.875rem", maxWidth: "32rem" }}>
      <label style={field}>
        <span style={{ fontWeight: 700 }}>Student handle</span>
        <input name="handle" required autoComplete="off" maxLength={21} style={input} />
      </label>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <legend style={{ fontWeight: 700, marginBottom: "0.25rem" }}>What was defended</legend>
        <label><input type="radio" name="kind" checked={kind === "placing"} onChange={() => setKind("placing")} /> Top-10 season placing</label>
        <label><input type="radio" name="kind" checked={kind === "capstone"} onChange={() => setKind("capstone")} /> Capstone</label>
      </fieldset>
      {kind === "placing" && (
        <label style={field}>
          <span style={{ fontWeight: 700 }}>Season</span>
          <select name="seasonId" required style={input}>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
      )}
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <legend style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Outcome</legend>
        <label><input type="radio" name="outcome" value="verified" defaultChecked /> Verified</label>
        <label><input type="radio" name="outcome" value="not_verified" /> Not verified</label>
      </fieldset>
      <label style={field}>
        <span style={{ fontWeight: 700 }}>Reviewer name, as shown on the record</span>
        <input name="reviewerLabel" required maxLength={60} placeholder="e.g. Isaac G." style={input} />
      </label>
      <label style={field}>
        <span style={{ fontWeight: 700 }}>Date of the defense</span>
        <input name="defendedOn" type="date" style={input} />
      </label>
      <label style={field}>
        <span style={{ fontWeight: 700 }}>Private notes (optional, never shown on the record)</span>
        <textarea name="notes" maxLength={1000} rows={3} style={{ ...input, padding: "0.5rem 0.75rem" }} />
      </label>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <input type="checkbox" name="consent" required style={{ marginTop: "0.3rem" }} />
        <span>A parent&apos;s consent for this call was recorded, or the student is 18 or older, and the call was not one-on-one in private.</span>
      </label>
      <div><button type="submit" className="v2-btn" disabled={busy}>{busy ? "Saving…" : "Save sign-off"}</button></div>
      <p role="status" aria-live="polite" style={{ margin: 0 }}>{status}</p>
      {error && <p role="alert" style={{ margin: 0, color: "var(--sl-danger)" }}>{error}</p>}
    </form>
  );
}
