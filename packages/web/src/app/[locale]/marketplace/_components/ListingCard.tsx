'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface ListingItem {
  id: string;
  sellerId: string;
  propertyId: string;
  sharesAmount: number;
  ownershipPct: number;
  askPrice: number;
  createdAt: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPhotoUrl: string;
  propertyTotalValue: number;
  propertyAnnualYield: number;
  sellerName: string;
}

interface ListingCardProps {
  listing: ListingItem;
  isOwn: boolean;
  onBuy: () => void;
}

export function ListingCard({ listing, isOwn, onBuy }: ListingCardProps) {
  const t = useTranslations('Marketplace');

  // Calculate premium/discount vs. proportional property value
  const proportionalValue = listing.propertyTotalValue * (listing.ownershipPct / 100);
  const priceDiff = ((listing.askPrice - proportionalValue) / proportionalValue) * 100;
  const isPremium = priceDiff > 0.5;
  const isDiscount = priceDiff < -0.5;

  return (
    <div className="rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden group">
      {/* Property Image */}
      <div className="relative h-36 bg-muted-bg overflow-hidden">
        {listing.propertyPhotoUrl ? (
          <Image
            src={listing.propertyPhotoUrl}
            alt={listing.propertyTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          </div>
        )}
        {/* Ownership badge */}
        <div className="absolute top-2 left-2 rounded-md bg-card/90 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-foreground border border-border/50">
          {t('ownershipLabel', { value: listing.ownershipPct.toFixed(2) })}
        </div>
        {/* Premium/Discount badge */}
        {(isPremium || isDiscount) && (
          <div className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-[11px] font-bold ${
            isPremium
              ? 'bg-warning-400/15 text-warning-400 border border-warning-400/30'
              : 'bg-positive-400/15 text-positive-400 border border-positive-400/30'
          }`}>
            {isPremium
              ? t('premium', { value: priceDiff.toFixed(1) })
              : t('discount', { value: Math.abs(priceDiff).toFixed(1) })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-bold text-foreground truncate mb-0.5">
          {listing.propertyTitle}
        </h3>
        <p className="text-[12px] text-muted mb-3">{listing.propertyLocation}</p>

        <div className="flex justify-between items-baseline mb-3">
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">{t('askPrice')}</p>
            <p className="text-[18px] font-bold text-foreground">€{listing.askPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">{t('annualYield')}</p>
            <p className="text-[15px] font-bold text-positive-400">{listing.propertyAnnualYield}%</p>
          </div>
        </div>

        <p className="text-[11px] text-muted mb-3">
          {t('listedBy', { name: listing.sellerName })}
        </p>

        {isOwn ? (
          <div className="w-full rounded-md border border-border py-2 text-center text-[13px] font-semibold text-muted">
            {t('yourListing')}
          </div>
        ) : (
          <button
            onClick={onBuy}
            className="w-full rounded-md bg-primary-500 py-2 text-[13px] font-bold text-white transition-all hover:bg-primary-400 shadow-sm hover:shadow-md"
          >
            {t('buyNow')}
          </button>
        )}
      </div>
    </div>
  );
}
