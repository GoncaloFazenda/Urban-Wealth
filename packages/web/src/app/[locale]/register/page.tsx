'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { FormField } from '@/components/ui/FormField';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useTranslations } from 'next-intl';
import { getSafeRedirect } from '@/lib/constants';

function RegisterPageContent() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Register');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await authRegister(data.fullName, data.email, data.password, data.confirmPassword);
      router.push(getSafeRedirect(searchParams.get('redirect')));
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirements = [
    { met: password.length >= 8, label: t('req8chars') },
    { met: /[A-Z]/.test(password), label: t('reqUppercase') },
    { met: /[0-9]/.test(password), label: t('reqNumber') },
    { met: /[^a-zA-Z0-9]/.test(password), label: t('reqSymbol') },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-12 bg-muted-bg">
      <div
        className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-card animate-enter"
      >
        <div className="mb-8 text-center">
          <h1 className="font-display text-[26px] font-bold text-foreground tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-[14px] text-muted">
            {t('subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-md bg-destructive-400/10 border border-destructive-400/20 px-4 py-3 text-[13px] font-medium text-destructive-400">
              {serverError}
            </div>
          )}

          <FormField label={t('fullNameLabel')} error={errors.fullName?.message}>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="input-field"
              placeholder={t('fullNamePlaceholder')}
            />
          </FormField>

          <FormField label={t('emailLabel')} error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input-field"
              placeholder={t('emailPlaceholder')}
            />
          </FormField>

          <div>
            <FormField label={t('passwordLabel')} error={errors.password?.message}>
              <PasswordInput
                id="password"
                {...register('password')}
                placeholder={t('passwordPlaceholder')}
              />
            </FormField>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {requirements.map((req) => (
                <span
                  key={req.label}
                  className={`text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                    req.met ? 'text-positive-400' : 'text-muted'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${req.met ? 'bg-positive-400' : 'bg-border'}`} />
                  {req.label}
                </span>
              ))}
            </div>
          </div>

          <FormField label={t('confirmPasswordLabel')} error={errors.confirmPassword?.message}>
            <PasswordInput
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder={t('confirmPasswordPlaceholder')}
            />
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary-500 px-4 py-3 text-[14px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] font-medium text-muted border-t border-border pt-6">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-primary-500 hover:text-primary-400 transition-colors font-bold">
            {t('logInHere')}
          </Link>
        </p>
      </div>
    </div>
  );
}


export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted-bg" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
