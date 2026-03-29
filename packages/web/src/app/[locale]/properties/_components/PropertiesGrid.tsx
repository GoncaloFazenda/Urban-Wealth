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

  const { data, isLoading, isError, refetch } = useQuery<PropertiesResponse>({
    queryKey: ['properties', status, location, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (location) params.set('location', location);
      if (sort) params.set('sort', sort);
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
    router.push(`/properties?${params.toString()}`, { scroll: false });
  };

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
          <p className="mt-10 pt-6 border-t border-border text-center text-[13px] font-medium text-muted">
            {tProps('showing', { count: data.properties.length, total: data.total })}
          </p>
        </>
      )}
    </div>
  );
}
