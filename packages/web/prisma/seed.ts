import { PrismaClient, PropertyStatus } from '@prisma/client';
import { mockProperties } from '@urban-wealth/core';

const prisma = new PrismaClient();

const statusMap: Record<string, PropertyStatus> = {
  open: 'OPEN',
  coming_soon: 'COMING_SOON',
  funded: 'FUNDED',
};

async function main() {
  console.log('Seeding properties...');

  for (const p of mockProperties) {
    await prisma.property.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        title: p.title,
        location: p.location,
        photoUrls: p.photoUrls,
        totalValue: p.totalValue,
        funded: p.funded,
        annualYield: p.annualYield,
        projectedAppreciation: p.projectedAppreciation,
        status: statusMap[p.status] ?? 'OPEN',
        description: p.description,
        availableShares: p.availableShares,
        platformFee: p.platformFee,
        createdAt: new Date(p.createdAt),
      },
      update: {
        title: p.title,
        location: p.location,
        photoUrls: p.photoUrls,
        totalValue: p.totalValue,
        annualYield: p.annualYield,
        projectedAppreciation: p.projectedAppreciation,
        status: statusMap[p.status] ?? 'OPEN',
        description: p.description,
        availableShares: p.availableShares,
        platformFee: p.platformFee,
      },
    });
  }

  console.log(`Seeded ${mockProperties.length} properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
