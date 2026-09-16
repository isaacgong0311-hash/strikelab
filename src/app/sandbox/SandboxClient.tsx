"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useHydrated } from "@/lib/useHydrated";
import { useAuth } from "@/lib/auth/AuthProvider";
import { streamInto, renderAiMarkdown } from "@/components/AiMarkdown";
import Dialog from "@/components/ui/Dialog";
import { TabList, TabPanel } from "@/components/ui/Tabs";
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
  const hydrated = useHydrated();
  const data = useMemo(
    () => simulatePriceHistory(symbol, 40).map((p, i) => ({ i, price: p.price })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol, tick]
  );
  const up = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const color = up ? "var(--grass)" : "var(--coral)";

  if (!hydrated) return <div className="h-full" aria-hidden="true" />;

  const first = data[0]?.price ?? 0;
  const last = data.at(-1)?.price ?? first;

  return (
    <>
    <p className="sl-visually-hidden" role="img" aria-label={`${symbol} simulated price history. Started at ${money(first)}, ended at ${money(last)}, ${last >= first ? "up" : "down"} ${money(Math.abs(last - first))}.`} />
    <div aria-hidden="true" style={{ width: "100%", height: "100%" }}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
    </div>
    </>
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
  const [activeIndex, setActiveIndex] = useState(0);
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
    setActiveIndex(0);
  }

  return (
    <div className="sb-symbol-picker">
      <div className="sb-symbol-current">
        <span className="sb-symbol-current-ticker">{current.symbol}</span>
        <span className="sb-symbol-current-name">{current.name}</span>
      </div>

      <div className="sb-symbol-search-wrap">
        <label htmlFor="sandbox-symbol-search" className="sb-field-label">Search simulated symbols</label>
        <input
          id="sandbox-symbol-search"
          type="text"
          className="sb-symbol-search"
          placeholder="Search any of ~90 tickers (e.g. AMZN, PLTR, JPM)…"
          value={query}
          role="combobox"
          aria-expanded={open && query.trim() !== ""}
          aria-controls="sandbox-symbol-options"
          aria-autocomplete="list"
          aria-activedescendant={open && matches[activeIndex] ? `sandbox-symbol-${matches[activeIndex].symbol}` : undefined}
          autoComplete="off"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(index + 1, Math.max(matches.length - 1, 0))); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
            if (event.key === "Enter" && open && matches[activeIndex]) { event.preventDefault(); pick(matches[activeIndex]); }
            if (event.key === "Escape") { setOpen(false); }
          }}
        />
        {open && query.trim() !== "" && (
          <div className="sb-symbol-dropdown" id="sandbox-symbol-options" role="listbox" aria-label="Matching symbols">
            {matches.length > 0 ? (
              matches.map((w) => (
                <button
                  key={w.symbol}
                  id={`sandbox-symbol-${w.symbol}`}
                  type="button"
                  className="sb-symbol-option"
                  role="option"
                  aria-selected={matches[activeIndex]?.symbol === w.symbol}
                  onMouseDown={() => pick(w)}
                >
                  <span className="sb-symbol-option-ticker">{w.symbol}</span>
                  <span className="sb-symbol-option-name">{w.name}</span>
                </button>
              ))
            ) : (
              <div className="sb-symbol-empty" role="status">No match in the simulated universe.</div>
            )}
          </div>
        )}
      </div>

      <div className="sb-symbol-chips" role="group" aria-label="Popular symbols">
        {POPULAR_SYMBOLS.map((s) => (
          <button
            key={s}
            type="button"
            className={`sb-symbol-chip${symbol === s ? " active" : ""}`}
            aria-pressed={symbol === s}
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
        AI take on this trade
      </button>
    );
  }

  return (
    <div className="sb-ai-panel" aria-busy={state === "loading"}>
      <div className="sb-ai-panel-label">AI take</div>
      {state === "loading" && !text ? (
        <div className="sb-ai-loading">Thinking…</div>
      ) : (
        <div className="sb-ai-text" aria-live="off">{renderAiMarkdown(text)}</div>
      )}
      <span className="sl-visually-hidden" role="status" aria-live="polite">
        {state === "loading" ? "AI trade insight is loading." : "AI trade insight is ready."}
      </span>
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
    <section className="sb-card sb-idea-card" aria-labelledby="trade-idea-title">
      <h2 id="trade-idea-title" className="sb-card-title">AI trade idea</h2>
      <p className="sb-idea-hint">
        Describe your market view — the AI turns it into a concrete trade and fills in the order below.
      </p>
      <textarea
        aria-label="Describe your market view"
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
      {error && <div className="sb-banner error small" role="alert">{error}</div>}
      {rationale && <div className="sb-idea-rationale" role="status">{rationale}</div>}
    </section>
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
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [closingPosition, setClosingPosition] = useState<PositionApi | null>(null);
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
  const quantityError = !Number.isInteger(qty) || qty < 1 ? "Enter a whole number of 1 or more." : null;
  const strikeError = assetType !== "stock" && (!Number.isFinite(strike) || strike <= 0)
    ? "Enter a strike price greater than zero."
    : null;
  const expiryError = assetType !== "stock" && (!expiry || expiry < defaultExpiry(1))
    ? "Choose a future expiration date."
    : null;
  const orderInvalid = Boolean(quantityError || strikeError || expiryError);

  async function placeOrder() {
    setFormError(null);
    setOrderMessage(null);
    if (orderInvalid) {
      setFormError(quantityError ?? strikeError ?? expiryError ?? "Review the order details.");
      return;
    }
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
      setOrderMessage(`${side === "long" ? "Bought" : "Sold"} ${qty} ${assetType === "stock" ? "shares" : "contracts"} of ${symbol}.`);
    } catch {
      setFormError("Network error placing order");
    } finally {
      setPlacing(false);
    }
  }

  async function handleClose(positionId: string) {
    setFormError(null);
    try {
      const res = await fetch("/api/sandbox/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Position could not be closed");
      await refresh();
      setOrderMessage("Position closed successfully.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Position could not be closed");
    } finally {
      setClosingPosition(null);
    }
  }

  if (authLoading) return <p className="sb-root" role="status">Loading trading sandbox…</p>;
  if (!user) return <SignInPrompt />;

  return (
    <div className="sb-root">
      <Dialog open={Boolean(closingPosition)} onClose={() => setClosingPosition(null)} title="Close this position?">
        <p style={{ color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 18 }}>
          {closingPosition ? `Close ${closingPosition.qty} ${closingPosition.asset_type === "stock" ? "shares" : "contracts"} of ${closingPosition.symbol} at the current simulated mark?` : ""}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="v2-btn" onClick={() => closingPosition && handleClose(closingPosition.id)}>Confirm close</button>
          <button type="button" className="v2-btn ghost" onClick={() => setClosingPosition(null)}>Keep position</button>
        </div>
      </Dialog>
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

      {loadError && <div className="sb-banner error" role="alert">{loadError}</div>}
      {formError && <div className="sb-banner error" role="alert">{formError}</div>}
      {orderMessage && <div className="sb-banner success" role="status" aria-live="polite">{orderMessage}</div>}

      <div className="sb-split">
        {/* ── Left: order ticket ── */}
        <div className="sb-left">
          <section className="sb-card" aria-labelledby="symbol-card-title">
            <h2 id="symbol-card-title" className="sb-card-title">Choose a symbol</h2>
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
          </section>

          <section className="sb-card" aria-labelledby="order-card-title">
            <h2 id="order-card-title" className="sb-card-title">Build an order</h2>

            <fieldset className="sb-toggle-group">
            <legend>Asset type</legend>
            <div className="sb-toggle-row">
              {(["stock", "call", "put"] as AssetType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`sb-toggle-btn${assetType === t ? " active" : ""}`}
                  aria-pressed={assetType === t}
                  onClick={() => setAssetType(t)}
                >
                  {t === "stock" ? "Stock" : t === "call" ? "Call" : "Put"}
                </button>
              ))}
            </div>
            </fieldset>

            {assetType !== "stock" && (
              <div className="sb-field-row">
                <label className="sb-field">
                  <span>Strike</span>
                  <input
                    id="sandbox-strike"
                    type="number"
                    value={strike}
                    min={1}
                    step={1}
                    aria-describedby={strikeError ? "sandbox-strike-help sandbox-strike-error" : "sandbox-strike-help"}
                    aria-invalid={Boolean(strikeError)}
                    onChange={(e) => setStrike(Number(e.target.value))}
                  />
                  <small id="sandbox-strike-help">Price in US dollars.</small>
                  {strikeError && <small id="sandbox-strike-error" className="sb-field-error">{strikeError}</small>}
                </label>
                <label className="sb-field">
                  <span>Expiry</span>
                  <input
                    id="sandbox-expiry"
                    type="date"
                    value={expiry}
                    min={defaultExpiry(1)}
                    aria-describedby={expiryError ? "sandbox-expiry-help sandbox-expiry-error" : "sandbox-expiry-help"}
                    aria-invalid={Boolean(expiryError)}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                  <small id="sandbox-expiry-help">Option expiration date.</small>
                  {expiryError && <small id="sandbox-expiry-error" className="sb-field-error">{expiryError}</small>}
                </label>
              </div>
            )}

            <fieldset className="sb-toggle-group">
            <legend>Position direction</legend>
            <div className="sb-toggle-row">
              {(["long", "short"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`sb-toggle-btn${side === s ? (s === "long" ? " active-long" : " active-short") : ""}`}
                  aria-pressed={side === s}
                  onClick={() => setSide(s)}
                >
                  {s === "long" ? "Long" : "Short"}
                </button>
              ))}
            </div>
            </fieldset>

            <label className="sb-field">
              <span>Quantity {assetType !== "stock" && "(contracts)"}</span>
              <input
                id="sandbox-quantity"
                type="number"
                value={qty}
                min={1}
                step={1}
                aria-describedby={quantityError ? "sandbox-quantity-help sandbox-quantity-error" : "sandbox-quantity-help"}
                aria-invalid={Boolean(quantityError)}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <small id="sandbox-quantity-help">Whole {assetType === "stock" ? "shares" : "contracts"}; options represent 100 shares each.</small>
              {quantityError && <small id="sandbox-quantity-error" className="sb-field-error">{quantityError}</small>}
            </label>

            <div className="sb-cost-row">
              <span>Estimated {side === "long" ? "cost" : "credit"}</span>
              <span className="sb-cost-value">{estCost != null ? money(estCost) : "—"}</span>
            </div>

            <button type="button" className="sb-execute-btn" onClick={placeOrder} disabled={placing || quote == null || orderInvalid} aria-busy={placing}>
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
          </section>

          <TradeIdeaGenerator onIdea={applyIdea} />
        </div>

        {/* ── Right: portfolio ── */}
        <div className="sb-right">
          <TabList
            idPrefix="sandbox-portfolio"
            label="Portfolio views"
            activeId={tab}
            onChange={(id) => setTab(id as "positions" | "trades")}
            items={[
              { id: "positions", label: <>Open positions {portfolio ? `(${portfolio.positions.length})` : ""}</> },
              { id: "trades", label: "Recent trades" },
            ]}
          />

          <TabPanel idPrefix="sandbox-portfolio" id="positions" activeId={tab}>
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
                          <span aria-hidden="true">{p.unrealizedPnl >= 0 ? "▲" : "▼"} </span>
                          <span className="sl-visually-hidden">{p.unrealizedPnl >= 0 ? "Unrealized gain" : "Unrealized loss"}: </span>
                          {p.unrealizedPnl >= 0 ? "+" : ""}{money(p.unrealizedPnl)}
                        </div>
                      </div>
                      <button type="button" className="sb-close-btn" onClick={() => setClosingPosition(p)} aria-label={`Close ${p.symbol} position`}>Close</button>
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
          </TabPanel>
          <TabPanel idPrefix="sandbox-portfolio" id="trades" activeId={tab}>
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
          </TabPanel>
        </div>
      </div>
    </div>
  );
}
