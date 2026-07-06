import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, BrainCircuit, BriefcaseBusiness, Info, Search, TrendingUp } from "lucide-react";
import StockChart from "./components/StockChart";
import AIInsightCard from "./components/AIInsightCard";
import ChatPanel from "./components/ChatPanel";
import PortfolioPage from "./components/PortfolioPage";
import { fetchStockData, fetchTickers, mapApiDataToDashboard, timeRanges } from "./utils/dashboardData";
import { getApiHint } from "./utils/api";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "forecast",  label: "Forecast",  icon: TrendingUp },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "about",     label: "About",     icon: Info },
];

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] ${className}`} />;
}

function StatBox({ label, value, valueClass = "text-text" }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
      <p className="text-xs text-muted uppercase tracking-widest">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${valueClass}`}>{value ?? "—"}</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [tickerList, setTickerList] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS");
  const [range, setRange] = useState("1M");
  const [chartMode, setChartMode] = useState("line");
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // liveData: { [ticker]: { currentPrice, predictedPrice } } — built up as user browses
  const liveDataRef = useRef({});
  const [liveData, setLiveData] = useState({});

  useEffect(() => {
    fetchTickers()
      .then((data) => {
        setTickerList(data.tickers || []);
        setSelectedSymbol(data.defaultTicker || "RELIANCE.NS");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStockData(selectedSymbol)
      .then((data) => {
        setApiData(data);
        setLoading(false);
        // cache live price for portfolio
        const s = data.summary;
        liveDataRef.current[data.ticker] = {
          currentPrice: s.currentPrice,
          predictedPrice: s.predictedPriceDay7,
        };
        setLiveData({ ...liveDataRef.current });
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [selectedSymbol]);

  const dashboard = useMemo(() => {
    if (!apiData) return null;
    return mapApiDataToDashboard(apiData, range);
  }, [apiData, range]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return tickerList.slice(0, 10);
    return tickerList.filter((t) => t.toUpperCase().includes(query.toUpperCase())).slice(0, 10);
  }, [query, tickerList]);

  function selectTicker(ticker) {
    setSelectedSymbol(ticker);
    setQuery("");
    setShowSuggestions(false);
  }

  const marketOpen = useMemo(() => {
    const now = new Date();
    const m = now.getHours() * 60 + now.getMinutes();
    return m >= 555 && m <= 930;
  }, []);

  return (
    <div className="min-h-screen bg-ink text-text grid-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/90 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="rounded-xl bg-active/15 p-2 text-active">
              <BarChart3 size={18} />
            </div>
            <span className="font-semibold text-text text-base">StockAI</span>
          </div>

          <div className="relative flex-1 max-w-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Search size={15} className="text-muted shrink-0" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search ticker…"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-dim"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full mt-1 w-full rounded-xl border border-white/10 shadow-lg z-50 overflow-auto max-h-64" style={{ background: "#121826" }}>
                {suggestions.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onMouseDown={() => selectTicker(t)}
                      className="w-full px-4 py-2.5 text-left text-sm text-text hover:bg-white/10 transition-colors"
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-medium ${marketOpen ? "bg-profit/15 text-profit" : "bg-danger/15 text-danger"}`}>
            {marketOpen ? "Market Open" : "Market Closed"}
          </span>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="border-b border-white/10 bg-ink/80 px-4">
        <div className="mx-auto max-w-5xl flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? "border-active text-active" : "border-transparent text-muted hover:text-text"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Selected stock pill */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-active/15 px-4 py-1.5 text-sm font-medium text-active">{selectedSymbol}</span>
          {dashboard && (
            <span className={`text-sm font-medium ${dashboard.summary.predictedChangePercent >= 0 ? "text-profit" : "text-danger"}`}>
              {dashboard.summary.predictedChangePercent >= 0 ? "▲" : "▼"} {Math.abs(dashboard.summary.predictedChangePercent)}% predicted
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            ⚠ {error}
            <p className="mt-1 text-xs text-danger/80">{getApiHint()}</p>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <>
            {loading || !dashboard ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
                </div>
                <SkeletonBlock className="h-[420px]" />
                <SkeletonBlock className="h-48" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatBox label="Current Price" value={`₹ ${dashboard.summary.currentPrice}`} />
                  <StatBox label="7-Day Target" value={`₹ ${dashboard.summary.predictedPrice}`} />
                  <StatBox
                    label="Predicted Change"
                    value={`${dashboard.summary.predictedChangePercent >= 0 ? "+" : ""}${dashboard.summary.predictedChangePercent}%`}
                    valueClass={dashboard.summary.predictedChangePercent >= 0 ? "text-profit" : "text-danger"}
                  />
                  <StatBox label="52W High" value={`₹ ${dashboard.summary.high52Week}`} />
                </div>

                <StockChart
                  symbol={selectedSymbol}
                  data={dashboard.chartData}
                  range={range}
                  setRange={setRange}
                  ranges={timeRanges}
                  chartMode={chartMode}
                  setChartMode={setChartMode}
                  positiveTrend={dashboard.summary.predictedChangePercent >= 0}
                />

                <AIInsightCard insight={dashboard.insight} />
              </>
            )}
          </>
        )}

        {/* FORECAST TAB */}
        {tab === "forecast" && (
          <>
            {loading || !dashboard ? (
              <SkeletonBlock className="h-64" />
            ) : (
              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-5">
                  <p className="text-sm text-muted uppercase tracking-widest mb-4">7-Day Price Forecast</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted border-b border-white/10">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Predicted Price</th>
                          <th className="pb-3 font-medium">Change from Today</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboard.forecast.map((f) => {
                          const change = f.predictedClose - dashboard.summary.currentPrice;
                          const changePct = ((change / dashboard.summary.currentPrice) * 100).toFixed(2);
                          return (
                            <tr key={f.date} className="text-text">
                              <td className="py-3 text-muted">{f.date}</td>
                              <td className="py-3 font-medium">₹ {f.predictedClose}</td>
                              <td className={`py-3 font-medium ${change >= 0 ? "text-profit" : "text-danger"}`}>
                                {change >= 0 ? "+" : ""}{changePct}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <ChatPanel chat={dashboard.chat} symbol={selectedSymbol} summary={dashboard.summary} />
              </div>
            )}
          </>
        )}

        {/* PORTFOLIO TAB */}
        {tab === "portfolio" && (
          <PortfolioPage liveData={liveData} />
        )}

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div className="glass-panel rounded-2xl p-6 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-active/15 p-2 text-active"><BrainCircuit size={20} /></div>
              <h2 className="text-xl font-semibold text-text">About StockAI</h2>
            </div>
            <p className="text-sm leading-7 text-muted">
              StockAI uses a Bidirectional LSTM neural network trained on historical NSE/BSE and US stock data to predict
              the next 7 days of closing prices. The model is trained on features including Close price, 20-day MA,
              50-day MA, and Volume.
            </p>
            <div className="space-y-2 text-sm text-muted">
              <p>• <span className="text-text">Model:</span> Bidirectional LSTM (64 units × 2 layers)</p>
              <p>• <span className="text-text">Lookback:</span> 60 trading days</p>
              <p>• <span className="text-text">Forecast horizon:</span> 7 days</p>
              <p>• <span className="text-text">Training data:</span> 2018 – present</p>
              <p>• <span className="text-text">Supported stocks:</span> Nifty 50 + AAPL</p>
            </div>
            <p className="text-xs text-dim border-t border-white/10 pt-4">
              ⚠ Predictions are for educational purposes only and do not constitute financial advice.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
