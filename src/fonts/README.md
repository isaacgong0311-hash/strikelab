# Self-hosted fonts

The site's three typefaces are served from this folder through `next/font/local`
(see `src/app/layout.tsx`). Each file is the **latin subset** of one **variable**
font, so every weight the site uses comes from a single file.

| File | Family | Weights | Used for | CSS variable |
|---|---|---|---|---|
| `plus-jakarta-sans-latin.woff2` | Plus Jakarta Sans | 500 to 800 | Headings | `--font-display` |
| `inter-latin.woff2` | Inter | 400 to 700 | Interface and body text | `--font-ui` |
| `jetbrains-mono-latin.woff2` | JetBrains Mono | 300 to 700 | Code and small labels | `--font-mono` |

All three are licensed under the SIL Open Font License 1.1
(<https://openfontlicense.org>), which allows bundling and redistribution.

## Why they are here

They used to be loaded with `next/font/google`, which downloads from Google
during `next build` and `next dev`. That download intermittently failed in CI,
on Vercel and on this project's development network, and a failure took the
whole build down (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`).
Local files remove the network dependency from builds. The characters outside
the latin subset (Greek letters, arrows beyond the basic ones) were never loaded
from these fonts before either: the browser falls back to a system font for them.

## Refreshing a file

The files came from Google Fonts' CSS API, requested with a current Chrome
user agent so it returns woff2, taking the `/* latin */` block's URL, for example:

```bash
curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap"
```

Download that `.woff2` over the file here, keep the filename, and check the home
page and a lesson in a browser. If you change a weight range, change it in
`layout.tsx` too.
