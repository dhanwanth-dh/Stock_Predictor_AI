import { BrainCircuit } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

export default function AIInsightCard({ insight }) {
  const isBuy = insight.signal === "BUY";
  const isSell = insight.signal === "SELL";
  const signalColor = isBuy ? "text-profit" : isSell ? "text-danger" : "text-warning";
  const signalBg = isBuy ? "bg-profit/10 border-profit/30" : isSell ? "bg-danger/10 border-danger/30" : "bg-warning/10 border-warning/30";

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-active/15 p-2 text-active">
          <BrainCircuit size={18} />
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-widest">AI Signal</p>
          <h3 className="text-lg font-semibold text-text">AI Insight</h3>
        </div>
      </div>

      <div className={`rounded-xl border px-4 py-3 ${signalBg}`}>
        <p className={`text-2xl font-bold ${signalColor}`}>{insight.signal}</p>
        <p className="mt-1 text-sm text-muted">Confidence: <span className="text-text font-medium">{insight.confidence}%</span></p>
      </div>

      <div className="h-24 rounded-xl bg-white/[0.03] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={insight.sparkline}>
            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
            <Tooltip contentStyle={{ background: "#1A2238", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm leading-6 text-muted">{insight.reasoning}</p>
    </div>
  );
}
