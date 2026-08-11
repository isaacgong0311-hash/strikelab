import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

export const alt = "StrikeLab blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

/** Per-post social card — same layout language as the lesson card so a
 * shared blog link and a shared lesson link read as the same product. */
export default async function BlogOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const title = post?.frontmatter.title ?? "StrikeLab Blog";
  const description = post?.frontmatter.description ?? "Options pricing and quant finance, worked through.";

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
          <div style={{ fontSize: 24, color: "#5f8570" }}>Blog</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 34 ? 58 : 72,
              fontWeight: 800,
              color: "#fafaf9",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#9bbfae", maxWidth: 940 }}>
            {description}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#4ade80", fontWeight: 600 }}>
          {SITE_URL.replace(/^https:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
