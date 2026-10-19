export default function MetricCard({ label, value, detail, icon: Icon, tone = "violet" }) {
  const tones = {
    violet: { icon: "border-violet-400/20 bg-violet-400/10 text-violet-300", line: "#8b5cf6", area: "rgba(139,92,246,.12)" },
    green: { icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400", line: "#10b981", area: "rgba(16,185,129,.11)" },
    red: { icon: "border-red-400/20 bg-red-400/10 text-red-400", line: "#ef4444", area: "rgba(239,68,68,.1)" },
  };
  const colors = tones[tone] || tones.violet;
  const trendPath = tone === "green"
    ? "M2 27 C14 25 17 17 28 20 S42 23 51 15 S68 20 77 12 S90 13 98 5"
    : tone === "red"
      ? "M2 8 C12 10 18 9 26 15 S39 13 49 18 S62 15 71 22 S88 23 98 28"
      : "M2 27 C13 23 17 27 28 17 S42 21 52 12 S69 18 78 10 S91 12 98 4";

  return (
    <article className="group rounded-xl border border-slate-800/80 bg-[#111827]/80 px-5 py-4 shadow-[0_14px_44px_-34px_rgba(0,0,0,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-[0_8px_25px_rgba(124,58,237,0.08)]">
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
