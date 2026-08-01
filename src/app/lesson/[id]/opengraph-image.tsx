import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";
import { getAllLessons, getLessonContext } from "@/lib/tracks";

export const alt = "StrikeLab lesson";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender all 29 cards at build time instead of on first share.
export function generateStaticParams() {
  return getAllLessons().map((l) => ({ id: l.id }));
}

/**
 * Per-lesson social card. Without this, every lesson shared to Discord, AoPS,
 * or X rendered the same generic homepage image — the link gave no hint which
 * lesson it was, which is exactly the CTR the card exists to earn.
 */
export default async function LessonOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = getLessonContext(id);

  const title = ctx?.lesson.title ?? "Options Pricing & Quant Finance";
  const subtitle = ctx?.lesson.subtitle ?? "Learn it by building it in Python.";
  const trackLabel = ctx
    ? `${ctx.track.title} · Lesson ${ctx.positionInTrack} of ${ctx.trackLength}`
    : "StrikeLab";
  const duration = ctx?.lesson.duration ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b1410 0%, #0f2a1c 100%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#4ade80" }}>
            ∂ StrikeLab
          </div>
          <div style={{ fontSize: 24, color: "#5f8570" }}>{trackLabel}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 34 ? 62 : 76,
              fontWeight: 800,
              color: "#fafaf9",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 32, color: "#9bbfae", maxWidth: 940 }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#4ade80",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex" }}>
            {SITE_URL.replace(/^https:\/\//, "")}
          </div>
          {duration ? (
            <div style={{ display: "flex", color: "#5f8570" }}>
              {duration} · free
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size }
  );
}
