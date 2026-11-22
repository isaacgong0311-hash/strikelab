"use client";
import { useEffect, useRef, useState } from "react";
import type { TocSection } from "@/lib/lessonToc";
import styles from "./LessonToc.module.css";

/**
 * Sticky section navigation for a lesson.
 *
 * Lessons run 12-20 minutes of prose with 5-8 <h2> sections, and until now
 * there was no way to see the shape of one, jump between parts, or tell how
 * far in you were — while a ~500px column of the viewport sat empty either
 * side of the text. This fills that space with the structure that was already
 * in the content.
 *
 * Scroll position is read with rAF-throttled scroll events rather than
 * IntersectionObserver: we want "which section am I reading" (the last heading
 * above the fold), not "which headings are visible", and the observer answer
 * gets ambiguous when a short section is fully on screen with its neighbours.
 *
 * `exercise`, when given, adds a last entry for the coding exercise below the
 * prose. It is spied on like a section, so it lights up once you reach it.
 */
export default function LessonToc({ sections, exercise }: { sections: TocSection[]; exercise?: TocSection }) {
  const entries = exercise ? [...sections, exercise] : sections;
  const [activeId, setActiveId] = useState<string>(entries[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (entries.length === 0) return;

    const measure = () => {
      tickingRef.current = false;

      // Reading progress across the article body, not the whole document —
      // the exercise and footer below shouldn't count as "lesson read".
      const article = document.querySelector(".lesson-content");
      if (article) {
        const rect = article.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const pct = total > 0 ? (scrolled / total) * 100 : scrolled >= 0 ? 100 : 0;
        setProgress(Math.min(100, Math.max(0, pct)));
      }

      // Active section = last heading whose top is above the reading line.
      // The 120px offset keeps a heading "active" once it's comfortably read
      // rather than the instant it crosses the very top of the viewport.
      const line = 120;
      let current = entries[0].id;
      for (const s of entries) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
        else break;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // `entries` is rebuilt every render; its contents only change with these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, exercise?.id]);

  if (sections.length < 2) return null;

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    // A focusable target (the exercise) takes focus, so the next Tab lands
    // in it rather than back in this list.
    if (el.tabIndex === -1) el.focus({ preventScroll: true });
    // Keep the URL shareable without triggering the browser's own jump.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className={styles.toc} aria-label="Lesson sections">
      <div className={styles.head}>
        <span className={styles.label}>On this page</span>
        <span className={`${styles.pct} sl-num`}>{Math.round(progress)}%</span>
      </div>

      <div className={styles.track} role="progressbar" aria-label="Lesson reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>

      <ol className={styles.list}>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => jump(e, s.id)}
              className={styles.item}
              aria-current={s.id === activeId ? "true" : undefined}
            >
              <span className={`${styles.num} sl-num`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.text}>{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
      {exercise && (
        <a
          href={`#${exercise.id}`}
          onClick={(e) => jump(e, exercise.id)}
          className={`${styles.item} ${styles.exercise}`}
          aria-current={exercise.id === activeId ? "true" : undefined}
        >
          <svg className={styles.num} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            <path d="M4.5 3 1.5 6l3 3M7.5 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.text}>{exercise.title}</span>
        </a>
      )}
    </nav>
  );
}
