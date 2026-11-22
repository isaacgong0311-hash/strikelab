import styles from "./lessonBrief.module.css";

/**
 * "From your desk head" note: frames the lesson as an assigned task rather
 * than a topic to read about. Every lesson in all three tracks has one (see
 * `deskBriefing` in lessons.ts). It renders inside the lesson's collapsed
 * "Before you start" disclosure, so it costs no space above the first
 * paragraph until a student opens it.
 */
export default function DeskBriefing({ text }: { text: string }) {
  return (
    <div className={styles.item}>
      <p className={styles.itemLabel}>From your desk head</p>
      <p className={styles.itemText}>{text}</p>
    </div>
  );
}
