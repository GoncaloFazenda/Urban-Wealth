'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import type { Property } from '@urban-wealth/core';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyCardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface WatchlistResponse {
  properties: (Property & { savedAt: string })[];
  propertyIds: string[];
}

export function FavoritesTab() {
  const { user } = useAuth();
  const t = useTranslations('Watchlist');

  const { data, isLoading, isError, refetch } = useQuery<WatchlistResponse>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/watchlist');
      if (!res.ok) throw new Error('Failed to load watchlist');
      return res.json();
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState title={t('errorTitle')} onRetry={() => refetch()} />;
  }

  if (!data?.properties.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 border border-primary-500/20">
          <svg className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>
        <h3 className="font-display text-[20px] font-bold text-foreground mb-2">
          {t('emptyTitle')}
        </h3>
        <p className="text-[14px] text-muted max-w-md mx-auto mb-8 leading-relaxed">
          {t('emptyMessage')}
        </p>
        <Link
          href="/properties"
          className="rounded-md bg-primary-500 px-6 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 shadow-md"
        >
          {t('browseProperties')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.properties.map((property, idx) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -50px 0px' }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <PropertyCard property={property} />
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-center text-[13px] font-medium text-muted">
        {t('count', { count: data.properties.length })}
      </p>
    </>
  );
}
