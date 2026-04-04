import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { mapDbProperty } from '@/lib/mapProperty';
import { PropertiesGrid } from './PropertiesGrid';

export async function PropertiesGridLoader() {
  noStore();

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

  return <PropertiesGrid initialData={initialData} />;
}
