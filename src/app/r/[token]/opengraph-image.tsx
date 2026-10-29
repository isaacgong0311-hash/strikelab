import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { getSharedRecord } from "@/lib/record/getSharedRecord";

export const alt = "StrikeLab verified student record";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const record = await getSharedRecord(token);
  const handle = record ? `@${record.handle}` : "Verified work";
  const placing = record?.bestPlacing === null || !record ? "—" : `#${record.bestPlacing}`;
  const count = record?.verifiedCount ?? "—";

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#102620", color: "#f4f7ee", fontFamily: "sans-serif", backgroundImage: "radial-gradient(circle at 90% 12%, #275e48 0%, transparent 42%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 800, letterSpacing: 2, color: "#a7ddaf" }}><span style={{ fontSize: 38 }}>✳</span> STRIKELAB <span style={{ color: "#a8bcb1", fontSize: 20, fontWeight: 500 }}> / RECORD</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", color: "#a7ddaf", fontSize: 25, letterSpacing: 3 }}>TRAIN → COMPETE → PROVE → RECORD</div>
        <div style={{ display: "flex", fontSize: 80, fontWeight: 800, letterSpacing: -3 }}>{handle}</div>
      </div>
      <div style={{ display: "flex", gap: 70, borderTop: "2px solid #426354", paddingTop: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 44, fontWeight: 800 }}>{placing}</span><span style={{ fontSize: 20, color: "#b2c7b8" }}>BEST VERIFIED PLACING</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 44, fontWeight: 800 }}>{count}</span><span style={{ fontSize: 20, color: "#b2c7b8" }}>VERIFIED ITEMS</span></div>
      </div>
    </div>,
    size,
  );
}
