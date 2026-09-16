export const ACCESSIBILITY_STORAGE_KEY = "strikelab:a11y:v1";

export interface AccessibilityPreferences {
  reduceMotion: boolean | null;
  enhancedContrast: boolean | null;
}

export interface SystemAccessibilityPreferences {
  reduceMotion: boolean;
  enhancedContrast: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  reduceMotion: null,
  enhancedContrast: null,
};

export function parseAccessibilityPreferences(value: string | null): AccessibilityPreferences {
  if (!value) return DEFAULT_ACCESSIBILITY_PREFERENCES;
  try {
    const parsed = JSON.parse(value) as Partial<AccessibilityPreferences>;
    return {
      reduceMotion: typeof parsed.reduceMotion === "boolean" ? parsed.reduceMotion : null,
      enhancedContrast: typeof parsed.enhancedContrast === "boolean" ? parsed.enhancedContrast : null,
    };
  } catch {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }
}

export function resolveAccessibilityPreferences(
  preferences: AccessibilityPreferences,
  system: SystemAccessibilityPreferences,
): SystemAccessibilityPreferences {
  return {
    reduceMotion: preferences.reduceMotion ?? system.reduceMotion,
    enhancedContrast: preferences.enhancedContrast ?? system.enhancedContrast,
  };
}

export function serializeAccessibilityPreferences(preferences: AccessibilityPreferences): string {
  return JSON.stringify(preferences);
}

export const ACCESSIBILITY_BOOT_SCRIPT = `(()=>{try{const k=${JSON.stringify(ACCESSIBILITY_STORAGE_KEY)};const v=JSON.parse(localStorage.getItem(k)||'{}');const m=typeof v.reduceMotion==='boolean'?v.reduceMotion:matchMedia('(prefers-reduced-motion: reduce)').matches;const c=typeof v.enhancedContrast==='boolean'?v.enhancedContrast:matchMedia('(prefers-contrast: more)').matches;const r=document.documentElement;r.dataset.motion=m?'reduce':'full';r.dataset.contrast=c?'more':'standard'}catch{}})()`;
