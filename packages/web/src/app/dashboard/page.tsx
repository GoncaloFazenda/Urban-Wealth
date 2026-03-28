'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { motion } from 'framer-motion';
import { SummaryCard } from './_components/SummaryCard';

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

  if (isLoading) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><DashboardSkeleton /></div>;
  if (isError) return <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12"><ErrorState title="Failed to load dashboard" onRetry={() => refetch()} /></div>;

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
          Portfolio Overview
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          Welcome back, <span className="font-semibold text-foreground">{user?.fullName?.split(' ')[0]}</span>. Here's a summary of your holdings.
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3 mb-12"
      >
        <SummaryCard label="Total Invested" value={`€${(data?.totalInvested ?? 0).toLocaleString()}`} />
        <SummaryCard label="Active Properties" value={String(data?.totalProperties ?? 0)} />
        <SummaryCard label="Est. Annual Income" value={`€${(data?.estimatedAnnualIncome ?? 0).toLocaleString()}`} positive />
      </motion.div>

      {/* Investments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {!data?.investments.length ? (
          <EmptyState
            title="No investments yet"
            message="Start building your portfolio by exploring our exclusively curated European properties."
            action={{ label: 'Browse Portfolio', href: '/' }}
          />
        ) : (
          <>
            <h2 className="text-[18px] font-display font-bold text-foreground mb-4">Current Holdings</h2>
            <div className="grid gap-3 mb-12">
              {data.investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate mb-0.5">{inv.propertyTitle ?? 'Property'}</p>
                    <p className="text-[13px] font-medium text-muted">{inv.ownershipPercentage.toFixed(2)}% equity ownership</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-foreground">€{inv.amount.toLocaleString()}</p>
                    <p className="text-[12px] font-semibold text-primary-500 uppercase tracking-widest mt-0.5">{inv.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {data.transactions.length > 0 && (
              <>
                <h2 className="text-[18px] font-display font-bold text-foreground mb-4">Transaction History</h2>
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted-bg">
                        <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">Date</th>
                        <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">Asset</th>
                        <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">Amount</th>
                        <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-surface-hover/50 transition-colors">
                          <td className="px-5 py-3.5 text-muted font-medium">{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-foreground font-semibold">{tx.propertyTitle ?? 'Property'}</td>
                          <td className="px-5 py-3.5 text-right text-foreground font-bold">€{tx.amount.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase ${
                              tx.status === 'Completed' ? 'bg-positive-400/10 text-positive-400 border border-positive-400/20' : 'bg-warning-400/10 text-warning-400 border border-warning-400/20'
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
      </motion.div>
    </div>
  );
}
