export default function MetricCard({ label, value, hint, accent = "sky" }) {
  const accentClasses = {
    sky: "from-sky/30 to-transparent text-sky",
    ember: "from-ember/30 to-transparent text-ember",
    glow: "from-glow/30 to-transparent text-violet-300",
  };

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl p-5">
      <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${accentClasses[accent]}`} />
      <p className="relative text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="relative mt-3 font-display text-3xl text-white">{value}</p>
      <p className="relative mt-2 text-sm text-slate-300">{hint}</p>
    </div>
  );
}
