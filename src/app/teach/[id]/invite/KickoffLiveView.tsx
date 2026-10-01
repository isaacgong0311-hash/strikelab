import type { KickoffLive as KickoffLiveData, KickoffStage } from "@/lib/teach/kickoffLive";
import styles from "../../teach.module.css";

const STAGE_LABEL: Record<KickoffStage, string> = {
  joined: "Joined",
  "first-session": "Finished the first short lesson",
  "first-lesson": "Finished lesson 1",
};

/**
 * The kickoff live view's markup, with no data fetching, so the real invite
 * page (which polls) and /demo (which plays sample data) render the same thing.
 */
export default function KickoffLiveView({
  live,
  failed = false,
  updatedAt = null,
}: {
  live: KickoffLiveData | null;
  failed?: boolean;
  updatedAt?: Date | null;
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

          <p className={styles.muted}>
            {failed ? "Couldn't refresh. Retrying…" : updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}` : null}
          </p>
        </>
      )}
    </section>
  );
}
