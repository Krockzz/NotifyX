import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Inbox,
  Mail,
  MessageSquare,
  Radio,
  RefreshCw,
  Webhook,
} from "lucide-react";
import { Link } from "react-router";
import { getEventEntityId } from "../../utils/getEventEntityId.js";

const notificationStatusStyles = {
  SENT: "border-[#34D399]/25 bg-[#34D399]/[0.08] text-[#34D399]",
  FAILED: "border-[#F87171]/25 bg-[#F87171]/[0.08] text-[#F87171]",
  PROCESSING: "border-[#60A5FA]/25 bg-[#60A5FA]/[0.08] text-[#60A5FA]",
  QUEUED: "border-[#A78BFA]/25 bg-[#A78BFA]/[0.08] text-[#A78BFA]",
  PENDING: "border-[#FBBF24]/25 bg-[#FBBF24]/[0.08] text-[#FBBF24]",
  CANCELLED: "border-border bg-surface-2/60 text-slate-400",
};

const channelIcons = {
  EMAIL: Mail,
  SMS: MessageSquare,
  PUSH: Bell,
  WEBHOOK: Webhook,
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

function CopyButton({ value, label }) {
  const [copyState, setCopyState] = useState("idle");

  async function copyValue() {
    if (typeof value !== "string" || !value) return;

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
    <span className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          void copyValue();
        }}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        className="grid size-7 place-items-center rounded-md border border-border bg-surface-2/60 text-slate-400 transition-colors hover:border-[#A78BFA]/40 hover:bg-[#A78BFA]/[0.09] hover:text-[#A78BFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A78BFA] motion-reduce:transition-none"
      >
        {copyState === "copied" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      </button>
      {copyState !== "idle" && (
        <span role="status" className="sr-only">
          {copyState === "copied" ? `${label} copied.` : `Could not copy ${label}.`}
        </span>
      )}
    </span>
  );
}

function MetadataField({ label, children }) {
  return (
    <div className="flex min-h-[78px] min-w-0 flex-col rounded-lg border border-border bg-surface-2/45 px-4 py-3.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-auto flex min-h-7 min-w-0 items-center justify-between gap-2 pt-2 text-sm text-slate-100">
        {children}
      </dd>
    </div>
  );
}

function TechnicalValue({ value, label }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <code className="min-w-0 break-all font-mono text-xs leading-5 text-slate-200 sm:text-[13px]">{value || "—"}</code>
      {value && <CopyButton value={value} label={label} />}
    </span>
  );
}

function EventFlow({ notificationCount }) {
  const flowSteps = [
    { label: "Client Event", description: "Received by NotifyX", icon: Activity, tone: "blue" },
    { label: "Stored Event", description: "Available for inspection", icon: Inbox, tone: "violet" },
    { label: "Generated Notifications", description: `${notificationCount} associated`, icon: Bell, tone: "green" },
  ];
  const iconStyles = {
    blue: "border-[#60A5FA]/20 bg-[#60A5FA]/[0.07] text-[#60A5FA]",
    violet: "border-[#A78BFA]/20 bg-[#A78BFA]/[0.07] text-[#A78BFA]",
    green: "border-[#34D399]/20 bg-[#34D399]/[0.07] text-[#34D399]",
  };

  return (
    <ol aria-label="Event processing flow" className="grid gap-2 rounded-xl border border-border bg-surface-1 p-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.2fr)] lg:items-center lg:gap-3 sm:p-4">
      {flowSteps.map(({ label, description, icon: Icon, tone }, index) => (
        <li key={label} className="contents">
          <div className="flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1.5 sm:px-2">
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg border ${iconStyles[tone]}`} aria-hidden="true">
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-slate-100">{label}</span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-400">{description}</span>
            </span>
          </div>
          {index < flowSteps.length - 1 && (
            <ArrowRight className="hidden text-slate-500 lg:block" size={15} strokeWidth={1.7} aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}

const jsonTokenPattern = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b|[{}\[\],:]/g;

function highlightJson(jsonText) {
  const highlightedTokens = [];
  let previousIndex = 0;
  let tokenIndex = 0;

  for (const match of jsonText.matchAll(jsonTokenPattern)) {
    const [token] = match;
    const tokenStart = match.index;
    const tokenEnd = tokenStart + token.length;

    if (tokenStart > previousIndex) {
      highlightedTokens.push(jsonText.slice(previousIndex, tokenStart));
    }

    let tokenClass = "text-slate-500";
    if (token.startsWith("\"")) {
      const isObjectKey = /^\s*:/.test(jsonText.slice(tokenEnd));
      tokenClass = isObjectKey ? "text-[#A78BFA]" : "text-[#34D399]";
    } else if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token)) {
      tokenClass = "text-[#FBBF24]";
    } else if (/^(true|false|null)$/.test(token)) {
      tokenClass = "text-[#60A5FA]";
    }

    highlightedTokens.push(
      <span key={`json-token-${tokenIndex}`} className={tokenClass}>
        {token}
      </span>,
    );
    previousIndex = tokenEnd;
    tokenIndex += 1;
  }

  if (previousIndex < jsonText.length) {
    highlightedTokens.push(jsonText.slice(previousIndex));
  }

  return highlightedTokens;
}

function PayloadPanel({ payload }) {
  const payloadText = JSON.stringify(payload === undefined ? null : payload, null, 2) ?? "null";

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm shadow-black/10" aria-labelledby="event-payload-title">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 id="event-payload-title" className="text-sm font-semibold text-slate-100">Original payload</h2>
          <p className="mt-1 text-xs text-slate-400">JSON received with this event</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden rounded-md border border-border bg-surface-2/60 px-2 py-1 font-mono text-[10px] text-slate-400 sm:inline-flex">JSON</span>
          <CopyButton value={payloadText} label="payload JSON" />
        </div>
      </header>
      <div className="max-h-[min(58vh,560px)] min-h-48 max-w-full overflow-auto bg-bg-base/55 p-4 sm:p-5">
        <pre tabIndex={0} aria-label="Formatted event payload JSON" className="min-w-max whitespace-pre font-mono text-xs leading-6 text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] sm:text-[13px]"><code>{highlightJson(payloadText)}</code></pre>
      </div>
    </section>
  );
}

function NotificationCard({ notification, isWide }) {
  const channelType = typeof notification.channelType === "string" ? notification.channelType : "UNKNOWN";
  const ChannelIcon = channelIcons[channelType.toUpperCase()] || Radio;
  const status = typeof notification.status === "string" ? notification.status : "Unknown";
  const statusClass = notificationStatusStyles[status.toUpperCase()] || "border-border bg-surface-2/60 text-slate-300";
  const recipient = typeof notification.recipientTarget === "string" ? notification.recipientTarget : "";
  const subject = typeof notification.subject === "string" && notification.subject.trim()
    ? notification.subject
    : "";
  const wideCardLayout = isWide ? "md:grid md:grid-cols-[minmax(0,1fr)_minmax(220px,.8fr)] md:gap-x-6" : "";

  return (
    <article className={`rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-[#A78BFA]/30 sm:p-5 motion-reduce:transition-none ${wideCardLayout}`}>
      <div className={`flex flex-wrap items-start justify-between gap-3 ${isWide ? "md:col-span-2" : ""}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#60A5FA]/20 bg-[#60A5FA]/[0.07] text-[#60A5FA]" aria-hidden="true">
            <ChannelIcon size={18} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100">{channelType}</p>
            <p className="mt-0.5 text-xs text-slate-400">Notification</p>
          </div>
        </div>
        <span className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>
          {status}
        </span>
      </div>

      {subject && (
        <div className={`mt-4 border-t border-border/80 pt-3.5 ${isWide ? "md:col-start-1" : ""}`}>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Subject</p>
          <p className="mt-1.5 break-words text-sm leading-5 text-slate-100">{subject}</p>
        </div>
      )}

      <div className={`mt-4 border-t border-border/80 pt-3.5 ${isWide ? "md:col-start-1" : ""}`}>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Recipient</p>
        <div className="mt-1 flex min-w-0 items-start justify-between gap-2">
          <p className="min-w-0 break-all font-mono text-xs leading-5 text-slate-200">{recipient || "—"}</p>
          {recipient && <CopyButton value={recipient} label="recipient" />}
        </div>
      </div>

      <dl className={`mt-4 grid gap-3 border-t border-border/80 pt-3.5 ${isWide ? "md:col-start-2 md:row-start-2 md:row-span-2 md:grid-cols-1 md:border-t-0 md:pl-5 md:pt-1" : "sm:grid-cols-2"}`}>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Created</dt>
          <dd className="mt-1.5 text-xs text-slate-200">{formatDateTime(notification.created_at)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Updated</dt>
          <dd className="mt-1.5 text-xs text-slate-200">{formatDateTime(notification.updated_at)}</dd>
        </div>
      </dl>
    </article>
  );
}

function EmptyNotifications() {
  return (
    <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border bg-surface-1/70 px-5 py-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-10 place-items-center rounded-xl border border-border bg-surface-2 text-slate-400" aria-hidden="true">
          <Bell size={17} />
        </span>
        <h3 className="mt-3 text-sm font-medium text-slate-200">No notifications generated yet</h3>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          Notifications generated from this event will appear here once processing creates them.
        </p>
      </div>
    </div>
  );
}


function EventNotAvailable({ appId }) {
  const eventsUrl = `/dashboard/${encodeURIComponent(appId)}/events`;

  return (
    <section className="grid min-h-[55vh] place-items-center rounded-xl border border-border bg-surface-1 px-5 py-12 text-center" aria-labelledby="event-unavailable-title">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-[#FBBF24]/20 bg-[#FBBF24]/[0.06] text-[#FBBF24]" aria-hidden="true">
          <CircleAlert size={19} />
        </span>
        <h1 id="event-unavailable-title" className="mt-4 text-lg font-semibold text-slate-100">Event not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">This event may have been removed or may not belong to this application.</p>
        <Link to={eventsUrl} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
          <ArrowLeft size={15} aria-hidden="true" />Back to Events
        </Link>
      </div>
    </section>
  );
}

function EventLoadError({ appId, message, isRetrying, onRetry }) {
  const eventsUrl = `/dashboard/${encodeURIComponent(appId)}/events`;

  return (
    <section className="grid min-h-[55vh] place-items-center rounded-xl border border-border bg-surface-1 px-5 py-12 text-center" aria-labelledby="event-load-error-title">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-[#F87171]/20 bg-[#F87171]/[0.06] text-[#F87171]" aria-hidden="true">
          <CircleAlert size={19} />
        </span>
        <h1 id="event-load-error-title" className="mt-4 text-lg font-semibold text-slate-100">Event details unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message || "Could not load this event."}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onRetry} disabled={isRetrying} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#8B5CF6] px-3.5 text-sm font-medium text-white transition hover:bg-[#A78BFA] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A78BFA] motion-reduce:transition-none">
            <RefreshCw size={14} className={isRetrying ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
            {isRetrying ? "Retrying..." : "Try again"}
          </button>
          <Link to={eventsUrl} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
            <ArrowLeft size={15} aria-hidden="true" />Back to Events
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function EventDetailsPanel({ appId, application, event, error, notFound, isRetrying, onRetry }) {
  if (notFound) return <EventNotAvailable appId={appId} />;
  if (error || !event) {
    return <EventLoadError appId={appId} message={error} isRetrying={isRetrying} onRetry={onRetry} />;
  }

  const eventsUrl = `/dashboard/${encodeURIComponent(appId)}/events`;
  const eventTypeName = event.eventType?.eventCode || "Unknown Event Type";
  const entityId = getEventEntityId(event.routingKey, application?.id);
  const notifications = Array.isArray(event.notifications) ? event.notifications : [];
  const eventReceivedAt = formatDateTime(event.created_at);
  const notificationGridColumns = notifications.length === 1
    ? "grid-cols-1"
    : notifications.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3";

  return (
    <div className="space-y-5" aria-labelledby="event-details-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link to={eventsUrl} className="rounded-sm transition-colors hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">Events</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page" className="text-slate-300">Event Details</span>
        </nav>
        <Link to={eventsUrl} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
          <ArrowLeft size={14} aria-hidden="true" />Back to Events
        </Link>
      </div>

      <header className="rounded-xl border border-border bg-surface-1 p-5 shadow-sm shadow-black/10 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#A78BFA]">
              <Activity size={14} aria-hidden="true" />Stored event
            </div>
            <h1 id="event-details-title" className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-100 sm:text-[28px]">
              {eventTypeName}
            </h1>
            <div className="mt-3 flex min-w-0 items-center gap-1 rounded-lg border border-border bg-surface-2/50 py-1 pl-2.5 pr-1 font-mono text-xs text-slate-300 sm:w-fit">
              <span className="shrink-0 text-slate-500">ID</span>
              <code className="min-w-0 break-all">{event.id}</code>
              <CopyButton value={event.id} label="event ID" />
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-surface-2/40 px-3.5 py-3 sm:min-w-48">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <Clock3 size={13} aria-hidden="true" />Received
            </p>
            <time dateTime={event.created_at || undefined} className="mt-1.5 block text-sm text-slate-200">{eventReceivedAt}</time>
          </div>
        </div>
      </header>

      <EventFlow notificationCount={notifications.length} />

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <section className="min-w-0 rounded-xl border border-border bg-surface-1 p-4 shadow-sm shadow-black/10 sm:p-5" aria-labelledby="event-information-title">
          <header className="mb-4">
            <h2 id="event-information-title" className="text-sm font-semibold text-slate-100">Event information</h2>
            <p className="mt-1 text-xs text-slate-400">Identifiers and routing details for this event.</p>
          </header>
          <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <MetadataField label="Event ID"><TechnicalValue value={event.id} label="event ID" /></MetadataField>
            <MetadataField label="Event Type"><span className="min-w-0 break-words text-sm font-medium">{eventTypeName}</span></MetadataField>
            <MetadataField label="Event Type ID"><TechnicalValue value={event.eventTypeId} label="Event Type ID" /></MetadataField>
            <MetadataField label="Entity ID"><TechnicalValue value={entityId === "—" ? "" : entityId} label="Entity ID" /></MetadataField>
            <MetadataField label="Received At"><span className="text-xs">{eventReceivedAt}</span></MetadataField>
          </dl>
          <details className="mt-4 rounded-lg border border-border/80 bg-surface-2/25">
            <summary className="cursor-pointer rounded-lg px-3.5 py-3 text-xs font-medium text-slate-400 transition hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
              Technical identifiers
            </summary>
            <dl className="grid gap-3 border-t border-border/80 px-3.5 py-3.5">
              <div className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Routing Key</dt>
                <dd className="mt-1 flex min-w-0 items-start justify-between gap-2">
                  <code className="min-w-0 break-all font-mono text-xs text-slate-300">{event.routingKey || "—"}</code>
                  {event.routingKey && <CopyButton value={event.routingKey} label="routing key" />}
                </dd>
              </div>
              {event.apiKeyId && (
                <div className="min-w-0">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">API Key ID</dt>
                  <dd className="mt-1"><TechnicalValue value={event.apiKeyId} label="API Key ID" /></dd>
                </div>
              )}
            </dl>
          </details>
        </section>

        <PayloadPanel payload={event.payload} />
      </div>

      <section className="space-y-3" aria-labelledby="generated-notifications-title">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="generated-notifications-title" className="text-base font-semibold text-slate-100">Generated notifications</h2>
            <p className="mt-1 text-xs text-slate-500">Notifications associated with this event.</p>
          </div>
          <span className="rounded-full border border-border bg-surface-1 px-2.5 py-1 text-[11px] tabular-nums text-slate-400">
            {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
          </span>
        </header>
        {notifications.length > 0 ? (
          <div className={`grid min-w-0 gap-3 ${notificationGridColumns}`}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isWide={notifications.length === 1}
              />
            ))}
          </div>
        ) : (
          <EmptyNotifications />
        )}
      </section>
    </div>
  );
}






