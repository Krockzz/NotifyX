import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  FileText,
  LoaderCircle,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Webhook,
  X,
} from "lucide-react";
import { SectionPanel } from "./ApplicationDetailPanels.jsx";
import { useFetcher, useLocation, useNavigate, useNavigation, useRevalidator } from "react-router";

const TEMPLATE_CHANNELS = [
  { type: "EMAIL", label: "Email", icon: Mail },
  { type: "SMS", label: "SMS", icon: MessageSquare },
  { type: "PUSH", label: "Push", icon: Bell },
  { type: "WEBHOOK", label: "Webhook", icon: Webhook },
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTemplateStatusClass(isActive) {
  return isActive
    ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
    : "border-border bg-surface-2/50 text-slate-400";
}

export default function TemplatesPanel({
  application,
  user,
  actionUrl,
  eventTypes = [],
  eventTypesError = "",
  selectedEventTypeId = "",
  selectedEventType = null,
  selectedEventTypeError = "",
  templates = [],
  templatesError = "",
  channels = [],
  channelsError = "",
  selectedTemplate = null,
  selectedTemplateError = "",
}) {
  const fetcher = useFetcher();
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const createDialogRef = useRef(null);
  const templateDialogRef = useRef(null);
  const deactivateDialogRef = useRef(null);
  const handledActionRef = useRef(null);
  const loadedTemplateIdRef = useRef(null);
  const [createChannelType, setCreateChannelType] = useState("");
  const [createSubject, setCreateSubject] = useState("");
  const [createBodyContent, setCreateBodyContent] = useState("");
  const [createValidationError, setCreateValidationError] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editBodyContent, setEditBodyContent] = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [operationError, setOperationError] = useState("");
  const busy = fetcher.state !== "idle";
  const isLoading = navigation.state === "loading" || revalidator.state === "loading";
  const createError = fetcher.data?.intent === "create-template"
    && fetcher.data.success === false
    && !busy
    ? fetcher.data.message
    : "";
  const updateError = fetcher.data?.intent === "update-template"
    && fetcher.data.success === false
    && !busy
    ? fetcher.data.message
    : "";
  const statusActionError = ["activate-template", "deactivate-template"].includes(fetcher.data?.intent)
    && fetcher.data.success === false
    && !busy
    ? fetcher.data.message
    : "";
  const isCreateOpen = Boolean(createChannelType);
  const isTemplateOpen = Boolean(selectedTemplate);
  const isDeactivateOpen = Boolean(deactivateTarget);

  useEffect(() => {
    if (isCreateOpen && createDialogRef.current && !createDialogRef.current.open) {
      createDialogRef.current.showModal();
    }
  }, [isCreateOpen]);

  useEffect(() => {
    if (isTemplateOpen && templateDialogRef.current && !templateDialogRef.current.open) {
      templateDialogRef.current.showModal();
    }
  }, [isTemplateOpen]);

  useEffect(() => {
    if (isDeactivateOpen && deactivateDialogRef.current && !deactivateDialogRef.current.open) {
      deactivateDialogRef.current.showModal();
    }
  }, [isDeactivateOpen]);

  useEffect(() => {
    if (!selectedTemplate) {
      loadedTemplateIdRef.current = null;
      return;
    }

    if (loadedTemplateIdRef.current === selectedTemplate.id) return;
    loadedTemplateIdRef.current = selectedTemplate.id;
    setEditSubject(selectedTemplate.subject || "");
    setEditBodyContent(selectedTemplate.bodyContent || "");
  }, [selectedTemplate]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = window.setTimeout(() => setSuccessMessage(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    const result = fetcher.data;
    if (
      fetcher.state !== "idle"
      || !result?.intent
      || result.success !== true
      || handledActionRef.current === result
    ) {
      return;
    }

    handledActionRef.current = result;
    setSuccessMessage(result.message || "Template changes saved.");
    setOperationError("");

    if (result.intent === "create-template") {
      closeCreateDialog();
    } else if (result.intent === "update-template" && result.template) {
      setEditSubject(result.template.subject || "");
      setEditBodyContent(result.template.bodyContent || "");
    } else if (result.intent === "deactivate-template") {
      closeDeactivateDialog();
    }
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (!statusActionError) return;
    setOperationError(statusActionError);
  }, [statusActionError]);

  const selectedTemplateByChannel = new Map(
    templates.map((template) => [template.channelType, template]),
  );
  const channelByType = new Map(
    channels.map((channel) => [channel.channelType, channel]),
  );

  function updateQuery(nextEventTypeId, templateId = "") {
    const searchParams = new URLSearchParams();
    if (nextEventTypeId) searchParams.set("eventTypeId", nextEventTypeId);
    if (templateId) searchParams.set("templateId", templateId);
    const search = searchParams.toString();
    navigate(search ? `${actionUrl}?${search}` : actionUrl, { state: { application, user } });
  }

  function handleEventTypeChange(event) {
    setSuccessMessage("");
    setOperationError("");
    updateQuery(event.target.value);
  }

  function openCreateDialog(channelType) {
    setCreateChannelType(channelType);
    setCreateSubject("");
    setCreateBodyContent("");
    setCreateValidationError("");
    setOperationError("");
  }

  function closeCreateDialog() {
    if (busy) return;
    createDialogRef.current?.close();
    setCreateChannelType("");
    setCreateSubject("");
    setCreateBodyContent("");
    setCreateValidationError("");
  }

  function closeTemplateDialog() {
    if (busy) return;
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("templateId");
    const search = searchParams.toString();
    navigate(search ? `${actionUrl}?${search}` : actionUrl, { state: { application, user } });
  }

  function openTemplate(template) {
    updateQuery(selectedEventTypeId, template.id);
    setOperationError("");
  }

  function openDeactivateDialog(template) {
    setDeactivateTarget(template);
    setOperationError("");
  }

  function closeDeactivateDialog() {
    if (busy) return;
    deactivateDialogRef.current?.close();
    setDeactivateTarget(null);
  }

  function submitAction(intent, values) {
    if (busy) return;
    const formData = new FormData();
    formData.set("intent", intent);
    Object.entries(values).forEach(([name, value]) => formData.set(name, String(value ?? "")));
    fetcher.submit(formData, { method: "post", action: actionUrl });
  }

  function handleCreateSubmit(event) {
    event.preventDefault();
    if (busy) return;

    if (!createBodyContent.trim()) {
      setCreateValidationError("Body content cannot be empty.");
      return;
    }

    setCreateValidationError("");
    setOperationError("");
    submitAction("create-template", {
      eventTypeId: selectedEventTypeId,
      channelType: createChannelType,
      subject: createSubject.trim(),
      bodyContent: createBodyContent.trim(),
    });
  }

  function handleUpdateSubmit(event) {
    event.preventDefault();
    if (busy || !selectedTemplate) return;

    if (!editBodyContent.trim()) {
      setOperationError("Body content cannot be empty.");
      return;
    }

    setOperationError("");
    submitAction("update-template", {
      templateId: selectedTemplate.id,
      subject: editSubject.trim(),
      bodyContent: editBodyContent.trim(),
    });
  }

  function handleDetailDialogClose() {
    if (selectedTemplate) closeTemplateDialog();
  }

  return (
    <>
      <SectionPanel
        icon={FileText}
        eyebrow="Messaging"
        title="Templates"
        description="Manage the content NotifyX uses when delivering notifications through each channel."
      >
        <div className="p-5 sm:p-6">
          {successMessage && (
            <p role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-3 text-sm text-emerald-300">
              <Check size={15} aria-hidden="true" />
              {successMessage}
            </p>
          )}

          {eventTypesError ? (
            <div role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-4">
              <p className="text-sm font-medium text-rose-300">Could not load Event Types</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">{eventTypesError}</p>
              <button type="button" onClick={() => revalidator.revalidate()} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-slate-300 transition hover:bg-surface-2">
                <RefreshCw size={13} aria-hidden="true" /> Try again
              </button>
            </div>
          ) : eventTypes.length === 0 ? (
            <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-border bg-surface-2/20 px-5 py-8 text-center">
              <div className="max-w-sm">
                <FileText size={20} className="mx-auto text-slate-500" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-medium text-slate-200">No Event Types yet</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">Create an Event Type before setting up its notification templates.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 max-w-xl">
                <label htmlFor="template-event-type" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Event Type
                </label>
                <select
                  id="template-event-type"
                  value={selectedEventTypeId}
                  onChange={handleEventTypeChange}
                  disabled={busy || isLoading}
                  className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-100 outline-none focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:opacity-60"
                >
                  <option value="">Choose an Event Type</option>
                  {eventTypes.map((eventType) => (
                    <option key={eventType.id} value={eventType.id}>{eventType.eventCode}</option>
                  ))}
                </select>
                {selectedEventType?.description && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">{selectedEventType.description}</p>
                )}
              </div>

              {selectedEventTypeError && (
                <p role="alert" className="mb-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs text-rose-300">
                  {selectedEventTypeError}
                </p>
              )}

              {isLoading && selectedEventTypeId ? (
                <div className="grid min-h-40 place-items-center">
                  <p role="status" className="inline-flex items-center gap-2 text-sm text-slate-400">
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    Loading templates and channels…
                  </p>
                </div>
              ) : !selectedEventTypeId ? (
                <div className="rounded-xl border border-border bg-surface-2/25 px-4 py-8 text-center">
                  <p className="text-sm text-slate-400">Choose an Event Type to view its channel templates.</p>
                </div>
              ) : templatesError ? (
                <div role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-4">
                  <p className="text-sm font-medium text-rose-300">Could not load templates</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-400">{templatesError}</p>
                  <button type="button" onClick={() => revalidator.revalidate()} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-slate-300 transition hover:bg-surface-2">
                    <RefreshCw size={13} aria-hidden="true" /> Try again
                  </button>
                </div>
              ) : (
                <>
                  {channelsError && (
                    <p role="alert" className="mb-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] px-3.5 py-3 text-xs leading-5 text-amber-200/80">
                      Channel availability could not be loaded. Existing templates remain available, but new templates are disabled until channels load.
                    </p>
                  )}
                  {statusActionError && (
                    <p role="alert" className="mb-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3.5 py-3 text-xs leading-5 text-rose-300">
                      {statusActionError}
                    </p>
                  )}
                  {operationError && (
                    <p role="alert" className="mb-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3.5 py-3 text-xs leading-5 text-rose-300">
                      {operationError}
                    </p>
                  )}
                  <div className="grid gap-3 xl:grid-cols-2">
                    {TEMPLATE_CHANNELS.map((channel) => {
                      const template = selectedTemplateByChannel.get(channel.type);
                      const channelConfig = channelByType.get(channel.type);
                      const isChannelEnabled = channelConfig?.isEnabled === true;
                      const ChannelIcon = channel.icon;

                      return (
                        <article key={channel.type} className="rounded-xl border border-border bg-surface-2/20 p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-2/70 text-violet-200">
                                <ChannelIcon size={18} aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <h2 className="font-mono text-sm font-semibold text-slate-100">{channel.type}</h2>
                                <p className="mt-1 text-[11px] text-slate-500">{channel.label} notification template</p>
                              </div>
                            </div>
                            {template ? (
                              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${getTemplateStatusClass(template.isActive)}`}>
                                {template.isActive ? "Active" : "Inactive"}
                              </span>
                            ) : (
                              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${isChannelEnabled ? "border-sky-300/15 bg-sky-300/[0.06] text-sky-200" : "border-border bg-surface-2/50 text-slate-500"}`}>
                                {channelsError ? "Unavailable" : isChannelEnabled ? "No template" : channelConfig ? "Disabled" : "Unavailable"}
                              </span>
                            )}
                          </div>

                          {template ? (
                            <>
                              <p className="mt-4 truncate text-xs text-slate-400">
                                {template.subject || "No subject"}
                              </p>
                              <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">
                                {template.bodyContent}
                              </p>
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                                <p className="text-[10px] text-slate-600">Updated {formatDate(template.updated_at)}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button type="button" onClick={() => openTemplate(template)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] font-medium text-slate-300 transition hover:bg-surface-2 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
                                    <Pencil size={12} aria-hidden="true" /> View/Edit
                                  </button>
                                  {template.isActive ? (
                                    <button type="button" disabled={busy} onClick={() => openDeactivateDialog(template)} className="inline-flex min-h-8 items-center rounded-lg border border-rose-300/15 px-2.5 text-[11px] font-medium text-rose-300 transition hover:bg-rose-300/[0.06] disabled:opacity-50">
                                      Deactivate
                                    </button>
                                  ) : (
                                    <button type="button" disabled={busy} onClick={() => submitAction("activate-template", { templateId: template.id })} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-emerald-300/15 px-2.5 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-300/[0.06] disabled:opacity-50">
                                      {busy && fetcher.formData?.get("intent") === "activate-template" && fetcher.formData?.get("templateId") === template.id && <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />}
                                      Activate
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs leading-5 text-slate-500">
                                {channelsError
                                  ? "Channel status is unavailable."
                                  : isChannelEnabled
                                    ? "Create the content used for this delivery channel."
                                    : channelConfig
                                      ? "Enable this channel in Event Types before creating a template."
                                      : "Configure and enable this channel in Event Types before creating a template."}
                              </p>
                              {isChannelEnabled && !channelsError ? (
                                <button type="button" disabled={busy} onClick={() => openCreateDialog(channel.type)} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
                                  <Plus size={13} aria-hidden="true" /> Create Template
                                </button>
                              ) : (
                                <span className="inline-flex min-h-8 shrink-0 items-center rounded-lg border border-border px-2.5 text-[10px] font-medium text-slate-500">
                                  {channelsError ? "Unavailable" : channelConfig ? "Disabled" : "Not configured"}
                                </span>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SectionPanel>

      {isCreateOpen && (
        <dialog
          ref={createDialogRef}
          onClose={() => setCreateChannelType("")}
          onCancel={(event) => {
            if (busy) event.preventDefault();
          }}
          aria-labelledby="create-template-title"
          className="m-auto max-h-[min(90vh,720px)] w-[min(100%-2rem,560px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
        >
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 id="create-template-title" className="text-base font-semibold text-slate-100">Create {createChannelType} template</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Add the content NotifyX should use for this channel.</p>
            </div>
            <button type="button" onClick={closeCreateDialog} disabled={busy} aria-label="Close dialog" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-surface-2 hover:text-slate-200 disabled:opacity-50">
              <X size={16} aria-hidden="true" />
            </button>
          </header>
          <form onSubmit={handleCreateSubmit} className="max-h-[calc(90vh-80px)] overflow-y-auto p-5 sm:p-6">
            <div className="mb-4 rounded-lg border border-border bg-surface-2/50 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Event Type</p>
              <p className="mt-1 font-mono text-xs text-slate-200">{selectedEventType?.eventCode || "—"}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Channel</p>
              <p className="mt-1 font-mono text-xs text-violet-200">{createChannelType}</p>
            </div>

            <label htmlFor="create-template-subject" className="mb-1.5 block text-xs font-medium text-slate-300">
              Subject <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <input id="create-template-subject" value={createSubject} onChange={(event) => setCreateSubject(event.target.value)} maxLength={255} className="mb-4 min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" placeholder="Your order has shipped" />

            <label htmlFor="create-template-body" className="mb-1.5 block text-xs font-medium text-slate-300">Body content</label>
            <textarea id="create-template-body" value={createBodyContent} onChange={(event) => { setCreateBodyContent(event.target.value); setCreateValidationError(""); }} rows={8} required aria-describedby="create-template-body-help" className="w-full resize-y rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-xs leading-5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" placeholder="Hello {{customer.name}}, your order is on its way." />
            <p id="create-template-body-help" className="mt-1.5 text-[11px] leading-5 text-slate-500">Body content must include the message sent through this channel.</p>

            {(createValidationError || createError) && (
              <p role="alert" className="mt-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-300">{createValidationError || createError}</p>
            )}

            <footer className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeCreateDialog} disabled={busy} className="min-h-10 rounded-lg border border-border px-4 text-sm text-slate-300 transition hover:bg-surface-2 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60">
                {busy && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}
                {busy ? "Creating…" : "Create template"}
              </button>
            </footer>
          </form>
        </dialog>
      )}

      {isTemplateOpen && (
        <dialog
          ref={templateDialogRef}
          onClose={handleDetailDialogClose}
          onCancel={(event) => {
            if (busy) event.preventDefault();
          }}
          aria-labelledby="template-detail-title"
          className="m-auto max-h-[min(92vh,820px)] w-[min(100%-2rem,680px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
        >
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="template-detail-title" className="text-base font-semibold text-slate-100">{selectedTemplate.channelType} template</h2>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${getTemplateStatusClass(selectedTemplate.isActive)}`}>
                  {selectedTemplate.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{selectedEventType?.eventCode || "Selected Event Type"}</p>
            </div>
            <button type="button" onClick={closeTemplateDialog} disabled={busy} aria-label="Close dialog" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-surface-2 hover:text-slate-200 disabled:opacity-50">
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <form onSubmit={handleUpdateSubmit} className="max-h-[calc(92vh-80px)] overflow-y-auto p-5 sm:p-6">
            <p className="mb-4 text-xs leading-5 text-slate-500">Channel and Event Type are fixed for this template. Update its subject or body below.</p>
            <label htmlFor="edit-template-subject" className="mb-1.5 block text-xs font-medium text-slate-300">
              Subject <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <input id="edit-template-subject" value={editSubject} onChange={(event) => { setEditSubject(event.target.value); setOperationError(""); }} maxLength={255} className="mb-4 min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-100 outline-none focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />

            <label htmlFor="edit-template-body" className="mb-1.5 block text-xs font-medium text-slate-300">Body content</label>
            <textarea id="edit-template-body" value={editBodyContent} onChange={(event) => { setEditBodyContent(event.target.value); setOperationError(""); }} rows={10} required className="w-full resize-y rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />
            {(operationError || updateError) && (
              <p role="alert" className="mt-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-300">{operationError || updateError}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[10px] text-slate-600">Updated {formatDate(selectedTemplate.updated_at)}</p>
              <div className="flex flex-wrap justify-end gap-2">
                {selectedTemplate.isActive ? (
                  <button type="button" disabled={busy} onClick={() => openDeactivateDialog(selectedTemplate)} className="inline-flex min-h-9 items-center rounded-lg border border-rose-300/15 px-3 text-xs font-medium text-rose-300 transition hover:bg-rose-300/[0.06] disabled:opacity-50">Deactivate</button>
                ) : (
                  <button type="button" disabled={busy} onClick={() => submitAction("activate-template", { templateId: selectedTemplate.id })} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-300/15 px-3 text-xs font-medium text-emerald-300 transition hover:bg-emerald-300/[0.06] disabled:opacity-50">
                    {busy && fetcher.formData?.get("intent") === "activate-template" && <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />}
                    Activate
                  </button>
                )}
                <button type="button" onClick={closeTemplateDialog} disabled={busy} className="min-h-9 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:opacity-50">Close</button>
                <button type="submit" disabled={busy} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60">
                  {busy && fetcher.formData?.get("intent") === "update-template" && <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />}
                  {busy && fetcher.formData?.get("intent") === "update-template" ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </dialog>
      )}

      {selectedTemplateError && !selectedTemplate && (
        <dialog open aria-labelledby="template-load-error-title" className="m-auto max-h-[min(92vh,400px)] w-[min(100%-2rem,460px)] rounded-2xl border border-border bg-surface-1 p-5 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm">
          <h2 id="template-load-error-title" className="text-base font-semibold text-rose-300">Could not open template</h2>
          <p role="alert" className="mt-2 text-sm leading-6 text-slate-400">{selectedTemplateError}</p>
          <button type="button" onClick={closeTemplateDialog} className="mt-5 min-h-9 rounded-lg border border-border px-3 text-xs text-slate-300 transition hover:bg-surface-2">Back to templates</button>
        </dialog>
      )}

      {isDeactivateOpen && (
        <dialog
          ref={deactivateDialogRef}
          onClose={() => setDeactivateTarget(null)}
          onCancel={(event) => {
            if (busy) event.preventDefault();
          }}
          aria-labelledby="deactivate-template-title"
          className="m-auto max-h-[min(90vh,440px)] w-[min(100%-2rem,460px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
        >
          <div className="p-5 sm:p-6">
            <h2 id="deactivate-template-title" className="text-base font-semibold text-slate-100">Deactivate template?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This template will remain saved but will no longer be active for notifications. You can activate it again later.</p>
            {deactivateTarget && (
              <p className="mt-4 rounded-lg border border-border bg-surface-2/50 px-3 py-2.5 font-mono text-xs text-slate-300">
                {deactivateTarget.channelType} · {selectedEventType?.eventCode || "Event Type"}
              </p>
            )}
            {statusActionError && (
              <p role="alert" className="mt-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs text-rose-300">{statusActionError}</p>
            )}
            <footer className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={busy} onClick={closeDeactivateDialog} className="min-h-10 rounded-lg border border-border px-4 text-sm text-slate-300 transition hover:bg-surface-2 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={busy || !deactivateTarget} onClick={() => submitAction("deactivate-template", { templateId: deactivateTarget?.id })} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-wait disabled:opacity-60">
                {busy && fetcher.formData?.get("intent") === "deactivate-template" && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}
                {busy && fetcher.formData?.get("intent") === "deactivate-template" ? "Deactivating…" : "Confirm deactivation"}
              </button>
            </footer>
          </div>
        </dialog>
      )}
    </>
  );
}
