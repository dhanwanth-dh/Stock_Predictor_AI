import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const compactNumber = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl">
      <p className="mb-2 text-sm text-slate-200">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.dataKey === "volume" ? compactNumber.format(entry.value) : currency.format(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function HistoryChart({ data, title, subtitle }) {
  return (
    <div className="glass-panel rounded-[2rem] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis yAxisId="price" tick={{ fill: "#cbd5e1", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="volume" orientation="right" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              name="Close"
              fill="rgba(94, 234, 212, 0.20)"
              stroke="#5eead4"
              strokeWidth={3}
            />
            <Line yAxisId="price" type="monotone" dataKey="ma20" name="MA20" stroke="#fb923c" dot={false} strokeWidth={2} />
            <Line yAxisId="price" type="monotone" dataKey="ma50" name="MA50" stroke="#a78bfa" dot={false} strokeWidth={2} />
            <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="rgba(148, 163, 184, 0.28)" barSize={14} radius={[8, 8, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ForecastChart({ data, currentPrice }) {
  const mergedData = [
    { date: "Today", close: currentPrice },
    ...data.map((point) => ({ date: point.date, close: point.predictedClose })),
  ];

  return (
    <div className="glass-panel rounded-[2rem] p-5">
      <h3 className="font-display text-2xl text-white">7-Day AI Forecast</h3>
      <p className="mt-1 text-sm text-slate-300">Model-projected closing prices based on the latest trained sequence window.</p>
      <div className="mt-5 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mergedData}>
            <defs>
              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="close" name="Projected Close" stroke="#fb923c" fill="url(#forecastFill)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
