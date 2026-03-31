import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { mapDbProperty } from '@/lib/mapProperty';
import { PropertyDetailClient } from './_components/PropertyDetailClient';

const getProperty = cache(async (id: string) => {
  const dbProperty = await prisma.property.findUnique({
    where: { id },
  });
  if (!dbProperty) return null;
  return mapDbProperty(dbProperty);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  return {
    title: `${property.title} — Urban Wealth`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.photoUrls.slice(0, 1),
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient initialData={property} />;
}
