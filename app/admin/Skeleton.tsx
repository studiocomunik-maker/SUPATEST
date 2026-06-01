// Skeleton loaders du back-office (blocs gris animés).
// `animate-pulse` est natif Tailwind, pas de CSS custom.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-200 ${className}`} />;
}

// Liste de lignes (menu, événements, réservations, comptes…)
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3"
        >
          <Skeleton className="h-12 w-12 flex-shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grille de vignettes (galerie)
export function SkeletonGrid({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </div>
  );
}

// Formulaire (hero)
export function SkeletonForm() {
  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}
