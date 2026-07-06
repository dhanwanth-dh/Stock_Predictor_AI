import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Panel from "./Panel";

const ranges = [
  { key: "daily", label: "1D" },
  { key: "weekly", label: "1W" },
  { key: "monthly", label: "1M" },
  { key: "yearly", label: "1Y" },
  { key: "fiveYears", label: "MAX" },
];

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function TooltipCard({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-ink/95 p-3 text-sm shadow-panel">
      <p className="mb-2 text-text">{label}</p>
      <p className="text-muted">Open: {money.format(row.open)}</p>
      <p className="text-muted">High: {money.format(row.high)}</p>
      <p className="text-muted">Low: {money.format(row.low)}</p>
      <p className="text-text">Close: {money.format(row.close)}</p>
    </div>
  );
}

export default function HeroChart({ ticker, data, chartRange, setChartRange, chartMode, setChartMode, currentPrice, deltaPercent }) {
  return (
    <Panel className="p-5 sm:p-6" delay={0.08}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-muted">Market Analyzer</p>
            <h2 className="mt-2 font-display text-3xl text-text">{ticker}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-semibold text-text">{money.format(currentPrice)}</p>
              <div className={`rounded-full px-3 py-1 text-sm font-medium ${deltaPercent >= 0 ? "bg-profit/15 text-profit" : "bg-danger/15 text-danger"}`}>
                {deltaPercent >= 0 ? "+" : ""}
                {deltaPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {ranges.map((range) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setChartRange(range.key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold tracking-[0.2em] transition ${
                    chartRange === range.key ? "bg-active text-white shadow-glow" : "bg-white/5 text-muted hover:text-text"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 self-end">
              {["line", "candlestick"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium capitalize transition ${
                    chartMode === mode ? "bg-profit/15 text-profit shadow-profit" : "bg-white/5 text-muted hover:text-text"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chartRange}-${chartMode}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "line" ? (
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(156,163,175,0.12)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<TooltipCard />} />
                    <Area type="monotone" dataKey="close" stroke="#3B82F6" fill="url(#heroArea)" strokeWidth={3} />
                    <Line type="monotone" dataKey="ma20" stroke="#00C896" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ma50" stroke="#FF4D4F" strokeWidth={2} dot={false} />
                  </AreaChart>
                ) : (
                  <ComposedChart data={data}>
                    <CartesianGrid stroke="rgba(156,163,175,0.12)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<TooltipCard />} />
                    <Bar dataKey="close" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={10} />
                    <Line type="monotone" dataKey="high" stroke="#00C896" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="low" stroke="#FF4D4F" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="open" stroke="#9CA3AF" strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Panel>
  );
}
