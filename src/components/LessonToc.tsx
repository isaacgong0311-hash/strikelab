"use client";
import { useEffect, useRef, useState } from "react";
import type { TocSection } from "@/lib/lessonToc";

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
 */
export default function LessonToc({ sections }: { sections: TocSection[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (sections.length === 0) return;

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
      let current = sections[0].id;
      for (const s of sections) {
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
  }, [sections]);

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
    // Keep the URL shareable without triggering the browser's own jump.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="lt" aria-label="Lesson sections">
      <div className="lt-head">
        <span className="lt-label">On this page</span>
        <span className="lt-pct">{Math.round(progress)}%</span>
      </div>

      <div className="lt-track" role="presentation">
        <div className="lt-fill" style={{ width: `${progress}%` }} />
      </div>

      <ol className="lt-list">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => jump(e, s.id)}
              className={`lt-item${s.id === activeId ? " active" : ""}`}
              aria-current={s.id === activeId ? "true" : undefined}
            >
              <span className="lt-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="lt-text">{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
