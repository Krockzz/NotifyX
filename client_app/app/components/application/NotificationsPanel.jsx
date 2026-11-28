import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Inbox,
  ListFilter,
  RefreshCw,
  Search,
  X,
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

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function CopyValueButton({ value, label }) {
  const [copyState, setCopyState] = useState("idle");

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2400);
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => void copyValue()}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        className="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
      >
        {copyState === "copied" ? <Check size={14} aria-hidden="true" /> : <Clipboard size={14} aria-hidden="true" />}
      </button>
      {copyState !== "idle" && (
        <span role="status" className="sr-only">
          {copyState === "copied" ? `${label} copied.` : `Could not copy ${label}.`}
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
                <td className="px-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <code className="max-w-36 truncate rounded-md border border-border bg-bg-base/70 px-2 py-1 font-mono text-[11px] text-slate-300" title={notificationId}>
                      {shortenIdentifier(notificationId)}
                    </code>
                    <CopyValueButton value={notificationId} label="notification ID" />
                  </div>
                </td>
                <td className="max-w-44 px-4 py-4">
                  <span className="block truncate text-sm font-medium text-slate-200" title={eventCode}>{eventCode}</span>
                </td>
                <td className="px-4 py-4"><ChannelBadge channelType={notification.channelType} /></td>
                <td className="max-w-56 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="block min-w-0 flex-1 truncate font-mono text-xs text-slate-300" title={recipient}>{recipient}</span>
                    {recipient !== "—" && <CopyValueButton value={recipient} label="recipient" />}
                  </div>
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
  const [searchInput, setSearchInput] = useState(filters.search);
  const [fromInput, setFromInput] = useState(filters.from);
  const [toInput, setToInput] = useState(filters.to);
  const isNavigating = navigation.state !== "idle"
    && navigation.location?.pathname === location.pathname;
  const isRefreshing = revalidator.state !== "idle";
  const isFiltered = Boolean(
    filters.status
    || filters.channelType
    || filters.search
    || filters.from
    || filters.to,
  );
  const pageCount = Math.max(1, Number(pagination.totalPages) || 0);
  const totalNotifications = Number(pagination.totalNotifications) || 0;
  const notificationsUrl = `/dashboard/${encodeURIComponent(appId)}/notifications`;

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const targetLocation = navigation.location?.pathname === location.pathname
      ? navigation.location
      : location;
    const searchParams = new URLSearchParams(targetLocation.search);
    const activeSearch = (searchParams.get("search") || "").trim();
    const nextSearch = searchInput.trim();

    if (nextSearch === activeSearch) return undefined;

    const timeoutId = window.setTimeout(() => {
      const currentTarget = navigation.location?.pathname === location.pathname
        ? navigation.location
        : location;
      const nextParams = new URLSearchParams(currentTarget.search);
      nextParams.set("page", "1");
      if (nextSearch) {
        nextParams.set("search", nextSearch);
      } else {
        nextParams.delete("search");
      }

      navigate(`${currentTarget.pathname}?${nextParams}`);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.search, navigation.location?.pathname, navigation.location?.search, navigate, searchInput]);

  useEffect(() => {
    setFromInput(filters.from);
    setToInput(filters.to);
  }, [filters.from, filters.to]);

  function getPageUrl({
    page = filters.page,
    pageSize = filters.pageSize,
    status = filters.status,
    channelType = filters.channelType,
    search = filters.search,
    from = filters.from,
    to = filters.to,
  } = {}) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(pageSize));
    if (status) searchParams.set("status", status);
    if (channelType) searchParams.set("channelType", channelType);
    if (search) searchParams.set("search", search);
    if (from) searchParams.set("from", from);
    if (to) searchParams.set("to", to);

    return `${notificationsUrl}?${searchParams}`;
  }

  function updateQueryParams(updates) {
    const targetLocation = navigation.location?.pathname === location.pathname
      ? navigation.location
      : location;
    const searchParams = new URLSearchParams(targetLocation.search);
    searchParams.set("page", "1");
    if (!searchParams.has("limit")) searchParams.set("limit", String(filters.pageSize));

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        searchParams.set(key, String(value));
      } else {
        searchParams.delete(key);
      }
    }

    navigate(`${notificationsUrl}?${searchParams}`);
  }

  function updateFilter(filterName, value) {
    updateQueryParams({ [filterName]: value });
  }

  function clearFilters() {
    setSearchInput("");
    setFromInput("");
    setToInput("");
    updateQueryParams({
      status: "",
      channelType: "",
      search: "",
      from: "",
      to: "",
    });
  }

  function clearSearch() {
    setSearchInput("");
    updateQueryParams({ search: "" });
  }

  function applyDateRange() {
    if (dateRangeError) return;

    updateQueryParams({
      search: searchInput.trim(),
      from: fromInput,
      to: toInput,
    });
  }

  function clearDateRange() {
    setFromInput("");
    setToInput("");
    updateQueryParams({
      search: searchInput.trim(),
      from: "",
      to: "",
    });
  }

  const dateRangeError = fromInput && !isValidDateOnly(fromInput)
    ? "Choose a valid start date."
    : toInput && !isValidDateOnly(toInput)
      ? "Choose a valid end date."
      : fromInput && toInput && fromInput > toInput
        ? "The start date must be on or before the end date."
        : "";
  const dateRangeChanged = fromInput !== filters.from || toInput !== filters.to;
  const hasDateRange = Boolean(filters.from || filters.to || fromInput || toInput);

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
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
            <ListFilter size={15} className="text-slate-400" aria-hidden="true" />
            Filter notifications
          </div>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="notification-search" className="text-xs font-medium text-slate-400">Search</label>
              <div className="relative max-w-2xl">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="notification-search"
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by notification ID, recipient or event code..."
                  className="h-10 w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-10 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch} aria-label="Clear search" title="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-surface-1 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="grid gap-1.5">
                <label htmlFor="notification-status-filter" className="text-xs font-medium text-slate-400">Status</label>
                <select
                  id="notification-status-filter"
                  value={filters.status}
                  onChange={(event) => updateFilter("status", event.target.value)}
                  className="h-10 min-w-0 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
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
                  className="h-10 min-w-0 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
                >
                  <option value="">All channels</option>
                  {["EMAIL", "SMS", "PUSH", "WEBHOOK"].map((channel) => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="notification-from-date" className="text-xs font-medium text-slate-400">From date</label>
                <div className="relative">
                  <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    id="notification-from-date"
                    type="date"
                    value={fromInput}
                    max={toInput || undefined}
                    onChange={(event) => setFromInput(event.target.value)}
                    aria-invalid={Boolean(dateRangeError)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="notification-to-date" className="text-xs font-medium text-slate-400">To date</label>
                <div className="relative">
                  <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    id="notification-to-date"
                    type="date"
                    value={toInput}
                    min={fromInput || undefined}
                    onChange={(event) => setToInput(event.target.value)}
                    aria-invalid={Boolean(dateRangeError)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={applyDateRange} disabled={!dateRangeChanged || Boolean(dateRangeError)} className="inline-flex min-h-9 items-center justify-center rounded-lg bg-violet-600 px-3.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
                Apply date range
              </button>
              {hasDateRange && (
                <button type="button" onClick={clearDateRange} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-400 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
                  Clear dates
                </button>
              )}
              {(isFiltered || searchInput || hasDateRange) && (
                <button type="button" onClick={clearFilters} className="ml-auto inline-flex min-h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-400 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
                  Clear filters
                </button>
              )}
              {dateRangeError && <p className="w-full text-xs text-rose-200" role="alert">{dateRangeError}</p>}
            </div>
          </div>
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
