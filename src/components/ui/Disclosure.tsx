"use client";

import { useId, useState } from "react";
import styles from "./ui.module.css";

export default function Disclosure({ label, children, defaultOpen = false }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div>
      <button type="button" className={styles.disclosureButton} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
        <span>{label}</span><span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id={panelId} className={styles.disclosurePanel} hidden={!open}>{children}</div>
    </div>
  );
}
