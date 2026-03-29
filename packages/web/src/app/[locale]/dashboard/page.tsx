'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SummaryCard } from './_components/SummaryCard';

interface DashboardData {
  totalInvested: number;
  totalProperties: number;
  estimatedAnnualIncome: number;
  holdings: Array<{
    propertyId: string;
    propertyTitle: string;
    amount: number;
    ownershipPercentage: number;
    estimatedAnnualIncome: number;
    status: string;
  }>;
  investments: Array<{
    id: string;
    propertyTitle?: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('Dashboard');

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load dashboard');
      return res.json();
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><DashboardSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState title={t('errorTitle')} onRetry={() => refetch()} /></div>;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {t('welcomeBack', { name: user?.fullName?.split(' ')[0] ?? '' })}
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3 mb-12"
      >
        <SummaryCard label={t('totalInvested')} value={`€${(data?.totalInvested ?? 0).toLocaleString()}`} />
        <SummaryCard label={t('activeProperties')} value={String(data?.totalProperties ?? 0)} />
        <SummaryCard label={t('estAnnualIncome')} value={`€${(data?.estimatedAnnualIncome ?? 0).toLocaleString()}`} positive />
      </motion.div>

      {/* Investments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {!data?.holdings.length ? (
          <EmptyState
            title={t('noInvestmentsTitle')}
            message={t('noInvestmentsMessage')}
            action={{ label: t('browsePortfolio'), href: '/' }}
          />
        ) : (
          <>
            <h2 className="text-[18px] font-display font-bold text-foreground mb-4">{t('currentHoldings')}</h2>
            <div className="grid gap-3 mb-12">
              {data.holdings.map((holding) => (
                <div key={holding.propertyId} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate mb-0.5">{holding.propertyTitle}</p>
                    <p className="text-[13px] font-medium text-muted">{t('equityOwnership', { value: holding.ownershipPercentage.toFixed(2) })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-foreground">€{holding.amount.toLocaleString()}</p>
                    <p className="text-[12px] font-semibold text-primary-500 uppercase tracking-widest mt-0.5">{holding.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {data.investments.length > 0 && (
              <>
                <h2 className="text-[18px] font-display font-bold text-foreground mb-4">{t('transactionHistory')}</h2>
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted-bg">
                        <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thDate')}</th>
                        <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thAsset')}</th>
                        <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thAmount')}</th>
                        <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thStatus')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.investments.map((inv) => (
                        <tr key={inv.id} className="hover:bg-surface-hover/50 transition-colors">
                          <td className="px-5 py-3.5 text-muted font-medium">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-foreground font-semibold">{inv.propertyTitle ?? 'Property'}</td>
                          <td className="px-5 py-3.5 text-right text-foreground font-bold">€{inv.amount.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase ${
                              inv.status === 'Completed' ? 'bg-positive-400/10 text-positive-400 border border-positive-400/20' : 'bg-warning-400/10 text-warning-400 border border-warning-400/20'
                            }`}>
                              {inv.status === 'Completed' ? t('statusCompleted') : t('statusPending')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
