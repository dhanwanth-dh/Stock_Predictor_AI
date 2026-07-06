import { BrainCircuit, BriefcaseBusiness, House, LineChart, UserCircle2 } from "lucide-react";

const iconMap = {
  home: House,
  market: LineChart,
  portfolio: BriefcaseBusiness,
  ai: BrainCircuit,
  profile: UserCircle2,
};

export default function BottomNav({ items, activeItem, setActiveItem }) {
  return (
    <div className="glass-panel fixed inset-x-4 bottom-4 z-30 rounded-[28px] px-3 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.map((item) => {
          const Icon = iconMap[item.id];
          const active = activeItem === item.id || (item.id === "home" && activeItem === "dashboard");
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItem(item.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs ${
                active ? "bg-active/15 text-text" : "text-muted"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
