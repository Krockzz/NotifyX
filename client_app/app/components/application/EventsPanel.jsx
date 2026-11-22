import { useState } from "react";
import { Activity, CalendarDays, Check, ChevronLeft, ChevronRight, Clipboard, Inbox, ListFilter, RefreshCw } from "lucide-react";
import { Form, Link, useLocation, useNavigation, useRevalidator } from "react-router";
import { getEventEntityId } from "../../utils/getEventEntityId.js";


function formatExactDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const intervals = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let valueToFormat = elapsedSeconds;

  for (const [interval, unit] of intervals) {
    if (Math.abs(valueToFormat) < interval) {
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(valueToFormat), unit);
    }
    valueToFormat /= interval;
  }

  return "Unknown time";
}

function SummaryCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-4 shadow-sm shadow-black/10 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg border border-violet-300/15 bg-violet-300/[0.07] text-violet-200" aria-hidden="true">
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <p className="text-sm font-medium text-slate-300">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function EventIdCell({ eventId }) {
  const [copyState, setCopyState] = useState("idle");

  async function copyEventId() {
    try {
      await navigator.clipboard.writeText(eventId);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2400);
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <code className="max-w-[180px] truncate rounded-md border border-border bg-bg-base/70 px-2 py-1 font-mono text-[11px] text-slate-300" title={eventId}>
        {eventId}
      </code>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); void copyEventId(); }}
        aria-label={`Copy complete event ID ${eventId}`}
        className="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
      >
        {copyState === "copied" ? <Check size={14} aria-hidden="true" /> : <Clipboard size={14} aria-hidden="true" />}
      </button>
      {copyState !== "idle" && (
        <span role="status" className="sr-only">
          {copyState === "copied" ? "Event ID copied." : "Could not copy event ID."}
        </span>
      )}
    </div>
  );
}

function EventsTableSkeleton() {
  return (
    <div className="divide-y divide-border" aria-label="Loading events" role="status">
      <span className="sr-only">Loading events</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid min-h-[68px] grid-cols-[1.1fr_1.4fr_1fr_.7fr_1fr] items-center gap-4 px-5">
          <span className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          <span className="h-7 w-40 animate-pulse rounded bg-surface-2" />
          <span className="h-3 w-24 animate-pulse rounded bg-surface-2" />
          <span className="h-6 w-10 animate-pulse rounded-full bg-surface-2" />
          <span className="h-3 w-32 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ isFiltered, clearFiltersTo }) {
  return (
    <div className="grid min-h-64 place-items-center px-5 py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-surface-2/70 text-slate-400" aria-hidden="true">
          {isFiltered ? <ListFilter size={20} /> : <Inbox size={21} />}
        </span>
        <h2 className="mt-4 text-sm font-semibold text-slate-100">
          {isFiltered ? "No events match your filters" : "No events received yet"}
        </h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {isFiltered
            ? "Try a different Event Type or date range, or clear the current filters."
            : "Once your application sends events to NotifyX, they will appear here."}
        </p>
        {isFiltered && (
          <Link to={clearFiltersTo} className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
            Clear filters
          </Link>
        )}
      </div>
    </div>
  );
}

export default function EventsPanel({ appId, application, events, pagination, eventTypes, eventsError, eventTypesError, filters }) {
  const location = useLocation();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isFilterNavigation = navigation.state !== "idle" && navigation.location?.pathname === location.pathname;
  const isLoading = revalidator.state !== "idle" || isFilterNavigation;
  const hasFilters = Boolean(filters.eventTypeId || filters.from || filters.to);
  const totalEvents = eventsError ? "—" : new Intl.NumberFormat().format(pagination.totalEvents);
  const clearFiltersTo = `${location.pathname}?limit=${filters.pageSize}`;
  const appEventsUrl = `/dashboard/${encodeURIComponent(appId)}/events`;

  function getPageUrl(page) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", String(page));
    searchParams.set("limit", String(filters.pageSize));
    return `${location.pathname}?${searchParams}`;
  }

  return (
    <section className="min-w-0 space-y-6" aria-labelledby="events-page-title">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-violet-200/80">
            <Activity size={14} aria-hidden="true" />
            Application observability
          </div>
          <h1 id="events-page-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-[28px]">Events</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Inspect events received by {application?.appName || "your application"} and explore their activity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => revalidator.revalidate()}
          disabled={isLoading}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface-1 px-3.5 text-sm font-medium text-slate-300 transition hover:border-violet-300/30 hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:self-center"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="flex justify-center">
        <SummaryCard
          icon={Inbox}
          label="Total Events"
          value={isLoading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-surface-2" aria-label="Loading total events" /> : totalEvents}
          detail={hasFilters ? "Matching the current filters" : "Received by this application"}
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm shadow-black/10" aria-label="Event filters and results">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
            <ListFilter size={15} className="text-slate-400" aria-hidden="true" />
            Filter events
          </div>
          <Form method="get" action={appEventsUrl} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.3fr)_minmax(145px,1fr)_minmax(145px,1fr)_minmax(120px,.7fr)_auto_auto] xl:items-end">
            <div className="grid gap-1.5">
              <label htmlFor="event-type-filter" className="text-xs font-medium text-slate-400">Event Type</label>
              <select id="event-type-filter" name="eventTypeId" defaultValue={filters.eventTypeId} disabled={Boolean(eventTypesError)} className="h-10 min-w-0 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">All Event Types</option>
                {eventTypes.map((eventType) => (
                  <option key={eventType.id} value={eventType.id}>{eventType.eventCode}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="events-from-date" className="text-xs font-medium text-slate-400">From</label>
              <div className="relative">
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input id="events-from-date" type="date" name="from" defaultValue={filters.from} className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="events-to-date" className="text-xs font-medium text-slate-400">To</label>
              <div className="relative">
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input id="events-to-date" type="date" name="to" defaultValue={filters.to} className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="events-page-size" className="text-xs font-medium text-slate-400">Rows per page</label>
              <select id="events-page-size" name="limit" defaultValue={filters.pageSize} className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15">
                {[10, 25, 50].map((size) => <option key={size} value={size}>{size} rows</option>)}
              </select>
            </div>
            <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-md shadow-violet-950/20 transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
              Apply filters
            </button>
            <Link to={clearFiltersTo} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-3.5 text-sm font-medium text-slate-400 transition hover:bg-surface-2 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
              Clear
            </Link>
          </Form>
          {eventTypesError && <p className="mt-2 text-xs text-amber-200/80" role="status">{eventTypesError}</p>}
        </div>

        {eventsError ? (
          <div className="flex flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div>
              <p className="text-sm font-medium text-rose-200">Events could not be loaded</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{eventsError}</p>
            </div>
            <button type="button" onClick={() => revalidator.revalidate()} disabled={isLoading} className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <EventsTableSkeleton />
        ) : events.length === 0 ? (
          <EmptyState isFiltered={hasFilters} clearFiltersTo={clearFiltersTo} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface-2/35 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3.5">Event Type</th>
                  <th scope="col" className="px-5 py-3.5">Event ID</th>
                  <th scope="col" className="px-5 py-3.5">Entity ID</th>
                  <th scope="col" className="px-5 py-3.5">Notifications</th>
                  <th scope="col" className="px-5 py-3.5">Received</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {events.map((event) => {
                  const notificationCount = Number(event._count?.notifications) || 0;
                  const entityId = getEventEntityId(event.routingKey, application?.id);
                  const eventTypeName = event.eventType?.eventCode || "Unknown Event Type";

                  return (
                    <tr key={event.id} className="transition-colors hover:bg-surface-2/30">
                      <td className="max-w-[190px] px-5 py-4">
                        <span className="block truncate text-sm font-medium text-slate-200" title={eventTypeName}>{eventTypeName}</span>
                      </td>
                      <td className="px-5 py-3.5"><EventIdCell eventId={String(event.id || "—")} /></td>
                      <td className="max-w-[150px] px-5 py-4">
                        <code className="block truncate font-mono text-xs text-slate-400" title={entityId}>{entityId}</code>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2 py-1 text-xs font-medium tabular-nums text-sky-200">{notificationCount}</span>
                      </td>
                      <td className="px-5 py-4">
                        <time dateTime={event.created_at} title={formatExactDate(event.created_at)} className="block whitespace-nowrap text-xs text-slate-300">{formatRelativeDate(event.created_at)}</time>
                        <span className="mt-1 block whitespace-nowrap text-[11px] text-slate-500">{formatExactDate(event.created_at)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`${appEventsUrl}/${encodeURIComponent(event.id)}`} className="inline-flex min-h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium text-violet-200 transition hover:bg-violet-300/[0.08] hover:text-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!eventsError && pagination.totalEvents > 0 && (
          <footer className="flex flex-col gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-300">{new Intl.NumberFormat().format(pagination.totalEvents)}</span> total events
              {hasFilters ? " matching these filters" : " received"}
            </p>
            <nav aria-label="Events pagination" className="flex items-center justify-between gap-2 sm:justify-end">
              <Link
                to={getPageUrl(Math.max(1, pagination.currentPage - 1))}
                aria-disabled={!pagination.hasPreviousPage || isLoading}
                tabIndex={!pagination.hasPreviousPage || isLoading ? -1 : undefined}
                className={`inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${pagination.hasPreviousPage && !isLoading ? "text-slate-300 hover:bg-surface-2" : "pointer-events-none text-slate-600 opacity-50"}`}
              >
                <ChevronLeft size={14} aria-hidden="true" />Previous
              </Link>
              <span className="px-2 text-xs tabular-nums text-slate-400">Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}</span>
              <Link
                to={getPageUrl(pagination.currentPage + 1)}
                aria-disabled={!pagination.hasNextPage || isLoading}
                tabIndex={!pagination.hasNextPage || isLoading ? -1 : undefined}
                className={`inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none ${pagination.hasNextPage && !isLoading ? "text-slate-300 hover:bg-surface-2" : "pointer-events-none text-slate-600 opacity-50"}`}
              >
                Next<ChevronRight size={14} aria-hidden="true" />
              </Link>
            </nav>
          </footer>
        )}
      </section>
    </section>
  );
}


