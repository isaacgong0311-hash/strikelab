import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { mdxComponents } from "@/components/blog/mdxComponents";

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return pageMetadata({
    path: `/blog/${slug}`,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: post.frontmatter.author,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },
    keywords: post.frontmatter.tags.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
  };

  const trail = [
    { name: "Blog", path: "/blog" },
    { name: post.frontmatter.title, path: `/blog/${slug}` },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <Eyebrow>Blog</Eyebrow>
      <h1
        className="text-4xl font-semibold mb-3 leading-tight"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {post.frontmatter.title}
      </h1>
      <div
        className="text-xs mb-10 flex items-center gap-2 flex-wrap"
        style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
      >
        <span>{post.frontmatter.author}</span>
        <span>·</span>
        <span>{post.frontmatter.date}</span>
        {post.frontmatter.tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              color: "var(--muted2)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="lesson-content">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
        />
      </div>

      <div className="mt-12 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <Link
          href="/blog"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--muted2)" }}
        >
          ← All posts
        </Link>
      </div>
    </div>
  );
}
