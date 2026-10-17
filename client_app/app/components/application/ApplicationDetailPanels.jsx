import { useState } from "react";
import { Activity, BellRing, Check, Code2, Copy, Layers3, ListChecks, LoaderCircle, Plus, Radio, Settings2, X } from "lucide-react";
import { Link } from "react-router";

const API_URI = import.meta.env.VITE_API_URL;
console.log("THIS IS THE ONE ",API_URI)

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

function SectionPanel({ icon: Icon, eyebrow, title, description, children, action }) {
  return (
    <section className="min-w-0" aria-labelledby="section-page-title">
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-1 text-violet-300"><Icon size={18} aria-hidden="true" /></span>
          <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/75">{eyebrow}</p><h1 id="section-page-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">{title}</h1><p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">{description}</p></div>
        </div>
        {action}
      </header>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
        {children || <div className="grid min-h-64 place-items-center px-5 py-10 text-center sm:px-8"><div className="max-w-sm"><span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-surface-2/45 text-slate-500"><Icon size={18} aria-hidden="true" /></span><p className="mt-4 text-sm font-medium text-slate-300">Nothing to display yet</p><p className="mt-1.5 text-xs leading-5 text-slate-500">This is a UI preview. Data and actions are not connected.</p></div></div>}
      </div>
    </section>
  );
}

export function ApiKeysPanel({ appId }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPlainTextKey, setNewPlainTextKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

 async function createApiKey() {
    if (!appId || loading) return;
    setLoading(true);
    setError("");

    try {
      if (!API_URI) throw new Error("The application service is not configured.");
      
      const response = await fetch(`${API_URI}/api/v1/applications/generate-api-key/${encodeURIComponent(appId)}`, {
        method: "POST",
     headers: {
                    "Content-Type": "application/json",
                   
                },
        credentials: "include", // This automatically sends your auth cookies safely!
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Could not generate an API key. Please try again.");
      }

      const responseData = payload.data || {};
      const apiKey = responseData.apiKey || payload.apiKey;
      if (typeof apiKey !== "string" || !apiKey) {
        throw new Error("The service response did not include an API key.");
      }

      const apiKeyRecord = responseData.apiKeyRecord || payload.apiKeyRecord || responseData.application || payload.application || {};
      const keyRecord = {
        id: apiKeyRecord.id || `${Date.now()}`,
        name: apiKeyRecord.name || apiKeyRecord.keyName || apiKeyRecord.appName || "Application key",
        prefix: apiKeyRecord.prefix || apiKeyRecord.keyPrefix || `${apiKey.slice(0, 14)}…`,
        createdAt: apiKeyRecord.createdAt || apiKeyRecord.created_at || new Date().toISOString(),
        status: apiKeyRecord.status || "Active",
      };

      setKeys((currentKeys) => [keyRecord, ...currentKeys]);
      setNewPlainTextKey(apiKey);
      setCopied(false);
      setShowModal(true);
    } catch (requestError) {
      setError(requestError.message || "Could not generate an API key. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function dismissReveal() {
    setShowModal(false);
    setNewPlainTextKey("");
    setCopied(false);
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(newPlainTextKey);
      setCopied(true);
    } catch {
      setError("Clipboard access was unavailable. Select and copy the key manually.");
    }
  }

  function formatCreatedAt(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  return <>
    <SectionPanel icon={Code2} eyebrow="Security" title="API Keys" description="Manage the credentials used by your application to send events to NotifyX." action={<button type="button" onClick={createApiKey} disabled={loading || !appId} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none">{loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{loading ? "Generating…" : "Create Key"}</button>}>
      <>
        {error && <div role="alert" className="border-b border-rose-400/15 bg-rose-400/[0.06] px-5 py-3 text-sm text-rose-300 sm:px-6">{error}</div>}
        <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(120px,.8fr)_minmax(120px,.8fr)_minmax(110px,.7fr)] gap-4 border-b border-border bg-surface-2/35 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:grid sm:px-6"><span>Name</span><span>Key prefix</span><span>Created</span><span>Status</span></div>
        {keys.length ? (
          <div className="divide-y divide-border">
            {keys.map((key) => <div key={key.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(120px,.8fr)_minmax(120px,.8fr)_minmax(110px,.7fr)] sm:items-center sm:gap-4 sm:px-6">
              <span className="text-sm font-medium text-slate-200">{key.name}</span>
              <span className="font-mono text-xs text-slate-400">{key.prefix}</span>
              <span className="text-xs text-slate-500">{formatCreatedAt(key.createdAt)}</span>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2 py-1 text-[11px] font-medium text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />{key.status}</span>
            </div>)}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center px-5 py-10 text-center sm:px-8"><div className="max-w-sm"><span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-surface-2/45 text-slate-500"><Code2 size={18} aria-hidden="true" /></span><p className="mt-4 text-sm font-medium text-slate-300">No API keys yet</p><p className="mt-1.5 text-xs leading-5 text-slate-500">Create a key to authenticate requests from this application. The full key is shown only once.</p></div></div>
        )}
      </>
    </SectionPanel>

    {showModal && <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) dismissReveal(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="api-key-reveal-title" aria-describedby="api-key-reveal-description" className="w-full max-w-lg rounded-2xl border border-border bg-surface-1 p-5 shadow-2xl shadow-black/50 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><span className="grid size-10 place-items-center rounded-xl border border-amber-300/20 bg-amber-300/[0.08] text-amber-300"><Code2 size={18} aria-hidden="true" /></span><h2 id="api-key-reveal-title" className="mt-4 text-lg font-semibold tracking-tight text-white">Store your API key securely</h2></div>
          <button type="button" onClick={dismissReveal} aria-label="Close API key reveal" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><X size={17} aria-hidden="true" /></button>
        </div>
        <p id="api-key-reveal-description" className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.06] px-3.5 py-3 text-sm leading-6 text-amber-100/90"><strong className="font-semibold text-amber-200">This is the only time this plain-text key will be shown.</strong> Copy it now and store it somewhere secure. You will not be able to view it again.</p>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-2">
          <code className="min-w-0 flex-1 select-all break-all whitespace-normal px-2 py-2 font-mono text-xs leading-6 text-violet-200 sm:text-sm">{newPlainTextKey}</code>
          <button type="button" onClick={copyKey} className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-surface-1 px-3 text-xs font-medium text-slate-200 transition hover:border-violet-300/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button>
        </div>
        <button type="button" onClick={dismissReveal} className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">I have stored this key</button>
      </section>
    </div>}
  </>;
}

export function EventTypesPanel() {
  return <SectionPanel icon={ListChecks} eyebrow="Events" title="Event Types" description="Define and review the named events your application sends to NotifyX." />;
}

export function ChannelsPanel() {
  return <SectionPanel icon={Radio} eyebrow="Delivery" title="Channels" description="Review the delivery destinations and notification routes for this application." />;
}

export function ActivityPanel() {
  return <SectionPanel icon={BellRing} eyebrow="Observability" title="Activity / Logs" description="Inspect event processing and notification delivery outcomes for this application." />;
}

export function SettingsPanel() {
  return <SectionPanel icon={Settings2} eyebrow="Workspace" title="Settings" description="Review application-level preferences and configuration." />;
}
