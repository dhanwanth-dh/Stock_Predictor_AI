import { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { apiUrl } from "../utils/api";

// --- Local storage helpers ---
const STORAGE_KEY = "stockai_portfolio";

function loadPortfolio() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultPortfolio();
  } catch {
    return defaultPortfolio();
  }
}

function savePortfolio(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function defaultPortfolio() {
  return {
    holdings: [
      { id: 1, ticker: "RELIANCE.NS", name: "Reliance Industries", type: "equity", qty: 10, avgBuy: 2800 },
      { id: 2, ticker: "TCS.NS",      name: "TCS",                 type: "equity", qty: 5,  avgBuy: 3500 },
      { id: 3, ticker: "HDFCBANK.NS", name: "HDFC Bank",           type: "equity", qty: 8,  avgBuy: 1600 },
    ],
    bonds: [
      { id: 1, name: "Govt Bond 7.5%", invested: 50000, maturityYears: 5, rate: 7.5 },
    ],
    fds: [
      { id: 1, name: "SBI FD",  invested: 100000, maturityYears: 2, rate: 7.1 },
      { id: 2, name: "HDFC FD", invested: 50000,  maturityYears: 1, rate: 7.4 },
    ],
  };
}

const PIE_COLORS = ["#3B82F6", "#00C896", "#F59E0B", "#FF4D4F", "#A78BFA"];
const TYPE_COLORS = { equity: "#3B82F6", bonds: "#00C896", fds: "#F59E0B" };

function fmt(n) { return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }

// --- Add Holding Modal ---
function AddHoldingModal({ type, onAdd, onClose }) {
  const [form, setForm] = useState(
    type === "equity"
      ? { ticker: "", name: "", qty: "", avgBuy: "" }
      : { name: "", invested: "", maturityYears: "", rate: "" }
  );
  const [tickerList, setTickerList] = useState([]);
  const [tickerQuery, setTickerQuery] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const dropRef = useRef(null);

  // Load ticker list once
  useEffect(() => {
    fetch(apiUrl("/api/tickers"))
      .then((r) => r.json())
      .then((d) => setTickerList(d.tickers || []))
      .catch(() => {});
  }, []);

  const filtered = tickerQuery.trim()
    ? tickerList.filter((t) => t.toUpperCase().includes(tickerQuery.toUpperCase())).slice(0, 10)
    : tickerList.slice(0, 10);

  function pickTicker(ticker) {
    setTickerQuery(ticker);
    setShowDrop(false);
    setForm((p) => ({ ...p, ticker, name: ticker }));
    // Fetch live price and auto-fill avgBuy
    setFetchingPrice(true);
    fetch(apiUrl(`/api/stocks/${encodeURIComponent(ticker)}`))
      .then((r) => r.json())
      .then((d) => {
        setForm((p) => ({
          ...p,
          ticker,
          name: ticker,
          avgBuy: String(d.summary?.currentPrice ?? ""),
        }));
      })
      .catch(() => {})
      .finally(() => setFetchingPrice(false));
  }

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    onAdd({ ...form, id: Date.now() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-text capitalize">Add {type === "fds" ? "FD" : type.slice(0, -1)}</h3>
        <form onSubmit={submit} className="space-y-3">
          {type === "equity" ? (
            <>
              {/* Ticker searchable dropdown */}
              <div ref={dropRef}>
                <label className="mb-1 block text-xs text-muted">Company / Ticker</label>
                <input
                  type="text"
                  value={tickerQuery}
                  onChange={(e) => { setTickerQuery(e.target.value); setShowDrop(true); }}
                  onFocus={() => setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  placeholder="Search company or ticker…"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text outline-none focus:border-active"
                />
                {showDrop && filtered.length > 0 && (
                  <ul
                    className="mt-1 max-h-48 overflow-auto rounded-xl border border-white/10 shadow-lg z-50"
                    style={{ background: "#121826" }}
                  >
                    {filtered.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          onMouseDown={() => pickTicker(t)}
                          className="w-full px-4 py-2 text-left text-sm text-text hover:bg-white/10"
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quantity */}
              <Input label="Quantity" type="number" value={form.qty} onChange={(v) => set("qty", v)} />

              {/* Avg buy price — auto-filled, editable */}
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Avg Buy Price (₹)
                  {fetchingPrice && <span className="ml-2 text-active">fetching…</span>}
                </label>
                <input
                  type="number"
                  value={form.avgBuy}
                  onChange={(e) => set("avgBuy", e.target.value)}
                  required
                  placeholder={fetchingPrice ? "Loading current price…" : "Auto-filled with current price"}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text outline-none focus:border-active"
                />
                {form.avgBuy && (
                  <p className="mt-1 text-xs text-muted">
                    Total invested: <span className="text-text font-medium">₹ {fmt(Number(form.qty || 0) * Number(form.avgBuy))}</span>
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <Input label="Name" value={form.name} onChange={(v) => set("name", v)} />
              <Input label="Amount Invested (₹)" type="number" value={form.invested} onChange={(v) => set("invested", v)} />
              <Input label="Maturity (years)" type="number" value={form.maturityYears} onChange={(v) => set("maturityYears", v)} />
              <Input label="Interest Rate (%)" type="number" value={form.rate} onChange={(v) => set("rate", v)} />
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-active py-2.5 text-sm font-medium text-white">Add</button>
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-muted">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text outline-none focus:border-active"
      />
    </div>
  );
}

// --- Main Portfolio Page ---
export default function PortfolioPage({ liveData: externalLiveData }) {
  const [portfolio, setPortfolio] = useState(loadPortfolio);
  const [modal, setModal] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [fetchedPrices, setFetchedPrices] = useState({});

  // Fetch live prices for all equity holdings that aren't already in externalLiveData
  useEffect(() => {
    const tickers = portfolio.holdings.map((h) => h.ticker);
    tickers.forEach((ticker) => {
      if (externalLiveData?.[ticker] || fetchedPrices[ticker]) return;
      fetch(apiUrl(`/api/stocks/${encodeURIComponent(ticker)}`))
        .then((r) => r.json())
        .then((d) => {
          setFetchedPrices((prev) => ({
            ...prev,
            [ticker]: {
              currentPrice: d.summary?.currentPrice,
              predictedPrice: d.summary?.predictedPriceDay7,
            },
          }));
        })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio.holdings]);

  // Merge external (dashboard-browsed) and internally fetched prices
  const liveData = { ...fetchedPrices, ...externalLiveData };

  function persist(updated) {
    setPortfolio(updated);
    savePortfolio(updated);
  }

  function addItem(type, item) {
    const key = type === "equity" ? "holdings" : type;
    persist({ ...portfolio, [key]: [...portfolio[key], { ...item, type }] });
  }

  function removeItem(type, id) {
    const key = type === "equity" ? "holdings" : type;
    persist({ ...portfolio, [key]: portfolio[key].filter((x) => x.id !== id) });
  }

  // Compute live values for equity holdings
  const enrichedHoldings = portfolio.holdings.map((h) => {
    const live = liveData?.[h.ticker];
    const currentPrice = live?.currentPrice ?? h.avgBuy;
    const predictedPrice = live?.predictedPrice ?? null;
    const invested = h.qty * h.avgBuy;
    const currentValue = h.qty * currentPrice;
    const pnl = currentValue - invested;
    const pnlPct = ((pnl / invested) * 100).toFixed(2);
    return { ...h, currentPrice, predictedPrice, invested, currentValue, pnl, pnlPct };
  });

  const totalEquity = enrichedHoldings.reduce((s, h) => s + h.currentValue, 0);
  const totalEquityInvested = enrichedHoldings.reduce((s, h) => s + h.invested, 0);

  const totalBonds = portfolio.bonds.reduce((s, b) => s + Number(b.invested), 0);
  const totalFDs = portfolio.fds.reduce((s, f) => s + Number(f.invested), 0);
  const grandTotal = totalEquity + totalBonds + totalFDs;
  const grandInvested = totalEquityInvested + totalBonds + totalFDs;
  const grandPnL = totalEquity - totalEquityInvested; // bonds/FDs are capital-preserved

  const allocationData = [
    { name: "Equity", value: Math.round(totalEquity) },
    { name: "Bonds", value: Math.round(totalBonds) },
    { name: "FDs", value: Math.round(totalFDs) },
  ].filter((d) => d.value > 0);

  const SECTIONS = ["overview", "equity", "bonds", "fds"];

  return (
    <div className="space-y-6">
      {modal && (
        <AddHoldingModal
          type={modal}
          onAdd={(item) => addItem(modal, item)}
          onClose={() => setModal(null)}
        />
      )}

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
              activeSection === s ? "bg-active text-white" : "bg-white/5 text-muted hover:text-text border border-white/10"
            }`}
          >
            {s === "fds" ? "Fixed Deposits" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Value" value={`₹ ${fmt(grandTotal)}`} />
            <StatCard label="Total Invested" value={`₹ ${fmt(grandInvested)}`} />
            <StatCard
              label="Overall P&L"
              value={`${grandPnL >= 0 ? "+" : ""}₹ ${fmt(grandPnL)}`}
              valueClass={grandPnL >= 0 ? "text-profit" : "text-danger"}
            />
            <StatCard
              label="Return"
              value={`${grandInvested > 0 ? ((grandPnL / grandInvested) * 100).toFixed(2) : 0}%`}
              valueClass={grandPnL >= 0 ? "text-profit" : "text-danger"}
            />
          </div>

          {/* Allocation breakdown */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="glass-panel rounded-2xl p-5">
              <p className="text-xs text-muted uppercase tracking-widest mb-4">Asset Allocation</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {allocationData.map((entry) => (
                        <Cell key={entry.name} fill={TYPE_COLORS[entry.name.toLowerCase()] || PIE_COLORS[0]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1A2238", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                      formatter={(v) => [`₹ ${fmt(v)}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {allocationData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLORS[d.name.toLowerCase()] }} />
                      <span className="text-muted">{d.name}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-text font-medium">₹ {fmt(d.value)}</span>
                      <span className="text-muted w-12 text-right">{grandTotal > 0 ? ((d.value / grandTotal) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-category summary */}
            <div className="space-y-3">
              <SummaryRow
                label="Equity"
                color="#3B82F6"
                invested={totalEquityInvested}
                current={totalEquity}
                onClick={() => setActiveSection("equity")}
              />
              <SummaryRow
                label="Bonds"
                color="#00C896"
                invested={totalBonds}
                current={totalBonds}
                onClick={() => setActiveSection("bonds")}
              />
              <SummaryRow
                label="Fixed Deposits"
                color="#F59E0B"
                invested={totalFDs}
                current={totalFDs}
                onClick={() => setActiveSection("fds")}
              />
            </div>
          </div>
        </div>
      )}

      {/* EQUITY */}
      {activeSection === "equity" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-widest">Equity Holdings</p>
              <p className="mt-0.5 text-sm text-muted">Current value: <span className="text-text font-medium">₹ {fmt(totalEquity)}</span></p>
            </div>
            <button
              type="button"
              onClick={() => setModal("equity")}
              className="rounded-xl bg-active px-4 py-2 text-sm font-medium text-white"
            >
              + Add Stock
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-muted uppercase tracking-wider">
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Avg Buy</th>
                    <th className="px-4 py-3">Current</th>
                    <th className="px-4 py-3">Invested</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">P&L</th>
                    <th className="px-4 py-3">7D Pred.</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {enrichedHoldings.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-muted">No holdings yet. Add a stock to get started.</td></tr>
                  ) : enrichedHoldings.map((h) => (
                    <tr key={h.id} className="text-text hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="font-medium">{h.name}</p>
                        <p className="text-xs text-muted">{h.ticker}</p>
                      </td>
                      <td className="px-4 py-3">{h.qty}</td>
                      <td className="px-4 py-3">₹ {fmt(h.avgBuy)}</td>
                      <td className="px-4 py-3">₹ {fmt(h.currentPrice)}</td>
                      <td className="px-4 py-3">₹ {fmt(h.invested)}</td>
                      <td className="px-4 py-3">₹ {fmt(h.currentValue)}</td>
                      <td className={`px-4 py-3 font-medium ${h.pnl >= 0 ? "text-profit" : "text-danger"}`}>
                        {h.pnl >= 0 ? "+" : ""}₹ {fmt(h.pnl)}
                        <span className="ml-1 text-xs">({h.pnlPct}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        {liveData[h.ticker]
                          ? <span className="text-active font-medium">₹ {fmt(liveData[h.ticker].predictedPrice)}</span>
                          : <span className="text-dim text-xs animate-pulse">loading…</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem("equity", h.id)}
                          className="text-xs text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BONDS */}
      {activeSection === "bonds" && (
        <InstrumentSection
          title="Bonds"
          items={portfolio.bonds}
          total={totalBonds}
          onAdd={() => setModal("bonds")}
          onRemove={(id) => removeItem("bonds", id)}
          addLabel="+ Add Bond"
          emptyMsg="No bonds added yet."
        />
      )}

      {/* FDs */}
      {activeSection === "fds" && (
        <InstrumentSection
          title="Fixed Deposits"
          items={portfolio.fds}
          total={totalFDs}
          onAdd={() => setModal("fds")}
          onRemove={(id) => removeItem("fds", id)}
          addLabel="+ Add FD"
          emptyMsg="No fixed deposits added yet."
        />
      )}
    </div>
  );
}

function InstrumentSection({ title, items, total, onAdd, onRemove, addLabel, emptyMsg }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest">{title}</p>
          <p className="mt-0.5 text-sm text-muted">Total invested: <span className="text-text font-medium">₹ {fmt(total)}</span></p>
        </div>
        <button type="button" onClick={onAdd} className="rounded-xl bg-active px-4 py-2 text-sm font-medium text-white">
          {addLabel}
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Invested</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Maturity</th>
                <th className="px-4 py-3">Maturity Value</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">{emptyMsg}</td></tr>
              ) : items.map((item) => {
                const invested = Number(item.invested);
                const rate = Number(item.rate) / 100;
                const years = Number(item.maturityYears);
                const maturityValue = invested * Math.pow(1 + rate, years);
                return (
                  <tr key={item.id} className="text-text hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">₹ {fmt(invested)}</td>
                    <td className="px-4 py-3 text-profit">{item.rate}%</td>
                    <td className="px-4 py-3">{years} yr{years > 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-active font-medium">₹ {fmt(maturityValue)}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => onRemove(item.id)} className="text-xs text-danger hover:underline">
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass = "text-text" }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
      <p className="text-xs text-muted uppercase tracking-widest">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, color, invested, current, onClick }) {
  const pnl = current - invested;
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel w-full rounded-2xl p-4 text-left hover:bg-white/[0.06] transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ background: color }} />
          <span className="text-sm font-medium text-text">{label}</span>
        </div>
        <span className={`text-sm font-medium ${pnl >= 0 ? "text-profit" : "text-danger"}`}>
          {pnl >= 0 ? "+" : ""}₹ {fmt(pnl)}
        </span>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>Invested: ₹ {fmt(invested)}</span>
        <span>Current: ₹ {fmt(current)}</span>
      </div>
    </button>
  );
}
