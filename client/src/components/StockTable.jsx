const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const numberFormat = new Intl.NumberFormat("en-IN");

export default function StockTable({ rows, timeframeLabel }) {
  return (
    <div className="glass-panel rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-white">{timeframeLabel} Dataset</h3>
          <p className="mt-1 text-sm text-slate-300">Scrollable view of the stock data being rendered for the selected interval.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          {rows.length} rows
        </div>
      </div>
      <div className="scrollbar-thin overflow-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left uppercase tracking-[0.2em] text-slate-400">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Open</th>
              <th className="px-3 py-2">High</th>
              <th className="px-3 py-2">Low</th>
              <th className="px-3 py-2">Close</th>
              <th className="px-3 py-2">Volume</th>
              <th className="px-3 py-2">MA20</th>
              <th className="px-3 py-2">MA50</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${timeframeLabel}-${row.date}`} className="rounded-2xl bg-white/[0.04] text-slate-100">
                <td className="rounded-l-2xl px-3 py-3">{row.date}</td>
                <td className="px-3 py-3">{currency.format(row.open)}</td>
                <td className="px-3 py-3">{currency.format(row.high)}</td>
                <td className="px-3 py-3">{currency.format(row.low)}</td>
                <td className="px-3 py-3 font-semibold text-sky">{currency.format(row.close)}</td>
                <td className="px-3 py-3">{numberFormat.format(row.volume)}</td>
                <td className="px-3 py-3">{currency.format(row.ma20)}</td>
                <td className="rounded-r-2xl px-3 py-3">{currency.format(row.ma50)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
