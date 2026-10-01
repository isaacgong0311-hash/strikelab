"use client";

import ReactMarkdown from "react-markdown";

interface Props {
  text: string;
  streaming: boolean;
  hasStarted?: boolean;
}

const FEATURES = [
  { sym: "01", title: "Financial Health Score", desc: "Scored 0-100 with detailed breakdown." },
  { sym: "02", title: "Personalized Action Plan", desc: "3 specific steps you can take this week." },
  { sym: "03", title: "Debt Payoff Strategy", desc: "Avalanche method - minimize total interest paid." },
  { sym: "04", title: "Emergency Fund Timeline", desc: "Exactly when you hit 3 months of savings." },
];

export default function AnalysisPanel({ text, streaming, hasStarted }: Props) {
  return (
    <div className="fp-term">
      <div className="fp-term-bar">
        <div className="fp-term-dots">
          <span className="fp-term-dot r" />
          <span className="fp-term-dot y" />
          <span className="fp-term-dot g" />
        </div>
        <span className="fp-term-title">finpath -- financial-analysis-report.md</span>
        <span className={`fp-term-status ${streaming || hasStarted ? "live" : ""}`}>
          {streaming ? "STREAMING" : hasStarted ? "COMPLETE" : "IDLE"}
        </span>
      </div>

      <div className="fp-term-body">
        {!text && !streaming && !hasStarted ? (
          <div className="fp-term-idle">
            <span className="fp-term-idle-icon">&#9656;</span>
            <div className="fp-term-idle-text">
              Awaiting budget input...<br />
              Analysis will stream here.
            </div>
            <div style={{ marginTop: 20, width: "100%", maxWidth: 340 }}>
              {FEATURES.map((f) => (
                <div
                  key={f.sym}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "7px 0",
                    borderBottom: "1px solid #111",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#282828", letterSpacing: "0.06em", flexShrink: 0, paddingTop: 1 }}>
                    [{f.sym}]
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#383838", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 2 }}>
                      {f.title}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#262626", lineHeight: 1.5 }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="fp-prose">
            <ReactMarkdown>{text || " "}</ReactMarkdown>
            {streaming && <span className="fp-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}
