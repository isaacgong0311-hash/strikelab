"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_SCENARIO, labPrice } from "@/lib/marketLab";
import MarketLabChart, { dollars } from "./MarketLabChart";
import { rangeFill } from "@/lib/rangeFill";
import styles from "./home-preview.module.css";

export default function HomeLabPreview() {
  const [volatility, setVolatility] = useState(40);
  const scenario = { ...DEFAULT_SCENARIO, volatility };
  return (
    <div className={styles.panel}>
      <div className={styles.top}><span><i /> MARKET LAB</span><span>Experiment 01 / Volatility</span></div>
      <div className={styles.heading}><p>Same stock. More uncertainty.</p><h2>What changes?</h2></div>
      <div className={styles.prices}><div><span>Baseline / 20% vol</span><strong>{dollars(labPrice(DEFAULT_SCENARIO))}</strong></div><span className={styles.arrow} aria-hidden="true">→</span><div><span>Your experiment</span><strong>{dollars(labPrice(scenario))}</strong></div></div>
      <MarketLabChart baseline={DEFAULT_SCENARIO} scenario={scenario} variable="volatility" compact />
      <label className={styles.sliderLabel} htmlFor="hero-volatility">Turn up the uncertainty <output htmlFor="hero-volatility">{volatility}% volatility</output></label>
      <input className={styles.slider} id="hero-volatility" type="range" min="10" max="80" value={volatility} style={rangeFill(volatility, 10, 80)} onChange={(event) => setVolatility(Number(event.target.value))} />
      <div className={styles.bottom}><span>$100 stock & strike · 30 days<br />Model values per share, not market quotes</span><Link href="/lab">Try the full experiment ↗</Link></div>
    </div>
  );
}
