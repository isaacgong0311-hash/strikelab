import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata = pageMetadata({
  path: "/blog",
  title: "Blog",
  description:
    "Deep, worked explanations of options pricing and quant finance — Black-Scholes, the Greeks, CAPM, backtesting — with real Python, for students.",
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <JsonLd data={breadcrumbJsonLd([{ name: "Blog", path: "/blog" }])} />
      <Breadcrumbs trail={[{ name: "Blog", path: "/blog" }]} />

      <div className="mb-10 v2-page-head" data-v2-head>
        <Eyebrow>Blog</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Options pricing and quant finance, worked through
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          Each post takes one concept — Black-Scholes, a Greek, a portfolio idea — and
          works through the math and a real Python snippet, the way we&rsquo;d explain it
          to a strong high schooler who knows pre-calc. Not a textbook restatement.
        </p>
      </div>

      <div className="flex flex-col" data-v2-stagger>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="v2-rise py-5 border-b transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", display: "block" }}
          >
            <div
              className="text-xs mb-1.5"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {post.frontmatter.date}
            </div>
            <h2
              className="text-lg font-semibold mb-1.5"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {post.frontmatter.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted2)" }}>
              {post.frontmatter.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
