
import { useEffect, useId, useRef, useState } from "react";

import {
  ArrowRight,
  Box,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  CircleAlert,
} from "lucide-react";

import { Form, Link, useNavigation } from "react-router";

function formatCreatedDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ApplicationCard({ application, onChanged, user }) {
  const menuId = useId();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  const navigation = useNavigation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [appName, setAppName] = useState(application.appName || "");
  const [error, setError] = useState("");

  const appId = application.id;
  const createdDate = formatCreatedDate(application.created_at);
  const isActive = application.isActive !== false;

  const isSubmitting =
    navigation.state !== "idle" &&
    navigation.formData?.get("appId") === String(appId);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event) {
      if (
        !menuRef.current?.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (dialogMode && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();

      if (dialogMode === "update") {
        inputRef.current?.focus();
      }
    }
  }, [dialogMode]);

  function openDialog(mode) {
    setMenuOpen(false);
    setError("");
    setDialogMode(mode);

    if (mode === "update") {
      setAppName(application.appName || "");
    }
  }

  function closeDialog() {
    if (!isSubmitting) {
      dialogRef.current?.close();
    }
  }

  function handleConfirm(event) {
    setError("");

    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    if (dialogMode === "update") {
      const trimmedName = appName.trim();

      if (!trimmedName) {
        event.preventDefault();
        setError("Application name is required.");
        inputRef.current?.focus();
      }
    }
  }

  function handleDialogClose() {
    setDialogMode(null);
    setError("");
  }

  return (
    <>
      <article className="group relative flex min-h-[118px] min-w-0 items-start gap-3 rounded-xl border border-border bg-surface-1 p-4 pr-14 shadow-[0_14px_44px_-34px_rgba(0,0,0,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-surface-2 sm:p-5 sm:pr-14">
        <Link
          to={`/dashboard/${encodeURIComponent(appId)}`}
          state={{ application, user }}
          aria-label={`Open ${application.appName}`}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
        >
          <span
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-slate-400"
            aria-hidden="true"
          >
            <Box size={19} strokeWidth={1.8} />
          </span>

          <span className="grid min-w-0 flex-1 gap-2 pt-0.5">
            <strong
              className="truncate text-sm font-medium text-slate-100"
              title={application.appName}
            >
              {application.appName}
            </strong>

            <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                isActive
                  ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                  : "border-slate-400/15 bg-slate-400/[0.06] text-slate-400"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isActive ? "bg-emerald-300" : "bg-slate-500"
                }`}
                aria-hidden="true"
              />
              {isActive ? "Active" : "Paused"}
            </span>

            {createdDate && (
              <small className="text-xs text-slate-500">
                Created {createdDate}
              </small>
            )}
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Check
                size={12}
                className={isActive ? "text-emerald-300/80" : "text-slate-500"}
                aria-hidden="true"
              />
              {isActive ? "Delivery enabled" : "Delivery paused"}
            </span>
          </span>

          <ArrowRight
            className="mt-1 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-violet-200"
            size={16}
            aria-hidden="true"
          />
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={`Options for ${application.appName}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={() => setMenuOpen((open) => !open)}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-surface-2/85 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
        >
          <MoreVertical size={18} aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={`${application.appName} actions`}
            className="absolute right-3 top-12 z-20 w-40 rounded-lg border border-border bg-surface-2 p-1.5 shadow-xl shadow-black/40"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => openDialog("update")}
              className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs text-slate-300 transition-colors hover:bg-surface-2/80 hover:text-white"
            >
              <Pencil size={14} aria-hidden="true" />
              Update
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => openDialog("delete")}
              className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs text-rose-300 transition-colors hover:bg-rose-400/[0.09]"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          </div>
        )}

      </article>

      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        onCancel={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        aria-labelledby={`application-dialog-title-${appId}`}
        className="m-auto w-[min(100%-2rem,440px)] rounded-2xl border border-border bg-surface-1 p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
      >
        <Form
          method="post"
          action={
            dialogMode === "delete"
              ? `/dashboard/delete/${encodeURIComponent(appId)}`
              : "/dashboard"
          }
          onSubmit={handleConfirm}
          className="p-5 sm:p-6"
        >
          <input type="hidden" name="appId" value={appId} />

          <input
            type="hidden"
            name="intent"
            value={
              dialogMode === "delete"
                ? "delete-application"
                : "update-application"
            }
          />

          <div className="flex items-start gap-3">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
                dialogMode === "delete"
                  ? "border-rose-300/20 bg-rose-400/10 text-rose-300"
                  : "border-violet-300/20 bg-violet-400/10 text-violet-200"
              }`}
            >
              {dialogMode === "delete" ? (
                <CircleAlert size={19} aria-hidden="true" />
              ) : (
                <Pencil size={18} aria-hidden="true" />
              )}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id={`application-dialog-title-${appId}`}
                className="text-base font-semibold tracking-tight"
              >
                {dialogMode === "delete"
                  ? "Delete application?"
                  : "Update application"}
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                {dialogMode === "delete"
                  ? "This action cannot be undone. The application and its associated data may be removed."
                  : "Change the name of this application."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeDialog}
              disabled={isSubmitting}
              aria-label="Close dialog"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-surface-2/80 hover:text-white disabled:opacity-50"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {dialogMode === "delete" ? (
            <div className="mt-5 rounded-lg border border-rose-300/15 bg-rose-300/[0.045] px-3.5 py-3 text-xs leading-5 text-rose-100/80">
              You won’t be able to restore{" "}
              <strong className="font-semibold text-rose-100">
                {application.appName}
              </strong>{" "}
              after deleting it.
            </div>
          ) : (
            <div className="mt-5">
              <label
                htmlFor={`application-name-${appId}`}
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Application name
              </label>

              <input
                ref={inputRef}
                id={`application-name-${appId}`}
                name="appName"
                value={appName}
                onChange={(event) => {
                  setAppName(event.target.value);
                  setError("");
                }}
                maxLength={50}
                autoComplete="off"
                disabled={isSubmitting}
                className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:opacity-60"
              />
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs leading-5 text-rose-300" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              disabled={isSubmitting}
              className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-slate-300 transition hover:bg-surface-2/75 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                (dialogMode === "update" && !appName.trim())
              }
              className={`min-h-10 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60 ${
                dialogMode === "delete"
                  ? "bg-rose-600 hover:bg-rose-500"
                  : "bg-violet-500 hover:bg-violet-400"
              }`}
            >
              {isSubmitting
                ? dialogMode === "delete"
                  ? "Deleting..."
                  : "Saving..."
                : dialogMode === "delete"
                  ? "Confirm delete"
                  : "Save changes"}
            </button>
          </div>
        </Form>
      </dialog>
    </>
  );
}
