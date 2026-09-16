"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./ui.module.css";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Dialog({ open, onClose, title, children, closeLabel = "Close dialog" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; closeLabel?: string }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const inerted = new Map<HTMLElement, boolean>();
    let branch: HTMLElement | null = dialog;
    while (branch?.parentElement && branch.parentElement !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || !(sibling instanceof HTMLElement) || inerted.has(sibling)) continue;
        inerted.set(sibling, sibling.inert);
        sibling.inert = true;
      }
      branch = branch.parentElement;
    }
    for (const child of document.body.children) {
      if (child === branch || !(child instanceof HTMLElement) || inerted.has(child)) continue;
      inerted.set(child, child.inert);
      child.inert = true;
    }
    dialog?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      inerted.forEach((wasInert, element) => { element.inert = wasInert; });
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.dialogHeader}>
          <h2 id={titleId} className={styles.dialogTitle}>{title}</h2>
          <button type="button" className={styles.dialogClose} onClick={onClose} aria-label={closeLabel}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
