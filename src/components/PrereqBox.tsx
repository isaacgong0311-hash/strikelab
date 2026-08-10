import type { LessonPrereqs } from "@/lib/lessons";
import Eyebrow from "@/components/Eyebrow";

/**
 * "Before this lesson" box — sits between the lesson header and the content.
 * States the background a lesson assumes in plain language (not a topic
 * checklist) and links out to 1-2 outside resources for anyone missing it,
 * so a gap in prior knowledge is a two-minute detour instead of a reason to
 * bounce off the lesson entirely.
 */
export default function PrereqBox({ prereqs }: { prereqs: LessonPrereqs }) {
  return (
    <div className="lesson-prereqs">
      <Eyebrow className="mb-1.5">Before this lesson</Eyebrow>
      <p className="lesson-prereqs-summary">{prereqs.summary}</p>
      {prereqs.resources && prereqs.resources.length > 0 && (
        <div className="lesson-prereqs-links">
          {prereqs.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lesson-prereqs-link"
            >
              {r.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
