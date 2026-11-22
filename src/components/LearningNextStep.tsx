"use client";

import { useSyncExternalStore } from "react";
import {
  LEARNING_DESTINATIONS,
  readLearningNextStep,
  saveLearningNextStep,
  serverLearningNextStep,
  subscribeLearningNextStep,
} from "@/lib/learningNextStep";
import { trackStartingPoint } from "@/lib/analytics";
import { ActionLink, Button } from "@/components/ui/Action";
import styles from "./marketing/marketing.module.css";

export default function LearningNextStep() {
  const href = useSyncExternalStore(subscribeLearningNextStep, readLearningNextStep, serverLearningNextStep);
  if (!href) return null;

  return (
    <aside className={styles.note} aria-label="Your saved next step" style={{ marginTop: "1.5rem" }}>
      <strong>Your next step: {LEARNING_DESTINATIONS[href]}</strong>
      <p className={styles.body}>Saved on this device from your starting-point check. Your lesson progress is tracked separately.</p>
      <div className={styles.ctaRow} style={{ marginTop: "1rem" }}>
        <ActionLink
          href={href}
          prefetch={false}
          variant="secondary"
          size="sm"
          onClick={() => trackStartingPoint("lesson_click", href)}
        >
          Continue learning →
        </ActionLink>
        <Button variant="ghost" size="sm" onClick={() => saveLearningNextStep(null)}>
          Clear saved step
        </Button>
      </div>
    </aside>
  );
}
