import { ImageResponse } from "next/og";

// iOS home-screen icon (Apple masks corners itself, so this is full-bleed).
// Same call-option payoff mark as the nav logo — see icon.tsx.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg width={118} height={118} viewBox="0 0 26 26" fill="none">
          <polyline
            points="4,19 12,19 22,7"
            stroke="#ffffff" strokeWidth="2.6"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <line x1="12" y1="17" x2="12" y2="21" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
