export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-800">
      {/* Image skeleton */}
      <div className="aspect-[16/10] skeleton-shimmer" />
      <div className="p-5">
        {/* Status badge */}
        <div className="mb-3 h-6 w-20 rounded-full skeleton-shimmer" />
        {/* Title */}
        <div className="mb-2 h-6 w-3/4 rounded skeleton-shimmer" />
        {/* Location */}
        <div className="mb-4 h-4 w-1/2 rounded skeleton-shimmer" />
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 rounded-lg skeleton-shimmer" />
          <div className="h-12 rounded-lg skeleton-shimmer" />
          <div className="h-12 rounded-lg skeleton-shimmer" />
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Hero image */}
      <div className="aspect-[21/9] rounded-2xl skeleton-shimmer mb-8" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 w-2/3 rounded skeleton-shimmer" />
          <div className="h-5 w-1/3 rounded skeleton-shimmer" />
          <div className="space-y-2 mt-6">
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-80 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-2xl skeleton-shimmer" />
        <div className="h-28 rounded-2xl skeleton-shimmer" />
        <div className="h-28 rounded-2xl skeleton-shimmer" />
      </div>
      {/* Investment list */}
      <div className="space-y-3">
        <div className="h-20 rounded-xl skeleton-shimmer" />
        <div className="h-20 rounded-xl skeleton-shimmer" />
        <div className="h-20 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded skeleton-shimmer" />
        </td>
      ))}
    </tr>
  );
}
