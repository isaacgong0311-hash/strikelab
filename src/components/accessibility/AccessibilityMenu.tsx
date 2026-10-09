"use client";

import { useEffect, useRef, useState } from "react";
import AccessibilityControls from "./AccessibilityControls";

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="a11y-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="a11y-menu-trigger"
        aria-expanded={open}
        aria-controls="a11y-quick-panel"
        aria-label="Accessibility display preferences"
        onClick={() => setOpen((value) => !value)}
      >
        {/* A half-filled circle, the usual symbol for display and contrast
            settings. The "Aa" it replaced suggested text size, which this
            panel (reduce motion, enhanced contrast) doesn't offer. */}
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div id="a11y-quick-panel" className="a11y-menu-panel" role="region" aria-label="Accessibility display preferences">
          <AccessibilityControls compact />
        </div>
      )}
    </div>
  );
}
