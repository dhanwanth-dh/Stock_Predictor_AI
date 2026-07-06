import { Bell, Search } from "lucide-react";
import Panel from "./Panel";

export default function Topbar({
  marketOpen,
  selectedTicker,
  setSelectedTicker,
  tickerSearch,
  setTickerSearch,
  filteredTickers,
}) {
  return (
    <Panel className="p-4" hover={false}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            value={tickerSearch}
            onChange={(event) => setTickerSearch(event.target.value)}
            placeholder="Search stocks like AAPL, TSLA, RELIANCE"
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedTicker}
            onChange={(event) => setSelectedTicker(event.target.value)}
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-text outline-none"
          >
            {filteredTickers.map((ticker) => (
              <option key={ticker} value={ticker} className="bg-shell">
                {ticker}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-text">
              <span className={`h-2.5 w-2.5 rounded-full ${marketOpen ? "bg-profit shadow-profit" : "bg-danger shadow-danger"}`} />
              {marketOpen ? "Market Open" : "Market Closed"}
            </div>
            <button type="button" className="rounded-2xl border border-white/8 bg-white/5 p-3 text-muted transition hover:text-text">
              <Bell size={18} />
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-active to-profit text-sm font-semibold text-white">
              AI
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
