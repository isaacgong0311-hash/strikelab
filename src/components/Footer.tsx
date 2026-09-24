import BrandMark from "@/components/BrandMark";
import AnimatedLink from "@/components/AnimatedLink";

const NAV_GROUPS = [
  {
    title: "For clubs",
    links: [
      { href: "/clubs",        label: "For clubs & teachers" },
      { href: "/pilot?src=footer", label: "Free pilot" },
      { href: "/demo",         label: "Demo" },
      { href: "/for-teachers", label: "AP alignment" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/lessons",    label: "Lessons" },
      { href: "/playground", label: "Playground" },
      { href: "/sandbox",    label: "Sandbox" },
      { href: "/dashboard",  label: "Dashboard" },
      { href: "/blog",       label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about",   label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/faq",     label: "FAQ" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms",   label: "Terms of Service" },
    ],
  },
  {
    title: "Open Source",
    links: [
      // No `external` flag any more — AnimatedLink derives that from the
      // protocol, so the data can't drift out of sync with the markup.
      { href: "https://github.com/isaacgong0311-hash/strikelab",                   label: "GitHub" },
      { href: "https://github.com/isaacgong0311-hash/strikelab/discussions",       label: "Discussions" },
      { href: "https://github.com/isaacgong0311-hash/strikelab/blob/main/LICENSE", label: "MIT License" },
      { href: "mailto:hello@strikelab.app",                                       label: "Email" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">

        {/* Brand */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span style={{ color: "var(--fg)", display: "grid" }}><BrandMark size={26} /></span>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--fg)", fontSize: "1.15rem", fontWeight: 600 }}>
              Strike<span style={{ fontStyle: "normal", fontWeight: 600 }}>Lab</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-5 max-w-xs" style={{ color: "var(--fg-mute)" }}>
            A browser-based quant finance curriculum for high schoolers.
            Free forever for students. Built by a freshman AIME qualifier.
          </p>
          <div className="flex gap-2 flex-wrap mb-5">
            {["Free forever", "MIT open source", "No install"].map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  border: "1px solid var(--border-hi)",
                  color: "var(--fg-mute)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

        </div>

        {/* Nav groups */}
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div
              className="text-[10px] uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", letterSpacing: "0.18em" }}
            >
              {group.title}
            </div>
            {/* Wider gap on mobile than the old 10px. The tap target used to
                come from 9px of padding on each link, but that padding also
                pushed the new hover rule 9px clear of the text. Spacing gives
                the same ~34px of vertical pitch per row (WCAG 2.5.8 is
                satisfied by spacing, not just by box size) while letting the
                underline sit on the baseline where it belongs. */}
            <div className="flex flex-col gap-4 md:gap-2.5">
              {group.links.map((l) => (
                <AnimatedLink key={l.href} href={l.href} className="v2-foot-link text-xs">
                  {l.label}
                </AnimatedLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="border-t px-6 py-5 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="text-[11px]"
          style={{ color: "var(--fg-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          © 2026 StrikeLab · Free & Open Source · MIT License
        </span>
        <span className="text-[11px]" style={{ color: "var(--fg-mute)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          &ldquo;Quant finance shouldn&rsquo;t require the right zip code.&rdquo;
        </span>
      </div>
    </footer>
  );
}
