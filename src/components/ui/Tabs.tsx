"use client";

import { useId, useRef } from "react";
import styles from "./ui.module.css";

export interface TabItem { id: string; label: React.ReactNode }

export function TabList({ label, items, activeId, onChange, idPrefix }: { label: string; items: TabItem[]; activeId: string; onChange: (id: string) => void; idPrefix?: string }) {
  const generatedId = useId();
  const baseId = idPrefix ?? generatedId;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  function selectAt(index: number) {
    const normalized = (index + items.length) % items.length;
    onChange(items[normalized].id);
    refs.current[normalized]?.focus();
  }
  return (
    <div className={styles.tabList} role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(node) => { refs.current[index] = node; }}
          type="button"
          role="tab"
          id={`${baseId}-tab-${item.id}`}
          aria-controls={`${baseId}-panel-${item.id}`}
          aria-selected={activeId === item.id}
          tabIndex={activeId === item.id ? 0 : -1}
          className={styles.tab}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") { event.preventDefault(); selectAt(index + 1); }
            if (event.key === "ArrowLeft") { event.preventDefault(); selectAt(index - 1); }
            if (event.key === "Home") { event.preventDefault(); selectAt(0); }
            if (event.key === "End") { event.preventDefault(); selectAt(items.length - 1); }
          }}
        >{item.label}</button>
      ))}
    </div>
  );
}

export function TabPanel({ id, activeId, idPrefix, children }: { id: string; activeId: string; idPrefix: string; children: React.ReactNode }) {
  return <div id={`${idPrefix}-panel-${id}`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0} hidden={id !== activeId}>{children}</div>;
}
