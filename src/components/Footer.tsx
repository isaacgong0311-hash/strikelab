import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import styles from "./Footer.module.css";

const REPO = "https://github.com/isaacgong0311-hash/strikelab";

type FooterLink = { href: string; label: string };

const NAV_GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: "For clubs",
    links: [
      { href: "/clubs",            label: "For clubs & teachers" },
      { href: "/pilot?src=footer", label: "Free pilot" },
      { href: "/demo",             label: "Demo" },
      { href: "/clubs#clubs-ap",   label: "AP alignment" },
      { href: "/intensive",        label: "Intensive (parents)" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/lessons",    label: "Lessons" },
      { href: "/lab",        label: "Market Lab" },
      { href: "/playground", label: "Playground" },
      { href: "/seasons",    label: "Seasons" },
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
      { href: "/trust",   label: "Student data & security" },
      { href: "/terms",   label: "Terms of Service" },
    ],
  },
  {
    title: "Open source",
    links: [
      { href: REPO,                             label: "GitHub" },
      { href: `${REPO}/discussions`,            label: "Discussions" },
      { href: `${REPO}/blob/master/LICENSE`,    label: "MIT License" },
      { href: "mailto:hello@strikelab.app",     label: "Email" },
    ],
  },
];

/** http(s) links open GitHub in a new tab; mailto: and internal paths don't. */
function FooterAnchor({ href, label }: FooterLink) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
        {label}
        <span className="sl-visually-hidden"> (opens in a new tab)</span>
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return <a href={href} className={styles.link}>{label}</a>;
  }
  return <Link href={href} className={styles.link}>{label}</Link>;
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="StrikeLab home">
              <BrandMark size={24} />
              <span className={styles.wordmark}>
                Strike<span className={styles.wordmarkLab}>Lab</span>
              </span>
            </Link>
            <p className={styles.blurb}>
              Learn quant finance, then prove it: lessons, real Python and free
              seasons of timed challenges. Free for students.
            </p>
          </div>

          {NAV_GROUPS.map((group) => {
            const headingId = `footer-${group.title.toLowerCase().replace(/\W+/g, "-")}`;
            return (
              <nav key={group.title} className={styles.group} aria-labelledby={headingId}>
                <h2 id={headingId} className={styles.groupTitle}>{group.title}</h2>
                <ul className={styles.list}>
                  {group.links.map((l) => (
                    <li key={l.href}><FooterAnchor {...l} /></li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>© 2026 StrikeLab. Open source under the MIT License.</p>
          <p className={styles.quote}>&ldquo;Quant finance shouldn&rsquo;t require the right zip code.&rdquo;</p>
        </div>
      </div>
    </footer>
  );
}
