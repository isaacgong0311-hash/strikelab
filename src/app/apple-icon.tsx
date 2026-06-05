import { ImageResponse } from "next/og";

// iOS home-screen icon (Apple masks corners itself, so this is full-bleed).
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
          background: "#16a34a",
          color: "#ffffff",
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        SL
      </div>
    ),
    { ...size }
  );
}
