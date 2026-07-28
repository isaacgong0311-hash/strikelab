"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  fetchRemoteProgress,
  upsertRemoteProgress,
  mergeProgress,
  type ProgressPayload,
} from "@/lib/progress/sync";

const PROGRESS_KEY = "strikelab_progress_v2";

type ProgressState = ProgressPayload;

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

function readLocal(): ProgressState | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw) as ProgressState;
    // Migrate from v1 if present
    const oldRaw = localStorage.getItem("strikelab_completed_v1");
    if (oldRaw) {
      const oldIds = JSON.parse(oldRaw) as string[];
      return { ...DEFAULT_STATE, completed: oldIds, xp: oldIds.length * 100 };
    }
  } catch {
    // ignore
  }
  return null;
}

function writeLocal(state: ProgressState) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// XP thresholds and level names
// These render as TEXT (level chip, metric icon, level name), not just as
// fills, so they have to clear 4.5:1 on white. The previous values were all
// Tailwind-500 shades and every one failed — Novice worst of all at 3.74:1,
// which is the level every brand-new account sits at. Same hues, one step
// darker; measured ratios on white in the comment.
export const XP_LEVELS = [
  { min: 0,    max: 99,   label: "Novice",          color: "#6b6b6b" }, // 5.33:1
  { min: 100,  max: 299,  label: "Options Student",  color: "#147038" }, // 6.17:1
  { min: 300,  max: 599,  label: "Greek Scholar",    color: "#1d4ed8" }, // 6.70:1
  { min: 600,  max: 899,  label: "Quant Analyst",    color: "#7e22ce" }, // 6.99:1
  { min: 900,  max: 9999, label: "Black-Scholes Pro",color: "#92400e" }, // 7.09:1
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
  const { user } = useAuth();
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // 1. Hydrate from localStorage immediately (works logged-out / offline).
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const local = readLocal();
      if (local) {
        setState(local);
        writeLocal(local);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  // 2. When a user signs in, reconcile local <-> cloud and keep userId ref.
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    const supabase = getSupabaseBrowser();
    if (!user || !supabase) return;

    let active = true;
    (async () => {
      const remote = await fetchRemoteProgress(supabase, user.id);
      const local = readLocal() ?? DEFAULT_STATE;
      const merged = remote ? mergeProgress(remote, local) : local;
      if (!active) return;
      setState(merged);
      writeLocal(merged);
      setHydrated(true);
      // Push the reconciled state up so local completions migrate to the cloud.
      await upsertRemoteProgress(supabase, user.id, merged);
    })();

    return () => {
      active = false;
    };
  }, [user]);

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

      writeLocal(next);

      // Persist to the cloud if signed in (fire-and-forget).
      const supabase = getSupabaseBrowser();
      const uid = userIdRef.current;
      if (supabase && uid) {
        void upsertRemoteProgress(supabase, uid, next);
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
