"use client";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import { useProgress } from "@/lib/useProgress";
import { ACHIEVEMENTS, isUnlocked } from "@/lib/achievements";

export default function AchievementsClient() {
  const { completed, hydrated } = useProgress();
  const unlockedCount = hydrated ? ACHIEVEMENTS.filter((a) => isUnlocked(a, completed)).length : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
        <div>
          <Eyebrow>Progress</Eyebrow>
          <h1
            className="text-4xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            Achievements
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink-2)" }}>
            {hydrated ? `${unlockedCount} of ${ACHIEVEMENTS.length} unlocked` : "Loading…"}
          </p>
        </div>
        <Link href="/dashboard" className="db-ghost-btn">← Back to dashboard</Link>
      </div>

      <div className="ach-page-grid">
        {ACHIEVEMENTS.map((a) => {
          const current = hydrated ? a.progress(completed) : 0;
          const unlocked = hydrated && isUnlocked(a, completed);
          const showBar = a.total > 1;
          return (
            <div key={a.id} className={`db-ach ach-page-card ${unlocked ? "unlocked" : ""}`}>
              {unlocked && <div className="db-ach-glow" />}
              <div className="db-ach-icon">{a.icon}</div>
              <div className="db-ach-name">{a.name}</div>
              <div className="db-ach-desc">{a.desc}</div>
              {showBar ? (
                <div className="ach-page-progress">
                  <div className="db-mini-bar">
                    <div
                      className="db-mini-bar-fill"
                      style={{ width: `${Math.round((current / a.total) * 100)}%`, background: unlocked ? "var(--amber)" : "var(--ink-3)" }}
                    />
                  </div>
                  <span className="ach-page-progress-n">{current}/{a.total}</span>
                </div>
              ) : (
                <div className="ach-page-status" style={{ color: unlocked ? "var(--amber)" : "var(--ink-3)" }}>
                  {unlocked ? "Unlocked" : "Locked"}
                </div>
              )}
              {unlocked && <div className="db-ach-check">✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
