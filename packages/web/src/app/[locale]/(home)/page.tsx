import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { mapDbProperty } from '@/lib/mapProperty';
import { HeroSection } from './_components/HeroSection';
import { StatsSection } from './_components/StatsSection';
import { PropertiesSection } from './_components/PropertiesSection';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Server-side fetch for initial property data (default filters, 6 items)
  const [dbProperties, total, locationRows] = await Promise.all([
    prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.property.count(),
    prisma.property.findMany({
      select: { location: true },
      distinct: ['location'],
      orderBy: { location: 'asc' },
    }),
  ]);

  const initialData = {
    properties: dbProperties.map(mapDbProperty),
    total,
    locations: locationRows.map((r) => r.location),
  };

  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <Suspense
        fallback={
          <div className="h-96 w-full flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
        }
      >
        <PropertiesSection initialData={initialData} />
      </Suspense>
    </div>
  );
}
