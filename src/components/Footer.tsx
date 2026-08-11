import Link from "next/link";

const NAV_GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/lessons",      label: "Lessons" },
      { href: "/playground",   label: "Playground" },
      { href: "/dashboard",    label: "Dashboard" },
      { href: "/blog",         label: "Blog" },
      { href: "/for-teachers", label: "For Teachers" },
      { href: "/for-schools",  label: "For Schools" },
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
      { href: "https://github.com/isaacgong0311-hash/strikelab",                external: true,  label: "GitHub" },
      { href: "https://github.com/isaacgong0311-hash/strikelab/discussions",   external: true,  label: "Discussions" },
      { href: "https://github.com/isaacgong0311-hash/strikelab/blob/main/LICENSE", external: true, label: "MIT License" },
      { href: "mailto:hello@strikelab.app",                                    external: true,  label: "Email" },
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
            <span
              className="grid place-items-center"
              style={{
                width: 24,
                height: 24,
                border: "1.5px solid var(--fg)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--fg)",
              }}
            >
              SL
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--fg)", fontSize: "1.15rem", fontWeight: 600 }}>
              Strike<span style={{ fontStyle: "normal", fontWeight: 600 }}>Lab</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-5 max-w-xs" style={{ color: "var(--fg-mute)" }}>
            A browser-based quant finance curriculum for high schoolers.
            Free forever for students. Built by a freshman AIME qualifier.
          </p>
          <div className="flex gap-2 flex-wrap mb-5">
            {["Free forever", "Open source", "No install"].map((tag) => (
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

          <div
            className="inline-flex items-center gap-2 text-[10px] px-2.5 py-1 rounded-full"
            style={{
              border: "1px solid var(--border-hi)",
              color: "var(--fg)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            MIT License · Open Source
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
            <div className="flex flex-col gap-2.5">
              {group.links.map((l) =>
                "external" in l && l.external ? (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v2-foot-link text-xs"
                  >
                    {l.label} ↗
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="v2-foot-link text-xs"
                  >
                    {l.label}
                  </Link>
                )
              )}
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
