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
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

/* ===== Status Badge ===== */
function StatusBadge({ status }: { status: Property['status'] }) {
  const config = {
    open: { label: 'Funding Open', dot: 'bg-positive-400', text: 'text-positive-400', bg: 'bg-positive-400/10' },
    coming_soon: { label: 'Coming Soon', dot: 'bg-warning-400', text: 'text-warning-400', bg: 'bg-warning-400/10' },
    funded: { label: 'Fully Funded', dot: 'bg-muted', text: 'text-muted', bg: 'bg-muted-bg' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase ${c.bg} ${c.text} border border-border/50`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ===== Risk Disclaimer ===== */
function RiskDisclaimer() {
  return (
    <div className="rounded-md border border-warning-400/20 bg-warning-400/5 px-4 py-3 mt-4">
      <p className="text-[12px] leading-relaxed text-muted">
        <span className="font-semibold text-warning-400">Risk notice:</span>{' '}
        Investing involves risk including possible loss of principal. Past performance is not indicative of future results. This is a simulated environment.
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6 shadow-card"
    >
      <h3 className="text-[18px] font-display font-bold text-foreground mb-6 tracking-tight">Investment Projection</h3>

      <div className="mb-6">
        <label className="mb-2 block text-[13px] font-semibold text-muted uppercase tracking-wider">
          Investment Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">€</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            max={remaining}
            className="input-field pl-8 text-[18px] font-semibold py-3"
            placeholder="5,000"
          />
        </div>
        <p className="mt-2 text-[12px] text-muted font-medium">
          Available capacity: €{remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>

      <AnimatePresence>
        {num > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 space-y-3 overflow-hidden"
          >
            <CalcRow label="Implied Ownership" value={`${ownership.toFixed(2)}%`} />
            <CalcRow label="Projected Annual Income" value={`€${annualIncome.toFixed(0)}`} positive />
            <CalcRow label="Projected Appreciation" value={`€${appreciation.toFixed(0)}`} positive />
            <CalcRow label="Platform Fee (1.5%)" value={`€${fee.toFixed(0)}`} />
            <div className="border-t border-border pt-4 mt-4">
              <CalcRow label="Total Annual Return" value={`€${(annualIncome + appreciation).toFixed(0)}`} bold />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RiskDisclaimer />

      <button
        onClick={() => onInvest(num)}
        disabled={!isValid || property.status !== 'open'}
        className="mt-6 w-full rounded-md bg-primary-500 px-4 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {property.status !== 'open' ? 'Currently Unavailable' : 'Review & Invest'}
      </button>
    </motion.div>
  );
}

function CalcRow({ label, value, positive = false, bold = false }: { label: string; value: string; positive?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${bold ? 'font-bold text-foreground' : 'font-medium text-muted'}`}>{label}</span>
      <span className={`text-[13px] font-semibold ${bold ? 'text-foreground text-[16px]' : positive ? 'text-positive-400' : 'text-foreground'}`}>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-modal animate-scale-in">
        <h3 className="text-[20px] font-display font-bold text-foreground mb-6">Confirm Allocation</h3>

        <div className="space-y-3 mb-6 bg-muted-bg p-4 rounded-lg border border-border">
          <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">Asset</span><span className="text-[14px] text-foreground font-semibold max-w-[200px] text-right truncate">{property.title}</span></div>
          <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">Capital</span><span className="text-[15px] text-foreground font-bold">€{amount.toLocaleString()}</span></div>
          <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">Equity</span><span className="text-[13px] text-foreground font-semibold">{ownership.toFixed(2)}%</span></div>
          <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">Est. annual income</span><span className="text-[13px] text-positive-400 font-semibold">€{annualIncome.toFixed(0)}</span></div>
          <div className="flex justify-between items-center"><span className="text-[13px] font-medium text-muted">Est. appreciation</span><span className="text-[13px] text-positive-400 font-semibold">€{appreciation.toFixed(0)}</span></div>
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-border"><span className="text-[13px] font-bold text-muted">Sourcing fee</span><span className="text-[13px] text-foreground font-semibold">€{fee.toFixed(0)}</span></div>
        </div>

        <RiskDisclaimer />

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-border py-3 text-[14px] font-semibold text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-primary-500 py-3 text-[14px] font-bold text-white transition-colors hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? 'Processing…' : 'Finalize Investment'}
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
      setToast(`Successfully allocated €${investAmount.toLocaleString()}`);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setIsInvesting(false);
    }
  };

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><PropertyDetailSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState onRetry={() => refetch()} /></div>;
  if (!data?.property) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState title="Property not found" /></div>;

  const p = data.property;
  const totalReturn = p.annualYield + p.projectedAppreciation;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 pb-20">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-foreground transition-colors mb-6 group">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Portfolio
      </Link>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] rounded-full bg-positive-400/90 backdrop-blur-md border border-positive-400 px-6 py-3 text-[14px] font-bold text-white shadow-elevated flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image gallery */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid gap-2 rounded-2xl overflow-hidden mb-10 h-[300px] sm:h-[400px] lg:h-[500px] grid-cols-3 bg-muted-bg"
      >
        {p.photoUrls.slice(0, 3).map((url, i) => (
          <div key={i} className={`relative overflow-hidden ${i === 0 ? 'col-span-2' : ''} bg-muted-bg group`}>
            <Image 
              src={url} 
              alt={`${p.title} — ${i + 1}`} 
              fill 
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" 
              sizes={i === 0 ? '66vw' : '33vw'} 
              priority={i === 0} 
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        ))}
      </motion.div>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Left — details */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <StatusBadge status={p.status} />
            <div className="flex items-center gap-1 text-[13px] font-medium text-muted">
              <MapPin className="w-3.5 h-3.5" /> {p.location}
            </div>
          </div>

          <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-foreground tracking-tight mb-2 leading-tight">
            {p.title}
          </h1>
          <p className="text-[24px] font-display font-bold text-primary-500 tracking-tight mb-8">
            €{p.totalValue.toLocaleString()}
          </p>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-10">
            <p className="text-[15px] leading-relaxed text-muted font-medium">
              {p.description}
            </p>
          </div>

          <h3 className="text-[18px] font-display font-bold text-foreground mb-4">Financial Overview</h3>
          
          {/* Financial metrics — clean table style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border mb-10">
            <Metric label="Target Yield" value={`${p.annualYield}%`} positive />
            <Metric label="Est. Growth" value={`${p.projectedAppreciation}%`} />
            <Metric label="Total Return" value={`${totalReturn.toFixed(1)}%`} positive />
            <Metric label="Platform Fee" value="1.5%" />
          </div>

          {/* Funding progress */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-bold text-foreground tracking-tight">Funding Status</span>
              <span className="text-[16px] font-display font-bold text-primary-500">{p.funded}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted-bg border border-border/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(p.funded, 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                className="h-full rounded-full bg-primary-500 shadow-[0_0_10px_rgba(var(--color-primary-500),0.5)]"
              />
            </div>
            <p className="mt-3 text-[13px] font-medium text-muted">
              <span className="text-foreground font-bold">{p.availableShares.toLocaleString()}</span> shares remaining
            </p>
          </div>
        </motion.div>

        {/* Right — calculator (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <InvestmentCalculator property={p} onInvest={handleInvest} />
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ConfirmModal
            property={p}
            amount={investAmount}
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirm}
            isSubmitting={isInvesting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-card p-5 text-center transition-colors hover:bg-surface-hover">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">{label}</p>
      <p className={`text-[20px] font-display font-bold tracking-tight ${positive ? 'text-positive-400' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
