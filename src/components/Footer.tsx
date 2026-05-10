import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-1.5 mb-3">
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)", fontSize: "1.1rem" }}>σ</span>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#e2e8f0" }}>Strike</span>
            <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontStyle: "italic" }}>Lab</span>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
            Learn options pricing before college — no installs, no gatekeepers, just code.
            A free, browser-based quant finance curriculum for high schoolers aged 13–18.
          </p>
          <div className="flex gap-3 flex-wrap">
            {["Free forever", "Open source", "No install"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded border"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  background: "rgba(59,130,246,0.06)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-4 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}
          >
            Platform
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { href: "/", label: "Home" },
              { href: "/lessons", label: "Lessons" },
              { href: "/playground", label: "Playground" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors hover:text-white"
                style={{ color: "var(--muted)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Project */}
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-4 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}
          >
            Project
          </div>
          <div className="flex flex-col gap-2.5">
            <a
              href="https://github.com/isaacgong0311-hash/strikelab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "var(--muted)" }}
            >
              GitHub ↗
            </a>
            <a
              href="https://strikelab-olive.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "var(--muted)" }}
            >
              Live Site ↗
            </a>
          </div>
        </div>
      </div>

      <div
        className="border-t px-6 py-4 flex flex-wrap items-center justify-between gap-2"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          © 2025 StrikeLab · Built for Creator Colosseum
        </span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          "Quant finance shouldn't require the right zip code."
        </span>
      </div>
    </footer>
  );
}
