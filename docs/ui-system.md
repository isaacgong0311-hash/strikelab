# StrikeLab UI System

StrikeLab uses a student-first “premium learning lab” visual language: calm light surfaces, a disciplined green brand accent, restrained data colors, and dark feature moments where code or market tools benefit from stronger focus.

## Foundation

- `src/styles/tokens.css` owns brand and semantic design tokens. Components consume semantic names such as `--sl-text`, `--sl-surface`, and `--sl-brand`; route code must not introduce a competing palette.
- `src/styles/foundation.css` owns global focus, reduced-motion, enhanced-contrast, no-JavaScript safety, and shared shell behavior.
- `src/components/ui/` contains accessible controls and display primitives. Import the individual component file directly rather than using a barrel.
- Route-specific layout belongs in a co-located CSS module. Existing selectors in `src/app/globals.css`, `sandbox.css`, and `pg-ch.css` are a compatibility layer and should be deleted as their routes migrate.

## Interaction rules

- Essential content is visible in the server-rendered document. Motion may enhance visible content after hydration but must never be required to reveal it.
- Use `:focus-visible` and the global focus token. Never remove an outline without an equally visible replacement.
- Interactive targets are at least 24 by 24 CSS pixels and normally 44 by 44 pixels.
- Color supplements text, icons, shape, or position; it never carries status alone.
- Dynamic success uses a polite status region. Errors that require immediate action use an alert. Streaming text is not announced per token.
- Dialogs contain focus, close with Escape, restore focus, and make background content inert. Disclosures and tabs use their complete native/ARIA keyboard patterns.
- Charts provide a concise text equivalent. Complex manipulatives provide a keyboard-operable control that reaches the same values as pointer input.

## Accessibility preferences

`reduceMotion` and `enhancedContrast` are `boolean | null`. `null` follows the device; a boolean is an explicit override. Preferences use the versioned `strikelab:a11y:v1` local-storage key and resolve to `data-motion` and `data-contrast` on the root element before paint.

## Route migration checklist

1. Preserve product behavior and server-rendered metadata.
2. Use one `h1`, logical heading order, and named landmarks.
3. Label every form control and associate help/errors programmatically.
4. Verify keyboard order, focus restoration, status announcements, 320px reflow, 400% zoom, reduced motion, and enhanced/forced contrast.
5. Add or update Playwright/axe coverage, then remove the migrated legacy selectors.

## Third-party components

`components.json` configures the shadcn CLI. StrikeLab does not use the shadcn
base theme — `tailwind.cssVariables` is `false` deliberately, so nothing the CLI
pulls in can start emitting `bg-background`/`text-foreground` against a palette
we don't own. Tokens stay in `src/styles/tokens.css`.

Registry components land in `src/components/ui/<registry>/` and are treated as
vendored source we own: keep them as close to upstream as possible so a future
re-pull is a readable diff, and put StrikeLab-specific behavior in a wrapper
next to it rather than editing the vendored file.

Currently vendored:

- `src/components/ui/skiper-ui/skiper40.tsx` — six animated link treatments
  (`npx shadcn add @skiper-ui/skiper40`). Wrapped by
  `src/components/AnimatedLink.tsx`, which picks the `next/link` variant for
  internal hrefs and the new-tab-plus-arrow variant for external ones.
  Skiper UI's free tier requires attribution; the licence header at the bottom
  of the vendored file is the current form of it.

Two things to know if you re-run the CLI over this file:

- Its transformer rewrites *every* string attribute, not just `className`, and
  it deduplicated `viewBox="0 0 10 10"` down to an invalid `viewBox="0 10"` on
  all five SVGs. Check the arrows still render after any re-pull.
- Upstream's external-link variant ships `target="_blank"` with no `rel`. We add
  `rel="noopener noreferrer"`; re-pulling drops that fix.

`@splinetool/react-spline` backs `src/components/SplineScene.tsx`. The runtime
is roughly a megabyte of WebGL, so it is `next/dynamic` with `ssr: false` and
mounts only when a scene URL is configured, motion is not reduced, the device is
not on Save-Data or low memory, WebGL is present, and the host has scrolled near
the viewport. With `NEXT_PUBLIC_SPLINE_HERO_SCENE` unset it renders no DOM at
all and the chunk is never fetched.
