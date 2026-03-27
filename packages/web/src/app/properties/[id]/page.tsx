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

function RiskDisclaimer() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
      <div className="flex gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.07 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xs leading-relaxed text-amber-400/80">
          Investing in real estate involves risk, including the possible loss
          of principal. Past performance is not indicative of future results.
          Urban Wealth is a simulated platform — no real investments are made.
        </p>
      </div>
    </div>
  );
}

function InvestmentCalculator({
  property,
  onInvest,
}: {
  property: Property;
  onInvest: (amount: number) => void;
}) {
  const [amount, setAmount] = useState<string>('');
  const numAmount = parseFloat(amount) || 0;

  const remainingValue =
    property.totalValue * ((100 - property.funded) / 100);
  const ownership = numAmount > 0 ? (numAmount / property.totalValue) * 100 : 0;
  const annualIncome =
    property.totalValue *
    (property.annualYield / 100) *
    (ownership / 100);
  const appreciationGain =
    property.totalValue *
    (property.projectedAppreciation / 100) *
    (ownership / 100);
  const fee = numAmount * PLATFORM_FEE_RATE;
  const isValid = numAmount > 0 && numAmount <= remainingValue;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-800 p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-white">
        Investment Calculator
      </h3>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm text-white/50">
          Investment Amount (€)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          max={remainingValue}
          className="w-full rounded-lg border border-white/10 bg-surface-700 px-4 py-3 text-lg font-semibold text-white placeholder-white/20 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
          placeholder="e.g. 5000"
        />
        <p className="mt-1 text-xs text-white/30">
          Max: €{remainingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>

      {numAmount > 0 && (
        <div className="mb-5 space-y-3 animate-fade-in">
          <CalcRow label="Ownership" value={`${ownership.toFixed(2)}%`} />
          <CalcRow
            label="Est. Annual Income"
            value={`€${annualIncome.toFixed(2)}`}
            accent
          />
          <CalcRow
            label="Est. Appreciation Gain"
            value={`€${appreciationGain.toFixed(2)}`}
            accent
          />
          <CalcRow
            label="Platform Fee (1.5%)"
            value={`€${fee.toFixed(2)}`}
          />
          <div className="border-t border-white/5 pt-3">
            <CalcRow
              label="Total Annual Return"
              value={`€${(annualIncome + appreciationGain).toFixed(2)}`}
              bold
            />
          </div>
        </div>
      )}

      <RiskDisclaimer />

      <button
        onClick={() => onInvest(numAmount)}
        disabled={!isValid || property.status !== 'open'}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/40 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {property.status !== 'open'
          ? 'Not Available for Investment'
          : 'Invest Now'}
      </button>
    </div>
  );
}

function CalcRow({
  label,
  value,
  accent = false,
  bold = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${bold ? 'font-semibold text-white' : 'text-white/50'}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          bold
            ? 'text-gold-400 text-base font-bold'
            : accent
              ? 'text-accent-400'
              : 'text-white/70'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InvestmentModal({
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
  const annualIncome =
    property.totalValue *
    (property.annualYield / 100) *
    (ownership / 100);
  const appreciationGain =
    property.totalValue *
    (property.projectedAppreciation / 100) *
    (ownership / 100);
  const fee = amount * PLATFORM_FEE_RATE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-800 p-6 animate-scale-in">
        <h3 className="mb-4 font-display text-xl font-bold text-white">
          Confirm Investment
        </h3>

        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Property</span>
            <span className="text-white font-medium">{property.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Amount</span>
            <span className="text-white font-medium">
              €{amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Ownership</span>
            <span className="text-primary-400 font-medium">
              {ownership.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Est. Annual Income</span>
            <span className="text-accent-400 font-medium">
              €{annualIncome.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Est. Appreciation</span>
            <span className="text-accent-400 font-medium">
              €{appreciationGain.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Platform Fee</span>
            <span className="text-white/70 font-medium">
              €{fee.toFixed(2)}
            </span>
          </div>
        </div>

        <RiskDisclaimer />

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Investment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [investAmount, setInvestAmount] = useState(0);
  const [isInvesting, setIsInvesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<{
    property: Property;
  }>({
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

  const handleConfirmInvest = async () => {
    setIsInvesting(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: params.id,
          amount: investAmount,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error ?? 'Investment failed');
      }

      setShowModal(false);
      setSuccessMessage(
        `Successfully invested €${investAmount.toLocaleString()}!`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Investment failed'
      );
    } finally {
      setIsInvesting(false);
    }
  };

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-8"><PropertyDetailSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-6xl px-4 py-8"><ErrorState onRetry={() => refetch()} /></div>;
  if (!data?.property) return <div className="mx-auto max-w-6xl px-4 py-8"><ErrorState title="Property not found" /></div>;

  const property = data.property;
  const totalReturn = property.annualYield + property.projectedAppreciation;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Success toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-accent-500/20 border border-accent-500/30 px-5 py-3 text-sm font-medium text-accent-400 shadow-lg animate-slide-up">
          ✅ {successMessage}
        </div>
      )}

      {/* Hero image gallery */}
      <div className="grid gap-2 rounded-2xl overflow-hidden mb-8 h-[300px] sm:h-[400px] lg:h-[450px] grid-cols-3">
        {property.photoUrls.slice(0, 3).map((url, i) => (
          <div
            key={i}
            className={`relative ${i === 0 ? 'col-span-2 row-span-1' : ''} overflow-hidden`}
          >
            <Image
              src={url}
              alt={`${property.title} - Photo ${i + 1}`}
              fill
              className="object-cover"
              sizes={i === 0 ? '66vw' : '33vw'}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — details */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <StatusBadge status={property.status} />
            <span className="text-sm text-white/40">{property.location}</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-2">
            {property.title}
          </h1>
          <p className="text-2xl font-semibold text-primary-400 mb-6">
            €{property.totalValue.toLocaleString()}
          </p>

          <p className="text-sm leading-relaxed text-white/60 mb-8">
            {property.description}
          </p>

          {/* Financials grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <FinancialCard
              label="Annual Yield"
              value={`${property.annualYield}%`}
              color="text-accent-400"
            />
            <FinancialCard
              label="Appreciation"
              value={`${property.projectedAppreciation}%`}
              color="text-primary-400"
            />
            <FinancialCard
              label="Total Return"
              value={`${totalReturn.toFixed(1)}%`}
              color="text-gold-400"
            />
            <FinancialCard
              label="Platform Fee"
              value="1.5%"
              color="text-white/60"
            />
          </div>

          {/* Funded progress */}
          <div className="rounded-xl border border-white/5 bg-surface-800 p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                Funding Progress
              </span>
              <span className="text-sm font-bold text-primary-400">
                {property.funded}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700"
                style={{ width: `${Math.min(property.funded, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/30">
              {property.availableShares.toLocaleString()} shares remaining
            </p>
          </div>
        </div>

        {/* Right column — calculator */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <InvestmentCalculator
            property={property}
            onInvest={handleInvest}
          />
        </div>
      </div>

      {/* Investment modal */}
      {showModal && (
        <InvestmentModal
          property={property}
          amount={investAmount}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmInvest}
          isSubmitting={isInvesting}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Property['status'] }) {
  const config = {
    open: { label: '🟢 Open', cls: 'bg-status-open/15 text-status-open' },
    coming_soon: {
      label: '🟡 Coming Soon',
      cls: 'bg-status-coming/15 text-status-coming',
    },
    funded: {
      label: '🔴 Funded',
      cls: 'bg-status-funded/15 text-status-funded',
    },
  };
  const c = config[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}

function FinancialCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-800 p-4 text-center">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
