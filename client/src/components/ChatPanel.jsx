export default function ChatPanel({ chat, symbol, summary }) {
  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs text-muted uppercase tracking-widest">AI Summary</p>
        <h3 className="mt-1 text-lg font-semibold text-text">{symbol}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-text">
          Sentiment: <span className={chat.sentiment === "Positive" ? "text-profit" : chat.sentiment === "Negative" ? "text-danger" : "text-warning"}>{chat.sentiment}</span>
        </span>
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-text">
          Signal: <span className="font-medium">{chat.recommendation}</span>
        </span>
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-text">
          Confidence: {chat.confidence}%
        </span>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <p className="text-xs text-muted">Current</p>
            <p className="mt-1 text-sm font-semibold text-text">₹ {summary.currentPrice}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <p className="text-xs text-muted">7-Day Target</p>
            <p className="mt-1 text-sm font-semibold text-text">₹ {summary.predictedPrice}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <p className="text-xs text-muted">Expected Move</p>
            <p className={`mt-1 text-sm font-semibold ${summary.predictedChangePercent >= 0 ? "text-profit" : "text-danger"}`}>
              {summary.predictedChangePercent >= 0 ? "+" : ""}{summary.predictedChangePercent}%
            </p>
          </div>
        </div>
      )}

      <p className="text-sm leading-6 text-muted">{chat.reasoning}</p>
    </div>
  );
}
