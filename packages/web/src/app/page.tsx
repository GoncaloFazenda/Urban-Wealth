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

  const status = (searchParams.get('status') ?? 'all') as
    | PropertyStatus
    | 'all';
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

  const updateParams = (
    key: string,
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'newest') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="gradient-text">Invest in Real Estate</span>
          <br />
          <span className="text-white/90">Starting from €50</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
          Own fractions of premium European properties. Earn rental yield
          and benefit from property appreciation — all without the
          complexity of traditional real estate.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 animate-slide-up">
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

      {/* Content with all 4 states */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          message="No properties match your current filters. Try adjusting your search criteria."
          action={{ label: 'Clear Filters', href: '/' }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {data.properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Results count */}
      {data && data.properties.length > 0 && (
        <p className="mt-6 text-center text-sm text-white/30">
          Showing {data.properties.length} of {data.total} properties
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
