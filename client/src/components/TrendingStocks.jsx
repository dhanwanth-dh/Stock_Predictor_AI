import Card from "./Card";

export default function TrendingStocks({ stocks }) {
  return (
    <Card className="lg:col-span-2" delay={0.24} hover={false}>
      <p className="text-sm text-[#B3B3B3]">Trending Stocks</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            title={`${stock.symbol} latest movement`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:scale-105 hover:shadow-[0_0_24px_rgba(255,140,0,0.14)]"
          >
            <p className="text-lg font-semibold text-white">{stock.symbol}</p>
            <p className="mt-2 text-sm text-[#B3B3B3]">Rs {stock.price}</p>
            <p className={`mt-2 text-sm font-medium ${stock.change >= 0 ? "text-orange-400" : "text-red-400"}`}>
              {stock.change >= 0 ? "+" : ""}
              {stock.change}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
