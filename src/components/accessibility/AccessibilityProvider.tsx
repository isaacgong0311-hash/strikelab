"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  parseAccessibilityPreferences,
  resolveAccessibilityPreferences,
  serializeAccessibilityPreferences,
  type AccessibilityPreferences,
  type SystemAccessibilityPreferences,
} from "@/lib/accessibility/preferences";

interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  resolved: SystemAccessibilityPreferences;
  setPreference: <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => void;
  reset: () => void;
}

const DEFAULT_SYSTEM: SystemAccessibilityPreferences = {
  reduceMotion: false,
  enhancedContrast: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readSystemPreferences(): SystemAccessibilityPreferences {
  if (typeof window === "undefined") return DEFAULT_SYSTEM;
  return {
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    enhancedContrast: window.matchMedia("(prefers-contrast: more)").matches,
  };
}

export default function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_ACCESSIBILITY_PREFERENCES);
  const [system, setSystem] = useState<SystemAccessibilityPreferences>(DEFAULT_SYSTEM);

  useEffect(() => {
    document.documentElement.dataset.clientReady = "true";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrast = window.matchMedia("(prefers-contrast: more)");
    const refresh = () => setSystem(readSystemPreferences());
    const id = window.setTimeout(() => {
      setPreferences(parseAccessibilityPreferences(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)));
      refresh();
    }, 0);
    motion.addEventListener("change", refresh);
    contrast.addEventListener("change", refresh);
    return () => {
      delete document.documentElement.dataset.clientReady;
      window.clearTimeout(id);
      motion.removeEventListener("change", refresh);
      contrast.removeEventListener("change", refresh);
    };
  }, []);

  const resolved = useMemo(
    () => resolveAccessibilityPreferences(preferences, system),
    [preferences, system],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = resolved.reduceMotion ? "reduce" : "full";
    root.dataset.contrast = resolved.enhancedContrast ? "more" : "standard";
  }, [resolved]);

  const setPreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, serializeAccessibilityPreferences(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    setPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
  }, []);

  const value = useMemo(
    () => ({ preferences, resolved, setPreference, reset }),
    [preferences, resolved, setPreference, reset],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibilityPreferences(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibilityPreferences must be used inside AccessibilityProvider");
  return context;
}
