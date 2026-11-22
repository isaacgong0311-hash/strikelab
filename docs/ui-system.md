# StrikeLab UI System

StrikeLab uses a student-first “premium learning lab” visual language: calm light surfaces, a disciplined green brand accent, restrained data colors, and dark feature moments where code or market tools benefit from stronger focus.

## Foundation

- `src/styles/tokens.css` owns brand and semantic design tokens. Components consume semantic names such as `--sl-text`, `--sl-surface`, and `--sl-brand`; route code must not introduce a competing palette.
- `src/styles/foundation.css` owns global focus, reduced-motion, enhanced-contrast, no-JavaScript safety, and shared shell behavior.
- `src/components/ui/` contains accessible controls and display primitives. Import the individual component file directly rather than using a barrel.
- Route-specific layout belongs in a co-located CSS module. Existing selectors in `src/app/globals.css`, `sandbox.css`, and `pg-ch.css` are a compatibility layer and should be deleted as their routes migrate.

## Visual rules

The target is Linear/Vercel restraint. These are the tells that made earlier
screens read as generated, and they stay out:

- **No decorative backgrounds.** Pages sit on plain `--sl-canvas`. No grid
  overlay, no radial vignette or wash, no gradient behind a section for its own
  sake.
- **No offset shadows.** Nothing uses a hard `0 4px 0` "pressable" shadow, and
  nothing translates on hover or press. Buttons are flat.
- **No glow.** No coloured or blurred halo around buttons, badges or cards.
- **Mono only for code, numbers, timers and scores.** `--sl-font-code` is for
  code, figures, countdowns, ranks and scores. Headings and body copy never use
  it.

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `--sl-radius-sm` | 6px | small buttons, inputs, chips, inline code |
| `--sl-radius-md` | 8px | buttons, list rows, small panels |
| `--sl-radius-lg` | 12px | cards, panels |
| `--sl-radius-xl` | 16px | dialogs, large surfaces |
| `--sl-radius-pill` | 999px | pills and status dots only |

The legacy `--r-xs`…`--r-full` variables in `globals.css` are aliases of this
scale, not a second one. Don't add raw pixel radii.

### Shadow

| Token | Value | Use |
| --- | --- | --- |
| `--sl-shadow-1` | `0 1px 2px rgb(15 23 18 / 0.06)` | a hairline lift for cards on the canvas |
| `--sl-shadow-2` | `0 12px 32px rgb(15 23 18 / 0.10)` | things that float: menus, popovers, dialogs |

Most surfaces need only a 1px `--sl-border`. Reach for `--sl-shadow-1` when a
card must separate from a same-coloured background.

### Numbers

Code contexts (`code`, `pre`, `kbd`, `.mono`) set `tabular-nums`. For a timer,
score, rank or leaderboard column outside code, add the `.sl-num` utility from
`foundation.css` so digits don't shift as values change.

## Buttons

`src/components/ui/Action.tsx` is the one button. Use it for every new
call-to-action instead of adding another `.xyz-btn` rule.

```tsx
import { Button, ActionLink } from "@/components/ui/Action";

<Button onClick={save}>Save</Button>                       // primary, md
<Button variant="secondary" size="sm">Cancel</Button>
<ActionLink href="/seasons">See the season</ActionLink>     // next/link
<ActionLink href="https://github.com/…" variant="ghost" target="_blank">GitHub</ActionLink>
```

| Prop | Values | Default |
| --- | --- | --- |
| `variant` | `primary` (solid `--sl-brand`, hover `--sl-brand-strong`), `secondary` (surface with a 1px `--sl-border`), `ghost` (transparent, low emphasis) | `primary` |
| `size` | `md` (44px tall), `sm` (32px tall with an invisible 44px hit area) | `md` |

- `Button` defaults to `type="button"`; pass `type="submit"` in forms.
- `ActionLink` renders `next/link` for internal hrefs and a plain `<a>` for
  absolute URLs (`https:`, `mailto:`, `//…`), adding
  `rel="noopener noreferrer"` when `target="_blank"`.
- `buttonClassName({ variant, size })` gives the same classes to an element
  that can't be either component (a `<summary>`, a file-input label).
- Focus uses the global `:focus-visible` ring. Disabled buttons drop to 50%
  opacity; for links use `aria-disabled="true"`.
- One `primary` per view. Width is the caller's layout decision; the component
  doesn't stretch itself on mobile.

The older button classes (`.v2-btn`, `.sl-btn-primary`, `.nav-cta`,
`.pr-btn`, the `.primary`/`.secondary` rules in route CSS modules) have been
flattened to match, and should be replaced by `Button`/`ActionLink` as each
route is restyled.

## Interaction rules

- Essential content is visible in the server-rendered document. Motion may enhance visible content after hydration but must never be required to reveal it.
- Use `:focus-visible` and the global focus token. Never remove an outline without an equally visible replacement.
- Interactive targets are at least 24 by 24 CSS pixels and normally 44 by 44 pixels.
- Color supplements text, icons, shape, or position; it never carries status alone.
- Dynamic success uses a polite status region. Errors that require immediate action use an alert. Streaming text is not announced per token.
- Dialogs contain focus, close with Escape, restore focus, and make background content inert. Disclosures and tabs use their complete native/ARIA keyboard patterns.
- Charts provide a concise text equivalent. Complex manipulatives provide a keyboard-operable control that reaches the same values as pointer input.

## Fonts

Plus Jakarta Sans (headings), Inter (interface) and JetBrains Mono (code) are
self-hosted from `src/fonts/` with `next/font/local`, as latin-subset variable
files, so builds never depend on a request to Google. Consume them through the
`--sl-font-display`, `--sl-font-body` and `--sl-font-code` tokens. How the files
were produced and how to refresh them: `src/fonts/README.md`.

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

Currently vendored: nothing. The skiper40 animated links and their `AnimatedLink`
wrapper were removed on Nov 22, 2026 once no page used them; Button/ActionLink
cover links and buttons.
