'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { SummaryCard } from '../dashboard/_components/SummaryCard';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalInvestments: number;
  totalVolume: number;
  totalFees: number;
  recentInvestments: Array<{
    id: string;
    userName: string;
    userEmail: string;
    propertyTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const t = useTranslations('Admin');

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
                      <p className="text-foreground font-semibold">{inv.userName}</p>
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
