'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { SummaryCard } from '../dashboard/_components/SummaryCard';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { PayoutHistory } from './_components/PayoutHistory';

interface EarningsData {
  balance: number;
  totalEarned: number;
  history: Array<{
    month: string;
    total: number;
    properties: Array<{ title: string; location: string; amount: number }>;
  }>;
}

export default function EarningsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('Earnings');

  const { data, isLoading, isError, refetch } = useQuery<EarningsData>({
    queryKey: ['earnings'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/earnings');
      if (!res.ok) throw new Error('Failed to load earnings');
      return res.json();
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-muted-bg">
        <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/earnings');
    return null;
  }

  if (isLoading) return <div className="min-h-[calc(100vh-3.5rem)] bg-muted-bg py-12"><div className="mx-auto max-w-4xl px-5 sm:px-6"><DashboardSkeleton /></div></div>;
  if (isError) return <div className="min-h-[calc(100vh-3.5rem)] bg-muted-bg py-12"><div className="mx-auto max-w-4xl px-5 sm:px-6"><ErrorState title={t('errorTitle')} onRetry={() => refetch()} /></div></div>;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted-bg py-12">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <div className="animate-enter">
          <div className="mb-8">
            <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-1 text-[14px] text-muted">{t('subtitle')}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 mb-10 animate-enter-sm-delay-1">
            <SummaryCard
              label={t('walletBalance')}
              value={`€${(data?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              positive
            />
            <SummaryCard
              label={t('totalEarned')}
              value={`€${(data?.totalEarned ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </div>

          {/* Payout History */}
          <PayoutHistory history={data?.history ?? []} />
        </div>
      </div>
    </div>
  );
}
