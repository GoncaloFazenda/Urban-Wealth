'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { ListingCard } from './_components/ListingCard';
import { PurchaseModal } from './_components/PurchaseModal';

interface ListingItem {
  id: string;
  sellerId: string;
  propertyId: string;
  investmentId: string;
  sharesAmount: number;
  ownershipPct: number;
  askPrice: number;
  pricePerPercent: number;
  status: string;
  createdAt: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPhotoUrl: string;
  propertyTotalValue: number;
  propertyAnnualYield: number;
  sellerName: string;
}

export default function MarketplacePage() {
  const t = useTranslations('Marketplace');
  const { user } = useAuth();
  const [sort, setSort] = useState('newest');
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ listings: ListingItem[] }>({
    queryKey: ['marketplace', sort],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace?sort=${sort}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  if (isLoading) return <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12"><DashboardSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12"><ErrorState title={t('errorTitle')} onRetry={() => refetch()} /></div>;

  const listings = data?.listings ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-enter-sm">
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-1 text-[14px] text-muted max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8 animate-enter-sm-delay-1">
        <div className="flex items-center rounded-md border border-border overflow-hidden text-[12px] font-semibold">
          {(['newest', 'price_asc', 'price_desc'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 transition-colors ${
                sort === s
                  ? 'bg-primary-500 text-white'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {s === 'newest' ? t('sortNewest') : s === 'price_asc' ? t('sortPriceLow') : t('sortPriceHigh')}
            </button>
          ))}
        </div>
        {listings.length > 0 && (
          <span className="text-[13px] text-muted">
            {t('showing', { count: listings.length })}
          </span>
        )}
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card animate-enter-sm-delay-2">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/20">
            <svg className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
            </svg>
          </div>
          <h3 className="font-display text-[20px] font-bold text-foreground mb-2">
            {t('emptyTitle')}
          </h3>
          <p className="text-[14px] text-muted max-w-md mx-auto leading-relaxed">
            {t('emptyMessage')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-enter-sm-delay-2">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isOwn={listing.sellerId === user?.id}
              onBuy={() => setSelectedListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {selectedListing && (
        <PurchaseModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={() => {
            setSelectedListing(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
