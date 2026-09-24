import styles from "./teach.module.css";

const STEPS = ["Name your class", "Pick your dates", "Invite students"];

/** Progress through the three setup screens; step is 1-based. */
export default function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className={styles.stepper} aria-label={`Setup, step ${step} of ${STEPS.length}`}>
      {STEPS.map((label, i) => (
        <li key={label} data-done={i + 1 < step ? "" : undefined} aria-current={i + 1 === step ? "step" : undefined}>
          {label}
        </li>
      ))}
    </ol>
  );
}
