export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 py-10 justify-center text-inkMuted">
      <span className="h-4 w-4 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-800/60 p-5 animate-pulse space-y-3">
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
      <div className="h-3 w-full rounded bg-white/5" />
      <div className="h-3 w-3/4 rounded bg-white/5" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="py-14 text-center border border-dashed border-white/15 rounded-xl bg-navy-800/30">
      <p className="text-ink/90 font-medium">{title}</p>
      {hint && <p className="text-inkMuted text-sm mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="py-10 text-center border border-red-400/20 bg-red-500/10 rounded-xl">
      <p className="text-red-300 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm px-4 py-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-500 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}
