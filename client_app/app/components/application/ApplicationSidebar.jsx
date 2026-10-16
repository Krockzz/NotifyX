import { useEffect, useRef, useState } from "react";
import { Activity, Code2, LayoutDashboard, ListChecks, Menu, Radio, Settings2, X } from "lucide-react";
import { Link } from "react-router";

const items = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "keys", label: "API Keys", icon: Code2 },
  { id: "events", label: "Event Types", icon: ListChecks },
  { id: "channels", label: "Channels", icon: Radio },
  { id: "activity", label: "Activity / Logs", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings2 },
];

function SectionLinks({ appId, currentSection, onNavigate, application, user }) {
  return (
    <nav aria-label="Application sections" className="grid gap-1">
      {items.map(({ id, label, icon: Icon }) => {
        const to = id === "overview"
          ? `/dashboard/${encodeURIComponent(appId)}`
          : `/dashboard/${encodeURIComponent(appId)}/${id}`;
        const active = currentSection === id;
        return (
          <Link
            key={id}
            to={to}
            state={{ application, user }}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${active ? "bg-accent-tint font-medium text-slate-100" : "text-slate-400 hover:bg-surface-2/70 hover:text-slate-100"}`}
          >
            <Icon size={16} className={`shrink-0 transition-colors ${active ? "text-violet-300" : "text-slate-500 group-hover:text-slate-300"}`} aria-hidden="true" />
            <span>{label}</span>
            {active && <span className="ml-auto size-1.5 rounded-full bg-violet-300" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function ApplicationSidebar({ appId, currentSection, application, user }) {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [open]);

  function closeDrawer() {
    dialogRef.current?.close();
    setOpen(false);
  }

  return (
    <>
      <aside className="hidden self-start rounded-xl border border-border bg-surface-1 p-2.5 lg:sticky lg:top-[84px] lg:block" aria-label="Application navigation">
        <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">Application</p>
        <SectionLinks appId={appId} currentSection={currentSection} application={application} user={user} />
        <div className="mx-2 my-3 h-px bg-surface-2/80" />
        <Link to="/dashboard#applications" className="flex min-h-9 items-center rounded-lg px-3 text-xs text-slate-500 transition-colors hover:bg-surface-2/70 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">← All applications</Link>
      </aside>

      <div className="lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 text-sm text-slate-300 transition hover:border-violet-300/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
          <Menu size={16} aria-hidden="true" />
          {items.find((item) => item.id === currentSection)?.label || "Overview"}
        </button>
        <dialog ref={dialogRef} onClose={() => setOpen(false)} aria-label="Application navigation" className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(84vw,300px)] max-w-none border-0 border-r border-border bg-surface-1 p-4 text-slate-200 shadow-2xl shadow-black/50 backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Application sections</p>
            <button type="button" onClick={closeDrawer} aria-label="Close navigation" className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-surface-2/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"><X size={17} aria-hidden="true" /></button>
          </div>
          <SectionLinks appId={appId} currentSection={currentSection} application={application} user={user} onNavigate={closeDrawer} />
          <div className="mx-2 my-4 h-px bg-surface-2/80" />
          <Link to="/dashboard#applications" onClick={closeDrawer} className="flex min-h-10 items-center rounded-lg px-3 text-sm text-slate-500 transition hover:bg-surface-2/70 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">← All applications</Link>
        </dialog>
      </div>
    </>
  );
}
