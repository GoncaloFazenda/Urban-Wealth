'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { ExternalLink, X, Tag } from 'lucide-react';

interface MyListing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  sharesAmount: number;
  ownershipPct: number;
  askPrice: number;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  trade: { amount: number; platformFee: number; createdAt: string } | null;
}

function StatusPill({ status }: { status: MyListing['status'] }) {
  const styles = {
    active: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
    sold: 'bg-positive-400/10 text-positive-400 border-positive-400/20',
    cancelled: 'bg-muted-bg text-muted border-border',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

const PAGE_SIZE = 5;

export function MyListings() {
  const t = useTranslations('MyListings');
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ listings: MyListing[] }>({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/marketplace/my-listings');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await fetchWithAuth(`/api/marketplace/${id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } finally {
      setCancelling(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-border bg-card skeleton-shimmer" />
        ))}
      </div>
    );
  }

  const listings = data?.listings ?? [];
  if (listings.length === 0) return null;

  const active = listings.filter((l) => l.status === 'active');
  const past = listings.filter((l) => l.status !== 'active');
  const sorted = [...active, ...past];
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-muted" />
        <h2 className="text-[18px] font-display font-bold text-foreground">{t('title')}</h2>
        {active.length > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[11px] font-bold text-white">
            {active.length}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted-bg">
              <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thProperty')}</th>
              <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thAmount')}</th>
              <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">{t('thOwnership')}</th>
              <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{t('thAskPrice')}</th>
              <th className="px-5 py-3 text-center text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">{t('thStatus')}</th>
              <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap hidden md:table-cell">{t('thDate')}</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((listing) => (
              <tr key={listing.id} className={`transition-colors ${listing.status === 'active' ? 'hover:bg-surface-hover/50' : 'opacity-50'}`}>
                <td className="px-5 py-3.5">
                  <Link
                    href={`/properties/${listing.propertyId}`}
                    className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary-500 transition-colors"
                  >
                    <span className="line-clamp-1 max-w-[140px]">{listing.propertyTitle}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-40" />
                  </Link>
                  <p className="text-[11px] text-muted">{listing.propertyLocation}</p>
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-foreground whitespace-nowrap">
                  €{listing.sharesAmount.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-right text-muted hidden sm:table-cell whitespace-nowrap">
                  {listing.ownershipPct.toFixed(2)}%
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-foreground whitespace-nowrap">
                  €{listing.askPrice.toLocaleString()}
                  {listing.status === 'sold' && listing.trade && (
                    <p className="text-[11px] text-positive-400 font-semibold">
                      {t('soldFor', { value: (listing.trade.amount - listing.trade.platformFee).toLocaleString() })}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                  <StatusPill status={listing.status} />
                </td>
                <td className="px-5 py-3.5 text-right text-muted hidden md:table-cell whitespace-nowrap">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-3.5 text-right">
                  {listing.status === 'active' && (
                    <button
                      onClick={() => handleCancel(listing.id)}
                      disabled={cancelling === listing.id}
                      title={t('cancel')}
                      className="p-1.5 rounded-md text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-[12px] text-muted">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
