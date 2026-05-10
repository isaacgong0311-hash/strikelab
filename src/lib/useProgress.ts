"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "strikelab_completed_v1";

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const markComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { completed, markComplete, hydrated };
}
