export function Loading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-on-surface-variant" role="status">
      <span className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden />
      {label && <span className="text-sm font-medium tracking-wide">{label}</span>}
    </div>
  );
}
