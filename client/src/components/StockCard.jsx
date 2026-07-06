import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer } from "recharts";

export default function StockCard({ stock }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      className="glass-panel min-w-[190px] rounded-[24px] p-4"
      title={`${stock.symbol} performance`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-text">{stock.symbol}</p>
          <p className="mt-1 text-sm text-muted">Rs {stock.price}</p>
        </div>
        <p className={`text-sm font-medium ${stock.change >= 0 ? "text-profit" : "text-danger"}`}>
          {stock.change >= 0 ? "+" : ""}
          {stock.change}%
        </p>
      </div>
      <div className="mt-4 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stock.sparkline}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={stock.change >= 0 ? "#00C896" : "#FF4D4F"}
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
