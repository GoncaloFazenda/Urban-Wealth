'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface ListingItem {
  id: string;
  propertyId: string;
  sharesAmount: number;
  ownershipPct: number;
  askPrice: number;
  propertyTitle: string;
  propertyTotalValue: number;
}

interface PurchaseModalProps {
  listing: ListingItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function PurchaseModal({ listing, onClose, onSuccess }: PurchaseModalProps) {
  const t = useTranslations('Marketplace');
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch wallet balance
  const { data: earnings } = useQuery<{ balance: number }>({
    queryKey: ['earnings-balance'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/earnings');
      if (!res.ok) return { balance: 0 };
      return res.json();
    },
  });

  const balance = earnings?.balance ?? 0;
  const hasEnough = balance >= listing.askPrice;

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/marketplace/${listing.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to complete purchase');
      }
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['earnings-balance'] });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-modal p-6 animate-fade-in">
        <h2 className="font-display text-[20px] font-bold text-foreground mb-4">
          {t('confirmPurchaseTitle')}
        </h2>

        <p className="text-[14px] text-muted mb-6 leading-relaxed">
          {t('confirmPurchaseMessage', {
            ownership: listing.ownershipPct.toFixed(2),
            property: listing.propertyTitle,
            price: listing.askPrice.toLocaleString(),
          })}
        </p>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">{t('askPrice')}</span>
            <span className="font-bold text-foreground">€{listing.askPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">{t('walletBalance')}</span>
            <span className={`font-bold ${hasEnough ? 'text-positive-400' : 'text-red-500'}`}>
              €{balance.toLocaleString()}
            </span>
          </div>
        </div>

        {!hasEnough && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4 text-[13px] text-red-500 font-medium">
            {t('insufficientBalance', {
              needed: listing.askPrice.toLocaleString(),
              available: balance.toLocaleString(),
            })}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4 text-[13px] text-red-500 font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-border py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-hover"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || !hasEnough}
            className="flex-1 rounded-md bg-primary-500 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? t('processing') : t('confirmBuy')}
          </button>
        </div>
      </div>
    </div>
  );
}
