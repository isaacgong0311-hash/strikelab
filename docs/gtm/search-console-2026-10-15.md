# Search Console indexing export, 2026-10-15

Source: the founder's "Page indexing" export for strikelab.dev (sitemap: all known pages), data through 2026-10-11. Raw CSVs were four small files (Chart, Critical issues, Non-critical issues, Metadata); the numbers are copied below.

## What it says

| Measure | Value |
|---|---|
| Known pages | 56 (35 not indexed, 21 indexed on Oct 11) |
| Indexed trend | 4 (Aug 4) → 21 (Aug 10) → 24 (Sep 21) → **21 (Oct 9)** |
| Impressions | Peaked at 76/day (Aug 28), now about 5–25/day |

| Reason not indexed | Pages | Validation |
|---|---|---|
| Discovered, currently not indexed | **30** | Started |
| Crawled, currently not indexed | 3 | Not started |
| Excluded by `noindex` | 1 | Started |
| Not found (404) | 1 | Not started |
| Duplicate / non-canonical | 0 | n/a |

## What I can and can't conclude

- `sitemap.xml` lists 53 URLs (18 static, 23 lessons, 12 blog posts). So roughly 30 of them are known to Google but not yet crawled. That pattern (discovered, not crawled) is typical of a new, low-authority site, not a technical fault; nothing in `robots.ts` blocks them.
- The `noindex` page is probably intentional (`/learn/[sessionId]`, certificates, `/success` and sign-in pages send `noindex` by design). The export has no URLs, so I can't confirm which page it is.
- The 404 could be a removed or mistyped URL. `/for-schools` is a 308 redirect to `/clubs`, not a 404. **I can't tell which URL it is from this export.**
- The 3-page drop on Oct 9 (24 → 21) cannot be tied to a deploy: the only merge that week was PR #39 on Oct 7. Pages can fall out of the index for quality or recrawl reasons.
- **What the export doesn't show:** whether the pilot pages (`/clubs`, `/pilot`, `/demo`, `/trust`) are indexed. That matters more than the lesson pages.

## Perspective

Organic search is not the pilot channel: the plan's gate is leader outreach, and search impressions of 5–25 a day are too small to move it. Don't spend founder time here before G1. The cheap, useful checks are below.

## Founder checks (15 minutes, in Search Console)

1. URL Inspection on `/clubs`, `/pilot`, `/demo`, `/trust`: "URL is on Google"? If not, click **Request indexing**.
2. Open "Not found (404)" and "Excluded by noindex" and look at the one URL each. Tell the agent what they are.
3. Export the "Discovered, currently not indexed" list **with URLs** and send it; then the agent can see whether it's mostly blog or lesson pages.

## Agent options (not started; say go)

- Link the pilot pages and the strongest lessons/blog posts from the homepage footer and each other, so Google has more paths to crawl.
- Prune or merge thin blog posts if the 30 turn out to be mostly blog.
- Do **not** bump `lastModified` dates without real edits (the sitemap comments explain why).
