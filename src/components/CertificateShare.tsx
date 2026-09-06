"use client";
import { useState } from "react";
import { trackCertificateShare } from "@/lib/analytics";

/**
 * Share actions for a public certificate page. The certificate itself is
 * already OG-tag-rich for link *previews* — this is the missing piece that
 * actually prompts a student to trigger a share (LinkedIn) or grab the URL
 * to paste elsewhere (a college app, a resume, a Discord).
 */
export default function CertificateShare({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function shareLinkedIn() {
    trackCertificateShare("linkedin");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copyLink() {
    trackCertificateShare("copy_link");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the URL is already visible on the
      // certificate itself, so this is a soft failure, not a dead end.
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={shareLinkedIn}
        className="text-sm px-4 py-2 font-medium transition-opacity hover:opacity-90"
        style={{
          background: "#0a66c2",
          color: "#fff",
          fontFamily: "var(--font-mono)",
          borderRadius: 10,
        }}
      >
        Share on LinkedIn ↗
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="text-sm px-4 py-2 font-medium border transition-colors hover:opacity-80"
        style={{
          borderColor: "var(--border2)",
          color: "var(--ink)",
          fontFamily: "var(--font-mono)",
          borderRadius: 10,
          background: "transparent",
        }}
      >
        {copied ? "✓ Link copied" : "Copy link"}
      </button>
    </div>
  );
}
