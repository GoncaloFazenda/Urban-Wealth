'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import type { Property } from '@urban-wealth/core';
import { PLATFORM_FEE_RATE } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { PropertyDetailSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';

/* ===== Status Badge ===== */
function StatusBadge({ status }: { status: Property['status'] }) {
  const config = {
    open: { label: 'Open', dot: 'bg-positive-400', text: 'text-positive-400', bg: 'bg-positive-400/[0.08]' },
    coming_soon: { label: 'Coming Soon', dot: 'bg-warning-400', text: 'text-warning-400', bg: 'bg-warning-400/[0.08]' },
    funded: { label: 'Fully Funded', dot: 'bg-surface-500', text: 'text-surface-400', bg: 'bg-surface-500/[0.12]' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`h-[5px] w-[5px] rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ===== Risk Disclaimer ===== */
function RiskDisclaimer() {
  return (
    <div className="rounded-md border border-warning-400/[0.12] bg-warning-400/[0.04] px-3 py-2.5">
      <p className="text-[11px] leading-relaxed text-warning-500/80">
        <span className="font-medium text-warning-400">Risk notice:</span>{' '}
        Investing involves risk including possible loss of principal. Past performance is not indicative of future results. This is a simulated platform.
      </p>
    </div>
  );
}

/* ===== Investment Calculator ===== */
function InvestmentCalculator({
  property,
  onInvest,
}: {
  property: Property;
  onInvest: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const num = parseFloat(amount) || 0;
  const remaining = property.totalValue * ((100 - property.funded) / 100);
  const ownership = num > 0 ? (num / property.totalValue) * 100 : 0;
  const annualIncome = property.totalValue * (property.annualYield / 100) * (ownership / 100);
  const appreciation = property.totalValue * (property.projectedAppreciation / 100) * (ownership / 100);
  const fee = num * PLATFORM_FEE_RATE;
  const isValid = num > 0 && num <= remaining;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-900 p-5">
      <h3 className="text-[14px] font-semibold text-white mb-4">Investment Calculator</h3>

      <div className="mb-4">
        <label className="mb-1.5 block text-[12px] font-medium text-surface-400">
          Amount (€)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          max={remaining}
          className="input-field text-[16px] font-semibold"
          placeholder="5,000"
        />
        <p className="mt-1 text-[11px] text-surface-600">
          Remaining: €{remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>

      {num > 0 && (
        <div className="mb-4 space-y-2.5 animate-fade-in">
          <CalcRow label="Ownership" value={`${ownership.toFixed(2)}%`} />
          <CalcRow label="Est. annual income" value={`€${annualIncome.toFixed(0)}`} positive />
          <CalcRow label="Est. appreciation" value={`€${appreciation.toFixed(0)}`} positive />
          <CalcRow label="Platform fee (1.5%)" value={`€${fee.toFixed(0)}`} />
          <div className="border-t border-white/[0.06] pt-2.5">
            <CalcRow label="Total annual return" value={`€${(annualIncome + appreciation).toFixed(0)}`} bold />
          </div>
        </div>
      )}

      <RiskDisclaimer />

      <button
        onClick={() => onInvest(num)}
        disabled={!isValid || property.status !== 'open'}
        className="mt-4 w-full rounded-md bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {property.status !== 'open' ? 'Not available' : 'Invest now'}
      </button>
    </div>
  );
}

function CalcRow({ label, value, positive = false, bold = false }: { label: string; value: string; positive?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[12px] ${bold ? 'font-medium text-white' : 'text-surface-400'}`}>{label}</span>
      <span className={`text-[12px] font-medium ${bold ? 'text-white text-[13px] font-semibold' : positive ? 'text-positive-400' : 'text-surface-300'}`}>
        {value}
      </span>
    </div>
  );
}

/* ===== Confirmation Modal ===== */
function ConfirmModal({
  property,
  amount,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  property: Property;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  const ownership = (amount / property.totalValue) * 100;
  const annualIncome = property.totalValue * (property.annualYield / 100) * (ownership / 100);
  const appreciation = property.totalValue * (property.projectedAppreciation / 100) * (ownership / 100);
  const fee = amount * PLATFORM_FEE_RATE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-surface-900 p-5 shadow-modal animate-scale-in">
        <h3 className="text-[16px] font-semibold text-white mb-4">Confirm investment</h3>

        <div className="space-y-2 mb-4 text-[12px]">
          <div className="flex justify-between"><span className="text-surface-400">Property</span><span className="text-white font-medium max-w-[180px] text-right truncate">{property.title}</span></div>
          <div className="flex justify-between"><span className="text-surface-400">Amount</span><span className="text-white font-medium">€{amount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-surface-400">Ownership</span><span className="text-white font-medium">{ownership.toFixed(2)}%</span></div>
          <div className="flex justify-between"><span className="text-surface-400">Est. annual income</span><span className="text-positive-400 font-medium">€{annualIncome.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-surface-400">Est. appreciation</span><span className="text-positive-400 font-medium">€{appreciation.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-surface-400">Platform fee</span><span className="text-surface-300 font-medium">€{fee.toFixed(0)}</span></div>
        </div>

        <RiskDisclaimer />

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-white/[0.08] py-2 text-[13px] font-medium text-surface-300 hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-primary-500 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Page ===== */
export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [investAmount, setInvestAmount] = useState(0);
  const [isInvesting, setIsInvesting] = useState(false);
  const [toast, setToast] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<{ property: Property }>({
    queryKey: ['property', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch property');
      return res.json();
    },
  });

  const handleInvest = (amount: number) => {
    if (!user) {
      router.push(`/login?redirect=/properties/${params.id as string}`);
      return;
    }
    setInvestAmount(amount);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setIsInvesting(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId: params.id, amount: investAmount }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Investment failed');
      }
      setShowModal(false);
      setToast(`Successfully invested €${investAmount.toLocaleString()}`);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setIsInvesting(false);
    }
  };

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8"><PropertyDetailSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8"><ErrorState onRetry={() => refetch()} /></div>;
  if (!data?.property) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8"><ErrorState title="Property not found" /></div>;

  const p = data.property;
  const totalReturn = p.annualYield + p.projectedAppreciation;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 rounded-md bg-positive-400/[0.12] border border-positive-400/[0.2] px-4 py-2.5 text-[13px] font-medium text-positive-400 shadow-elevated animate-slide-up">
          {toast}
        </div>
      )}

      {/* Image grid */}
      <div className="grid gap-1.5 rounded-xl overflow-hidden mb-6 h-[260px] sm:h-[340px] lg:h-[380px] grid-cols-3">
        {p.photoUrls.slice(0, 3).map((url, i) => (
          <div key={i} className={`relative overflow-hidden ${i === 0 ? 'col-span-2' : ''} bg-surface-800`}>
            <Image src={url} alt={`${p.title} — ${i + 1}`} fill className="object-cover" sizes={i === 0 ? '66vw' : '33vw'} priority={i === 0} />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left — details */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <StatusBadge status={p.status} />
            <span className="text-[12px] text-surface-500">{p.location}</span>
          </div>

          <h1 className="font-display text-[24px] sm:text-[28px] font-bold text-white tracking-tight mb-1">
            {p.title}
          </h1>
          <p className="text-[20px] font-semibold text-white/90 tracking-tight mb-5">
            €{p.totalValue.toLocaleString()}
          </p>

          <p className="text-[13px] leading-relaxed text-surface-400 mb-6">
            {p.description}
          </p>

          {/* Financial metrics — clean table style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-white/[0.06] mb-6">
            <Metric label="Annual Yield" value={`${p.annualYield}%`} positive />
            <Metric label="Appreciation" value={`${p.projectedAppreciation}%`} />
            <Metric label="Total Return" value={`${totalReturn.toFixed(1)}%`} positive />
            <Metric label="Platform Fee" value="1.5%" />
          </div>

          {/* Funding progress */}
          <div className="rounded-xl border border-white/[0.06] bg-surface-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-white">Funding progress</span>
              <span className="text-[13px] font-semibold text-white">{p.funded}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${Math.min(p.funded, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-surface-500">
              {p.availableShares.toLocaleString()} shares remaining
            </p>
          </div>
        </div>

        {/* Right — calculator (sticky) */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <InvestmentCalculator property={p} onInvest={handleInvest} />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ConfirmModal
          property={p}
          amount={investAmount}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          isSubmitting={isInvesting}
        />
      )}
    </div>
  );
}

function Metric({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-surface-900 p-3.5 text-center">
      <p className="text-[11px] text-surface-500 mb-0.5">{label}</p>
      <p className={`text-[18px] font-semibold tracking-tight ${positive ? 'text-positive-400' : 'text-white/80'}`}>
        {value}
      </p>
    </div>
  );
}
