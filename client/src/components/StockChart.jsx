import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StockChart({ symbol, data, range, setRange, ranges, chartMode, setChartMode, positiveTrend }) {
  const color = positiveTrend ? "#00C896" : "#FF4D4F";

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-widest">Price Chart</p>
          <h2 className="mt-1 text-lg font-semibold text-text">{symbol}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                range === r ? "bg-active text-white" : "bg-white/5 text-muted hover:text-text"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart type toggle */}
      <div className="flex gap-2">
        {["line", "candlestick"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setChartMode(mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
              chartMode === mode ? "bg-profit/15 text-profit" : "bg-white/5 text-muted hover:text-text"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Main chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "line" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={70} />
              <Tooltip contentStyle={{ background: "#1A2238", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="close" stroke={color} fill="url(#fill)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          ) : (
            <ComposedChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={70} />
              <Tooltip contentStyle={{ background: "#1A2238", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="close" fill="#3B82F6" barSize={10} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="high" stroke="#00C896" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="low" stroke="#FF4D4F" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume bar */}
      <div className="h-20 rounded-xl bg-white/[0.03] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#1A2238", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} formatter={(v) => [v.toLocaleString(), "Volume"]} />
            <Bar dataKey="volume" fill="#3B82F6" radius={[3, 3, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
