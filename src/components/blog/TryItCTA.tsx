import Link from "next/link";

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
        marginTop: 32,
        marginBottom: 32,
        padding: "18px 20px",
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--paper-2, rgba(22,32,28,0.03))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 4 }}
        >
          Try it yourself
        </div>
        <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>
          {lessonTitle} — free, in your browser
        </div>
      </div>
      <Link
        href={href}
        className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
        style={{
          background: "var(--grass)",
          color: "#ffffff",
          fontFamily: "var(--font-mono)",
          borderRadius: 10,
          boxShadow: "0 3px 0 var(--grass-d)",
          whiteSpace: "nowrap",
        }}
      >
        Open lesson →
      </Link>
    </div>
  );
}
