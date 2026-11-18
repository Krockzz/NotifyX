import { useEffect, useRef, useState } from "react";
import { Boxes, Check, ChevronLeft, CircleAlert, Eye, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Link, useFetcher, useLocation, useNavigate, useNavigation, useRevalidator } from "react-router";
import { SectionPanel } from "./ApplicationDetailPanels.jsx";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getAssignedEventCount(group) {
  return Number(group?._count?.eventTypes ?? group?.eventTypes?.length ?? 0);
}

export default function EntityGroupsPanel({ appId, entityGroups = [], entityGroupsError = "", selectedEntityGroup = null, entityGroupError = "", application, user }) {
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const dialogRef = useRef(null);
  const handledResultRef = useRef(null);
  const [dialogMode, setDialogMode] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [targetGroup, setTargetGroup] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const busy = fetcher.state !== "idle";
  const detailView = new URLSearchParams(location.search).has("entityGrpId");
  const actionUrl = "/dashboard/" + encodeURIComponent(appId) + "/entities";
  const detailUrl = actionUrl + "?entityGrpId=";

  useEffect(() => {
    if (dialogMode && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [dialogMode]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timeout = window.setTimeout(() => setSuccessMessage(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    const result = fetcher.data;
    if (fetcher.state !== "idle" || !result?.success || handledResultRef.current === result) return;
    handledResultRef.current = result;
    setDialogMode(null);
    setEditingGroup(null);
    setTargetGroup(null);
    setValidationError("");
    setHasSubmitted(false);
    setSuccessMessage(result.message || "Entity Group saved.");
    if (result.intent === "delete-entity-group" && detailView) {
      navigate(actionUrl, { state: { application, user } });
    }
  }, [fetcher.data, fetcher.state, detailView, navigate, actionUrl, application, user]);

  function openCreate() {
    setEditingGroup(null);
    setTargetGroup(null);
    setValidationError("");
    setHasSubmitted(false);
    setDialogMode("create");
  }

  function openEdit(group) {
    setEditingGroup(group);
    setTargetGroup(null);
    setValidationError("");
    setHasSubmitted(false);
    setDialogMode("edit");
  }

  function openDelete(group) {
    setTargetGroup(group);
    setEditingGroup(null);
    setHasSubmitted(false);
    setDialogMode("delete");
  }

  function closeDialog() {
    if (busy) return;
    dialogRef.current?.close();
    setDialogMode(null);
  }

  function validateForm(event) {
    setHasSubmitted(true);
    const fields = new FormData(event.currentTarget);
    if (!String(fields.get("name") || "").trim()) {
      event.preventDefault();
      setValidationError("Enter a name for this Entity Group.");
    } else if (!String(fields.get("entityIdPath") || "").trim()) {
      event.preventDefault();
      setValidationError("Enter the payload path used to extract the entity ID.");
    } else setValidationError("");
  }

  const expectedIntent = dialogMode === "create" ? "create-entity-group" : "update-entity-group";
  const formError = hasSubmitted && fetcher.data?.intent === expectedIntent && fetcher.data?.success === false ? fetcher.data.message : "";

  return <>
    <SectionPanel
      icon={Boxes}
      eyebrow="Configuration"
      title="Entity Groups"
      description="Define how NotifyX extracts an entity's identity from an incoming event payload."
      action={detailView
        ? <Link to={actionUrl} state={{ application, user }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:bg-surface-2"><ChevronLeft size={15} aria-hidden="true" />All groups</Link>
        : <button type="button" onClick={openCreate} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><Plus size={16} aria-hidden="true" />Create Entity Group</button>}
    >
      <div className="p-5 sm:p-6">
        {successMessage && <p role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-3 text-sm text-emerald-300"><Check size={15} aria-hidden="true" />{successMessage}</p>}

        {entityGroupsError ? <div role="alert" className="grid min-h-56 place-items-center px-4 text-center"><div><CircleAlert size={20} className="mx-auto text-rose-300" aria-hidden="true" /><p className="mt-3 text-sm font-medium text-rose-300">Unable to load Entity Groups</p><p className="mt-2 text-xs leading-5 text-slate-400">{entityGroupsError}</p><button type="button" onClick={() => revalidator.revalidate()} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-slate-300 hover:bg-surface-2"><RefreshCw size={13} aria-hidden="true" />Try again</button></div></div>
          : entityGroupError ? <div role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-5"><p className="text-sm font-medium text-rose-300">Could not open this Entity Group</p><p className="mt-1.5 text-xs text-slate-400">{entityGroupError}</p><Link to={actionUrl} state={{ application, user }} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-slate-300"><ChevronLeft size={13} aria-hidden="true" />Back to Entity Groups</Link></div>
          : selectedEntityGroup ? <div>
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Entity Group</p><h2 className="mt-1 text-lg font-semibold text-slate-100">{selectedEntityGroup.name}</h2><p className="mt-1 text-xs text-slate-500">Created {formatDate(selectedEntityGroup.created_at)} · Updated {formatDate(selectedEntityGroup.updated_at)}</p></div><div className="flex gap-2"><button type="button" onClick={() => openEdit(selectedEntityGroup)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-slate-300 hover:bg-surface-2"><Pencil size={13} aria-hidden="true" />Edit</button><button type="button" onClick={() => openDelete(selectedEntityGroup)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-300/20 px-3 text-xs text-rose-300 hover:bg-rose-300/[0.06]"><Trash2 size={13} aria-hidden="true" />Delete</button></div></div>
            <dl className="grid gap-4 py-5 sm:grid-cols-2"><div className="rounded-xl border border-border bg-surface-2/45 p-4"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Entity ID path</dt><dd className="mt-2 break-all font-mono text-sm text-violet-200">{selectedEntityGroup.entityIdPath}</dd><p className="mt-2 text-xs leading-5 text-slate-500">The path NotifyX uses to locate the entity identifier in each event payload.</p></div><div className="rounded-xl border border-border bg-surface-2/45 p-4"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Description</dt><dd className="mt-2 text-sm leading-6 text-slate-300">{selectedEntityGroup.description || "No description provided."}</dd></div></dl>
            <section className="border-t border-border pt-5" aria-labelledby="entity-group-events-title"><h3 id="entity-group-events-title" className="text-sm font-medium text-slate-200">Assigned Event Types <span className="ml-1 text-xs text-slate-500">{selectedEntityGroup.eventTypes?.length || 0}</span></h3>{selectedEntityGroup.eventTypes?.length ? <ul className="mt-3 divide-y divide-border rounded-xl border border-border">{selectedEntityGroup.eventTypes.map((eventType) => <li key={eventType.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><div><p className="font-mono text-xs text-slate-200">{eventType.eventCode}</p>{eventType.description && <p className="mt-1 text-xs text-slate-500">{eventType.description}</p>}</div><span className={eventType.isActive ? "rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2 py-0.5 text-[10px] text-emerald-300" : "rounded-full border border-border px-2 py-0.5 text-[10px] text-slate-500"}>{eventType.isActive ? "Active" : "Inactive"}</span></li>)}</ul> : <p className="mt-3 rounded-lg border border-dashed border-border px-4 py-5 text-xs text-slate-500">No Event Types are assigned to this group yet.</p>}</section>
          </div>
          : navigation.state === "loading" || revalidator.state === "loading" ? <div className="grid min-h-56 place-items-center"><p role="status" className="inline-flex items-center gap-2 text-sm text-slate-400"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />Loading Entity Groups…</p></div>
          : entityGroups.length ? <>
            <div className="mb-4 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">{entityGroups.length} {entityGroups.length === 1 ? "group" : "groups"} in this application</p><button type="button" onClick={() => revalidator.revalidate()} disabled={revalidator.state !== "idle"} className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs text-slate-500 hover:bg-surface-2 hover:text-slate-300 disabled:opacity-50"><RefreshCw size={12} aria-hidden="true" />Refresh</button></div>
            <div className="grid gap-3 md:grid-cols-2">{entityGroups.map((group) => <article key={group.id} className="rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/30 hover:shadow-[0_8px_25px_rgba(139,92,246,0.08)] sm:p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-100">{group.name}</h2><p className="mt-1.5 min-h-8 text-xs leading-4 text-slate-500">{group.description || "No description provided."}</p></div><span title="Event Types assigned to this Entity Group" className="rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-2 py-1 text-[10px] text-violet-200">{getAssignedEventCount(group)} events</span></div>
              <div className="mt-4 rounded-lg border border-border bg-surface-2/55 px-3 py-2.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-600">Entity ID path</p><code className="mt-1 block break-all font-mono text-xs text-violet-200">{group.entityIdPath}</code></div>
              <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"><span className="text-[10px] text-slate-600">Created {formatDate(group.created_at)}</span><div className="flex items-center gap-1"><Link to={detailUrl + encodeURIComponent(group.id)} state={{ application, user }} className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[11px] text-slate-400 hover:bg-surface-2 hover:text-violet-200"><Eye size={13} aria-hidden="true" />View</Link><button type="button" onClick={() => openEdit(group)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[11px] text-slate-400 hover:bg-surface-2 hover:text-violet-200"><Pencil size={12} aria-hidden="true" />Edit</button><button type="button" onClick={() => openDelete(group)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[11px] text-slate-500 hover:bg-rose-300/[0.06] hover:text-rose-300"><Trash2 size={12} aria-hidden="true" />Delete</button></div></footer>
            </article>)}</div>
          </> : <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-surface-2/20 px-5 py-10 text-center"><div className="max-w-sm"><span className="mx-auto grid size-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-300/[0.06] text-violet-200"><Boxes size={18} aria-hidden="true" /></span><h2 className="mt-4 text-sm font-semibold text-slate-200">No Entity Groups yet</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">Create a group to tell NotifyX where to find an entity's ID in your event payload, such as <code className="font-mono text-violet-200">data.order.id</code>.</p><button type="button" onClick={openCreate} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-violet-600 px-3.5 text-xs font-medium text-white hover:bg-violet-500"><Plus size={14} aria-hidden="true" />Create Entity Group</button></div></div>}
      </div>
    </SectionPanel>

    {dialogMode && <dialog ref={dialogRef} onClose={() => { setDialogMode(null); setValidationError(""); }} onCancel={(event) => { if (busy) event.preventDefault(); }} aria-labelledby="entity-group-dialog-title" className="m-auto max-h-[min(90vh,700px)] w-[min(100%-2rem,520px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm">
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6"><div><h2 id="entity-group-dialog-title" className="text-base font-semibold text-slate-100">{dialogMode === "create" ? "Create Entity Group" : dialogMode === "edit" ? "Edit Entity Group" : "Delete Entity Group?"}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{dialogMode === "delete" ? "This group will no longer be available for new event configuration." : "Configure the name and payload path used to identify related events."}</p></div><button type="button" onClick={closeDialog} disabled={busy} aria-label="Close dialog" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-surface-2 hover:text-slate-200 disabled:opacity-50"><X size={16} aria-hidden="true" /></button></header>
      {dialogMode === "delete" ? <fetcher.Form method="post" action={actionUrl} className="p-5 sm:p-6">
        <input type="hidden" name="intent" value="delete-entity-group" /><input type="hidden" name="entityGroupId" value={(targetGroup || selectedEntityGroup)?.id || ""} />
        <div className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-4"><p className="text-sm font-medium text-rose-200">Delete &ldquo;{(targetGroup || selectedEntityGroup)?.name}&rdquo;?</p><p className="mt-1.5 text-xs leading-5 text-slate-400">Deletion is permanent. An Entity Group assigned to Event Types cannot be deleted; remove those references first.</p></div>
        {hasSubmitted && fetcher.data?.intent === "delete-entity-group" && !fetcher.data.success && <p role="alert" className="mt-3 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-300">{fetcher.data.message}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={closeDialog} disabled={busy} className="min-h-10 rounded-lg border border-border px-4 text-sm text-slate-300 hover:bg-surface-2 disabled:opacity-50">Cancel</button><button type="submit" onClick={() => setHasSubmitted(true)} disabled={busy || getAssignedEventCount(targetGroup || selectedEntityGroup) > 0} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-300/20 bg-rose-400/[0.08] px-4 text-sm text-rose-300 hover:bg-rose-400/[0.14] disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14} aria-hidden="true" />{busy ? "Deleting…" : "Delete Entity Group"}</button></div>
      </fetcher.Form> : <fetcher.Form method="post" action={actionUrl} onSubmit={validateForm} className="max-h-[calc(90vh-80px)] overflow-y-auto p-5 sm:p-6">
        <input type="hidden" name="intent" value={dialogMode === "create" ? "create-entity-group" : "update-entity-group"} />{dialogMode === "edit" && <input type="hidden" name="entityGroupId" value={editingGroup?.id || ""} />}
        <label htmlFor="entity-group-name" className="mb-1.5 block text-xs font-medium text-slate-300">Entity Group name</label><input id="entity-group-name" name="name" defaultValue={editingGroup?.name || ""} maxLength={100} required autoComplete="off" placeholder="Orders" className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" /><p className="mb-4 mt-1.5 text-[11px] leading-5 text-slate-500">A descriptive label for the entity type, such as Orders or Customers.</p>
        <label htmlFor="entity-group-path" className="mb-1.5 block text-xs font-medium text-slate-300">Entity ID path</label>{dialogMode === "edit" && getAssignedEventCount(editingGroup) > 0 ? <><input type="hidden" name="entityIdPath" value={editingGroup.entityIdPath} /><input id="entity-group-path" value={editingGroup.entityIdPath} readOnly className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 font-mono text-sm text-slate-400 outline-none" /></> : <input id="entity-group-path" name="entityIdPath" defaultValue={editingGroup?.entityIdPath || ""} maxLength={255} required autoComplete="off" placeholder="data.order.id" className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />}
        <p className="mb-4 mt-1.5 text-[11px] leading-5 text-slate-500">This is a dot-separated path in the event payload, not the entity ID itself. For example, <code className="font-mono text-violet-200">data.order.id</code> extracts <code className="font-mono text-violet-200">order_700</code>.{dialogMode === "edit" && getAssignedEventCount(editingGroup) > 0 ? " The path is locked while Event Types reference this group." : ""}</p>
        <label htmlFor="entity-group-description" className="mb-1.5 block text-xs font-medium text-slate-300">Description <span className="font-normal text-slate-600">(optional)</span></label><textarea id="entity-group-description" name="description" defaultValue={editingGroup?.description || ""} rows={3} placeholder="Groups order lifecycle events under the same order ID." className="w-full resize-y rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />
        {(validationError || formError) && <p role="alert" className="mt-3 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-300">{validationError || formError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={closeDialog} disabled={busy} className="min-h-10 rounded-lg border border-border px-4 text-sm text-slate-300 hover:bg-surface-2 disabled:opacity-50">Cancel</button><button type="submit" disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm text-white hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60">{busy && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}{busy ? "Saving…" : dialogMode === "create" ? "Create Entity Group" : "Save changes"}</button></div>
      </fetcher.Form>}
    </dialog>}
  </>;
}
