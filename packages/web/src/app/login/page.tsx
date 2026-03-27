'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

function LoginPageContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-[380px] animate-fade-in">
        <div className="mb-6">
          <h1 className="font-display text-[22px] font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] text-surface-400">
            Log in to manage your investments
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive-400/[0.08] border border-destructive-400/[0.15] px-3 py-2.5 text-[13px] text-destructive-400">
              {serverError}
            </div>
          )}

          <Field label="Email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input-field"
              placeholder="you@company.com"
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="input-field"
              placeholder="••••••••"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-surface-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-surface-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] text-destructive-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
