"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { KickoffLive as KickoffLiveData, KickoffStage } from "@/lib/teach/kickoffSummary";
import styles from "../../teach.module.css";

const POLL_MS = 10_000;

const STAGE_LABEL: Record<KickoffStage, string> = {
  joined: "Joined",
  "first-session": "Finished the first short lesson",
  "first-lesson": "Finished lesson 1",
};

/**
 * During the first meeting: who has joined and who has finished the first
 * short lesson, refreshed every 10 seconds while this tab is visible, so the
 * leader can walk over to whoever is stuck (mega plan Q2).
 */
export default function KickoffLive({ classId }: { classId: string }) {
  const [live, setLive] = useState<KickoffLiveData | null>(null);
  const [failed, setFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const poll = async () => {
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch(`/api/classes/${classId}/live`, { cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as KickoffLiveData;
          if (!active) return;
          setLive(data);
          setFailed(false);
          setUpdatedAt(new Date());
        } catch {
          if (active) setFailed(true);
        }
      }
      if (active) timer = window.setTimeout(poll, POLL_MS);
    };
    void poll();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        void poll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [classId]);

  const status = failed
    ? "Couldn't refresh. Retrying…"
    : updatedAt
      ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`
      : null;
  return <KickoffLiveView live={live} failed={failed} status={status} />;
}

/**
 * The panel itself, fed by the poller above or, on /demo, by a made-up
 * meeting (src/lib/demo/kickoffDemo.ts), so the two can't drift apart.
 */
export function KickoffLiveView({
  live,
  failed = false,
  status,
  controls,
}: {
  live: KickoffLiveData | null;
  failed?: boolean;
  status: string | null;
  controls?: ReactNode;
}) {
  return (
    <section className={styles.panel} aria-labelledby="live-title">
      <div>
        <h2 id="live-title" className={styles.sectionTitle}>During your first meeting</h2>
        <p className={styles.muted}>
          Keep this open while students join. It updates by itself, and students still at &ldquo;Joined&rdquo; are listed first so you
          know who to help.
        </p>
      </div>
      {controls}

      {live === null ? (
        <p className={styles.muted} role="status">{failed ? "Couldn't load who's joined. Retrying…" : "Loading…"}</p>
      ) : (
        <>
          <dl className={styles.stats} aria-live="polite" aria-atomic="true">
            <div className={styles.stat}>
              <dt>Joined</dt>
              <dd>{live.joined}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Finished first short lesson</dt>
              <dd>{live.finishedFirstSession}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Finished lesson 1</dt>
              <dd>{live.finishedFirstLesson}</dd>
            </div>
          </dl>

          {live.students.length === 0 ? (
            <p className={styles.muted}>No one has joined yet. Put the link or the join card up, and students will appear here.</p>
          ) : (
            <ul className={styles.liveList}>
              {live.students.map((s, i) => (
                <li key={`${s.name}-${i}`} data-stage={s.stage}>
                  <span>{s.name}</span>
                  <span className={styles.liveStage}>{STAGE_LABEL[s.stage]}</span>
                </li>
              ))}
            </ul>
          )}

          <p className={styles.muted}>{status}</p>
        </>
      )}
    </section>
  );
}
