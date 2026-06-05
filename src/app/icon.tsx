import { ImageResponse } from "next/og";

// App icon — generated at build time (no image files needed).
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
          background: "#16a34a",
          color: "#ffffff",
          fontSize: 250,
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
