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
  investments: { id: string; amount: number }[];
}

interface SellModalProps {
  holding: Holding;
  onClose: () => void;
  onSuccess: () => void;
}

export function SellModal({ holding, onClose, onSuccess }: SellModalProps) {
  const t = useTranslations('SellModal');
  const queryClient = useQueryClient();
  const [sellAmount, setSellAmount] = useState('');
  const [sellPct, setSellPct] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const maxAmount = holding.amount;
  const maxPct = holding.ownershipPercentage;

  const amount = parseFloat(sellAmount) || 0;
  const pct = parseFloat(sellPct) || 0;
  const price = parseFloat(askPrice) || 0;

  // Keep € and % in sync — whichever was last edited drives the other
  // Single source of truth: fraction 0–1, drives both fields
  const setFraction = (f: number) => {
    const clamped = Math.min(1, Math.max(0, f));
    setSellAmount(clamped > 0 ? (clamped * maxAmount).toFixed(2) : '');
    setSellPct(clamped > 0 ? (clamped * maxPct).toFixed(4) : '');
  };

  const handleAmountChange = (val: string) => {
    setSellAmount(val);
    const n = parseFloat(val) || 0;
    if (maxAmount > 0) setSellPct(n > 0 ? ((n / maxAmount) * maxPct).toFixed(4) : '');
  };

  const handlePctChange = (val: string) => {
    setSellPct(val);
    const n = parseFloat(val) || 0;
    if (maxPct > 0) setSellAmount(n > 0 ? ((n / maxPct) * maxAmount).toFixed(2) : '');
  };

  // Pick the single largest investment that can cover the requested amount,
  // or fall back to the first investment id if listing less than a single position.
  // Split the requested amount across investments (largest first).
  // Returns [{investmentId, sharesAmount, askPrice}] slices — one per investment touched.
  const buildSlices = useMemo(() => {
    if (!amount || !price) return [];
    const sorted = [...holding.investments].sort((a, b) => b.amount - a.amount);
    const slices: { investmentId: string; sharesAmount: number; askPrice: number }[] = [];
    let remaining = amount;
    for (const inv of sorted) {
      if (remaining <= 0) break;
      const take = Math.min(inv.amount, remaining);
      // Pro-rate the ask price proportionally to the amount taken
      const slicePrice = (take / amount) * price;
      slices.push({ investmentId: inv.id, sharesAmount: take, askPrice: slicePrice });
      remaining -= take;
    }
    return slices;
  }, [amount, price, holding.investments]);

  const fairValue = amount; // 1:1
  const priceDiff = fairValue > 0 && price > 0 ? ((price - fairValue) / fairValue) * 100 : 0;
  const platformFee = price * 0.015;
  const netProceeds = price - platformFee;

  const isValidAmount = amount > 0 && amount <= maxAmount;
  const isValidPct = pct > 0 && pct <= maxPct;
  const isValidPrice = price > 0;
  const canSubmit = isValidAmount && isValidPct && isValidPrice && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices: buildSlices,
          // Only assign a groupId when spanning multiple investments so they appear as one listing
          groupId: buildSlices.length > 1 ? crypto.randomUUID() : undefined,
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
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-modal p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-[20px] font-bold text-foreground mb-1">{t('title')}</h2>

        {/* Current position */}
        <div className="rounded-lg bg-muted-bg border border-border p-3 mb-5 mt-3">
          <p className="text-[13px] font-semibold text-foreground mb-1">{holding.propertyTitle}</p>
          <div className="flex gap-4 text-[12px] text-muted">
            <span>{t('ownership', { value: maxPct.toFixed(2) })}</span>
            <span>{t('invested', { value: maxAmount.toLocaleString() })}</span>
          </div>
        </div>

        {/* Amount (€) */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            {t('amountLabel')}
          </label>
          <div className="relative flex items-center gap-2">
            <span className="absolute left-3 text-[13px] text-muted font-semibold pointer-events-none">€</span>
            <input
              type="number"
              value={sellAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={t('amountPlaceholder')}
              max={maxAmount}
              step="0.01"
              className="w-full rounded-md border border-border bg-card pl-7 pr-16 py-2 text-[14px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={() => handleAmountChange(maxAmount.toFixed(2))}
              className="absolute right-2 rounded px-1.5 py-0.5 text-[11px] font-bold text-primary-500 hover:bg-primary-500/10 transition-colors"
            >
              MAX
            </button>
          </div>
          {amount > maxAmount && (
            <p className="text-[12px] text-red-500 mt-1">{t('exceeds')}</p>
          )}
          <p className="text-[12px] text-muted mt-1">{t('available', { value: maxAmount.toLocaleString() })}</p>
        </div>

        {/* Shared slider */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={maxAmount > 0 ? Math.round((amount / maxAmount) * 1000) : 0}
            onChange={(e) => setFraction(parseInt(e.target.value) / 1000)}
            className="w-full accent-primary-500 h-1.5 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Ownership % */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            {t('pctLabel')}
          </label>
          <div className="relative flex items-center gap-2">
            <input
              type="number"
              value={sellPct}
              onChange={(e) => handlePctChange(e.target.value)}
              placeholder="0.00"
              max={maxPct}
              step="0.0001"
              className="w-full rounded-md border border-border bg-card pl-3 pr-16 py-2 text-[14px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            <span className="absolute right-12 text-[13px] text-muted font-semibold pointer-events-none">%</span>
            <button
              type="button"
              onClick={() => handlePctChange(maxPct.toFixed(4))}
              className="absolute right-2 rounded px-1.5 py-0.5 text-[11px] font-bold text-primary-500 hover:bg-primary-500/10 transition-colors"
            >
              MAX
            </button>
          </div>
          <p className="text-[12px] text-muted mt-1">{t('pctAvailable', { value: maxPct.toFixed(2) })}</p>
        </div>
          <div className="border-t-4 border-border my-4 rounded-full" />

        {/* Ask price */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-foreground mb-1.5">
            {t('askPriceLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted font-semibold pointer-events-none">€</span>
            <input
              type="number"
              value={askPrice}
              onChange={(e) => setAskPrice(e.target.value)}
              placeholder={t('askPricePlaceholder')}
              step="0.01"
              className="w-full rounded-md border border-border bg-card pl-7 pr-3 py-2 text-[14px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          {fairValue > 0 && (
            <p className="text-[12px] text-muted mt-1">
              {t('fairValue', { value: fairValue.toLocaleString() })}
              {price > 0 && Math.abs(priceDiff) > 0.5 && (
                <span className={`ml-2 font-semibold ${priceDiff > 0 ? 'text-positive-400' : 'text-red-400' }`}>
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
