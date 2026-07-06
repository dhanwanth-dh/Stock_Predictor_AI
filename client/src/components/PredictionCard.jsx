import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AnimatedCounter from "./AnimatedCounter";
import Card from "./Card";

export default function PredictionCard({ signal, confidence, data }) {
  const tone =
    signal === "Buy"
      ? "text-orange-400 border-orange-400/40 shadow-[0_0_25px_rgba(255,140,0,0.25)]"
      : signal === "Sell"
        ? "text-red-400 border-red-400/40 shadow-[0_0_25px_rgba(255,77,79,0.2)]"
        : "text-blue-400 border-blue-400/40 shadow-[0_0_25px_rgba(59,130,246,0.18)]";

  return (
    <motion.div key={signal} initial={{ opacity: 0.9 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <Card delay={0.16}>
        <div className={`rounded-3xl border p-4 ${tone}`}>
          <p className="text-sm text-[#B3B3B3]">AI Forecast</p>
          <p className="mt-2 text-3xl font-semibold">{signal}</p>
          <p className="mt-2 text-sm text-[#B3B3B3]">
            Confidence: <AnimatedCounter value={confidence} suffix="%" className="font-semibold text-white" />
          </p>
        </div>

        <div className="mt-4 h-[140px] rounded-2xl bg-white/[0.02] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#FF8C00" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
