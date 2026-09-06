import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCertificateById } from "@/lib/certificates";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import CertificateShare from "@/components/CertificateShare";

// Root layout's <title> template appends " — StrikeLab" automatically —
// see src/app/layout.tsx. Titles here must NOT append SITE_NAME themselves.

/**
 * Public, unauthenticated certificate view — the whole point is that it's
 * shareable (LinkedIn) and independently verifiable at this URL. `robots:
 * noindex` keeps it out of Google (it carries a real person's name, and the
 * target audience skews high-schooler) without blocking link-preview
 * scrapers, which don't respect robots meta for OG tags.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cert = await getCertificateById(id);

  if (!cert) {
    return { title: "Certificate not found", robots: { index: false, follow: false } };
  }

  const title = `${cert.displayName} — ${cert.trackTitle} Certificate`;
  // openGraph/twitter titles are shown verbatim by scrapers (no title
  // template applied there), so those need SITE_NAME appended explicitly.
  const fullTitle = `${title} — ${SITE_NAME}`;
  const description = `${cert.displayName} completed the ${cert.trackTitle} track on StrikeLab.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: `${SITE_URL}/certificate/${cert.id}`,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getCertificateById(id);
  if (!cert) notFound();

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div
        className="rounded-2xl border px-10 py-14 text-center"
        style={{ borderColor: "var(--border2)", background: "var(--card)" }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-8"
          style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}
        >
          ∂ StrikeLab · Certificate of Completion
        </div>

        <h1
          className="text-3xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          {cert.displayName}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted2)" }}>
          has completed
        </p>
        <div
          className="text-2xl font-semibold mb-10"
          style={{ fontFamily: "var(--font-display)", color: "var(--grass)" }}
        >
          {cert.trackTitle}
        </div>

        <div
          className="pt-6 border-t"
          style={{ borderColor: "var(--border2)" }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>
            Issued {issuedDate}
          </p>
          <p className="text-[10px]" style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
            Verify at {SITE_URL.replace(/^https:\/\//, "")}/certificate/{cert.id}
          </p>
        </div>
      </div>

      <CertificateShare url={`${SITE_URL}/certificate/${cert.id}`} />

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm underline underline-offset-2" style={{ color: "var(--muted2)" }}>
          ← Back to StrikeLab
        </Link>
      </div>
    </div>
  );
}
