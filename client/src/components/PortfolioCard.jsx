import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import AnimatedCounter from "./AnimatedCounter";

const colors = ["#00C896", "#3B82F6", "#F59E0B", "#E5E7EB", "#FF4D4F"];

export default function PortfolioCard({ portfolio }) {
  return (
    <div className="glass-panel rounded-[30px] p-5">
      <p className="text-sm uppercase tracking-[0.22em] text-muted">Portfolio</p>
      <h3 className="mt-1 text-2xl font-semibold text-text">Portfolio Summary</h3>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] bg-white/[0.03] p-4">
          <p className="text-sm text-muted">Investment</p>
          <AnimatedCounter value={portfolio.totalInvestment} prefix="Rs " className="mt-2 block text-xl font-semibold text-text" />
        </div>
        <div className="rounded-[22px] bg-white/[0.03] p-4">
          <p className="text-sm text-muted">Current</p>
          <AnimatedCounter value={portfolio.currentValue} prefix="Rs " className="mt-2 block text-xl font-semibold text-text" />
        </div>
        <div className="rounded-[22px] bg-white/[0.03] p-4">
          <p className="text-sm text-muted">Profit/Loss</p>
          <AnimatedCounter value={portfolio.profitLoss} prefix="Rs " className="mt-2 block text-xl font-semibold text-profit" />
        </div>
      </div>

      <div className="mt-5 h-[240px] rounded-[24px] bg-white/[0.02] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={portfolio.allocation} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86}>
              {portfolio.allocation.map((item, index) => (
                <Cell key={item.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
