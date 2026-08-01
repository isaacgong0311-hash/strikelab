"use client";
import Link from "next/link";
import { TRACKS } from "@/lib/tracks";
import { useProgress } from "@/lib/useProgress";

const OFFSETS = [0, 44, 62, 44, 0, -44, -62, -44];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "var(--sky)",
  Intermediate: "var(--grass)",
  Advanced:     "var(--coral)",
};

export default function LessonsClient() {
  const { completed, hydrated, xp, streak } = useProgress();

  const totalLessons = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
  const doneCount = hydrated
    ? TRACKS.flatMap((t) => t.lessons).filter((l) => completed.has(l.id)).length
    : 0;

  const pct = totalLessons ? (doneCount / totalLessons) * 100 : 0;

  return (
    <div className="dpath">
      {/* Header */}
      <div className="dpath-head">
        <div className="dpath-head-row">
          <div>
            <div className="v2-sec-label">Curriculum</div>
            <h1 className="dpath-title">Your learning path</h1>
          </div>
          <div className="dpath-stats">
            <div className="dstat">
              <span className="i">🔥</span>
              <b>{hydrated ? streak : 0}</b>
              <span className="l">streak</span>
            </div>
            <div className="dstat">
              <span className="i">✦</span>
              <b>{hydrated ? xp : 0}</b>
              <span className="l">XP</span>
            </div>
            <div className="dstat">
              <b>{doneCount}/{totalLessons}</b>
              <span className="l">done</span>
            </div>
          </div>
        </div>
        <div className="dpath-progress">
          <div className="dpath-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tracks */}
      {TRACKS.map((track) => {
        const trackDone = hydrated
          ? track.lessons.filter((l) => completed.has(l.id)).length
          : 0;
        const activeId = hydrated
          ? track.lessons.find((l) => !completed.has(l.id))?.id ?? null
          : track.lessons[0]?.id ?? null;
        const levelColor = LEVEL_COLORS[track.level] ?? "var(--grass)";

        return (
          <div key={track.id}>
            {/* Unit banner */}
            <div
              className="dunit-banner"
              style={{ background: levelColor, boxShadow: `0 5px 0 color-mix(in srgb, ${levelColor} 70%, #000)` }}
            >
              <div>
                <div className="t">{track.title}</div>
                <div className="s">
                  {track.subtitle} · {track.level} · {trackDone}/{track.lessons.length} complete
                </div>
              </div>
              <span className="dunit-icon">{track.icon}</span>
            </div>

            {/* Winding path */}
            <div className="dpath-nodes">
              {track.lessons.map((lesson, i) => {
                const done = hydrated && completed.has(lesson.id);
                const isActive = !done && lesson.id === activeId;
                const off = OFFSETS[i % OFFSETS.length];
                const state = done ? "done" : isActive ? "active" : "open";

                return (
                  <div
                    key={lesson.id}
                    className={`dnode ${state}`}
                    style={{
                      transform: `translateX(${off}px)`,
                      "--node-color": levelColor,
                    } as React.CSSProperties}
                  >
                    {isActive && <span className="dnode-start">START</span>}
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="dnode-btn"
                      style={
                        state === "done"
                          ? { background: levelColor, boxShadow: `0 6px 0 color-mix(in srgb, ${levelColor} 70%, #000)` }
                          : state === "active"
                          ? { background: "#fff", color: levelColor, border: `3px solid ${levelColor}`, boxShadow: `0 6px 0 color-mix(in srgb, ${levelColor} 20%, #fff)` }
                          : { background: "#fff", color: levelColor, border: `2px solid ${levelColor}44`, boxShadow: `0 2px 0 #e7e5e4` }
                      }
                      aria-label={lesson.title}
                    >
                      {state === "done" ? "✓" : i + 1}
                    </Link>
                    <div className="dnode-label">{lesson.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
