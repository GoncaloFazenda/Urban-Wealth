'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { SummaryCard } from './_components/SummaryCard';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const AllocationChart = dynamic(() => import('./_components/AllocationChart').then(m => m.AllocationChart), { ssr: false });
const TimelineChart = dynamic(() => import('./_components/TimelineChart').then(m => m.TimelineChart), { ssr: false });
const YieldChart = dynamic(() => import('./_components/YieldChart').then(m => m.YieldChart), { ssr: false });

interface DashboardData {
  totalInvested: number;
  totalProperties: number;
  estimatedAnnualIncome: number;
  totalAppreciation: number;
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
  analytics: {
    allocation: Array<{ name: string; value: number }>;
    timeline: Array<{ month: string; total: number }>;
    yieldComparison: Array<{
      name: string;
      invested: number;
      annualIncome: number;
      yieldPercent: number;
    }>;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('Dashboard');

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      return res.json();
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><DashboardSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState title={t('errorTitle')} onRetry={() => refetch()} /></div>;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-enter-sm">
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {t('welcomeBack', { name: user?.fullName?.split(' ')[0] ?? '' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-enter-sm-delay-1">
        <SummaryCard label={t('totalInvested')} value={`€${(data?.totalInvested ?? 0).toLocaleString()}`} />
        <SummaryCard label={t('activeProperties')} value={String(data?.totalProperties ?? 0)} />
        <SummaryCard label={t('estAnnualIncome')} value={`€${(data?.estimatedAnnualIncome ?? 0).toLocaleString()}`} positive />
        <SummaryCard label={t('estAppreciation')} value={`€${(data?.totalAppreciation ?? 0).toLocaleString()}`} positive />
      </div>

      {/* Investments */}
      <div className="animate-enter-sm-delay-3">
        {!data?.holdings.length ? (
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/20">
              <svg className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
              </svg>
            </div>
            <h3 className="font-display text-[20px] font-bold text-foreground mb-2">
              {t('noInvestmentsTitle')}
            </h3>
            <p className="text-[14px] text-muted max-w-md mx-auto mb-8 leading-relaxed">
              {t('noInvestmentsMessage')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/properties"
                className="rounded-md bg-primary-500 px-6 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 shadow-md hover:shadow-lg"
              >
                {t('browsePortfolio')}
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-md border border-border px-6 py-2.5 text-[14px] font-semibold text-foreground transition-all hover:bg-surface-hover"
              >
                {t('learnHow')}
              </Link>
            </div>
            {/* Quick steps */}
            <div className="mt-10 pt-8 border-t border-border grid gap-4 sm:grid-cols-3 text-left">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted-bg border border-border text-[13px] font-bold text-muted">1</div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{t('step1Title')}</p>
                  <p className="text-[12px] text-muted">{t('step1Desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted-bg border border-border text-[13px] font-bold text-muted">2</div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{t('step2Title')}</p>
                  <p className="text-[12px] text-muted">{t('step2Desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted-bg border border-border text-[13px] font-bold text-muted">3</div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{t('step3Title')}</p>
                  <p className="text-[12px] text-muted">{t('step3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-[18px] font-display font-bold text-foreground mb-4">{t('currentHoldings')}</h2>
            <div className="grid gap-3 mb-12">
              {data.holdings.map((holding) => (
                <Link
                  key={holding.propertyId}
                  href={`/properties/${holding.propertyId}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate mb-0.5">{holding.propertyTitle}</p>
                    <p className="text-[13px] font-medium text-muted">{t('equityOwnership', { value: holding.ownershipPercentage.toFixed(2) })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-foreground">€{holding.amount.toLocaleString()}</p>
                    <p className="text-[12px] font-semibold text-primary-500 uppercase tracking-widest mt-0.5">{holding.status}</p>
                  </div>
                </Link>
              ))}
            </div>

            {data.investments.length > 0 && (
              <>
                <h2 className="text-[18px] font-display font-bold text-foreground mb-4">{t('transactionHistory')}</h2>
                <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto shadow-sm">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted-bg">
                        <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thDate')}</th>
                        <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thAsset')}</th>
                        <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thAmount')}</th>
                        <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px] whitespace-nowrap">{t('thStatus')}</th>
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

            {/* Analytics */}
            {data.analytics && (
              <div className="mt-12 animate-enter-sm-delay-4">
                <h2 className="text-[18px] font-display font-bold text-foreground mb-4">{t('analyticsTitle')}</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <AllocationChart data={data.analytics.allocation} />
                  <YieldChart data={data.analytics.yieldComparison} />
                  <div className="lg:col-span-2">
                    <TimelineChart data={data.analytics.timeline} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
