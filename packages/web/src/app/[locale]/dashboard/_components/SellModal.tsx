'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Holding {
  propertyId: string;
  propertyTitle: string;
  amount: number;
  ownershipPercentage: number;
}

interface SellModalProps {
  holding: Holding;
  onClose: () => void;
  onSuccess: () => void;
  investmentId: string;
}

export function SellModal({ holding, onClose, onSuccess, investmentId }: SellModalProps) {
  const t = useTranslations('SellModal');
  const queryClient = useQueryClient();
  const [sellAmount, setSellAmount] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = parseFloat(sellAmount) || 0;
  const price = parseFloat(askPrice) || 0;

  const fairValue = useMemo(() => {
    if (!amount || !holding.amount) return 0;
    return amount; // 1:1 fair value is the invested amount itself
  }, [amount, holding.amount]);

  const priceDiff = useMemo(() => {
    if (!fairValue || !price) return 0;
    return ((price - fairValue) / fairValue) * 100;
  }, [fairValue, price]);

  const platformFee = price * 0.015;
  const netProceeds = price - platformFee;
  const isValidAmount = amount > 0 && amount <= holding.amount;
  const isValidPrice = price > 0;
  const canSubmit = isValidAmount && isValidPrice && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId,
          sharesAmount: amount,
          askPrice: price,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create listing');
      }
      await queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-modal p-6 animate-fade-in">
        <h2 className="font-display text-[20px] font-bold text-foreground mb-1">
          {t('title')}
        </h2>

        {/* Current position */}
        <div className="rounded-lg bg-muted-bg border border-border p-3 mb-5 mt-3">
          <p className="text-[13px] font-semibold text-foreground mb-1">{holding.propertyTitle}</p>
          <div className="flex gap-4 text-[12px] text-muted">
            <span>{t('ownership', { value: holding.ownershipPercentage.toFixed(2) })}</span>
            <span>{t('invested', { value: holding.amount.toLocaleString() })}</span>
          </div>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            {t('amountLabel')}
          </label>
          <input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            placeholder={t('amountPlaceholder')}
            max={holding.amount}
            step="0.01"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-[14px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
          {amount > holding.amount && (
            <p className="text-[12px] text-red-500 mt-1">{t('exceeds')}</p>
          )}
          <p className="text-[12px] text-muted mt-1">
            {t('available', { value: holding.amount.toLocaleString() })}
          </p>
        </div>

        {/* Ask price input */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            {t('askPriceLabel')}
          </label>
          <input
            type="number"
            value={askPrice}
            onChange={(e) => setAskPrice(e.target.value)}
            placeholder={t('askPricePlaceholder')}
            step="0.01"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-[14px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
          {fairValue > 0 && (
            <p className="text-[12px] text-muted mt-1">
              {t('fairValue', { value: fairValue.toLocaleString() })}
              {price > 0 && Math.abs(priceDiff) > 0.5 && (
                <span className={`ml-2 font-semibold ${priceDiff > 0 ? 'text-warning-400' : 'text-positive-400'}`}>
                  {priceDiff > 0
                    ? t('premiumIndicator', { value: priceDiff.toFixed(1) })
                    : t('discountIndicator', { value: Math.abs(priceDiff).toFixed(1) })}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Fee preview */}
        {isValidPrice && (
          <div className="space-y-2 rounded-lg bg-muted-bg border border-border p-3 mb-5">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted">{t('platformFee')}</span>
              <span className="font-semibold text-muted">-€{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] border-t border-border pt-2">
              <span className="font-semibold text-foreground">{t('netProceeds')}</span>
              <span className="font-bold text-positive-400">€{netProceeds.toFixed(2)}</span>
            </div>
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-md bg-primary-500 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? t('listing') : t('listForSale')}
          </button>
        </div>
      </div>
    </div>
  );
}
