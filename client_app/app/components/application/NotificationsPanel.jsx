import { useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Inbox,
  ListFilter,
  RefreshCw,
} from "lucide-react";
import { Link, useLocation, useNavigate, useNavigation, useRevalidator } from "react-router";

const statusStyles = {
  PENDING: "border-amber-300/20 bg-amber-300/[0.07] text-amber-200",
  QUEUED: "border-violet-300/20 bg-violet-300/[0.07] text-violet-200",
  PROCESSING: "border-sky-300/20 bg-sky-300/[0.07] text-sky-200",
  SENT: "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200",
  FAILED: "border-rose-300/20 bg-rose-300/[0.07] text-rose-200",
  CANCELLED: "border-border bg-surface-2/60 text-slate-400",
};

const channelStyles = {
  EMAIL: "border-sky-300/20 bg-sky-300/[0.06] text-sky-200",
  SMS: "border-violet-300/20 bg-violet-300/[0.06] text-violet-200",
  PUSH: "border-amber-300/20 bg-amber-300/[0.06] text-amber-200",
  WEBHOOK: "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200",
};

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function shortenIdentifier(value) {
  if (typeof value !== "string" || value.length <= 20) return value || "—";
  return `${value.slice(0, 9)}…${value.slice(-6)}`;
}

function CopyNotificationId({ notificationId }) {
  const [copyState, setCopyState] = useState("idle");

  async function copyId() {
    try {
      await navigator.clipboard.writeText(notificationId);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2400);
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <code className="max-w-36 truncate rounded-md border border-border bg-bg-base/70 px-2 py-1 font-mono text-[11px] text-slate-300" title={notificationId}>
        {shortenIdentifier(notificationId)}
      </code>
      <button
        type="button"
        onClick={() => void copyId()}
        aria-label={`Copy notification ID ${notificationId}`}
        title="Copy notification ID"
        className="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
      >
        {copyState === "copied" ? <Check size={14} aria-hidden="true" /> : <Clipboard size={14} aria-hidden="true" />}
      </button>
      {copyState !== "idle" && (
        <span role="status" className="sr-only">
          {copyState === "copied" ? "Notification ID copied." : "Could not copy notification ID."}
        </span>
      )}
    </div>
  );
}

function NotificationsTableSkeleton() {
  return (
    <div className="divide-y divide-border" aria-label="Loading notifications" role="status">
      <span className="sr-only">Loading notifications</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid min-h-[68px] grid-cols-[1.1fr_1fr_.7fr_1.2fr_.7fr_.45fr_.9fr_.7fr] items-center gap-4 px-5">
          <span className="h-7 w-32 animate-pulse rounded bg-surface-2" />
          <span className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          <span className="h-6 w-16 animate-pulse rounded-full bg-surface-2" />
          <span className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          <span className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
          <span className="h-3 w-6 animate-pulse rounded bg-surface-2" />
          <span className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          <span className="h-7 w-20 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <section className="min-w-0 space-y-6" aria-label="Loading notifications">
      <header className="border-b border-border pb-5">
        <span className="block h-3 w-36 animate-pulse rounded bg-surface-2" />
        <span className="mt-3 block h-7 w-48 animate-pulse rounded bg-surface-2" />
        <span className="mt-2 block h-4 w-80 max-w-full animate-pulse rounded bg-surface-2" />
      </header>
      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <span className="h-10 animate-pulse rounded-lg bg-surface-2" />
            <span className="h-10 animate-pulse rounded-lg bg-surface-2" />
          </div>
        </div>
        <NotificationsTableSkeleton />
      </div>
    </section>
  );
}

function EmptyState({ isFiltered, clearFilters }) {
  return (
    <div className="grid min-h-64 place-items-center px-5 py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-surface-2/70 text-slate-400" aria-hidden="true">
          {isFiltered ? <ListFilter size={20} /> : <Inbox size={21} />}
        </span>
        <h2 className="mt-4 text-sm font-semibold text-slate-100">
          {isFiltered ? "No notifications match these filters" : "No notifications yet"}
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {isFiltered
            ? "Try another status or channel, or clear your filters."
            : "Notifications will appear here after your application events are processed."}
        </p>
        {isFiltered && (
          <button type="button" onClick={clearFilters} className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = typeof status === "string" ? status.toUpperCase() : "";
  const className = statusStyles[normalizedStatus] || "border-border bg-surface-2/60 text-slate-400";

  return (
    <span className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${className}`}>
      {status || "Unknown"}
    </span>
  );
}

function ChannelBadge({ channelType }) {
  const normalizedChannel = typeof channelType === "string" ? channelType.toUpperCase() : "";
  const className = channelStyles[normalizedChannel] || "border-border bg-surface-2/60 text-slate-400";

  return (
    <span className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${className}`}>
      {channelType || "Unknown"}
    </span>
  );
}

function NotificationsTable({ appId, notifications }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-2/35 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-4 py-3.5">Notification ID</th>
            <th scope="col" className="px-4 py-3.5">Event</th>
            <th scope="col" className="px-4 py-3.5">Channel</th>
            <th scope="col" className="px-4 py-3.5">Recipient</th>
            <th scope="col" className="px-4 py-3.5">Status</th>
            <th scope="col" className="px-4 py-3.5 text-center">Attempts</th>
            <th scope="col" className="px-4 py-3.5">Created</th>
            <th scope="col" className="px-4 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {notifications.map((notification) => {
            const notificationId = String(notification.id || "");
            const eventCode = notification.event?.eventType?.eventCode || "—";
            const recipient = typeof notification.recipientTarget === "string"
              ? notification.recipientTarget
              : "—";
            const attemptCount = Number(notification._count?.deliveryAttempts);
            const detailsUrl = `/dashboard/${encodeURIComponent(appId)}/notifications/${encodeURIComponent(notificationId)}`;

            return (
              <tr key={notificationId} className="transition-colors hover:bg-surface-2/30">
                <td className="px-4 py-3.5"><CopyNotificationId notificationId={notificationId} /></td>
                <td className="max-w-44 px-4 py-4">
                  <span className="block truncate text-sm font-medium text-slate-200" title={eventCode}>{eventCode}</span>
                </td>
                <td className="px-4 py-4"><ChannelBadge channelType={notification.channelType} /></td>
                <td className="max-w-56 px-4 py-4">
                  <span className="block truncate font-mono text-xs text-slate-300" title={recipient}>{recipient}</span>
                </td>
                <td className="px-4 py-4"><StatusBadge status={notification.status} /></td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-border bg-surface-2/55 px-2 py-1 text-xs font-medium tabular-nums text-slate-300">
                    {Number.isFinite(attemptCount) ? attemptCount : "—"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <time dateTime={notification.created_at || undefined} className="whitespace-nowrap text-xs text-slate-300">
                    {formatDateTime(notification.created_at)}
                  </time>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link to={detailsUrl} className="inline-flex min-h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium text-violet-200 transition hover:bg-violet-300/[0.08] hover:text-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function NotificationsPanel({ appId, application, notifications, pagination, filters, error }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isNavigating = navigation.state !== "idle"
    && navigation.location?.pathname === location.pathname;
  const isRefreshing = revalidator.state !== "idle";
  const isFiltered = Boolean(filters.status || filters.channelType);
  const pageCount = Math.max(1, Number(pagination.totalPages) || 0);
  const totalNotifications = Number(pagination.totalNotifications) || 0;
  const notificationsUrl = `/dashboard/${encodeURIComponent(appId)}/notifications`;

  function getPageUrl({
    page = filters.page,
    pageSize = filters.pageSize,
    status = filters.status,
    channelType = filters.channelType,
  } = {}) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(pageSize));
    if (status) searchParams.set("status", status);
    if (channelType) searchParams.set("channelType", channelType);

    return `${notificationsUrl}?${searchParams}`;
  }

  function updateFilter(filterName, value) {
    navigate(getPageUrl({
      page: 1,
      [filterName]: value,
    }));
  }

  function clearFilters() {
    navigate(getPageUrl({ page: 1, status: "", channelType: "" }));
  }

  return (
    <section className="min-w-0 space-y-6" aria-labelledby="notifications-page-title" aria-busy={isNavigating}>
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-violet-200/80">
            <Bell size={14} aria-hidden="true" />
            Application observability
          </div>
          <h1 id="notifications-page-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-[28px]">Notifications</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Monitor and investigate notifications generated by {application?.appName || "your application"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => revalidator.revalidate()}
          disabled={isNavigating || isRefreshing}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface-1 px-3.5 text-sm font-medium text-slate-300 transition hover:border-violet-300/30 hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:self-center"
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm shadow-black/10" aria-label="Notification filters and results">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
              <ListFilter size={15} className="text-slate-400" aria-hidden="true" />
              Filter notifications
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="notification-status-filter" className="text-xs font-medium text-slate-400">Status</label>
                <select
                  id="notification-status-filter"
                  value={filters.status}
                  onChange={(event) => updateFilter("status", event.target.value)}
                  disabled={isNavigating}
                  className="h-10 min-w-44 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
                >
                  <option value="">All statuses</option>
                  {["PENDING", "QUEUED", "PROCESSING", "SENT", "FAILED", "CANCELLED"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="notification-channel-filter" className="text-xs font-medium text-slate-400">Channel</label>
                <select
                  id="notification-channel-filter"
                  value={filters.channelType}
                  onChange={(event) => updateFilter("channelType", event.target.value)}
                  disabled={isNavigating}
                  className="h-10 min-w-44 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
                >
                  <option value="">All channels</option>
                  {["EMAIL", "SMS", "PUSH", "WEBHOOK"].map((channel) => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {isFiltered && (
            <button type="button" onClick={clearFilters} disabled={isNavigating} className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-400 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:opacity-50 motion-reduce:transition-none">
              Clear filters
            </button>
          )}
        </div>

        {isNavigating ? (
          <NotificationsTableSkeleton />
        ) : error ? (
          <div className="flex flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div>
              <p className="text-sm font-medium text-rose-200">Notifications could not be loaded</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{error}</p>
            </div>
            <button type="button" onClick={() => revalidator.revalidate()} disabled={isRefreshing} className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
              {isRefreshing ? "Retrying..." : "Try again"}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState isFiltered={isFiltered} clearFilters={clearFilters} />
        ) : (
          <>
            {isRefreshing && <p className="sr-only" role="status">Refreshing notifications</p>}
            <NotificationsTable appId={appId} notifications={notifications} />
          </>
        )}

        {!error && (
          <footer className="flex flex-col gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-300">{new Intl.NumberFormat().format(totalNotifications)}</span> total notifications
              </p>
              <label htmlFor="notification-page-size" className="flex items-center gap-2 text-xs text-slate-500">
                Rows per page
                <select
                  id="notification-page-size"
                  value={filters.pageSize}
                  onChange={(event) => navigate(getPageUrl({ page: 1, pageSize: Number(event.target.value) }))}
                  disabled={isNavigating}
                  className="h-8 rounded-md border border-border bg-surface-2 px-2 text-xs text-slate-300 outline-none focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:opacity-60"
                >
                  {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            </div>
            <nav aria-label="Notifications pagination" className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(getPageUrl({ page: Math.max(1, Number(pagination.currentPage) - 1) }))}
                disabled={isNavigating || Number(pagination.currentPage) <= 1}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:pointer-events-none disabled:text-slate-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
              >
                <ChevronLeft size={14} aria-hidden="true" />Previous
              </button>
              <span className="px-2 text-xs tabular-nums text-slate-400">
                Page {pagination.currentPage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => navigate(getPageUrl({ page: Number(pagination.currentPage) + 1 }))}
                disabled={isNavigating || Number(pagination.currentPage) >= Number(pagination.totalPages)}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:pointer-events-none disabled:text-slate-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
              >
                Next<ChevronRight size={14} aria-hidden="true" />
              </button>
            </nav>
          </footer>
        )}
      </section>
    </section>
  );
}
