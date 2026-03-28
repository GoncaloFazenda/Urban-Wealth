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
      bg: 'bg-positive-400/10',
      text: 'text-positive-400',
    },
    coming_soon: {
      label: 'Coming Soon',
      dot: 'bg-warning-400',
      bg: 'bg-warning-400/10',
      text: 'text-warning-400',
    },
    funded: {
      label: 'Fully Funded',
      dot: 'bg-muted',
      bg: 'bg-muted-bg',
      text: 'text-muted',
    },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${c.bg} ${c.text} backdrop-blur-md border border-border/50 shadow-sm`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary-500/30 hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted-bg">
        <Image
          src={property.photoUrls[0] ?? ''}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={property.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title + Location */}
        <h3 className="text-[16px] font-bold text-foreground leading-snug line-clamp-1 mb-1">
          {property.title}
        </h3>
        <p className="text-[13px] text-muted mb-4 font-medium">
          {property.location}
        </p>

        {/* Price */}
        <p className="text-[20px] font-display font-bold text-foreground mb-4 tracking-tight">
          €{property.totalValue.toLocaleString()}
        </p>

        {/* Key metrics — clean horizontal row */}
        <div className="flex items-center gap-4 mb-5 text-[12px] bg-muted-bg p-2.5 rounded-md border border-border/50">
          <div className="flex-1 text-center">
            <div className="text-muted mb-0.5 text-[10px] uppercase font-bold tracking-wider">Yield</div>
            <div className="font-semibold text-positive-400">{property.annualYield}%</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1 text-center">
            <div className="text-muted mb-0.5 text-[10px] uppercase font-bold tracking-wider">Growth</div>
            <div className="font-semibold text-foreground/80">{property.projectedAppreciation}%</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1 text-center">
            <div className="text-muted mb-0.5 text-[10px] uppercase font-bold tracking-wider">Total</div>
            <div className="font-bold text-foreground">
              {(property.annualYield + property.projectedAppreciation).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Funded progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-primary-500">{property.funded}% funded</span>
            <span className="text-[11px] font-medium text-muted">
              {property.availableShares.toLocaleString()} shares left
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted-bg border border-border/50">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(property.funded, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
