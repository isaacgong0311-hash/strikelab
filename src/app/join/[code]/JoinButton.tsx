"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./join.module.css";

export default function JoinButton({ code }: { code: string }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't join the class");
      router.push(data.isCohort ? `/cohort/${data.id}` : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join the class");
      setJoining(false);
    }
  }

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.primary} onClick={join} disabled={joining}>
        {joining ? "Joining…" : "Join class"}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
