"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LESSONS } from "@/lib/lessons";
import { useProgress, getLevel, getXpToNextLevel, XP_LEVELS } from "@/lib/useProgress";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const ACHIEVEMENTS = [
  { id: "first",    icon: "🎯", name: "First Strike",  desc: "Complete your first lesson",     unlocked: (ids: Set<string>) => ids.size >= 1 },
  { id: "parity",   icon: "⚖️", name: "Parity Pro",    desc: "Master Put-Call Parity",         unlocked: (ids: Set<string>) => ids.has("2") },
  { id: "bsm",      icon: "∂",  name: "BSM Builder",   desc: "Implement Black-Scholes",        unlocked: (ids: Set<string>) => ids.has("3") },
  { id: "greeks",   icon: "Δ",  name: "Greek Scholar", desc: "Complete all 4 Greek lessons",   unlocked: (ids: Set<string>) => ["4","5","6","7"].every((id) => ids.has(id)) },
  { id: "iv",       icon: "σ",  name: "Vol Wizard",    desc: "Solve for implied vol",          unlocked: (ids: Set<string>) => ids.has("8") },
  { id: "strategy", icon: "🦅", name: "Strategist",    desc: "Learn option strategies",        unlocked: (ids: Set<string>) => ids.has("9") },
];

export default function DashboardClient() {
  const { completed, hydrated, xp, streak, weekActivity } = useProgress();
  const completedCount = hydrated ? LESSONS.filter((l) => completed.has(l.id)).length : 0;
  const nextLesson = hydrated
    ? LESSONS.find((l) => !completed.has(l.id)) ?? LESSONS[0]
    : LESSONS[0];
  const pct = (completedCount / LESSONS.length) * 100;

  const level = getLevel(xp);
  const { progress, needed } = getXpToNextLevel(xp);
  const levelNum = XP_LEVELS.findIndex((l) => l.label === level.label) + 1;

  const [firstName, setFirstName] = useState("Isaac");
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("sl_user") || "null");
      if (u?.name) setFirstName(String(u.name).split(" ")[0]);
    } catch {}
  }, []);

  const week = weekActivity ?? [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...week, 1);
  const today = new Date().getDay();
  const mondayOffset = (today + 6) % 7;

  const STATS = [
    { v: `${completedCount}`,                l: "Lessons done",  c: "var(--grass)" },
    { v: `${hydrated ? streak : 0}`,         l: "Day streak",    c: "var(--coral)" },
    { v: hydrated ? xp.toLocaleString() : "0", l: "Total XP",    c: "var(--amber)" },
    { v: completedCount > 0 ? "100%" : "—",  l: "Accuracy",      c: "var(--sky)" },
  ];

  return (
    <div className="dash">
      {/* Header */}
      <div className="dash-head">
        <div>
          <div className="v2-sec-label">Dashboard</div>
          <h1 className="dash-title">Welcome back, {firstName}</h1>
          <p className="dash-sub">
            {completedCount}/{LESSONS.length} lessons complete
            {hydrated && streak > 0 && ` · 🔥 ${streak}-day streak`}
          </p>
        </div>
        <Link href={`/lesson/${nextLesson.id}`} className="v2-btn">
          {completedCount === 0 ? "Start lesson 01" : "Resume"} <span className="v2-arr">→</span>
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="dash-stats">
        {STATS.map((s) => (
          <div key={s.l} className="dash-stat">
            <div className="n" style={{ color: s.c }}>{s.v}</div>
            <div className="l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Level + streak */}
      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Level &amp; XP</h2>
            <span className="dash-level-chip" style={{ background: `${level.color}1f`, color: level.color }}>Lv.{levelNum}</span>
          </div>
          <div className="dash-level-name" style={{ color: level.color }}>{level.label}</div>
          <div className="muted-mono" style={{ marginBottom: 14 }}>{hydrated ? xp.toLocaleString() : 0} XP total</div>
          <div className="dash-bar" style={{ marginBottom: 8 }}>
            <div className="dash-bar-fill" style={{ width: `${progress}%`, background: level.color }} />
          </div>
          <div className="dash-level-foot">
            <span>{progress}% to next level</span>
            {needed > 0 && <span>{needed} XP needed</span>}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Last 7 days</h2>
            <span className="muted-mono" style={{ color: hydrated && streak > 0 ? "var(--coral)" : "var(--ink-3)" }}>
              {hydrated && streak > 0 ? `🔥 ${streak}-day streak` : "Start your streak"}
            </span>
          </div>
          <div className="dash-streak">
            {week.map((v, i) => {
              const isToday = i === mondayOffset;
              const h = v > 0 ? Math.max((v / max) * 100, 14) : 6;
              return (
                <div key={i} className="dash-streak-col">
                  <div
                    className="dash-streak-bar"
                    style={{ height: `${h}%`, background: v > 0 ? (isToday ? "var(--coral)" : "var(--grass)") : "var(--line-2)" }}
                  />
                  <span style={{ color: isToday ? "var(--ink)" : "var(--ink-3)", fontWeight: isToday ? 700 : 400 }}>{DAY_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
          <p className="dash-note">Finish a lesson each day to grow your streak.</p>
        </div>
      </div>

      {/* Progress + up next */}
      <div className="dash-grid-3">
        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Curriculum progress</h2>
            <span className="muted-mono">{Math.round(pct)}%</span>
          </div>
          <div className="dash-bar" style={{ marginBottom: 16 }}><div className="dash-bar-fill" style={{ width: `${pct}%` }} /></div>
          <div className="dash-lesson-list">
            {LESSONS.map((l, i) => {
              const done = hydrated && completed.has(l.id);
              const isCurrent = hydrated && !done && l.id === nextLesson.id;
              return (
                <Link key={l.id} href={`/lesson/${l.id}`} className="dash-lesson-row">
                  <span className={`dash-check ${done ? "done" : ""}`} style={isCurrent ? { borderColor: "var(--grass)", color: "var(--grass)" } : undefined}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span style={{ color: done ? "var(--ink-3)" : "var(--ink)" }}>{l.title}</span>
                  {done && <span className="dash-xp-tag">+100 XP</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="dash-card dash-upnext">
          <div className="v2-sec-label" style={{ marginBottom: 12 }}>Up next</div>
          <h3>{nextLesson.title}</h3>
          <p>{nextLesson.subtitle}</p>
          <div className="dash-upnext-meta">{nextLesson.duration} · 1 exercise · +100 XP</div>
          <Link href={`/lesson/${nextLesson.id}`} className="v2-btn" style={{ width: "100%" }}>
            {completedCount === 0 ? "Start" : "Continue"} <span className="v2-arr">→</span>
          </Link>
        </div>
      </div>

      {/* Achievements */}
      <div className="dash-card" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--ink)", marginBottom: 16 }}>Achievements</h2>
        <div className="dash-ach">
          {ACHIEVEMENTS.map((a) => {
            const u = hydrated && a.unlocked(completed);
            return (
              <div key={a.id} className={`sl-badge${u ? " unlocked" : ""}`} title={a.desc}>
                <div className="sl-badge-icon">{a.icon}</div>
                <div className="sl-badge-name">{a.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="dash-quick">
        {[
          { href: "/lessons",    glyph: "∫", t: "Learning path", d: "All your lessons",   cls: "g" },
          { href: "/playground", glyph: "ƒ", t: "Playground",    d: "Live Greek sandbox", cls: "s" },
          { href: "/roadmap",    glyph: "◈", t: "Roadmap",       d: "What’s next",   cls: "c" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="dash-quick-card">
            <span className={`dash-quick-icon ${q.cls}`}>{q.glyph}</span>
            <div className="flex-1">
              <div className="t">{q.t}</div>
              <div className="d">{q.d}</div>
            </div>
            <span className="dash-quick-arr">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
