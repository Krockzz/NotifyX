export default function MetricCard({ label, value, detail, icon: Icon, tone = "violet" }) {
  const tones = {
    violet: { icon: "border-violet-300/20 bg-violet-300/10 text-violet-200", line: "var(--color-primary-accent)", area: "var(--color-accent-tint)" },
    green: { icon: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300", line: "var(--color-success)", area: "color-mix(in srgb, var(--color-success) 12%, transparent)" },
    red: { icon: "border-rose-300/20 bg-rose-300/10 text-rose-300", line: "var(--color-error)", area: "color-mix(in srgb, var(--color-error) 11%, transparent)" },
  };
  const colors = tones[tone] || tones.violet;
  const trendPath = tone === "green"
    ? "M2 27 C14 25 17 17 28 20 S42 23 51 15 S68 20 77 12 S90 13 98 5"
    : tone === "red"
      ? "M2 8 C12 10 18 9 26 15 S39 13 49 18 S62 15 71 22 S88 23 98 28"
      : "M2 27 C13 23 17 27 28 17 S42 21 52 12 S69 18 78 10 S91 12 98 4";

  return (
    <article className="group rounded-xl border border-border bg-surface-1 px-5 py-4 shadow-sm shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/30 hover:shadow-lg hover:shadow-violet-950/10 motion-reduce:transition-none">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-xs font-medium text-slate-400">{label}</p>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg border ${colors.icon}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
        <svg className="mb-0.5 h-9 w-24 shrink-0" viewBox="0 0 100 36" fill="none" aria-hidden="true">
          <path d={`${trendPath} L98 36 L2 36 Z`} fill={colors.area} />
          <path d={trendPath} stroke={colors.line} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className={`mt-3 inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${colors.icon}`}>
        {detail}
      </p>
    </article>
  );
}
