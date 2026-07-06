import { Bell, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ query, setQuery, marketOpen, onMenuToggle }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel sticky top-4 z-30 rounded-[28px] px-4 py-4"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-text lg:hidden"
            title="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className={`rounded-full px-4 py-2 text-sm font-medium ${marketOpen ? "bg-profit/15 text-profit" : "bg-danger/15 text-danger"}`}>
            {marketOpen ? "Market Open" : "Market Closed"}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:min-w-[360px]">
            <Search size={18} className="text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stock (AAPL, TSLA, RELIANCE)"
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-dim"
            />
          </div>
          <button
            type="button"
            title="Notifications"
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-text"
          >
            <Bell size={18} />
          </button>
          <div
            title="Profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-active to-profit text-sm font-semibold text-white"
          >
            AI
          </div>
        </div>
      </div>
    </motion.header>
  );
}
