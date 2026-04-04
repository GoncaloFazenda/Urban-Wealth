import { PrismaClient, PropertyStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const statusMap: Record<string, PropertyStatus> = {
  open: 'OPEN',
  coming_soon: 'COMING_SOON',
  funded: 'FUNDED',
};

async function main() {
  // Dynamic import to avoid ESM/CJS named-export interop issue with tsx + Node 24
  const { mockProperties } = await import('../../core/src/mockData.js');

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

  // Seed admin test user for E2E tests
  const adminEmail = 'admin@urbanwealth.test';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await hash('AdminPass1!', 12);
    await prisma.user.create({
      data: {
        fullName: 'Test Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('Seeded admin test user: admin@urbanwealth.test');
  } else if (existing.role !== 'ADMIN') {
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
    console.log('Promoted existing admin test user to ADMIN');
  } else {
    console.log('Admin test user already exists — reusing');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
