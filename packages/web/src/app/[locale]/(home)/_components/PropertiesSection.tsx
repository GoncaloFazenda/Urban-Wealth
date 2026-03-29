'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { Property, PropertyStatus, PropertySortField } from '@urban-wealth/core';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { Link } from '@/i18n/navigation';
import { PropertyCardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { StatsSection } from './StatsSection';

interface PropertiesResponse {
  properties: Property[];
  total: number;
  locations: string[];
}

export function PropertiesSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('Properties');

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
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />

      <div id="properties" className="mx-auto max-w-6xl px-5 sm:px-6 py-16 scroll-mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="font-display text-[28px] sm:text-[32px] font-bold text-foreground tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-1.5 text-[15px] text-muted max-w-xl">
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
            title={t('errorTitle')}
            message={t('errorMessage')}
            onRetry={() => refetch()}
          />
        ) : !data?.properties.length ? (
          <EmptyState
            title={t('emptyTitle')}
            message={t('emptyMessage')}
            action={{ label: t('clearFilters'), href: '/' }}
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
            <div className="mt-10 pt-6 border-t border-border text-center">
              <p className="text-[13px] font-medium text-muted mb-4">
                {t('showing', { count: data.properties.length, total: data.total })}
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-[13px] font-semibold text-foreground transition-all hover:bg-surface-hover hover:border-primary-500/30"
              >
                {t('viewAll')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
