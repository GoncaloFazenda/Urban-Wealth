'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { PropertyForm } from '@/components/admin/PropertyForm';
import { ErrorState } from '@/components/states/ErrorState';
import { DashboardSkeleton } from '@/components/states/LoadingSkeleton';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import type { CreatePropertyInput } from '@urban-wealth/core';

export default function EditPropertyPage() {
  const t = useTranslations('Admin');
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery<{
    property: CreatePropertyInput & { id: string; createdAt: string };
  }>({
    queryKey: ['admin-property', params.id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/admin/properties/${params.id}`);
      if (!res.ok) throw new Error('Failed to load property');
      return res.json();
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState title={t('errorLoading')} onRetry={() => refetch()} />;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 animate-enter-sm">
        <h1 className="font-display text-[28px] font-bold text-foreground tracking-tight">
          {t('editPropertyTitle')}
        </h1>
        <p className="mt-1 text-[14px] text-muted">{data?.property.title}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
        {data?.property && (
          <PropertyForm
            mode="edit"
            initialData={{
              ...data.property,
              photoUrls: data.property.photoUrls as unknown as string[],
            }}
          />
        )}
      </div>
    </div>
  );
}
