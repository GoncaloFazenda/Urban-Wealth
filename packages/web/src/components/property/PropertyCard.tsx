'use client';

import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import type { Property } from '@urban-wealth/core';
import { useTranslations } from 'next-intl';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useEffect, useRef } from 'react';

interface PropertyCardProps {
  property: Property;
}

function StatusBadge({ status }: { status: Property['status'] }) {
  const t = useTranslations('PropertyCard');
  const config = {
    open: {
      label: t('open'),
      dot: 'bg-positive-400',
      bg: 'bg-positive-400/10',
      text: 'text-positive-400',
    },
    coming_soon: {
      label: t('comingSoon'),
      dot: 'bg-warning-400',
      bg: 'bg-warning-400/10',
      text: 'text-warning-400',
    },
    funded: {
      label: t('fullyFunded'),
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

function BookmarkButton({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const { watchlistIds, toggle } = useWatchlist();
  const router = useRouter();
  const isSaved = watchlistIds.has(propertyId);
  const [showPopover, setShowPopover] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowPopover(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowPopover(false), 3000);
      return;
    }
    toggle(propertyId);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:bg-black/60 hover:scale-110"
        aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <svg
          className={`h-4 w-4 transition-colors ${isSaved ? 'text-primary-500 fill-primary-500' : 'text-white'}`}
          fill={isSaved ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </button>

      {showPopover && (
        <div
          className="absolute right-0 top-10 z-10 w-max rounded-lg border border-border bg-card shadow-elevated px-3 py-2 text-[12px] font-medium text-foreground animate-fade-in"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <button
            className="text-primary-500 font-semibold hover:text-primary-400 transition-colors"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/login'); }}
          >
            Sign in
          </button>
          {' '}to save properties
        </div>
      )}
    </div>
  );
}

export function PropertyCard({ property }: PropertyCardProps) {
  const t = useTranslations('PropertyCard');

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
        <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
          <BookmarkButton propertyId={property.id} />
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

        {/* Key metrics */}
        <div className="flex items-center gap-4 mb-5 text-[12px] bg-muted-bg p-2.5 rounded-md border border-border/50">
          <div className="flex-1 text-center">
            <div className="text-muted mb-0.5 text-[10px] uppercase font-bold tracking-wider">{t('yield')}</div>
            <div className="font-semibold text-positive-400">{property.annualYield}%</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1 text-center">
            <div className="text-muted mb-0.5 text-[10px] uppercase font-bold tracking-wider">{t('growth')}</div>
            <div className="font-semibold text-foreground/80">{property.projectedAppreciation}%</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1 text-center">
            <div className="text-muted mb-0.5 text-[10px] uppercase font-bold tracking-wider">{t('total')}</div>
            <div className="font-bold text-foreground">
              {(property.annualYield + property.projectedAppreciation).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Funded progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-primary-500">{t('funded', { value: parseFloat(property.funded.toFixed(2)) })}</span>
            <span className="text-[11px] font-medium text-muted">
              {t('sharesLeft', { count: property.availableShares.toLocaleString() })}
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
