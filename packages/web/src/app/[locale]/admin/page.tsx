'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SummaryCard } from '../dashboard/_components/SummaryCard';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { Link } from '@/i18n/navigation';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalInvestments: number;
  totalVolume: number;
  totalFees: number;
  recentInvestments: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    propertyTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

interface DistributionResult {
  month: string;
  investmentsProcessed: number;
  payoutsCreated: number;
  skipped: number;
  totalDistributed: number;
}

export default function AdminDashboard() {
  const t = useTranslations('Admin');
  const [distributionResult, setDistributionResult] = useState<DistributionResult | null>(null);

  const distributeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/distribute-yields', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Distribution failed');
      }
      return res.json() as Promise<DistributionResult>;
    },
    onSuccess: (data) => setDistributionResult(data),
  });

  const { data, isLoading, isError, refetch } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState title={t('errorLoading')} onRetry={() => refetch()} />;

  return (
    <div className="max-w-5xl">
      <div className="mb-8 animate-enter-sm">
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('overviewTitle')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">{t('overviewSubtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-enter-sm-delay-1">
        <SummaryCard label={t('statUsers')} value={String(data?.totalUsers ?? 0)} />
        <SummaryCard label={t('statProperties')} value={String(data?.totalProperties ?? 0)} />
        <SummaryCard label={t('statInvestments')} value={String(data?.totalInvestments ?? 0)} />
        <SummaryCard
          label={t('statVolume')}
          value={`€${(data?.totalVolume ?? 0).toLocaleString()}`}
          positive
        />
      </div>

      {/* Platform Revenue */}
      <div className="mb-12 animate-enter-sm-delay-2">
        <SummaryCard
          label={t('statFees')}
          value={`€${(data?.totalFees ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          positive
        />
      </div>

      {/* Yield Distribution */}
      <div className="mb-12 animate-enter-sm-delay-2">
        <h2 className="text-[18px] font-display font-bold text-foreground mb-4">
          {t('distributionTitle')}
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[14px] text-foreground font-medium">{t('distributionDescription')}</p>
              <p className="text-[12px] text-muted mt-1">{t('distributionHint')}</p>
            </div>
            <button
              onClick={() => distributeMutation.mutate()}
              disabled={distributeMutation.isPending}
              className="rounded-md bg-primary-500 px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
            >
              {distributeMutation.isPending ? t('distributionRunning') : t('distributionButton')}
            </button>
          </div>

          {distributeMutation.isError && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-[13px] text-red-500 font-medium">
              {distributeMutation.error.message}
            </div>
          )}

          {distributionResult && (
            <div className="mt-4 rounded-lg bg-positive-400/10 border border-positive-400/20 px-4 py-3">
              <p className="text-[13px] text-positive-400 font-semibold mb-1">
                {t('distributionSuccess', { month: distributionResult.month })}
              </p>
              <p className="text-[12px] text-muted">
                {t('distributionDetails', {
                  processed: distributionResult.investmentsProcessed,
                  created: distributionResult.payoutsCreated,
                  skipped: distributionResult.skipped,
                  total: distributionResult.totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {data?.recentInvestments && data.recentInvestments.length > 0 && (
        <div className="animate-enter-sm-delay-3">
          <h2 className="text-[18px] font-display font-bold text-foreground mb-4">
            {t('recentActivity')}
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted-bg">
                  <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thDate')}</th>
                  <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thUser')}</th>
                  <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thProperty')}</th>
                  <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thAmount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentInvestments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3.5 text-muted font-medium">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/users/${inv.userId}`} className="text-foreground font-semibold hover:text-primary-500 transition-colors">{inv.userName}</Link>
                      <p className="text-[11px] text-muted">{inv.userEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-foreground font-medium">{inv.propertyTitle}</td>
                    <td className="px-5 py-3.5 text-right text-foreground font-bold">
                      €{inv.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
