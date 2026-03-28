export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-surface-900">
      <div className="aspect-[16/10] skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton-shimmer" />
        <div className="h-3 w-1/2 skeleton-shimmer" />
        <div className="h-5 w-1/3 skeleton-shimmer" />
        <div className="h-3 w-full skeleton-shimmer" />
        <div className="h-1 w-full skeleton-shimmer" />
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="aspect-[21/9] rounded-xl skeleton-shimmer" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-8 w-2/3 skeleton-shimmer" />
          <div className="h-4 w-1/4 skeleton-shimmer" />
          <div className="h-6 w-1/3 skeleton-shimmer mt-2" />
          <div className="space-y-2 mt-4">
            <div className="h-3 w-full skeleton-shimmer" />
            <div className="h-3 w-full skeleton-shimmer" />
            <div className="h-3 w-2/3 skeleton-shimmer" />
          </div>
        </div>
        <div className="h-72 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl skeleton-shimmer" />
        <div className="h-24 rounded-xl skeleton-shimmer" />
        <div className="h-24 rounded-xl skeleton-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-16 rounded-lg skeleton-shimmer" />
        <div className="h-16 rounded-lg skeleton-shimmer" />
        <div className="h-16 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 skeleton-shimmer" />
        </td>
      ))}
    </tr>
  );
}
