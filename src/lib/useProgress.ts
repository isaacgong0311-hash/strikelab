"use client";
import { useState, useEffect, useCallback } from "react";

const PROGRESS_KEY = "strikelab_progress_v2";

interface ProgressState {
  completed: string[];
  xp: number;
  streak: number;
  lastActivityDate: string | null;
  activityByDate: Record<string, number>; // "YYYY-MM-DD" -> lessons completed that day
}

const DEFAULT_STATE: ProgressState = {
  completed: [],
  xp: 0,
  streak: 0,
  lastActivityDate: null,
  activityByDate: {},
};

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function todayStr(): string {
  return toDateStr(new Date());
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

function last7DayStrs(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateStr(d));
  }
  return days;
}

/** Recalculate whether the stored streak is still alive. */
function resolveStreak(state: ProgressState): number {
  if (!state.lastActivityDate) return 0;
  const today = todayStr();
  const yesterday = yesterdayStr();
  if (state.lastActivityDate === today || state.lastActivityDate === yesterday) {
    return state.streak;
  }
  return 0; // streak expired
}

// XP thresholds and level names
export const XP_LEVELS = [
  { min: 0,    max: 99,   label: "Novice",          color: "#848484" },
  { min: 100,  max: 299,  label: "Options Student",  color: "#22c55e" },
  { min: 300,  max: 599,  label: "Greek Scholar",    color: "#3b82f6" },
  { min: 600,  max: 899,  label: "Quant Analyst",    color: "#a855f7" },
  { min: 900,  max: 9999, label: "Black-Scholes Pro",color: "#f59e0b" },
];

export function getLevel(xp: number) {
  return XP_LEVELS.findLast((l) => xp >= l.min) ?? XP_LEVELS[0];
}

export function getXpToNextLevel(xp: number): { progress: number; needed: number } {
  const level = XP_LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const current = XP_LEVELS[level];
  if (!current || level === XP_LEVELS.length - 1) {
    return { progress: 100, needed: 0 };
  }
  const next = XP_LEVELS[level + 1];
  const rangeSize = current.max - current.min + 1;
  const intoRange = xp - current.min;
  return {
    progress: Math.round((intoRange / rangeSize) * 100),
    needed: next.min - xp,
  };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateProgress = () => {
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ProgressState;
          // Migrate old v1 data if present
          const oldRaw = localStorage.getItem("strikelab_completed_v1");
          if (oldRaw && parsed.completed.length === 0) {
            try {
              const oldIds = JSON.parse(oldRaw) as string[];
              parsed.completed = oldIds;
              parsed.xp = oldIds.length * 100;
            } catch {
              // ignore
            }
          }
          setState(parsed);
        } else {
          // Migrate from v1 if exists
          const oldRaw = localStorage.getItem("strikelab_completed_v1");
          if (oldRaw) {
            try {
              const oldIds = JSON.parse(oldRaw) as string[];
              const migrated: ProgressState = {
                ...DEFAULT_STATE,
                completed: oldIds,
                xp: oldIds.length * 100,
              };
              setState(migrated);
              localStorage.setItem(PROGRESS_KEY, JSON.stringify(migrated));
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
      setHydrated(true);
    };

    const timeout = window.setTimeout(hydrateProgress, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  /**
   * Mark a lesson complete. Returns true if this was a NEW completion
   * (so the caller can trigger a celebration).
   */
  const markComplete = useCallback((id: string): boolean => {
    let wasNew = false;

    setState((prev) => {
      if (prev.completed.includes(id)) return prev; // already done — no change

      wasNew = true;
      const today = todayStr();
      const yesterday = yesterdayStr();

      // Update streak
      let newStreak = prev.streak;
      if (prev.lastActivityDate === today) {
        // Already active today — streak unchanged
      } else if (prev.lastActivityDate === yesterday) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1; // fresh start or expired streak
      }

      // Update daily activity
      const newActivity = { ...prev.activityByDate };
      newActivity[today] = (newActivity[today] ?? 0) + 1;

      const next: ProgressState = {
        completed: [...prev.completed, id],
        xp: prev.xp + 100,
        streak: newStreak,
        lastActivityDate: today,
        activityByDate: newActivity,
      };

      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    return wasNew;
  }, []);

  const completed = new Set(state.completed);
  const weekActivity = last7DayStrs().map((date) => state.activityByDate[date] ?? 0);
  const currentStreak = resolveStreak(state);
  const level = getLevel(state.xp);
  const xpProgress = getXpToNextLevel(state.xp);

  return {
    completed,
    markComplete,
    hydrated,
    xp: state.xp,
    streak: currentStreak,
    weekActivity,
    level,
    xpProgress,
  };
}
