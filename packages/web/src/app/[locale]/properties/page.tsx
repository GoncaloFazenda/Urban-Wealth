import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { mapDbProperty } from '@/lib/mapProperty';
import { PropertiesGrid } from './_components/PropertiesGrid';

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Server-side fetch for page 1 with default filters
  const [dbProperties, total, locationRows] = await Promise.all([
    prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 9,
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
    page: 1,
    limit: 9,
    totalPages: Math.ceil(total / 9),
    locations: locationRows.map((r) => r.location),
  };

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PropertiesGrid initialData={initialData} />
    </Suspense>
  );
}
