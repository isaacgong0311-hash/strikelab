import { ImageResponse } from "next/og";
import { PLANNED_SEASON, shortSeasonDate } from "@/lib/seasons/planned";

// The card a shared /seasons link (including a friend's invite link) unfurls
// into in iMessage, Discord and Instagram DMs. Static: same for every link.
export const alt = "StrikeLab Season 1: free timed quant challenges for high schoolers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WEEKS = ["Put-call parity", "Black-Scholes", "Delta"];

export default function Image() {
  const dates = `${shortSeasonDate(PLANNED_SEASON.startsOn)} – ${shortSeasonDate(PLANNED_SEASON.endsOn)}`;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#102620", color: "#f4f7ee", fontFamily: "sans-serif", backgroundImage: "radial-gradient(circle at 92% 8%, #2f7356 0%, transparent 45%), radial-gradient(circle at 0% 100%, #1b4335 0%, transparent 40%)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 800, letterSpacing: 2, color: "#a7ddaf" }}><span style={{ fontSize: 38 }}>✳</span> STRIKELAB <span style={{ color: "#a8bcb1", fontSize: 20, fontWeight: 500 }}> / SEASONS</span></div>
        <div style={{ display: "flex", padding: "10px 22px", border: "2px solid #4d7a64", borderRadius: 999, fontSize: 24, fontWeight: 700, color: "#d9f0dc" }}>FREE · {dates.toUpperCase()}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", color: "#a7ddaf", fontSize: 26, letterSpacing: 3 }}>{PLANNED_SEASON.title.toUpperCase()}</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05 }}>Prove you can do quant work.</div>
        <div style={{ display: "flex", fontSize: 28, color: "#c4d6ca" }}>Timed Python challenges. Your own numbers. Ranked by handle.</div>
      </div>
      <div style={{ display: "flex", gap: 20, borderTop: "2px solid #426354", paddingTop: 28 }}>
        {WEEKS.map((concept, i) => (
          <div key={concept} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <span style={{ fontSize: 20, color: "#a7ddaf", letterSpacing: 2 }}>WEEK {i + 1}</span>
            <span style={{ fontSize: 32, fontWeight: 800 }}>{concept}</span>
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
