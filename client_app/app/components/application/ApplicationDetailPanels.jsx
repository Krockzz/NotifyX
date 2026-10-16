import { Activity, BellRing, Code2, Layers3, ListChecks, Radio, Settings2 } from "lucide-react";
import { Link } from "react-router";

function SummaryCard({ label, value, detail, icon: Icon, accent = "violet" }) {
  const accents = {
    violet: "border-border bg-surface-2 text-violet-200",
    teal: "border-teal-300/15 bg-teal-300/[0.06] text-teal-200",
    blue: "border-sky-300/15 bg-sky-300/[0.06] text-sky-200",
  };
  return (
    <article className="rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-violet-300/35 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <span className={`grid size-8 place-items-center rounded-lg border ${accents[accent]}`}><Icon size={15} aria-hidden="true" /></span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </article>
  );
}

export function ApplicationStats() {
  const stats = [
    { label: "Event types", value: "—", detail: "No data shown in this UI", icon: ListChecks, accent: "violet" },
    { label: "Delivery channels", value: "—", detail: "No data shown in this UI", icon: Radio, accent: "teal" },
    { label: "Recent activity", value: "—", detail: "No data shown in this UI", icon: Activity, accent: "blue" },
  ];
  return (
    <section aria-label="Application summary" className="mt-5 grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => <SummaryCard key={stat.label} {...stat} />)}
    </section>
  );
}

const sections = [
  { to: "keys", label: "API keys", caption: "Credentials for this application", icon: Code2 },
  { to: "events", label: "Event types", caption: "Named events your app can send", icon: ListChecks },
  { to: "channels", label: "Channels", caption: "Delivery destinations and routing", icon: Radio },
  { to: "activity", label: "Activity", caption: "Recent event and delivery history", icon: BellRing },
];

export function OverviewPanel({ appId, application, user }) {
  return (
    <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.78fr)]">
      <section className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6" aria-labelledby="workspace-overview-title">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">Workspace</p>
          <h2 id="workspace-overview-title" className="mt-1.5 text-base font-semibold tracking-tight text-slate-100">Application configuration</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">Explore the areas used to configure notification delivery for this application.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {sections.map(({ to, label, caption, icon: Icon }) => (
            <Link key={to} to={`/dashboard/${encodeURIComponent(appId)}/${to}`} state={{ application, user }} className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-border bg-surface-2/30 p-3 transition-colors hover:border-violet-300/20 hover:bg-violet-300/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2/45 text-slate-400 transition-colors group-hover:text-violet-300"><Icon size={16} aria-hidden="true" /></span>
              <span className="min-w-0"><span className="block text-sm font-medium text-slate-200">{label}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{caption}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6" aria-labelledby="delivery-flow-title">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-slate-400"><Layers3 size={16} aria-hidden="true" /></span>
          <div><h2 id="delivery-flow-title" className="text-sm font-semibold text-slate-100">Notification flow</h2><p className="mt-1 text-xs leading-5 text-slate-500">A simple view of how this workspace is organized.</p></div>
        </div>
        <ol className="mt-5 space-y-3">
          {[
            ["01", "Define an event", "Choose a named event type."],
            ["02", "Select channels", "Set where notifications can be delivered."],
            ["03", "Review activity", "Keep track of event outcomes."],
          ].map(([number, title, description], index) => (
            <li key={number} className="flex gap-3">
              <span className="relative grid size-7 shrink-0 place-items-center rounded-full border border-border bg-surface-2/45 font-mono text-[10px] text-slate-400 after:absolute after:left-1/2 after:top-full after:h-3 after:w-px after:bg-surface-2/90 last:after:hidden">{number}</span>
              <div className="pb-2"><h3 className="text-xs font-medium text-slate-300">{title}</h3><p className="mt-1 text-[11px] leading-4 text-slate-500">{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function SectionPanel({ icon: Icon, eyebrow, title, description, children }) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface-1">
      <div className="flex items-start gap-3 border-b border-border px-5 py-5 sm:px-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-slate-400"><Icon size={16} aria-hidden="true" /></span>
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/75">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>
      </div>
      <div className="grid min-h-48 place-items-center px-5 py-8 text-center sm:px-6">
        {children || <div className="max-w-sm"><span className="mx-auto grid size-10 place-items-center rounded-xl border border-border bg-surface-2/45 text-slate-500"><Icon size={17} aria-hidden="true" /></span><p className="mt-3 text-sm font-medium text-slate-300">Nothing to display yet</p><p className="mt-1.5 text-xs leading-5 text-slate-500">This is a UI view only. No data or actions are connected here.</p></div>}
      </div>
    </section>
  );
}

export function ApiKeysPanel() {
  return <SectionPanel icon={Code2} eyebrow="Security" title="API keys" description="Credentials associated with this application." />;
}

export function EventTypesPanel() {
  return <SectionPanel icon={ListChecks} eyebrow="Events" title="Event types" description="Define the named events your application sends to NotifyX." />;
}

export function ChannelsPanel() {
  return <SectionPanel icon={Radio} eyebrow="Delivery" title="Channels" description="Review the delivery destinations used by this application." />;
}

export function ActivityPanel() {
  return <SectionPanel icon={BellRing} eyebrow="Observability" title="Activity and logs" description="Inspect event processing and notification delivery outcomes." />;
}

export function SettingsPanel() {
  return <SectionPanel icon={Settings2} eyebrow="Workspace" title="Settings" description="Application-level preferences and configuration." />;
}
