import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Mail,
  MessageSquare,
  Radio,
  RefreshCw,
  Webhook,
} from "lucide-react";
import { Link } from "react-router";

const notificationStatusStyles = {
  SENT: "border-[#34D399]/25 bg-[#34D399]/[0.08] text-[#34D399]",
  SUCCESS: "border-[#34D399]/25 bg-[#34D399]/[0.08] text-[#34D399]",
  DELIVERED: "border-[#34D399]/25 bg-[#34D399]/[0.08] text-[#34D399]",
  FAILED: "border-[#F87171]/25 bg-[#F87171]/[0.08] text-[#F87171]",
  PROCESSING: "border-[#60A5FA]/25 bg-[#60A5FA]/[0.08] text-[#60A5FA]",
  QUEUED: "border-[#A78BFA]/25 bg-[#A78BFA]/[0.08] text-[#A78BFA]",
  PENDING: "border-[#FBBF24]/25 bg-[#FBBF24]/[0.08] text-[#FBBF24]",
};

const attemptStatusStyles = {
  SUCCESS: {
    badge: "border-[#34D399]/25 bg-[#34D399]/[0.08] text-[#34D399]",
    marker: "border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]",
    icon: CheckCircle2,
  },
  FAILED: {
    badge: "border-[#F87171]/25 bg-[#F87171]/[0.08] text-[#F87171]",
    marker: "border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]",
    icon: CircleAlert,
  },
  PROCESSING: {
    badge: "border-[#60A5FA]/25 bg-[#60A5FA]/[0.08] text-[#60A5FA]",
    marker: "border-[#60A5FA]/40 bg-[#60A5FA]/10 text-[#60A5FA]",
    icon: RefreshCw,
  },
  PENDING: {
    badge: "border-[#FBBF24]/25 bg-[#FBBF24]/[0.08] text-[#FBBF24]",
    marker: "border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24]",
    icon: Clock3,
  },
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

function StatusBadge({ status, styles = notificationStatusStyles }) {
  const normalizedStatus = typeof status === "string" ? status.toUpperCase() : "UNKNOWN";
  const statusClass = styles[normalizedStatus]?.badge || styles[normalizedStatus]
    || "border-border bg-surface-2/60 text-slate-300";

  return (
    <span className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>
      {status || "Unknown"}
    </span>
  );
}

function DetailField({ label, value, technical = false }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1.5 break-words text-sm text-slate-100 ${technical ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function NotificationOverview({ notification }) {
  const channelType = typeof notification.channelType === "string" ? notification.channelType : "UNKNOWN";
  const ChannelIcon = channelIcons[channelType.toUpperCase()] || Radio;
  const details = [
    { label: "Recipient", value: notification.recipientTarget, technical: true },
    { label: "Created", value: formatDateTime(notification.created_at) },
    { label: "Last updated", value: formatDateTime(notification.updated_at) },
  ];

  if (notification.scheduledAt) {
    details.splice(2, 0, {
      label: "Scheduled",
      value: formatDateTime(notification.scheduledAt),
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm shadow-black/10" aria-labelledby="notification-overview-title">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/[0.07] text-[#A78BFA]" aria-hidden="true">
            <ChannelIcon size={18} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{channelType} notification</p>
            <h1 id="notification-overview-title" className="mt-1 break-all font-mono text-sm font-semibold text-slate-100 sm:text-base">
              {notification.id}
            </h1>
          </div>
        </div>
        <StatusBadge status={notification.status} />
      </header>

      <div className="space-y-5 p-4 sm:p-5">
        {notification.subject && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Subject</p>
            <p className="mt-1.5 break-words text-sm font-medium leading-6 text-slate-100">{notification.subject}</p>
          </div>
        )}

        {notification.bodyContent && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Body content</p>
            <div className="mt-2 max-h-[min(45vh,420px)] overflow-auto rounded-lg border border-border bg-bg-base/55 p-3.5 sm:p-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-200">{notification.bodyContent}</pre>
            </div>
          </div>
        )}

        <dl className="grid gap-x-5 gap-y-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {details.map((detail) => (
            <DetailField key={detail.label} {...detail} />
          ))}
        </dl>
      </div>
    </section>
  );
}

function AttemptField({ label, value, technical = false }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 break-words text-xs leading-5 text-slate-300 ${technical ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function DeliveryAttemptCard({ attempt, isLast }) {
  const status = typeof attempt.status === "string" ? attempt.status.toUpperCase() : "UNKNOWN";
  const statusStyle = attemptStatusStyles[status];
  const AttemptIcon = statusStyle?.icon || Clock3;
  const markerStyle = statusStyle?.marker || "border-border bg-surface-2 text-slate-400";

  return (
    <li className="relative flex gap-3 sm:gap-4">
      {!isLast && <span className="absolute bottom-[-18px] left-[17px] top-10 w-px bg-border sm:left-[19px]" aria-hidden="true" />}
      <span className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border ${markerStyle}`} aria-hidden="true">
        <AttemptIcon size={15} strokeWidth={1.8} />
      </span>
      <article className={`min-w-0 flex-1 rounded-xl border bg-surface-1 p-4 sm:p-5 ${status === "FAILED" ? "border-[#F87171]/20" : "border-border"}`}>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Attempt {attempt.attemptNumber ?? "—"}</h3>
            <p className="mt-1 text-xs text-slate-400">{attempt.provider || "Provider unavailable"}</p>
          </div>
          <StatusBadge status={attempt.status} styles={attemptStatusStyles} />
        </header>
        <dl className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
          <AttemptField label="Created" value={formatDateTime(attempt.created_at)} />
          <AttemptField label="Provider message ID" value={attempt.providerMessageId} technical />
          <AttemptField label="Next retry" value={formatDateTime(attempt.nextRetryAt)} />
          <AttemptField label="Error reason" value={attempt.errorReason} />
        </dl>
      </article>
    </li>
  );
}

function DeliveryAttempts({ attempts }) {
  const orderedAttempts = [...attempts].sort((first, second) => {
    return Number(first.attemptNumber || 0) - Number(second.attemptNumber || 0);
  });

  return (
    <section className="space-y-3" aria-labelledby="delivery-attempts-title">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="delivery-attempts-title" className="text-base font-semibold text-slate-100">Delivery attempts</h2>
          <p className="mt-1 text-xs text-slate-500">Provider results recorded for this notification.</p>
        </div>
        <span className="rounded-full border border-border bg-surface-1 px-2.5 py-1 text-[11px] tabular-nums text-slate-400">
          {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
        </span>
      </header>

      {orderedAttempts.length ? (
        <ol className="space-y-5" aria-label="Delivery attempts in attempt-number order">
          {orderedAttempts.map((attempt, index) => (
            <DeliveryAttemptCard
              key={attempt.id || `${attempt.attemptNumber}-${index}`}
              attempt={attempt}
              isLast={index === orderedAttempts.length - 1}
            />
          ))}
        </ol>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface-1/70 px-5 py-8 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-xl border border-border bg-surface-2 text-slate-400" aria-hidden="true">
            <Clock3 size={17} />
          </span>
          <h3 className="mt-3 text-sm font-medium text-slate-200">No delivery attempts yet</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">Delivery attempt history will appear here when available.</p>
        </div>
      )}
    </section>
  );
}

function RelatedEvent({ appId, event }) {
  if (!event) return null;

  const eventUrl = `/dashboard/${encodeURIComponent(appId)}/events/${encodeURIComponent(event.id)}`;
  const payloadText = JSON.stringify(event.payload === undefined ? null : event.payload, null, 2) ?? "null";

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface-1" aria-labelledby="related-event-title">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <div>
          <h2 id="related-event-title" className="text-sm font-semibold text-slate-100">Related event</h2>
          <p className="mt-1 text-xs text-slate-500">The event that generated this notification.</p>
        </div>
        {event.id && (
          <Link to={eventUrl} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A78BFA] motion-reduce:transition-none">
            <ArrowLeft size={14} aria-hidden="true" /> View Event
          </Link>
        )}
      </header>
      <div className="space-y-4 p-4 sm:p-5">
        <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Event code" value={event.eventType?.eventCode} />
          <DetailField label="Event ID" value={event.id} technical />
          <DetailField label="Routing key" value={event.routingKey} technical />
          <DetailField label="Created" value={formatDateTime(event.created_at)} />
        </dl>
        {event.payload !== undefined && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Original event payload</p>
            <div className="mt-2 max-h-[min(48vh,480px)] max-w-full overflow-auto rounded-lg border border-border bg-bg-base/55 p-3.5 sm:p-4">
              <pre tabIndex={0} className="min-w-max font-mono text-xs leading-5 text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]">{payloadText}</pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function NotificationNotFound({ appId }) {
  return (
    <section className="grid min-h-[55vh] place-items-center rounded-xl border border-border bg-surface-1 px-5 py-12 text-center" aria-labelledby="notification-not-found-title">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-[#FBBF24]/20 bg-[#FBBF24]/[0.06] text-[#FBBF24]" aria-hidden="true">
          <CircleAlert size={19} />
        </span>
        <h1 id="notification-not-found-title" className="mt-4 text-lg font-semibold text-slate-100">Notification not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">This notification may have been removed or may not belong to this application.</p>
        <Link to={`/dashboard/${encodeURIComponent(appId)}/events`} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
          <ArrowLeft size={15} aria-hidden="true" />Back to Events
        </Link>
      </div>
    </section>
  );
}

function NotificationLoadError({ appId, message, isRetrying, onRetry }) {
  return (
    <section className="grid min-h-[55vh] place-items-center rounded-xl border border-border bg-surface-1 px-5 py-12 text-center" aria-labelledby="notification-load-error-title">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-[#F87171]/20 bg-[#F87171]/[0.06] text-[#F87171]" aria-hidden="true">
          <CircleAlert size={19} />
        </span>
        <h1 id="notification-load-error-title" className="mt-4 text-lg font-semibold text-slate-100">Notification details unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message || "Could not load this notification."}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onRetry} disabled={isRetrying} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#8B5CF6] px-3.5 text-sm font-medium text-white transition hover:bg-[#A78BFA] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A78BFA] motion-reduce:transition-none">
            <RefreshCw size={14} className={isRetrying ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
            {isRetrying ? "Retrying..." : "Try again"}
          </button>
          <Link to={`/dashboard/${encodeURIComponent(appId)}/events`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
            <ArrowLeft size={15} aria-hidden="true" />Back to Events
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function NotificationDetailsPanel({ appId, notification, error, notFound, isRetrying, onRetry }) {
  if (notFound) return <NotificationNotFound appId={appId} />;
  if (error || !notification) {
    return <NotificationLoadError appId={appId} message={error} isRetrying={isRetrying} onRetry={onRetry} />;
  }

  const event = notification.event;
  const eventDetailsUrl = event?.id
    ? `/dashboard/${encodeURIComponent(appId)}/events/${encodeURIComponent(event.id)}`
    : `/dashboard/${encodeURIComponent(appId)}/events`;
  const deliveryAttempts = Array.isArray(notification.deliveryAttempts) ? notification.deliveryAttempts : [];

  return (
    <div className="min-w-0 space-y-5" aria-labelledby="notification-page-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link to={`/dashboard/${encodeURIComponent(appId)}/events`} className="rounded-sm transition-colors hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">Events</Link>
          <span aria-hidden="true">/</span>
          {event?.id ? (
            <Link to={eventDetailsUrl} className="rounded-sm transition-colors hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">Event Details</Link>
          ) : (
            <span>Event Details</span>
          )}
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-300">Notification</span>
        </nav>
        <Link to={eventDetailsUrl} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-slate-300 transition hover:bg-surface-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
          <ArrowLeft size={14} aria-hidden="true" />Back to Event
        </Link>
      </div>

      <div className="sr-only">
        <h1 id="notification-page-title">Notification details</h1>
      </div>

      <NotificationOverview notification={notification} />
      <DeliveryAttempts attempts={deliveryAttempts} />
      <RelatedEvent appId={appId} event={event} />
    </div>
  );
}
