'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useRef } from 'react';
import type { Property, PropertyStatus, PropertySortField } from '@urban-wealth/core';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyCardSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

interface PropertiesResponse {
  properties: Property[];
  total: number;
  locations: string[];
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={ref} className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10" />
        <img 
          src="/heros/hero-luxury.png" 
          alt="Premium Real Estate" 
          className="w-full h-full object-cover object-center scale-105"
        />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-20 mx-auto max-w-6xl px-5 sm:px-6 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-block mb-6 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <span className="text-[12px] font-semibold text-white tracking-wider uppercase">
              Exclusive European Real Estate
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
            Invest in Legacy.<br/> Build Your Wealth.
          </h1>
          <p className="mx-auto mt-4 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed font-light mb-10 drop-shadow-md">
            Access strictly curated, high-yield fractional real estate investments across Europe's prime markets. Starting from €50.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="#properties"
              className="w-full sm:w-auto rounded-md bg-white px-8 py-3.5 text-[15px] font-semibold text-black transition-transform hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2"
            >
              Explore Portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="border-y border-border bg-muted-bg py-8">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <TrendingUp className="w-5 h-5 text-primary-500 mb-2" />
            <h3 className="font-display text-2xl font-bold text-foreground">6.8%</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Avg. Yield</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <Users className="w-5 h-5 text-primary-500 mb-2" />
            <h3 className="font-display text-2xl font-bold text-foreground">12.5k</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Investors</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <h3 className="font-display text-2xl font-bold text-foreground">€52M</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Funded</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <ShieldCheck className="w-5 h-5 text-primary-500 mb-2" />
            <h3 className="font-display text-lg font-bold text-foreground mt-1">Regulated</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
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
            Curated Portfolio
          </h2>
          <p className="mt-1.5 text-[15px] text-muted max-w-xl">
            Browse strictly vetted European residential real estate. Filter by market, yield strategy, and funding status.
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
              Showing {data.properties.length} of {data.total} investment opportunities
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PropertiesPageContent />
    </Suspense>
  );
}
