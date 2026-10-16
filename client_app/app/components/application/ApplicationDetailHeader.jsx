import { Box, ChevronRight } from "lucide-react";
import { Link } from "react-router";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function ApplicationDetailHeader({ application }) {
  const createdDate = formatDate(application.created_at);
  const isActive = application.isActive !== false;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link to="/dashboard#applications" className="rounded-sm transition-colors hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">Applications</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span className="max-w-[min(55vw,32rem)] truncate text-slate-300" aria-current="page">{application.appName}</span>
      </nav>

      <header className="flex min-w-0 items-center gap-3 border-b border-border pb-5 sm:gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-2 text-slate-400" aria-hidden="true">
          <Box size={19} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="max-w-full truncate text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">{application.appName}</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${isActive ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300" : "border-slate-400/15 bg-slate-400/[0.06] text-slate-400"}`}>
              <span className={`size-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-slate-500"}`} aria-hidden="true" />
              {isActive ? "Active" : "Paused"}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{createdDate ? `Created ${createdDate}` : "Application workspace"}</p>
        </div>
      </header>
    </>
  );
}
