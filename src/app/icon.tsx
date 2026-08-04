import { ImageResponse } from "next/og";

// App icon — generated at build time (no image files needed). Same
// call-option payoff mark as the nav logo (Nav.tsx's LogoMark), so the
// browser tab, home-screen icon, and header all read as one brand.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#147038",
        }}
      >
        <svg width={340} height={340} viewBox="0 0 26 26" fill="none">
          <rect x="1" y="1" width="24" height="24" rx="6.5" stroke="#ffffff" strokeWidth="1.6" />
          <polyline
            points="4,19 12,19 22,7"
            stroke="#ffffff" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <line x1="12" y1="17" x2="12" y2="21" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
