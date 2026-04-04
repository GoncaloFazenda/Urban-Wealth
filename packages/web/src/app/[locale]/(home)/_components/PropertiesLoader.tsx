import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { mapDbProperty } from '@/lib/mapProperty';
import { PropertiesSection } from './PropertiesSection';

// This component is used in a Suspense boundary on the home page to load the latest properties and stats without blocking the initial render of the hero section.
// By using noStore(), we ensure that this component is always rendered on the server and never cached, so it will always fetch the latest data on each request.

export async function PropertiesLoader() {
  noStore();

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

  return <PropertiesSection initialData={initialData} />;
}
