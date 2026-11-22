import { ActionLink } from "@/components/ui/Action";

/**
 * The one recurring conversion point inside a blog post — every article maps
 * to exactly one lesson (`relatedLesson` in frontmatter), and this is the
 * bridge from "read about it" to "build it yourself." Deliberately not a
 * generic "explore StrikeLab" link: it goes straight to the lesson that
 * teaches what the post just explained, since that's the actual next step.
 */
export default function TryItCTA({
  href,
  lessonTitle,
}: {
  href: string;
  lessonTitle: string;
}) {
  return (
    <div
      style={{
        marginBlock: 32,
        padding: "16px 20px",
        borderRadius: "var(--sl-radius-lg)",
        border: "1px solid var(--sl-border)",
        background: "var(--sl-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sl-brand-strong)", marginBottom: 2 }}>
          Try it yourself
        </div>
        <div style={{ fontSize: 15, color: "var(--sl-text)", fontWeight: 600 }}>
          {lessonTitle} — free, in your browser
        </div>
      </div>
      <ActionLink href={href} style={{ whiteSpace: "nowrap" }}>
        Open lesson →
      </ActionLink>
    </div>
  );
}
