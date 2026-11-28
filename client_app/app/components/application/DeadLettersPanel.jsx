import { Archive, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useLocation, useNavigate, useNavigation, useRevalidator } from "react-router";

const STATUS_STYLES = {
  PENDING: "border-amber-300/20 bg-amber-300/[0.07] text-amber-200",
  REPLAYED: "border-violet-300/20 bg-violet-300/[0.07] text-violet-200",
  RESOLVED: "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200",
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

function StatusBadge({ status }) {
  const normalizedStatus = typeof status === "string" ? status.toUpperCase() : "";
  const className = STATUS_STYLES[normalizedStatus] || "border-border bg-surface-2/60 text-slate-400";

  return (
    <span className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${className}`}>
      {status || "Unknown"}
    </span>
  );
}

function DeadLettersTableSkeleton() {
  return (
    <div className="divide-y divide-border" aria-label="Loading dead letters" role="status">
      <span className="sr-only">Loading dead letters</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid min-h-[68px] grid-cols-[1fr_1fr_.7fr_.6fr_1.4fr_.8fr_1fr] items-center gap-4 px-5">
          <span className="h-7 w-32 animate-pulse rounded bg-surface-2" />
          <span className="h-7 w-32 animate-pulse rounded bg-surface-2" />
          <span className="h-6 w-16 animate-pulse rounded-full bg-surface-2" />
          <span className="h-3 w-8 animate-pulse rounded bg-surface-2" />
          <span className="h-3 w-40 animate-pulse rounded bg-surface-2" />
          <span className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
          <span className="h-3 w-28 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export function DeadLettersSkeleton() {
  return (
    <section className="min-w-0 space-y-6" aria-label="Loading dead letters">
      <header className="border-b border-border pb-5">
        <span className="block h-3 w-36 animate-pulse rounded bg-surface-2" />
        <span className="mt-3 block h-7 w-52 animate-pulse rounded bg-surface-2" />
        <span className="mt-2 block h-4 w-80 max-w-full animate-pulse rounded bg-surface-2" />
      </header>
      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2">
          <span className="h-10 animate-pulse rounded-lg bg-surface-2" />
          <span className="h-10 animate-pulse rounded-lg bg-surface-2" />
        </div>
        <DeadLettersTableSkeleton />
      </div>
    </section>
  );
}

function DeadLettersTable({ deadLetters }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-2/35 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-4 py-3.5">Dead Letter ID</th>
            <th scope="col" className="px-4 py-3.5">Notification ID</th>
            <th scope="col" className="px-4 py-3.5">Channel</th>
            <th scope="col" className="px-4 py-3.5 text-center">Attempts</th>
            <th scope="col" className="px-4 py-3.5">Failure reason</th>
            <th scope="col" className="px-4 py-3.5">Status</th>
            <th scope="col" className="px-4 py-3.5">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80">
          {deadLetters.map((deadLetter) => {
            const deadLetterId = String(deadLetter.id || "");
            const notificationId = String(deadLetter.notificationId || "");

            return (
              <tr key={deadLetterId} className="transition-colors hover:bg-surface-2/30">
                <td className="px-4 py-4">
                  <code className="rounded-md border border-border bg-bg-base/70 px-2 py-1 font-mono text-[11px] text-slate-300" title={deadLetterId}>
                    {shortenIdentifier(deadLetterId)}
                  </code>
                </td>
                <td className="px-4 py-4">
                  <code className="rounded-md border border-border bg-bg-base/70 px-2 py-1 font-mono text-[11px] text-slate-300" title={notificationId}>
                    {shortenIdentifier(notificationId)}
                  </code>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs font-medium text-slate-300">{deadLetter.channelType || "—"}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex min-w-8 justify-center rounded-md border border-border bg-surface-2/55 px-2 py-1 text-xs tabular-nums text-slate-300">
                    {Number.isFinite(Number(deadLetter.attemptCount)) ? deadLetter.attemptCount : "—"}
                  </span>
                </td>
                <td className="max-w-sm px-4 py-4">
                  <p className="truncate text-xs text-slate-200" title={deadLetter.reason || "—"}>{deadLetter.reason || "—"}</p>
                  {deadLetter.lastError && (
                    <p className="mt-1 max-w-sm truncate text-[11px] text-slate-500" title={deadLetter.lastError}>{deadLetter.lastError}</p>
                  )}
                </td>
                <td className="px-4 py-4"><StatusBadge status={deadLetter.status} /></td>
                <td className="px-4 py-4">
                  <time dateTime={deadLetter.created_at || undefined} className="whitespace-nowrap text-xs text-slate-300">
                    {formatDateTime(deadLetter.created_at)}
                  </time>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center px-5 py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-surface-2/70 text-slate-400" aria-hidden="true">
          <Archive size={21} />
        </span>
        <h2 className="mt-4 text-sm font-semibold text-slate-100">No dead letters found</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Notifications moved to the dead letter queue will appear here.
        </p>
      </div>
    </div>
  );
}

export default function DeadLettersPanel({ appId, application, deadLetters, pagination, filters, error }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isNavigating = navigation.state !== "idle" && navigation.location?.pathname === location.pathname;
  const isRefreshing = revalidator.state !== "idle";
  const isLoading = isNavigating || isRefreshing;
  const totalCount = Number(pagination.totalCount) || 0;
  const totalPages = Math.max(1, Number(pagination.totalPages) || 0);

  function updateFilters(nextFilters) {
    const currentLocation = navigation.location?.pathname === location.pathname
      ? navigation.location
      : location;
    const searchParams = new URLSearchParams(currentLocation.search);

    searchParams.set("page", "1");
    searchParams.set("limit", String(filters.pageSize));

    for (const [key, value] of Object.entries(nextFilters)) {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    }

    navigate(`${currentLocation.pathname}?${searchParams}`);
  }

  function getPageUrl(page) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", String(page));
    searchParams.set("limit", String(filters.pageSize));
    return `${location.pathname}?${searchParams}`;
  }

  return (
    <section className="min-w-0 space-y-6" aria-labelledby="dead-letters-page-title" aria-busy={isLoading}>
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-violet-200/80">
            <Archive size={14} aria-hidden="true" />
            Application observability
          </div>
          <h1 id="dead-letters-page-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-[28px]">Dead Letter Queue</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Review notifications that could not be delivered for {application?.appName || "your application"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => revalidator.revalidate()}
          disabled={isLoading}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface-1 px-3.5 text-sm font-medium text-slate-300 transition hover:border-violet-300/30 hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:self-center"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm shadow-black/10" aria-label="Dead letter filters and results">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 sm:p-5">
          <label className="grid gap-1.5 text-xs font-medium text-slate-400">
            Status
            <select
              value={filters.status}
              onChange={(event) => updateFilters({ status: event.target.value })}
              disabled={isLoading}
              className="h-10 min-w-0 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
            >
              <option value="">All statuses</option>
              {["PENDING", "REPLAYED", "RESOLVED"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-400">
            Channel
            <select
              value={filters.channelType}
              onChange={(event) => updateFilters({ channelType: event.target.value })}
              disabled={isLoading}
              className="h-10 min-w-0 rounded-lg border border-border bg-surface-2 px-3 text-sm text-slate-200 outline-none transition focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/15 disabled:cursor-wait disabled:opacity-60"
            >
              <option value="">All channels</option>
              {["EMAIL", "SMS", "PUSH", "WEBHOOK"].map((channel) => <option key={channel} value={channel}>{channel}</option>)}
            </select>
          </label>
        </div>

        {isNavigating ? (
          <DeadLettersTableSkeleton />
        ) : error ? (
          <div className="flex flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div>
              <p className="text-sm font-medium text-rose-200">Dead letters could not be loaded</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => revalidator.revalidate()}
              disabled={isRefreshing}
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
            >
              {isRefreshing ? "Retrying..." : "Try again"}
            </button>
          </div>
        ) : deadLetters.length === 0 ? (
          <EmptyState />
        ) : (
          <DeadLettersTable deadLetters={deadLetters} />
        )}

        {!error && (
          <footer className="flex flex-col gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-300">{new Intl.NumberFormat().format(totalCount)}</span> total dead letters
            </p>
            <nav aria-label="Dead letter pagination" className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(getPageUrl(Math.max(1, Number(pagination.page) - 1)))}
                disabled={isLoading || Number(pagination.page) <= 1}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:pointer-events-none disabled:text-slate-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none"
              >
                <ChevronLeft size={14} aria-hidden="true" />Previous
              </button>
              <span className="px-2 text-xs tabular-nums text-slate-400">
                Page {pagination.page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => navigate(getPageUrl(Number(pagination.page) + 1))}
                disabled={isLoading || Number(pagination.page) >= Number(pagination.totalPages)}
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
