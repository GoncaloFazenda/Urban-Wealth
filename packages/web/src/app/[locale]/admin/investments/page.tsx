'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';

interface AdminInvestment {
  id: string;
  userName: string;
  userEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  amount: number;
  ownershipPercentage: number;
  platformFee: number;
  status: string;
  createdAt: string;
}

export default function AdminInvestmentsPage() {
  const t = useTranslations('Admin');

  const { data, isLoading, isError, refetch } = useQuery<{ investments: AdminInvestment[] }>({
    queryKey: ['admin-investments'],
    queryFn: async () => {
      const res = await fetch('/api/admin/investments', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState title={t('errorLoading')} onRetry={() => refetch()} />;

  const totalVolume = data?.investments.reduce((sum, inv) => sum + inv.amount, 0) ?? 0;

  return (
    <div className="max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('investmentsTitle')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {t('investmentsSubtitle', {
            count: data?.investments.length ?? 0,
            volume: totalVolume.toLocaleString(),
          })}
        </p>
      </motion.div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted-bg">
              <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thDate')}</th>
              <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thUser')}</th>
              <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thProperty')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thAmount')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thEquity')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thFee')}</th>
              <th className="px-5 py-3 text-center font-bold text-muted uppercase tracking-wider text-[11px]">{t('thStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.investments.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="px-5 py-3.5 text-muted font-medium">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-foreground font-semibold">{inv.userName}</p>
                  <p className="text-[11px] text-muted">{inv.userEmail}</p>
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
                <td className="px-5 py-3.5 text-right text-muted font-medium">
                  €{inv.platformFee.toFixed(2)}
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
    </div>
  );
}
