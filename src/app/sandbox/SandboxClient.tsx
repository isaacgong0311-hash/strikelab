"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth/AuthProvider";
import { streamInto, renderAiMarkdown } from "@/components/AiMarkdown";
import {
  WATCHLIST,
  simulatePrice,
  simulatePriceHistory,
  markPrice,
  type AssetType,
  type WatchlistSymbol,
} from "@/lib/pricing";

const POLL_MS = 5000;
const POPULAR_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "SPY"];

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

// ── Ticker search (any of the ~90 simulated symbols) ────────────────────────────
function SymbolPicker({
  symbol,
  onSelect,
}: {
  symbol: string;
  onSelect: (w: WatchlistSymbol) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const current = WATCHLIST.find((w) => w.symbol === symbol)!;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return WATCHLIST.filter(
      (w) => w.symbol.toLowerCase().includes(q) || w.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  function pick(w: WatchlistSymbol) {
    onSelect(w);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="sb-symbol-picker">
      <div className="sb-symbol-current">
        <span className="sb-symbol-current-ticker">{current.symbol}</span>
        <span className="sb-symbol-current-name">{current.name}</span>
      </div>

      <div className="sb-symbol-search-wrap">
        <input
          type="text"
          className="sb-symbol-search"
          placeholder="Search any of ~90 tickers (e.g. AMZN, PLTR, JPM)…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
        {open && query.trim() !== "" && (
          <div className="sb-symbol-dropdown">
            {matches.length > 0 ? (
              matches.map((w) => (
                <button
                  key={w.symbol}
                  type="button"
                  className="sb-symbol-option"
                  onMouseDown={() => pick(w)}
                >
                  <span className="sb-symbol-option-ticker">{w.symbol}</span>
                  <span className="sb-symbol-option-name">{w.name}</span>
                </button>
              ))
            ) : (
              <div className="sb-symbol-empty">No match in the simulated universe.</div>
            )}
          </div>
        )}
      </div>

      <div className="sb-symbol-chips">
        {POPULAR_SYMBOLS.map((s) => (
          <button
            key={s}
            type="button"
            className={`sb-symbol-chip${symbol === s ? " active" : ""}`}
            onClick={() => pick(WATCHLIST.find((w) => w.symbol === s)!)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AI trade coach ───────────────────────────────────────────────────────────────
interface InsightPayload {
  symbol: string;
  name: string;
  assetType: AssetType;
  side: "long" | "short";
  qty: number;
  strike: number | null;
  expiry: string | null;
  price: number | null;
  unrealizedPnl?: number;
  status: "proposed" | "open";
}

function TradeInsight({ payload, disabled }: { payload: InsightPayload; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [text, setText] = useState("");

  async function run() {
    setState("loading");
    setText("");
    try {
      await streamInto("/api/ai/sandbox-insight", payload, (chunk) => setText((p) => p + chunk));
    } catch {
      setText("Couldn't reach the AI coach. Try again in a moment.");
    } finally {
      setState("done");
    }
  }

  if (state === "idle") {
    return (
      <button type="button" className="sb-ai-btn" onClick={run} disabled={disabled}>
        ✨ AI take on this trade
      </button>
    );
  }

  return (
    <div className="sb-ai-panel">
      <div className="sb-ai-panel-label">AI take</div>
      {state === "loading" && !text ? (
        <div className="sb-ai-loading">Thinking…</div>
      ) : (
        <div className="sb-ai-text">{renderAiMarkdown(text)}</div>
      )}
    </div>
  );
}

// ── AI trade idea generator (NL thesis → structured trade) ─────────────────────
interface TradeIdea {
  symbol: string;
  assetType: AssetType;
  side: "long" | "short";
  strike: number | null;
  expiryDays: number | null;
  qty: number;
  rationale: string;
}

function TradeIdeaGenerator({ onIdea }: { onIdea: (idea: TradeIdea) => void }) {
  const [thesis, setThesis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rationale, setRationale] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setRationale(null);
    try {
      const res = await fetch("/api/ai/sandbox-trade-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesis }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Couldn't generate an idea.");
        return;
      }
      onIdea(body as TradeIdea);
      setRationale((body as TradeIdea).rationale);
    } catch {
      setError("Network error reaching the AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sb-card sb-idea-card">
      <div className="sb-card-title">✨ AI trade idea</div>
      <p className="sb-idea-hint">
        Describe your market view — the AI turns it into a concrete trade and fills in the order below.
      </p>
      <textarea
        className="sb-idea-input"
        rows={2}
        placeholder="e.g. I think Tesla drops after earnings but I don't want unlimited risk…"
        value={thesis}
        onChange={(e) => setThesis(e.target.value)}
      />
      <button
        type="button"
        className="sb-idea-btn"
        onClick={generate}
        disabled={loading || thesis.trim().length < 5}
      >
        {loading ? "Thinking…" : "Generate trade idea"}
      </button>
      {error && <div className="sb-banner error small">{error}</div>}
      {rationale && <div className="sb-idea-rationale">{rationale}</div>}
    </div>
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

  function applyIdea(idea: TradeIdea) {
    setSymbol(idea.symbol);
    setAssetType(idea.assetType);
    setSide(idea.side);
    setQty(idea.qty);
    if (idea.assetType !== "stock") {
      setStrike(idea.strike ?? Math.round(WATCHLIST.find((w) => w.symbol === idea.symbol)!.basePrice));
      setExpiry(defaultExpiry(idea.expiryDays ?? 30));
    }
  }

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
    // Fetch-on-mount-then-poll — the same pattern useSubscription.ts uses,
    // just via a shared `refresh` callback (also called after placing/closing
    // a trade) instead of an inline .then chain, which is what the stricter
    // set-state-in-effect rule is actually keying off of here. The effect
    // itself does nothing synchronous; refresh() only sets state after an
    // awaited fetch resolves, same as any other data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    // Skip the network round-trip while the tab is hidden — this used to poll
    // every 5s indefinitely regardless of focus, which is needless load
    // against Supabase's free-tier limits for a tab sitting in the
    // background. Catches up immediately when the tab regains focus.
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setTick((t) => t + 1);
      refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refresh]);

  // Live quote for the order ticket, ticking every POLL_MS. Client-only math
  // (no network call), but still no reason to burn cycles in a hidden tab.
  const [quote, setQuote] = useState<number | null>(null);
  useEffect(() => {
    function update() {
      if (document.visibilityState !== "visible") return;
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
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", update);
    };
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
      {/* No repeated eyebrow/title/subtitle here — page.tsx already
          server-renders that H1 block above (needed pre-auth for SEO/
          crawlers), so echoing it again once signed in was pure duplicate
          text. Just the live balance readout, which is genuinely new. */}
      {portfolio && (
        <div className="sb-header">
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
        </div>
      )}

      {loadError && <div className="sb-banner error">{loadError}</div>}

      <div className="sb-split">
        {/* ── Left: order ticket ── */}
        <div className="sb-left">
          <TradeIdeaGenerator onIdea={applyIdea} />

          <div className="sb-card">
            <div className="sb-card-title">Symbol</div>
            <SymbolPicker
              symbol={symbol}
              onSelect={(w) => { setSymbol(w.symbol); setStrike(Math.round(w.basePrice)); }}
            />

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

            <TradeInsight
              disabled={quote == null}
              payload={{
                symbol,
                name: watch.name,
                assetType,
                side,
                qty,
                strike: assetType === "stock" ? null : strike,
                expiry: assetType === "stock" ? null : expiry,
                price: quote,
                status: "proposed",
              }}
            />
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
                  <div key={p.id} className="sb-position-card">
                    <div className="sb-position-row">
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
                    <TradeInsight
                      payload={{
                        symbol: p.symbol,
                        name: WATCHLIST.find((w) => w.symbol === p.symbol)?.name ?? p.symbol,
                        assetType: p.asset_type,
                        side: p.side,
                        qty: p.qty,
                        strike: p.strike,
                        expiry: p.expiry,
                        price: p.markPrice,
                        unrealizedPnl: p.unrealizedPnl,
                        status: "open",
                      }}
                    />
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
