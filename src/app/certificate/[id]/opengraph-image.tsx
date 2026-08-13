import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";
import { getCertificateById } from "@/lib/certificates";

export const alt = "StrikeLab certificate of completion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Not prerendered via generateStaticParams (unlike lesson cards) — certificate
// ids are minted at runtime by users completing tracks, not known at build time.
export default async function CertificateOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getCertificateById(id);

  const displayName = cert?.displayName ?? "A StrikeLab student";
  const trackTitle = cert?.trackTitle ?? "a StrikeLab track";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1410 0%, #0f2a1c 100%)",
          padding: 80,
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", display: "flex" }}>
          ∂ STRIKELAB · CERTIFICATE OF COMPLETION
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#fafaf9", marginTop: 40, display: "flex" }}>
          {displayName}
        </div>
        <div style={{ fontSize: 28, color: "#9bbfae", marginTop: 20, display: "flex" }}>
          has completed
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#4ade80", marginTop: 16, display: "flex" }}>
          {trackTitle}
        </div>
        <div style={{ fontSize: 22, color: "#5f8570", marginTop: 60, display: "flex" }}>
          {SITE_URL.replace(/^https:\/\//, "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
