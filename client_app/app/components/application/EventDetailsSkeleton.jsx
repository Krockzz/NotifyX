export default function EventDetailsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading event details">
      <div className="h-4 w-36 animate-pulse motion-reduce:animate-none rounded bg-surface-2" />
      <div className="rounded-xl border border-border bg-surface-1 p-5 sm:p-6">
        <div className="h-3 w-32 animate-pulse motion-reduce:animate-none rounded bg-surface-2" />
        <div className="mt-3 h-7 w-64 max-w-full animate-pulse motion-reduce:animate-none rounded bg-surface-2" />
        <div className="mt-3 h-4 w-52 max-w-full animate-pulse motion-reduce:animate-none rounded bg-surface-2" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="h-72 animate-pulse motion-reduce:animate-none rounded-xl border border-border bg-surface-1" />
        <div className="h-72 animate-pulse motion-reduce:animate-none rounded-xl border border-border bg-surface-1" />
      </div>
      <div className="h-56 animate-pulse motion-reduce:animate-none rounded-xl border border-border bg-surface-1" />
    </div>
  );
}

