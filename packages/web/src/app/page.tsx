'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import type { Property, PropertyStatus, PropertySortField } from '@urban-wealth/core';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyCardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';

interface PropertiesResponse {
  properties: Property[];
  total: number;
  locations: string[];
}

function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-white tracking-tight">
          Investment Properties
        </h1>
        <p className="mt-1.5 text-[14px] text-surface-400 max-w-xl">
          Browse curated European real estate opportunities. Invest from €50 and earn rental yield plus property appreciation.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load properties"
          message="We couldn't retrieve the property listings. Please try again."
          onRetry={() => refetch()}
        />
      ) : !data?.properties.length ? (
        <EmptyState
          title="No properties found"
          message="No properties match your current filters. Try adjusting your search."
          action={{ label: 'Clear filters', href: '/' }}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {data.properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <p className="mt-5 text-center text-[12px] text-surface-600">
            {data.properties.length} of {data.total} properties
          </p>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <PropertiesPageContent />
    </Suspense>
  );
}
