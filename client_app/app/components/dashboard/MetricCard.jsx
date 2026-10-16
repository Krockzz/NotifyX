export default function MetricCard({ label, value, detail, icon: Icon, tone = "violet" }) {
  const tones = {
    violet: "border-violet-300/15 bg-violet-300/[0.06] text-violet-200",
    green: "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300",
    amber: "border-rose-300/20 bg-rose-300/[0.08] text-rose-300",
  };

  return (
    <article className="rounded-xl border border-border bg-surface-1 p-5 shadow-[0_14px_44px_-34px_rgba(0,0,0,.9)] transition-colors duration-200 hover:border-violet-300/35">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">{value}</p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg border ${tones[tone] || tones.violet}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 flex min-h-5 items-center gap-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}
