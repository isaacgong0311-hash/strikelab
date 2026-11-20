"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  buildChecklist, checklistProgress, markReadiness, parseReadiness, READINESS_EVENT, READINESS_KEY,
} from "@/lib/seasons/checklist";
import { browserStorage } from "@/lib/seasons/draft";
import styles from "./studentHome.module.css";

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(READINESS_EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(READINESS_EVENT, notify);
  };
}

function snapshot(): string {
  try {
    return window.localStorage.getItem(READINESS_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * The four things that make a first season challenge go well. The handle and
 * friend count come from the server; the practice round and calendar are read
 * from this device (they aren't recorded anywhere else), so those two show as
 * to-do on the server render and update once the page is live.
 */
export default function SeasonChecklist({ handle, invited, seasonTitle }: { handle: string | null; invited: number | null; seasonTitle: string }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const items = buildChecklist({ handle, invited, flags: parseReadiness(raw) });
  const { done, total } = checklistProgress(items);

  return (
    <section className={styles.ready} aria-labelledby="home-ready-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Before your first challenge</p>
          <h2 id="home-ready-title">Get ready for {seasonTitle}</h2>
        </div>
        <span>{done} of {total} done</span>
      </div>
      <ol className={styles.readyList}>
        {items.map((item) => (
          <li key={item.id} className={styles.readyItem} data-done={item.done}>
            <span className={styles.readyMark} aria-hidden="true">{item.done ? "✓" : ""}</span>
            <div className={styles.readyText}>
              <strong>
                {item.title}
                <span className="sl-visually-hidden">{item.done ? " (done)" : " (to do)"}</span>
              </strong>
              <span>{item.detail}</span>
            </div>
            {!item.done && (item.download ? (
              <a className={styles.readyAction} href={item.href} download onClick={() => markReadiness(browserStorage(), "calendar")}>
                {item.action}
              </a>
            ) : (
              <Link className={styles.readyAction} href={item.href}>{item.action} <span aria-hidden="true">→</span></Link>
            ))}
          </li>
        ))}
      </ol>
    </section>
  );
}
