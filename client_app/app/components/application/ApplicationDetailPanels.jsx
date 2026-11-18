import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  BellRing,
  Check,
  Clock3,
  Code2,
  Copy,
  Layers3,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { Link, useFetcher, useLocation, useNavigate, useNavigation, useRevalidator } from "react-router";
import { createPortal } from "react-dom";

const API_URI = import.meta.env.VITE_API_URL;
const EMPTY_API_KEYS = [];

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

export function SectionPanel({ icon: Icon, eyebrow, title, description, children, action }) {
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

export function ApiKeysPanel({ appId, apiKeys = EMPTY_API_KEYS, apiKeysError = "" }) {
  const [keys, setKeys] = useState(apiKeys);
  const [listError, setListError] = useState(apiKeysError);
  const [loading, setLoading] = useState(false);
  const [newPlainTextKey, setNewPlainTextKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createError, setCreateError] = useState("");
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeFeedback, setRevokeFeedback] = useState("");
  const [revokingKeyId, setRevokingKeyId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const successTimeoutRef = useRef(null);
  const createInputRef = useRef(null);
  const dialogRef = useRef(null);
  const modalTriggerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const activeModalRef = useRef(null);
  const loadingRef = useRef(loading);
  loadingRef.current = loading || Boolean(revokingKeyId);

  useEffect(() => () => window.clearTimeout(successTimeoutRef.current), []);

  useEffect(() => {
    setKeys(apiKeys);
    setListError(apiKeysError);
  }, [appId, apiKeys, apiKeysError]);

  const activeModal = showCreateModal ? "create" : showModal ? "reveal" : showRevokeModal ? "revoke" : null;
  activeModalRef.current = activeModal;

  useEffect(() => {
    if (!activeModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    if (!previousFocusRef.current) previousFocusRef.current = document.activeElement;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusFrame = window.requestAnimationFrame(() => {
      const target = activeModal === "create" ? createInputRef.current : dialogRef.current?.querySelector("button");
      target?.focus();
    });

    function handleModalKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (loadingRef.current) return;
        if (activeModalRef.current === "create") {
          setShowCreateModal(false);
          setCreateError("");
        } else if (activeModalRef.current === "reveal") {
          dismissReveal();
        } else if (activeModalRef.current === "revoke") {
          setShowRevokeModal(false);
          setSelectedKey(null);
        }
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleModalKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleModalKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      if (!activeModalRef.current) {
        const focusTarget = modalTriggerRef.current || previousFocusRef.current;
        focusTarget?.focus?.();
        previousFocusRef.current = null;
        modalTriggerRef.current = null;
      }
    };
  }, [activeModal]);

  async function createApiKey(event) {
    event.preventDefault();
    if (!appId || loading) return;
    const name = newKeyName.trim();
    if (!name) {
      setCreateError("Enter a name for this API key.");
      return;
    }

    setLoading(true);
    setCreateError("");

    try {
      if (!API_URI) throw new Error("The application service is not configured.");
      const response = await fetch(`${API_URI.replace(/\/+$/, "")}/api/v1/apiKey/create-api-key/${appId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error(response.ok ? "The service returned an unreadable response." : `Could not create an API key (HTTP ${response.status}).`);
      }
      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Could not generate an API key. Please try again.");
      }

      const responseData = payload.data || {};
      const apiKey = responseData.apiKey;
      const keyRecord = responseData.key;
      if (typeof apiKey !== "string" || !apiKey) {
        throw new Error("The service response did not include an API key.");
      }
      if (!keyRecord?.id || !keyRecord?.keyPrefix) {
        throw new Error("The service response did not include the saved API key details.");
      }

      setKeys((currentKeys) => [keyRecord, ...currentKeys.filter((key) => key.id !== keyRecord.id)]);
      setListError("");
      setNewPlainTextKey(apiKey);
      setCopied(false);
      setCopyError("");
      setShowCreateModal(false);
      setNewKeyName("");
      setShowModal(true);
    } catch (requestError) {
      setCreateError(requestError.message || "Could not generate an API key. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function dismissReveal() {
    setShowModal(false);
    setNewPlainTextKey("");
    setCopied(false);
    setCopyError("");
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(newPlainTextKey);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("Clipboard access was unavailable. Select and copy the key manually.");
    }
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function getKeyStatus(key) {
    if (key.revokedAt) return "Revoked";
    if (key.expiresAt && new Date(key.expiresAt).getTime() <= Date.now()) return "Expired";
    return "Active";
  }

  function openRevokeDialog(key) {
    modalTriggerRef.current = document.activeElement;
    setSelectedKey(key);
    setRevokeFeedback("");
    setShowRevokeModal(true);
  }

  async function revokeApiKey(keyId) {
    if (!appId || !selectedKey || loading || revokingKeyId) return;
    if (String(selectedKey.id) !== String(keyId)) return;

    setRevokingKeyId(String(keyId));
    setRevokeFeedback("");

    try {
      if (!API_URI) throw new Error("The application service is not configured.");
      const response = await fetch(`${API_URI.replace(/\/+$/, "")}/api/v1/apiKey/revoke-api-key/${encodeURIComponent(appId)}/${encodeURIComponent(selectedKey.id)}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || `Could not revoke this API key (HTTP ${response.status}).`);
      }

      const responseData = payload?.data || payload || {};
      const updatedKey = responseData.key || responseData.apiKeyRecord || responseData.updatedKey || responseData.apiKey || responseData;
      if (!updatedKey || typeof updatedKey !== "object" || !updatedKey.revokedAt) {
        throw new Error("The service did not return the revoked API key record.");
      }

      const revokedName = selectedKey.name || selectedKey.keyPrefix || "API key";
      setKeys((currentKeys) => currentKeys.map((key) => (
        String(key.id) === String(selectedKey.id) ? { ...key, ...updatedKey } : key
      )));
      setShowRevokeModal(false);
      setSelectedKey(null);
      setRevokeFeedback("");
      setSuccessMessage(`API key “${revokedName}” has been revoked.`);
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = window.setTimeout(() => setSuccessMessage(""), 4500);
    } catch (requestError) {
      setRevokeFeedback(requestError.message || "Could not revoke this API key. Please try again.");
    } finally {
      setRevokingKeyId(null);
    }
  }

  return <>
    <SectionPanel icon={Code2} eyebrow="Security" title="API Keys" description="Manage the credentials used by your application to send events to NotifyX." action={<button ref={modalTriggerRef} type="button" onClick={() => { setCreateError(""); setShowCreateModal(true); }} disabled={!appId || loading} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 text-sm font-medium text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"><Plus size={16} aria-hidden="true" />Create Key</button>}>
      <>
        {successMessage && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-3 text-sm text-emerald-300 sm:mx-6"><Check size={15} aria-hidden="true" />{successMessage}</p>}
        {listError ? (
          <div role="alert" className="grid min-h-56 place-items-center px-5 py-10 text-center sm:px-8"><div className="max-w-md"><p className="text-sm font-medium text-rose-300">Unable to load API keys</p><p className="mt-2 text-xs leading-5 text-slate-400">{listError}</p></div></div>
        ) : keys.length ? <>
          <div className="hidden grid-cols-[minmax(150px,1.3fr)_minmax(130px,1.1fr)_minmax(100px,.9fr)_minmax(100px,.9fr)_minmax(100px,.9fr)_minmax(90px,.7fr)_minmax(90px,.7fr)] gap-3 border-b border-border bg-surface-2/35 px-5 py-3 text-[10px] font-medium uppercase tracking-wide text-slate-500 xl:grid xl:px-6"><span>Name</span><span>Key prefix</span><span>Created</span><span>Last used</span><span>Expiry</span><span>Status</span><span>Actions</span></div>
          <div className="divide-y divide-border">
            {keys.map((key) => {
              const status = getKeyStatus(key);
              const statusStyle = status === "Revoked" ? "border-rose-300/15 bg-rose-300/[0.06] text-rose-300" : status === "Expired" ? "border-amber-300/15 bg-amber-300/[0.06] text-amber-300" : "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300";
              return <article key={key.id} className="grid gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-[minmax(150px,1.3fr)_minmax(130px,1.1fr)_minmax(100px,.9fr)_minmax(100px,.9fr)_minmax(100px,.9fr)_minmax(90px,.7fr)_minmax(90px,.7fr)] xl:items-center xl:gap-3 xl:px-6">
                <div className="min-w-0"><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Name</span><span className="block truncate text-sm font-medium text-slate-200">{key.name}</span></div>
                <div className="min-w-0"><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Key prefix</span><span className="block truncate font-mono text-xs text-slate-400">{key.keyPrefix ? `${key.keyPrefix}••••` : "—"}</span></div>
                <div><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Created</span><span className="text-xs text-slate-500">{formatDate(key.createdAt)}</span></div>
                <div><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Last used</span><span className="text-xs text-slate-500">{formatDate(key.lastUsedAt) === "—" ? "Never" : formatDate(key.lastUsedAt)}</span></div>
                <div><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Expiry</span><span className="text-xs text-slate-500">{key.expiresAt ? formatDate(key.expiresAt) : "No expiry"}</span></div>
                <div><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Status</span><span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyle}`}><span className="size-1.5 rounded-full bg-current" aria-hidden="true" />{status}</span></div>
                <div><span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-600 xl:hidden">Actions</span>{status === "Active" ? (revokingKeyId === String(key.id) ? <span className="inline-flex min-h-8 items-center gap-1.5 text-xs text-rose-300" role="status"><LoaderCircle size={13} className="animate-spin" aria-hidden="true" />Revoking…</span> : <button type="button" onClick={() => openRevokeDialog(key)} className="inline-flex min-h-8 items-center rounded-lg border border-rose-300/15 px-2.5 text-xs font-medium text-rose-300 transition hover:border-rose-300/30 hover:bg-rose-300/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300">Revoke</button>) : <span className="text-xs text-slate-600">—</span>}</div>
              </article>;
            })}
          </div>
        </> : (
          <div className="grid min-h-56 place-items-center px-5 py-10 text-center sm:px-8"><div className="max-w-sm"><span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-surface-2/45 text-slate-500"><Code2 size={18} aria-hidden="true" /></span><p className="mt-4 text-sm font-medium text-slate-300">No API keys yet</p><p className="mt-1.5 text-xs leading-5 text-slate-500">Create a key to authenticate requests from this application. The full key is shown only once.</p></div></div>
        )}
      </>
    </SectionPanel>

    {typeof document !== "undefined" && showCreateModal && createPortal(
      <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/75 p-4 backdrop-blur-sm sm:p-6">
        <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="api-key-create-title" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div><h2 id="api-key-create-title" className="text-lg font-semibold tracking-tight text-white">Create API Key</h2><p className="mt-1.5 text-sm leading-5 text-slate-400">Give this key a recognizable name to identify where it will be used.</p></div>
            <button type="button" disabled={loading} onClick={() => { setShowCreateModal(false); setCreateError(""); }} aria-label="Close create API key dialog" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-50"><X size={17} aria-hidden="true" /></button>
          </header>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={createApiKey}>
            <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
              <label htmlFor="new-api-key-name" className="mb-2 block text-sm font-medium text-slate-200">Key name</label>
              <input ref={createInputRef} id="new-api-key-name" name="name" type="text" required maxLength={100} value={newKeyName} onChange={(event) => { setNewKeyName(event.target.value); if (createError) setCreateError(""); }} placeholder="Production Server" aria-invalid={Boolean(createError)} aria-describedby={createError ? "api-key-create-error" : "api-key-name-help"} className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/25" />
              <p id="api-key-name-help" className="mt-2 text-xs leading-5 text-slate-500">Choose a name you will recognize later, such as Production, Development, or Local Testing.</p>
              {createError && <p id="api-key-create-error" role="alert" className="mt-3 rounded-lg border border-rose-300/15 bg-rose-300/[0.06] px-3 py-2 text-sm text-rose-300">{createError}</p>}
            </div>
            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-surface-1 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" disabled={loading} onClick={() => { setShowCreateModal(false); setCreateError(""); }} className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-slate-300 transition hover:bg-surface-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">Cancel</button>
              <button type="submit" disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">{loading && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}{loading ? "Creating…" : "Create API Key"}</button>
            </footer>
          </form>
        </section>
      </div>,
      document.body
    )}

    {typeof document !== "undefined" && showModal && createPortal(
      <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/75 p-4 backdrop-blur-sm sm:p-6">
        <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="api-key-reveal-title" aria-describedby="api-key-reveal-description" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg border border-amber-300/15 bg-amber-300/[0.06] text-amber-300"><Code2 size={17} aria-hidden="true" /></span><h2 id="api-key-reveal-title" className="text-base font-semibold tracking-tight text-white sm:text-lg">Store your API key securely</h2></div>
            <button type="button" onClick={dismissReveal} aria-label="Close API key reveal" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><X size={17} aria-hidden="true" /></button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <p id="api-key-reveal-description" className="rounded-lg border border-amber-300/15 bg-amber-300/[0.055] px-3.5 py-3 text-sm leading-5 text-amber-100/90"><strong className="font-semibold text-amber-200">This is the only time this plain-text key will be shown.</strong> Copy it now and store it somewhere secure. You will not be able to view it again.</p>
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-2.5 sm:flex-row sm:items-start">
              <code className="min-w-0 flex-1 select-all break-all whitespace-normal px-2 py-2 font-mono text-xs leading-5 text-violet-200 sm:text-sm">{newPlainTextKey}</code>
              <button type="button" onClick={copyKey} className={`inline-flex min-h-9 shrink-0 items-center justify-center gap-2 self-stretch rounded-lg border px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 sm:self-start ${copied ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-300" : "border-border bg-surface-1 text-slate-200 hover:border-violet-300/30 hover:text-white"}`} aria-live="polite">{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}{copied ? "Copied" : "Copy"}</button>
            </div>
            {copyError && <p role="alert" className="mt-2 text-xs leading-5 text-rose-300">{copyError}</p>}
          </div>
          <footer className="shrink-0 border-t border-border bg-surface-1 px-5 py-4 sm:px-6">
            <button type="button" onClick={dismissReveal} className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300">Done</button>
          </footer>
        </section>
      </div>,
      document.body
    )}

    {typeof document !== "undefined" && showRevokeModal && selectedKey && createPortal(
      <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/75 p-4 backdrop-blur-sm sm:p-6">
        <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="api-key-revoke-title" aria-describedby="api-key-revoke-description" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)]">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-rose-300/20 bg-rose-300/[0.07] text-rose-300"><X size={18} aria-hidden="true" /></span><div><h2 id="api-key-revoke-title" className="text-lg font-semibold text-white">Revoke API key?</h2><p id="api-key-revoke-description" className="mt-1 text-sm leading-6 text-slate-400">This will stop the selected credential from authenticating future requests after the backend processes revocation.</p></div></div>
            <div className="mt-4 rounded-xl border border-border bg-surface-2/60 px-4 py-3"><p className="truncate text-sm font-medium text-slate-200">{selectedKey.name}</p><p className="mt-1 font-mono text-xs text-slate-500">{selectedKey.keyPrefix || "—"}••••</p></div>
            {revokeFeedback && <p role="alert" className="mt-3 rounded-lg border border-rose-300/20 bg-rose-300/[0.07] px-3 py-2.5 text-sm leading-5 text-rose-300">{revokeFeedback}</p>}
          </div>
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-surface-1 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" disabled={Boolean(revokingKeyId)} onClick={() => { setShowRevokeModal(false); setSelectedKey(null); setRevokeFeedback(""); }} className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-slate-300 transition hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-wait disabled:opacity-50">Cancel</button>
            <button type="button" disabled={Boolean(revokingKeyId)} onClick={() => revokeApiKey(selectedKey.id)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-300/20 bg-rose-400/[0.08] px-4 text-sm font-medium text-rose-300 transition hover:bg-rose-400/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300 disabled:cursor-wait disabled:opacity-60">
              {revokingKeyId && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}
              {revokingKeyId ? "Revoking…" : "Revoke Key"}
            </button>
          </footer>
        </section>
      </div>,
      document.body
    )}
  </>;
}

function formatEventTypeDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function EventTypeCard({ eventType, detailUrl, application, user }) {
  const statusClasses = eventType.isActive
    ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
    : "border-border bg-surface-2/50 text-slate-500";

  return (
    <article className="rounded-xl border border-border bg-surface-1 p-4 transition-colors duration-200 hover:border-violet-300/25 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="break-all font-mono text-sm font-semibold text-slate-100">{eventType.eventCode}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {eventType.description || "No description provided."}
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClasses}`}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {eventType.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <footer className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Entity Group</p>
          <p className="mt-1 text-xs text-slate-300">{eventType.entityGrp?.name || "Not assigned"}</p>
          {eventType.entityGrp?.entityIdPath && (
            <code className="mt-1 block break-all font-mono text-[10px] text-slate-500">
              {eventType.entityGrp.entityIdPath}
            </code>
          )}
        </div>
        <p className="inline-flex items-center gap-1.5 text-[10px] text-slate-600">
          <Clock3 size={12} aria-hidden="true" />
          Created {formatEventTypeDate(eventType.created_at)}
        </p>
        <Link
          to={detailUrl + encodeURIComponent(eventType.id)}
          state={{ application, user }}
          className="inline-flex min-h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:border-violet-300/30 hover:bg-violet-300/[0.05] hover:text-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
        >
          View details & channels
        </Link>
      </footer>
    </article>
  );
}

const EVENT_CHANNELS = [
  {
    type: "EMAIL",
    description: "Send notifications to an email address found in the event payload.",
  },
  {
    type: "SMS",
    description: "Send notifications to a phone number found in the event payload.",
  },
  {
    type: "PUSH",
    description: "Send notifications to a device token found in the event payload.",
  },
];

function ChannelConfigurationCard({ eventTypeId, channel, channelRecord, actionUrl }) {
  const fetcher = useFetcher();
  const [recipientPath, setRecipientPath] = useState("");
  const [recipientPathError, setRecipientPathError] = useState("");
  const isSubmitting = fetcher.state !== "idle";
  const isConfigured = Boolean(channelRecord);
  const isEnabled = channelRecord?.isEnabled === true;
  const intent = isConfigured ? "update-event-channel" : "create-event-channel";
  const actionResult = fetcher.data?.intent === intent ? fetcher.data : null;
  const statusLabel = isEnabled ? "Enabled" : isConfigured ? "Disabled" : "Not configured";
  const actionLabel = isSubmitting
    ? "Saving…"
    : isEnabled
      ? "Disable"
      : "Enable";

  function validateChannelAction(event) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    if (!isConfigured && !recipientPath.trim()) {
      event.preventDefault();
      setRecipientPathError("Enter the payload path for this channel's recipient.");
      return;
    }

    setRecipientPathError("");
  }

  return (
    <article className="rounded-xl border border-border bg-surface-1 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-semibold text-slate-100">{channel.type}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              isEnabled
                ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                : "border-border bg-surface-2/50 text-slate-500"
            }`}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">{channel.description}</p>
          {isConfigured && (
            <p className="mt-2 break-all font-mono text-[11px] text-slate-500">
              Recipient path: {channelRecord.recipientPath || "Not set"}
            </p>
          )}
        </div>

        <fetcher.Form method="post" action={actionUrl} onSubmit={validateChannelAction} className="w-full shrink-0 sm:w-auto">
          <input type="hidden" name="intent" value={intent} />
          <input type="hidden" name="channelType" value={channel.type} />
          {isConfigured ? (
            <>
              <input type="hidden" name="channelId" value={channelRecord.id} />
              <input type="hidden" name="isEnabled" value={String(!isEnabled)} />
            </>
          ) : (
            <>
              <input type="hidden" name="eventTypeId" value={eventTypeId} />
              <label htmlFor={`recipient-path-${channel.type}`} className="mb-1.5 block text-[11px] font-medium text-slate-300">
                Recipient payload path
              </label>
              <input
                id={`recipient-path-${channel.type}`}
                name="recipientPath"
                type="text"
                value={recipientPath}
                onChange={(event) => {
                  setRecipientPath(event.target.value);
                  setRecipientPathError("");
                }}
                maxLength={255}
                required
                placeholder="data.recipient"
                aria-invalid={Boolean(recipientPathError)}
                aria-describedby={recipientPathError
                  ? `recipient-path-help-${channel.type} recipient-path-error-${channel.type}`
                  : `recipient-path-help-${channel.type}`}
                className="min-h-9 w-full rounded-lg border border-border bg-surface-2 px-3 font-mono text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 sm:w-64"
              />
              <p id={`recipient-path-help-${channel.type}`} className="mt-1 text-[10px] leading-4 text-slate-500 sm:max-w-64">
                Dot-separated path to the recipient value in each event payload.
              </p>
            </>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium transition disabled:cursor-wait disabled:opacity-60 sm:mt-0 sm:w-auto ${
              isEnabled
                ? "border-rose-300/20 bg-rose-300/[0.05] text-rose-300 hover:bg-rose-300/[0.1]"
                : "border-violet-300/20 bg-violet-300/[0.07] text-violet-200 hover:bg-violet-300/[0.12]"
            }`}
          >
            {isSubmitting && <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />}
            {actionLabel} {channel.type}
          </button>
        </fetcher.Form>
      </div>

      {recipientPathError && (
        <p id={`recipient-path-error-${channel.type}`} role="alert" className="mt-2 text-xs text-rose-300">
          {recipientPathError}
        </p>
      )}
      {actionResult?.success === false && !isSubmitting && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2 text-xs leading-5 text-rose-300">
          {actionResult.message || "Could not update this channel."}
        </p>
      )}
      {actionResult?.success === true && !isSubmitting && (
        <p role="status" className="mt-3 text-xs text-emerald-300">
          {actionResult.message || "Channel configuration saved."}
        </p>
      )}
    </article>
  );
}

export function EventTypesPanel({
  appId,
  eventTypes = [],
  eventTypesError = "",
  entityGroups = [],
  entityGroupsError = "",
  selectedEventType = null,
  selectedEventTypeError = "",
  eventTypeChannels = [],
  eventTypeChannelsError = "",
  application,
  user,
}) {
  const fetcher = useFetcher();
  const deactivationFetcher = useFetcher();
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const dialogRef = useRef(null);
  const deactivationDialogRef = useRef(null);
  const handledResultRef = useRef(null);
  const handledDeactivationResultRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [deactivationDialogOpen, setDeactivationDialogOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const isSubmitting = fetcher.state !== "idle";
  const isDeactivating = deactivationFetcher.state !== "idle";
  const isLoading = navigation.state === "loading" || revalidator.state === "loading";
  const applicationUrl = `/dashboard/${encodeURIComponent(appId)}`;
  const actionUrl = `${applicationUrl}/events`;
  const detailUrl = `${actionUrl}?eventTypeId=`;
  const entityGroupsUrl = `${applicationUrl}/entities`;
  const detailView = new URLSearchParams(location.search).has("eventTypeId");
  const formIntent = formMode === "edit" ? "update-event-type" : "create-event-type";
  const formError = hasSubmitted
    && fetcher.data?.intent === formIntent
    && fetcher.data?.success === false
    ? fetcher.data.message
    : "";

  useEffect(() => {
    if (dialogOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (deactivationDialogOpen && deactivationDialogRef.current && !deactivationDialogRef.current.open) {
      deactivationDialogRef.current.showModal();
    }
  }, [deactivationDialogOpen]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeout = window.setTimeout(() => setSuccessMessage(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    const result = fetcher.data;
    if (
      fetcher.state !== "idle"
      || !["create-event-type", "update-event-type"].includes(result?.intent)
      || !result.success
      || handledResultRef.current === result
    ) {
      return;
    }

    handledResultRef.current = result;
    dialogRef.current?.close();
    setDialogOpen(false);
    setHasSubmitted(false);
    setValidationError("");
    setSuccessMessage(result.message || (
      result.intent === "update-event-type"
        ? "Event Type updated successfully."
        : "Event Type created successfully."
    ));
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    const result = deactivationFetcher.data;
    if (
      deactivationFetcher.state !== "idle"
      || result?.intent !== "deactivate-event-type"
      || !result.success
      || handledDeactivationResultRef.current === result
    ) {
      return;
    }

    handledDeactivationResultRef.current = result;
    deactivationDialogRef.current?.close();
    setDeactivationDialogOpen(false);
    setSuccessMessage("Event Type deactivated. It remains listed as inactive.");
    navigate(actionUrl, { state: { application, user } });
  }, [
    deactivationFetcher.data,
    deactivationFetcher.state,
    navigate,
    actionUrl,
    application,
    user,
  ]);

  function openCreateDialog() {
    setFormMode("create");
    setHasSubmitted(false);
    setValidationError("");
    setDialogOpen(true);
  }

  function openEditDialog() {
    setFormMode("edit");
    setHasSubmitted(false);
    setValidationError("");
    setDialogOpen(true);
  }

  function closeCreateDialog() {
    if (isSubmitting) return;

    dialogRef.current?.close();
    setDialogOpen(false);
    setHasSubmitted(false);
    setValidationError("");
  }

  function closeDeactivationDialog() {
    if (isDeactivating) return;

    deactivationDialogRef.current?.close();
    setDeactivationDialogOpen(false);
  }

  function validateForm(event) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    const formData = new FormData(event.currentTarget);
    const eventCode = String(formData.get("eventCode") || "").trim();
    setHasSubmitted(true);

    if (!eventCode) {
      event.preventDefault();
      setValidationError("Enter an Event Type name.");
      return;
    }

    if (eventCode.length > 50) {
      event.preventDefault();
      setValidationError("Event Type names must be 50 characters or fewer.");
      return;
    }

    setValidationError("");
  }

  let panelContent;

  if (detailView) {
    const detailError = selectedEventTypeError || eventTypesError;

    if (detailError || !selectedEventType) {
      panelContent = (
        <div role="alert" className="grid min-h-56 place-items-center px-4 text-center">
          <div className="max-w-md">
            <AlertCircle size={20} className="mx-auto text-rose-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-rose-300">Unable to open this Event Type</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {detailError || "This Event Type is not available in the selected application."}
            </p>
          </div>
        </div>
      );
    } else {
      panelContent = (
        <div className="p-5 sm:p-6">
          {successMessage && (
            <p role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-3 text-sm text-emerald-300">
              <Check size={15} aria-hidden="true" />
              {successMessage}
            </p>
          )}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedEventType.description || "No description provided."}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Entity Group</p>
              <p className="mt-2 text-sm text-slate-300">
                {selectedEventType.entityGrp?.name || "Not assigned"}
              </p>
              {selectedEventType.entityGrp?.entityIdPath && (
                <code className="mt-1.5 block break-all font-mono text-[11px] text-slate-500">
                  {selectedEventType.entityGrp.entityIdPath}
                </code>
              )}
            </div>
            <div className="rounded-xl border border-border bg-surface-2/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Event Type status</p>
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                selectedEventType.isActive
                  ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                  : "border-border bg-surface-2/50 text-slate-500"
              }`}>
                <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                {selectedEventType.isActive ? "Active" : "Inactive"}
              </span>
              <p className="mt-3 text-[11px] text-slate-500">
                Created {formatEventTypeDate(selectedEventType.created_at)}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Updated {formatEventTypeDate(selectedEventType.updated_at)}
              </p>
            </div>
          </div>

          <section aria-labelledby="event-type-channels-title" className="border-t border-border pt-5">
            <div className="mb-4">
              <h2 id="event-type-channels-title" className="text-sm font-semibold text-slate-200">
                Delivery channels
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Configure each channel independently for this Event Type. Recipient paths point to values in your event payload.
              </p>
            </div>

            {eventTypeChannelsError ? (
              <div role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-4">
                <p className="text-sm font-medium text-rose-300">Could not load channel configuration</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">{eventTypeChannelsError}</p>
                <button
                  type="button"
                  onClick={() => revalidator.revalidate()}
                  className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-slate-300 transition hover:bg-surface-2"
                >
                  <RefreshCw size={12} aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid min-h-40 place-items-center">
                <p role="status" className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  Loading channel configuration…
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {EVENT_CHANNELS.map((channel) => {
                  const channelRecord = eventTypeChannels.find(
                    (record) => record.channelType === channel.type,
                  );

                  return (
                    <ChannelConfigurationCard
                      key={channel.type}
                      eventTypeId={selectedEventType.id}
                      channel={channel}
                      channelRecord={channelRecord}
                      actionUrl={actionUrl}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      );
    }
  } else if (eventTypesError) {
    panelContent = (
      <div role="alert" className="grid min-h-56 place-items-center px-4 text-center">
        <div className="max-w-md">
          <AlertCircle size={20} className="mx-auto text-rose-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-rose-300">Unable to load Event Types</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{eventTypesError}</p>
          <button
            type="button"
            onClick={() => revalidator.revalidate()}
            className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-slate-300 transition hover:bg-surface-2"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Try again
          </button>
        </div>
      </div>
    );
  } else if (isLoading) {
    panelContent = (
      <div className="grid min-h-56 place-items-center">
        <p role="status" className="inline-flex items-center gap-2 text-sm text-slate-400">
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          Loading Event Types…
        </p>
      </div>
    );
  } else if (eventTypes.length > 0) {
    panelContent = (
      <>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {eventTypes.length} {eventTypes.length === 1 ? "Event Type" : "Event Types"}
          </p>
          <button
            type="button"
            onClick={() => revalidator.revalidate()}
            disabled={revalidator.state !== "idle"}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs text-slate-500 transition hover:bg-surface-2 hover:text-slate-300 disabled:opacity-50"
          >
            <RefreshCw size={12} aria-hidden="true" />
            Refresh
          </button>
        </div>
        <div className="grid gap-3">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              detailUrl={detailUrl}
              application={application}
              user={user}
            />
          ))}
        </div>
      </>
    );
  } else {
    panelContent = (
      <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-surface-2/20 px-5 py-10 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-300/[0.06] text-violet-200">
            <ListChecks size={18} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-slate-200">No Event Types yet</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Create an Event Type to define a named event your application can send, such as{" "}
            <code className="font-mono text-violet-200">ORDER_CREATED</code>.
          </p>
          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-violet-600 px-3.5 text-xs font-medium text-white transition hover:bg-violet-500"
          >
            <Plus size={14} aria-hidden="true" />
            Create Event Type
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SectionPanel
        icon={ListChecks}
        eyebrow="Events"
        title={detailView ? selectedEventType?.eventCode || "Event Type configuration" : "Event Types"}
        description={detailView
          ? "Review this Event Type and configure its notification channels."
          : "Define the named events your application can send to NotifyX."}
        action={detailView ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to={actionUrl}
              state={{ application, user }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:bg-surface-2"
            >
              ← All Event Types
            </Link>
            {selectedEventType && (
              <button
                type="button"
                onClick={openEditDialog}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:border-violet-300/30 hover:bg-surface-2 hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
              >
                <Pencil size={15} aria-hidden="true" />
                Edit
              </button>
            )}
            {selectedEventType?.isActive && (
              <button
                type="button"
                onClick={() => setDeactivationDialogOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-300/20 px-3.5 text-sm font-medium text-rose-300 transition hover:border-rose-300/40 hover:bg-rose-300/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-300"
              >
                <Trash2 size={15} aria-hidden="true" />
                Deactivate
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
          >
            <Plus size={16} aria-hidden="true" />
            Create Event Type
          </button>
        )}
      >
        {detailView ? panelContent : (
          <div className="p-5 sm:p-6">
            {successMessage && (
              <p role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-3 text-sm text-emerald-300">
                <Check size={15} aria-hidden="true" />
                {successMessage}
              </p>
            )}

            {entityGroupsError && (
              <div className="mb-5 flex flex-col gap-2 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p role="status" className="text-xs leading-5 text-amber-200/80">
                  Entity Groups could not be loaded. You can still create an Event Type without assigning a group.
                </p>
                <Link to={entityGroupsUrl} state={{ application, user }} className="shrink-0 text-xs font-medium text-violet-200 hover:text-violet-100">
                  Open Entity Groups
                </Link>
              </div>
            )}

            {panelContent}
          </div>
        )}
      </SectionPanel>

      {dialogOpen && (
        <dialog
          ref={dialogRef}
          onClose={() => setDialogOpen(false)}
          onCancel={(event) => {
            if (isSubmitting) event.preventDefault();
          }}
          aria-labelledby="event-type-form-title"
          className="m-auto max-h-[min(90vh,720px)] w-[min(100%-2rem,520px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
        >
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 id="event-type-form-title" className="text-base font-semibold text-slate-100">
                {formMode === "edit" ? "Edit Event Type" : "Create Event Type"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {formMode === "edit"
                  ? "Update the event name, description, or associated Entity Group."
                  : "Define an event name and optionally associate it with an Entity Group."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCreateDialog}
              disabled={isSubmitting}
              aria-label="Close dialog"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-surface-2 hover:text-slate-200 disabled:opacity-50"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <fetcher.Form method="post" action={actionUrl} onSubmit={validateForm} className="max-h-[calc(90vh-80px)] overflow-y-auto p-5 sm:p-6">
            <input type="hidden" name="intent" value={formIntent} />
            {formMode === "edit" && (
              <input type="hidden" name="eventTypeId" value={selectedEventType?.id || ""} />
            )}

            <label htmlFor="event-type-code" className="mb-1.5 block text-xs font-medium text-slate-300">
              Event Type name
            </label>
            <input
              id="event-type-code"
              name="eventCode"
              defaultValue={formMode === "edit" ? selectedEventType?.eventCode || "" : ""}
              maxLength={50}
              required
              autoComplete="off"
              placeholder="ORDER_CREATED"
              aria-describedby="event-type-code-help"
              className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15"
            />
            <p id="event-type-code-help" className="mb-4 mt-1.5 text-[11px] leading-5 text-slate-500">
              Use a clear name for the event your application emits. Maximum 50 characters.
            </p>

            <label htmlFor="event-type-description" className="mb-1.5 block text-xs font-medium text-slate-300">
              Description <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <textarea
              id="event-type-description"
              name="description"
              rows={3}
              defaultValue={formMode === "edit" ? selectedEventType?.description || "" : ""}
              placeholder="Triggered when a customer successfully places an order."
              className="mb-4 w-full resize-y rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15"
            />

            <label htmlFor="event-type-entity-group" className="mb-1.5 block text-xs font-medium text-slate-300">
              Entity Group <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <select
              id="event-type-entity-group"
              name="entityGrpId"
              defaultValue={formMode === "edit" ? selectedEventType?.entityGrp?.id || "" : ""}
              disabled={formMode === "edit" && Boolean(entityGroupsError)}
              className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-100 outline-none focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15"
            >
              <option value="">No Entity Group</option>
              {entityGroups.map((entityGroup) => (
                <option key={entityGroup.id} value={entityGroup.id}>{entityGroup.name}</option>
              ))}
            </select>
            {entityGroups.length > 0 ? (
              <p className="mb-4 mt-1.5 text-[11px] leading-5 text-slate-500">
                Choose a group to associate related events with the same entity.
              </p>
            ) : entityGroupsError && formMode === "edit" ? (
              <p className="mb-4 mt-1.5 text-[11px] leading-5 text-amber-200/80">
                Entity Groups could not be loaded. The existing association will be preserved; you can still update the other fields.
              </p>
            ) : entityGroupsError ? (
              <p className="mb-4 mt-1.5 text-[11px] leading-5 text-amber-200/80">
                Entity Groups could not be loaded. You can continue without a group or open the{" "}
                <Link to={entityGroupsUrl} state={{ application, user }} className="text-violet-200 hover:text-violet-100">
                  Entity Groups section
                </Link>.
              </p>
            ) : (
              <p className="mb-4 mt-1.5 text-[11px] leading-5 text-slate-500">
                No Entity Groups are available. You can create one in the{" "}
                <Link to={entityGroupsUrl} state={{ application, user }} className="text-violet-200 hover:text-violet-100">
                  Entity Groups section
                </Link>.
              </p>
            )}

            {(validationError || formError) && (
              <p role="alert" className="mb-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-300">
                {validationError || formError}
              </p>
            )}

            <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCreateDialog}
                disabled={isSubmitting}
                className="min-h-10 rounded-lg border border-border px-4 text-sm text-slate-300 transition hover:bg-surface-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}
                {isSubmitting
                  ? (formMode === "edit" ? "Saving…" : "Creating…")
                  : (formMode === "edit" ? "Save changes" : "Create Event Type")}
              </button>
            </footer>
          </fetcher.Form>
        </dialog>
      )}

      {deactivationDialogOpen && (
        <dialog
          ref={deactivationDialogRef}
          onClose={() => setDeactivationDialogOpen(false)}
          onCancel={(event) => {
            if (isDeactivating) event.preventDefault();
          }}
          aria-labelledby="deactivate-event-type-title"
          aria-describedby="deactivate-event-type-description"
          className="m-auto max-h-[min(90vh,560px)] w-[min(100%-2rem,480px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-rose-300/20 bg-rose-300/[0.07] text-rose-300">
                <Trash2 size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 id="deactivate-event-type-title" className="text-base font-semibold text-slate-100">
                  Deactivate Event Type?
                </h2>
                <p id="deactivate-event-type-description" className="mt-1.5 text-sm leading-6 text-slate-400">
                  This Event Type will no longer accept new Events. Existing Event history and channel configuration will remain available.
                </p>
              </div>
            </div>

            {selectedEventType?.eventCode && (
              <p className="mt-4 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 font-mono text-xs text-slate-300">
                {selectedEventType.eventCode}
              </p>
            )}

            {deactivationFetcher.data?.intent === "deactivate-event-type"
              && deactivationFetcher.data.success === false
              && !isDeactivating && (
                <p role="alert" className="mt-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-300">
                  {deactivationFetcher.data.message || "Could not deactivate this Event Type."}
                </p>
              )}

            <deactivationFetcher.Form
              method="post"
              action={actionUrl}
              onSubmit={(event) => {
                if (isDeactivating) event.preventDefault();
              }}
              className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
            >
              <input type="hidden" name="intent" value="deactivate-event-type" />
              <input type="hidden" name="eventTypeId" value={selectedEventType?.id || ""} />
              <button
                type="button"
                onClick={closeDeactivationDialog}
                disabled={isDeactivating}
                className="min-h-10 rounded-lg border border-border px-4 text-sm text-slate-300 transition hover:bg-surface-2 disabled:cursor-wait disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeactivating || !selectedEventType?.id}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-wait disabled:opacity-60"
              >
                {isDeactivating && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}
                {isDeactivating ? "Deactivating…" : "Confirm deactivation"}
              </button>
            </deactivationFetcher.Form>
          </div>
        </dialog>
      )}
    </>
  );
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
