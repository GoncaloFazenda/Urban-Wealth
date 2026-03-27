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
      bg: 'bg-status-open/15',
      text: 'text-status-open',
      dot: 'bg-status-open',
    },
    coming_soon: {
      label: 'Coming Soon',
      bg: 'bg-status-coming/15',
      text: 'text-status-coming',
      dot: 'bg-status-coming',
    },
    funded: {
      label: 'Funded',
      bg: 'bg-status-funded/15',
      text: 'text-status-funded',
      dot: 'bg-status-funded',
    },
  };

  const c = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function PropertyCard({ property }: PropertyCardProps) {
  const totalReturn =
    property.annualYield + property.projectedAppreciation;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group overflow-hidden rounded-2xl border border-white/5 bg-surface-800 transition-all duration-300 hover:border-white/10 hover:shadow-card-hover hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={property.photoUrls[0] ?? ''}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={property.status} />
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="rounded-lg glass px-2.5 py-1 text-xs font-semibold text-white">
            €{property.totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-1 text-base font-semibold text-white line-clamp-1 group-hover:text-primary-300 transition-colors">
          {property.title}
        </h3>
        <p className="mb-4 text-sm text-white/40 flex items-center gap-1">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {property.location}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-white/[0.03] p-2.5 text-center">
            <p className="text-xs text-white/40 mb-0.5">Yield</p>
            <p className="text-sm font-semibold text-accent-400">
              {property.annualYield}%
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2.5 text-center">
            <p className="text-xs text-white/40 mb-0.5">Growth</p>
            <p className="text-sm font-semibold text-primary-400">
              {property.projectedAppreciation}%
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2.5 text-center">
            <p className="text-xs text-white/40 mb-0.5">Total</p>
            <p className="text-sm font-semibold text-gold-400">
              {totalReturn.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Funded progress */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-white/40">Funded</span>
            <span className="text-xs font-medium text-white/60">
              {property.funded}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
              style={{ width: `${Math.min(property.funded, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
