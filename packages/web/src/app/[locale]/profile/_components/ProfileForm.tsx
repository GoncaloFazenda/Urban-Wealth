'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import { FormField } from '@/components/ui/FormField';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useTranslations } from 'next-intl';

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Profile');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccess(false);
    try {
      const res = await fetchWithAuth('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to update profile');
      }

      const body = await res.json();
      updateUser({ fullName: body.user.fullName, email: body.user.email });
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="font-display text-[18px] font-bold text-foreground tracking-tight">
        {t('personalInfo')}
      </h2>

      {serverError && (
        <div className="rounded-md bg-destructive-400/10 border border-destructive-400/20 px-4 py-3 text-[13px] font-medium text-destructive-400">
          {serverError}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-positive-400/10 border border-positive-400/20 px-4 py-3 text-[13px] font-medium text-positive-400">
          {t('profileUpdated')}
        </div>
      )}

      <FormField label={t('fullNameLabel')} error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          {...register('fullName')}
          className="input-field"
        />
      </FormField>

      <FormField label={t('emailLabel')} error={errors.email?.message}>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="input-field"
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="rounded-md bg-primary-500 px-5 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {isSubmitting ? t('saving') : t('saveChanges')}
      </button>
    </form>
  );
}
