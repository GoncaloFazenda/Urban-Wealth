'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface Listing {
  id: string;
  sellerId: string;
  ownershipPct: number;
  sharesAmount: number;
  askPrice: number;
  pricePerPercent: number;
  propertyTotalValue: number;
}

interface EnrichedListing extends Listing {
  diff: number; // % premium (+) or discount (-)
}

function ValueBadge({ diff }: { diff: number }) {
  const abs = Math.abs(diff);
  if (diff < -0.5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-positive-400/10 border border-positive-400/20 px-2 py-0.5 text-[11px] font-bold text-positive-400">
        <TrendingDown className="w-3 h-3" />
        -{abs.toFixed(1)}%
      </span>
    );
  }
  if (diff > 0.5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning-400/10 border border-warning-400/20 px-2 py-0.5 text-[11px] font-bold text-warning-400">
        <TrendingUp className="w-3 h-3" />
        +{abs.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted-bg border border-border px-2 py-0.5 text-[11px] font-bold text-muted">
      <Minus className="w-3 h-3" />
      Fair
    </span>
  );
}

function OfferRow({
  listing,
  isBest,
  propertyId,
}: {
  listing: EnrichedListing;
  isBest: boolean;
  propertyId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const isOwn = user?.id === listing.sellerId;

  const accentColor =
    listing.diff < -0.5
      ? 'bg-positive-400'
      : listing.diff > 0.5
        ? 'bg-warning-400'
        : 'bg-border';

  const handleBuy = async () => {
    if (!user) {
      router.push(`/login?redirect=/properties/${propertyId}`);
      return;
    }
    setState('loading');
    try {
      const res = await fetchWithAuth(`/api/marketplace/${listing.id}/purchase`, { method: 'POST' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Purchase failed');
      }
      setState('done');
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <div className="relative flex items-center gap-4 px-5 py-4 hover:bg-surface-hover/40 transition-colors">
      {/* Left accent */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${accentColor}`} />

      {/* Stake info */}
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-foreground tabular-nums">
            {listing.ownershipPct.toFixed(2)}% stake
          </span>
          {isBest && (
            <span className="rounded-full bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 text-[10px] font-bold text-primary-500 uppercase tracking-wider">
              Best
            </span>
          )}
        </div>
        <p className="text-[12px] text-muted mt-0.5 tabular-nums">
          €{listing.pricePerPercent.toLocaleString(undefined, { maximumFractionDigits: 0 })} / %
        </p>
      </div>

      {/* Ask price */}
      <div className="text-right hidden sm:block">
        <p className="text-[15px] font-bold text-foreground tabular-nums">
          €{listing.askPrice.toLocaleString()}
        </p>
        <p className="text-[11px] text-muted mt-0.5">ask price</p>
      </div>

      {/* Value vs fair */}
      <div className="hidden md:flex items-center w-24 justify-end">
        <ValueBadge diff={listing.diff} />
      </div>

      {/* Action */}
      <div className="shrink-0">
        {isOwn ? (
          <span className="text-[12px] font-semibold text-muted px-3 py-1.5">Your listing</span>
        ) : state === 'done' ? (
          <span className="text-[12px] font-semibold text-positive-400 px-3 py-1.5">Purchased!</span>
        ) : state === 'error' ? (
          <span className="text-[12px] font-semibold text-red-400 px-3 py-1.5">Failed</span>
        ) : (
          <button
            onClick={handleBuy}
            disabled={state === 'loading'}
            className="rounded-md bg-primary-500 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {state === 'loading' ? '…' : 'Buy'}
          </button>
        )}
      </div>
    </div>
  );
}

export function SecondaryOffers({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ listings: Listing[] }>({
    queryKey: ['marketplace', 'property', propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace?propertyId=${propertyId}`);
      if (!res.ok) return { listings: [] };
      return res.json();
    },
  });

  const offers: EnrichedListing[] = (data?.listings ?? [])
    .map((l) => ({
      ...l,
      diff: l.sharesAmount > 0 ? ((l.askPrice - l.sharesAmount) / l.sharesAmount) * 100 : 0,
    }))
    .sort((a, b) => a.diff - b.diff) // best value (lowest premium / highest discount) first
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="mt-12 space-y-2">
        <div className="h-6 w-48 rounded-lg bg-muted-bg skeleton-shimmer" />
        <div className="h-[200px] rounded-xl border border-border bg-card skeleton-shimmer" />
      </div>
    );
  }

  if (offers.length === 0) return null;

  const totalListings = data?.listings.length ?? 0;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-display font-bold text-foreground">Secondary Market</h3>
          <p className="text-[13px] text-muted mt-0.5">
            {totalListings} offer{totalListings !== 1 ? 's' : ''} available from other investors
          </p>
        </div>
        {totalListings > 5 && (
          <Link
            href={`/marketplace?propertyId=${propertyId}`}
            className="flex items-center gap-1 text-[13px] font-semibold text-primary-500 hover:text-primary-400 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
        {offers.map((listing, idx) => (
          <OfferRow
            key={listing.id}
            listing={listing}
            isBest={idx === 0 && listing.diff <= 0}
            propertyId={propertyId}
          />
        ))}
      </div>

      <p className="mt-2 text-[11px] text-muted px-1">
        Sorted by best value. Fair value is based on original investment cost.
      </p>
    </div>
  );
}
