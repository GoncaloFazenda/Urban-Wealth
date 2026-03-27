import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@urban-wealth/core';

interface PropertyCardProps {
  property: Property;
}

function StatusBadge({ status }: { status: Property['status'] }) {
  const config = {
    open: {
      label: 'Open',
      dot: 'bg-positive-400',
      bg: 'bg-positive-400/[0.08]',
      text: 'text-positive-400',
    },
    coming_soon: {
      label: 'Coming Soon',
      dot: 'bg-warning-400',
      bg: 'bg-warning-400/[0.08]',
      text: 'text-warning-400',
    },
    funded: {
      label: 'Fully Funded',
      dot: 'bg-surface-500',
      bg: 'bg-surface-500/[0.12]',
      text: 'text-surface-400',
    },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`h-[5px] w-[5px] rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl border border-white/[0.06] bg-surface-900 transition-all duration-200 hover:border-white/[0.10] hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-800">
        <Image
          src={property.photoUrls[0] ?? ''}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={property.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title + Location */}
        <h3 className="text-[15px] font-semibold text-white leading-tight line-clamp-1 mb-1">
          {property.title}
        </h3>
        <p className="text-[12px] text-surface-500 mb-3.5">
          {property.location}
        </p>

        {/* Price */}
        <p className="text-[18px] font-semibold text-white mb-3.5 tracking-tight">
          €{property.totalValue.toLocaleString()}
        </p>

        {/* Key metrics — clean horizontal row */}
        <div className="flex items-center gap-4 mb-3.5 text-[12px]">
          <div>
            <span className="text-surface-500">Yield </span>
            <span className="font-semibold text-positive-400">{property.annualYield}%</span>
          </div>
          <div className="h-3 w-px bg-white/[0.06]" />
          <div>
            <span className="text-surface-500">Growth </span>
            <span className="font-semibold text-white/80">{property.projectedAppreciation}%</span>
          </div>
          <div className="h-3 w-px bg-white/[0.06]" />
          <div>
            <span className="text-surface-500">Total </span>
            <span className="font-semibold text-white">
              {(property.annualYield + property.projectedAppreciation).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Funded progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-surface-500">{property.funded}% funded</span>
            <span className="text-[11px] text-surface-600">
              {property.availableShares.toLocaleString()} shares left
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${Math.min(property.funded, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
