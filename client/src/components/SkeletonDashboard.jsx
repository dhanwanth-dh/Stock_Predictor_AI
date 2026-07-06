import Panel from "./Panel";

export default function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Panel key={index} className="animate-pulse p-5" hover={false}>
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="mt-4 h-10 w-32 rounded bg-white/10" />
            <div className="mt-4 h-4 w-20 rounded bg-white/10" />
          </Panel>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Panel className="h-[420px] animate-pulse p-6" hover={false}>
          <div className="h-full rounded-3xl bg-white/[0.04]" />
        </Panel>
        <Panel className="h-[420px] animate-pulse p-6" hover={false}>
          <div className="h-full rounded-3xl bg-white/[0.04]" />
        </Panel>
      </div>
    </div>
  );
}
