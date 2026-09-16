"use client";

import { useAccessibilityPreferences } from "./AccessibilityProvider";

export default function AccessibilityControls({ compact = false }: { compact?: boolean }) {
  const { preferences, resolved, setPreference, reset } = useAccessibilityPreferences();
  const followsSystem = preferences.reduceMotion === null && preferences.enhancedContrast === null;

  return (
    <fieldset className={compact ? "a11y-controls compact" : "a11y-controls"}>
      <legend>{compact ? "Display preferences" : "Accessibility"}</legend>
      {!compact && (
        <p className="a11y-controls-help">
          These settings are saved only in this browser. Device preferences are used by default.
        </p>
      )}
      <label className="a11y-switch">
        <input
          type="checkbox"
          checked={resolved.reduceMotion}
          onChange={(event) => setPreference("reduceMotion", event.target.checked)}
        />
        <span>
          <strong>Reduce motion</strong>
          {!compact && <small>Stops decorative movement and animated transitions.</small>}
        </span>
      </label>
      <label className="a11y-switch">
        <input
          type="checkbox"
          checked={resolved.enhancedContrast}
          onChange={(event) => setPreference("enhancedContrast", event.target.checked)}
        />
        <span>
          <strong>Enhanced contrast</strong>
          {!compact && <small>Strengthens text, borders, and interactive states.</small>}
        </span>
      </label>
      <button type="button" className="a11y-reset" onClick={reset} disabled={followsSystem}>
        Use device settings
      </button>
    </fieldset>
  );
}
