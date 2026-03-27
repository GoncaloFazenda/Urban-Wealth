'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';

interface DashboardData {
  totalInvested: number;
  totalProperties: number;
  estimatedAnnualIncome: number;
  investments: Array<{
    id: string;
    propertyTitle?: string;
    amount: number;
    ownershipPercentage: number;
    estimatedAnnualIncome: number;
    status: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    propertyTitle?: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load dashboard');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Failed to load dashboard"
          message="We couldn't retrieve your portfolio data."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Here&apos;s your investment portfolio overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <SummaryCard
          title="Total Invested"
          value={`€${(data?.totalInvested ?? 0).toLocaleString()}`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="from-primary-500/20 to-primary-500/5"
          textColor="text-primary-400"
        />
        <SummaryCard
          title="Properties"
          value={String(data?.totalProperties ?? 0)}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
          color="from-accent-500/20 to-accent-500/5"
          textColor="text-accent-400"
        />
        <SummaryCard
          title="Est. Annual Income"
          value={`€${(data?.estimatedAnnualIncome ?? 0).toLocaleString()}`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
          color="from-gold-400/20 to-gold-400/5"
          textColor="text-gold-400"
        />
      </div>

      {/* Investments */}
      {!data?.investments.length ? (
        <EmptyState
          title="No investments yet"
          message="Start building your portfolio by investing in a property."
          action={{ label: 'Browse Properties', href: '/' }}
        />
      ) : (
        <>
          <h2 className="mb-4 font-display text-xl font-semibold text-white">
            Your Investments
          </h2>
          <div className="space-y-3 mb-8">
            {data.investments.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-4 rounded-xl border border-white/5 bg-surface-800 p-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {inv.propertyTitle ?? 'Property'}
                  </p>
                  <p className="text-xs text-white/40">
                    {inv.ownershipPercentage.toFixed(2)}% ownership
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-400">
                    €{inv.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">
                    {inv.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction History */}
          {data.transactions.length > 0 && (
            <>
              <h2 className="mb-4 font-display text-xl font-semibold text-white">
                Transaction History
              </h2>
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Property</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/40">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/40">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5">
                        <td className="px-4 py-3 text-white/60">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {tx.propertyTitle ?? 'Property'}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium">
                          €{tx.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            tx.status === 'Completed'
                              ? 'bg-accent-500/15 text-accent-400'
                              : 'bg-gold-400/15 text-gold-400'
                          }`}>
                            {tx.status}
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
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  textColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-gradient-to-br ${color} p-5`}
    >
      <div className={`mb-3 ${textColor}`}>{icon}</div>
      <p className="text-xs text-white/40 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
