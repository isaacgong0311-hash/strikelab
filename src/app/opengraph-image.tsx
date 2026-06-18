import { ImageResponse } from "next/og";

export const alt = "StrikeLab — Learn Options Pricing & Quant Finance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b1410 0%, #0f2a1c 100%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#16a34a",
            }}
          >
            ∂ StrikeLab
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "#f7f5ef",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Learn options pricing & quant finance by building it.
          </div>
          <div style={{ fontSize: 30, color: "#9bbfae", maxWidth: 900 }}>
            Black-Scholes, the Greeks, CAPM, and backtesting — in a real Python
            notebook in your browser. Free for high schoolers.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 22,
            color: "#16a34a",
            fontWeight: 600,
          }}
        >
          strikelabco.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
