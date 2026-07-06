import Card from "./Card";

export default function NewsFeed({ items }) {
  return (
    <Card delay={0.28}>
      <p className="text-sm text-[#B3B3B3]">Market News</p>
      <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.headline}
            className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,140,0,0.14)]"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400/30 to-white/10" />
            <div>
              <p className="text-sm leading-6 text-white">{item.headline}</p>
              <p className="mt-2 text-xs text-[#B3B3B3]">{item.source}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
