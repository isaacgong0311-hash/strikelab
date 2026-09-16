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
        <span aria-hidden="true">Aa</span>
      </button>
      {open && (
        <div id="a11y-quick-panel" className="a11y-menu-panel" role="region" aria-label="Accessibility display preferences">
          <AccessibilityControls compact />
        </div>
      )}
    </div>
  );
}
