'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@urban-wealth/core';
import { useState } from 'react';
import { FormField } from '@/components/ui/FormField';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useTranslations } from 'next-intl';

export function PasswordForm() {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Profile');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to change password');
      }

      setSuccess(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="font-display text-[18px] font-bold text-foreground tracking-tight">
        {t('changePassword')}
      </h2>

      {serverError && (
        <div className="rounded-md bg-destructive-400/10 border border-destructive-400/20 px-4 py-3 text-[13px] font-medium text-destructive-400">
          {serverError}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-positive-400/10 border border-positive-400/20 px-4 py-3 text-[13px] font-medium text-positive-400">
          {t('passwordUpdated')}
        </div>
      )}

      <FormField label={t('currentPasswordLabel')} error={errors.currentPassword?.message}>
        <PasswordInput
          id="currentPassword"
          {...register('currentPassword')}
          placeholder="••••••••"
        />
      </FormField>

      <FormField label={t('newPasswordLabel')} error={errors.newPassword?.message}>
        <PasswordInput
          id="newPassword"
          {...register('newPassword')}
          placeholder="••••••••"
        />
      </FormField>

      <FormField label={t('confirmNewPasswordLabel')} error={errors.confirmNewPassword?.message}>
        <PasswordInput
          id="confirmNewPassword"
          {...register('confirmNewPassword')}
          placeholder="••••••••"
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary-500 px-5 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {isSubmitting ? t('updating') : t('updatePassword')}
      </button>
    </form>
  );
}
