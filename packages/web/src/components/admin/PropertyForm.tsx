'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPropertySchema, type CreatePropertyInput } from '@urban-wealth/core';
import { useState } from 'react';
import { FormField } from '@/components/ui/FormField';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface PropertyFormProps {
  initialData?: CreatePropertyInput & { id?: string };
  mode: 'create' | 'edit';
}

export function PropertyForm({ initialData, mode }: PropertyFormProps) {
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations('Admin');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: initialData ?? {
      title: '',
      location: '',
      photoUrls: [],
      totalValue: 0,
      funded: 0,
      annualYield: 0,
      projectedAppreciation: 0,
      status: 'open',
      description: '',
      availableShares: 0,
      platformFee: 0.015,
    },
  });

  const onSubmit = async (data: CreatePropertyInput) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const url = mode === 'edit' && initialData?.id
        ? `/api/admin/properties/${initialData.id}`
        : '/api/admin/properties';

      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          photoUrls: typeof data.photoUrls === 'string'
            ? (data.photoUrls as unknown as string).split('\n').filter(Boolean)
            : data.photoUrls,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Operation failed');
      }

      router.push('/admin/properties');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      {serverError && (
        <div className="rounded-md bg-destructive-400/10 border border-destructive-400/20 px-4 py-3 text-[13px] font-medium text-destructive-400">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t('fieldTitle')} error={errors.title?.message}>
          <input type="text" {...register('title')} className="input-field" />
        </FormField>

        <FormField label={t('fieldLocation')} error={errors.location?.message}>
          <input type="text" {...register('location')} className="input-field" />
        </FormField>
      </div>

      <FormField label={t('fieldDescription')} error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field resize-none"
        />
      </FormField>

      <FormField label={t('fieldPhotoUrls')} error={errors.photoUrls?.message}>
        <textarea
          {...register('photoUrls')}
          rows={3}
          className="input-field resize-none font-mono text-[12px]"
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
        />
        <p className="mt-1 text-[11px] text-muted">{t('photoUrlsHint')}</p>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label={t('fieldTotalValue')} error={errors.totalValue?.message}>
          <input
            type="number"
            step="0.01"
            {...register('totalValue', { valueAsNumber: true })}
            className="input-field"
          />
        </FormField>

        <FormField label={t('fieldAnnualYield')} error={errors.annualYield?.message}>
          <input
            type="number"
            step="0.1"
            {...register('annualYield', { valueAsNumber: true })}
            className="input-field"
          />
        </FormField>

        <FormField label={t('fieldAppreciation')} error={errors.projectedAppreciation?.message}>
          <input
            type="number"
            step="0.1"
            {...register('projectedAppreciation', { valueAsNumber: true })}
            className="input-field"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label={t('fieldStatus')} error={errors.status?.message}>
          <select {...register('status')} className="input-field">
            <option value="open">{t('statusOpen')}</option>
            <option value="coming_soon">{t('statusComingSoon')}</option>
            <option value="funded">{t('statusFunded')}</option>
          </select>
        </FormField>

        <FormField label={t('fieldShares')} error={errors.availableShares?.message}>
          <input
            type="number"
            {...register('availableShares', { valueAsNumber: true })}
            className="input-field"
          />
        </FormField>

        <FormField label={t('fieldFunded')} error={errors.funded?.message}>
          <input
            type="number"
            step="0.1"
            {...register('funded', { valueAsNumber: true })}
            className="input-field"
          />
        </FormField>
      </div>

      <FormField label={t('fieldPlatformFee')} error={errors.platformFee?.message}>
        <input
          type="number"
          step="0.001"
          {...register('platformFee', { valueAsNumber: true })}
          className="input-field w-40"
        />
        <p className="mt-1 text-[11px] text-muted">{t('platformFeeHint')}</p>
      </FormField>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-500 px-6 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting
            ? t('saving')
            : mode === 'edit'
              ? t('updateProperty')
              : t('createProperty')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/properties')}
          className="rounded-md px-5 py-2.5 text-[14px] font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
