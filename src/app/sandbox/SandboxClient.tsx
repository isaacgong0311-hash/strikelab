"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  WATCHLIST,
  simulatePrice,
  simulatePriceHistory,
  markPrice,
  type AssetType,
} from "@/lib/pricing";

const POLL_MS = 5000;

interface PositionApi {
  id: string;
  symbol: string;
  asset_type: AssetType;
  side: "long" | "short";
  qty: number;
  avg_cost: number;
  strike: number | null;
  expiry: string | null;
  markPrice: number;
  marketValue: number;
  unrealizedPnl: number;
}

interface TradeApi {
  id: string;
  symbol: string;
  asset_type: AssetType;
  direction: "buy" | "sell";
  qty: number;
  fill_price: number;
  executed_at: string;
}

interface PortfolioResponse {
  cashBalance: number;
  totalValue: number;
  positions: PositionApi[];
  trades: TradeApi[];
}

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function defaultExpiry(daysOut: number): string {
  const d = new Date(Date.now() + daysOut * 86400000);
  return d.toISOString().slice(0, 10);
}

// ── Sign-in prompt ─────────────────────────────────────────────────────────────
function SignInPrompt() {
  return (
    <div className="sb-gate">
      <div className="sb-gate-card">
        <h2 className="sb-gate-title">Sign in to trade</h2>
        <p className="sb-gate-desc">
          The Paper-Trading Sandbox gives you $100,000 in simulated cash, saved to
          your account. Sign in (free) to start.
        </p>
        <Link href="/sign-up" className="sb-gate-btn">Start free →</Link>
        <Link href="/sign-in" className="sb-gate-link">I already have an account</Link>
      </div>
    </div>
  );
}

// ── Live price chart ────────────────────────────────────────────────────────────
function PriceChart({ symbol, tick }: { symbol: string; tick: number }) {
  const data = useMemo(
    () => simulatePriceHistory(symbol, 40).map((p, i) => ({ i, price: p.price })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol, tick]
  );
  const up = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const color = up ? "var(--grass)" : "var(--coral)";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="i" hide />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "var(--ink-3)", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 6, fontSize: 11, color: "var(--ink)",
            fontFamily: "var(--font-mono)", padding: "6px 10px",
          }}
          formatter={(v) => [typeof v === "number" ? money(v) : v, "price"]}
          labelFormatter={() => symbol}
        />
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────
export default function SandboxClient() {
  const { user, loading: authLoading } = useAuth();

  const [tick, setTick] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [symbol, setSymbol] = useState(WATCHLIST[0].symbol);
  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [side, setSide] = useState<"long" | "short">("long");
  const [qty, setQty] = useState(10);
  const [strike, setStrike] = useState<number>(Math.round(WATCHLIST[0].basePrice));
  const [expiry, setExpiry] = useState(defaultExpiry(30));
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tab, setTab] = useState<"positions" | "trades">("positions");

  const watch = WATCHLIST.find((w) => w.symbol === symbol)!;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sandbox/portfolio");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setLoadError(body.error ?? `Request failed (${res.status})`);
        return;
      }
      setLoadError(null);
      setPortfolio(await res.json());
    } catch {
      setLoadError("Network error loading portfolio");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh();
    const id = setInterval(() => {
      setTick((t) => t + 1);
      refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [user, refresh]);

  // Live quote for the order ticket, ticking every POLL_MS.
  const [quote, setQuote] = useState<number | null>(null);
  useEffect(() => {
    function update() {
      try {
        if (assetType === "stock") {
          setQuote(simulatePrice(symbol));
        } else {
          setQuote(markPrice({ symbol, assetType, strike, expiry }));
        }
      } catch {
        setQuote(null);
      }
    }
    update();
    const id = setInterval(update, POLL_MS);
    return () => clearInterval(id);
  }, [symbol, assetType, strike, expiry, tick]);

  const multiplier = assetType === "stock" ? 1 : 100;
  const estCost = quote != null ? quote * qty * multiplier : null;

  async function placeOrder() {
    setFormError(null);
    setPlacing(true);
    try {
      const res = await fetch("/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          assetType,
          side,
          qty,
          strike: assetType === "stock" ? null : strike,
          expiry: assetType === "stock" ? null : expiry,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.error ?? "Order failed");
        return;
      }
      await refresh();
    } catch {
      setFormError("Network error placing order");
    } finally {
      setPlacing(false);
    }
  }

  async function handleClose(positionId: string) {
    await fetch("/api/sandbox/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionId }),
    });
    await refresh();
  }

  if (authLoading) return null;
  if (!user) return <SignInPrompt />;

  return (
    <div className="sb-root">
      <div className="sb-header">
        <div>
          <div className="sb-eyebrow">Sandbox</div>
          <h1 className="sb-title">Paper-Trading Sandbox</h1>
          <p className="sb-sub">
            Simulated market data, priced live with StrikeLab&rsquo;s own Black-Scholes engine — not real trades, real math.
          </p>
        </div>
        {portfolio && (
          <div className="sb-balance-chips">
            <div className="sb-chip">
              <span className="sb-chip-label">Cash</span>
              <span className="sb-chip-value">{money(portfolio.cashBalance)}</span>
            </div>
            <div className="sb-chip primary">
              <span className="sb-chip-label">Total value</span>
              <span className="sb-chip-value">{money(portfolio.totalValue)}</span>
            </div>
          </div>
        )}
      </div>

      {loadError && <div className="sb-banner error">{loadError}</div>}

      <div className="sb-split">
        {/* ── Left: order ticket ── */}
        <div className="sb-left">
          <div className="sb-card">
            <div className="sb-card-title">Symbol</div>
            <div className="sb-symbol-grid">
              {WATCHLIST.map((w) => (
                <button
                  key={w.symbol}
                  type="button"
                  className={`sb-symbol-btn${symbol === w.symbol ? " active" : ""}`}
                  onClick={() => { setSymbol(w.symbol); setStrike(Math.round(w.basePrice)); }}
                >
                  <span className="sb-symbol-ticker">{w.symbol}</span>
                  <span className="sb-symbol-name">{w.name}</span>
                </button>
              ))}
            </div>

            <div className="sb-chart-wrap">
              <PriceChart symbol={symbol} tick={tick} />
            </div>
            <div className="sb-quote-row">
              <span>Live price</span>
              <span className="sb-quote-value">{quote != null ? money(quote) : "—"}</span>
            </div>
          </div>

          <div className="sb-card">
            <div className="sb-card-title">Order</div>

            <div className="sb-toggle-row">
              {(["stock", "call", "put"] as AssetType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`sb-toggle-btn${assetType === t ? " active" : ""}`}
                  onClick={() => setAssetType(t)}
                >
                  {t === "stock" ? "Stock" : t === "call" ? "Call" : "Put"}
                </button>
              ))}
            </div>

            {assetType !== "stock" && (
              <div className="sb-field-row">
                <label className="sb-field">
                  <span>Strike</span>
                  <input
                    type="number"
                    value={strike}
                    min={1}
                    step={1}
                    onChange={(e) => setStrike(Number(e.target.value))}
                  />
                </label>
                <label className="sb-field">
                  <span>Expiry</span>
                  <input
                    type="date"
                    value={expiry}
                    min={defaultExpiry(1)}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </label>
              </div>
            )}

            <div className="sb-toggle-row">
              {(["long", "short"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`sb-toggle-btn${side === s ? (s === "long" ? " active-long" : " active-short") : ""}`}
                  onClick={() => setSide(s)}
                >
                  {s === "long" ? "Long" : "Short"}
                </button>
              ))}
            </div>

            <label className="sb-field">
              <span>Quantity {assetType !== "stock" && "(contracts)"}</span>
              <input
                type="number"
                value={qty}
                min={1}
                step={1}
                onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value))))}
              />
            </label>

            <div className="sb-cost-row">
              <span>Estimated {side === "long" ? "cost" : "credit"}</span>
              <span className="sb-cost-value">{estCost != null ? money(estCost) : "—"}</span>
            </div>

            {formError && <div className="sb-banner error small">{formError}</div>}

            <button type="button" className="sb-execute-btn" onClick={placeOrder} disabled={placing || quote == null}>
              {placing ? "Placing…" : `${side === "long" ? "Buy" : "Sell"} ${symbol}`}
            </button>
          </div>
        </div>

        {/* ── Right: portfolio ── */}
        <div className="sb-right">
          <div className="sb-tabs">
            <button type="button" className={`sb-tab${tab === "positions" ? " active" : ""}`} onClick={() => setTab("positions")}>
              Open positions {portfolio ? `(${portfolio.positions.length})` : ""}
            </button>
            <button type="button" className={`sb-tab${tab === "trades" ? " active" : ""}`} onClick={() => setTab("trades")}>
              Recent trades
            </button>
          </div>

          {tab === "positions" ? (
            <div className="sb-position-list">
              {!portfolio || portfolio.positions.length === 0 ? (
                <div className="sb-empty">No open positions yet — place an order to get started.</div>
              ) : (
                portfolio.positions.map((p) => (
                  <div key={p.id} className="sb-position-row">
                    <div className="sb-position-main">
                      <div className="sb-position-symbol">
                        {p.symbol}
                        <span className={`sb-tag ${p.side}`}>{p.side}</span>
                        <span className="sb-tag type">{p.asset_type}</span>
                      </div>
                      <div className="sb-position-detail">
                        {p.qty} {p.asset_type === "stock" ? "sh" : "ct"} @ {money(p.avg_cost)}
                        {p.strike != null && ` · K=${p.strike}`}
                        {p.expiry && ` · exp ${p.expiry}`}
                      </div>
                    </div>
                    <div className="sb-position-pnl">
                      <div className="sb-position-mark">{money(p.markPrice)}</div>
                      <div className={`sb-pnl ${p.unrealizedPnl >= 0 ? "gain" : "loss"}`}>
                        {p.unrealizedPnl >= 0 ? "+" : ""}{money(p.unrealizedPnl)}
                      </div>
                    </div>
                    <button type="button" className="sb-close-btn" onClick={() => handleClose(p.id)}>Close</button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="sb-position-list">
              {!portfolio || portfolio.trades.length === 0 ? (
                <div className="sb-empty">No trades yet.</div>
              ) : (
                portfolio.trades.map((t) => (
                  <div key={t.id} className="sb-trade-row">
                    <span className={`sb-tag ${t.direction === "buy" ? "long" : "short"}`}>{t.direction}</span>
                    <span className="sb-trade-symbol">{t.symbol}</span>
                    <span className="sb-trade-detail">{t.qty} {t.asset_type} @ {money(t.fill_price)}</span>
                    <span className="sb-trade-time">{new Date(t.executed_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
