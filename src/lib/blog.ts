import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  author: string;
  tags: string[];
  targetKeyword: string;
  relatedLesson: string; // lesson id, e.g. "3" or "q1" or "inv-1"
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string; // raw MDX body, compiled by the [slug] page
}

/**
 * Reads content/blog/*.mdx at request/build time. This runs on the server
 * only (route handlers, Server Components) — `fs` isn't available in the
 * Edge runtime or client components. Every page here already runs on the
 * default Node runtime, so this doesn't require any extra config.
 */
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: filename.replace(/\.mdx$/, ""),
        frontmatter: data as BlogFrontmatter,
        content,
      };
    })
    // Newest first — matches how /lessons and /roadmap order their own lists.
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, frontmatter: data as BlogFrontmatter, content };
}
