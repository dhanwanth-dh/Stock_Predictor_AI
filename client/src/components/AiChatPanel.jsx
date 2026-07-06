import Card from "./Card";

export default function AIChatPanel({ response }) {
  return (
    <Card className="lg:col-span-3" delay={0.32}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-[#B3B3B3]">Ask AI about a stock</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">AI Interaction Panel</h3>
        </div>

        <div className="space-y-4">
          <div className="ml-auto max-w-xl rounded-[24px] rounded-br-md bg-orange-500/15 px-4 py-3 text-sm text-white">
            Should I buy Tesla?
          </div>
          <div className="max-w-2xl rounded-[24px] rounded-bl-md border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">Sentiment: {response.sentiment}</span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">Confidence: {response.confidence}%</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#B3B3B3]">{response.reasoning}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder='E.g., "Should I buy Tesla?"'
            className="flex-1 rounded-2xl border border-white/10 bg-[#1E1E1E] px-4 py-3 text-sm text-white outline-none placeholder:text-[#666666]"
          />
          <button type="button" className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-medium text-white">
            Send
          </button>
        </div>
      </div>
    </Card>
  );
}
