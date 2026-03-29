'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { FormField } from '@/components/ui/FormField';
import { useTranslations } from 'next-intl';

function LoginPageContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Login');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await login(data.email, data.password);
      router.push(searchParams.get('redirect') ?? '/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-12 bg-muted-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-card"
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

          <FormField label={t('emailLabel')} error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input-field"
              placeholder={t('emailPlaceholder')}
            />
          </FormField>

          <FormField label={t('passwordLabel')} error={errors.password?.message}>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="input-field"
              placeholder={t('passwordPlaceholder')}
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
          {t('noAccount')}{' '}
          <Link href="/register" className="text-primary-500 hover:text-primary-400 transition-colors font-bold">
            {t('createAccount')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted-bg" />}>
      <LoginPageContent />
    </Suspense>
  );
}
