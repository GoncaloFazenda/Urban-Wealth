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
      const res = await fetch('/api/dashboard', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load dashboard');
      return res.json();
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8"><DashboardSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8"><ErrorState title="Failed to load dashboard" onRetry={() => refetch()} /></div>;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-white tracking-tight">
          Portfolio
        </h1>
        <p className="mt-0.5 text-[13px] text-surface-400">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        <SummaryCard label="Total invested" value={`€${(data?.totalInvested ?? 0).toLocaleString()}`} />
        <SummaryCard label="Properties" value={String(data?.totalProperties ?? 0)} />
        <SummaryCard label="Est. annual income" value={`€${(data?.estimatedAnnualIncome ?? 0).toLocaleString()}`} positive />
      </div>

      {/* Investments */}
      {!data?.investments.length ? (
        <EmptyState
          title="No investments yet"
          message="Start building your portfolio by investing in a property."
          action={{ label: 'Browse properties', href: '/' }}
        />
      ) : (
        <>
          <h2 className="text-[14px] font-semibold text-white mb-3">Your investments</h2>
          <div className="space-y-2 mb-8">
            {data.investments.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-surface-900 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{inv.propertyTitle ?? 'Property'}</p>
                  <p className="text-[11px] text-surface-500">{inv.ownershipPercentage.toFixed(2)}% ownership</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-white">€{inv.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-surface-500">{inv.status}</p>
                </div>
              </div>
            ))}
          </div>

          {data.transactions.length > 0 && (
            <>
              <h2 className="text-[14px] font-semibold text-white mb-3">Transactions</h2>
              <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-surface-900">
                      <th className="px-4 py-2.5 text-left font-medium text-surface-500">Date</th>
                      <th className="px-4 py-2.5 text-left font-medium text-surface-500">Property</th>
                      <th className="px-4 py-2.5 text-right font-medium text-surface-500">Amount</th>
                      <th className="px-4 py-2.5 text-right font-medium text-surface-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/[0.04]">
                        <td className="px-4 py-2.5 text-surface-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 text-white">{tx.propertyTitle ?? 'Property'}</td>
                        <td className="px-4 py-2.5 text-right text-white font-medium">€{tx.amount.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            tx.status === 'Completed' ? 'bg-positive-400/[0.08] text-positive-400' : 'bg-warning-400/[0.08] text-warning-400'
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

function SummaryCard({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-900 p-4">
      <p className="text-[11px] font-medium text-surface-500 mb-1">{label}</p>
      <p className={`text-[20px] font-semibold tracking-tight ${positive ? 'text-positive-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
