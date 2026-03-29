'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { Property, PropertyStatus, PropertySortField } from '@urban-wealth/core';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyCardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { motion } from 'framer-motion';

interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  locations: string[];
}

export function PropertiesGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('PropertiesPage');
  const tProps = useTranslations('Properties');

  const status = (searchParams.get('status') ?? 'all') as PropertyStatus | 'all';
  const location = searchParams.get('location') ?? '';
  const sort = (searchParams.get('sort') ?? 'newest') as PropertySortField;
  const page = parseInt(searchParams.get('page') ?? '1', 10) || 1;

  const { data, isLoading, isError, refetch } = useQuery<PropertiesResponse>({
    queryKey: ['properties', status, location, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (location) params.set('location', location);
      if (sort) params.set('sort', sort);
      if (page > 1) params.set('page', String(page));
      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
  });

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'newest') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== 'page') params.delete('page');
    router.push(`/properties?${params.toString()}`, { scroll: false });
  };

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    router.push(`/properties?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="font-display text-[32px] sm:text-[38px] font-bold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-[15px] text-muted max-w-2xl">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="mb-8 pb-6 border-b border-border">
        <PropertyFilters
          status={status}
          location={location}
          sort={sort}
          locations={data?.locations ?? []}
          onStatusChange={(s) => updateParams('status', s)}
          onLocationChange={(l) => updateParams('location', l)}
          onSortChange={(s) => updateParams('sort', s)}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={tProps('errorTitle')}
          message={tProps('errorMessage')}
          onRetry={() => refetch()}
        />
      ) : !data?.properties.length ? (
        <EmptyState
          title={tProps('emptyTitle')}
          message={tProps('emptyMessage')}
          action={{ label: tProps('clearFilters'), href: '/properties' }}
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.properties.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[13px] font-medium text-muted">
                {tProps('showing', { count: data.properties.length, total: data.total })}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-md px-3 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-foreground hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('prev')}
                  </button>

                  {buildPageNumbers(page, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-[13px] text-muted">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all ${
                          p === page
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-muted hover:text-foreground hover:bg-surface-hover'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-md px-3 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-foreground hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
