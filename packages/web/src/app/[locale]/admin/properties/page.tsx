'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

interface AdminProperty {
  id: string;
  title: string;
  location: string;
  totalValue: number;
  funded: number;
  annualYield: number;
  status: string;
  availableShares: number;
  investmentCount: number;
  createdAt: string;
}

const statusLabel: Record<string, string> = {
  open: 'Open',
  coming_soon: 'Coming Soon',
  funded: 'Funded',
};

const statusStyle: Record<string, string> = {
  open: 'bg-positive-400/10 text-positive-400 border-positive-400/20',
  coming_soon: 'bg-warning-400/10 text-warning-400 border-warning-400/20',
  funded: 'bg-muted-bg text-muted border-border',
};

export default function AdminPropertiesPage() {
  const t = useTranslations('Admin');
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminProperty | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ properties: AdminProperty[] }>({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const res = await fetch('/api/admin/properties', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Delete failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setDeleteTarget(null);
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState title={t('errorLoading')} onRetry={() => refetch()} />;

  return (
    <div className="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
            {t('propertiesTitle')}
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            {t('propertiesCount', { count: data?.properties.length ?? 0 })}
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="rounded-md bg-primary-500 px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-primary-400 shadow-sm"
        >
          {t('addProperty')}
        </Link>
      </motion.div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted-bg">
              <th className="px-5 py-3 text-left font-bold text-muted uppercase tracking-wider text-[11px]">{t('thProperty')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thValue')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thYield')}</th>
              <th className="px-5 py-3 text-center font-bold text-muted uppercase tracking-wider text-[11px]">{t('thStatus')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thFunded')}</th>
              <th className="px-5 py-3 text-right font-bold text-muted uppercase tracking-wider text-[11px]">{t('thActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.properties.map((property) => (
              <tr key={property.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-foreground font-semibold">{property.title}</p>
                  <p className="text-[11px] text-muted">{property.location}</p>
                </td>
                <td className="px-5 py-3.5 text-right text-foreground font-bold">
                  €{property.totalValue.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-right text-positive-400 font-semibold">
                  {property.annualYield}%
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase border ${statusStyle[property.status] ?? ''}`}>
                    {statusLabel[property.status] ?? property.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-muted font-medium">
                  {property.funded.toFixed(1)}%
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-primary-500 hover:bg-primary-500/10 transition-colors"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(property)}
                      disabled={property.investmentCount > 0}
                      className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-destructive-400 hover:bg-destructive-400/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={property.investmentCount > 0 ? t('cannotDeleteWithInvestments') : ''}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h3 className="font-display text-[18px] font-bold text-foreground mb-2">
            {t('confirmDelete')}
          </h3>
          <p className="text-[13px] text-muted mb-6">
            {t('confirmDeleteMessage', { title: deleteTarget.title })}
          </p>
          {deleteMutation.isError && (
            <div className="rounded-md bg-destructive-400/10 border border-destructive-400/20 px-4 py-3 text-[13px] font-medium text-destructive-400 mb-4">
              {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Delete failed'}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-md px-4 py-2 text-[13px] font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="rounded-md bg-destructive-400 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-destructive-400/90 disabled:opacity-50"
            >
              {deleteMutation.isPending ? t('deleting') : t('delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
