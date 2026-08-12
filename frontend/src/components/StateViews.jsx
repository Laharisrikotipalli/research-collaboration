export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 py-12 justify-center text-muted font-mono text-xs tracking-wide">
      <span className="animate-softPulse">✦</span>
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="py-16 text-center border border-dashed border-gold/20 rounded-xl bg-panel/40">
      <p className="text-gold/30 text-lg tracking-[0.5em] mb-4">✦ ✦ ✦</p>
      <p className="text-ivory font-display font-medium">{title}</p>
      {hint && <p className="text-muted text-sm mt-1.5 font-sans">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="py-11 text-center border border-rust/30 bg-rust/10 rounded-xl">
      <p className="text-rust font-medium font-sans text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-mono uppercase tracking-wide px-4 py-2 rounded-full bg-rust text-ivory hover:bg-rust/85 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
