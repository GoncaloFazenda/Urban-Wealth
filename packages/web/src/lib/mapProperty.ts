import type { Property as DbProperty } from '@prisma/client';
import type { Property } from '@urban-wealth/core';

const coreStatusMap: Record<string, string> = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  FUNDED: 'funded',
};

export function mapDbProperty(p: DbProperty): Property {
  return {
    id: p.id,
    title: p.title,
    location: p.location,
    photoUrls: p.photoUrls,
    totalValue: p.totalValue,
    funded: p.funded,
    annualYield: p.annualYield,
    projectedAppreciation: p.projectedAppreciation,
    status: (coreStatusMap[p.status] ?? 'open') as Property['status'],
    description: p.description,
    availableShares: p.availableShares,
    createdAt: p.createdAt.toISOString(),
    platformFee: p.platformFee,
  };
}
