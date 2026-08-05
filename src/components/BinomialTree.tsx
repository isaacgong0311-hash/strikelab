"use client";
import { useMemo, useState } from "react";

type OptionType = "call" | "put";
type Style = "american" | "european";

interface Node {
  step: number;
  j: number;
  S: number;
  intrinsic: number;
  continuation: number;
  value: number;
  exercised: boolean;
}

// Fixed pricing inputs — this widget's job is to show how the lattice and
// the early-exercise check work, not to be a second Black-Scholes sandbox.
// Only the two things that actually change the *shape* of the decision
// (steps, and American vs. European) are exposed.
const S0 = 100;
const K = 100;
const T = 1;
const R = 0.05;
const SIGMA = 0.25; // higher than the lesson's other examples so American
                     // puts actually show a visible early-exercise region

function payoff(S: number, type: OptionType): number {
  return type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
}

function buildTree(N: number, type: OptionType, style: Style): Node[][] {
  const dt = T / N;
  const u = Math.exp(SIGMA * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp(R * dt) - d) / (u - d);
  const disc = Math.exp(-R * dt);

  const tree: Node[][] = [];
  for (let step = N; step >= 0; step--) {
    const layer: Node[] = [];
    for (let j = 0; j <= step; j++) {
      const S = S0 * u ** j * d ** (step - j);
      const intrinsic = payoff(S, type);
      if (step === N) {
        layer.push({ step, j, S, intrinsic, continuation: intrinsic, value: intrinsic, exercised: false });
      } else {
        const next = tree[0]; // last-built layer, i.e. step+1
        const up = next[j + 1].value;
        const down = next[j].value;
        const continuation = disc * (p * up + (1 - p) * down);
        const exercised = style === "american" && intrinsic > continuation;
        const value = exercised ? intrinsic : continuation;
        layer.push({ step, j, S, intrinsic, continuation, value, exercised });
      }
    }
    tree.unshift(layer);
  }
  return tree;
}

function fmt(v: number): string {
  return `$${v.toFixed(2)}`;
}

/**
 * The recombining CRR lattice, rendered so you can click any node and see
 * exactly what backward induction computed there: the continuation value,
 * the intrinsic value, and — for American options — which one won. The
 * lesson's prose explains this as an algorithm; this lets you watch it run
 * one node at a time.
 */
export default function BinomialTree() {
  const [steps, setSteps] = useState(4);
  const [optionType, setOptionType] = useState<OptionType>("put");
  const [style, setStyle] = useState<Style>("american");
  const [selected, setSelected] = useState<{ step: number; j: number }>({ step: 0, j: 0 });

  const tree = useMemo(() => buildTree(steps, optionType, style), [steps, optionType, style]);
  const selectedNode = tree[selected.step]?.[selected.j] ?? tree[0][0];

  // Layout
  const width = 560;
  const height = 300;
  const padX = 40;
  const padY = 24;
  const xStep = (width - padX * 2) / steps;
  const yStep = (height - padY * 2) / (steps + 1);
  const cx = (step: number) => padX + step * xStep;
  const cy = (step: number, j: number) => height / 2 + (step / 2 - j) * yStep;
  const r = steps <= 4 ? 14 : steps === 5 ? 11 : 9;

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let step = 0; step < steps; step++) {
    for (let j = 0; j <= step; j++) {
      edges.push({ x1: cx(step), y1: cy(step, j), x2: cx(step + 1), y2: cy(step + 1, j) });
      edges.push({ x1: cx(step), y1: cy(step, j), x2: cx(step + 1), y2: cy(step + 1, j + 1) });
    }
  }

  return (
    <aside className="btree">
      <div className="btree-head">
        <span className="btree-label">Try it — Binomial Tree</span>
      </div>

      <div className="viz-chip-row" style={{ marginBottom: 8 }}>
        {(["call", "put"] as OptionType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`viz-chip${optionType === t ? " active" : ""}`}
            onClick={() => setOptionType(t)}
          >
            {t === "call" ? "Call" : "Put"}
          </button>
        ))}
        {(["american", "european"] as Style[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`viz-chip${style === s ? " active" : ""}`}
            onClick={() => setStyle(s)}
          >
            {s === "american" ? "American" : "European"}
          </button>
        ))}
      </div>

      <div className="btree-controls">
        <div className="btree-slider-col">
          <label>
            <span className="fsb-var-head">
              <span className="fsb-var-name">Steps (N)</span>
              <span className="fsb-var-val">{steps}</span>
            </span>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={steps}
              onChange={(e) => { setSteps(Number(e.target.value)); setSelected({ step: 0, j: 0 }); }}
              className="fsb-slider"
              aria-label="Number of steps"
            />
          </label>
        </div>
      </div>

      <div className="btree-svg-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="var(--line-2)"
              strokeWidth={1}
            />
          ))}
          {tree.map((layer, step) =>
            layer.map((node) => {
              const isSelected = selected.step === step && selected.j === node.j;
              const isTerminal = step === steps;
              const fill = isSelected
                ? "var(--sky)"
                : node.exercised
                ? "var(--coral-tint)"
                : "var(--paper)";
              const stroke = isSelected
                ? "var(--sky)"
                : node.exercised
                ? "var(--coral)"
                : isTerminal
                ? "var(--ink-3)"
                : "var(--line-2)";
              return (
                <g
                  key={`${step}-${node.j}`}
                  className="btree-node"
                  onClick={() => setSelected({ step, j: node.j })}
                >
                  <circle
                    cx={cx(step)} cy={cy(step, node.j)} r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 2 : 1.25}
                  />
                  {steps <= 4 && (
                    <text
                      className="btree-node-price"
                      x={cx(step)}
                      y={cy(step, node.j) + r + 11}
                      textAnchor="middle"
                    >
                      {node.S.toFixed(0)}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="btree-detail">
        <div className="btree-detail-title">
          Step {selected.step} of {steps} · node {selected.j}
          {selectedNode.exercised && <span style={{ color: "var(--coral)" }}> · early exercise</span>}
        </div>
        <div className="btree-detail-grid">
          <div>
            <span className="btree-detail-item-label">Stock price</span>
            <span className="btree-detail-item-val">{fmt(selectedNode.S)}</span>
          </div>
          <div>
            <span className="btree-detail-item-label">Intrinsic value</span>
            <span className="btree-detail-item-val">{fmt(selectedNode.intrinsic)}</span>
          </div>
          <div>
            <span className="btree-detail-item-label">Continuation</span>
            <span className="btree-detail-item-val">
              {selected.step === steps ? "—" : fmt(selectedNode.continuation)}
            </span>
          </div>
          <div>
            <span className="btree-detail-item-label">Node value</span>
            <span className="btree-detail-item-val">{fmt(selectedNode.value)}</span>
          </div>
        </div>
        <p className={`btree-decision${selectedNode.exercised ? " exercise" : ""}`}>
          {selected.step === steps
            ? `Terminal node — the option is worth exactly its payoff, ${fmt(selectedNode.intrinsic)}.`
            : selectedNode.exercised
            ? `Exercise now: intrinsic value ${fmt(selectedNode.intrinsic)} beats the ${fmt(selectedNode.continuation)} you'd get by waiting.`
            : style === "european"
            ? `European style — early exercise isn't allowed here, so the node just holds the discounted continuation value, ${fmt(selectedNode.continuation)}.`
            : `Hold: waiting is worth ${fmt(selectedNode.continuation)}, more than exercising now for ${fmt(selectedNode.intrinsic)}.`}
        </p>
      </div>
    </aside>
  );
}
