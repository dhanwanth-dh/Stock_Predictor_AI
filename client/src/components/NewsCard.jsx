import { motion } from "framer-motion";

export default function NewsCard({ item }) {
  return (
    <motion.article
      whileHover={{ scale: 1.01, x: 2 }}
      className="flex gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-active/30 via-profit/20 to-transparent" />
      <div>
        <p className="text-sm leading-6 text-text">{item.title}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{item.source}</p>
      </div>
    </motion.article>
  );
}
