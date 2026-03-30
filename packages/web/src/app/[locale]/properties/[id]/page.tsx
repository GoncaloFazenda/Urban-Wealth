'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { useState } from 'react';
import type { Property } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { PropertyDetailSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { StatusBadge } from '@/components/property/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronLeft, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { InvestmentCalculator } from './_components/InvestmentCalculator';
import { ConfirmModal } from './_components/ConfirmModal';
import { Metric } from './_components/Metric';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [investAmount, setInvestAmount] = useState(0);
  const [isInvesting, setIsInvesting] = useState(false);
  const [toast, setToast] = useState('');
  const t = useTranslations('PropertyDetail');

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
      setToast(t('successToast', { amount: investAmount.toLocaleString() }));
      setTimeout(() => setToast(''), 4000);

      // Refetch property data so funded %, shares, and capacity update
      refetch();
      // Invalidate listings so they reflect the new funded state
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties-home'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setInvestAmount(0);
      setIsInvesting(false);
    }
  };

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><PropertyDetailSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState onRetry={() => refetch()} /></div>;
  if (!data?.property) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState title={t('propertyNotFound')} /></div>;

  const p = data.property;
  const totalReturn = p.annualYield + p.projectedAppreciation;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 pb-20">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-foreground transition-colors mb-6 group">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> {t('backToPortfolio')}
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

          <h3 className="text-[18px] font-display font-bold text-foreground mb-4">{t('financialOverview')}</h3>

          {/* Financial metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border mb-10">
            <Metric label={t('targetYield')} value={`${p.annualYield}%`} positive />
            <Metric label={t('estGrowth')} value={`${p.projectedAppreciation}%`} />
            <Metric label={t('totalReturn')} value={`${totalReturn.toFixed(1)}%`} positive />
            <Metric label={t('platformFee')} value="1.5%" />
          </div>

          {/* Funding progress */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-bold text-foreground tracking-tight">{t('fundingStatus')}</span>
              <span className="text-[16px] font-display font-bold text-primary-500">{parseFloat(p.funded.toFixed(2))}%</span>
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
              <span className="text-foreground font-bold">{p.availableShares.toLocaleString()}</span> {t('sharesRemaining', { count: '' }).trim()}
            </p>
          </div>
        </motion.div>

        {/* Right — calculator (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <InvestmentCalculator property={p} onInvest={handleInvest}  />
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
