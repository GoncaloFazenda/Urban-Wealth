'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { SummaryCard } from '../../../dashboard/_components/SummaryCard';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';

interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  walletBalance: number;
  totalInvested: number;
  totalAnnualIncome: number;
  investments: Array<{
    id: string;
    propertyTitle: string;
    propertyLocation: string;
    propertyYield: number;
    amount: number;
    ownershipPercentage: number;
    estimatedAnnualIncome: number;
    status: string;
    yieldStartDate: string | null;
    createdAt: string;
  }>;
}

export default function AdminUserDetailPage() {
  const t = useTranslations('Admin');
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery<{ user: UserDetail }>({
    queryKey: ['admin-user', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${params.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState title={t('errorLoading')} onRetry={() => refetch()} />;

  const user = data?.user;
  if (!user) return null;

  return (
    <div className="max-w-5xl">
      {/* Back Link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('usersTitle')}
      </Link>

      {/* User Header */}
      <div className="mb-8 animate-enter-sm">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover text-xl font-bold text-foreground border border-border">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-[14px] text-muted">{user.email}</p>
          </div>
          <span className="ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase bg-primary-500/10 text-primary-500 border border-primary-500/20">
            {user.role}
          </span>
        </div>
        <p className="text-[12px] text-muted">
          {t('thJoined')}: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10 animate-enter-sm-delay-1">
        <SummaryCard
          label={t('userTotalInvested')}
          value={`€${user.totalInvested.toLocaleString()}`}
        />
        <SummaryCard
          label={t('userAnnualIncome')}
          value={`€${user.totalAnnualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          positive
        />
        <SummaryCard
          label={t('userWalletBalance')}
          value={`€${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          positive
        />
      </div>

      {/* Investments Table */}
      <div className="animate-enter-sm-delay-2">
        <h2 className="text-[18px] font-display font-bold text-foreground mb-4">
          {t('userInvestments')} ({user.investments.length})
        </h2>

        {user.investments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-[14px] text-muted">{t('userNoInvestments')}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted-bg">
                  <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thDate')}</th>
                  <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thProperty')}</th>
                  <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thAmount')}</th>
                  <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thEquity')}</th>
                  <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thYield')}</th>
                  <th className="px-5 py-3 text-center font-bold text-muted uppercase tracking-wider text-[11px]">{t('thStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {user.investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3.5 text-muted font-medium">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-foreground font-medium">{inv.propertyTitle}</p>
                      <p className="text-[11px] text-muted">{inv.propertyLocation}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-foreground font-bold">
                      €{inv.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted font-medium">
                      {inv.ownershipPercentage.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3.5 text-right text-positive-400 font-medium">
                      €{inv.estimatedAnnualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase border ${
                        inv.status === 'completed'
                          ? 'bg-positive-400/10 text-positive-400 border-positive-400/20'
                          : 'bg-warning-400/10 text-warning-400 border-warning-400/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
