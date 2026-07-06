import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BriefcaseBusiness, BrainCircuit, LayoutDashboard, Newspaper, Settings, TrendingUp, X } from "lucide-react";

const iconMap = {
  Dashboard: LayoutDashboard,
  Market: TrendingUp,
  Portfolio: BriefcaseBusiness,
  "AI Analysis": BrainCircuit,
  News: Newspaper,
  Settings,
};

function SidebarBody({ items, collapsed, activeItem, setActiveItem, onToggle, mobile = false }) {
  return (
    <div className="glass-panel flex h-full flex-col rounded-[28px] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-active/15 text-active shadow-glow">
            <BarChart3 size={20} />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-lg font-semibold text-text">StockAI</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Trading Assistant</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted hover:text-text"
        >
          {mobile ? <X size={16} /> : <span className="text-xs">{collapsed ? ">" : "<"}</span>}
        </button>
      </div>

      <nav className="mt-8 space-y-2">
        {items.map((item) => {
          const Icon = iconMap[item.label];
          const active = activeItem === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              type="button"
              onClick={() => setActiveItem(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                active ? "bg-active/15 text-text shadow-glow" : "text-muted hover:bg-white/5 hover:text-text"
              }`}
              title={item.label}
            >
              <Icon size={18} />
              {!collapsed ? <span className="text-sm font-medium">{item.label}</span> : null}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar({ items, collapsed, setCollapsed, activeItem, setActiveItem, mobileOpen, setMobileOpen }) {
  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 92 : 250 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 lg:block"
      >
        <SidebarBody
          items={items}
          collapsed={collapsed}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          onToggle={() => setCollapsed((value) => !value)}
        />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 p-4 lg:hidden"
          >
            <motion.div
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full max-w-[280px]"
            >
              <SidebarBody
                items={items}
                collapsed={false}
                activeItem={activeItem}
                setActiveItem={(id) => {
                  setActiveItem(id);
                  setMobileOpen(false);
                }}
                onToggle={() => setMobileOpen(false)}
                mobile
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
